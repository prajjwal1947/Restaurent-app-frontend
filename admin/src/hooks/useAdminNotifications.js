import { useCallback, useEffect, useRef, useState } from "react";
import { adminApi } from "../services/api";

const POLL_MS = 10_000;
const TOAST_MS = 8_000;
const MAX_TOASTS = 4;
const READ_KEY = "admin-read-notifications";
let audioContext;

function getAudioContext() {
  const Context = window.AudioContext || window.webkitAudioContext;
  if (!Context) return null;
  audioContext ??= new Context();
  return audioContext;
}

export function unlockAudio() {
  const context = getAudioContext();
  if (context?.state === "suspended") context.resume().catch(() => {});
}

// Browsers keep audio suspended until the page has had a user gesture.
export function playOrderChime() {
  const context = getAudioContext();
  if (!context || context.state !== "running") return false;
  const start = context.currentTime;
  [0, 0.5].forEach((repeat) => {
    [880, 1318.5].forEach((frequency, note) => {
      const at = start + repeat + note * 0.16;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.35, at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.42);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(at);
      oscillator.stop(at + 0.45);
    });
  });
  return true;
}

function loadReadKeys() {
  try {
    return new Set(JSON.parse(localStorage.getItem(READ_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

function orderNotification(order) {
  const table = order.tableNumber ?? order.table?.number ?? "-";
  return {
    key: `order:${order.id}`,
    kind: "order",
    id: order.id,
    title: `New order #${order.orderNumber}`,
    detail: `Table ${table} · ₹${Math.round((order.totalMinor || 0) / 100)}`,
    at: order.placedAt || order.createdAt,
  };
}

function requestNotification(request) {
  const bill = request.type === "BILL";
  return {
    key: `request:${request.id}`,
    kind: bill ? "bill" : "waiter",
    id: request.id,
    title: bill ? "Bill requested" : "Waiter called",
    detail: `Table ${request.tableNumber}`,
    at: request.createdAt,
  };
}

export function useAdminNotifications(soundEnabled) {
  const [orders, setOrders] = useState([]);
  const [requests, setRequests] = useState([]);
  const [readKeys, setReadKeys] = useState(loadReadKeys);
  const [alerts, setAlerts] = useState([]);
  const soundRef = useRef(soundEnabled);
  const refreshRef = useRef(() => {});

  useEffect(() => {
    soundRef.current = soundEnabled;
  }, [soundEnabled]);

  const dismiss = useCallback((key) => {
    setAlerts((current) => current.filter((alert) => alert.id !== key));
  }, []);

  useEffect(() => {
    let active = true;
    let inFlight = false;
    const timers = new Set();
    // A null set means that source has not loaded yet, so its first batch is not announced.
    const seen = { orders: null, requests: null };

    const unseen = (source, items) => {
      const first = seen[source] === null;
      seen[source] ??= new Set();
      const fresh = items.filter((item) => !seen[source].has(item.key));
      items.forEach((item) => seen[source].add(item.key));
      return first ? [] : fresh;
    };

    const announce = (fresh) => {
      const wantsSound = soundRef.current;
      const played = wantsSound && playOrderChime();
      const created = fresh.map((item) => ({
        id: item.key,
        kind: item.kind,
        title: item.title,
        detail: item.detail,
        audioBlocked: wantsSound && !played,
      }));
      setAlerts((current) => [...created, ...current].slice(0, MAX_TOASTS));
      created.forEach((alert) => {
        const timer = setTimeout(() => {
          timers.delete(timer);
          dismiss(alert.id);
        }, TOAST_MS);
        timers.add(timer);
      });
    };

    async function check() {
      if (inFlight) return;
      inFlight = true;
      try {
        const [orderResult, requestResult] = await Promise.allSettled([
          adminApi.pollOrders(),
          adminApi.pollServiceRequests(),
        ]);
        if (!active) return;
        const fresh = [];
        if (orderResult.status === "fulfilled") {
          const pending = (orderResult.value || [])
            .filter((order) => order.status === "PENDING")
            .map(orderNotification);
          setOrders(pending);
          fresh.push(...unseen("orders", pending));
        }
        if (requestResult.status === "fulfilled") {
          const open = (requestResult.value || []).map(requestNotification);
          setRequests(open);
          fresh.push(...unseen("requests", open));
        }
        if (fresh.length > 0) announce(fresh);
      } finally {
        inFlight = false;
      }
    }

    refreshRef.current = check;
    check();
    const interval = setInterval(check, POLL_MS);
    window.addEventListener("focus", check);
    window.addEventListener("pointerdown", unlockAudio, { once: true });
    window.addEventListener("keydown", unlockAudio, { once: true });
    return () => {
      active = false;
      clearInterval(interval);
      timers.forEach(clearTimeout);
      window.removeEventListener("focus", check);
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
  }, [dismiss]);

  const items = [...orders, ...requests].sort((a, b) => new Date(b.at) - new Date(a.at));
  const unreadCount = items.filter((item) => !readKeys.has(item.key)).length;

  const markAllRead = useCallback(() => {
    const keys = new Set([...orders, ...requests].map((item) => item.key));
    localStorage.setItem(READ_KEY, JSON.stringify([...keys]));
    setReadKeys(keys);
  }, [orders, requests]);

  const resolveRequest = useCallback(async (id) => {
    setRequests((current) => current.filter((request) => request.id !== id));
    dismiss(`request:${id}`);
    try {
      await adminApi.resolveServiceRequest(id);
    } catch {
      refreshRef.current();
    }
  }, [dismiss]);

  return { alerts, dismiss, items, unreadCount, markAllRead, resolveRequest };
}

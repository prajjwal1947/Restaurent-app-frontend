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
// Each note is [frequencyHz, startSeconds, durationSeconds].
const SOUNDS = {
  order: {
    wave: "sine",
    notes: [[880, 0, 0.42], [1318.5, 0.16, 0.42], [880, 0.5, 0.42], [1318.5, 0.66, 0.42]],
  },
  bill: {
    wave: "triangle",
    notes: [[659.25, 0, 0.2], [783.99, 0.09, 0.2], [1046.5, 0.18, 0.2], [1318.5, 0.3, 0.6]],
  },
  waiter: {
    wave: "sine",
    notes: [[987.77, 0, 0.7], [739.99, 0.38, 0.9], [987.77, 1.0, 0.7], [739.99, 1.38, 0.9]],
  },
};
const SOUND_PRIORITY = ["waiter", "bill", "order"];

export function playChimes(kinds) {
  const context = getAudioContext();
  if (!context || context.state !== "running") return false;
  let start = context.currentTime;
  for (const kind of SOUND_PRIORITY.filter((candidate) => kinds.includes(candidate))) {
    const { wave, notes } = SOUNDS[kind];
    for (const [frequency, offset, duration] of notes) {
      const at = start + offset;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = wave;
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.35, at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(at);
      oscillator.stop(at + duration + 0.03);
    }
    start += Math.max(...notes.map(([, offset, duration]) => offset + duration)) + 0.25;
  }
  return true;
}

export const playOrderChime = () => playChimes(["order"]);

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
      const played = wantsSound && playChimes([...new Set(fresh.map((item) => item.kind))]);
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

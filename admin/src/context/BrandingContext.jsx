import { useCallback, useEffect, useMemo, useState } from "react";
import { adminApi } from "../services/api";
import { BrandingContext } from "./BrandingStore";

const DEFAULT_BRANDING = {
  logoUrl: "",
  gradientStart: "#e86a33",
  gradientEnd: "#f7c59f",
};

function safeColor(value, fallback) {
  return /^#[\da-fA-F]{6}$/.test(value || "") ? value : fallback;
}

function luminance(hex) {
  const channels = hex.slice(1).match(/.{2}/g).map((channel) => parseInt(channel, 16) / 255);
  const linear = channels.map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function applyBranding(restaurant) {
  const branding = restaurant?.branding || {};
  const start = safeColor(branding.gradientStart, DEFAULT_BRANDING.gradientStart);
  const end = safeColor(branding.gradientEnd, DEFAULT_BRANDING.gradientEnd);
  const textContrast = (color) => (1.05 / (luminance(color) + 0.05));
  const darkContrast = (color) => ((luminance(color) + 0.05) / 0.05);
  const foreground = Math.min(textContrast(start), textContrast(end)) >= Math.min(darkContrast(start), darkContrast(end)) ? "#ffffff" : "#241d19";
  const root = document.documentElement;
  root.style.setProperty("--brand-start", start);
  root.style.setProperty("--brand-end", end);
  root.style.setProperty("--brand-gradient", `linear-gradient(125deg, ${start}, ${end})`);
  root.style.setProperty("--brand-foreground", foreground);
}

export function RestaurantBrandingProvider({ children }) {
  const [restaurant, setRestaurant] = useState(null);

  const refreshRestaurant = useCallback(async () => {
    const result = await adminApi.restaurant();
    setRestaurant(result);
    applyBranding(result);
    return result;
  }, []);

  useEffect(() => {
    let active = true;
    adminApi.restaurant().then((result) => {
      if (!active) return;
      setRestaurant(result);
      applyBranding(result);
    }).catch(() => {});
    const onBrandingChange = (event) => {
      if (!event.detail) return;
      setRestaurant(event.detail);
      applyBranding(event.detail);
    };
    window.addEventListener("restaurant-branding-updated", onBrandingChange);
    return () => {
      active = false;
      window.removeEventListener("restaurant-branding-updated", onBrandingChange);
    };
  }, []);

  const value = useMemo(() => ({ restaurant, refreshRestaurant }), [restaurant, refreshRestaurant]);
  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
}

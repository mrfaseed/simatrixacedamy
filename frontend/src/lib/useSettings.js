import { useEffect, useState } from "react";
import { api } from "../api/client";

// Module-level cache so multiple components share one /api/site request.
let cache = null;

export function loadSettings() {
  if (!cache) {
    cache = api
      .getSite()
      .then((r) => r.data.settings || {})
      .catch(() => ({}));
  }
  return cache;
}

export function useSettings() {
  const [settings, setSettings] = useState(null);
  useEffect(() => {
    let alive = true;
    loadSettings().then((s) => alive && setSettings(s));
    return () => {
      alive = false;
    };
  }, []);
  return settings || {};
}

"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

export const sessionTypes = ["Clubs", "Online", "Tournaments"] as const;
export type CalendarType = typeof sessionTypes[number];
type Selection = { club?: string; day?: string; days?: string[] };
type Preferences = { last_type: CalendarType; filters: Partial<Record<CalendarType, Selection>> };
const defaults: Preferences = { last_type: "Clubs", filters: {} };

export function useCalendarPreferences(userId: string | null, member: unknown, calendarView: string) {
  const [preferences, setPreferences] = useState(defaults);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const writes = useRef(Promise.resolve());
  const identity = useRef(userId);
  identity.current = userId;
  useEffect(() => {
    let active = true;
    setPreferences(defaults);
    setError("");
    setLoading(!!userId && !!calendarView);
    if (!userId || !calendarView) return;
    async function restore() {
      await writes.current;
      if (!active) return;
      const result = await supabase.from("session_filter_preferences")
        .select("last_type,filters").eq("user_id", userId).maybeSingle();
      if (!active) return;
      if (result.error) setError("Saved calendar filters could not be loaded.");
      else if (result.data) setPreferences(result.data as Preferences);
      setLoading(false);
    }
    void restore();
    return () => { active = false; };
  }, [userId, member, calendarView]);

  function change(type: CalendarType, patch: Selection = {}) {
    setPreferences(prev => ({ last_type: type, filters: {
      ...prev.filters, [type]: { ...prev.filters[type], ...patch },
    } }));
    if (!userId) return;
    writes.current = writes.current.then(async () => {
      if (identity.current !== userId) return;
      const result = await supabase.rpc("save_session_filter", {
        p_user: userId, p_type: type, p_patch: patch,
      });
      if (identity.current === userId) setError(result.error ? "This filter change could not be saved." : "");
    }).catch(() => { if (identity.current === userId) setError("This filter change could not be saved."); });
  }
  return { preferences, change, loading, error };
}

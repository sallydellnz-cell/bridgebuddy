"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useFavourites(userId: string | null, ownerId: number) {
  const identity = userId && ownerId ? userId + "/" + ownerId : "";
  const [loaded, setLoaded] = useState("");
  const [ids, setIds] = useState<Set<number>>(new Set());
  const [filterOwner, setFilterOwner] = useState("");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const generation = useRef(0);
  const pending = useRef(new Set<number>());

  useEffect(() => {
    const controller = new AbortController();
    pending.current = new Set();
    setLoaded("");
    setError("");
    if (!identity) return;
    async function load() {
      const items = new Set<number>();
      let after = 0;
      while (!controller.signal.aborted) {
        const { data, error } = await supabase.from("player_favourites")
          .select("player_id").eq("owner_id", ownerId).gt("player_id", after)
          .order("player_id").limit(500).abortSignal(controller.signal);
        if (controller.signal.aborted) return;
        if (error) {
          setError("Your favourites could not be loaded.");
          return;
        }
        for (const row of data) items.add(Number(row.player_id));
        if (data.length < 500) break;
        after = Number(data[data.length - 1].player_id);
      }
      setIds(items);
      setLoaded(identity);
    }
    void load();
    return () => { controller.abort(); generation.current++; };
  }, [identity, ownerId, attempt]);

  async function toggle(id: number) {
    if (!identity || loaded !== identity || id === ownerId || pending.current.has(id)) return;
    const version = generation.current;
    const remove = ids.has(id);
    const row = { owner_id: ownerId, player_id: id };
    pending.current.add(id);
    setError("");
    setIds(previous => {
      const next = new Set(previous);
      if (remove) next.delete(id); else next.add(id);
      return next;
    });
    const { error } = remove
      ? await supabase.from("player_favourites").delete().match(row)
      : await supabase.from("player_favourites").insert(row);
    if (version !== generation.current) return;
    pending.current.delete(id);
    if (error && !(!remove && error.code === "23505")) {
      setIds(previous => {
        const next = new Set(previous);
        if (remove) next.add(id); else next.delete(id);
        return next;
      });
      setError("Your favourite could not be saved. Try again.");
    } else {
      // Re-render after enabling the button again.
      setIds(previous => new Set(previous));
    }
  }

  const ready = !!identity && identity === loaded;
  return { available: !!identity, ready, has: (id: number) => ready && ids.has(id),
    busy: (id: number) => pending.current.has(id), toggle, error,
    retry: () => setAttempt(value => value + 1),
    onlyFavourites: !!identity && filterOwner === identity,
    filter: (only: boolean) => setFilterOwner(only ? identity : "") };
}

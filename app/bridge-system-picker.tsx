"use client";

import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

export type BridgeSystem = { system_id: number; system_name: string; is_custom?: boolean };

export function BridgeSystemPicker({ systems, selected, onChange, onAdded }: {
  systems: BridgeSystem[];
  selected: BridgeSystem[];
  onChange: (systems: BridgeSystem[]) => void;
  onAdded: (system: BridgeSystem) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isSelected = (system: BridgeSystem) => selected.some(s => s.system_id === system.system_id);
  function open() {
    setName("");
    setError("");
    dialog.current?.showModal();
  }
  async function add() {
    const input = name.trim().replace(/\s+/g, " ");
    if (!input || input.toLowerCase() === "other") {
      setError("Enter the name of your bridge system.");
      return;
    }
    setBusy(true);
    try {
      let system = systems.find(s => s.system_name.toLowerCase() === input.toLowerCase());
      if (!system) {
        const { data, error } = await supabase.rpc("add_custom_bridge_system", { p_name: input }).single<BridgeSystem>();
        if (error) throw new Error(error.code === "42501" ? "Sign in with Google or your password to add a new system." : error.message);
        if (!data) throw new Error("The system could not be saved.");
        system = data;
        onAdded(system);
      }
      const remaining = selected.filter(s => s.system_name.toLowerCase() !== "other" && s.system_id !== system.system_id);
      onChange([...remaining, system]);
      dialog.current?.close();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not add this system.");
    } finally {
      setBusy(false);
    }
  }
  return <>
    {systems.filter(s => !s.is_custom || isSelected(s)).map(system => {
      const other = system.system_name.toLowerCase() === "other";
      return <label key={system.system_id} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <input type="checkbox" checked={isSelected(system)} onChange={event => {
          if (event.target.checked && other) open();
          else onChange(event.target.checked ? [...selected, system] : selected.filter(s => s.system_id !== system.system_id));
        }} />
        {system.system_name}
        {other && isSelected(system) && <button type="button" onClick={open}>Specify system</button>}
      </label>;
    })}
    <dialog ref={dialog} aria-label="Other bridge system" className="other-system-dialog"
      onCancel={event => { if (busy) event.preventDefault(); }}>
      <label>Other bridge system
        <input autoFocus maxLength={80} value={name} placeholder="Enter system name" disabled={busy}
          onChange={event => setName(event.target.value)}
          onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); void add(); } }} />
      </label>
      {error && <p role="alert">{error}</p>}
      <div><button type="button" disabled={busy} onClick={() => dialog.current?.close()}>Cancel</button>
        <button type="button" disabled={busy || !name.trim()} onClick={add}>Add system</button></div>
    </dialog>
  </>;
}

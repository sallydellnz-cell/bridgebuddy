"use client";

import { useId, useRef } from "react";

export function CalendarDayFilter({ options, selected, disabled, onChange }: {
  options: string[]; selected: string[]; disabled: boolean; onChange: (days: string[]) => void;
}) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const label = selected.length ? selected.map(day => day.slice(0, 3)).join(", ") : "Any Day";
  return <>
    <button type="button" ref={trigger} className="calendar-day-trigger" popoverTarget={id}
      disabled={disabled} aria-label={`Day: ${label}`} title={label}>{label} ▾</button>
    <div id={id} popover="auto" className="calendar-day-menu" role="group" aria-label="Weekdays"
      onBeforeToggle={event => {
        if (event.newState !== "open" || !trigger.current) return;
        const bounds = trigger.current.getBoundingClientRect();
        const menu = event.currentTarget;
        menu.style.left = Math.max(4, Math.min(bounds.left, document.documentElement.clientWidth - 172)) + "px";
        const below = window.innerHeight - bounds.bottom;
        const above = below < 210 && bounds.top > below;
        menu.style.top = above ? "auto" : bounds.bottom + 2 + "px";
        menu.style.bottom = above ? window.innerHeight - bounds.top + 2 + "px" : "auto";
        menu.style.maxHeight = Math.max(44, (above ? bounds.top : below) - 8) + "px";
      }}>
      <label><input type="checkbox" checked={!selected.length} onChange={() => onChange([])} />Any Day</label>
      {options.map(day => <label key={day}><input type="checkbox" checked={selected.includes(day)}
        onChange={e => onChange(e.target.checked ? [...selected, day] : selected.filter(value => value !== day))} />{day}</label>)}
    </div>
  </>;
}

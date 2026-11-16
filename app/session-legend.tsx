import "./session-classification.css";
import { playingLevelLegend, SessionLegend, sessionLegendEntry } from "@/lib/session-legend";

function Swatch({ color }: { color: string }) {
  return <i aria-hidden="true" style={{ display: "inline-block", width: 12, height: 12, borderRadius: 3, background: color, border: "1px solid #64748b" }} />;
}

export function CalendarLegend({ clubName, legend }: { clubName: string; legend?: SessionLegend | null }) {
  return <div className="calendar-level-key" aria-label={`${clubName} — ${legend?.title || "Playing levels"}`}>
    {(legend?.entries || playingLevelLegend).map(entry => <span key={entry.label}><Swatch color={entry.color} />{entry.label}</span>)}
  </div>;
}

export function SessionLegendMarker({ legend, session }: { legend?: SessionLegend | null; session: { division?: string; session_name?: string; event_type?: string; suitable_levels?: string } }) {
  if (legend) {
    const entry = sessionLegendEntry(legend, session);
    return entry ? <span className="session-classification" title={entry.label}>
      <span>{entry.label}</span><Swatch color={entry.color} />
    </span> : null;
  }
  return <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }} aria-label={`Playing levels: ${session.suitable_levels || "Not specified"}`}>
    {playingLevelLegend.map(level => <div key={level.key} title={level.label} style={{ width: 22, height: 8, borderRadius: 3, background: session.suitable_levels?.toLowerCase().includes(level.key) ? level.color : "#e5e7eb" }} />)}
  </div>;
}

export type SessionLegendEntry = {
  label: string;
  color: string;
  match: { division?: string; session_name?: string; event_type?: string };
};
export type SessionLegend = { title: string; entries: SessionLegendEntry[] };

export const playingLevelLegend = [
  { key: "learner", label: "Learner", color: "#facc15" },
  { key: "beginner", label: "Beginner", color: "#86efac" },
  { key: "improver", label: "Improver", color: "#4ade80" },
  { key: "intermediate", label: "Intermediate", color: "#38bdf8" },
  { key: "advanced", label: "Advanced", color: "#4f46e5" },
  { key: "expert", label: "Expert", color: "#f97316" },
  { key: "open", label: "Open", color: "#dc2626" },
];

export function sessionLegendEntry(legend: SessionLegend, session: { division?: string; session_name?: string; event_type?: string }) {
  return legend.entries.find(entry => {
    const rules = Object.entries(entry.match);
    return rules.length > 0 && rules.every(([key, value]) => session[key as keyof typeof session] === value);
  });
}

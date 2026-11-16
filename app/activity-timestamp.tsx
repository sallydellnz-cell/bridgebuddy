export function ActivityTimestamp({ value, label }: { value?: string | null; label: "Added" | "Interest expressed" }) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const formatted = new Intl.DateTimeFormat("en-NZ", {
    timeZone: "Pacific/Auckland", day: "numeric", month: "short", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  }).format(date);
  return <time className="looking-activity-timestamp" dateTime={date.toISOString()} title={`${label} ${formatted} (New Zealand time)`}>
    {label} {formatted} · NZ
  </time>;
}

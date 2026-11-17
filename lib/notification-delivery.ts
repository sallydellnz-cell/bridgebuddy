// Server only. The browser receives only email availability.
export function notificationChannels() {
  const ready = !!(process.env.BRIDGEBUDDY_BASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.CRON_SECRET);
  return {
    email: ready && !!(process.env.RESEND_API_KEY && process.env.NOTIFICATION_EMAIL_FROM),
  };
}

export type Delivery = { id: string; channel: "email"; path: string; summary: string; destination: string };

export async function deliverNotification(job: Delivery): Promise<"sent" | "failed" | "unknown"> {
  if (job.channel !== "email") return "failed";
  const base = new URL(process.env.BRIDGEBUDDY_BASE_URL!);
  const link = new URL(job.path, base);
  if (link.origin !== base.origin || !["https:", "http:"].includes(link.protocol)) return "failed";
  const text = `BridgeBuddy · ${job.summary}\n${link.href}`;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST", signal: AbortSignal.timeout(8000),
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": job.id },
      body: JSON.stringify({ from: process.env.NOTIFICATION_EMAIL_FROM, to: [job.destination], subject: `BridgeBuddy · ${job.summary}`, text }),
    });
    return response.ok ? "sent" : response.status >= 500 ? "unknown" : "failed";
  } catch { return "unknown"; }
}

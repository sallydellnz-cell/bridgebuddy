// Server only. The browser receives only the two availability flags.
export function notificationChannels() {
  const ready = !!(process.env.BRIDGEBUDDY_BASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.CRON_SECRET);
  return {
    email: ready && !!(process.env.RESEND_API_KEY && process.env.NOTIFICATION_EMAIL_FROM),
    sms: ready && !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM),
  };
}

export type Delivery = { id: string; channel: "email" | "sms"; path: string; summary: string; destination: string };

export async function deliverNotification(job: Delivery): Promise<"sent" | "failed" | "unknown"> {
  const base = new URL(process.env.BRIDGEBUDDY_BASE_URL!);
  const link = new URL(job.path, base);
  if (link.origin !== base.origin || !["https:", "http:"].includes(link.protocol)) return "failed";
  const text = `BridgeBuddy · ${job.summary}\n${link.href}`;
  try {
    let response: Response;
    if (job.channel === "email") {
      response = await fetch("https://api.resend.com/emails", {
        method: "POST", signal: AbortSignal.timeout(8000),
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": job.id },
        body: JSON.stringify({ from: process.env.NOTIFICATION_EMAIL_FROM, to: [job.destination], subject: `BridgeBuddy · ${job.summary}`, text }),
      });
    } else {
      const sid = process.env.TWILIO_ACCOUNT_SID!;
      response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(sid)}/Messages.json`, {
        method: "POST", signal: AbortSignal.timeout(8000),
        headers: { Authorization: `Basic ${Buffer.from(sid + ":" + process.env.TWILIO_AUTH_TOKEN).toString("base64")}` },
        body: new URLSearchParams({ From: process.env.TWILIO_FROM!, To: job.destination, Body: text }),
      });
    }
    return response.ok ? "sent" : response.status >= 500 ? "unknown" : "failed";
  } catch { return "unknown"; }
}

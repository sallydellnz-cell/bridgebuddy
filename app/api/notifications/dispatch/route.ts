import { createClient } from "@supabase/supabase-js";
import { deliverNotification, notificationChannels } from "@/lib/notification-delivery";

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return new Response(null, { status: 401 });
  const channels = Object.entries(notificationChannels()).filter(([, ready]) => ready).map(([channel]) => channel);
  if (!channels.length) return Response.json({ processed: 0 });
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  let processed = 0;
  const deadline = Date.now() + 15_000;
  while (processed < 25 && Date.now() < deadline) {
    const { data, error } = await db.rpc("claim_notification_delivery", { p_channels: channels });
    if (error) return Response.json({ error: "Could not claim delivery" }, { status: 503 });
    if (!data) break;
    const status = await deliverNotification(data);
    const result = await db.rpc("finish_notification_delivery", { p_id: data.id, p_status: status });
    if (result.error) return Response.json({ error: "Could not record provider result" }, { status: 503 });
    processed++;
  }
  return Response.json({ processed });
}

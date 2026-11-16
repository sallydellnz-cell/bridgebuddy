import { notificationChannels } from "@/lib/notification-delivery";
export function GET() {
  return Response.json(notificationChannels(), { headers: { "Cache-Control": "no-store" } });
}

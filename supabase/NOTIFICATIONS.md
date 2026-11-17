# BridgeBuddy notification setup

Apply the project migrations in order through `202611120003_notification_preferences.sql` before deploying the updated app. The in-app bell, history and preference settings use Supabase. Players manage preferences through an authenticated account linked to their membership.

## External delivery

Set the following variables on the server. Keep provider credentials, the service-role key and the scheduler secret out of the browser.

| Purpose | Variables |
| --- | --- |
| Dispatch and activity links | `BRIDGEBUDDY_BASE_URL` (public HTTPS app origin), `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET` |
| Email | `RESEND_API_KEY`, `NOTIFICATION_EMAIL_FROM` (verified sender) |

Configure a scheduler to send an HTTPS POST to `/api/notifications/dispatch` with an `Authorization: Bearer <CRON_SECRET>` header. Each run processes up to 25 queued deliveries. Email requires a confirmed account email matching the registered member address.

The worker checks preferences and recipient details again when claiming a delivery. A sent status means the provider accepted the request. Check provider logs before manually recovering any delivery left in sending or unknown status.

The Admin Notices preference is available for future use. BridgeBuddy currently has no official notice-sending workflow.

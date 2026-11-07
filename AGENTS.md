<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Supabase table permissions

From 30 October 2026, Supabase stops automatically granting Data API access to new tables in the `public` schema on existing projects. Existing tables retain their current grants. BridgeBuddy uses `supabase-js`, so this applies to new tables accessed by the app.

When creating a table, include explicit `GRANT` statements in the same migration for the operations each required role (`anon`, `authenticated`, or `service_role`) actually needs. Choose permissions per table; do not copy blanket grants to all roles. Keep row-level security and its policies appropriate: grants control table access, while RLS controls row access.

Include the necessary grants in schema setup/recreation flows too, including fresh projects, preview branches, and local `supabase db reset`. Adding records or columns to an existing table does not by itself require new grants for this change.

Reference: Supabase final notice dated 20 October 2026; official announcement: https://github.com/orgs/supabase/discussions/45329

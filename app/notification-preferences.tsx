"use client";
import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

const labels = { matches: "Matches", registrations: "Registrations", interest: "Interest", messages: "New Message", admin: "Admin Notices" };
type Category = keyof typeof labels;
type Channel = "app" | "email";
type Settings = { categories: Record<Category, Record<Channel, boolean>> };
const channels: Channel[] = ["app", "email"];
const defaultChannels = { app: true, email: false };

export function NotificationPreferences() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [available, setAvailable] = useState({ email: false });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [setupPending, setSetupPending] = useState(false);
  const showMatrix = settings !== null || setupPending;
  async function open() {
    if (busy) return;
    dialog.current?.showModal();
    setSettings(null); setSetupPending(false); setMessage(""); setBusy(true);
    try {
      const [result, status] = await Promise.all([
        supabase.rpc("get_notification_preferences"),
        fetch("/api/notifications/channels").then(r => r.ok ? r.json() : { email: false }),
      ]);
      if (result.error?.code === "PGRST202") {
        setSetupPending(true);
        setMessage("These are the default settings. You can change them once notification setup is complete.");
        return;
      }
      if (result.error) throw new Error(result.error.code === "42501" ? "Sign in with Google or your password to manage notifications." : "Could not load notification settings. Close this window and try again.");
      setSettings(result.data); setAvailable(status);
    } catch (e) { setMessage(e instanceof Error ? e.message : "Could not load preferences."); }
    finally { setBusy(false); }
  }
  async function save(category: Category, channel: Channel, enabled: boolean) {
    if (!settings || busy || setupPending) return;
    setBusy(true); setMessage("");
    const previous = settings;
    setSettings({ ...settings, categories: { ...settings.categories,
      [category]: { ...settings.categories[category], [channel]: enabled } } });
    try {
      const { data, error } = await supabase.rpc("set_notification_preference", {
        p_category: category, p_channel: channel, p_enabled: enabled,
      });
      if (error?.code === "PGRST202") {
        setSetupPending(true);
        throw new Error("Your change could not be saved. Editing will be available once notification setup is complete.");
      }
      if (error) throw new Error(error.message);
      setSettings(data); setMessage("Saved.");
    } catch (e) {
      setSettings(previous);
      setMessage(e instanceof Error ? e.message : "Could not save this preference.");
    }
    finally { setBusy(false); }
  }
  return <div className="notification-profile-field">
    <button type="button" onClick={open} className="notification-settings-link">Notifications</button>
    <dialog ref={dialog} aria-labelledby="notification-settings-title" className="notification-settings-dialog">
      <header><h2 id="notification-settings-title">Notifications</h2>
        <button type="button" aria-label="Close notification settings" onClick={() => dialog.current?.close()}>×</button></header>
      {showMatrix && <table><thead><tr><th scope="col">Notification</th><th>App</th><th>Email</th></tr></thead>
        <tbody>{(Object.keys(labels) as Category[]).map(category => <tr key={category}>
          <th scope="row">{labels[category]}</th>
          {channels.map(channel => <td key={channel}><input type="checkbox" aria-label={`${labels[category]} ${channel}`}
            checked={settings?.categories[category][channel] ?? defaultChannels[channel]}
            disabled={setupPending || !settings || busy}
            onChange={event => save(category, channel, event.target.checked)} /></td>)}
        </tr>)}</tbody></table>}
      {settings && !available.email && <p>Email delivery awaits provider setup.</p>}
      <p role="status">{busy ? settings ? "Saving…" : "Loading…" : message}</p>
    </dialog>
  </div>;
}

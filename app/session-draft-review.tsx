"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Draft = {
  source_key: string; session_date: string; start_time: string; session_name: string;
  series_name: string | null; round_number: number | null; round_count: number | null;
  revision: number;
};

export function SessionDraftReview({ clubId, clubName, onPublished }: {
  clubId: number; clubName: string; onPublished: () => Promise<void>;
}) {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [selected, setSelected] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [loaded, setLoaded] = useState(false);
  const draft = drafts.find(item => item.source_key === selected) ?? drafts[0];

  async function load() {
    const { data, error } = await supabase.from("club_session_drafts")
      .select("source_key,session_date,start_time,session_name,series_name,round_number,round_count,revision")
      .eq("club_id", clubId).eq("status", "draft").order("session_date").order("start_time");
    if (error) throw new Error(error.message);
    setDrafts(data ?? []);
    setLoaded(true);
  }

  async function reload() {
    setBusy(true);
    setMessage("");
    try { await load(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not load drafts."); }
    finally { setBusy(false); }
  }

  return <details onToggle={e => {
    if (e.currentTarget.open && !loaded && !busy) void reload();
  }}>
    <summary>Review session dates · {clubName}</summary>
    {loaded && <p>{drafts.length} unpublished dates</p>}
    {draft && <form key={draft.source_key + draft.revision} className="session-draft-review"
      onSubmit={async event => {
        event.preventDefault();
        if (busy) return;
        const values = new FormData(event.currentTarget);
        const action = ((event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement)?.value ?? "save";
        setBusy(true);
        setMessage("");
        try {
          const { error } = await supabase.rpc("review_club_session", {
            p_club_id: clubId, p_source_key: draft.source_key, p_revision: draft.revision,
            p_action: action, p_date: values.get("date") || draft.session_date,
            p_time: values.get("time") || draft.start_time, p_name: values.get("name"),
            p_series: values.get("series"), p_round: values.get("round") || null,
            p_total: values.get("total") || null,
          });
          if (error) throw new Error(error.message);
          await load();
          if (action === "approve") await onPublished();
          setMessage(action === "approve" ? "Session published." : action === "cancel" ? "Date marked cancelled." : "Draft saved.");
        } catch (error) { setMessage(error instanceof Error ? error.message : "Could not review this date."); }
        finally { setBusy(false); }
      }}>
      <label>Choose a projected session
        <select value={draft.source_key} disabled={busy} onChange={event => { setSelected(event.target.value); setMessage(""); }}>
          {drafts.map(item => <option key={item.source_key} value={item.source_key}>
            {item.session_date} · {item.start_time.slice(0,5)} · {item.session_name}
          </option>)}
        </select>
      </label>
      <label>Session name<input name="name" defaultValue={draft.session_name} required maxLength={200} /></label>
      <label>Date<input name="date" type="date" defaultValue={draft.session_date} required /></label>
      <label>Club local time<input name="time" type="time" defaultValue={draft.start_time.slice(0,5)} required /></label>
      <label>Competition (optional)<input name="series" defaultValue={draft.series_name ?? ""} /></label>
      <label>Round<input name="round" type="number" min="1" defaultValue={draft.round_number ?? ""} /></label>
      <label>Total rounds<input name="total" type="number" min="1" defaultValue={draft.round_count ?? ""} /></label>
      <div className="session-draft-actions">
        <button disabled={busy} value="save">Save draft</button>
        <button disabled={busy} value="approve">Approve and publish</button>
        <button disabled={busy} value="cancel" formNoValidate>Mark date cancelled</button>
      </div>
    </form>}
    {message && <p role="status">{message} <button type="button" disabled={busy} onClick={reload}>Reload drafts</button></p>}
  </details>;
}

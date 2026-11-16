"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { ClubMembership, ClubProgramme } from "@/lib/club-programme";
import type { SessionLegend } from "@/lib/session-legend";

export type GradeOption = { club_id: number; grade_name: string };
export type ClubSettings = { club_id: number; club_name: string; venue: string; timezone: string; session_legend?: SessionLegend | null };

export function ConfigureClubGrades({ clubs, onSaved }: { clubs: { id: number; name: string }[]; onSaved: () => Promise<void> }) {
  const [message, setMessage] = useState("");
  if (!clubs.length) return null;
  return <details style={{ marginBlock: 16 }}><summary>Configure club grades (administrator)</summary>
    <form onSubmit={async e => {
      e.preventDefault(); const form = e.currentTarget; const values = new FormData(form);
      const { error } = await supabase.rpc("configure_club_grade", { p_club_id: Number(values.get("club")), p_grade_name: values.get("grade") });
      if (error) setMessage(error.message); else { await onSaved(); form.reset(); setMessage("Grade added. Assign it from a player's profile."); }
    }} style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
      <select name="club" aria-label="Club to configure" style={{ maxWidth: "100%", minHeight: 44 }}>{clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
      <input name="grade" aria-label="New club grade name" placeholder="Club grade name" required maxLength={60} style={{ maxWidth: "100%", minHeight: 44 }} />
      <button type="submit">Add grade</button>
    </form>{message && <p role="status">{message}</p>}
  </details>;
}

export function ProgrammeDetails({ programme }: { programme?: ClubProgramme }) {
  if (!programme) return null;
  return <div style={{ fontSize: 14, overflowWrap: "anywhere", marginTop: 8 }}>
    {programme.series_name && <div><strong>{programme.series_name}</strong>{programme.round_number ? ` · Round ${programme.round_number} of ${programme.round_count}` : ""}</div>}
    {programme.allowed_pairs.length > 0 && <div>Club grades: {programme.allowed_pairs.map(p => p.join(" + ")).join(" or ")}</div>}
    {programme.confirmation_required && <div role="note" style={{ color: "#92400e" }}>Administrator confirmation required: {programme.notes}</div>}
    {!programme.confirmation_required && programme.notes && <div>{programme.notes}</div>}
  </div>;
}

// Membership and grade are separate from the player's home club and national grade.
export function ClubGrades({ playerId, homeClubId, memberships, options, clubs, adminClubIds, onSaved }: {
  homeClubId?: number;
  playerId: number; memberships: ClubMembership[]; options: GradeOption[]; clubs: ClubSettings[];
  adminClubIds: number[]; onSaved: () => Promise<void>;
}) {
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const relevant = clubs.filter(c => options.some(g => g.club_id === c.club_id) &&
    (String(c.club_id) === String(homeClubId) || memberships.some(m => m.club_id === c.club_id && String(m.player_id) === String(playerId)) || adminClubIds.includes(c.club_id)));
  if (!relevant.length) return null;
  return <section style={{ marginBlock: 16 }} aria-label="Club Grade">
    <strong>Club Grade</strong>
    {relevant.map(c => {
      const membership = memberships.find(m => m.club_id === c.club_id && String(m.player_id) === String(playerId));
      return <div key={c.club_id} style={{ marginTop: 8 }}>
        <label>{c.club_name}: {adminClubIds.includes(c.club_id) ? <select aria-label={`Club Grade — ${c.club_name}`} disabled={saving}
          value={membership?.grade_name || ""} style={{ maxWidth: "100%", minHeight: 44 }}
          onChange={async e => {
            setSaving(true); setMessage("");
            const { error } = await supabase.rpc("set_member_club_grade", { p_club_id: c.club_id, p_player_id: playerId, p_grade_name: e.target.value || null });
            if (error) setMessage(error.message); else { await onSaved(); setMessage("Club grade saved."); }
            setSaving(false);
          }}><option value="">Not assigned (optional)</option>{options.filter(g => g.club_id === c.club_id).map(g => <option key={g.grade_name}>{g.grade_name}</option>)}</select>
          : <span>{membership?.grade_name || "Not assigned (optional)"}</span>}</label>
      </div>;
    })}
    <p style={{ fontSize: 13 }}>Assigned by the club administrator. Separate from NZ Bridge national grade.</p>
    {message && <p role="status">{message}</p>}
  </section>;
}

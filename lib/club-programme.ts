export type ClubMembership = { club_id: number; player_id: number; grade_name: string | null };
export type ClubProgramme = {
  club_id: number; session_date: string; session_name: string;
  series_name: string | null; round_number: number | null; round_count: number | null;
  allowed_pairs: string[][]; partner_search_enabled: boolean; event_type: string;
  start_time: string | null; notes: string; confirmation_required: boolean;
  division?: string;
};

export function clubGrade(memberships: ClubMembership[], clubId: unknown, playerId: unknown) {
  return memberships.find(m => String(m.club_id) === String(clubId) && String(m.player_id) === String(playerId))?.grade_name || null;
}

export function partnershipEligibility(pairs: string[][], first: string | null, second: string | null) {
  if (!pairs.length) return { rank: 0, label: "All club grades welcome" };
  if (!first || !second) return { rank: 1, label: "Club grade unconfirmed — ask a club administrator" };
  const eligible = pairs.some(([a, b]) => (a === first && b === second) || (a === second && b === first));
  return eligible ? { rank: 0, label: "Eligible partnership" } : { rank: 2, label: "Incompatible club grades for this competition" };
}

export function programmeFor(programme: ClubProgramme[], session: {club_id?: number; session_date?: string; session_name?: string} | undefined) {
  return programme.find(p => String(p.club_id) === String(session?.club_id) && p.session_date === session?.session_date && p.session_name === session?.session_name);
}

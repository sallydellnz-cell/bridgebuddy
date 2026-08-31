-- Allow every active BridgeBuddy member to view directory avatars and to be
-- registered for a tournament. A user_profiles row stores optional profile
-- preferences; membership in members_current is the account-level requirement.

do $migration$
begin
  if not exists (
    select 1
    from pg_constraint constraint_record
    where constraint_record.conrelid = 'public.members_current'::regclass
      and constraint_record.conname = 'members_current_nz_bridge_number_key'
  ) then
    alter table public.members_current
      add constraint members_current_nz_bridge_number_key
      unique (nz_bridge_number);
  end if;
end;
$migration$;

alter table public.tournament_pair_registrations
  drop constraint if exists
    tournament_pair_registrations_registering_nz_bridge_number_fkey;

alter table public.tournament_pair_registrations
  add constraint
    tournament_pair_registrations_registering_nz_bridge_number_fkey
  foreign key (registering_nz_bridge_number)
  references public.members_current (nz_bridge_number);

alter table public.tournament_pair_registrations
  drop constraint if exists
    tournament_pair_registrations_partner_nz_bridge_number_fkey;

alter table public.tournament_pair_registrations
  add constraint tournament_pair_registrations_partner_nz_bridge_number_fkey
  foreign key (partner_nz_bridge_number)
  references public.members_current (nz_bridge_number);

create or replace function public.get_member_avatar_display(
  p_target_nz_bridge_number bigint,
  p_viewer_nz_bridge_number bigint
)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_avatar jsonb;
begin
  if not exists (
    select 1
    from public.members_current viewer
    where viewer.nz_bridge_number = p_viewer_nz_bridge_number
  ) then
    raise exception 'BridgeBuddy member required.';
  end if;

  if not exists (
    select 1
    from public.members_current member
    where member.nz_bridge_number = p_target_nz_bridge_number
  ) then
    raise exception 'Player not found.';
  end if;

  select jsonb_build_object(
    'avatar_key', coalesce(profile.avatar_key, 'initials'),
    'avatar_photo_path', profile.avatar_photo_path
  )
  into v_avatar
  from public.members_current member
  left join public.user_profiles profile
    on profile.nz_bridge_number = member.nz_bridge_number
  where member.nz_bridge_number = p_target_nz_bridge_number
  order by member.is_active desc nulls last
  limit 1;

  return coalesce(
    v_avatar,
    jsonb_build_object(
      'avatar_key', 'initials',
      'avatar_photo_path', null
    )
  );
end;
$function$;

create or replace function public.register_tournament_pair(
  p_session_instance_id text,
  p_registering_nz_bridge_number bigint,
  p_partner_nz_bridge_number bigint default null::bigint,
  p_manual_partner_first_name text default null::text,
  p_manual_partner_last_name text default null::text,
  p_manual_partner_nz_bridge_number bigint default null::bigint,
  p_manual_partner_club text default null::text,
  p_manual_partner_email text default null::text,
  p_manual_partner_phone text default null::text
)
returns bigint
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_registration_id bigint;
  v_tournament_name text;
  v_registering_player_name text;
begin
  select sc.session_name
  into v_tournament_name
  from public.sessions_current sc
  where sc.session_instance_id = p_session_instance_id
    and sc.location_type = 'Tournaments'
  limit 1;

  if v_tournament_name is null then
    raise exception 'Tournament not found.';
  end if;

  if not exists (
    select 1
    from public.members_current member
    where member.nz_bridge_number = p_registering_nz_bridge_number
  ) then
    raise exception 'Registering player not found.';
  end if;

  if p_partner_nz_bridge_number is not null and not exists (
    select 1
    from public.members_current member
    where member.nz_bridge_number = p_partner_nz_bridge_number
  ) then
    raise exception 'Selected BridgeBuddy partner not found.';
  end if;

  insert into public.tournament_pair_registrations (
    session_instance_id,
    registering_nz_bridge_number,
    registered_by_nz_bridge_number,
    partner_nz_bridge_number,
    manual_partner_first_name,
    manual_partner_last_name,
    manual_partner_nz_bridge_number,
    manual_partner_club,
    manual_partner_email,
    manual_partner_phone,
    registration_status
  )
  values (
    p_session_instance_id,
    p_registering_nz_bridge_number,
    p_registering_nz_bridge_number,
    p_partner_nz_bridge_number,
    nullif(trim(p_manual_partner_first_name), ''),
    nullif(trim(p_manual_partner_last_name), ''),
    p_manual_partner_nz_bridge_number,
    nullif(trim(p_manual_partner_club), ''),
    nullif(trim(p_manual_partner_email), ''),
    nullif(trim(p_manual_partner_phone), ''),
    'Registered'
  )
  returning registration_id into v_registration_id;

  if p_partner_nz_bridge_number is not null then
    select trim(
      coalesce(mc.first_name, '') || ' ' || coalesce(mc.last_name, '')
    )
    into v_registering_player_name
    from public.members_current mc
    where mc.nz_bridge_number = p_registering_nz_bridge_number
    limit 1;

    if coalesce(v_registering_player_name, '') = '' then
      v_registering_player_name := 'Your partner';
    end if;

    insert into public.notifications (
      nz_bridge_number,
      session_instance_id,
      notification_type,
      message,
      is_read,
      created_at,
      updated_at
    )
    values (
      p_partner_nz_bridge_number,
      p_session_instance_id,
      'TournamentPairRegistered',
      v_registering_player_name ||
        ' registered you as their partner for ' ||
        v_tournament_name || '.',
      false,
      now(),
      now()
    );
  end if;

  return v_registration_id;
end;
$function$;

create or replace function public.director_register_tournament_pair(
  p_session_instance_id text,
  p_director_nz_bridge_number bigint,
  p_player_one_nz_bridge_number bigint,
  p_partner_nz_bridge_number bigint default null::bigint,
  p_manual_partner_first_name text default null::text,
  p_manual_partner_last_name text default null::text,
  p_manual_partner_nz_bridge_number bigint default null::bigint,
  p_manual_partner_club text default null::text,
  p_manual_partner_email text default null::text,
  p_manual_partner_phone text default null::text
)
returns bigint
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_registration_id bigint;
  v_session_club_id bigint;
  v_tournament_name text;
  v_director_name text;
begin
  select sc.club_id, sc.session_name
  into v_session_club_id, v_tournament_name
  from public.sessions_current sc
  where sc.session_instance_id = p_session_instance_id
    and sc.location_type = 'Tournaments'
  limit 1;

  if v_tournament_name is null then
    raise exception 'Tournament not found.';
  end if;

  if not exists (
    select 1
    from public.club_member_roles cmr
    where cmr.nz_bridge_number = p_director_nz_bridge_number
      and cmr.club_id = v_session_club_id
      and cmr.role_name = 'Director'
      and cmr.is_current = true
  ) then
    raise exception 'Director access required for this club.';
  end if;

  if p_player_one_nz_bridge_number = p_director_nz_bridge_number
    or p_partner_nz_bridge_number = p_director_nz_bridge_number
    or p_manual_partner_nz_bridge_number = p_director_nz_bridge_number
  then
    raise exception 'A director cannot register themselves.';
  end if;

  if not exists (
    select 1
    from public.members_current member
    where member.nz_bridge_number = p_player_one_nz_bridge_number
  ) then
    raise exception 'First player not found.';
  end if;

  if p_partner_nz_bridge_number is not null and not exists (
    select 1
    from public.members_current member
    where member.nz_bridge_number = p_partner_nz_bridge_number
  ) then
    raise exception 'Selected partner not found.';
  end if;

  if p_partner_nz_bridge_number is null and (
    nullif(trim(p_manual_partner_first_name), '') is null
    or nullif(trim(p_manual_partner_last_name), '') is null
  ) then
    raise exception 'The manual partner first and last names are required.';
  end if;

  if p_partner_nz_bridge_number is not null
    and p_partner_nz_bridge_number = p_player_one_nz_bridge_number
  then
    raise exception 'A player cannot be registered as their own partner.';
  end if;

  insert into public.tournament_pair_registrations (
    session_instance_id,
    registering_nz_bridge_number,
    registered_by_nz_bridge_number,
    partner_nz_bridge_number,
    manual_partner_first_name,
    manual_partner_last_name,
    manual_partner_nz_bridge_number,
    manual_partner_club,
    manual_partner_email,
    manual_partner_phone,
    registration_status
  )
  values (
    p_session_instance_id,
    p_player_one_nz_bridge_number,
    p_director_nz_bridge_number,
    p_partner_nz_bridge_number,
    case when p_partner_nz_bridge_number is null
      then nullif(trim(p_manual_partner_first_name), '') else null end,
    case when p_partner_nz_bridge_number is null
      then nullif(trim(p_manual_partner_last_name), '') else null end,
    case when p_partner_nz_bridge_number is null
      then p_manual_partner_nz_bridge_number else null end,
    case when p_partner_nz_bridge_number is null
      then nullif(trim(p_manual_partner_club), '') else null end,
    case when p_partner_nz_bridge_number is null
      then nullif(trim(p_manual_partner_email), '') else null end,
    case when p_partner_nz_bridge_number is null
      then nullif(trim(p_manual_partner_phone), '') else null end,
    'Registered'
  )
  returning registration_id into v_registration_id;

  select trim(
    coalesce(mc.first_name, '') || ' ' || coalesce(mc.last_name, '')
  )
  into v_director_name
  from public.members_current mc
  where mc.nz_bridge_number = p_director_nz_bridge_number
    and mc.club_id = v_session_club_id
  limit 1;

  if coalesce(v_director_name, '') = '' then
    v_director_name := 'The club director';
  end if;

  insert into public.notifications (
    nz_bridge_number,
    session_instance_id,
    notification_type,
    message,
    is_read,
    created_at,
    updated_at
  )
  values (
    p_player_one_nz_bridge_number,
    p_session_instance_id,
    'DirectorTournamentPairRegistered',
    v_director_name || ' registered you for ' || v_tournament_name || '.',
    false,
    now(),
    now()
  );

  if p_partner_nz_bridge_number is not null then
    insert into public.notifications (
      nz_bridge_number,
      session_instance_id,
      notification_type,
      message,
      is_read,
      created_at,
      updated_at
    )
    values (
      p_partner_nz_bridge_number,
      p_session_instance_id,
      'DirectorTournamentPairRegistered',
      v_director_name || ' registered you for ' || v_tournament_name || '.',
      false,
      now(),
      now()
    );
  end if;

  return v_registration_id;
end;
$function$;

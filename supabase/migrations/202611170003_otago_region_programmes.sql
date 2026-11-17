-- Otago club programmes checked 17 November 2026. Dated entries and bounded
-- regular sessions only. Source URLs and confirmation notes travel with each row.
begin;
lock table public.clubs, public.club_programme_settings, public.club_programme,
  public.session_templates, public.session_overrides in share row exclusive mode;
create temporary table otago_hosts (num integer primary key, name text, venue text, id bigint unique) on commit drop;
insert into otago_hosts(num,name,venue) values
  (603, 'Alexandra Bridge Club', '52 Boundary Road, Alexandra'),
  (606, 'Balclutha Bridge Club', '9 Crown Street, Balclutha'),
  (609, 'Cromwell Bridge Club', 'Catholic Church Hall, 2 Sligo Street, Cromwell'),
  (610, 'East Otago Bridge Club', 'RSA, 10 Pratt Street, Waikouaiti'),
  (616, 'Maniototo Bridge Club', 'Wallace Memorial Room, John Street, Ranfurly'),
  (618, 'Milton Bridge Club', 'Senior Citizens’ Room, Union Street, Milton'),
  (621, 'Oamaru Bridge Club', 'Corner of Steward and Medway Streets, Oamaru'),
  (622, 'Otago Bridge Club', '100 Otaki Street, South Dunedin'),
  (624, 'Queenstown Bridge Club', 'Queenstown Events Centre, 33 Joe O’Connell Drive, Frankton'),
  (627, 'Taieri Bridge Club', '10 Wickliffe Street, Mosgiel');
create temporary table otago_dates (
  num integer references otago_hosts(num), day date, starts time, title text, division text,
  notes text, kind text, source text, primary key(num,day,title)
) on commit drop;
insert into otago_dates values
  (603, '2026-11-18', '19:15', 'Wednesday bridge', null, 'Be seated by 7 pm.', 'Club session', 'https://otagosouthlandbridge.org.nz/alexandra/?programme'),
  (603, '2026-11-25', '19:15', 'Wednesday bridge', null, 'Be seated by 7 pm.', 'Club session', 'https://otagosouthlandbridge.org.nz/alexandra/?programme'),
  (603, '2026-12-02', '19:15', 'Wednesday bridge', null, 'Be seated by 7 pm.', 'Club session', 'https://otagosouthlandbridge.org.nz/alexandra/?programme'),
  (603, '2026-12-09', '19:15', 'Wednesday bridge', null, 'Be seated by 7 pm.', 'Club session', 'https://otagosouthlandbridge.org.nz/alexandra/?programme'),
  (603, '2026-11-20', '10:30', 'Friday morning bridge', null, 'Be seated by 10:15 am. Bring lunch.', 'Club session', 'https://otagosouthlandbridge.org.nz/alexandra/?programme'),
  (603, '2026-11-27', '10:30', 'Friday morning bridge', null, 'Be seated by 10:15 am. Bring lunch.', 'Club session', 'https://otagosouthlandbridge.org.nz/alexandra/?programme'),
  (603, '2026-12-04', '10:30', 'Friday morning bridge', null, 'Be seated by 10:15 am. Bring lunch.', 'Club session', 'https://otagosouthlandbridge.org.nz/alexandra/?programme'),
  (603, '2026-12-11', '10:30', 'Friday morning bridge', null, 'Be seated by 10:15 am. Bring lunch.', 'Club session', 'https://otagosouthlandbridge.org.nz/alexandra/?programme'),
  (603, '2026-11-23', '19:15', 'Monday handicap and scratch', null, 'Be seated by 7 pm.', 'Club session', 'https://otagosouthlandbridge.org.nz/alexandra/?programme'),
  (603, '2026-11-30', '19:15', 'Monday handicap and scratch', null, 'Be seated by 7 pm.', 'Club session', 'https://otagosouthlandbridge.org.nz/alexandra/?programme'),
  (603, '2026-12-07', '19:15', 'Monday handicap and scratch', null, 'Be seated by 7 pm.', 'Club session', 'https://otagosouthlandbridge.org.nz/alexandra/?programme'),
  (603, '2027-01-06', '19:15', 'Wednesday holiday bridge', null, 'January holiday programme. Be seated by 7 pm.', 'Club session', 'https://otagosouthlandbridge.org.nz/alexandra/?programme'),
  (603, '2027-01-13', '19:15', 'Wednesday holiday bridge', null, 'January holiday programme. Be seated by 7 pm.', 'Club session', 'https://otagosouthlandbridge.org.nz/alexandra/?programme'),
  (603, '2027-01-20', '19:15', 'Wednesday holiday bridge', null, 'January holiday programme. Be seated by 7 pm.', 'Club session', 'https://otagosouthlandbridge.org.nz/alexandra/?programme'),
  (603, '2027-01-27', '19:15', 'Wednesday holiday bridge', null, 'January holiday programme. Be seated by 7 pm.', 'Club session', 'https://otagosouthlandbridge.org.nz/alexandra/?programme'),
  (603, '2027-01-08', '18:30', 'Alexandra Holiday Pairs', 'Open', '5A Open. Two evening sessions. Entries close at noon on 6 January.', 'Tournament', 'https://otagosouthlandbridge.org.nz/alexandra/?programme'),
  (603, '2027-01-09', '18:30', 'Alexandra Holiday Pairs', 'Open', '5A Open. Two evening sessions. Entries close at noon on 6 January.', 'Tournament', 'https://otagosouthlandbridge.org.nz/alexandra/?programme'),
  (606, '2026-11-17', '19:00', 'Duplicate Pairs', null, 'Tuesday club play. Be seated by 6:50 pm.', 'Club session', 'https://otagosouthlandbridge.org.nz/balclutha/?programme'),
  (606, '2026-11-24', '19:00', 'Duplicate Pairs', null, 'Tuesday club play. Be seated by 6:50 pm.', 'Club session', 'https://otagosouthlandbridge.org.nz/balclutha/?programme'),
  (606, '2026-12-01', '19:00', 'Duplicate Pairs', null, 'Tuesday club play. Be seated by 6:50 pm.', 'Club session', 'https://otagosouthlandbridge.org.nz/balclutha/?programme'),
  (606, '2026-11-19', '19:00', 'Practice play and learner lessons', null, 'Thursday practice for players and learners.', 'Club session', 'https://otagosouthlandbridge.org.nz/balclutha/?programme'),
  (606, '2026-11-26', '19:00', 'Practice play and learner lessons', null, 'Thursday practice for players and learners.', 'Club session', 'https://otagosouthlandbridge.org.nz/balclutha/?programme'),
  (609, '2026-11-23', '13:00', 'Individual Handicap', null, 'Monday handicap series. Be seated ten minutes before play.', 'Club session', 'https://otagosouthlandbridge.org.nz/cromwell/?programme'),
  (609, '2026-11-30', '13:00', 'Individual Handicap', null, 'Monday handicap series. Be seated ten minutes before play.', 'Club session', 'https://otagosouthlandbridge.org.nz/cromwell/?programme'),
  (609, '2026-11-19', '19:15', 'Championship Pairs 11', null, 'Thursday evening series. Be seated ten minutes before play.', 'Club session', 'https://otagosouthlandbridge.org.nz/cromwell/?programme'),
  (609, '2026-11-26', '19:15', 'Championship Pairs 12', null, 'Thursday evening series. Be seated ten minutes before play.', 'Club session', 'https://otagosouthlandbridge.org.nz/cromwell/?programme'),
  (609, '2026-12-03', '19:15', 'AGM, prizegiving and fun bridge', null, 'Combined club event. No separate playing start is advertised.', 'Club event', 'https://otagosouthlandbridge.org.nz/cromwell/?programme'),
  (610, '2026-11-18', '19:00', 'Duplicate Pairs', null, 'Be seated by 6:50 pm. Season runs to mid-December.', 'Club session', 'https://otagosouthlandbridge.org.nz/eastotago/?programme'),
  (610, '2026-11-25', '19:00', 'Duplicate Pairs', null, 'Be seated by 6:50 pm. Season runs to mid-December.', 'Club session', 'https://otagosouthlandbridge.org.nz/eastotago/?programme'),
  (610, '2026-12-02', '19:00', 'Duplicate Pairs', null, 'Be seated by 6:50 pm. Season runs to mid-December.', 'Club session', 'https://otagosouthlandbridge.org.nz/eastotago/?programme'),
  (610, '2026-12-09', '19:00', 'Duplicate Pairs', null, 'Be seated by 6:50 pm. Season runs to mid-December.', 'Club session', 'https://otagosouthlandbridge.org.nz/eastotago/?programme'),
  (616, '2026-11-18', null, 'Wednesday club bridge', null, 'Confirm first board time. The regional list gives 7:10 pm and the club describes 7:10 pm as seating. June and July play is at 3 pm. Closed December and January.', 'Club session', 'https://otagosouthlandbridge.org.nz/maniototo/'),
  (616, '2026-11-25', null, 'Wednesday club bridge', null, 'Confirm first board time. The regional list gives 7:10 pm and the club describes 7:10 pm as seating. June and July play is at 3 pm. Closed December and January.', 'Club session', 'https://otagosouthlandbridge.org.nz/maniototo/'),
  (618, '2026-11-19', null, 'Thursday club bridge', null, 'Confirm first board time. The programme lists 6:45 pm and the club home page gives 7 pm. The season ends in November.', 'Club session', 'https://otagosouthlandbridge.org.nz/milton/?programme'),
  (618, '2026-11-26', null, 'Thursday club bridge', null, 'Confirm first board time. The programme lists 6:45 pm and the club home page gives 7 pm. The season ends in November.', 'Club session', 'https://otagosouthlandbridge.org.nz/milton/?programme'),
  (621, '2026-11-17', '19:00', 'Championship Pairs', 'Silver', 'Silver. Be seated ten minutes before play.', 'Club session', 'https://otagosouthlandbridge.org.nz/oamaru/?programme'),
  (621, '2026-11-19', '19:00', 'President’s Pairs', 'Bronze and Silver', 'Bronze and Silver. Be seated ten minutes before play.', 'Club session', 'https://otagosouthlandbridge.org.nz/oamaru/?programme'),
  (621, '2026-11-23', '19:00', 'Championship Teams', 'Bronze', 'Bronze. Be seated ten minutes before play. Fixed tables; no visitors for teams.', 'Club session', 'https://otagosouthlandbridge.org.nz/oamaru/?programme'),
  (621, '2026-11-24', '19:00', 'Championship Team', 'Silver', 'Silver. Be seated ten minutes before play. Fixed tables; no visitors for teams.', 'Club session', 'https://otagosouthlandbridge.org.nz/oamaru/?programme'),
  (621, '2026-11-20', '13:00', 'November Individual', 'Social', 'Social. Be seated ten minutes before play.', 'Club session', 'https://otagosouthlandbridge.org.nz/oamaru/?programme'),
  (621, '2026-11-27', '13:00', 'November Individual', 'Social', 'Social. Be seated ten minutes before play.', 'Club session', 'https://otagosouthlandbridge.org.nz/oamaru/?programme'),
  (621, '2026-12-04', '13:00', 'Drawn Pairs', 'Social', 'Social. Be seated ten minutes before play.', 'Club session', 'https://otagosouthlandbridge.org.nz/oamaru/?programme'),
  (621, '2026-12-11', '13:00', 'Christmas Bridge', 'Social', 'Social. Be seated ten minutes before play.', 'Club session', 'https://otagosouthlandbridge.org.nz/oamaru/?programme'),
  (622, '2026-11-18', '19:00', 'Intermediate and Junior Teams 3', 'Intermediate / Junior', 'Combined Wednesday evening teams.', 'Club session', 'https://otagobridgeclub.org.nz/programme.php'),
  (622, '2026-11-18', '12:55', 'Women’s Spring Pairs', 'Women’s Pairs', 'Also counts towards the individual and pairs championships.', 'Club session', 'https://otagobridgeclub.org.nz/programme.php'),
  (622, '2026-11-19', '19:10', 'Open Congress Pairs', 'Open', 'Open division.', 'Club session', 'https://otagobridgeclub.org.nz/programme.php'),
  (622, '2026-11-19', '19:10', 'Senior Congress Pairs', 'Senior', 'Senior division.', 'Club session', 'https://otagobridgeclub.org.nz/programme.php'),
  (622, '2026-11-25', '19:00', 'Intermediate Christmas Pairs', 'Intermediate', 'Intermediate division.', 'Club session', 'https://otagobridgeclub.org.nz/programme.php'),
  (622, '2026-12-02', '19:00', 'Intermediate Christmas Pairs', 'Intermediate', 'Intermediate division.', 'Club session', 'https://otagobridgeclub.org.nz/programme.php'),
  (622, '2026-12-09', '19:00', 'Intermediate Christmas Pairs', 'Intermediate', 'Intermediate division.', 'Club session', 'https://otagobridgeclub.org.nz/programme.php'),
  (622, '2026-11-25', '19:00', 'Junior Christmas Pairs', 'Junior', 'Junior division.', 'Club session', 'https://otagobridgeclub.org.nz/programme.php'),
  (622, '2026-12-02', '19:00', 'Junior Christmas Pairs', 'Junior', 'Junior division.', 'Club session', 'https://otagobridgeclub.org.nz/programme.php'),
  (622, '2026-12-09', '19:00', 'Junior Christmas Pairs', 'Junior', 'Junior division.', 'Club session', 'https://otagobridgeclub.org.nz/programme.php'),
  (622, '2026-11-26', '19:10', 'Open Christmas Pairs', 'Open', 'Open division.', 'Club session', 'https://otagobridgeclub.org.nz/programme.php'),
  (622, '2026-12-03', '19:10', 'Open Christmas Pairs', 'Open', 'Open division.', 'Club session', 'https://otagobridgeclub.org.nz/programme.php'),
  (622, '2026-12-10', '19:10', 'Open Christmas Pairs', 'Open', 'Open division.', 'Club session', 'https://otagobridgeclub.org.nz/programme.php'),
  (622, '2026-11-26', '19:10', 'Senior Christmas Pairs', 'Senior', 'Senior division.', 'Club session', 'https://otagobridgeclub.org.nz/programme.php'),
  (622, '2026-12-03', '19:10', 'Senior Christmas Pairs', 'Senior', 'Senior division.', 'Club session', 'https://otagobridgeclub.org.nz/programme.php'),
  (622, '2026-12-10', '19:10', 'Senior Christmas Pairs', 'Senior', 'Senior division.', 'Club session', 'https://otagobridgeclub.org.nz/programme.php'),
  (622, '2026-11-20', '10:20', 'Friday November Match', 'Friday Duplicate', 'Friday duplicate pairs.', 'Club session', 'https://otagobridgeclub.org.nz/programme.php'),
  (622, '2026-11-27', '10:20', 'Friday November Match', 'Friday Duplicate', 'Friday duplicate pairs.', 'Club session', 'https://otagobridgeclub.org.nz/programme.php'),
  (622, '2026-11-23', '19:10', 'Casual Teams Extra', 'Teams', 'Monday teams session.', 'Club session', 'https://otagobridgeclub.org.nz/programme.php'),
  (622, '2026-11-30', '19:10', 'Teams Championship', 'Teams', 'Includes the Gold and Silver final rounds.', 'Club session', 'https://otagobridgeclub.org.nz/programme.php'),
  (622, '2026-12-07', '19:10', 'Teams Championship', 'Teams', 'Monday teams session.', 'Club session', 'https://otagobridgeclub.org.nz/programme.php'),
  (622, '2026-12-02', '12:55', 'Women’s Pairs Christmas Party', 'Women’s Pairs', 'Wednesday afternoon event.', 'Club session', 'https://otagobridgeclub.org.nz/programme.php'),
  (622, '2026-12-04', '10:20', 'Friday December January Match', 'Friday Duplicate', 'Friday duplicate pairs.', 'Club session', 'https://otagobridgeclub.org.nz/programme.php'),
  (622, '2026-12-11', '10:20', 'Friday December January Match', 'Friday Duplicate', 'Friday duplicate pairs.', 'Club session', 'https://otagobridgeclub.org.nz/programme.php'),
  (622, '2026-12-18', '10:20', 'Friday December January Match', 'Friday Duplicate', 'Friday duplicate pairs.', 'Club session', 'https://otagobridgeclub.org.nz/programme.php'),
  (622, '2027-01-08', '10:20', 'Friday December January Match', 'Friday Duplicate', 'Friday duplicate pairs.', 'Club session', 'https://otagobridgeclub.org.nz/programme.php'),
  (622, '2027-01-15', '10:20', 'Friday December January Match', 'Friday Duplicate', 'Friday duplicate pairs.', 'Club session', 'https://otagobridgeclub.org.nz/programme.php'),
  (622, '2027-01-22', '10:20', 'Friday December January Match', 'Friday Duplicate', 'Friday duplicate pairs.', 'Club session', 'https://otagobridgeclub.org.nz/programme.php'),
  (622, '2027-01-29', '10:20', 'Friday December January Match', 'Friday Duplicate', 'Friday duplicate pairs.', 'Club session', 'https://otagobridgeclub.org.nz/programme.php'),
  (622, '2026-12-14', null, 'Casual Holiday Bridge 2026–2027', null, 'Date published. Confirm the holiday start time before arranging a partnership.', 'Club session', 'https://otagobridgeclub.org.nz/programme.php'),
  (622, '2026-12-16', null, 'Casual Holiday Bridge 2026–2027', null, 'Date published. Confirm the holiday start time before arranging a partnership.', 'Club session', 'https://otagobridgeclub.org.nz/programme.php'),
  (622, '2026-12-21', null, 'Casual Holiday Bridge 2026–2027', null, 'Date published. Confirm the holiday start time before arranging a partnership.', 'Club session', 'https://otagobridgeclub.org.nz/programme.php'),
  (622, '2026-12-28', null, 'Casual Holiday Bridge 2026–2027', null, 'Date published. Confirm the holiday start time before arranging a partnership.', 'Club session', 'https://otagobridgeclub.org.nz/programme.php'),
  (622, '2026-12-30', null, 'Casual Holiday Bridge 2026–2027', null, 'Date published. Confirm the holiday start time before arranging a partnership.', 'Club session', 'https://otagobridgeclub.org.nz/programme.php'),
  (622, '2027-01-04', null, 'Casual Holiday Bridge 2026–2027', null, 'Date published. Confirm the holiday start time before arranging a partnership.', 'Club session', 'https://otagobridgeclub.org.nz/programme.php'),
  (622, '2027-01-06', null, 'Casual Holiday Bridge 2026–2027', null, 'Date published. Confirm the holiday start time before arranging a partnership.', 'Club session', 'https://otagobridgeclub.org.nz/programme.php'),
  (622, '2026-12-06', null, 'Nina Hewitt Christmas Pairs', 'Open', '8B Open. Confirm start time.', 'Tournament', 'https://www.nzbridge.co.nz/events/12787/Nina-Hewitt-Christmas-Pairs'),
  (622, '2027-01-24', null, 'Otago Festival Pairs', 'Open', '5A Open. Confirm start time.', 'Tournament', 'https://www.nzbridge.co.nz/events/13403/Otago-Festival-Pairs'),
  (624, '2026-11-17', '19:00', 'Xmas Pairs', null, 'Tuesday evening. Be seated by 6:50 pm.', 'Club session', 'https://queenstownbridgeclub.com/page/608662'),
  (624, '2026-11-24', '19:00', 'Xmas Pairs', null, 'Tuesday evening. Be seated by 6:50 pm.', 'Club session', 'https://queenstownbridgeclub.com/page/608662'),
  (624, '2026-12-01', '19:00', 'Championship Pairs 8', null, 'Tuesday evening. Be seated by 6:50 pm.', 'Club session', 'https://queenstownbridgeclub.com/page/608662'),
  (624, '2026-12-08', '19:00', 'Championship Pairs 9', null, 'Tuesday evening. Be seated by 6:50 pm.', 'Club session', 'https://queenstownbridgeclub.com/page/608662'),
  (624, '2026-12-15', null, 'Xmas Party and Prize Giving', null, 'Confirm the start time of the special event.', 'Club event', 'https://queenstownbridgeclub.com/page/608662'),
  (624, '2026-11-20', '13:00', 'Friday afternoon bridge', null, 'Queenstown Events Centre. Be seated by 12:45 pm.', 'Club session', 'https://queenstownbridgeclub.com/page/608664'),
  (624, '2026-11-27', '13:00', 'Friday afternoon bridge', null, 'Queenstown Events Centre. Be seated by 12:45 pm.', 'Club session', 'https://queenstownbridgeclub.com/page/608664'),
  (624, '2026-12-04', '13:00', 'Friday afternoon bridge', null, 'Queenstown Events Centre. Be seated by 12:45 pm.', 'Club session', 'https://queenstownbridgeclub.com/page/608664'),
  (624, '2026-12-11', '13:00', 'Friday afternoon bridge and Christmas party', null, 'Queenstown Events Centre. Be seated by 12:45 pm.', 'Club session', 'https://queenstownbridgeclub.com/page/608664'),
  (627, '2026-11-18', '19:00', 'Wednesday Open', 'Open', 'Open play. Open to all members. Arrive ten minutes before play.', 'Club session', 'https://otagosouthlandbridge.org.nz/taieri/?programme'),
  (627, '2026-11-25', '19:00', 'Wednesday Open', 'Open', 'Open play. Open to all members. Arrive ten minutes before play.', 'Club session', 'https://otagosouthlandbridge.org.nz/taieri/?programme'),
  (627, '2026-12-02', '19:00', 'Wednesday Open', 'Open', 'Open play. Open to all members. Arrive ten minutes before play.', 'Club session', 'https://otagosouthlandbridge.org.nz/taieri/?programme'),
  (627, '2026-12-09', '19:00', 'Wednesday Open', 'Open', 'Open play. Open to all members. Arrive ten minutes before play.', 'Club session', 'https://otagosouthlandbridge.org.nz/taieri/?programme'),
  (627, '2026-11-21', '13:30', 'Saturday Social', 'Social', 'Social play. Open to all members. Arrive ten minutes before play.', 'Club session', 'https://otagosouthlandbridge.org.nz/taieri/?programme'),
  (627, '2026-11-28', '13:30', 'Saturday Social', 'Social', 'Social play. Open to all members. Arrive ten minutes before play.', 'Club session', 'https://otagosouthlandbridge.org.nz/taieri/?programme'),
  (627, '2026-12-05', '13:30', 'Saturday Social', 'Social', 'Social play. Open to all members. Arrive ten minutes before play.', 'Club session', 'https://otagosouthlandbridge.org.nz/taieri/?programme'),
  (627, '2026-12-12', '13:30', 'Saturday Social', 'Social', 'Social play. Open to all members. Arrive ten minutes before play.', 'Club session', 'https://otagosouthlandbridge.org.nz/taieri/?programme'),
  (627, '2026-11-23', '19:00', 'Monday Graded', 'Graded', 'Graded play. Open to all members. Arrive ten minutes before play.', 'Club session', 'https://otagosouthlandbridge.org.nz/taieri/?programme'),
  (627, '2026-11-30', '19:00', 'Monday Graded', 'Graded', 'Graded play. Open to all members. Arrive ten minutes before play.', 'Club session', 'https://otagosouthlandbridge.org.nz/taieri/?programme'),
  (627, '2026-12-07', '19:00', 'Monday Graded', 'Graded', 'Graded play. Open to all members. Arrive ten minutes before play.', 'Club session', 'https://otagosouthlandbridge.org.nz/taieri/?programme');
do $import$
declare host record; ids bigint[]; host_id bigint;
begin
  for host in select * from otago_hosts order by num loop
    select array_agg(distinct c.club_id) into ids from public.clubs c
      left join public.club_programme_settings s using(club_id)
      where s.nz_bridge_club_number=host.num or lower(trim(c.club_name)) in
        (lower(host.name),lower(replace(host.name,' Bridge Club','')));
    if cardinality(ids)>1 then raise exception 'Ambiguous club: %',host.name; end if;
    host_id := ids[1];
    if host_id is null then
      if pg_get_serial_sequence('public.clubs','club_id') is null then
        insert into public.clubs(club_id,club_name,is_current)
          select coalesce(max(club_id),0)+1,host.name,true from public.clubs returning club_id into host_id;
      else
        insert into public.clubs(club_name,is_current) values(host.name,true) returning club_id into host_id;
      end if;
    end if;
    if exists(select from public.club_programme_settings where club_id=host_id and nz_bridge_club_number is distinct from host.num) then
      raise exception 'Club identity requires reconciliation: %',host.name;
    end if;
    insert into public.club_programme_settings(club_id,club_name,nz_bridge_club_number,venue,timezone)
      values(host_id,host.name,host.num,host.venue,'Pacific/Auckland') on conflict do nothing;
    update otago_hosts set id=host_id where num=host.num;
  end loop;
end; $import$;
-- Some installations have the optional draft-review module.
do $drafts$
begin
  if to_regclass('public.club_session_drafts') is not null then
    delete from otago_dates d using otago_hosts h, public.club_session_drafts f
    where h.num=d.num and f.club_id=h.id and f.session_date=d.day
      and (f.start_time=d.starts or f.session_name=d.title);
  end if;
end; $drafts$;
-- Preserve earlier imports, schedules, withdrawals and hand-entered records.
-- Compare with the existing calendar in one statement, so parallel divisions
-- published together by a club can legitimately share a start time.
with added as (
  insert into public.club_programme(club_id,source_key,session_date,session_name,start_time,
    event_type,division,partner_search_enabled,confirmation_required,publication_status,notes,source_url)
  select h.id,'os-programme:'||d.day||':'||d.title,d.day,d.title,d.starts,d.kind,d.division,
    d.starts is not null and d.kind <> 'Club event', d.starts is null,
    case when d.starts is null then 'Start time unconfirmed' else 'Published' end,d.notes,d.source
  from otago_dates d join otago_hosts h using(num)
  where not exists(select from public.club_programme p where p.club_id=h.id and p.session_date=d.day
    and (p.session_name=d.title or p.start_time=d.starts))
    and not exists(select from public.session_overrides o where o.club_id=h.id and o.override_date=d.day
      and (o.override_type='CANCEL' or o.start_time=d.starts or o.session_name=d.title))
    and not exists(select from public.session_templates t where t.club_id=h.id and t.is_current
      and trim(t.day_of_week::text)=trim(to_char(d.day,'Day')) and (t.start_time=d.starts or t.session_name=d.title))
  on conflict do nothing returning *
)
insert into public.session_overrides(club_id,session_template_id,override_date,override_type,session_name,start_time,location_type)
  select club_id,null,session_date,'ADD',session_name,start_time,
    case event_type when 'Tournament' then 'Tournaments' when 'Online' then 'Online' else 'Club' end
  from added where partner_search_enabled;
commit;

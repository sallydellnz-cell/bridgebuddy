"use client";

import { supabase } from "@/lib/supabase";
import React, { useEffect, useMemo, useState } from "react";
import { loadCsv } from "../lib/loadCsv";

const initialRequests: any[] = [];

type Session = any;
type Player = any;
type PartnerRequest = (typeof initialRequests)[0];

function Badge({ children }: { children: React.ReactNode }) {
  return <span style={styles.badge}>{children}</span>;
}

function Button({
  children,
  onClick,
  secondary = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  secondary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={secondary ? styles.buttonSecondary : styles.button}
    >
      {children}
    </button>
  );
}

function Nav({
  view,
  setView,
    notifications,
    unreadNotifications,
    myMatches,
    matchCount,
}: {
  view: string;
  setView: (view: string) => void;
  notifications: any[];
  unreadNotifications: any[];
  myMatches: any[];
  matchCount: number;
})
{
  return (
    <div
      style={{
        display: "flex",
        gap: "15px",
        marginBottom: "25px",
      }}
    >
      <Button secondary={view !== "home"} onClick={() => setView("home")}>
        Home
      </Button>

      <Button secondary={view !== "sessions"} onClick={() => setView("sessions")}>
        Sessions
      </Button>

      <Button secondary={view !== "matches"} onClick={() => setView("matches")}>
        Matches {matchCount > 0 ? `(${matchCount})` : ""}
      </Button>

      <Button
        secondary={view !== "notifications"}
        onClick={() => setView("notifications")}
      >
        Notifications {unreadNotifications.length > 0 ? `(${unreadNotifications.length})` : ""}
      </Button>

      <Button secondary={view !== "directory"} onClick={() => setView("directory")}>
        Directory
      </Button>

    </div>
  );
}

function Card({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{ ...styles.card, cursor: onClick ? "pointer" : "default" }}
    >
      {children}
    </div>
  );
}

function getPlayer(playerId: string) {
  return csvMembers.find((player: any) => player.member_id === playerId);
}

function getRequestCount(sessionId: string, requests: PartnerRequest[]) {
  return requests.filter(
    (request) => request.sessionId === sessionId && request.status === "Open"
  ).length;
}

function calculateMatchScore(player: Player, session: Session) {
  let score = 50;

  if (player.clubs.includes(session.clubName)) score += 25;
  if (session.clubName === "RealBridge Online") score += 20;
  if (["Intermediate", "Advanced", "Open level"].includes(player.level)) score += 15;

  return Math.min(score, 100);
}

export default function BridgeBuddy() {
  const [supabaseSessions, setSupabaseSessions] = useState<any[]>([]);
  const [supabaseRequests, setSupabaseRequests] = useState<any[]>([]);
  const [supabaseInterests, setSupabaseInterests] = useState<any[]>([]);
  const [supabaseMatches, setSupabaseMatches] = useState<any[]>([]);
  const [myMatchesDisplay, setMyMatchesDisplay] = useState<any[]>([]);

  async function refreshSupabaseData() {
    const { data, error } = await supabase
      .from("session_cards_display")
      .select("*")
      .order("session_date", { ascending: true })
      .order("start_time", { ascending: true });

    const { data: requestData, error: requestError } = await supabase
      .from("session_players_looking_display")
      .select("*")
      .order("created_at", { ascending: true });

    const { data: interestsData, error: interestsError } = await supabase
      .from("interests")
      .select("*")
      .order("created_at", { ascending: true });

    const { data: matchesData, error: matchesError } = await supabase
      .from("matches")
      .select("*")
      .order("created_at", { ascending: true });

    const { data: myMatchesData, error: myMatchesError } = await supabase
      .from("my_matches_display")
      .select("*");

    console.log("Supabase sessions:", data);
    console.log("Supabase error:", error);
    console.log("Supabase requests:", requestData);
    console.log("Supabase request error:", requestError);
    console.log("Supabase interests:", interestsData);
    console.log("Supabase interests error:", interestsError);
    console.log("Supabase matches:", matchesData);
    console.log("Supabase matches error:", matchesError);
    console.log("My matches display:", myMatchesData);
    console.log("My matches display error:", myMatchesError);

    if (data) setSupabaseSessions(data);
    if (requestData) setSupabaseRequests(requestData);
    if (interestsData) setSupabaseInterests(interestsData);
    if (matchesData) setSupabaseMatches(matchesData);
    if (myMatchesData) setMyMatchesDisplay(myMatchesData);
  }

  useEffect(() => {
    refreshSupabaseData();
  }, []);

  const [csvSessions, setCsvSessions] = useState<any[]>([]);
  const [csvSessionTypes, setCsvSessionTypes] = useState<any[]>([]);
  const [csvMembers, setCsvMembers] = useState<any[]>([]);
  const [profileEmail, setProfileEmail] = useState("");
  const [foundMembers, setFoundMembers] = useState<any[]>([]);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState(""); 
  const [csvLevels, setCsvLevels] = useState<any[]>([]);
  const [csvSystems, setCsvSystems] = useState<any[]>([]);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [currentMember, setCurrentMember] = useState<any>(null);

React.useEffect(() => {
  loadCsv("/sessions.csv").then((data: any) => {
    setCsvSessions(data);
  });

  loadCsv("/session_types.csv").then((data: any) => {
    setCsvSessionTypes(data);
  });

  loadCsv("/members.csv").then((data: any) => {
    setCsvMembers(data);
  });

  loadCsv("/levels.csv").then((data: any) => {
    setCsvLevels(data);
  });

  loadCsv("/systems.csv").then((data: any) => {
    setCsvSystems(data);
  });

}, []);

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [requests, setRequests] = useState<PartnerRequest[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("bridgebuddy_requests");
    return saved ? JSON.parse(saved) : [];
  });
  React.useEffect(() => {
    localStorage.setItem("bridgebuddy_requests", JSON.stringify(requests));
  }, [requests]);
  const [interestRequests, setInterestRequests] = useState<any[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("bridgebuddy_interests");
    return saved ? JSON.parse(saved) : [];
  });

  React.useEffect(() => {
    localStorage.setItem(
      "bridgebuddy_interests",
      JSON.stringify(interestRequests)
    );
  }, [interestRequests]);
  const [matches, setMatches] = useState<any[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("bridgebuddy_matches");
    return saved ? JSON.parse(saved) : [];
  });

  React.useEffect(() => {
    localStorage.setItem("bridgebuddy_matches", JSON.stringify(matches));
  }, [matches]);
  const [profileToView, setProfileToView] = useState<any>(null);
  const [matchToCancel, setMatchToCancel] = useState<any>(null);
  const [matchCancelReason, setMatchCancelReason] = useState("");
  const [notifications, setNotifications] = useState<any[]>(() => {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem("bridgebuddy_notifications");
    return saved ? JSON.parse(saved) : [];
  });

  React.useEffect(() => {
    localStorage.setItem(
      "bridgebuddy_notifications",
      JSON.stringify(notifications)
    );
  }, [notifications]);

  
  const [selectedProfileMember, setSelectedProfileMember] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [showSystemCard, setShowSystemCard] = useState(false);
  const [view, setView] = useState("landing");

  React.useEffect(() => {
    if (view === "notifications" && currentMember) {
      setNotifications((current) =>
        current.map((notification: any) =>
          String(notification.memberId) === String(currentMember.member_id)
            ? { ...notification, read: true }
            : notification
        )
      );
    }
  }, [view, currentMember]);

  const myNotifications = notifications.filter(
    (notification: any) =>
      String(notification.memberId) === String(currentMember?.member_id)
  );

  const unreadNotifications = notifications.filter(
    (notification: any) =>
      String(notification.memberId) === String(currentMember?.member_id) &&
      notification.read === false
  );
    const myMatches = supabaseMatches.filter(
      (match: any) =>
        String(match.requester_nz_bridge_number) === String(currentMember?.member_id) ||
        String(match.partner_nz_bridge_number) === String(currentMember?.member_id)
    );
    const [matchFilters, setMatchFilters] = useState<string[]>(["matched"]);
    const [matchSort, setMatchSort] = useState("date");
    const [sessionLocationFilters, setSessionLocationFilters] = useState<string[]>(["Club", "Online"]);
    const [isSessionFilterOpen, setIsSessionFilterOpen] = useState(false);
    const [sessionDayFilters, setSessionDayFilters] = useState<string[]>([
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ]);
    const [isSessionDayFilterOpen, setIsSessionDayFilterOpen] = useState(false);
    const sessionDayFilterRef = React.useRef<HTMLDetailsElement | null>(null);
    const sessionFilterRef = React.useRef<HTMLDetailsElement | null>(null);
    const [isMatchFilterOpen, setIsMatchFilterOpen] = useState(false);
    const matchFilterRef = React.useRef<HTMLDetailsElement | null>(null);

    const activeMatchFilters = matchFilters;

    const uniqueMatches = myMatches.filter(
      (match: any, index: number, array: any[]) =>
        index ===
        array.findIndex((item: any) => {
          const matchPlayers = [
            match.requester_nz_bridge_number,
            match.partner_nz_bridge_number,
          ]
            .sort()
            .join("-");

          const itemPlayers = [
            item.requester_nz_bridge_number,
            item.partner_nz_bridge_number,
          ]
            .sort()
            .join("-");

          return (
            String(item.session_instance_id) === String(match.session_instance_id) &&
            itemPlayers === matchPlayers &&
            item.match_status === match.match_status
          );
        })
    );

    const filteredMatches = uniqueMatches.filter((match: any) => {
    const session = supabaseSessions.find(
      (session: any) =>
        String(session.session_instance_id) === String(match.session_instance_id)
    );

    if (!session) return false;

    const sessionDate = new Date(session?.session_date + "T00:00:00");
    const isPast = sessionDate < new Date();

    if (
      activeMatchFilters.includes("matched") &&
      match.match_status === "Active" &&
      !isPast
    ) {
      return true;
    }

    if (
      activeMatchFilters.includes("past") &&
      match.match_status === "Active" &&
      isPast
    ) {
      return true;
    }

    if (
      activeMatchFilters.includes("cancelled") &&
      match.match_status === "Cancelled"
    ) {
      return true;
    }

    return false;
  });

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        matchFilterRef.current &&
        !matchFilterRef.current.contains(event.target as Node)
      ) {
        setIsMatchFilterOpen(false);
      }

      if (
        sessionDayFilterRef.current &&
        !sessionDayFilterRef.current.contains(event.target as Node)
      ) {
        setIsSessionDayFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const sortedMatches = [...filteredMatches].sort((a: any, b: any) => {
    if (matchSort === "name") {
      const aPartnerId =
        String(a.player1Id) === String(currentMember?.member_id)
          ? a.player2Id
          : a.player1Id;

      const bPartnerId =
        String(b.player1Id) === String(currentMember?.member_id)
          ? b.player2Id
          : b.player1Id;

      const aPartner = csvMembers.find(
        (member: any) => String(member.member_id) === String(aPartnerId)
      );

      const bPartner = csvMembers.find(
        (member: any) => String(member.member_id) === String(bPartnerId)
      );

      return `${aPartner?.first_name || ""} ${aPartner?.last_name || ""}`.localeCompare(
        `${bPartner?.first_name || ""} ${bPartner?.last_name || ""}`
      );
    }

    const aSession = csvSessions.find(
      (session: any) => String(session.session_id) === String(a.sessionId)
    );

    const bSession = csvSessions.find(
      (session: any) => String(session.session_id) === String(b.sessionId)
    );

    return (
      new Date(aSession?.date || 0).getTime() -
      new Date(bSession?.date || 0).getTime()
    );
  });

  console.log(view);
  const [sessionTypeFilters, setSessionTypeFilters] = useState<string[]>([]);
  const [sessionNameFilters, setSessionNameFilters] = useState<string[]>([]);
  const [clubFilter, setClubFilter] = useState("All clubs");
  const [directoryAvailabilityFilter, setDirectoryAvailabilityFilter] =
    useState("All");
  const [directoryLevelFilter, setDirectoryLevelFilter] = useState("All");
  const [selectedSystems, setSelectedSystems] = useState<string[]>([]);
  const [requestType, setRequestType] = useState("One off");
  const [wantedLevel, setWantedLevel] = useState("");
  const [wantedSystems, setWantedSystems] = useState<string[]>([]);
  const [showRequestTypeModal, setShowRequestTypeModal] = useState(false);

  const filteredSessions = supabaseSessions
    .filter((session: any) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return new Date(session.session_date + "T00:00:00") >= today;
      })
    .filter((session: any) =>
      sessionLocationFilters.includes(session.location_type)
    )
    .filter((session: any) =>
      sessionDayFilters.includes(
        new Date(session.session_date).toLocaleDateString("en-NZ", {
          weekday: "long",
        })
      )
    )
    .filter((session: any) =>
      sessionTypeFilters.length === 0 ||
      sessionTypeFilters.includes(session.location_type)
    )
    .filter((session: any) =>
      sessionNameFilters.length === 0 ||
      sessionNameFilters.includes(session.session_name)
    )
    .sort(
      (a: any, b: any) =>
        new Date(a.session_date).getTime() - new Date(b.session_date).getTime()
    );

  const selectedSession = csvSessions.find(
    (session) => session.id === selectedSessionId
  );

  const sessionRequests = supabaseRequests.filter((request: any) => {
    return String(request.session_instance_id) === String(selectedSessionId);
  });
  
  const uniqueSessionRequests = sessionRequests.filter(
    (request: any, index: number, array: any[]) =>
      index ===
      array.findIndex(
        (item: any) =>
          String(item.session_instance_id) === String(request.session_instance_id) &&
          String(item.nz_bridge_number) === String(request.nz_bridge_number)
      )
  );

  uniqueSessionRequests.sort((a: any, b: any) => {
    const aIsMe =
      String(a.nz_bridge_number) === String(currentMember?.member_id);

    const bIsMe =
      String(b.nz_bridge_number) === String(currentMember?.member_id);

    if (aIsMe && !bIsMe) return -1;
    if (!aIsMe && bIsMe) return 1;

    return 0;
  });

  const myRequest = sessionRequests.find(
    (request: any) =>
      String(request.nz_bridge_number) === String(currentMember?.member_id)
  );

  const suggestedPlayers = useMemo(() => {
    if (!selectedSession) return [];

    const requestPlayerIds = sessionRequests.map((request) => request.nz_bridge_number);

    return csvMembers.filter((player: any) => {
      const isAlreadyRequesting = requestPlayerIds.includes(player.id);
      const matchesClub =
        clubFilter === "All clubs" ||
        player.clubs.includes(selectedSession.clubName);

      return !isAlreadyRequesting && matchesClub;
    });
  }, [selectedSession, sessionRequests, clubFilter]);

  const filteredDirectoryPlayers = csvMembers.filter((player: any) => {
    return player.profile_completed === "yes";
  });

  async function createRequest() {
  if (!selectedSessionId || !currentMember) return;
    const alreadyLooking = supabaseRequests.some(
      (request: any) =>
        String(request.session_instance_id) === String(selectedSessionId) &&
        String(request.nz_bridge_number) === String(currentMember.member_id) &&
        request.request_status === "Open"
    );

if (alreadyLooking) {
  alert("You are already on the looking list for this session.");
  return;
}

  const { data: insertedRequest, error: insertRequestError } = await supabase
    .from("session_requests")
    .insert({
      session_instance_id: selectedSessionId,
      nz_bridge_number: Number(currentMember.member_id),
      request_status: "Open",
      wanted_level_ids: wantedLevel
        ? wantedLevel
            .split(",")
            .map((levelName) =>
              csvLevels.find((level: any) => level.level_name === levelName)?.level_id
            )
            .filter(Boolean)
        : [],
      wanted_system_ids: wantedSystems
        .map((systemName) =>
          csvSystems.find((system: any) => system.system_name === systemName)?.system_id
        )
        .filter(Boolean),
      note: null,
    })
    .select()
    .single();

  console.log("Inserted request:", insertedRequest);
  console.log("Insert request error:", insertRequestError);

  if (insertedRequest) {
    await refreshSupabaseData();
  }

  const { data: refreshedSessions, error: refreshSessionsError } = await supabase
    .from("session_cards_display")
    .select("*")
    .order("session_date", { ascending: true })
    .order("start_time", { ascending: true });

  console.log("Refresh sessions error:", refreshSessionsError);

  if (refreshedSessions) {
    setSupabaseSessions(refreshedSessions);
  }

  const newRequest: PartnerRequest = {
    id: `${Date.now()}`,
    sessionId: selectedSessionId,
    playerId: currentMember.member_id,
    requestTypes: [requestType],
    skillWanted: wantedLevel,
    systemWanted: wantedSystems.join(", "),
    note: "Looking for a partner",
    createdAt: new Date().toISOString(),
    status: "Open",
  };

  console.log("Supabase request created successfully");
}

  function acceptRequest(requestId: string) {
    setRequests((current) =>
      current.map((request) =>
        request.id === requestId
          ? { ...request, status: "Provisional" }
          : request
      )
    );
    setShowSystemCard(true);
  }

  if (view === "completeProfile" && selectedProfileMember) {
  return (
    <main style={styles.container}>
      <div style={{ marginBottom: "24px" }}>
        <Button onClick={() => setSelectedProfileMember(null)}>
          ← Back
        </Button>
      </div>

      <Card>
        <h1 style={styles.sectionTitle}>Complete Profile</h1>

        <p style={styles.text}>
          Welcome, {selectedProfileMember.first_name} {selectedProfileMember.last_name}
        </p>

        <div style={{ marginTop: "24px" }}>

          <label style={{ display: "block", marginBottom: "8px" }}>
            Bridge level
          </label>

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
          
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "12px",
              border: "1px solid #cbd5e1",
              marginBottom: "20px",
              fontSize: "16px",
            }}
          >
          {csvLevels.map((level: any) => (
            <option key={level.level_id}>
              {level.level_name}
            </option>
          ))}

          </select>

          <label style={{ display: "block", marginBottom: "8px" }}>
            Preferred systems
          </label>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            {csvSystems.map((system: any) => (
              <label
                key={system.system_id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedSystems.includes(system.system_name)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedSystems([
                        ...selectedSystems,
                        system.system_name,
                      ]);
                    } else {
                      setSelectedSystems(
                        selectedSystems.filter(
                          (item) => item !== system.system_name
                        )
                      );
                    }
                  }}
                />

                {system.system_name}
              </label>
            ))}
          </div>

          <Button
            onClick={() => {
              if (!selectedLevel || selectedSystems.length === 0) {
                alert("Please select your level and at least one system.");
                return;
              }

            setView("sessions");
            }}
          >
            Save profile
          </Button>

        </div>

      </Card>
    </main>
  );
}

  if (view === "home") {
    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <Nav
            view={view}
            setView={setView}
            notifications={notifications}
            unreadNotifications={unreadNotifications}
            myMatches={myMatches}
            matchCount={filteredMatches.length}
          />

        </div>
      </main>
    );
  }

  if (view === "login") {
    return (
      <main style={styles.container}>

        <Card>
          <h1 style={styles.sectionTitle}>Login</h1>
          <p style={styles.text}>
            Enter your email to access your sessions.
          </p>

          <input
            type="email"
            placeholder="Enter your email"
            value={profileEmail}
            onChange={(e) => setProfileEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "12px",
              border: "1px solid #cbd5e1",
              marginBottom: "20px",
              fontSize: "16px",
            }}
          />

          <Button
            onClick={() => {
              const member = csvMembers.find(
                (member: any) =>
                  member.email?.toLowerCase().trim() ===
                  profileEmail.toLowerCase().trim()
              );

              if (!member) {
                alert("No member found with this email.");
                return;
              }

              setCurrentMember(member);
              console.log("LOGIN MEMBER:", member);
              setView("sessions");
            }}
          >
            Login
          </Button>
        </Card>
      </main>
    );
  }

  if (view === "createProfile") {
  return (
    <main style={styles.container}>
      <div style={{ marginBottom: "24px" }}>
        <Button onClick={() => setView("landing")}>
          ← Back
        </Button>
      </div>

      <Card>
        <h1 style={styles.sectionTitle}>Create Profile</h1>

        <p style={styles.text}>
          Find your club membership first, then complete your profile.
        </p>

            <input
              type="email"
              placeholder="Enter your email"
              value={profileEmail}
              onChange={(e) => setProfileEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid #cbd5e1",
                marginBottom: "20px",
                fontSize: "16px",
              }}
            />

            {foundMembers.length === 0 && (
              <Button
                onClick={() => {
                  const matches = csvMembers.filter((member: any) =>
                    member.email?.toLowerCase().trim() === profileEmail.toLowerCase().trim()
                  );

                  setFoundMembers(matches);
                }}
              >
                Find Membership
              </Button>
            )}

            {foundMembers.length > 0 && (
              <div style={{ marginTop: "24px" }}>
                <h3>Membership found</h3>

                {foundMembers.map((member: any) => (
                  <Card key={member.member_id}>
                    <div style={styles.name}>
                      {member.first_name} {member.last_name}
                    </div>

                    <div style={styles.text}>{member.clubs}</div>
                    <div style={styles.text}>Club: {member.clubs}</div>
                    <div style={styles.text}>Phone: {member.phone || "Not listed"}</div>
                    <div style={styles.smallText}>Member ID: {member.member_id}</div>

                    <Button
                      onClick={() => {
                        setVerificationSent(true);
                      }}
                    >
                      Send verification code
                    </Button>

                    {verificationSent && (
                      <div style={{ marginTop: "16px" }}>
                        <input
                          type="text"
                          placeholder="Enter verification code"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "14px",
                            borderRadius: "12px",
                            border: "1px solid #cbd5e1",
                            marginBottom: "12px",
                            fontSize: "16px",
                          }}
                        />

                        <Button
                          onClick={() => {
                            if (verificationCode === "123456") {
                              setSelectedProfileMember(member);
                            }
                          }}
                        >
                          Verify code
                        </Button>
                      </div>
                    )}

                  </Card>
                ))}
              </div>
            )}


      </Card>
    </main>
  );
}

  if (view === "sessions") {
    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <div
            style={{
              position: "sticky",
              top: 0,
              zIndex: 20,
              background: "#f8fafc",
              paddingTop: "8px",
              paddingBottom: "8px",
            }}
          >
          <Nav
            view={view}
            setView={setView}
            notifications={notifications}
            unreadNotifications={unreadNotifications}
            myMatches={myMatches}
            matchCount={filteredMatches.length}
          />

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          marginBottom: "16px",
        }}
      >

        <details
          ref={sessionFilterRef}
          open={isSessionFilterOpen}
          onToggle={(e) => setIsSessionFilterOpen(e.currentTarget.open)}
          style={{
            width: "180px",
            marginRight: "12px",
          }}
        >
          <summary
            style={{
              cursor: "pointer",
              padding: "6px 10px",
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
              background: "#f8fafc",
              color: "#475569",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            Filter sessions
          </summary>

          <div
            style={{
              padding: "10px 12px",
              border: "1px solid #cbd5e1",
              borderTop: "none",
              borderRadius: "0 0 10px 10px",
              background: "white",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {["Club", "Online"].map((location) => (
              <label key={location} style={{ display: "flex", gap: "8px" }}>
                <input
                  type="checkbox"
                  checked={sessionLocationFilters.includes(location)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSessionLocationFilters([
                        ...sessionLocationFilters,
                        location,
                      ]);
                    } else {
                      setSessionLocationFilters(
                        sessionLocationFilters.filter(
                          (item) => item !== location
                        )
                      );
                    }
                  }}
                />
                {location}
              </label>
            ))}
          </div>
        </details>

        <details
          ref={sessionDayFilterRef}
          open={isSessionDayFilterOpen}
          onToggle={(e) => setIsSessionDayFilterOpen(e.currentTarget.open)}
          style={{
            width: "180px",
          }}
        >
          <summary
            style={{
              cursor: "pointer",
              padding: "6px 10px",
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
              background: "#f8fafc",
              color: "#475569",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            Filter days
          </summary>

          <div
            style={{
              padding: "10px 12px",
              border: "1px solid #cbd5e1",
              borderTop: "none",
              borderRadius: "0 0 10px 10px",
              background: "white",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {[
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ].map((day) => (
              <label key={day} style={{ display: "flex", gap: "8px" }}>
                <input
                  type="checkbox"
                  checked={sessionDayFilters.includes(day)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSessionDayFilters([...sessionDayFilters, day]);
                    } else {
                      setSessionDayFilters(
                        sessionDayFilters.filter((item) => item !== day)
                      );
                    }
                  }}
                />
                {day}
              </label>
            ))}
          </div>
        </details>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            fontSize: "12px",
            color: "#475569",
            marginLeft: "auto",
          }}
        >
          <span>🟨 Learner</span>
          <span>🟩 Beginner</span>
          <span>🟩 Improver</span>
          <span>🟦 Intermediate</span>
          <span>🟪 Advanced</span>
          <span>🟧 Expert</span>
          <span>🟥 Open</span>
        </div>
      </div>
</div>

          {filteredSessions.map((session: any) => {
            const sessionTypeInfo = csvSessionTypes.find(
              (type: any) =>
                String(type.session_type) === String(session.session_name) &&
                String(type.day) === String(session.day)
            );

            return (
            <Card
              key={session.session_instance_id}
              onClick={() => {
                setSelectedSessionId(session.session_instance_id);
                setView("sessionDetail");
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "16px",
                }}
              >
            <div>

                <div style={{ fontSize: "16px" }}>
                  <span
                    style={{
                      color: "#4338ca",
                      fontWeight: 700,
                      fontSize: "16px",
                    }}
                  >
                    {new Date(session.session_date + "T00:00:00").toLocaleDateString("en-NZ", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                    {" · "}
                    {session.start_time?.slice(0, 5)}
                  </span>

                 <span
                    style={{
                      color: "#1e293b",
                      fontWeight: 400,
                      fontSize: "14px",
                      marginLeft: "8px",
                    }}
                  >
                    {session.session_name}
                    <span
                      style={{
                      color:
                        session.location_type === "Online"
                          ? "#16a34a"
                          : "#f59e0b",
                        fontSize: "13px",
                        marginLeft: "6px",
                      }}
                    >
                      ({session.location_type})
                    </span>
                  </span>
                </div>

                  <div
                    style={{
                      color: "#4338ca",
                      fontSize: "14px",
                      marginTop: "4px",
                    }}
                  >
                    {(() => {
                      const mySessionMatch = myMatchesDisplay.find(
                        (match: any) =>
                          String(match.session_instance_id) === String(session.session_instance_id) &&
                          String(match.member_number) === String(currentMember?.member_id)
                      );

                      if (mySessionMatch) {
                        return `You are matched with ${mySessionMatch.matched_partner_first_name} ${mySessionMatch.matched_partner_last_name}`;
                      }

                      return `${session.players_looking} ${Number(session.players_looking) === 1 ? "player" : "players"} looking`;
                    })()}
                  </div>
                </div>
                

                <div style={{ textAlign: "right" }}>
                  <div style={{ display: "flex", gap: "4px", justifyContent: "flex-end" }}>
                    {[
                      { key: "learner", color: "#facc15" },
                      { key: "beginner", color: "#86efac" },
                      { key: "improver", color: "#4ade80" },
                      { key: "intermediate", color: "#38bdf8" },
                      { key: "advanced", color: "#4f46e5" },
                      { key: "expert", color: "#f97316" },
                      { key: "open", color: "#dc2626" },
                    ].map((level) => (
                      <div
                        key={level.key}
                        title={level.key}
                        style={{
                          width: "22px",
                          height: "8px",
                          borderRadius: "3px",
                          background:
                            session.suitable_levels
                              ?.toLowerCase()
                              .includes(level.key)
                              ? level.color
                              : "#e5e7eb",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Card>
              );
            })}
        </div>
      </main>
    );
  }

    if (view === "sessionDetail") {
      const selectedSession = supabaseSessions.find(
        (session: any) => session.session_instance_id === selectedSessionId
      );

    if (!selectedSession) {
      return (
        <main style={styles.container}>
          <Card>Session not found.</Card>
        </main>
      );
    }

    const myActiveMatch = myMatchesDisplay.find(
      (match: any) =>
        String(match.session_instance_id) === String(selectedSessionId) &&
        String(match.member_number) === String(currentMember?.member_id) &&
        match.match_status === "Active"
    );

    const mySessionMatchDisplay = myMatchesDisplay.find(
      (match: any) =>
        String(match.session_instance_id) === String(selectedSessionId) &&
        String(match.member_number) === String(currentMember?.member_id)
    );

    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <div style={{ marginBottom: "24px" }}>
            <Button onClick={() => setView("sessions")}>
              ← Back
            </Button>
          </div>

          <Card>        
            <div
              style={{
                color: "#334155",
                fontWeight: 400,
                fontSize: "14px",
                marginBottom: "16px",
              }}
            >
                {new Date(selectedSession.session_date + "T00:00:00").toLocaleDateString("en-NZ", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
                {", "}
                {selectedSession.start_time?.slice(0, 5)}
              </div>

              {myActiveMatch ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 180px",
                    gap: "16px",
                    alignItems: "center",
                  }}
                >
                  <Card
                    onClick={() => {
                      setProfileToView({
                        member_id: mySessionMatchDisplay?.matched_partner_number,
                        first_name: mySessionMatchDisplay?.matched_partner_first_name,
                        last_name: mySessionMatchDisplay?.matched_partner_last_name,
                      });
                    }}
                  >
                    <div style={styles.name}>
                      {mySessionMatchDisplay?.matched_partner_first_name}{" "}
                      {mySessionMatchDisplay?.matched_partner_last_name}
                    </div>

                    <div style={styles.smallText}>
                      You are matched for this session.
                    </div>
                  </Card>
                  <button
                      onClick={() => {
                        setMatchToCancel(mySessionMatchDisplay);
                      }}
                    style={{
                      background: "#e0f2f4",
                      color: "#064e5f",
                      border: "none",
                      borderRadius: "10px",
                      padding: "14px 24px",
                      minWidth: "180px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Cancel Match
                  </button>
                </div>
              ) : myRequest ? (

<></>


            ) : (

            <div
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
                maxWidth: "480px",
              }}
            >
              <Button
                secondary={true}
                onClick={() => {
                  setShowRequestTypeModal(true);
                }}
              >
                Add me to looking list
              </Button>

              <Button
                secondary={true}
                onClick={() => {}}
              >
                Add me as standby
              </Button>
            </div>      
            )}
       
            <div style={{ marginTop: "24px", display: myActiveMatch ? "none" : "block" }}>
              <h2 style={styles.sectionTitle}>Players looking</h2>

              {uniqueSessionRequests.length === 0 && (
                <p style={styles.text}>No one is looking for a partner yet.</p>
              )}

              {uniqueSessionRequests.map((request: any) => {
                const player = {
                  first_name: request.first_name,
                  last_name: request.last_name,
                  level: request.level_name,
                };

                const interestedPlayers = supabaseInterests.filter(
                  (interest: any) =>
                    Number(interest.request_id) === Number(request.request_id) &&
                    interest.interest_status === "Pending"
                );
                console.log("Interested players for request", request.request_id, interestedPlayers);

                return (
                  <div
                    key={request.request_id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 180px",
                      gap: "16px",
                      alignItems: "center",
                      marginBottom: "16px",
                    }}
                  >
                   
                    <Card>
                    <div style={styles.name}>
                      {player?.first_name} {player?.last_name}
                        {String(request.nz_bridge_number) === String(currentMember?.member_id) && " (You)"}
                      <span
                        style={{
                          color: "#64748b",
                          fontSize: "14px",
                          fontWeight: 400,
                          marginLeft: "6px",
                        }}
                      >
                        {request.level_name || "Level not completed"}
                      </span>
                    </div>

                    <div style={styles.smallText}>
                      Preferred partner levels: <strong>{request.wanted_levels}</strong>
                    </div>

                    <div style={styles.smallText}>
                      Preferred partner systems: <strong>{request.wanted_systems}</strong>
                    </div>

                    {request.note && (
                      <div style={styles.smallText}>
                        Note: <strong>{request.note}</strong>
                      </div>
                    )}

                    {String(request.nz_bridge_number) === String(currentMember?.member_id) && (
                      <div style={{ marginTop: "16px" }}>
                        {interestedPlayers.length > 0 && (
                          <div style={styles.text}>
                            Interested players:
                          </div>
                        )}

                        {interestedPlayers.length === 0 && (
                          <div style={styles.smallText}>
                            No interested players yet.
                          </div>
                        )}

                        {interestedPlayers.map((interest: any) => {
                          const interestedPlayer = csvMembers.find(
                            (member: any) =>
                              String(member.member_id) === String(interest.interested_nz_bridge_number)
                          );

                          console.log("Interest row:", interest);
                          console.log("Interested player found:", interestedPlayer);

                          return (
                            <div key={interest.interest_id} style={{ marginTop: "12px" }}>
                              <div style={styles.name}>
                                {interestedPlayer?.first_name} {interestedPlayer?.last_name}
                              </div>

                              <div style={styles.text}>
                                {interestedPlayer?.level || "Level not completed"}
                              </div>

                              <div style={styles.text}>
                                Systems: {interestedPlayer?.systems || "Systems not completed"}
                              </div>

                              <div style={styles.buttonRow}>
                                <Button
                                  secondary={true}
                                  onClick={() => {
                                    setProfileToView(interestedPlayer);
                                  }}
                                >
                                  View Profile
                                </Button>

                                <Button
                                  secondary={true}
                                  onClick={() => {
                                  }}
                                >
                                  Chat
                                </Button>

                                <Button
                                  secondary={true}
                                  onClick={async () => {
                                    const { error: updateRequestError } = await supabase
                                      .from("session_requests")
                                      .update({
                                        request_status: "Matched",
                                      })
                                      .eq("request_id", request.request_id);

                                    console.log("Update request error:", updateRequestError);

                                    const { error: updateAcceptedInterestError } = await supabase
                                      .from("interests")
                                      .update({
                                        interest_status: "Accepted",
                                      })
                                      .eq("interest_id", interest.interest_id);

                                    console.log("Update accepted interest error:", updateAcceptedInterestError);

                                    const { error: closeOtherInterestsError } = await supabase
                                      .from("interests")
                                      .update({
                                        interest_status: "Closed",
                                      })
                                      .eq("request_id", request.request_id)
                                      .neq("interest_id", interest.interest_id)
                                      .eq("interest_status", "Pending");

                                    console.log("Close other interests error:", closeOtherInterestsError);

                                    if (!updateRequestError && !updateAcceptedInterestError && !closeOtherInterestsError) {
                                      setSupabaseRequests((current) =>
                                        current.map((item: any) =>
                                          Number(item.request_id) === Number(request.request_id)
                                            ? { ...item, request_status: "Matched" }
                                            : item
                                        )
                                      );

                                      setSupabaseInterests((current) =>
                                        current.map((item: any) => {
                                          if (Number(item.interest_id) === Number(interest.interest_id)) {
                                            return { ...item, interest_status: "Accepted" };
                                          }

                                          if (
                                            Number(item.request_id) === Number(request.request_id) &&
                                            item.interest_status === "Pending"
                                          ) {
                                            return { ...item, interest_status: "Closed" };
                                          }

                                          return item;
                                        })
                                      );
                                    }

                                   const newMatch = {
                                      id: Date.now().toString(),
                                      sessionId: selectedSessionId,
                                      player1Id: request.nz_bridge_number,
                                      player2Id: interest.interested_nz_bridge_number,
                                      status: "Matched",
                                      matchedBy: currentMember?.member_id,
                                      matchedAt: new Date().toISOString(),
                                    };

                                    const { data: insertedMatch, error: insertMatchError } = await supabase
                                      .from("matches")
                                      .insert({
                                        session_instance_id: selectedSessionId,
                                        request_id: request.request_id,
                                        requester_nz_bridge_number: request.nz_bridge_number,
                                        partner_nz_bridge_number: interest.interested_nz_bridge_number,
                                        match_status: "Active",
                                        interest_id: interest.interest_id,
                                      })
                                      .select()
                                      .single();

                                    console.log("Inserted match:", insertedMatch);
                                    console.log("Insert match error:", insertMatchError);

                                    setMatches((current) => [
                                      newMatch,
                                      ...current,
                                    ]);

                                    setNotifications((current) => [
                                      {
                                        id: `${Date.now()}-accepted`,
                                        memberId: interest.fromMemberId,
                                        sessionId: selectedSessionId,
                                        type: "InterestAccepted",
                                        message: `Matched with ${currentMember?.first_name} ${currentMember?.last_name}`,
                                        createdAt: new Date().toISOString(),
                                        read: false,
                                      },
                                      ...current,
                                    ]);
                                    await refreshSupabaseData();
                                  }}
                                >
                                  Accept
                                </Button>

                                <Button
                                  secondary={true}
                                  onClick={() => {
                                    setInterestRequests((current) =>
                                      current.map((item) =>
                                        item.id === interest.id
                                          ? {
                                              ...item,
                                              status: "Declined",
                                              declinedBy: currentMember?.member_id,
                                              declinedAt: new Date().toISOString(),
                                            }
                                          : item
                                      )
                                    );
                                    setNotifications((current) => [
                                      {
                                        id: `${Date.now()}-declined`,
                                        memberId: interest.fromMemberId,
                                        sessionId: selectedSessionId,
                                        type: "InterestDeclined",
                                        message: `Declined by ${currentMember?.first_name} ${currentMember?.last_name}`,
                                        createdAt: new Date().toISOString(),
                                        read: false,
                                      },
                                      ...current,
                                    ]);
                                  }}
                                >
                                  Decline
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {String(request.nz_bridge_number) !== String(currentMember?.member_id) && (() => {
                      const alreadyMatchedForSession = matches.some(
                        (match: any) =>
                          String(match.sessionId) === String(selectedSessionId) &&
                          match.match_status === "Active" &&
                          (
                            String(match.player1Id) === String(currentMember?.member_id) ||
                            String(match.player2Id) === String(currentMember?.member_id)
                          )
                      );
                      const alreadyInterested = interestRequests.some(
                        (interest: any) =>
                          String(interest.fromMemberId) === String(currentMember?.member_id) &&
                          String(interest.toMemberId) === String(request.playerId) &&
                          String(interest.sessionId) === String(selectedSessionId) &&
                          interest.status !== "Cancelled" &&
                          interest.status !== "Closed"
                      );

                    return null
                    })()}
                  </Card>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      minWidth: "180px",
                    }}
                  >
                        {supabaseInterests.some((interest: any) =>
                          Number(interest.interested_nz_bridge_number) === Number(currentMember?.member_id) &&
                          Number(interest.request_id) === Number(request.request_id) &&
                          interest.interest_status === "Pending"
                        ) && (
                        <button
                          style={{
                            background: "#e0f2f4",
                            color: "#064e5f",
                            border: "none",
                            borderRadius: "10px",
                            padding: "14px 24px",
                            minWidth: "180px",
                            fontWeight: 700,
                            fontSize: "15px",
                            cursor: "pointer",
                          }}
                          onClick={async () => {
                            const { error: withdrawError } = await supabase
                              .from("interests")
                              .update({
                                interest_status: "Cancelled",
                              })
                              .eq("request_id", request.request_id)
                              .eq("interested_nz_bridge_number", Number(currentMember?.member_id))
                              .eq("interest_status", "Pending");

                            console.log("Withdraw error:", withdrawError);
                          }}
                        >
                          Withdraw Interest
                        </button>
                      )}
                      
                      {String(request.nz_bridge_number) === String(currentMember?.member_id) && (
                        <button
                          style={{
                            background: "#e0f2f4",
                            color: "#064e5f",
                            border: "none",
                            borderRadius: "10px",
                            padding: "14px 24px",
                            minWidth: "180px",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                          onClick={async () => {
                            const { error: cancelRequestError } = await supabase
                              .from("session_requests")
                              .update({
                                request_status: "Cancelled",
                              })
                              .eq("request_id", request.request_id);

                            console.log("Cancel request error:", cancelRequestError);

                            if (!cancelRequestError) {
                              setSupabaseRequests((current) =>
                                current.filter(
                                  (item: any) =>
                                    Number(item.request_id) !== Number(request.request_id)
                                )
                              );
                            }
                          }}
                        >
                          Remove Me
                        </button>
                      )}

                      {String(request.nz_bridge_number) !== String(currentMember?.member_id) &&
                       !supabaseInterests.some((interest: any) =>
                          Number(interest.interested_nz_bridge_number) === Number(currentMember?.member_id) &&
                          Number(interest.request_id) === Number(request.request_id) &&
                          interest.interest_status !== "Cancelled" &&
                          interest.interest_status !== "Closed"
                      ) && (

                      <Button
                          secondary
                        onClick={async () => {
                          if (!currentMember) return;

                          const reciprocalInterest = interestRequests.find(
                            (interest: any) =>
                              String(interest.sessionId) === String(selectedSessionId) &&
                              String(interest.fromMemberId) === String(request.playerId) &&
                              String(interest.toMemberId) === String(currentMember.member_id) &&
                              interest.status !== "Cancelled" &&
                              interest.status !== "Closed" &&
                              interest.status !== "Declined"
                          );

                          const newInterest = {
                            id: Date.now().toString(),
                            sessionId: selectedSessionId,
                            fromMemberId: currentMember.member_id,
                            toMemberId: request.playerId,

                            expressedBy: currentMember.member_id,
                            expressedAt: new Date().toISOString(),

                            status: reciprocalInterest ? "Accepted" : "Pending",
                          };

                          if (reciprocalInterest) {
                            const newMatch = {
                              id: Date.now().toString(),
                              sessionId: selectedSessionId,
                              player1Id: currentMember.member_id,
                              player2Id: request.playerId,
                              status: "Matched",
                            };

                            setMatches((current) => [newMatch, ...current]);

                            setRequests((current) =>
                              current.map((item: any) =>
                                String(item.sessionId) === String(selectedSessionId) &&
                                (
                                  String(item.playerId) === String(currentMember.member_id) ||
                                  String(item.playerId) === String(request.playerId)
                                )
                                  ? { ...item, status: "Matched" }
                                  : item
                              )
                            );

                            setInterestRequests((current) => [
                              newInterest,
                              ...current.map((item: any) =>
                                item.id === reciprocalInterest.id
                                  ? { ...item, status: "Accepted" }
                                  : item
                              ),
                            ]);

                          } else {
                              const { data: insertedInterest, error: insertInterestError } = await supabase
                                .from("interests")
                                .insert({
                                  request_id: request.request_id,
                                  interested_nz_bridge_number: Number(currentMember.member_id),
                                  interest_status: "Pending",
                                  note: null,
                                })
                                .select()
                                .single();

                              console.log("Inserted interest:", insertedInterest);
                              console.log("Insert interest error:", insertInterestError);

                              if (insertedInterest) {
                                await refreshSupabaseData();
                              }

                            setNotifications((current) => [
                              {
                                id: Date.now().toString(),
                                memberId: request.playerId,
                                sessionId: selectedSessionId,
                                type: "InterestReceived",
                                message: `Interest from ${currentMember?.first_name} ${currentMember?.last_name}`,
                                createdAt: new Date().toISOString(),
                                read: false,
                              },
                              ...current,
                            ]);
                          }
                        }}
                      >
                        Express Interest
                      </Button>
                      )}
                  </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {matchToCancel && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(15, 23, 42, 0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "24px",
            }}
          >
            <div
              style={{
                background: "white",
                borderRadius: "20px",
                padding: "32px",
                width: "100%",
                maxWidth: "500px",
              }}
            >
              <h2 style={styles.sectionTitle}>Cancel Match</h2>

              <p style={styles.text}>
                Would you like to let your partner know why you need to cancel? This message is optional.
              </p>

              <textarea
                value={matchCancelReason}
                onChange={(e) => setMatchCancelReason(e.target.value)}
                style={{
                  width: "100%",
                  minHeight: "120px",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #d1d5db",
                  marginBottom: "16px",
                }}
              />

              <div style={{ display: "flex", gap: "12px" }}>
                <Button
                  secondary
                  onClick={() => {
                    setMatchToCancel(null);
                    setMatchCancelReason("");
                  }}
                >
                  Close
                </Button>
                <Button
                  secondary={true}
                  onClick={async () => {
                    const { error: cancelMatchError } = await supabase
                      .from("matches")
                      .update({
                        match_status: "Cancelled",
                        note: matchCancelReason,
                      })
                      .eq("match_id", matchToCancel.match_id);

                    console.log("Cancel match error:", cancelMatchError);

                    if (!cancelMatchError) {
                      await refreshSupabaseData();

                      setMatchToCancel(null);
                      setMatchCancelReason("");
                    }
                  }}
                >
                  Submit Cancellation
                </Button>
              </div>
            </div>
          </div>
        )}

        {profileToView && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(15, 23, 42, 0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "24px",
            }}
          >
            <div
              style={{
                background: "white",
                borderRadius: "20px",
                padding: "32px",
                width: "100%",
                maxWidth: "460px",
                boxShadow: "0 24px 80px rgba(15, 23, 42, 0.25)",
              }}
            >
              <h2 style={styles.sectionTitle}>
                {profileToView.first_name} {profileToView.last_name}
              </h2>

              <div style={styles.text}>
                Level: {profileToView.level || "Not completed"}
              </div>

              <div style={styles.text}>
                Systems: {profileToView.systems || "Not completed"}
              </div>

              <div style={styles.text}>
                Club: {profileToView.clubs || "Not listed"}
              </div>

              <div style={{ marginTop: "24px" }}>
                <Button onClick={() => setProfileToView(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

         {showRequestTypeModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(15, 23, 42, 0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "24px",
            }}
          >
            <div
              style={{
                background: "white",
                borderRadius: "20px",
                padding: "32px",
                width: "100%",
                maxWidth: "460px",
                boxShadow: "0 24px 80px rgba(15, 23, 42, 0.25)",
              }}
            >
              <h2 style={styles.sectionTitle}>What are you looking for?</h2>

              <div
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  background: "#f1f5f9",
                  marginBottom: "20px",
                }}
              >
                <div style={styles.smallText}>My profile</div>
                <div style={styles.text}>
                  Level: {currentMember?.level || "Not completed"}
                </div>
                <div style={styles.text}>
                  Systems: {currentMember?.systems || "Not completed"}
                </div>
              </div>

              <label style={{ display: "block", marginBottom: "16px", fontSize: "18px" }}>
                <input
                  type="radio"
                  name="requestType"
                  value="One off"
                  checked={requestType === "One off"}
                  onChange={(e) => setRequestType(e.target.value)}
                />
                {" "}One Off Partner
              </label>

              <label style={{ display: "block", marginBottom: "24px", fontSize: "18px" }}>
                <input
                  type="radio"
                  name="requestType"
                  value="Regular"
                  checked={requestType === "Regular"}
                  onChange={(e) => setRequestType(e.target.value)}
                />
                {" "}Regular Partner
              </label>

              <label style={{ display: "block", marginBottom: "8px", fontSize: "16px" }}>
                Partner level wanted
              </label>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  marginBottom: "20px",
                }}
              >
                {csvLevels.map((level: any) => (
                  <label
                    key={level.level_id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={wantedLevel.split(",").includes(level.level_name)}
                      onChange={(e) => {
                        const current = wantedLevel
                          ? wantedLevel.split(",")
                          : [];

                        if (e.target.checked) {
                          setWantedLevel(
                            [...current, level.level_name].join(",")
                          );
                        } else {
                          setWantedLevel(
                            current
                              .filter((item) => item !== level.level_name)
                              .join(",")
                          );
                        }
                      }}
                    />

                    {level.level_name}
                  </label>
                ))}
              </div>

              <label style={{ display: "block", marginBottom: "8px", fontSize: "16px" }}>
                Partner systems wanted
              </label>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  marginBottom: "20px",
                }}
              >
                {csvSystems.map((system: any) => (
                  <label
                    key={system.system_id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={wantedSystems.includes(system.system_name)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setWantedSystems([
                            ...wantedSystems,
                            system.system_name,
                          ]);
                        } else {
                          setWantedSystems(
                            wantedSystems.filter(
                              (item) => item !== system.system_name
                            )
                          );
                        }
                      }}
                    />

                    {system.system_name}
                  </label>
                ))}
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <Button
                  onClick={() => {
                    createRequest();
                    setShowRequestTypeModal(false);
                  }}
                >
                  Confirm
                </Button>

                <Button
                  onClick={() => setShowRequestTypeModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

      </main>
    );
  }

  if (view === "matches") {
    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <Nav
            view={view}
            setView={setView}
            notifications={notifications}
            unreadNotifications={unreadNotifications}
            myMatches={myMatches}
            matchCount={filteredMatches.length}
          />

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "20px",
              marginBottom: "16px",
            }}
          >

          <details
            ref={matchFilterRef}
            open={isMatchFilterOpen}
            onToggle={(e) => setIsMatchFilterOpen(e.currentTarget.open)}
            style={{
              marginBottom: "16px",
              width: "220px",
            }}
          >
            <summary
              style={{
                width: "220px",
                cursor: "pointer",
                padding: "8px 12px",
                border: "1px solid #cbd5e1",
                borderRadius: "10px",
                background: "#f8fafc",
                color: "#475569",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              Filter matches
            </summary>

            <div
              style={{
                padding: "10px 12px",
                border: "1px solid #cbd5e1",
                borderTop: "none",
                borderRadius: "0 0 10px 10px",
                background: "white",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {[
                { value: "matched", label: "Matched" },
                { value: "past", label: "Past" },
                { value: "cancelled", label: "Cancelled" },
              ].map((filter) => (
                <label key={filter.value} style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="checkbox"
                    checked={matchFilters.includes(filter.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setMatchFilters([...matchFilters, filter.value]);
                      } else {
                        setMatchFilters(
                          matchFilters.filter((item) => item !== filter.value)
                        );
                      }
                    }}
                  />
                  {filter.label}
                </label>
              ))}
            </div>
          </details>

            <select
              value={matchSort}
              onChange={(e) => setMatchSort(e.target.value)}
              style={{
                padding: "10px 10px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                background: "#f8fafc",
                color: "#334155",
                width: "220px",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              <option value="date">Sort by: Date</option>
              <option value="name">Sort by: Name</option>
            </select>
          </div>      

          {myMatches.length === 0 && (
            <Card>
              <p style={styles.text}>You do not have any matches yet.</p>
            </Card>
          )}

          {myMatches.length > 0 && sortedMatches.length === 0 && (
            <Card>
              <p style={styles.text}>No matches match the selected filters.</p>
            </Card>
          )}

          {sortedMatches.map((match: any, index: number) => {
            const partnerId =
              String(match.requester_nz_bridge_number) === String(currentMember?.member_id)
                ? match.partner_nz_bridge_number
                : match.requester_nz_bridge_number;

            const partner = csvMembers.find(
              (member: any) => String(member.member_id) === String(partnerId)
            );

            const session = supabaseSessions.find(
              (session: any) =>
                String(session.session_instance_id) === String(match.session_instance_id)
            );

            return (
              <div
                key={`${match.id}-${match.player1Id}-${match.player2Id}-${match.sessionId}-${index}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 180px",
                    gap: "16px",
                    alignItems: "center",
                    marginBottom: "16px",
                  }}
              >
                <Card onClick={() => setProfileToView(partner)}>
                  <div style={styles.smallText}>
                    {new Date(session?.session_date).toLocaleDateString("en-NZ", {
                      day: "numeric",
                      month: "short",
                    })}
                    {" ("}
                    {new Date(session?.session_date).toLocaleDateString("en-NZ", {
                      weekday: "short",
                    })}
                    {") - "}
                    {session?.start_time}
                    {" - "}
                    {session?.session_name || "Session"}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "10px",
                    }}
                  >
                    <div
                      style={{
                        color: "#4338ca",
                        fontWeight: 700,
                        fontSize: "18px",
                      }}
                    >
                      {partner?.first_name} {partner?.last_name}
                    </div>

                    <span style={styles.badge}>{match.status}</span>
                  </div>
                </Card>

                  <div>
                    {match.match_status === "Active" &&
                      new Date(session?.session_date) >= new Date() && (
                      <button
                        style={styles.matchButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          setMatchToCancel(match);
                        }}
                      >
                        Cancel Partnership
                      </button>
                    )}
                  </div>
              </div>
            );
          })}
        </div>

       {matchToCancel && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(15, 23, 42, 0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
                padding: "24px",
            }}
          >
            <div
              style={{
                background: "white",
                borderRadius: "20px",
                padding: "32px",
                width: "100%",
                maxWidth: "460px",
                boxShadow: "0 24px 80px rgba(15, 23, 42, 0.25)",
              }}
            >

            <h2 style={styles.sectionTitle}>
              Cancel Match
            </h2>

            <p style={styles.text}>
              Would you like to let your partner know why you need to cancel? This message is optional.
            </p>

            <textarea
              value={matchCancelReason}
              onChange={(e) => setMatchCancelReason(e.target.value)}
              style={{
                width: "100%",
                minHeight: "120px",
                padding: "12px",
                borderRadius: "12px",
                border: "1px solid #cbd5e1",
                marginBottom: "24px",
                fontSize: "14px",
              }}
            />

            <div style={{ display: "flex", gap: "12px" }}>
              <Button
                secondary={true}
                onClick={() => {
                  setMatchToCancel(null);
                  setMatchCancelReason("");
                }}
              >
                Close
              </Button>

              <Button secondary={true}>
                Submit Cancellation
              </Button>
            </div>
            </div>
          </div>
        )}

      </main>
    );
  }

  if (view === "notifications") {
  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <Nav
          view={view}
          setView={setView}
          notifications={notifications}
          unreadNotifications={unreadNotifications}
          myMatches={myMatches}
          matchCount={filteredMatches.length}
        />
            <div style={{ marginTop: "8px" }}></div>

        {notifications.length === 0 && (
          <Card>
            <p style={styles.text}>No notifications yet.</p>
          </Card>
        )}

        {myNotifications.map((notification: any) => {
          const session = csvSessions.find(
            (session: any) =>
              String(session.session_id) === String(notification.sessionId)
          );

          const actionTime = new Date(notification.createdAt).toLocaleString("en-NZ", {
            day: "numeric",
            month: "short",
            hour: "numeric",
            minute: "2-digit",
          });

          return (
            <div
              key={notification.id}
              style={{
                ...styles.card,
                background: notification.read === false ? "#e8f5f7" : "white",
                borderLeft:
                  notification.read === false
                    ? "4px solid #2f8f9d"
                    : "4px solid transparent",
              }}
            >

              <div
                style={{
                  ...styles.smallText,
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "16px",
                }}
              >
                <span>
                  {new Date(session?.date).toLocaleDateString("en-NZ", {
                    day: "numeric",
                    month: "short",
                  })}
                  {" ("}
                  {new Date(session?.date).toLocaleDateString("en-NZ", {
                    weekday: "short",
                  })}
                  {") - "}
                  {session?.start_time}
                  {" - "}
                  {session?.session_name || "Session"}
                </span>

                <span>{actionTime}</span>
              </div>

              <div style={styles.text}>
                {notification.message}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

  if (view === "directory") {
    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <Nav
            view={view}
            setView={setView}
            notifications={notifications}
            unreadNotifications={unreadNotifications}
            myMatches={myMatches}
            matchCount={filteredMatches.length}
          />


          {filteredDirectoryPlayers.map((player: any) => (
            <Card key={player.member_id}>
              <div style={styles.rowStart}>
                <div style={styles.avatar}>{player.initials}</div>

                <div style={{ flex: 1 }}>
                  <div style={styles.name}>
                    {player.first_name} {player.last_name}
                  </div>

                  <div style={styles.text}>Club: {player.clubs}</div>
                  <div style={styles.text}>Systems: {player.systems || "Not completed"}</div>
                  <div style={styles.smallText}>Member ID: {player.member_id}</div>

                  <div style={styles.buttonRow}>
                    <Button secondary>Message</Button>
                    <Button secondary>View profile</Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {filteredDirectoryPlayers.length === 0 && (
            <Card>No completed profiles found.</Card>
          )}
        </div>
      </main>
    );
  }

  if (false && selectedSession) {
    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <Button
              onClick={() => {
              setSelectedSessionId(null);
              setShowSystemCard(false);
            }}
          >
            Back to sessions
          </Button>

          <div style={styles.hero}>
            <div style={styles.smallText}>{selectedSession.clubName}</div>
            <h1 style={styles.heroTitle}>{selectedSession.sessionName}</h1>
            <p style={styles.text}>
              {selectedSession.day}, {selectedSession.startTime} to{" "}
              {selectedSession.endTime}
            </p>
            <p style={styles.text}>{selectedSession.level}</p>
            <p style={styles.smallText}>{selectedSession.partnerSupport}</p>
          </div>

          <div style={styles.headerRow}>
            <div>
              <h2 style={styles.sectionTitle}>Looking for partner</h2>
              <p style={styles.smallText}>Requests for this session appear first</p>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              I need a partner
            </Button>
          </div>

          {showForm && (
            <Card>
              <h2 style={styles.sectionTitle}>I need a partner</h2>
              <p style={styles.smallText}>
                For {selectedSession.clubName}, {selectedSession.sessionName}
              </p>
              <div style={styles.buttonRow}>
                <Button>One off</Button>
                <Button secondary>Regular</Button>
              </div>
              <div style={styles.gridTwo}>
                <select style={styles.input}>
                </select>
                <select style={styles.input}>
                </select>
              </div>
              <textarea
                style={styles.textarea}
                placeholder="Short note, optional"
              />
              <Button onClick={createRequest}>Post request</Button>
            </Card>
          )}

          {sessionRequests.map((request) => {
            const player = getPlayer(request.playerId);
            if (!player) return null;

            return (
              <Card key={request.id}>
                <div style={styles.rowStart}>
                  <div style={styles.avatar}>{player.initials}</div>
                  <div style={{ flex: 1 }}>
                    <div style={styles.nameLine}>
                      <div style={styles.name}>
                        {player.first_name} {player.last_name}
                      </div>
                      {request.requestTypes.map((type) => (
                        <Badge key={type}>{type}</Badge>
                      ))}
                    </div>
                    <div style={styles.text}>
                      {player.level}, {player.clubs}
                    </div>
                    <div style={styles.text}>System: {request.systemWanted}</div>
                    <div style={styles.text}>Wanted: {request.wanted_levels}</div>
                    <div style={styles.text}>{request.note}</div>
                    <div style={styles.buttonRow}>
                      <Button onClick={() => acceptRequest(request.id)}>
                        Request partner
                      </Button>
                      <Button secondary>Message</Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}

          <h2 style={styles.sectionTitle}>Suggested partners</h2>
          <p style={styles.smallText}>
            Only players available for matching are listed here.
          </p>

          <div style={styles.filterBar}>
            <div>
              <div style={styles.label}>Club filter</div>
              <select
                style={styles.input}
                value={clubFilter}
                onChange={(event) => setClubFilter(event.target.value)}
              >
                <option>All clubs</option>
                <option>My club only</option>
              </select>
            </div>
          </div>

          {suggestedPlayers.map((player) => {
            const score = calculateMatchScore(player, selectedSession);

            return (
              <Card key={player.member_id}>
                <div style={styles.rowStart}>
                  <div style={styles.avatar}>{player.initials}</div>
                  <div style={{ flex: 1 }}>
                    <div style={styles.rowBetween}>
                      <div style={styles.name}>
                        {player.first_name} {player.last_name}
                      </div>
                      <Badge>{score}% match</Badge>
                    </div>
                    <div style={styles.text}>
                      {player.level}, {player.city}
                    </div>
                    <div style={styles.text}>{player.systems}</div>
                    {player.profile_completed === "no" && (
                      <div style={styles.smallText}>
                        Profile setup incomplete
                      </div>
                    )}
                    <div style={styles.buttonRow}>
                      <Button secondary>View profile</Button>
                      <Button secondary>Message</Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}

          {suggestedPlayers.length === 0 && (
            <Card>No suggested partners with the current filters.</Card>
          )}
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div style={styles.headerRow}>
          <div>

<div
  style={{
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "radial-gradient(circle at bottom left, #dfe7ff 0%, transparent 35%), radial-gradient(circle at top right, #eef2ff 0%, transparent 30%), #f8f9fc",
    padding: "40px",
  }}
>
  <div
    style={{
      textAlign: "center",
      maxWidth: "700px",
      width: "100%",
    }}
  >

    <div
      style={{
        fontSize: "120px",
        marginBottom: "10px",
        color: "#0f172a",
        lineHeight: 1,
      }}
    >
      ♠
    </div>

    <h1
      style={{
        fontSize: "72px",
        fontWeight: 800,
        color: "#2f3fd1",
        marginBottom: "16px",
        lineHeight: 1,
      }}
    >
      Bridge Buddy
    </h1>

    <p
      style={{
        fontSize: "28px",
        color: "#5d6478",
        marginBottom: "48px",
      }}
    >
      Find your bridge partner.
    </p>

    <div
      style={{
        display: "flex",
        gap: "20px",
        justifyContent: "center",
        flexWrap: "wrap",
      }}
    >
      <Button
        onClick={() => setView("login")}
        style={{
          background: "linear-gradient(135deg, #1e88e5, #3949db)",
          color: "white",
          border: "none",
          borderRadius: "16px",
          padding: "16px 34px",
          fontSize: "18px",
          fontWeight: 700,
          boxShadow: "0 12px 30px rgba(57,73,219,0.25)",
          cursor: "pointer",
        }}
      >
        Login
      </Button>

      <Button
        onClick={() => setView("createProfile")}
        style={{
          background: "white",
          color: "#1e88e5",
          border: "2px solid #90caf9",
          borderRadius: "16px",
          padding: "16px 34px",
          fontSize: "18px",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Create Profile
      </Button>
    </div>
  </div>
</div>              
             {view !== "landing" && (
              <>
              <h2 style={styles.sectionTitle}>Sessions</h2>
            <details style={{ marginBottom: "16px" }}>
              <summary style={{ cursor: "pointer", padding: "8px 12px", border: "1px solid #ccc", borderRadius: "8px" }}>
                Select session types
              </summary>

              <div style={{ padding: "12px", border: "1px solid #ccc", borderTop: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
                {[...new Set(csvSessions.map((session: any) => session.location_type))]
                  .filter(Boolean)
                  .map((type: any) => (
                    <label key={type} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <input
                        type="checkbox"
                        checked={sessionTypeFilters.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSessionTypeFilters([...sessionTypeFilters, type]);
                          } else {
                            setSessionTypeFilters(
                              sessionTypeFilters.filter((item) => item !== type)
                            );
                          }
                        }}
                      />
                      {type}
                    </label>
                  ))}
              </div>
            </details>
            
            <details style={{ marginBottom: "16px" }}>
              <summary style={{ cursor: "pointer", padding: "8px 12px", border: "1px solid #ccc", borderRadius: "8px" }}>
                Select session names
              </summary>

              <div style={{ padding: "12px", border: "1px solid #ccc", borderTop: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
                {[...new Set(csvSessions.map((session: any) => session.session_name))]
                  .filter(Boolean)
                  .map((type: any) => (
                    <label key={type} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <input
                        type="checkbox"
                        checked={sessionNameFilters.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSessionNameFilters([...sessionNameFilters, type]);
                          } else {
                            setSessionNameFilters(
                              sessionNameFilters.filter((item) => item !== type)
                            );
                          }
                        }}
                      />
                      {type}
                    </label>
                  ))}
              </div>
            </details>
            </>
            )}

          </div>
            {view !== "landing" && (
              <Button onClick={() => setView("directory")}>
                Player Directory
              </Button>
            )}
        </div>

        {view !== "landing" && filteredSessions.map((session) => (
          <Card key={session.session_instance_id} onClick={() => setSelectedSessionId(session.session_instance_id)}>
            <div style={styles.rowBetween}>
              <div>
                <div style={styles.smallText}>{session.location_type}</div>
                <div style={styles.cardTitle}>{session.session_name}</div>
                <div style={styles.text}>
                  {new Date(session.session_date + "T00:00:00").toLocaleDateString("en-NZ", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })} · {session.start_time?.slice(0, 5)} to {session.end_time?.slice(0, 5)}
                </div>
              </div>
              <div>
                {Number(session.players_looking) > 0 && (
                  <Badge>{session.players_looking} looking</Badge>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    color: "#0f172a",
    padding: 24,
    fontFamily: "Arial, sans-serif",
  },
  container: {
    maxWidth: 1000,
    margin: "0 auto",
  },
  hero: {
    background: "linear-gradient(135deg, #dbeafe 0%, #ffffff 70%)",
    borderRadius: 24,
    padding: 28,
    boxShadow: "0 1px 8px rgba(15, 23, 42, 0.08)",
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: 700,
    marginTop: 8,
    marginBottom: 12,
    color: "#4338ca",
  },
  card: {
  background: "white",
  borderRadius: 20,
  padding: 20,
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
  marginBottom: 16,
  border: "1px solid #e2e8f0",
  transition: "0.2s",
},
  cardTitle: {
    fontSize: 22,
    fontWeight: 700,
    marginTop: 4,
    marginBottom: 6,
    color: "#4338ca",
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 700,
    marginTop: 20,
    marginBottom: 6,
    color: "#4338ca",
  },
  smallText: {
    color: "#64748b",
    fontSize: 14,
  },
  text: {
    color: "#475569",
    fontSize: 15,
    marginTop: 5,
  },
  rowBetween: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "flex-start",
  },
  rowStart: {
    display: "flex",
    gap: 14,
    alignItems: "flex-start",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "center",
    marginTop: 22,
    marginBottom: 12,
  },
  badge: {
  display: "inline-flex",
  alignItems: "center",
  borderRadius: 12,
  background: "transparent",
  color: "#6b7280",
  height: 44,
  padding: "10px 14px",
  fontSize: 14,
  marginRight: 6,
  marginBottom: 6,
  },
  button: {
  border: "none",
  borderRadius: 15,
  background: "#3730a3",
  color: "white",
  padding: "10px 14px",
  fontSize: 17,
  fontWeight: 700,
  height: 52,
  cursor: "pointer",
  transition: "0.2s",
  flex: 1,
  minWidth: 120,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
},
  buttonSecondary: {
    border: "none",
    borderRadius: 14,
    background: "#267c89",
    color: "white",
    padding: "10px 14px",
    fontSize: 17,
    fontWeight: 600,
    cursor: "pointer",
    flex: 1,
    minWidth: 120,
    height: 52,
  },
  matchButton: {
    border: "none",
    borderRadius: 10,
    background: "#dff1f4",
    color: "#1f5560",
    padding: "6px 12px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    height: 34,
  },
  buttonRow: {
    display: "flex",
    flexWrap: "nowrap",
    gap: 8,
    marginTop: 18,
    alignItems: "center",
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 999,
    background: "#e2e8f0",
    color: "#334155",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    flexShrink: 0,
  },
  nameLine: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
  },
  name: {
    fontWeight: 700,
    fontSize: 17,
    color: "#4338ca",
  },
  gridTwo: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 10,
    marginTop: 14,
  },
  gridThree: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 10,
    color: "#475569",
    marginTop: 14,
  },
  input: {
    border: "1px solid #cbd5e1",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
  },
  label: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 6,
  },
  filterBar: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
    background: "white",
    borderRadius: 18,
    padding: 14,
    marginTop: 14,
    marginBottom: 14,
    boxShadow: "0 1px 8px rgba(15, 23, 42, 0.08)",
  },
  textarea: {
    width: "100%",
    minHeight: 80,
    border: "1px solid #cbd5e1",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    marginTop: 12,
    marginBottom: 12,
    boxSizing: "border-box",
  },
};
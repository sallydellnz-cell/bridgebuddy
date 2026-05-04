"use client";

import React, { useMemo, useState } from "react";

const sessions = [
  {
    id: "s1",
    clubName: "Auckland Bridge Club",
    sessionName: "Monday Evening",
    day: "Monday",
    startTime: "7:00 pm",
    endTime: "9:30 pm",
    level: "Intermediate and above",
    partnerSupport: "Partner support available",
  },
  {
    id: "s2",
    clubName: "Auckland Bridge Club",
    sessionName: "Tuesday Evening",
    day: "Tuesday",
    startTime: "7:15 pm",
    endTime: "9:45 pm",
    level: "Intermediate",
    partnerSupport: "Partner support available",
  },
  {
    id: "s3",
    clubName: "Auckland Bridge Club",
    sessionName: "Friday Afternoon",
    day: "Friday",
    startTime: "1:00 pm",
    endTime: "3:30 pm",
    level: "Mixed level",
    partnerSupport: "Partner support available",
  },
  {
    id: "s4",
    clubName: "RealBridge Online",
    sessionName: "Thursday Evening",
    day: "Thursday",
    startTime: "7:00 pm",
    endTime: "9:30 pm",
    level: "Intermediate and above",
    partnerSupport: "Partner required",
  },
];

const players = [
  {
    id: "p1",
    name: "John Smith",
    city: "Auckland",
    clubs: ["Auckland Bridge Club"],
    level: "Intermediate",
    systems: "SAYC preferred, 2 over 1 comfortable",
    flexible: true,
    nzBridgeId: "12345",
    initials: "JS",
    availabilityStatus: "Open",
  },
  {
    id: "p2",
    name: "Mary Chen",
    city: "Auckland",
    clubs: ["Auckland Bridge Club", "North Shore Bridge Club"],
    level: "Advanced",
    systems: "2 over 1 preferred, SAYC comfortable",
    flexible: false,
    nzBridgeId: "23456",
    initials: "MC",
    availabilityStatus: "Not looking",
  },
  {
    id: "p3",
    name: "David Patel",
    city: "Auckland",
    clubs: ["Auckland Bridge Club"],
    level: "Intermediate",
    systems: "SAYC preferred",
    flexible: true,
    nzBridgeId: "34567",
    initials: "DP",
    availabilityStatus: "Open",
  },
  {
    id: "p4",
    name: "Helen Brown",
    city: "Auckland",
    clubs: ["Auckland Bridge Club"],
    level: "Open level",
    systems: "Acol preferred, SAYC can play",
    flexible: true,
    nzBridgeId: "45678",
    initials: "HB",
    availabilityStatus: "Open",
  },
  {
    id: "p5",
    name: "Peter Adams",
    city: "Auckland",
    clubs: ["Auckland Bridge Club", "Howick Bridge Club"],
    level: "Intermediate",
    systems: "SAYC preferred, Acol comfortable",
    flexible: false,
    nzBridgeId: "56789",
    initials: "PA",
    availabilityStatus: "Open",
  },
];

const initialRequests = [
  {
    id: "r1",
    sessionId: "s1",
    playerId: "p1",
    requestTypes: ["One off"],
    skillWanted: "Intermediate",
    systemWanted: "SAYC preferred",
    note: "Relaxed game, happy to agree system before start",
    status: "Open",
  },
  {
    id: "r2",
    sessionId: "s1",
    playerId: "p3",
    requestTypes: ["One off", "Regular"],
    skillWanted: "Intermediate or above",
    systemWanted: "Flexible",
    note: "Also open to a regular Monday partner",
    status: "Open",
  },
  {
    id: "r3",
    sessionId: "s3",
    playerId: "p5",
    requestTypes: ["Regular"],
    skillWanted: "Intermediate",
    systemWanted: "SAYC preferred",
    note: "Looking for a regular Friday afternoon partner",
    status: "Open",
  },
  {
    id: "r4",
    sessionId: "s4",
    playerId: "p2",
    requestTypes: ["One off"],
    skillWanted: "Advanced",
    systemWanted: "2 over 1 preferred",
    note: "RealBridge only, looking for a serious but friendly game",
    status: "Open",
  },
];

type Session = (typeof sessions)[0];
type Player = (typeof players)[0];
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
  return players.find((player) => player.id === playerId);
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
  if (player.flexible) score += 10;
  if (player.availabilityStatus === "Open") score += 10;
  if (["Intermediate", "Advanced", "Open level"].includes(player.level)) score += 15;

  return Math.min(score, 100);
}

export default function BridgeBuddy() {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [requests, setRequests] = useState<PartnerRequest[]>(initialRequests);
  const [showForm, setShowForm] = useState(false);
  const [showSystemCard, setShowSystemCard] = useState(false);
  const [view, setView] = useState("sessions");
  const [clubFilter, setClubFilter] = useState("All clubs");
  const [directoryAvailabilityFilter, setDirectoryAvailabilityFilter] =
    useState("All");
  const [directoryLevelFilter, setDirectoryLevelFilter] = useState("All");

  const selectedSession = sessions.find(
    (session) => session.id === selectedSessionId
  );

  const sessionRequests = useMemo(() => {
    if (!selectedSession) return [];

    return requests.filter(
      (request) =>
        request.sessionId === selectedSession.id && request.status === "Open"
    );
  }, [selectedSession, requests]);

  const suggestedPlayers = useMemo(() => {
    if (!selectedSession) return [];

    const requestPlayerIds = sessionRequests.map((request) => request.playerId);

    return players.filter((player) => {
      const isAlreadyRequesting = requestPlayerIds.includes(player.id);
      const isOpen = player.availabilityStatus === "Open";
      const matchesClub =
        clubFilter === "All clubs" ||
        player.clubs.includes(selectedSession.clubName);

      return !isAlreadyRequesting && isOpen && matchesClub;
    });
  }, [selectedSession, sessionRequests, clubFilter]);

  const filteredDirectoryPlayers = players.filter((player) => {
    const matchesAvailability =
      directoryAvailabilityFilter === "All" ||
      player.availabilityStatus === directoryAvailabilityFilter;

    const matchesLevel =
      directoryLevelFilter === "All" || player.level === directoryLevelFilter;

    return matchesAvailability && matchesLevel;
  });

  function createRequest() {
    if (!selectedSession) return;

    const newRequest: PartnerRequest = {
      id: `r${Date.now()}`,
      sessionId: selectedSession.id,
      playerId: "p4",
      requestTypes: ["One off"],
      skillWanted: "Intermediate",
      systemWanted: "Flexible",
      note: "New demo request added",
      status: "Open",
    };

    setRequests((current) => [newRequest, ...current]);
    setShowForm(false);
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

  if (view === "directory") {
    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <Button onClick={() => setView("sessions")}>
            Back to sessions
          </Button>

          <div style={styles.hero}>
            <div style={styles.smallText}>BridgeBuddy demo</div>
            <h1 style={styles.heroTitle}>Player Directory</h1>
            <p style={styles.text}>
              All registered players in one place for easier club communication.
            </p>
          </div>

          <div style={styles.filterBar}>
            <div>
              <div style={styles.label}>Availability</div>
              <select
                style={styles.input}
                value={directoryAvailabilityFilter}
                onChange={(event) =>
                  setDirectoryAvailabilityFilter(event.target.value)
                }
              >
                <option>All</option>
                <option>Open</option>
                <option>Not looking</option>
              </select>
            </div>

            <div>
              <div style={styles.label}>Level</div>
              <select
                style={styles.input}
                value={directoryLevelFilter}
                onChange={(event) =>
                  setDirectoryLevelFilter(event.target.value)
                }
              >
                <option>All</option>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
                <option>Open level</option>
              </select>
            </div>
          </div>

          {filteredDirectoryPlayers.map((player) => (
            <Card key={player.id}>
              <div style={styles.rowStart}>
                <div style={styles.avatar}>{player.initials}</div>
                <div style={{ flex: 1 }}>
                 <div style={styles.rowBetween}>
                   <div style={styles.name}>{player.name}</div>
                   <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                      <div style={{ color: "#4338ca", fontWeight: 500, fontSize: 14 }}>
                        {player.level}
                      </div>
                      {player.availabilityStatus === "Open" && (
                        <div style={{ color: "#4338ca", fontWeight: 500, fontSize: 14 }}>
                          Open for matches
                        </div>
                    )}
                   </div>
                  </div>
                  <div style={styles.text}>{player.clubs.join(", ")}</div>
                  <div style={styles.text}>{player.systems}</div>
                  {player.flexible && (
                    <div style={styles.smallText}>Flexible on system</div>
                  )}
                  <div style={styles.smallText}>
                    NZ Bridge ID: {player.nzBridgeId}
                  </div>
                  <div style={styles.buttonRow}>
                    <Button>Message</Button>
                    <Button>View profile</Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {filteredDirectoryPlayers.length === 0 && (
            <Card>No players match these filters.</Card>
          )}
        </div>
      </main>
    );
  }

  if (selectedSession) {
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

          {showSystemCard && (
            <Card>
              <h2 style={styles.sectionTitle}>Shared system card</h2>
              <p style={styles.smallText}>
                Status: Provisional, waiting for both players to agree
              </p>
              <div style={styles.gridTwo}>
                <input style={styles.input} value="SAYC basic" readOnly />
                <input style={styles.input} value="1NT: 15 to 17" readOnly />
                <input style={styles.input} value="Transfers: Yes" readOnly />
                <input style={styles.input} value="Stayman: Yes" readOnly />
                <input
                  style={styles.input}
                  value="Blackwood: RKCB 1430"
                  readOnly
                />
                <input style={styles.input} value="Weak 2s: Yes" readOnly />
              </div>
              <textarea
                style={styles.textarea}
                value="Notes: Agree opening leads before session starts."
                readOnly
              />
              <div style={styles.buttonRow}>
                <Button>Agree system card</Button>
                <Button secondary>Suggest change</Button>
              </div>
            </Card>
          )}

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
                  <option>Intermediate</option>
                  <option>Advanced</option>
                  <option>Open level</option>
                  <option>Beginner</option>
                </select>
                <select style={styles.input}>
                  <option>Flexible</option>
                  <option>SAYC preferred</option>
                  <option>2 over 1 preferred</option>
                  <option>Acol preferred</option>
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
                      <div style={styles.name}>{player.name}</div>
                      {request.requestTypes.map((type) => (
                        <Badge key={type}>{type}</Badge>
                      ))}
                    </div>
                    <div style={styles.text}>
                      {player.level}, {player.clubs.join(", ")}
                    </div>
                    <div style={styles.text}>System: {request.systemWanted}</div>
                    <div style={styles.text}>Wanted: {request.skillWanted}</div>
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
              <Card key={player.id}>
                <div style={styles.rowStart}>
                  <div style={styles.avatar}>{player.initials}</div>
                  <div style={{ flex: 1 }}>
                    <div style={styles.rowBetween}>
                      <div style={styles.name}>{player.name}</div>
                      <Badge>{score}% match</Badge>
                    </div>
                    <div style={styles.text}>
                      {player.level}, {player.city}
                    </div>
                    <div style={styles.text}>{player.systems}</div>
                    {player.flexible && (
                      <div style={styles.smallText}>Flexible on system</div>
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
        <div style={styles.hero}>
          <div style={styles.smallText}>BridgeBuddy demo</div>
          <h1 style={styles.heroTitle}>Find a bridge partner easily</h1>
          <div style={styles.gridThree}>
            <div>1. Choose a session</div>
            <div>2. Find or request a partner</div>
            <div>3. Agree on system and play</div>
          </div>
        </div>

        <div style={styles.headerRow}>
          <div>
            <h2 style={styles.sectionTitle}>Sessions</h2>
            <p style={styles.smallText}>
              Fake data for club management demonstration
            </p>
          </div>
<Button onClick={() => setView("directory")}>
  Player Directory
</Button>
        </div>

        {sessions.map((session) => (
          <Card key={session.id} onClick={() => setSelectedSessionId(session.id)}>
            <div style={styles.rowBetween}>
              <div>
                <div style={styles.smallText}>{session.clubName}</div>
                <div style={styles.cardTitle}>{session.sessionName}</div>
                <div style={styles.text}>
                  {session.day}, {session.startTime} to {session.endTime}
                </div>
                <div style={styles.text}>{session.level}</div>
                <div style={styles.smallText}>{session.partnerSupport}</div>
              </div>
              <div>
                {getRequestCount(session.id, requests) > 0 && (
                  <Badge>{getRequestCount(session.id, requests)} looking</Badge>
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
  color: "#4338ca",
  height: 44,
  padding: "10px 14px",
  fontSize: 14,
  marginRight: 6,
  marginBottom: 6,
  },
  button: {
  border: "none",
  borderRadius: 14,
  background: "#2f8f9d",
  color: "white",
  padding: "10px 14px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  transition: "0.2s",
  width: 140,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
},
  buttonSecondary: {
    border: "1px solid #cbd5e1",
    borderRadius: 12,
    background: "white",
    color: "#0f172a",
    height: 44,
    padding: "10px 14px",
    fontSize: 14,
    cursor: "pointer",
  },
  buttonRow: {
    display: "flex",
    flexWrap: "nowrap",
    gap: 8,
    marginTop: 14,
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
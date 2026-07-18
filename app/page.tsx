"use client";

import { supabase } from "@/lib/supabase";
import React, { useEffect, useMemo, useState } from "react";
import { loadCsv } from "../lib/loadCsv";

function PeopleGroupIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="7" r="3" />
      <circle cx="5.5" cy="9" r="2.25" />
      <circle cx="18.5" cy="9" r="2.25" />
      <path d="M7.5 19v-1.2c0-3 2-5 4.5-5s4.5 2 4.5 5V19" />
      <path d="M2.5 18v-.8c0-2.2 1.4-3.8 3.3-3.8.8 0 1.5.2 2.1.6" />
      <path d="M21.5 18v-.8c0-2.2-1.4-3.8-3.3-3.8-.8 0-1.5.2-2.1.6" />
    </svg>
  );
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
  unreadChatCount,
  matchCount,
}: {
  view: string;
  setView: (view: string) => void;
  notifications: any[];
  unreadNotifications: any[];
  unreadChatCount: number;
  matchCount: number;
}) {
  const mainMenuItems = [
    { viewName: "sessions", label: "Calendar", icon: "📅", count: 0 },
    {
      viewName: "directory",
      label: "Players",
      icon: <PeopleGroupIcon />,
      count: 0,
    },
    {
      viewName: "chats",
      label: "Chats",
      icon: "💬",
      count: unreadChatCount,
    },
    { viewName: "account", label: "Account", icon: "⚙", count: 0 },
  ];

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        background: "#f8fafc",
        borderTop: "1px solid #cbd5e1",
        padding: "8px 16px 10px",
        zIndex: 50,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1000px",
          margin: "0 auto",
          background: "rgba(255, 255, 255, 0.96)",
          border: "1px solid #c7d2fe",
          borderRadius: "24px",
          boxShadow: "0 10px 35px rgba(15, 23, 42, 0.14)",
          padding: "8px",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "30px",
        }}
      >
        {mainMenuItems.map((item) => {
          const isActive =
            view === item.viewName ||
            (item.viewName === "chats" && view === "chat");

          return (
            <button
              key={item.viewName}
              type="button"
              onClick={() => setView(item.viewName)}
              style={{
                border: "none",
                borderRadius: "18px",
                background: isActive ? "#4338ca" : "#e0e7ff",
                color: isActive ? "white" : "#3730a3",
                padding: "9px 8px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "3px",
                minHeight: "56px",
              }}
            >
              <span style={{ fontSize: "19px", lineHeight: 1 }}>{item.icon}</span>
              <span>
                {item.label}
                {item.count > 0 ? ` (${item.count})` : ""}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PersonalMenu({
  view,
  setView,
  unreadNotifications,
  unreadChatCount,
  matchCount,
  myStandbyCount = 0,
}: {
  view: string;
  setView: (view: string) => void;
  unreadNotifications: any[];
  unreadChatCount: number;
  matchCount: number;
  myStandbyCount?: number;
}) {
  const personalMenuItems = [
    { viewName: "mySessions", label: "My Sessions", count: 0 },
    {
      viewName: "myStandbys",
      label: "Standbys",
      count: myStandbyCount,
    },
    { viewName: "matches", label: "Matches", count: matchCount },
    { viewName: "notifications", label: "Alerts", count: unreadNotifications.length },
  ];

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "30px",
        margin: "0 auto 18px",
        width: "100%",
        maxWidth: "1000px",
        background: "rgba(255, 255, 255, 0.96)",
        border: "1px solid #c7d2fe",
        borderRadius: "24px",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.10)",
        padding: "8px",
        boxSizing: "border-box",
      }}
    >
      {personalMenuItems.map((item) => {
        const isActive = view === item.viewName;

        return (
          <button
            key={item.viewName}
            type="button"
            onClick={() => setView(item.viewName)}
            style={{
              border: "none",
              borderRadius: "18px",
              padding: "9px 8px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              background: isActive ? "#4338ca" : "#e0e7ff",
              color: isActive ? "white" : "#3730a3",
              textAlign: "center",
              whiteSpace: "nowrap",
              minHeight: "44px",
            }}
          >
            {item.label}
            {item.count > 0 ? ` (${item.count})` : ""}
          </button>
        );
      })}
    </div>
  );
}

function Card({
  children,
  onClick,
  id,
  highlighted,
  personalStatus,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  id?: string;
  highlighted?: boolean;
  personalStatus?: "matched" | "looking" | "interested" | null;
}) {
  const personalStatusStyle = personalStatus
    ? { background: "#eef2ff", border: "1px solid #c7d2fe" }
    : {};

  return (
    <div
      id={id}
      onClick={onClick}
      style={{
        ...styles.card,
        ...personalStatusStyle,
        cursor: onClick ? "pointer" : "default",
        border: highlighted
          ? "2px solid #4338ca"
          : personalStatusStyle.border || styles.card.border,
        boxShadow: highlighted
          ? "0 0 0 4px rgba(67, 56, 202, 0.12), 0 18px 40px rgba(15, 23, 42, 0.12)"
          : styles.card.boxShadow,
        transition: "border 0.2s ease, box-shadow 0.2s ease, background 0.2s ease",
      }}
    >
      {children}
    </div>
  );
}

function MyStatusSummary({
  status,
  children,
  onClick,
}: {
  status: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const content = (
    <>
      <div
        style={{
          ...styles.myStatusLabel,
          ...(onClick ? styles.myStatusLinkLabel : {}),
        }}
      >
        {status}
      </div>
      <div style={styles.myStatusText}>{children}</div>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        style={{
          ...styles.myStatusSummary,
          width: "100%",
          textAlign: "left",
          fontFamily: "inherit",
          cursor: "pointer",
        }}
      >
        {content}
      </button>
    );
  }

  return (
    <div style={styles.myStatusSummary}>
      {content}
    </div>
  );
}

const avatarChoices = Array.from(
  { length: 12 },
  (_, index) => `avatar-${String(index + 1).padStart(2, "0")}`
);

function normaliseAvatarKey(value: unknown) {
  const avatarKey = String(value || "initials");

  return avatarKey === "initials" || avatarChoices.includes(avatarKey)
    ? avatarKey
    : "initials";
}

function normaliseAvatarPhotoPath(value: unknown) {
  const photoPath = String(value || "").trim();
  return photoPath || null;
}

function getAvatarPhotoUrl(photoPath: unknown) {
  const normalisedPhotoPath = normaliseAvatarPhotoPath(photoPath);
  if (!normalisedPhotoPath) return "";

  return supabase.storage
    .from("profile-photos")
    .getPublicUrl(normalisedPhotoPath).data.publicUrl;
}

function normaliseMemberAvatarDisplay(data: any) {
  return {
    avatarKey: normaliseAvatarKey(data?.avatar_key),
    avatarPhotoPath: normaliseAvatarPhotoPath(data?.avatar_photo_path),
  };
}

function getMemberInitials(member: any) {
  const firstInitial = String(member?.first_name || "").trim().charAt(0);
  const lastInitial = String(member?.last_name || "").trim().charAt(0);

  return `${firstInitial}${lastInitial}`.toUpperCase() || "?";
}

function normaliseChatBlockStatus(data: any) {
  const blockedByMe = data?.blocked_by_me === true;
  const blockedMe = data?.blocked_me === true;

  return {
    blockedByMe,
    blockedMe,
    conversationBlocked: blockedByMe || blockedMe,
  };
}

function MemberAvatar({
  avatarKey,
  photoUrl = "",
  initials,
  size = 76,
}: {
  avatarKey: string;
  photoUrl?: string;
  initials: string;
  size?: number;
}) {
  const normalisedAvatarKey = normaliseAvatarKey(avatarKey);

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt="Member profile photo"
        style={{
          width: size,
          height: size,
          display: "block",
          flexShrink: 0,
          borderRadius: "50%",
          objectFit: "cover",
          objectPosition: "center",
          background: "#dff3f1",
        }}
      />
    );
  }

  if (normalisedAvatarKey === "initials") {
    return (
      <div
        role="img"
        aria-label={`${initials || "Member"} initials avatar`}
        style={{
          width: size,
          height: size,
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
          borderRadius: "50%",
          background: "#dff3f1",
          color: "#0f665f",
          fontSize: Math.max(16, Math.round(size * 0.28)),
          fontWeight: 800,
        }}
      >
        {initials || "?"}
      </div>
    );
  }

  const avatarIndex = avatarChoices.indexOf(normalisedAvatarKey);
  const column = avatarIndex % 4;
  const row = Math.floor(avatarIndex / 4);
  const backgroundX = column === 0 ? 0 : (column / 3) * 100;
  const backgroundY = row === 0 ? 0 : (row / 2) * 100;

  return (
    <div
      role="img"
      aria-label={`Illustrated avatar ${avatarIndex + 1}`}
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        overflow: "hidden",
        borderRadius: "50%",
        backgroundColor: "#fffaf2",
        backgroundImage: 'url("/bridgebuddy-avatar-library-v1.png")',
        backgroundRepeat: "no-repeat",
        backgroundSize: "400% 300%",
        backgroundPosition: `${backgroundX}% ${backgroundY}%`,
      }}
    />
  );
}

type ChatAvailabilityChoice = "club" | "players";

function normaliseChatAvailability(value: any): ChatAvailabilityChoice {
  return value === "club" ? "club" : "players";
}

function normaliseEditableMemberProfile(data: any, fallbackPhone = "") {
  const playingLevelIds: number[] = (
    Array.isArray(data?.playing_level_ids)
      ? data.playing_level_ids
      : data?.level_id === null || data?.level_id === undefined
        ? []
        : [data.level_id]
  )
    .map((levelId: any) => Number(levelId))
    .filter((levelId: number) => Number.isFinite(levelId));
  const systemIds: number[] = Array.isArray(data?.system_ids)
    ? data.system_ids
        .map((systemId: any) => Number(systemId))
        .filter((systemId: number) => Number.isFinite(systemId))
    : [];

  return {
    avatarKey: normaliseAvatarKey(data?.avatar_key),
    avatarPhotoPath: normaliseAvatarPhotoPath(data?.avatar_photo_path),
    nzBridgeLevel: data?.nz_bridge_level
      ? String(data.nz_bridge_level)
      : "",
    playingLevelIds: [...new Set<number>(playingLevelIds)],
    systemIds,
    contactPhone:
      data?.contact_phone === null || data?.contact_phone === undefined
        ? fallbackPhone
        : String(data.contact_phone),
    chatAvailability: normaliseChatAvailability(data?.chat_availability),
  };
}

type ProfileVisibilityChoice = "private" | "club" | "players";
type ProfileVisibilityField =
  | "nz_bridge_number"
  | "email"
  | "club"
  | "nz_bridge_level"
  | "playing_levels"
  | "systems"
  | "contact_phone";
type ProfileVisibility = Record<
  ProfileVisibilityField,
  ProfileVisibilityChoice
>;

const defaultProfileVisibility: ProfileVisibility = {
  nz_bridge_number: "players",
  email: "private",
  club: "players",
  nz_bridge_level: "players",
  playing_levels: "players",
  systems: "players",
  contact_phone: "private",
};

const profileVisibilityOptions: Array<{
  value: ProfileVisibilityChoice;
  label: string;
}> = [
  { value: "private", label: "Only me" },
  { value: "club", label: "My club" },
  { value: "players", label: "All BridgeBuddy players" },
];

function normaliseProfileVisibility(data: any): ProfileVisibility {
  const visibility = { ...defaultProfileVisibility };

  (Object.keys(visibility) as ProfileVisibilityField[]).forEach((field) => {
    const value = data?.[field];

    if (value === "private" || value === "club" || value === "players") {
      visibility[field] = value;
    }
  });

  return visibility;
}

function ProfileVisibilitySetting({
  field,
  value,
  isEditing,
  onChange,
}: {
  field: ProfileVisibilityField;
  value: ProfileVisibilityChoice;
  isEditing: boolean;
  onChange: (value: ProfileVisibilityChoice) => void;
}) {
  const selectedOption = profileVisibilityOptions.find(
    (option) => option.value === value
  );

  return (
    <div style={styles.accountVisibilitySetting}>
      <span style={styles.accountVisibilityLabel}>Visibility</span>

      {isEditing ? (
        <div style={styles.accountVisibilityChoices}>
          {profileVisibilityOptions.map((option) => (
            <label
              key={option.value}
              style={styles.accountVisibilityChoice}
            >
              <input
                type="radio"
                name={`profile-visibility-${field}`}
                value={option.value}
                checked={value === option.value}
                onChange={() => onChange(option.value)}
                style={{ accentColor: "#267c89" }}
              />
              {option.label}
            </label>
          ))}
        </div>
      ) : (
        <span style={styles.accountVisibilityValue}>
          {selectedOption?.label || "All BridgeBuddy players"}
        </span>
      )}
    </div>
  );
}

function visibleProfileDetail(
  profile: any,
  value: any,
  isVisible: boolean | undefined,
  emptyText: string
) {
  if (profile?._profileLoading) return "Loading...";
  if (profile?._profileLoadError) return "Unavailable";
  if (isVisible === false) return "Not shared";
  return value || emptyText;
}

export default function BridgeBuddy() {
  const [supabaseMembers, setSupabaseMembers] = useState<any[]>([]);
  const [supabaseLevels, setSupabaseLevels] = useState<any[]>([]);
  const [supabaseSystems, setSupabaseSystems] = useState<any[]>([]);
  const [supabaseSessions, setSupabaseSessions] = useState<any[]>([]);
  const [supabaseRequests, setSupabaseRequests] = useState<any[]>([]);
  const [supabaseRequestRecords, setSupabaseRequestRecords] = useState<any[]>([]);
  const [supabaseInterests, setSupabaseInterests] = useState<any[]>([]);
  const [supabaseMatches, setSupabaseMatches] = useState<any[]>([]);
  const [myMatchesDisplay, setMyMatchesDisplay] = useState<any[]>([]);
  const [supabaseNotifications, setSupabaseNotifications] = useState<any[]>([]);
  const [supabaseChatMessages, setSupabaseChatMessages] = useState<any[]>([]);
  const [supabaseClubMemberRoles, setSupabaseClubMemberRoles] = useState<any[]>([]);
  const [supabaseStandby, setSupabaseStandby] = useState<any[]>([]);
  const [supabaseTournamentPairRegistrations, setSupabaseTournamentPairRegistrations] =
    useState<any[]>([]);

  async function refreshSupabaseData() {
    const { data, error } = await supabase
      .from("session_cards_display")
      .select("*")
      .order("session_date", { ascending: true })
      .order("start_time", { ascending: true });

    const { data: membersData, error: membersError } = await supabase
      .from("members_current")
      .select("*");

    const { data: levelsData, error: levelsError } = await supabase
      .from("levels")
      .select("*");

    const { data: systemsData, error: systemsError } = await supabase
      .from("systems")
      .select("*")
      .eq("is_current", true)
      .order("system_name", { ascending: true });

    const { data: requestData, error: requestError } = await supabase
      .from("session_players_looking_display")
      .select("*")
      .order("created_at", { ascending: true });

    const { data: requestRecordData, error: requestRecordError } = await supabase
      .from("session_requests")
      .select("request_id, session_instance_id, nz_bridge_number, request_status, wanted_level_ids, wanted_system_ids, created_at")
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

    const { data: notificationsData, error: notificationsError } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: chatMessagesData, error: chatMessagesError } = await supabase
      .from("chat_messages")
      .select("*")
      .order("created_at", { ascending: true });

    const { data: clubMemberRolesData, error: clubMemberRolesError } = await supabase
      .from("club_member_roles")
      .select("*")
      .eq("is_current", true);

    const { data: standbyData, error: standbyError } = await supabase
      .from("session_standby")
      .select("*")
      .order("created_at", { ascending: true });

    const {
      data: tournamentPairRegistrationsData,
      error: tournamentPairRegistrationsError,
    } = await supabase
      .from("tournament_pair_registrations")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) console.error("Supabase sessions error:", error);
    if (membersError) console.error("Supabase members error:", membersError);
    if (levelsError) console.error("Supabase levels error:", levelsError);
    if (systemsError) console.error("Supabase systems error:", systemsError);
    if (requestError) console.error("Supabase request error:", requestError);
    if (requestRecordError) console.error("Supabase request records error:", requestRecordError);
    if (interestsError) console.error("Supabase interests error:", interestsError);
    if (matchesError) console.error("Supabase matches error:", matchesError);
    if (myMatchesError) console.error("My matches display error:", myMatchesError);
    if (notificationsError) console.error("Supabase notifications error:", notificationsError);
    if (chatMessagesError) console.error("Supabase chat messages error:", chatMessagesError);
    if (clubMemberRolesError) console.error("Supabase club member roles error:", clubMemberRolesError);
    if (standbyError) console.error("Supabase standby error:", standbyError);
    if (tournamentPairRegistrationsError) {
      console.error(
        "Supabase tournament pair registrations error:",
        tournamentPairRegistrationsError
      );
    }
    if (membersData) setSupabaseMembers(membersData);
    if (data) setSupabaseSessions(data);
    if (levelsData) setSupabaseLevels(levelsData);
    if (systemsData) setSupabaseSystems(systemsData);    
    if (requestData) setSupabaseRequests(requestData);
    if (requestRecordData) setSupabaseRequestRecords(requestRecordData);
    if (interestsData) setSupabaseInterests(interestsData);
    if (matchesData) setSupabaseMatches(matchesData);
    if (myMatchesData) setMyMatchesDisplay(myMatchesData);
    if (notificationsData) setSupabaseNotifications(notificationsData);
    if (chatMessagesData) setSupabaseChatMessages(chatMessagesData);
    if (clubMemberRolesData) setSupabaseClubMemberRoles(clubMemberRolesData);
    if (standbyData) setSupabaseStandby(standbyData);
    if (tournamentPairRegistrationsData) {
      setSupabaseTournamentPairRegistrations(tournamentPairRegistrationsData);
    }
  }

  useEffect(() => {
    refreshSupabaseData();
  }, []);

    useEffect(() => {
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;

    function scheduleRealtimeRefresh(payload?: any) {
      console.log("Realtime event", payload);

      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }

      refreshTimer = setTimeout(() => {
        console.log("Refreshing data...");
        void refreshSupabaseData();
      }, 250);
    }

    const realtimeChannel = supabase
      .channel("bridgebuddy-live-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_messages",
        },
        (payload) => scheduleRealtimeRefresh(payload)
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "interests",
        },
        (payload) => scheduleRealtimeRefresh(payload)
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matches",
        },
        (payload) => scheduleRealtimeRefresh(payload)
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "session_requests",
        },
        (payload) => scheduleRealtimeRefresh(payload)
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        (payload) => scheduleRealtimeRefresh(payload)
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tournament_pair_registrations",
        },
        (payload) => scheduleRealtimeRefresh(payload)
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "session_standby",
        },
        (payload) => scheduleRealtimeRefresh(payload)
      )
      .subscribe((status) => {
        console.log("BridgeBuddy realtime status:", status);
      });

    return () => {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }

      void supabase.removeChannel(realtimeChannel);
    };
  }, []);

  const [csvSessions, setCsvSessions] = useState<any[]>([]);
  const [csvMembers, setCsvMembers] = useState<any[]>([]);
  const [profileEmail, setProfileEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [confirmLoginPassword, setConfirmLoginPassword] = useState("");
  const [landingAuthMode, setLandingAuthMode] = useState<"login" | "register">(
    "login"
  );
  const [landingAuthMessage, setLandingAuthMessage] = useState("");
  const [landingAuthError, setLandingAuthError] = useState("");
  const [isLandingAuthSubmitting, setIsLandingAuthSubmitting] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showConfirmLoginPassword, setShowConfirmLoginPassword] =
    useState(false);
  const [rememberLogin, setRememberLogin] = useState(false);
  const [hasRestoredSavedLogin, setHasRestoredSavedLogin] = useState(false);
  const [foundMembers, setFoundMembers] = useState<any[]>([]);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState(""); 
  const [selectedLevel, setSelectedLevel] = useState("");
  const [currentMember, setCurrentMember] = useState<any>(null);
  const [accountProfile, setAccountProfile] = useState({
    avatarKey: "initials",
    avatarPhotoPath: null as string | null,
    nzBridgeLevel: "",
    playingLevelIds: [] as number[],
    systemIds: [] as number[],
    contactPhone: "",
    chatAvailability: "players" as ChatAvailabilityChoice,
  });
  const [accountDraftAvatarKey, setAccountDraftAvatarKey] =
    useState("initials");
  const [accountDraftAvatarPhotoPath, setAccountDraftAvatarPhotoPath] =
    useState<string | null>(null);
  const [accountDraftAvatarFile, setAccountDraftAvatarFile] =
    useState<File | null>(null);
  const [accountDraftAvatarPreviewUrl, setAccountDraftAvatarPreviewUrl] =
    useState("");
  const [accountDraftPlayingLevelIds, setAccountDraftPlayingLevelIds] =
    useState<number[]>([]);
  const [accountDraftNzBridgeLevel, setAccountDraftNzBridgeLevel] =
    useState("");
  const [accountDraftSystemIds, setAccountDraftSystemIds] = useState<number[]>(
    []
  );
  const [accountDraftContactPhone, setAccountDraftContactPhone] = useState("");
  const [accountDraftChatAvailability, setAccountDraftChatAvailability] =
    useState<ChatAvailabilityChoice>("players");
  const [accountProfileVisibility, setAccountProfileVisibility] =
    useState<ProfileVisibility>({ ...defaultProfileVisibility });
  const [accountDraftProfileVisibility, setAccountDraftProfileVisibility] =
    useState<ProfileVisibility>({ ...defaultProfileVisibility });
  const [isAccountEditing, setIsAccountEditing] = useState(false);
  const [isAccountProfileLoading, setIsAccountProfileLoading] = useState(false);
  const [isAccountProfileSaving, setIsAccountProfileSaving] = useState(false);
  const [visibleMemberProfiles, setVisibleMemberProfiles] = useState<
    Record<string, any>
  >({});
  const [directoryFirstNameSearch, setDirectoryFirstNameSearch] =
    useState("");
  const [directorySurnameSearch, setDirectorySurnameSearch] = useState("");
  const [directoryClubSearch, setDirectoryClubSearch] = useState("");

  React.useEffect(() => {
    if (!currentMember?.nz_bridge_number) {
      setAccountProfile({
        avatarKey: "initials",
        avatarPhotoPath: null,
        nzBridgeLevel: "",
        playingLevelIds: [],
        systemIds: [],
        contactPhone: "",
        chatAvailability: "players",
      });
      setAccountDraftAvatarKey("initials");
      setAccountDraftAvatarPhotoPath(null);
      setAccountDraftAvatarFile(null);
      setAccountDraftAvatarPreviewUrl("");
      setAccountDraftChatAvailability("players");
      setAccountProfileVisibility({ ...defaultProfileVisibility });
      setAccountDraftProfileVisibility({ ...defaultProfileVisibility });
      return;
    }

    let cancelled = false;

    async function loadEditableAccountProfile() {
      setIsAccountProfileLoading(true);

      const { data, error } = await supabase.rpc(
        "get_editable_member_profile",
        {
          p_nz_bridge_number: Number(currentMember.nz_bridge_number),
        }
      );

      if (cancelled) return;

      if (error) {
        if (error.message === "User profile not found.") {
          const emptyProfile = normaliseEditableMemberProfile(
            null,
            currentMember.phone || ""
          );

          setAccountProfile(emptyProfile);
          setAccountDraftAvatarKey(emptyProfile.avatarKey);
          setAccountDraftAvatarPhotoPath(emptyProfile.avatarPhotoPath);
          setAccountDraftAvatarFile(null);
          setAccountDraftAvatarPreviewUrl("");
          setAccountDraftNzBridgeLevel(emptyProfile.nzBridgeLevel);
          setAccountDraftPlayingLevelIds(emptyProfile.playingLevelIds);
          setAccountDraftSystemIds(emptyProfile.systemIds);
          setAccountDraftContactPhone(emptyProfile.contactPhone);
          setAccountDraftChatAvailability(emptyProfile.chatAvailability);
          setIsAccountProfileLoading(false);
          return;
        }

        console.error(
          "Load editable account profile error:",
          JSON.stringify(error, null, 2)
        );
        setIsAccountProfileLoading(false);
        return;
      }

      const loadedProfile = normaliseEditableMemberProfile(
        data,
        currentMember.phone || ""
      );

      setAccountProfile(loadedProfile);
      setAccountDraftAvatarKey(loadedProfile.avatarKey);
      setAccountDraftAvatarPhotoPath(loadedProfile.avatarPhotoPath);
      setAccountDraftAvatarFile(null);
      setAccountDraftAvatarPreviewUrl("");
      setAccountDraftNzBridgeLevel(loadedProfile.nzBridgeLevel);
      setAccountDraftPlayingLevelIds(loadedProfile.playingLevelIds);
      setAccountDraftSystemIds(loadedProfile.systemIds);
      setAccountDraftContactPhone(loadedProfile.contactPhone);
      setAccountDraftChatAvailability(loadedProfile.chatAvailability);

      const { data: visibilityData, error: visibilityError } =
        await supabase.rpc("get_profile_visibility", {
          p_nz_bridge_number: Number(currentMember.nz_bridge_number),
        });

      if (cancelled) return;

      const loadedVisibility = visibilityError
        ? { ...defaultProfileVisibility }
        : normaliseProfileVisibility(visibilityData);

      setAccountProfileVisibility(loadedVisibility);
      setAccountDraftProfileVisibility(loadedVisibility);
      setIsAccountProfileLoading(false);
    }

    loadEditableAccountProfile();

    return () => {
      cancelled = true;
    };
  }, [currentMember?.nz_bridge_number]);

  const visibleProfileNumbersKey = React.useMemo(() => {
    const profileNumbers = [
      ...supabaseRequests.map((request: any) => request.nz_bridge_number),
      ...supabaseRequestRecords.map(
        (request: any) => request.nz_bridge_number
      ),
      ...supabaseInterests.map(
        (interest: any) => interest.interested_nz_bridge_number
      ),
      ...csvMembers
        .filter(
          (member: any) =>
            String(member.profile_completed || "").toLowerCase() === "yes"
        )
        .map((member: any) => member.nz_bridge_number || member.member_id),
    ]
      .map((profileNumber) => Number(profileNumber))
      .filter((profileNumber) => Number.isFinite(profileNumber));

    return [...new Set(profileNumbers)].sort((a, b) => a - b).join(",");
  }, [
    supabaseRequests,
    supabaseRequestRecords,
    supabaseInterests,
    csvMembers,
  ]);

  React.useEffect(() => {
    if (!currentMember?.nz_bridge_number || !visibleProfileNumbersKey) {
      setVisibleMemberProfiles({});
      return;
    }

    let cancelled = false;
    const profileNumbers = visibleProfileNumbersKey
      .split(",")
      .map((profileNumber) => Number(profileNumber))
      .filter((profileNumber) => Number.isFinite(profileNumber));

    async function loadVisibleMemberProfiles() {
      const profileResponses = await Promise.all(
        profileNumbers.map(async (profileNumber) => {
          const { data, error } = await supabase.rpc(
            "get_visible_member_profile",
            {
              p_target_nz_bridge_number: profileNumber,
              p_viewer_nz_bridge_number: Number(
                currentMember.nz_bridge_number
              ),
            }
          );

          return {
            profileNumber,
            profile: error || !data ? { _profileLoadError: true } : data,
          };
        })
      );

      if (cancelled) return;

      const profilesByNumber: Record<string, any> = {};
      profileResponses.forEach(({ profileNumber, profile }) => {
        profilesByNumber[String(profileNumber)] = profile;
      });
      setVisibleMemberProfiles(profilesByNumber);
    }

    loadVisibleMemberProfiles();

    return () => {
      cancelled = true;
    };
  }, [currentMember?.nz_bridge_number, visibleProfileNumbersKey]);

  function renderVisiblePlayerCardDetails(nzBridgeNumber: any) {
    const visibleProfile =
      visibleMemberProfiles[String(nzBridgeNumber)];

    if (!visibleProfile) {
      return (
        <div style={styles.playerDetailsMessage}>
          Loading profile details...
        </div>
      );
    }

    if (visibleProfile._profileLoadError) {
      return (
        <div style={styles.playerDetailsMessage}>
          Profile details are unavailable.
        </div>
      );
    }

    const sharedDetails = [
      {
        key: "playing-levels",
        label: "Playing levels",
        visible: visibleProfile.level_visible === true,
        value: visibleProfile.level || "Not completed",
      },
      {
        key: "systems",
        label: "Systems",
        visible: visibleProfile.systems_visible === true,
        value: visibleProfile.systems || "Not completed",
      },
      {
        key: "club",
        label: "Club",
        visible: visibleProfile.club_visible === true,
        value: visibleProfile.clubs || "Not listed",
      },
      {
        key: "nz-level",
        label: "NZ Bridge level",
        visible: visibleProfile.nz_bridge_level_visible === true,
        value: visibleProfile.nz_bridge_level || "Not recorded",
      },
      {
        key: "nz-number",
        label: "NZ Bridge number",
        visible: visibleProfile.nz_bridge_number_visible === true,
        value:
          visibleProfile.display_nz_bridge_number || "Not recorded",
      },
      {
        key: "email",
        label: "Email",
        visible: visibleProfile.email_visible === true,
        value: visibleProfile.email || "Not listed",
      },
      {
        key: "phone",
        label: "Contact phone",
        visible: visibleProfile.contact_phone_visible === true,
        value: visibleProfile.contact_phone || "Not listed",
      },
    ].filter((detail) => detail.visible);

    if (sharedDetails.length === 0) {
      return (
        <div style={styles.playerDetailsMessage}>
          No additional profile details shared.
        </div>
      );
    }

    return (
      <div style={styles.playerProfileDetailsGrid}>
        {sharedDetails.map((detail) => (
          <div key={detail.key} style={styles.playerProfileDetail}>
            <div style={styles.playerProfileDetailLabel}>{detail.label}</div>
            <div style={styles.playerProfileDetailValue}>{detail.value}</div>
          </div>
        ))}
      </div>
    );
  }

  function renderLookingPreferences(request: any) {
    return (
      <div style={styles.lookingPreferences}>
        <div style={styles.lookingPreferencesTitle}>Looking for</div>
        <div style={styles.lookingPreferencesGrid}>
          <div>
            <span style={styles.lookingPreferenceLabel}>Partner levels</span>
            <span style={styles.lookingPreferenceValue}>
              {request.wanted_levels || "Any level"}
            </span>
          </div>
          <div>
            <span style={styles.lookingPreferenceLabel}>Partner systems</span>
            <span style={styles.lookingPreferenceValue}>
              {request.wanted_systems || "Any system"}
            </span>
          </div>
          {request.note && (
            <div>
              <span style={styles.lookingPreferenceLabel}>Note</span>
              <span style={styles.lookingPreferenceValue}>{request.note}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderPlayerProfileModal() {
    if (!profileToView) return null;

    const profileNumberKey = String(profileToView.nz_bridge_number || "");
    const profileIsCurrentMember =
      profileNumberKey === String(currentMember?.nz_bridge_number || "");
    const profileAvatarDisplay = profileIsCurrentMember
      ? {
          avatarKey: accountProfile.avatarKey,
          avatarPhotoPath: accountProfile.avatarPhotoPath,
        }
      : memberAvatarDisplays[profileNumberKey] || {
          avatarKey: "initials",
          avatarPhotoPath: null,
        };
    const profileConversationBlocked =
      chatBlockStatusesByNumber[profileNumberKey] === true;

    const modalDetails = [
      {
        key: "playing-levels",
        label: "Playing levels",
        visible: profileToView.level_visible === true,
        value: profileToView.level || profileToView.level_name || "Not completed",
      },
      {
        key: "systems",
        label: "Systems",
        visible: profileToView.systems_visible === true,
        value: profileToView.systems || "Not completed",
      },
      {
        key: "club",
        label: "Club",
        visible: profileToView.club_visible === true,
        value: profileToView.clubs || "Not listed",
      },
      {
        key: "nz-level",
        label: "NZ Bridge level",
        visible: profileToView.nz_bridge_level_visible === true,
        value: profileToView.nz_bridge_level || "Not recorded",
      },
      {
        key: "nz-number",
        label: "NZ Bridge number",
        visible: profileToView.nz_bridge_number_visible === true,
        value: profileToView.display_nz_bridge_number || "Not recorded",
      },
      {
        key: "email",
        label: "Email",
        visible: profileToView.email_visible === true,
        value: profileToView.email || "Not listed",
      },
      {
        key: "phone",
        label: "Contact phone",
        visible: profileToView.contact_phone_visible === true,
        value: profileToView.contact_phone || "Not listed",
      },
    ].filter((detail) => detail.visible);

    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.45)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1200,
          padding: "24px",
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Player profile"
          style={{
            background: "white",
            borderRadius: "20px",
            padding: "28px",
            width: "100%",
            maxWidth: "520px",
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: "0 24px 80px rgba(15, 23, 42, 0.25)",
          }}
        >
          <div style={styles.playerProfileModalIdentity}>
            <MemberAvatar
              avatarKey={profileAvatarDisplay.avatarKey}
              photoUrl={getAvatarPhotoUrl(
                profileAvatarDisplay.avatarPhotoPath
              )}
              initials={getMemberInitials(profileToView)}
              size={68}
            />
            <h2 style={{ ...styles.sectionTitle, margin: 0 }}>
              {profileToView.first_name} {profileToView.last_name}
              {profileIsCurrentMember ? " (You)" : ""}
            </h2>
          </div>

          {profileToView._profileLoading ? (
            <div style={styles.playerDetailsMessage}>
              Loading profile details...
            </div>
          ) : profileToView._profileLoadError ? (
            <div style={styles.playerDetailsMessage}>
              Profile details are unavailable.
            </div>
          ) : modalDetails.length > 0 ? (
            <div style={styles.playerProfileDetailsGrid}>
              {modalDetails.map((detail) => (
                <div key={detail.key} style={styles.playerProfileDetail}>
                  <div style={styles.playerProfileDetailLabel}>
                    {detail.label}
                  </div>
                  <div style={styles.playerProfileDetailValue}>
                    {detail.value}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.playerDetailsMessage}>
              No additional profile details shared.
            </div>
          )}

          <div
            style={{
              marginTop: "24px",
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            {String(profileToView.nz_bridge_number) !==
              String(currentMember?.nz_bridge_number) && (
              <button
                type="button"
                disabled={profileConversationBlocked}
                onClick={() => {
                  if (profileConversationBlocked) return;
                  setChatPartner(profileToView);
                  setChatReturnView(view);
                  setProfileToView(null);
                  setView("chat");
                }}
                style={{
                  ...styles.compactPrimaryAction,
                  ...(profileConversationBlocked
                    ? styles.compactActionDisabled
                    : {}),
                }}
              >
                {profileConversationBlocked ? "Chat unavailable" : "Chat"}
              </button>
            )}

            <button
              type="button"
              onClick={() => setProfileToView(null)}
              style={styles.compactSecondaryAction}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isCurrentUserDirector = supabaseClubMemberRoles.some(
    (role: any) =>
      String(role.nz_bridge_number) === String(currentMember?.nz_bridge_number) &&
      String(role.club_id) === String(currentMember?.club_id) &&
      role.role_name === "Director" &&
      role.is_current === true
  );

React.useEffect(() => {
  loadCsv("/sessions.csv").then((data: any) => {
    setCsvSessions(data);
  });

  loadCsv("/members.csv").then((data: any) => {
    setCsvMembers(data);
  });

}, []);

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [sessionDetailFilter, setSessionDetailFilter] = useState("Active");
  const [tournamentDetailFilter, setTournamentDetailFilter] =
    useState("My Status");
  const [tournamentPairSort, setTournamentPairSort] = useState("nameAsc");
  const [sessionReturnView, setSessionReturnView] = useState("sessions");
  const [scrollToSessionId, setScrollToSessionId] = useState<string | null>(null);
  const [highlightedSessionId, setHighlightedSessionId] = useState<string | null>(null);
  const [profileToView, setProfileToViewState] = useState<any>(null);
  const profileViewRequestId = React.useRef(0);

  function setProfileToView(profile: any) {
    profileViewRequestId.current += 1;
    const requestId = profileViewRequestId.current;

    if (!profile) {
      setProfileToViewState(null);
      return;
    }

    const targetNzBridgeNumber = Number(profile.nz_bridge_number);

    if (!Number.isFinite(targetNzBridgeNumber)) {
      setProfileToViewState(profile);
      return;
    }

    const safeIdentity = {
      nz_bridge_number: targetNzBridgeNumber,
      first_name: profile.first_name || "Unknown",
      last_name: profile.last_name || "player",
      _profileLoading: true,
    };

    setProfileToViewState(safeIdentity);

    void supabase
      .rpc("get_visible_member_profile", {
        p_target_nz_bridge_number: targetNzBridgeNumber,
        p_viewer_nz_bridge_number: currentMember?.nz_bridge_number
          ? Number(currentMember.nz_bridge_number)
          : null,
      })
      .then(({ data, error }) => {
        if (requestId !== profileViewRequestId.current) return;

        if (error || !data) {
          console.error(
            "Load visible member profile error:",
            JSON.stringify(error, null, 2)
          );
          setProfileToViewState({
            ...safeIdentity,
            _profileLoading: false,
            _profileLoadError: true,
          });
          return;
        }

        setProfileToViewState({
          ...safeIdentity,
          ...data,
          _profileLoading: false,
        });
      });
  }
  const [chatPartner, setChatPartner] = useState<any>(null);
  const [chatMessageText, setChatMessageText] = useState("");
  const [chatReturnView, setChatReturnView] = useState("sessions");
  const [chatBlockStatus, setChatBlockStatus] = useState({
    blockedByMe: false,
    blockedMe: false,
    conversationBlocked: false,
  });
  const [chatBlockAction, setChatBlockAction] = useState<
    "block" | "unblock" | null
  >(null);
  const [chatBlockError, setChatBlockError] = useState("");
  const [isChatBlockStatusLoading, setIsChatBlockStatusLoading] =
    useState(false);
  const [isChatBlockSaving, setIsChatBlockSaving] = useState(false);
  const [memberAvatarDisplays, setMemberAvatarDisplays] = useState<
    Record<
      string,
      { avatarKey: string; avatarPhotoPath: string | null }
    >
  >({});
  const [chatBlockStatusesByNumber, setChatBlockStatusesByNumber] = useState<
    Record<string, boolean>
  >({});
  const chatAvatarNumbersKey = React.useMemo(() => {
    if (!currentMember?.nz_bridge_number) return "";

    const currentNumber = String(currentMember.nz_bridge_number);
    const avatarNumbers = supabaseChatMessages
      .filter(
        (message: any) =>
          String(message.from_nz_bridge_number) === currentNumber ||
          String(message.to_nz_bridge_number) === currentNumber
      )
      .map((message: any) =>
        String(message.from_nz_bridge_number) === currentNumber
          ? Number(message.to_nz_bridge_number)
          : Number(message.from_nz_bridge_number)
      )
      .filter((profileNumber: number) => Number.isFinite(profileNumber));

    const selectedPartnerNumber = Number(chatPartner?.nz_bridge_number);
    if (Number.isFinite(selectedPartnerNumber)) {
      avatarNumbers.push(selectedPartnerNumber);
    }

    csvMembers
      .filter(
        (member: any) =>
          String(member.profile_completed || "").toLowerCase() === "yes"
      )
      .forEach((member: any) => {
        const profileNumber = Number(
          member.nz_bridge_number || member.member_id
        );
        if (Number.isFinite(profileNumber)) {
          avatarNumbers.push(profileNumber);
        }
      });

    return [...new Set(avatarNumbers)].sort((a, b) => a - b).join(",");
  }, [
    currentMember?.nz_bridge_number,
    supabaseChatMessages,
    chatPartner?.nz_bridge_number,
    csvMembers,
  ]);

  React.useEffect(() => {
    if (!currentMember?.nz_bridge_number || !chatAvatarNumbersKey) {
      setMemberAvatarDisplays({});
      setChatBlockStatusesByNumber({});
      return;
    }

    let cancelled = false;
    const avatarNumbers = chatAvatarNumbersKey
      .split(",")
      .map((profileNumber) => Number(profileNumber))
      .filter((profileNumber) => Number.isFinite(profileNumber));

    async function loadMemberAvatarDisplays() {
      const avatarResponses = await Promise.all(
        avatarNumbers.map(async (profileNumber) => {
          const isCurrentProfile =
            String(profileNumber) ===
            String(currentMember.nz_bridge_number);
          const [avatarResponse, blockStatusResponse] = await Promise.all([
            supabase.rpc("get_member_avatar_display", {
              p_target_nz_bridge_number: profileNumber,
              p_viewer_nz_bridge_number: Number(
                currentMember.nz_bridge_number
              ),
            }),
            isCurrentProfile
              ? Promise.resolve({ data: null, error: null })
              : supabase.rpc("manage_chat_user_block", {
                  p_current_nz_bridge_number: Number(
                    currentMember.nz_bridge_number
                  ),
                  p_other_nz_bridge_number: profileNumber,
                  p_should_block: null,
                }),
          ]);

          return {
            profileNumber,
            avatarDisplay: avatarResponse.error
              ? { avatarKey: "initials", avatarPhotoPath: null }
              : normaliseMemberAvatarDisplay(avatarResponse.data),
            conversationBlocked: isCurrentProfile
              ? false
              : blockStatusResponse.error
              ? false
              : normaliseChatBlockStatus(blockStatusResponse.data)
                  .conversationBlocked,
          };
        })
      );

      if (cancelled) return;

      const avatarDisplaysByNumber: Record<
        string,
        { avatarKey: string; avatarPhotoPath: string | null }
      > = {};
      const blockStatusesByNumber: Record<string, boolean> = {};
      avatarResponses.forEach(
        ({ profileNumber, avatarDisplay, conversationBlocked }) => {
          avatarDisplaysByNumber[String(profileNumber)] = avatarDisplay;
          blockStatusesByNumber[String(profileNumber)] =
            conversationBlocked;
        }
      );
      setMemberAvatarDisplays(avatarDisplaysByNumber);
      setChatBlockStatusesByNumber(blockStatusesByNumber);
    }

    loadMemberAvatarDisplays();

    return () => {
      cancelled = true;
    };
  }, [currentMember?.nz_bridge_number, chatAvatarNumbersKey]);

  React.useEffect(() => {
    if (
      !currentMember?.nz_bridge_number ||
      !chatPartner?.nz_bridge_number
    ) {
      setChatBlockStatus({
        blockedByMe: false,
        blockedMe: false,
        conversationBlocked: false,
      });
      setIsChatBlockStatusLoading(false);
      return;
    }

    let cancelled = false;

    async function loadChatBlockStatus() {
      setIsChatBlockStatusLoading(true);
      setChatBlockError("");

      const { data, error } = await supabase.rpc(
        "manage_chat_user_block",
        {
          p_current_nz_bridge_number: Number(
            currentMember.nz_bridge_number
          ),
          p_other_nz_bridge_number: Number(
            chatPartner.nz_bridge_number
          ),
          p_should_block: null,
        }
      );

      if (cancelled) return;

      if (error) {
        console.error(
          "Load chat block status error:",
          JSON.stringify(error, null, 2)
        );
        setChatBlockError("Block status could not be loaded.");
        setIsChatBlockStatusLoading(false);
        return;
      }

      const loadedBlockStatus = normaliseChatBlockStatus(data);
      setChatBlockStatus(loadedBlockStatus);
      setChatBlockStatusesByNumber((currentStatuses) => ({
        ...currentStatuses,
        [String(chatPartner.nz_bridge_number)]:
          loadedBlockStatus.conversationBlocked,
      }));
      setIsChatBlockStatusLoading(false);
    }

    loadChatBlockStatus();

    return () => {
      cancelled = true;
    };
  }, [
    currentMember?.nz_bridge_number,
    chatPartner?.nz_bridge_number,
  ]);
  const [matchToCancel, setMatchToCancel] = useState<any>(null);
  const [matchCancelReason, setMatchCancelReason] = useState("");
  const [interestToDecline, setInterestToDecline] = useState<any>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [tournamentInterestToAccept, setTournamentInterestToAccept] =
    useState<any>(null);
  const [tournamentInterestToDecline, setTournamentInterestToDecline] =
    useState<any>(null);
  const [tournamentDeclineReason, setTournamentDeclineReason] = useState("");
  const [isTournamentInterestResponding, setIsTournamentInterestResponding] =
    useState(false);
  const [directorMatchRequest, setDirectorMatchRequest] = useState<any>(null);
  const [directorMatchPartnerSearch, setDirectorMatchPartnerSearch] =
    useState("");
  const [directorMatchPartnerSurnameSearch, setDirectorMatchPartnerSurnameSearch] =
    useState("");
  const [directorMatchClubId, setDirectorMatchClubId] = useState("");
  const [directorMatchPartnerNumber, setDirectorMatchPartnerNumber] =
    useState("");
  const [directorMatchStandbyId, setDirectorMatchStandbyId] =
    useState<number | null>(null);
  const [directorMatchNote, setDirectorMatchNote] = useState("");

  const [showTournamentRegistrationModal, setShowTournamentRegistrationModal] =
    useState(false);
  const [tournamentRegisteringPlayerSearch, setTournamentRegisteringPlayerSearch] =
    useState("");
  const [selectedTournamentRegisteringPlayer, setSelectedTournamentRegisteringPlayer] =
    useState<any>(null);
  const [tournamentPartnerSearch, setTournamentPartnerSearch] = useState("");
  const [selectedTournamentPartner, setSelectedTournamentPartner] =
    useState<any>(null);
  const [useManualTournamentPartner, setUseManualTournamentPartner] =
    useState(false);
  const [manualTournamentPartnerFirstName, setManualTournamentPartnerFirstName] =
    useState("");
  const [manualTournamentPartnerLastName, setManualTournamentPartnerLastName] =
    useState("");
  const [
    manualTournamentPartnerNzBridgeNumber,
    setManualTournamentPartnerNzBridgeNumber,
  ] = useState("");
  const [manualTournamentPartnerClub, setManualTournamentPartnerClub] =
    useState("");
  const [manualTournamentPartnerEmail, setManualTournamentPartnerEmail] =
    useState("");
  const [manualTournamentPartnerPhone, setManualTournamentPartnerPhone] =
    useState("");
  const [isTournamentRegistrationSubmitting, setIsTournamentRegistrationSubmitting] =
    useState(false);
  const [cancellingTournamentRegistrationId, setCancellingTournamentRegistrationId] =
    useState<number | null>(null);
    
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
  const [view, setView] = useState("landing");

  React.useEffect(() => {
    if (hasRestoredSavedLogin || supabaseMembers.length === 0) return;

    setHasRestoredSavedLogin(true);
    const savedEmail = localStorage.getItem("bridgebuddy_saved_login_email");

    if (!savedEmail) return;

    setProfileEmail(savedEmail);
    setRememberLogin(true);

    const savedMember = supabaseMembers.find(
      (candidate: any) =>
        candidate.email?.toLowerCase().trim() === savedEmail.toLowerCase().trim()
    );

    if (savedMember) {
      setCurrentMember(savedMember);
      setView("sessions");
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      const authUser = data.session?.user;
      if (!authUser?.email || authUser.email.toLowerCase() !== savedEmail.toLowerCase()) {
        localStorage.removeItem("bridgebuddy_saved_login_email");
        setRememberLogin(false);
        return;
      }

      openAuthenticatedAccount(authUser.email, authUser.id, false);
    });
  }, [hasRestoredSavedLogin, supabaseMembers]);

  function saveLoginPreference(email: string) {
    if (rememberLogin) {
      localStorage.setItem("bridgebuddy_saved_login_email", email.trim());
    } else {
      localStorage.removeItem("bridgebuddy_saved_login_email");
    }
  }

  async function switchAccount() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error(
        "Sign out while switching account error:",
        JSON.stringify(error, null, 2)
      );
    }

    localStorage.removeItem("bridgebuddy_saved_login_email");
    setRememberLogin(false);
    setProfileEmail("");
    setLoginPassword("");
    setConfirmLoginPassword("");
    setLandingAuthMode("login");
    setLandingAuthMessage("");
    setLandingAuthError("");
    setCurrentMember(null);
    setView("landing");
  }

  function openAuthenticatedAccount(
    email: string,
    authUserId: string,
    savePreference = true
  ) {
    const member = supabaseMembers.find(
      (candidate: any) =>
        candidate.email?.toLowerCase().trim() === email.toLowerCase().trim()
    );

    setCurrentMember(
      member || {
        member_id: null,
        nz_bridge_number: null,
        first_name: email.split("@")[0] || "Player",
        last_name: "",
        email,
        clubs: "",
        has_user_profile: false,
        auth_user_id: authUserId,
        is_guest: true,
      }
    );
    if (savePreference) saveLoginPreference(email);
    setView("sessions");
  }

  async function loginWithMemberEmail() {
    setLandingAuthError("");
    setLandingAuthMessage("");

    if (!profileEmail.trim()) {
      setLandingAuthError("Enter your email address.");
      return;
    }

    const member = supabaseMembers.find(
      (member: any) =>
        member.email?.toLowerCase().trim() ===
        profileEmail.toLowerCase().trim()
    );

    if (!member) {
      if (!loginPassword) {
        setLandingAuthError("Enter your password.");
        return;
      }

      setIsLandingAuthSubmitting(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: profileEmail.trim(),
        password: loginPassword,
      });
      setIsLandingAuthSubmitting(false);

      if (error || !data.user) {
        setLandingAuthError(error?.message || "Login could not be completed.");
        return;
      }

      openAuthenticatedAccount(data.user.email || profileEmail.trim(), data.user.id);
      return;
    }

    setCurrentMember(member);
    saveLoginPreference(member.email || profileEmail.trim());
    console.log("LOGIN MEMBER:", member);
    setView("sessions");
  }

  async function registerBridgeBuddyAccount() {
    setLandingAuthError("");
    setLandingAuthMessage("");

    if (!profileEmail.trim()) {
      setLandingAuthError("Enter your email address.");
      return;
    }

    if (loginPassword.length < 6) {
      setLandingAuthError("Create a password with at least 6 characters.");
      return;
    }

    if (loginPassword !== confirmLoginPassword) {
      setLandingAuthError("The passwords do not match.");
      return;
    }

    setIsLandingAuthSubmitting(true);
    const { data, error } = await supabase.auth.signUp({
      email: profileEmail.trim(),
      password: loginPassword,
    });
    setIsLandingAuthSubmitting(false);

    if (error || !data.user) {
      setLandingAuthError(error?.message || "Your account could not be created.");
      return;
    }

    if (data.session) {
      openAuthenticatedAccount(data.user.email || profileEmail.trim(), data.user.id);
      return;
    }

    setLandingAuthMode("login");
    setLoginPassword("");
    setConfirmLoginPassword("");
    setLandingAuthMessage(
      "Account created. Check your email to confirm it, then log in here."
    );
  }

  React.useEffect(() => {
    if ((view !== "sessions" && view !== "mySessions") || !scrollToSessionId) return;

    const sessionIdToHighlight = scrollToSessionId;

    requestAnimationFrame(() => {
      const sessionCard = document.getElementById(`session-card-${sessionIdToHighlight}`);

      if (sessionCard) {
        sessionCard.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        setHighlightedSessionId(sessionIdToHighlight);

        window.setTimeout(() => {
          setHighlightedSessionId((current) =>
            current === sessionIdToHighlight ? null : current
          );
        }, 1800);
      }

      setScrollToSessionId(null);
    });
  }, [view, scrollToSessionId]);

  function navigateFromSessionDetail(nextView: string) {
    if (
      (nextView === "sessions" || nextView === "mySessions") &&
      selectedSessionId
    ) {
      setScrollToSessionId(selectedSessionId);
    }

    setView(nextView);
  }

  React.useEffect(() => {
    async function markSupabaseNotificationsAsRead() {
      if (view !== "notifications" || !currentMember) return;

      const { error: markReadError } = await supabase
        .from("notifications")
        .update({
          is_read: true,
          updated_at: new Date().toISOString(),
        })
        .eq("nz_bridge_number", Number(currentMember.nz_bridge_number))
        .eq("is_read", false);

      if (markReadError) {
        console.error("Mark notifications read error:", markReadError);
        return;
      }

      await refreshSupabaseData();
    }

    markSupabaseNotificationsAsRead();
  }, [view, currentMember]);

  React.useEffect(() => {
    async function markChatMessagesAsRead() {
      if (view !== "chat" || !currentMember || !chatPartner) return;

      const unreadIncomingMessages = supabaseChatMessages.filter(
        (message: any) =>
          String(message.from_nz_bridge_number) === String(chatPartner.nz_bridge_number) &&
          String(message.to_nz_bridge_number) === String(currentMember.nz_bridge_number) &&
          message.is_read === false
      );

      const unreadIncomingMessageIds = unreadIncomingMessages.map((message: any) =>
        Number(message.message_id)
      );

      if (unreadIncomingMessageIds.length === 0) return;

      const { error: markChatReadError } = await supabase
        .from("chat_messages")
        .update({
          is_read: true,
          updated_at: new Date().toISOString(),
        })
        .in("message_id", unreadIncomingMessageIds);

      if (markChatReadError) {
        console.error("Mark chat messages read error:", markChatReadError);
        return;
      }

      const { error: markChatNotificationsReadError } = await supabase
        .from("notifications")
        .update({
          is_read: true,
          updated_at: new Date().toISOString(),
        })
        .eq("nz_bridge_number", Number(currentMember.nz_bridge_number))
        .eq("notification_type", "ChatMessage")
        .in("chat_message_id", unreadIncomingMessageIds);

      if (markChatNotificationsReadError) {
        console.error("Mark chat notifications read error:", markChatNotificationsReadError);
        return;
      }

      await refreshSupabaseData();
    }

    markChatMessagesAsRead();
  }, [view, currentMember, chatPartner, supabaseChatMessages]);

  const myNotifications = supabaseNotifications
    .filter(
      (notification: any) =>
        String(notification.nz_bridge_number) === String(currentMember?.nz_bridge_number)
    )
    .map((notification: any) => {
      const notificationSession = supabaseSessions.find(
        (session: any) =>
          String(session.session_instance_id) === String(notification.session_instance_id)
      );

      const sessionDate = notificationSession?.session_date
        ? new Date(notificationSession.session_date + "T00:00:00").toLocaleDateString("en-NZ", {
            weekday: "short",
            day: "numeric",
            month: "short",
          })
        : "";

      const sessionTime = notificationSession?.start_time
        ? String(notificationSession.start_time).slice(0, 5)
        : "";

      const sessionLabel =
        notification.notification_type === "ChatMessage"
          ? "Chat message"
          : notificationSession
          ? `${sessionDate} · ${sessionTime} ${notificationSession.session_name || "Session"}`
          : "Session details not available";

      const sessionLocationType = notificationSession?.location_type || "";

      const notificationInterest = supabaseInterests.find(
        (interest: any) =>
          Number(interest.interest_id) === Number(notification.interest_id)
      );

      const notificationRequest = supabaseRequestRecords.find(
        (request: any) =>
          Number(request.request_id) === Number(notification.request_id)
      );

      const notificationMatch = supabaseMatches.find(
        (match: any) =>
          Number(match.match_id) === Number(notification.match_id)
      );

      const notificationChatMessage = supabaseChatMessages.find(
        (message: any) =>
          Number(message.message_id) === Number(notification.chat_message_id)
      );

      const matchingTournamentRegistrations =
        notification.notification_type === "TournamentPairRegistered"
          ? supabaseTournamentPairRegistrations.filter(
              (registration: any) =>
                String(registration.session_instance_id) ===
                  String(notification.session_instance_id) &&
                String(registration.partner_nz_bridge_number) ===
                  String(notification.nz_bridge_number)
            )
          : [];
      const notificationTournamentRegistration =
        matchingTournamentRegistrations.find(
          (registration: any) =>
            String(registration.registration_status).trim() === "Registered"
        ) ||
        matchingTournamentRegistrations[
          matchingTournamentRegistrations.length - 1
        ] ||
        null;

      let otherPlayerNumber: any = null;

      if (notification.notification_type === "InterestReceived") {
        otherPlayerNumber = notificationInterest?.interested_nz_bridge_number;
      }

      if (
        notification.notification_type === "InterestAccepted" ||
        notification.notification_type === "InterestDeclined"
      ) {
        otherPlayerNumber = notificationRequest?.nz_bridge_number;
      }

      if (notification.notification_type === "MatchAccepted" && notificationMatch) {
        otherPlayerNumber =
          String(notificationMatch.requester_nz_bridge_number) ===
          String(currentMember?.nz_bridge_number)
            ? notificationMatch.partner_nz_bridge_number
            : notificationMatch.requester_nz_bridge_number;
      }

      if (notification.notification_type === "ChatMessage" && notificationChatMessage) {
        otherPlayerNumber = notificationChatMessage.from_nz_bridge_number;
      }

      if (
        notification.notification_type === "TournamentPairRegistered" &&
        notificationTournamentRegistration
      ) {
        otherPlayerNumber =
          notificationTournamentRegistration.registering_nz_bridge_number;
      }

      const otherPlayer = otherPlayerNumber
        ? supabaseMembers.find(
            (member: any) =>
              String(member.nz_bridge_number) === String(otherPlayerNumber)
          )
        : null;

      const tournamentPartner = notificationTournamentRegistration
        ? supabaseMembers.find(
            (member: any) =>
              String(member.nz_bridge_number) ===
              String(notificationTournamentRegistration.partner_nz_bridge_number)
          )
        : null;
      const registeredByName = otherPlayer
        ? `${otherPlayer.first_name || ""} ${otherPlayer.last_name || ""}`.trim()
        : notificationTournamentRegistration
        ? `NZ Bridge #${notificationTournamentRegistration.registering_nz_bridge_number}`
        : "";
      const registeredPartnerName = tournamentPartner
        ? `${tournamentPartner.first_name || ""} ${
            tournamentPartner.last_name || ""
          }`.trim()
        : notificationTournamentRegistration
        ? `NZ Bridge #${notificationTournamentRegistration.partner_nz_bridge_number}`
        : "";
      const registeredPairLabel =
        registeredByName && registeredPartnerName
          ? `${registeredByName} & ${registeredPartnerName}`
          : "";

      const alertAction =
        notification.notification_type === "ChatMessage"
          ? "New chat message"
          : notification.notification_type === "InterestReceived"
          ? "Interest received"
          : notification.notification_type === "InterestAccepted" ||
            notification.notification_type === "MatchAccepted"
          ? "Partnership confirmed"
          : notification.notification_type === "InterestDeclined"
          ? "Interest declined"
          : notification.notification_type;

      const reasonMatch = String(notification.message || "").match(/Reason:\s*(.*)$/);
      const alertReason = reasonMatch?.[1]?.trim() || "";

      return {
        id: notification.notification_id,
        message: notification.message,
        type: notification.notification_type,
        createdAt: notification.created_at,
        read: notification.is_read,
        sessionLabel,
        sessionLocationType,
        alertAction,
        alertReason,
        otherPlayer,
        tournamentPartner,
        tournamentRegistration: notificationTournamentRegistration,
        registeredByName,
        registeredPartnerName,
        registeredPairLabel,
        sessionInstanceId: notification.session_instance_id,
        chatMessageId: notification.chat_message_id,
      };
    });

  const unreadNotifications = myNotifications.filter(
    (notification: any) => notification.read === false
  );

  const unreadChatCount = supabaseChatMessages.filter(
    (message: any) =>
      String(message.to_nz_bridge_number) === String(currentMember?.nz_bridge_number) &&
      message.is_read === false
  ).length;

  const chatListItems = Array.from(
    new Set(
      supabaseChatMessages
        .filter(
          (message: any) =>
            String(message.from_nz_bridge_number) === String(currentMember?.nz_bridge_number) ||
            String(message.to_nz_bridge_number) === String(currentMember?.nz_bridge_number)
        )
        .map((message: any) =>
          String(message.from_nz_bridge_number) === String(currentMember?.nz_bridge_number)
            ? String(message.to_nz_bridge_number)
            : String(message.from_nz_bridge_number)
        )
    )
  )
    .map((partnerNumber: any) => {
      const partner = supabaseMembers.find(
        (member: any) => String(member.nz_bridge_number) === String(partnerNumber)
      );

      const conversationMessages = supabaseChatMessages
        .filter(
          (message: any) =>
            (
              String(message.from_nz_bridge_number) === String(currentMember?.nz_bridge_number) &&
              String(message.to_nz_bridge_number) === String(partnerNumber)
            ) ||
            (
              String(message.from_nz_bridge_number) === String(partnerNumber) &&
              String(message.to_nz_bridge_number) === String(currentMember?.nz_bridge_number)
            )
        )
        .sort(
          (a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

      const unreadCount = conversationMessages.filter(
        (message: any) =>
          String(message.from_nz_bridge_number) === String(partnerNumber) &&
          String(message.to_nz_bridge_number) === String(currentMember?.nz_bridge_number) &&
          message.is_read === false
      ).length;

      return {
        partner,
        partnerNumber,
        lastMessage: conversationMessages[0],
        unreadCount,
      };
    })
    .filter((item: any) => item.partner)
    .sort(
      (a: any, b: any) =>
        new Date(b.lastMessage?.created_at || 0).getTime() -
        new Date(a.lastMessage?.created_at || 0).getTime()
    );

    const [matchFilters, setMatchFilters] = useState<string[]>(["matched"]);
    const [matchSort, setMatchSort] = useState("date");
    const [sessionLocationFilters, setSessionLocationFilters] = useState<string[]>([
      "Club",
      "Online",
      "Tournaments",
    ]);
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

    const myMatches = supabaseMatches.filter(
      (match: any) =>
        String(match.requester_nz_bridge_number) === String(currentMember?.nz_bridge_number) ||
        String(match.partner_nz_bridge_number) === String(currentMember?.nz_bridge_number)
    );

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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isPast = sessionDate < today;

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

      if (
        sessionFilterRef.current &&
        !sessionFilterRef.current.contains(event.target as Node)
      ) {
        setIsSessionFilterOpen(false);
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
        String(a.requester_nz_bridge_number) === String(currentMember?.nz_bridge_number)
          ? a.partner_nz_bridge_number
          : a.requester_nz_bridge_number;

      const bPartnerId =
        String(b.requester_nz_bridge_number) === String(currentMember?.nz_bridge_number)
          ? b.partner_nz_bridge_number
          : b.requester_nz_bridge_number;

      const aPartner = supabaseMembers.find(
        (member: any) => String(member.nz_bridge_number) === String(aPartnerId)
      );

      const bPartner = supabaseMembers.find(
        (member: any) => String(member.nz_bridge_number) === String(bPartnerId)
      );

      const nameCompare = `${aPartner?.first_name || ""} ${aPartner?.last_name || ""}`.localeCompare(
        `${bPartner?.first_name || ""} ${bPartner?.last_name || ""}`
      );

      if (nameCompare !== 0) {
        return nameCompare;
      }

      const aSession = supabaseSessions.find(
        (session: any) =>
          String(session.session_instance_id) === String(a.session_instance_id)
      );

      const bSession = supabaseSessions.find(
        (session: any) =>
          String(session.session_instance_id) === String(b.session_instance_id)
      );

      return (
        new Date(`${aSession?.session_date || "1900-01-01"}T${aSession?.start_time || "00:00:00"}`).getTime() -
        new Date(`${bSession?.session_date || "1900-01-01"}T${bSession?.start_time || "00:00:00"}`).getTime()
      );
    }

    const aSession = supabaseSessions.find(
      (session: any) =>
        String(session.session_instance_id) === String(a.session_instance_id)
    );

    const bSession = supabaseSessions.find(
      (session: any) =>
        String(session.session_instance_id) === String(b.session_instance_id)
    );

    const dateTimeCompare =
      new Date(`${aSession?.session_date || "1900-01-01"}T${aSession?.start_time || "00:00:00"}`).getTime() -
      new Date(`${bSession?.session_date || "1900-01-01"}T${bSession?.start_time || "00:00:00"}`).getTime();

    if (dateTimeCompare !== 0) {
      return dateTimeCompare;
    }

    return String(aSession?.session_name || "").localeCompare(
      String(bSession?.session_name || "")
    );
  });

  const [sessionTypeFilters, setSessionTypeFilters] = useState<string[]>([]);
  const [sessionNameFilters, setSessionNameFilters] = useState<string[]>([]);
  const [selectedSystems, setSelectedSystems] = useState<string[]>([]);
  const [wantedLevel, setWantedLevel] = useState("");
  const [wantedSystems, setWantedSystems] = useState<string[]>([]);
  const [showRequestTypeModal, setShowRequestTypeModal] = useState(false);
  const [requestToRemove, setRequestToRemove] = useState<any>(null);
  const [showStandbyModal, setShowStandbyModal] = useState(false);
  const [standbyPhone, setStandbyPhone] = useState("");
  const [standbyLevelIds, setStandbyLevelIds] = useState<number[]>([]);
  const [standbySystemIds, setStandbySystemIds] = useState<number[]>([]);
  const [standbyUpdateProfile, setStandbyUpdateProfile] = useState(true);
  const [standbyNote, setStandbyNote] = useState("");
  const [currentStandbyRecord, setCurrentStandbyRecord] = useState<any>(null);
  const [myStandbySessions, setMyStandbySessions] = useState<any[]>([]);
  const [directorStandbyList, setDirectorStandbyList] = useState<any[]>([]);
  const [directorStandbyCounts, setDirectorStandbyCounts] = useState<any[]>([]);

  function openNewLookingRequestModal() {
    const profileLevelNames = accountProfile.playingLevelIds
      .map(
        (levelId) =>
          supabaseLevels.find(
            (level: any) => Number(level.level_id) === Number(levelId)
          )?.level_name
      )
      .filter(Boolean);
    const profileSystemNames = accountProfile.systemIds
      .map(
        (systemId) =>
          supabaseSystems.find(
            (system: any) => Number(system.system_id) === Number(systemId)
          )?.system_name
      )
      .filter(Boolean);

    setWantedLevel(profileLevelNames.join(","));
    setWantedSystems(profileSystemNames);
    setShowRequestTypeModal(true);
  }

  function openNewStandbyModal() {
    setStandbyPhone(
      accountProfile.contactPhone || currentMember?.phone || ""
    );
    setStandbyLevelIds([...accountProfile.playingLevelIds]);
    setStandbySystemIds([...accountProfile.systemIds]);
    setStandbyUpdateProfile(true);
    setStandbyNote("");
    setShowStandbyModal(true);
  }

  React.useEffect(() => {
    async function loadDirectorStandbyCounts() {
      if (
        !currentMember?.nz_bridge_number ||
        !isCurrentUserDirector
      ) {
        setDirectorStandbyCounts([]);
        return;
      }

      const {
        data: standbyCountsData,
        error: standbyCountsError,
      } = await supabase.rpc("get_director_standby_counts", {
        p_director_nz_bridge_number: Number(
          currentMember.nz_bridge_number
        ),
      });

      if (standbyCountsError) {
        console.error(
          "Get director standby counts error:",
          JSON.stringify(standbyCountsError, null, 2)
        );
        setDirectorStandbyCounts([]);
        return;
      }

      setDirectorStandbyCounts(standbyCountsData || []);
    }

    loadDirectorStandbyCounts();
  }, [
    currentMember,
    isCurrentUserDirector,
  ]);

  React.useEffect(() => {
    async function loadMyStandbySessions() {
      if (!currentMember?.nz_bridge_number) {
        setMyStandbySessions([]);
        return;
      }

      const { data: standbySessionsData, error: standbySessionsError } =
        await supabase.rpc("get_player_standby_sessions", {
          p_nz_bridge_number: Number(currentMember.nz_bridge_number),
        });

      if (standbySessionsError) {
        console.error(
          "Get player standby sessions error:",
          JSON.stringify(standbySessionsError, null, 2)
        );
        setMyStandbySessions([]);
        return;
      }

      setMyStandbySessions(standbySessionsData || []);
    }

    loadMyStandbySessions();
  }, [currentMember, supabaseStandby]);

    React.useEffect(() => {
    async function loadDirectorStandbyList() {
      if (
        (view !== "sessionDetail" && view !== "tournamentDetail") ||
        !selectedSessionId ||
        !currentMember?.nz_bridge_number ||
        !isCurrentUserDirector
      ) {
        setDirectorStandbyList([]);
        return;
      }

      const {
        data: directorStandbyData,
        error: directorStandbyError,
      } = await supabase.rpc("get_director_session_standby", {
        p_session_instance_id: selectedSessionId,
        p_director_nz_bridge_number: Number(
          currentMember.nz_bridge_number
        ),
      });

      if (directorStandbyError) {
        console.error(
          "Get director standby list error:",
          JSON.stringify(directorStandbyError, null, 2)
        );
        setDirectorStandbyList([]);
        return;
      }

      setDirectorStandbyList(directorStandbyData || []);
    }

    loadDirectorStandbyList();
  }, [
    view,
    selectedSessionId,
    currentMember,
    isCurrentUserDirector,
  ]);

  React.useEffect(() => {
    async function loadCurrentStandbyRecord() {
      if (
        (view !== "sessionDetail" && view !== "tournamentDetail") ||
        !selectedSessionId ||
        !currentMember?.nz_bridge_number
      ) {
        setCurrentStandbyRecord(null);
        return;
      }

      const { data: standbyStatusData, error: standbyStatusError } =
        await supabase.rpc("get_player_standby_status", {
          p_session_instance_id: selectedSessionId,
          p_nz_bridge_number: Number(currentMember.nz_bridge_number),
        });

      if (standbyStatusError) {
        console.error(
          "Get player standby status error:",
          JSON.stringify(standbyStatusError, null, 2)
        );
        setCurrentStandbyRecord(null);
        return;
      }

      setCurrentStandbyRecord(
        standbyStatusData && standbyStatusData.length > 0
          ? standbyStatusData[0]
          : null
      );
    }

    loadCurrentStandbyRecord();
  }, [view, selectedSessionId, currentMember]);

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
    .sort((a: any, b: any) => {
      const dateCompare =
        new Date(a.session_date).getTime() - new Date(b.session_date).getTime();

      if (dateCompare !== 0) {
        return dateCompare;
      }

      const timeCompare = String(a.start_time || "").localeCompare(
        String(b.start_time || "")
      );

      if (timeCompare !== 0) {
        return timeCompare;
      }

      return String(a.session_name || "").localeCompare(
        String(b.session_name || "")
      );
    });

  const mySessionItems = filteredSessions.filter((session: any) => {
    const currentMemberNumber = currentMember?.nz_bridge_number
      ? String(currentMember.nz_bridge_number)
      : "";

    if (!currentMemberNumber) return false;

    const hasActiveMatch = supabaseMatches.some(
      (match: any) =>
        String(match.session_instance_id) === String(session.session_instance_id) &&
        String(match.match_status).trim() === "Active" &&
        (
          String(match.requester_nz_bridge_number) === currentMemberNumber ||
          String(match.partner_nz_bridge_number) === currentMemberNumber
        )
    );

    const hasOpenRequest = supabaseRequestRecords.some(
      (request: any) =>
        String(request.session_instance_id) === String(session.session_instance_id) &&
        String(request.nz_bridge_number) === currentMemberNumber &&
        String(request.request_status).trim() === "Open"
    );

    const hasPendingInterest = supabaseInterests.some((interest: any) => {
      if (
        String(interest.interested_nz_bridge_number) !== currentMemberNumber ||
        String(interest.interest_status).trim() !== "Pending"
      ) {
        return false;
      }

      const requestForInterest = supabaseRequestRecords.find(
        (request: any) => Number(request.request_id) === Number(interest.request_id)
      );

      return (
        requestForInterest &&
        String(requestForInterest.session_instance_id) === String(session.session_instance_id) &&
        String(requestForInterest.request_status).trim() === "Open"
      );
    });

    const hasActiveStandby = myStandbySessions.some(
      (standbySession: any) =>
        String(standbySession.session_instance_id) ===
        String(session.session_instance_id) &&
        String(standbySession.standby_status).trim() === "Available"
    );

    const hasTournamentRegistration = supabaseTournamentPairRegistrations.some(
      (registration: any) =>
        String(registration.session_instance_id) ===
          String(session.session_instance_id) &&
        String(registration.registration_status).trim() === "Registered" &&
        [
          registration.registering_nz_bridge_number,
          registration.partner_nz_bridge_number,
          registration.manual_partner_nz_bridge_number,
        ].some(
          (playerNumber) => String(playerNumber) === currentMemberNumber
        )
    );

    return (
      hasActiveMatch ||
      hasOpenRequest ||
      hasPendingInterest ||
      hasActiveStandby ||
      hasTournamentRegistration
    );
  });

  const activeMatchedPlayerNumbersForSelectedSession = supabaseMatches
    .filter(
      (match: any) =>
        String(match.session_instance_id) === String(selectedSessionId) &&
        String(match.match_status).trim() === "Active"
    )
    .flatMap((match: any) => [
      String(match.requester_nz_bridge_number),
      String(match.partner_nz_bridge_number),
    ]);

  const currentMemberHasMatchedRequestForSelectedSession =
    !!currentMember &&
    supabaseRequestRecords.some(
      (request: any) =>
        String(request.session_instance_id) === String(selectedSessionId) &&
        String(request.nz_bridge_number) === String(currentMember.nz_bridge_number) &&
        request.request_status === "Matched"
    );

  const currentMemberIsMatchedForSelectedSession =
    !!currentMember &&
    (
      activeMatchedPlayerNumbersForSelectedSession.includes(
        String(currentMember.nz_bridge_number)
      ) ||
      currentMemberHasMatchedRequestForSelectedSession
    );

  const sessionRequests = supabaseRequestRecords
    .filter(
      (request: any) =>
        String(request.session_instance_id) === String(selectedSessionId) &&
        String(request.request_status).trim() === "Open" &&
        !activeMatchedPlayerNumbersForSelectedSession.includes(String(request.nz_bridge_number))
    )
    .map((request: any) => {
      const wantedLevels = Array.isArray(request.wanted_level_ids)
        ? request.wanted_level_ids
            .map(
              (levelId: any) =>
                supabaseLevels.find((level: any) => Number(level.level_id) === Number(levelId))
                  ?.level_name
            )
            .filter(Boolean)
            .join(", ")
        : "";

      const wantedSystems = Array.isArray(request.wanted_system_ids)
        ? request.wanted_system_ids
            .map(
              (systemId: any) =>
                supabaseSystems.find((system: any) => Number(system.system_id) === Number(systemId))
                  ?.system_name
            )
            .filter(Boolean)
            .join(", ")
        : "";

      const requestPlayer = supabaseMembers.find(
        (member: any) =>
          String(member.nz_bridge_number) === String(request.nz_bridge_number)
      );

      return {
        ...request,
        first_name: requestPlayer?.first_name,
        last_name: requestPlayer?.last_name,
        level_name: requestPlayer?.level || "Level not completed",
        wanted_levels: wantedLevels,
        wanted_systems: wantedSystems,
      };
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
        String(a.nz_bridge_number) === String(currentMember?.nz_bridge_number);

      const bIsMe =
        String(b.nz_bridge_number) === String(currentMember?.nz_bridge_number);

      if (aIsMe && !bIsMe) return -1;
      if (!aIsMe && bIsMe) return 1;

      return 0;
    });

    const myRequest = uniqueSessionRequests.find(
      (request: any) =>
        String(request.nz_bridge_number) === String(currentMember?.nz_bridge_number)
    );

    const myRequestHasAnyInterest =
      !!myRequest &&
      supabaseInterests.some(
        (interest: any) =>
          Number(interest.request_id) === Number(myRequest.request_id)
      );

    const directoryClubOptions = [
      ...new Set(
        csvMembers
          .filter(
            (player: any) =>
              String(player.profile_completed || "").toLowerCase() === "yes"
          )
          .map((player: any) => {
            const playerNumber = Number(
              player.nz_bridge_number || player.member_id
            );
            const visibleProfile =
              visibleMemberProfiles[String(playerNumber)];

            return visibleProfile?.club_visible === true
              ? String(visibleProfile.clubs || "").trim()
              : "";
          })
          .filter(Boolean)
      ),
    ].sort((a, b) => a.localeCompare(b));

    const directoryFiltersActive = Boolean(
      directoryFirstNameSearch.trim() ||
        directorySurnameSearch.trim() ||
        directoryClubSearch
    );

    const filteredDirectoryPlayers = csvMembers
      .filter(
        (player: any) =>
          String(player.profile_completed || "").toLowerCase() === "yes"
      )
      .filter((player: any) => {
        const playerNumber = Number(
          player.nz_bridge_number || player.member_id
        );
        const visibleProfile =
          visibleMemberProfiles[String(playerNumber)];
        const visibleFirstName = String(
          visibleProfile?.first_name || player.first_name || ""
        ).toLowerCase();
        const visibleSurname = String(
          visibleProfile?.last_name || player.last_name || ""
        ).toLowerCase();
        const visibleClub =
          visibleProfile?.club_visible === true
            ? String(visibleProfile.clubs || "").trim()
            : "";

        return (
          visibleFirstName.includes(
            directoryFirstNameSearch.trim().toLowerCase()
          ) &&
          visibleSurname.includes(
            directorySurnameSearch.trim().toLowerCase()
          ) &&
          (!directoryClubSearch || visibleClub === directoryClubSearch)
        );
      })
      .sort((a: any, b: any) => {
        const aIsCurrent =
          String(a.nz_bridge_number || a.member_id) ===
          String(currentMember?.nz_bridge_number);
        const bIsCurrent =
          String(b.nz_bridge_number || b.member_id) ===
          String(currentMember?.nz_bridge_number);

        if (aIsCurrent && !bIsCurrent) return -1;
        if (!aIsCurrent && bIsCurrent) return 1;

        return `${a.first_name || ""} ${a.last_name || ""}`.localeCompare(
          `${b.first_name || ""} ${b.last_name || ""}`
        );
      });

  async function createRequest() {
    if (!selectedSessionId || !currentMember) return;

    const alreadyLooking = supabaseRequestRecords.some(
      (request: any) =>
        String(request.session_instance_id) === String(selectedSessionId) &&
        String(request.nz_bridge_number) === String(currentMember.nz_bridge_number) &&
        String(request.request_status).trim() === "Open"
    );

  if (alreadyLooking) {
    alert("You are already on the looking list for this session.");
    return;
  }

  const { data: insertedRequest, error: insertRequestError } = await supabase
    .from("session_requests")
    .insert({
      session_instance_id: selectedSessionId,
      nz_bridge_number: Number(currentMember.nz_bridge_number),
      request_status: "Open",
      wanted_level_ids: wantedLevel
        ? wantedLevel
            .split(",")
            .map((levelName) =>
              supabaseLevels.find((level: any) => level.level_name === levelName)?.level_id
            )
            .filter(Boolean)
        : [],
      wanted_system_ids: wantedSystems
        .map((systemName) =>
          supabaseSystems.find((system: any) => system.system_name === systemName)?.system_id
        )
        .filter(Boolean),
      note: null,
    })
    .select()
    .single();

  if (insertRequestError) {
    console.error("Insert request error:", insertRequestError);
    return;
  }

  if (insertedRequest) {
    await refreshSupabaseData();
  }
}

  async function updateRequest() {
    if (!myRequest) return;

    const { error: updateRequestError } = await supabase
      .from("session_requests")
      .update({
        wanted_level_ids: wantedLevel
          ? wantedLevel
              .split(",")
              .map((levelName) =>
                supabaseLevels.find((level: any) => level.level_name === levelName)?.level_id
              )
              .filter(Boolean)
          : [],
        wanted_system_ids: wantedSystems
          .map((systemName) =>
            supabaseSystems.find((system: any) => system.system_name === systemName)?.system_id
          )
          .filter(Boolean),
      })
      .eq("request_id", myRequest.request_id);

    if (updateRequestError) {
      console.error("Update request error:", updateRequestError);
      return;
    }

    await refreshSupabaseData();
  }

  async function removeRequest() {
    if (!requestToRemove) return;

    const { error: removeRequestError } = await supabase
      .from("session_requests")
      .update({
        request_status: "Cancelled",
      })
      .eq("request_id", requestToRemove.request_id);

    if (removeRequestError) {
      console.error("Remove request error:", removeRequestError);
      return;
    }

    setSupabaseRequestRecords((currentRequests) =>
      currentRequests.map((request: any) =>
        Number(request.request_id) === Number(requestToRemove.request_id)
          ? { ...request, request_status: "Cancelled" }
          : request
      )
    );

    const { error: closeInterestsError } = await supabase
      .from("interests")
      .update({
        interest_status: "Closed",
      })
      .eq("request_id", requestToRemove.request_id)
      .eq("interest_status", "Pending");

    if (closeInterestsError) {
      console.error("Close interests after remove request error:", closeInterestsError);
      return;
    }

    await refreshSupabaseData();
    setRequestToRemove(null);
    setWantedLevel("");
    setWantedSystems([]);
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
          {supabaseLevels.map((level: any) => (
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
            {supabaseSystems.map((system: any) => (
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

  if (view === "account") {
    const accountInitials = `${currentMember?.first_name?.[0] || ""}${
      currentMember?.last_name?.[0] || ""
    }`.toUpperCase();
    const accountAvatarPhotoUrl = isAccountEditing
      ? accountDraftAvatarPreviewUrl ||
        getAvatarPhotoUrl(accountDraftAvatarPhotoPath)
      : getAvatarPhotoUrl(accountProfile.avatarPhotoPath);
    const accountDraftUsesPhoto = Boolean(
      accountDraftAvatarPreviewUrl || accountDraftAvatarPhotoPath
    );
    const accountPlayingLevelNames = supabaseLevels
      .filter((level: any) =>
        accountProfile.playingLevelIds.includes(Number(level.level_id))
      )
      .map((level: any) => level.level_name);
    const officialNzBridgeLevel =
      accountProfile.nzBridgeLevel ||
      currentMember?.nz_bridge_level ||
      currentMember?.bridge_level ||
      currentMember?.grade ||
      "Not recorded";
    const accountSystemNames = supabaseSystems
      .filter((system: any) =>
        accountProfile.systemIds.includes(Number(system.system_id))
      )
      .map((system: any) => system.system_name);

    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <Nav
            view={view}
            setView={setView}
            notifications={notifications}
            unreadNotifications={unreadNotifications}
            unreadChatCount={unreadChatCount}
            matchCount={filteredMatches.length}
          />

          {!isCurrentUserDirector && (
            <PersonalMenu
              view={view}
              setView={setView}
              unreadNotifications={unreadNotifications}
              unreadChatCount={unreadChatCount}
              matchCount={filteredMatches.length}
            />
          )}

          <Card>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                flexWrap: "wrap",
                marginBottom: "18px",
              }}
            >
              <div style={styles.accountIdentity}>
                <MemberAvatar
                  avatarKey={
                    isAccountEditing
                      ? accountDraftAvatarKey
                      : accountProfile.avatarKey
                  }
                  photoUrl={accountAvatarPhotoUrl}
                  initials={accountInitials}
                  size={76}
                />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      color: "#1e293b",
                      fontSize: "18px",
                      fontWeight: 700,
                    }}
                  >
                    {currentMember?.first_name || ""}{" "}
                    {currentMember?.last_name || ""}
                  </div>

                  {!isAccountEditing && (
                    <button
                      type="button"
                      onClick={switchAccount}
                      style={styles.compactPrimaryAction}
                    >
                      Switch account
                    </button>
                  )}
                </div>
              </div>

              {!isAccountEditing && (
                <button
                  type="button"
                  disabled={isAccountProfileLoading}
                  onClick={() => {
                    setAccountDraftAvatarKey(accountProfile.avatarKey);
                    setAccountDraftAvatarPhotoPath(
                      accountProfile.avatarPhotoPath
                    );
                    setAccountDraftAvatarFile(null);
                    setAccountDraftAvatarPreviewUrl("");
                    setAccountDraftNzBridgeLevel(
                      accountProfile.nzBridgeLevel
                    );
                    setAccountDraftPlayingLevelIds(
                      accountProfile.playingLevelIds
                    );
                    setAccountDraftSystemIds(accountProfile.systemIds);
                    setAccountDraftContactPhone(accountProfile.contactPhone);
                    setAccountDraftChatAvailability(
                      accountProfile.chatAvailability
                    );
                    setAccountDraftProfileVisibility(
                      accountProfileVisibility
                    );
                    setIsAccountEditing(true);
                  }}
                  style={{
                    ...styles.compactPrimaryAction,
                    opacity: isAccountProfileLoading ? 0.65 : 1,
                    cursor: isAccountProfileLoading
                      ? "not-allowed"
                      : "pointer",
                  }}
                >
                  Edit profile
                </button>
              )}
            </div>

            <div style={styles.accountGrid}>
              {isAccountEditing && (
                <div style={styles.accountAvatarField}>
                  <div>
                    <div style={styles.accountLabel}>Avatar</div>
                    <div style={styles.accountAvatarHelp}>
                      Upload your own photo, choose an illustrated avatar, or
                      keep your initials.
                    </div>
                  </div>

                  <div style={styles.accountPhotoActions}>
                    <label style={styles.compactPrimaryAction}>
                      Upload photo
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        style={{ display: "none" }}
                        onChange={(event) => {
                          const selectedFile = event.target.files?.[0];
                          event.target.value = "";
                          if (!selectedFile) return;

                          if (
                            ![
                              "image/jpeg",
                              "image/png",
                              "image/webp",
                            ].includes(selectedFile.type)
                          ) {
                            alert("Please choose a JPG, PNG or WebP image.");
                            return;
                          }

                          if (selectedFile.size > 2 * 1024 * 1024) {
                            alert("Please choose an image smaller than 2 MB.");
                            return;
                          }

                          const reader = new FileReader();
                          reader.onload = () => {
                            setAccountDraftAvatarPreviewUrl(
                              String(reader.result || "")
                            );
                          };
                          reader.readAsDataURL(selectedFile);
                          setAccountDraftAvatarFile(selectedFile);
                        }}
                      />
                    </label>

                    {accountDraftUsesPhoto && (
                      <button
                        type="button"
                        onClick={() => {
                          setAccountDraftAvatarPhotoPath(null);
                          setAccountDraftAvatarFile(null);
                          setAccountDraftAvatarPreviewUrl("");
                        }}
                        style={styles.compactSecondaryAction}
                      >
                        Remove photo
                      </button>
                    )}
                  </div>

                  <div style={styles.accountAvatarChoices}>
                    <button
                      type="button"
                      aria-label="Use my initials"
                      aria-pressed={
                        !accountDraftUsesPhoto &&
                        accountDraftAvatarKey === "initials"
                      }
                      title="Use my initials"
                      onClick={() => {
                        setAccountDraftAvatarKey("initials");
                        setAccountDraftAvatarPhotoPath(null);
                        setAccountDraftAvatarFile(null);
                        setAccountDraftAvatarPreviewUrl("");
                      }}
                      style={{
                        ...styles.accountAvatarChoice,
                        ...(!accountDraftUsesPhoto &&
                        accountDraftAvatarKey === "initials"
                          ? styles.accountAvatarChoiceSelected
                          : {}),
                      }}
                    >
                      <MemberAvatar
                        avatarKey="initials"
                        initials={accountInitials}
                        size={64}
                      />
                    </button>

                    {avatarChoices.map((avatarKey, index) => (
                      <button
                        key={avatarKey}
                        type="button"
                        aria-label={`Choose illustrated avatar ${index + 1}`}
                        aria-pressed={
                          !accountDraftUsesPhoto &&
                          accountDraftAvatarKey === avatarKey
                        }
                        title={`Avatar ${index + 1}`}
                        onClick={() => {
                          setAccountDraftAvatarKey(avatarKey);
                          setAccountDraftAvatarPhotoPath(null);
                          setAccountDraftAvatarFile(null);
                          setAccountDraftAvatarPreviewUrl("");
                        }}
                        style={{
                          ...styles.accountAvatarChoice,
                          ...(!accountDraftUsesPhoto &&
                          accountDraftAvatarKey === avatarKey
                            ? styles.accountAvatarChoiceSelected
                            : {}),
                        }}
                      >
                        <MemberAvatar
                          avatarKey={avatarKey}
                          initials={accountInitials}
                          size={64}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={styles.accountReadOnlyField}>
                <div style={styles.accountDetailMain}>
                  <div style={styles.accountLabel}>NZ Bridge number</div>
                  <div style={styles.accountValue}>
                    {currentMember?.nz_bridge_number || "Not listed"}
                  </div>
                </div>
                <ProfileVisibilitySetting
                  field="nz_bridge_number"
                  value={accountDraftProfileVisibility.nz_bridge_number}
                  isEditing={isAccountEditing}
                  onChange={(visibility) =>
                    setAccountDraftProfileVisibility((current) => ({
                      ...current,
                      nz_bridge_number: visibility,
                    }))
                  }
                />
              </div>

              <div style={styles.accountReadOnlyField}>
                <div style={styles.accountDetailMain}>
                  <div style={styles.accountLabel}>Email</div>
                  <div style={styles.accountValue}>
                    {currentMember?.email || "Not listed"}
                  </div>
                </div>
                <ProfileVisibilitySetting
                  field="email"
                  value={accountDraftProfileVisibility.email}
                  isEditing={isAccountEditing}
                  onChange={(visibility) =>
                    setAccountDraftProfileVisibility((current) => ({
                      ...current,
                      email: visibility,
                    }))
                  }
                />
              </div>

              <div style={styles.accountReadOnlyField}>
                <div style={styles.accountDetailMain}>
                  <div style={styles.accountLabel}>Club</div>
                  <div style={styles.accountValue}>
                    {currentMember?.clubs ||
                      currentMember?.club_name ||
                      "Not listed"}
                  </div>
                </div>
                <ProfileVisibilitySetting
                  field="club"
                  value={accountDraftProfileVisibility.club}
                  isEditing={isAccountEditing}
                  onChange={(visibility) =>
                    setAccountDraftProfileVisibility((current) => ({
                      ...current,
                      club: visibility,
                    }))
                  }
                />
              </div>

              <div style={styles.accountEditableField}>
                <div style={styles.accountDetailMain}>
                  <div style={styles.accountLabel}>NZ Bridge level</div>
                  {isAccountEditing ? (
                    <select
                      value={accountDraftNzBridgeLevel}
                      onChange={(event) =>
                        setAccountDraftNzBridgeLevel(event.target.value)
                      }
                      style={styles.accountControl}
                    >
                      <option value="">Not recorded</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Open">Open</option>
                    </select>
                  ) : (
                    <div style={styles.accountValue}>
                      {officialNzBridgeLevel}
                    </div>
                  )}
                </div>
                <ProfileVisibilitySetting
                  field="nz_bridge_level"
                  value={accountDraftProfileVisibility.nz_bridge_level}
                  isEditing={isAccountEditing}
                  onChange={(visibility) =>
                    setAccountDraftProfileVisibility((current) => ({
                      ...current,
                      nz_bridge_level: visibility,
                    }))
                  }
                />
              </div>

              <div style={styles.accountEditableField}>
                <div style={styles.accountDetailMain}>
                  <div style={styles.accountLabel}>Playing levels</div>
                  {isAccountEditing ? (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "10px 18px",
                        marginTop: "10px",
                      }}
                    >
                      {supabaseLevels.map((level: any) => {
                        const levelId = Number(level.level_id);

                        return (
                          <label
                            key={level.level_id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "7px",
                              color: "#1e293b",
                              fontSize: "14px",
                              fontWeight: 600,
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={accountDraftPlayingLevelIds.includes(
                                levelId
                              )}
                              onChange={(event) =>
                                setAccountDraftPlayingLevelIds(
                                  (currentLevelIds) =>
                                    event.target.checked
                                      ? [...currentLevelIds, levelId]
                                      : currentLevelIds.filter(
                                          (currentLevelId) =>
                                            currentLevelId !== levelId
                                        )
                                )
                              }
                            />
                            {level.level_name}
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={styles.accountValue}>
                      {isAccountProfileLoading
                        ? "Loading..."
                        : accountPlayingLevelNames.length > 0
                          ? accountPlayingLevelNames.join(", ")
                          : "Not completed"}
                    </div>
                  )}
                </div>
                <ProfileVisibilitySetting
                  field="playing_levels"
                  value={accountDraftProfileVisibility.playing_levels}
                  isEditing={isAccountEditing}
                  onChange={(visibility) =>
                    setAccountDraftProfileVisibility((current) => ({
                      ...current,
                      playing_levels: visibility,
                    }))
                  }
                />
              </div>

              <div style={styles.accountEditableField}>
                <div style={styles.accountDetailMain}>
                  <div style={styles.accountLabel}>Systems</div>
                  {isAccountEditing ? (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "10px 18px",
                        marginTop: "10px",
                      }}
                    >
                      {supabaseSystems.map((system: any) => {
                        const systemId = Number(system.system_id);

                        return (
                          <label
                            key={system.system_id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "7px",
                              color: "#1e293b",
                              fontSize: "14px",
                              fontWeight: 600,
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={accountDraftSystemIds.includes(systemId)}
                              onChange={(event) =>
                                setAccountDraftSystemIds((currentSystemIds) =>
                                  event.target.checked
                                    ? [...currentSystemIds, systemId]
                                    : currentSystemIds.filter(
                                        (currentSystemId) =>
                                          currentSystemId !== systemId
                                      )
                                )
                              }
                            />
                            {system.system_name}
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={styles.accountValue}>
                      {isAccountProfileLoading
                        ? "Loading..."
                        : accountSystemNames.length > 0
                          ? accountSystemNames.join(", ")
                          : "Not completed"}
                    </div>
                  )}
                </div>
                <ProfileVisibilitySetting
                  field="systems"
                  value={accountDraftProfileVisibility.systems}
                  isEditing={isAccountEditing}
                  onChange={(visibility) =>
                    setAccountDraftProfileVisibility((current) => ({
                      ...current,
                      systems: visibility,
                    }))
                  }
                />
              </div>

              <div style={styles.accountEditableField}>
                <div style={styles.accountDetailMain}>
                  <div style={styles.accountLabel}>Contact phone</div>
                  {isAccountEditing ? (
                    <input
                      type="tel"
                      value={accountDraftContactPhone}
                      onChange={(event) =>
                        setAccountDraftContactPhone(event.target.value)
                      }
                      style={styles.accountControl}
                    />
                  ) : (
                    <div style={styles.accountValue}>
                      {isAccountProfileLoading
                        ? "Loading..."
                        : accountProfile.contactPhone || "Not listed"}
                    </div>
                  )}
                </div>
                <ProfileVisibilitySetting
                  field="contact_phone"
                  value={accountDraftProfileVisibility.contact_phone}
                  isEditing={isAccountEditing}
                  onChange={(visibility) =>
                    setAccountDraftProfileVisibility((current) => ({
                      ...current,
                      contact_phone: visibility,
                    }))
                  }
                />
              </div>

              <div style={styles.accountEditableField}>
                <div style={styles.accountChatTitle}>Chat</div>
                <div style={styles.accountChatSetting}>
                  <span style={styles.accountVisibilityLabel}>
                    Availability
                  </span>
                  {isAccountEditing ? (
                    <select
                      value={accountDraftChatAvailability}
                      onChange={(event) =>
                        setAccountDraftChatAvailability(
                          normaliseChatAvailability(event.target.value)
                        )
                      }
                      style={{
                        ...styles.accountControl,
                        maxWidth: "280px",
                        marginTop: 0,
                      }}
                    >
                      <option value="club">Club members only</option>
                      <option value="players">
                        All BridgeBuddy players
                      </option>
                    </select>
                  ) : (
                    <div style={styles.accountChatValue}>
                      {isAccountProfileLoading
                        ? "Loading..."
                        : accountProfile.chatAvailability === "club"
                          ? "Club members only"
                          : "All BridgeBuddy players"}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {isAccountEditing && (
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginTop: "22px",
                }}
              >
                <button
                  type="button"
                  disabled={isAccountProfileSaving}
                  onClick={async () => {
                    if (!currentMember?.nz_bridge_number) return;

                    setIsAccountProfileSaving(true);

                    const { data, error } = await supabase.rpc(
                      "update_editable_member_profile",
                      {
                        p_nz_bridge_number: Number(
                          currentMember.nz_bridge_number
                        ),
                        p_playing_level_ids: accountDraftPlayingLevelIds,
                        p_system_ids: accountDraftSystemIds,
                        p_contact_phone: accountDraftContactPhone,
                        p_nz_bridge_level:
                          accountDraftNzBridgeLevel || null,
                        p_avatar_key: accountDraftAvatarKey,
                      }
                    );

                    if (error) {
                      console.error(
                        "Update editable account profile error:",
                        JSON.stringify(error, null, 2)
                      );
                      alert(
                        `Profile could not be updated: ${
                          error.message || "Unknown Supabase error"
                        }`
                      );
                      setIsAccountProfileSaving(false);
                      return;
                    }

                    const baseSavedProfile = normaliseEditableMemberProfile(
                      data,
                      accountDraftContactPhone.trim()
                    );

                    let savedAvatarPhotoPath =
                      accountDraftAvatarPhotoPath;
                    let newlyUploadedAvatarPhotoPath: string | null = null;

                    if (accountDraftAvatarFile) {
                      const { data: authenticatedSessionData } =
                        await supabase.auth.getSession();
                      const photoOwnerFolder =
                        authenticatedSessionData.session?.user?.id ||
                        `member-${Number(
                          currentMember.nz_bridge_number
                        )}`;

                      const photoExtensionByType: Record<string, string> = {
                        "image/jpeg": "jpg",
                        "image/png": "png",
                        "image/webp": "webp",
                      };
                      const photoExtension =
                        photoExtensionByType[accountDraftAvatarFile.type];
                      newlyUploadedAvatarPhotoPath = `${photoOwnerFolder}/avatar-${Date.now()}.${photoExtension}`;

                      const { error: photoUploadError } = await supabase.storage
                        .from("profile-photos")
                        .upload(
                          newlyUploadedAvatarPhotoPath,
                          accountDraftAvatarFile,
                          {
                            cacheControl: "3600",
                            contentType: accountDraftAvatarFile.type,
                            upsert: false,
                          }
                        );

                      if (photoUploadError) {
                        console.error(
                          "Upload profile photo error:",
                          JSON.stringify(photoUploadError, null, 2)
                        );
                        alert(
                          `Your profile details were saved, but the photo could not be uploaded: ${
                            photoUploadError.message || "Unknown upload error"
                          }`
                        );
                        setIsAccountProfileSaving(false);
                        return;
                      }

                      savedAvatarPhotoPath = newlyUploadedAvatarPhotoPath;
                    }

                    const {
                      data: savedAvatarPhotoPathData,
                      error: avatarPhotoPathSaveError,
                    } = await supabase.rpc("update_avatar_photo_path", {
                      p_nz_bridge_number: Number(
                        currentMember.nz_bridge_number
                      ),
                      p_avatar_photo_path: savedAvatarPhotoPath,
                    });

                    if (avatarPhotoPathSaveError) {
                      console.error(
                        "Update avatar photo path error:",
                        JSON.stringify(avatarPhotoPathSaveError, null, 2)
                      );

                      if (newlyUploadedAvatarPhotoPath) {
                        await supabase.storage
                          .from("profile-photos")
                          .remove([newlyUploadedAvatarPhotoPath]);
                      }

                      alert(
                        `Your profile details were saved, but the photo selection could not be updated: ${
                          avatarPhotoPathSaveError.message ||
                          "Unknown Supabase error"
                        }`
                      );
                      setIsAccountProfileSaving(false);
                      return;
                    }

                    savedAvatarPhotoPath = normaliseAvatarPhotoPath(
                      savedAvatarPhotoPathData
                    );

                    if (
                      accountProfile.avatarPhotoPath &&
                      accountProfile.avatarPhotoPath !== savedAvatarPhotoPath
                    ) {
                      const { error: oldPhotoRemoveError } =
                        await supabase.storage
                          .from("profile-photos")
                          .remove([accountProfile.avatarPhotoPath]);

                      if (oldPhotoRemoveError) {
                        console.error(
                          "Remove previous profile photo error:",
                          JSON.stringify(oldPhotoRemoveError, null, 2)
                        );
                      }
                    }

                    const {
                      data: savedChatAvailabilityData,
                      error: chatAvailabilitySaveError,
                    } = await supabase.rpc("update_chat_availability", {
                      p_nz_bridge_number: Number(
                        currentMember.nz_bridge_number
                      ),
                      p_chat_availability: accountDraftChatAvailability,
                    });

                    if (chatAvailabilitySaveError) {
                      console.error(
                        "Update chat availability error:",
                        JSON.stringify(chatAvailabilitySaveError, null, 2)
                      );
                      alert(
                        `Profile details were saved, but chat availability could not be updated: ${
                          chatAvailabilitySaveError.message ||
                          "Unknown Supabase error"
                        }`
                      );
                      setIsAccountProfileSaving(false);
                      return;
                    }

                    const savedProfile = {
                      ...baseSavedProfile,
                      avatarPhotoPath: savedAvatarPhotoPath,
                      chatAvailability: normaliseChatAvailability(
                        savedChatAvailabilityData
                      ),
                    };

                    const {
                      data: savedVisibilityData,
                      error: visibilitySaveError,
                    } = await supabase.rpc("update_profile_visibility", {
                      p_nz_bridge_number: Number(
                        currentMember.nz_bridge_number
                      ),
                      p_visibility: accountDraftProfileVisibility,
                    });

                    if (visibilitySaveError) {
                      console.error(
                        "Update profile visibility error:",
                        JSON.stringify(visibilitySaveError, null, 2)
                      );
                      alert(
                        `Profile details were saved, but visibility could not be updated: ${
                          visibilitySaveError.message ||
                          "Unknown Supabase error"
                        }`
                      );
                      setIsAccountProfileSaving(false);
                      return;
                    }

                    const savedVisibility = normaliseProfileVisibility(
                      savedVisibilityData
                    );

                    setAccountProfile(savedProfile);
                    setAccountProfileVisibility(savedVisibility);
                    setAccountDraftAvatarKey(savedProfile.avatarKey);
                    setAccountDraftAvatarPhotoPath(
                      savedProfile.avatarPhotoPath
                    );
                    setAccountDraftAvatarFile(null);
                    setAccountDraftAvatarPreviewUrl("");
                    setAccountDraftNzBridgeLevel(
                      savedProfile.nzBridgeLevel
                    );
                    setAccountDraftPlayingLevelIds(
                      savedProfile.playingLevelIds
                    );
                    setAccountDraftSystemIds(savedProfile.systemIds);
                    setAccountDraftContactPhone(savedProfile.contactPhone);
                    setAccountDraftChatAvailability(
                      savedProfile.chatAvailability
                    );
                    setAccountDraftProfileVisibility(savedVisibility);
                    setIsAccountEditing(false);
                    setIsAccountProfileSaving(false);
                    await refreshSupabaseData();
                  }}
                  style={{
                    ...styles.compactPrimaryAction,
                    opacity: isAccountProfileSaving ? 0.65 : 1,
                    cursor: isAccountProfileSaving
                      ? "not-allowed"
                      : "pointer",
                  }}
                >
                  {isAccountProfileSaving ? "Saving..." : "Save"}
                </button>

                <button
                  type="button"
                  disabled={isAccountProfileSaving}
                  onClick={() => {
                    setAccountDraftAvatarKey(accountProfile.avatarKey);
                    setAccountDraftAvatarPhotoPath(
                      accountProfile.avatarPhotoPath
                    );
                    setAccountDraftAvatarFile(null);
                    setAccountDraftAvatarPreviewUrl("");
                    setAccountDraftNzBridgeLevel(
                      accountProfile.nzBridgeLevel
                    );
                    setAccountDraftPlayingLevelIds(
                      accountProfile.playingLevelIds
                    );
                    setAccountDraftSystemIds(accountProfile.systemIds);
                    setAccountDraftContactPhone(accountProfile.contactPhone);
                    setAccountDraftChatAvailability(
                      accountProfile.chatAvailability
                    );
                    setAccountDraftProfileVisibility(
                      accountProfileVisibility
                    );
                    setIsAccountEditing(false);
                  }}
                  style={{
                    ...styles.compactPrimaryAction,
                    opacity: isAccountProfileSaving ? 0.65 : 1,
                    cursor: isAccountProfileSaving
                      ? "not-allowed"
                      : "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </Card>

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
              const member = supabaseMembers.find(
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

  if (view === "sessions" || view === "mySessions") {
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
            unreadChatCount={unreadChatCount}
            matchCount={filteredMatches.length}
          />

          {!isCurrentUserDirector && (
            <PersonalMenu
              view={view}
              setView={setView}
              unreadNotifications={unreadNotifications}
              unreadChatCount={unreadChatCount}
              matchCount={filteredMatches.length}
            />
          )}

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
            Filter calendar
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
            {["Club", "Online", "Tournaments"].map((location) => (
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

          {view === "mySessions" && mySessionItems.length === 0 && (
            <Card>
              <p style={styles.text}>You are not involved in any upcoming sessions yet.</p>
            </Card>
          )}

          {(view === "mySessions" ? mySessionItems : filteredSessions).map((session: any) => {
            const currentMemberNumber = currentMember?.nz_bridge_number
              ? String(currentMember.nz_bridge_number)
              : "";

            const activeMatchesForSession = supabaseMatches.filter(
              (match: any) =>
                String(match.session_instance_id) === String(session.session_instance_id) &&
                String(match.match_status).trim() === "Active"
            );

            const requestRecordsForSession = supabaseRequestRecords.filter(
              (request: any) =>
                String(request.session_instance_id) === String(session.session_instance_id)
            );

            const matchedPlayerNumbersForSession = activeMatchesForSession.flatMap(
              (match: any) => [
                String(match.requester_nz_bridge_number),
                String(match.partner_nz_bridge_number),
              ]
            );

            const activeOpenRequestRecordsForSession = requestRecordsForSession.filter(
              (request: any) =>
                String(request.request_status).trim() === "Open" &&
                !matchedPlayerNumbersForSession.includes(String(request.nz_bridge_number))
            );

            const currentMemberMatchForSession = currentMemberNumber
              ? activeMatchesForSession.find(
                  (match: any) =>
                    String(match.requester_nz_bridge_number) === currentMemberNumber ||
                    String(match.partner_nz_bridge_number) === currentMemberNumber
                )
              : null;

            const currentMemberOpenRequestRecordsForSession =
              currentMemberNumber
                ? activeOpenRequestRecordsForSession.filter(
                    (request: any) =>
                      String(request.nz_bridge_number) === currentMemberNumber
                  )
                : [];

            const currentMemberLookingForSession =
              currentMemberOpenRequestRecordsForSession.length > 0;

            const currentMemberPendingInterestRecordsForSession =
              currentMemberNumber && !currentMemberMatchForSession
                ? supabaseInterests.filter((interest: any) => {
                    if (
                      String(interest.interested_nz_bridge_number) !== currentMemberNumber ||
                      String(interest.interest_status).trim() !== "Pending"
                    ) {
                      return false;
                    }

                    const requestForInterest = activeOpenRequestRecordsForSession.find(
                      (request: any) =>
                        Number(request.request_id) === Number(interest.request_id)
                    );

                    return (
                      !!requestForInterest &&
                      String(requestForInterest.nz_bridge_number) !== currentMemberNumber
                    );
                  })
                : [];

            const currentMemberInterestedForSession =
              currentMemberPendingInterestRecordsForSession.length > 0;

            const currentMemberTournamentRegistrationForSession =
              !!currentMemberNumber &&
              supabaseTournamentPairRegistrations.some(
                (registration: any) =>
                  String(registration.session_instance_id) ===
                    String(session.session_instance_id) &&
                  String(registration.registration_status).trim() ===
                    "Registered" &&
                  [
                    registration.registering_nz_bridge_number,
                    registration.partner_nz_bridge_number,
                    registration.manual_partner_nz_bridge_number,
                  ].some(
                    (playerNumber) =>
                      String(playerNumber) === currentMemberNumber
                  )
              );

            const currentMemberStandbyForSession =
              !!currentMemberNumber &&
              myStandbySessions.some(
                (standbySession: any) =>
                  String(standbySession.session_instance_id) ===
                    String(session.session_instance_id) &&
                  String(standbySession.standby_status).trim() ===
                    "Available"
              );

            const currentMemberCardStatus =
              currentMemberTournamentRegistrationForSession
                ? "You are registered"
                : currentMemberMatchForSession
                  ? "You are matched"
                  : currentMemberLookingForSession
                    ? "You are looking"
                    : currentMemberInterestedForSession
                      ? "Interest pending"
                      : currentMemberStandbyForSession
                        ? "You are standby"
                        : null;

            const currentMemberIsInvolvedInSession =
              !!currentMemberMatchForSession ||
              currentMemberLookingForSession ||
              currentMemberInterestedForSession ||
              currentMemberTournamentRegistrationForSession;

            const personalSessionStatus = currentMemberIsInvolvedInSession
              ? "matched"
              : null;

            return (
              <Card
                key={session.session_instance_id}
                id={`session-card-${session.session_instance_id}`}
                highlighted={highlightedSessionId === session.session_instance_id}
                personalStatus={
                  view === "mySessions"
                    ? null
                    : personalSessionStatus ||
                      myStandbySessions.some(
                        (standbySession: any) =>
                          String(standbySession.session_instance_id) ===
                            String(session.session_instance_id) &&
                          String(standbySession.standby_status).trim() ===
                            "Available"
                      )
                    ? "matched"
                    : null
                }
                onClick={() => {
                  const currentMemberMatchForSession = supabaseMatches.find(
                    (match: any) =>
                      String(match.session_instance_id) === String(session.session_instance_id) &&
                      match.match_status === "Active" &&
                      (
                        String(match.requester_nz_bridge_number) === String(currentMember?.nz_bridge_number) ||
                        String(match.partner_nz_bridge_number) === String(currentMember?.nz_bridge_number)
                      )
                  );

                  setSessionReturnView(view === "mySessions" ? "mySessions" : "sessions");
                  setSelectedSessionId(session.session_instance_id);
                  setSessionDetailFilter("Active");
                  setTournamentDetailFilter(
                    isCurrentUserDirector ? "Looking" : "My Status"
                  );
                  setView(
                    session.location_type === "Tournaments"
                      ? "tournamentDetail"
                      : "sessionDetail"
                  );
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
                      color: "#0f172a",
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

                    {session.location_type === "Tournaments" ? (
                      <span
                        style={{
                          display: "inline-block",
                          background: "#dc2626",
                          color: "white",
                          borderRadius: "999px",
                          padding: "2px 7px",
                          fontSize: "12px",
                          fontWeight: 700,
                          marginLeft: "6px",
                        }}
                      >
                        Tournament
                      </span>
                    ) : (
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
                    )}
                  </span>
                </div>

                  <div
                    style={{
                      color: "#0f172a",
                      fontSize: "14px",
                      marginTop: "4px",
                    }}
                  >
                    {(() => {
                      const mySessionMatch = supabaseMatches.find(
                        (match: any) =>
                          String(match.session_instance_id) === String(session.session_instance_id) &&
                          match.match_status === "Active" &&
                          (
                            String(match.requester_nz_bridge_number) === String(currentMember?.nz_bridge_number) ||
                            String(match.partner_nz_bridge_number) === String(currentMember?.nz_bridge_number)
                          )
                      );

                      if (mySessionMatch) {
                        const matchedPartnerNumber =
                          String(mySessionMatch.requester_nz_bridge_number) ===
                          String(currentMember?.nz_bridge_number)
                            ? mySessionMatch.partner_nz_bridge_number
                            : mySessionMatch.requester_nz_bridge_number;

                        const matchedPartner = supabaseMembers.find(
                          (member: any) =>
                            String(member.nz_bridge_number) === String(matchedPartnerNumber)
                        );

                        return (
                          <>
                            You are matched with{" "}
                            <span
                              style={{
                                color: "#4338ca",
                                cursor: "pointer",
                                textDecoration: "underline",
                                textUnderlineOffset: "3px",
                                fontWeight: 700,
                              }}
                              onClick={(e) => {
                                e.stopPropagation();

                                setProfileToView(
                                  matchedPartner || {
                                    nz_bridge_number: matchedPartnerNumber,
                                    first_name: "Unknown",
                                    last_name: "player",
                                  }
                                );
                              }}
                            >
                              {matchedPartner?.first_name || "Unknown"}{" "}
                              {matchedPartner?.last_name || "player"}
                            </span>
                          </>
                        );
                      }

                      const matchedPlayerNumbersForThisSession = supabaseMatches
                        .filter(
                          (match: any) =>
                            String(match.session_instance_id) === String(session.session_instance_id) &&
                            String(match.match_status).trim() === "Active"
                        )
                        .flatMap((match: any) => [
                          String(match.requester_nz_bridge_number),
                          String(match.partner_nz_bridge_number),
                        ]);

                      const visibleRequestsForSession = supabaseRequestRecords.filter(
                        (request: any) =>
                          String(request.session_instance_id) === String(session.session_instance_id) &&
                          String(request.request_status).trim() === "Open" &&
                          !matchedPlayerNumbersForThisSession.includes(String(request.nz_bridge_number))
                      );

                      const uniqueLookingCount = visibleRequestsForSession.filter(
                        (request: any, index: number, array: any[]) =>
                          index ===
                          array.findIndex(
                            (item: any) =>
                              String(item.session_instance_id) === String(request.session_instance_id) &&
                              String(item.nz_bridge_number) === String(request.nz_bridge_number)
                          )
                      ).length;

                      const registeredPairCount =
                        supabaseTournamentPairRegistrations.filter(
                          (registration: any) =>
                            String(registration.session_instance_id) ===
                              String(session.session_instance_id) &&
                            String(registration.registration_status).trim() ===
                              "Registered"
                        ).length;

                      if (session.location_type === "Tournaments") {
                        return `${registeredPairCount} ${
                          registeredPairCount === 1 ? "pair" : "pairs"
                        } registered · ${uniqueLookingCount} ${
                          uniqueLookingCount === 1 ? "player" : "players"
                        } looking`;
                      }

                      const standbyCountRecord = directorStandbyCounts.find(
                        (standbyCount: any) =>
                          String(standbyCount.session_instance_id) ===
                          String(session.session_instance_id)
                      );

                      const standbyCount = Number(
                        standbyCountRecord?.standby_count || 0
                      );

                      const activeMatchCount = supabaseMatches.filter(
                        (match: any) =>
                          String(match.session_instance_id) ===
                            String(session.session_instance_id) &&
                          String(match.match_status).trim() === "Active"
                      ).length;

                      return isCurrentUserDirector ? (
                        <>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSessionReturnView("sessions");
                              setSelectedSessionId(
                                session.session_instance_id
                              );
                              setSessionDetailFilter("Active");
                              setView("sessionDetail");
                            }}
                            style={{
                              border: "none",
                              background: "transparent",
                              padding: 0,
                              color: "#4338ca",
                              fontSize: "14px",
                              fontWeight: 700,
                              cursor: "pointer",
                              textDecoration: "underline",
                              textUnderlineOffset: "3px",
                            }}
                          >
                            {uniqueLookingCount}{" "}
                            {uniqueLookingCount === 1 ? "player" : "players"}{" "}
                            looking
                          </button>

                          <span> · </span>

                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSessionReturnView("sessions");
                              setSelectedSessionId(
                                session.session_instance_id
                              );
                              setSessionDetailFilter("Standby");
                              setView("sessionDetail");
                            }}
                            style={{
                              border: "none",
                              background: "transparent",
                              padding: 0,
                              color: "#4338ca",
                              fontSize: "14px",
                              fontWeight: 700,
                              cursor: "pointer",
                              textDecoration: "underline",
                              textUnderlineOffset: "3px",
                            }}
                          >
                            {standbyCount}{" "}
                            {standbyCount === 1 ? "standby" : "standbys"}
                          </button>

                          <span> · </span>

                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSessionReturnView("sessions");
                              setSelectedSessionId(
                                session.session_instance_id
                              );
                              setSessionDetailFilter("Matched");
                              setView("sessionDetail");
                            }}
                            style={{
                              border: "none",
                              background: "transparent",
                              padding: 0,
                              color: "#4338ca",
                              fontSize: "14px",
                              fontWeight: 700,
                              cursor: "pointer",
                              textDecoration: "underline",
                              textUnderlineOffset: "3px",
                            }}
                          >
                            {activeMatchCount}{" "}
                            {activeMatchCount === 1 ? "match" : "matches"}
                          </button>
                        </>
                      ) : (
                        `${uniqueLookingCount} ${
                          uniqueLookingCount === 1 ? "player" : "players"
                        } looking`
                      );
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

                  {currentMemberCardStatus && (
                    <div
                      style={{
                        color: "#475569",
                        fontSize: "12px",
                        fontWeight: 700,
                        marginTop: "11px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {currentMemberCardStatus}
                    </div>
                  )}
                </div>
              </div>
            </Card>
              );
            })}

          <div style={{ height: "40px" }} />
        </div>

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
                Level:{" "}
                {visibleProfileDetail(
                  profileToView,
                  profileToView.level || profileToView.level_name,
                  profileToView.level_visible,
                  "Not completed"
                )}
              </div>

              <div style={styles.text}>
                Systems:{" "}
                {visibleProfileDetail(
                  profileToView,
                  profileToView.systems,
                  profileToView.systems_visible,
                  "Not completed"
                )}
              </div>

              <div style={styles.text}>
                Club:{" "}
                {visibleProfileDetail(
                  profileToView,
                  profileToView.clubs,
                  profileToView.club_visible,
                  "Not listed"
                )}
              </div>

              <div
                style={{
                  marginTop: "24px",
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                {String(profileToView.nz_bridge_number) !== String(currentMember?.nz_bridge_number) && (
                  <button
                    type="button"
                    onClick={() => {
                      setChatPartner(profileToView);
                      setChatReturnView(view);
                      setProfileToView(null);
                      setView("chat");
                    }}
                    style={{
                      background: "#2b8792",
                      color: "white",
                      border: "none",
                      borderRadius: "999px",
                      padding: "8px 16px",
                      fontSize: "14px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Chat
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setProfileToView(null)}
                  style={{
                    background: "#e0f2f4",
                    color: "#064e5f",
                    border: "none",
                    borderRadius: "999px",
                    padding: "8px 16px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    );
  }

    if (view === "tournamentDetail") {
    const selectedTournament = supabaseSessions.find(
      (session: any) =>
        String(session.session_instance_id) === String(selectedSessionId)
    );

    if (!selectedTournament) {
      return (
        <main style={styles.container}>
          <Card>Tournament not found.</Card>
        </main>
      );
    }

    const displayedTournamentDetailFilter =
      isCurrentUserDirector && tournamentDetailFilter === "My Status"
        ? "Looking"
        : tournamentDetailFilter;

    const tournamentRegisteringPlayerMatches =
      tournamentRegisteringPlayerSearch.trim().length >= 2
        ? supabaseMembers
            .filter((member: any) => {
              const searchValue = tournamentRegisteringPlayerSearch
                .trim()
                .toLowerCase();
              const memberSearchValue = `${member.first_name || ""} ${
                member.last_name || ""
              } ${member.nz_bridge_number || ""}`.toLowerCase();

              return (
                String(member.nz_bridge_number) !==
                  String(currentMember?.nz_bridge_number) &&
                memberSearchValue.includes(searchValue)
              );
            })
            .filter(
              (member: any, index: number, members: any[]) =>
                index ===
                members.findIndex(
                  (candidate: any) =>
                    String(candidate.nz_bridge_number) ===
                    String(member.nz_bridge_number)
                )
            )
            .slice(0, 10)
        : [];

    const tournamentPartnerMatches =
      tournamentPartnerSearch.trim().length >= 2
        ? supabaseMembers
            .filter((member: any) => {
              const searchValue = tournamentPartnerSearch.trim().toLowerCase();
              const memberSearchValue = `${member.first_name || ""} ${
                member.last_name || ""
              } ${member.nz_bridge_number || ""}`.toLowerCase();

              return (
                String(member.nz_bridge_number) !==
                  String(currentMember?.nz_bridge_number) &&
                String(member.nz_bridge_number) !==
                  String(
                    selectedTournamentRegisteringPlayer?.nz_bridge_number
                  ) &&
                memberSearchValue.includes(searchValue)
              );
            })
            .filter(
              (member: any, index: number, members: any[]) =>
                index ===
                members.findIndex(
                  (candidate: any) =>
                    String(candidate.nz_bridge_number) ===
                    String(member.nz_bridge_number)
                )
            )
            .slice(0, 10)
        : [];

    const tournamentMatches = supabaseMatches.filter(
      (match: any) =>
        String(match.session_instance_id) === String(selectedSessionId)
    );
    const activeTournamentMatches = tournamentMatches.filter(
      (match: any) => String(match.match_status).trim() === "Active"
    );
    const cancelledTournamentMatches = tournamentMatches.filter(
      (match: any) => String(match.match_status).trim() === "Cancelled"
    );
    const activeTournamentMatchedPlayerNumbers = activeTournamentMatches.flatMap(
      (match: any) => [
        String(match.requester_nz_bridge_number),
        String(match.partner_nz_bridge_number),
      ]
    );
    const tournamentStandbyItems = directorStandbyList.map((standby: any) => ({
      ...standby,
      member:
        supabaseMembers.find(
          (member: any) =>
            String(member.nz_bridge_number) ===
            String(standby.nz_bridge_number)
        ) || null,
    }));

    const tournamentPairItems = supabaseTournamentPairRegistrations
      .filter(
        (registration: any) =>
          String(registration.session_instance_id) === String(selectedSessionId)
      )
      .map((registration: any) => {
        const registeringMember = supabaseMembers.find(
          (member: any) =>
            String(member.nz_bridge_number) ===
            String(registration.registering_nz_bridge_number)
        );
        const partnerMember = registration.partner_nz_bridge_number
          ? supabaseMembers.find(
              (member: any) =>
                String(member.nz_bridge_number) ===
                String(registration.partner_nz_bridge_number)
            )
          : null;

        const registeringName = registeringMember
          ? `${registeringMember.first_name || ""} ${
              registeringMember.last_name || ""
            }`.trim()
          : `NZ Bridge #${registration.registering_nz_bridge_number}`;
        const partnerName = partnerMember
          ? `${partnerMember.first_name || ""} ${
              partnerMember.last_name || ""
            }`.trim()
          : `${registration.manual_partner_first_name || ""} ${
              registration.manual_partner_last_name || ""
            }`.trim();

        return {
          ...registration,
          registeringMember,
          partnerMember,
          registeringName,
          partnerName:
            partnerName ||
            `NZ Bridge #${registration.partner_nz_bridge_number || "Unknown"}`,
        };
      });

    const registeredTournamentPairs = tournamentPairItems.filter(
      (registration: any) =>
        String(registration.registration_status).trim() === "Registered"
    );

    const registeredTournamentPlayerNumbers = registeredTournamentPairs.flatMap(
      (registration: any) =>
        [
          registration.registering_nz_bridge_number,
          registration.partner_nz_bridge_number,
          registration.manual_partner_nz_bridge_number,
        ]
          .filter(Boolean)
          .map(String)
    );

    const cancelledTournamentPairs = tournamentPairItems.filter(
      (registration: any) =>
        String(registration.registration_status).trim() === "Cancelled"
    );

    const tournamentLookingRequests = supabaseRequestRecords
      .filter(
        (request: any) =>
          String(request.session_instance_id) === String(selectedSessionId) &&
          String(request.request_status).trim() === "Open"
      )
      .filter(
        (request: any, index: number, requests: any[]) =>
          index ===
          requests.findIndex(
            (item: any) =>
              String(item.nz_bridge_number) === String(request.nz_bridge_number)
          )
      )
      .map((request: any) => ({
        ...request,
        member: supabaseMembers.find(
          (member: any) =>
            String(member.nz_bridge_number) === String(request.nz_bridge_number)
        ),
        wanted_levels: Array.isArray(request.wanted_level_ids)
          ? request.wanted_level_ids
              .map(
                (levelId: any) =>
                  supabaseLevels.find(
                    (level: any) => Number(level.level_id) === Number(levelId)
                  )?.level_name
              )
              .filter(Boolean)
              .join(", ")
          : "",
        wanted_systems: Array.isArray(request.wanted_system_ids)
          ? request.wanted_system_ids
              .map(
                (systemId: any) =>
                  supabaseSystems.find(
                    (system: any) =>
                      Number(system.system_id) === Number(systemId)
                  )?.system_name
              )
              .filter(Boolean)
              .join(", ")
          : "",
      }))
      .sort((firstRequest: any, secondRequest: any) => {
        const firstRequestIsCurrentMember =
          String(firstRequest.nz_bridge_number) ===
          String(currentMember?.nz_bridge_number);
        const secondRequestIsCurrentMember =
          String(secondRequest.nz_bridge_number) ===
          String(currentMember?.nz_bridge_number);

        if (firstRequestIsCurrentMember !== secondRequestIsCurrentMember) {
          return firstRequestIsCurrentMember ? -1 : 1;
        }

        return (
          new Date(firstRequest.created_at).getTime() -
          new Date(secondRequest.created_at).getTime()
        );
      });

    const currentMemberTournamentLookingRequest =
      tournamentLookingRequests.find(
        (request: any) =>
          String(request.nz_bridge_number) ===
          String(currentMember?.nz_bridge_number)
      );

    const currentMemberTournamentRequestHasAnyInterest =
      !!currentMemberTournamentLookingRequest &&
      supabaseInterests.some(
        (interest: any) =>
          Number(interest.request_id) ===
          Number(currentMemberTournamentLookingRequest.request_id)
      );

    const currentMemberTournamentRegistration = currentMember?.nz_bridge_number
      ? registeredTournamentPairs.find((registration: any) =>
          [
            registration.registering_nz_bridge_number,
            registration.partner_nz_bridge_number,
            registration.manual_partner_nz_bridge_number,
          ].some(
            (playerNumber) =>
              String(playerNumber) ===
              String(currentMember.nz_bridge_number)
          )
        )
      : null;

    const currentMemberTournamentMatch = currentMember?.nz_bridge_number
      ? supabaseMatches.find(
          (match: any) =>
            String(match.session_instance_id) === String(selectedSessionId) &&
            String(match.match_status).trim() === "Active" &&
            [
              match.requester_nz_bridge_number,
              match.partner_nz_bridge_number,
            ].some(
              (playerNumber) =>
                String(playerNumber) ===
                String(currentMember.nz_bridge_number)
            )
        )
      : null;

    const currentMemberTournamentMatchPartnerNumber =
      currentMemberTournamentMatch && currentMember?.nz_bridge_number
        ? String(currentMemberTournamentMatch.requester_nz_bridge_number) ===
          String(currentMember.nz_bridge_number)
          ? currentMemberTournamentMatch.partner_nz_bridge_number
          : currentMemberTournamentMatch.requester_nz_bridge_number
        : null;

    const currentMemberTournamentMatchPartner =
      currentMemberTournamentMatchPartnerNumber
        ? supabaseMembers.find(
            (member: any) =>
              String(member.nz_bridge_number) ===
              String(currentMemberTournamentMatchPartnerNumber)
          )
        : null;

    const hasDirectorTournamentPartnerSearch = Boolean(
      directorMatchPartnerSearch.trim() ||
        directorMatchPartnerSurnameSearch.trim()
    );

    const directorTournamentPartnerFirstNameFilter =
      directorMatchPartnerSearch.trim().toLowerCase();

    const directorTournamentPartnerLastNameFilter =
      directorMatchPartnerSurnameSearch.trim().toLowerCase();

    const directorTournamentClubId = String(
      selectedTournament.club_id || currentMember?.club_id || ""
    );

    const directorSelectedTournamentClubId =
      directorMatchClubId || directorTournamentClubId;

    const directorTournamentClubMember = supabaseMembers.find(
      (member: any) =>
        String(member.club_id) === directorTournamentClubId &&
        String(member.clubs || member.club_name || "").trim()
    );

    const directorTournamentClubName = String(
      directorTournamentClubMember?.clubs ||
        directorTournamentClubMember?.club_name ||
        (String(currentMember?.club_id) === directorTournamentClubId
          ? currentMember?.clubs || currentMember?.club_name
          : "") ||
        "Tournament club"
    ).trim();

    const directorAvailableTournamentStandbyPartners = directorMatchRequest
      ? directorSelectedTournamentClubId === directorTournamentClubId
        ? directorStandbyList
            .filter(
              (standbyPlayer: any) =>
                String(standbyPlayer.nz_bridge_number) !==
                  String(directorMatchRequest.nz_bridge_number) &&
                String(standbyPlayer.nz_bridge_number) !==
                  String(currentMember?.nz_bridge_number) &&
                !activeTournamentMatchedPlayerNumbers.includes(
                  String(standbyPlayer.nz_bridge_number)
                ) &&
                !registeredTournamentPlayerNumbers.includes(
                  String(standbyPlayer.nz_bridge_number)
                ) &&
                String(standbyPlayer.first_name || "")
                  .toLowerCase()
                  .includes(directorTournamentPartnerFirstNameFilter) &&
                String(standbyPlayer.last_name || "")
                  .toLowerCase()
                  .includes(directorTournamentPartnerLastNameFilter)
            )
            .sort((firstPlayer: any, secondPlayer: any) =>
              `${firstPlayer.first_name || ""} ${
                firstPlayer.last_name || ""
              }`.localeCompare(
                `${secondPlayer.first_name || ""} ${
                  secondPlayer.last_name || ""
                }`
              )
            )
        : []
      : [];

    const directorAvailableTournamentStandbyNumbers =
      directorStandbyList.map((standbyPlayer: any) =>
        String(standbyPlayer.nz_bridge_number)
      );

    const directorAvailableTournamentMemberPartners =
      directorMatchRequest
        ? supabaseMembers
            .filter(
              (member: any, index: number, members: any[]) =>
                String(member.club_id) ===
                  directorSelectedTournamentClubId &&
                member.is_active !== false &&
                String(member.nz_bridge_number) !==
                  String(directorMatchRequest.nz_bridge_number) &&
                String(member.nz_bridge_number) !==
                  String(currentMember?.nz_bridge_number) &&
                !directorAvailableTournamentStandbyNumbers.includes(
                  String(member.nz_bridge_number)
                ) &&
                !activeTournamentMatchedPlayerNumbers.includes(
                  String(member.nz_bridge_number)
                ) &&
                !registeredTournamentPlayerNumbers.includes(
                  String(member.nz_bridge_number)
                ) &&
                String(member.first_name || "")
                  .toLowerCase()
                  .includes(directorTournamentPartnerFirstNameFilter) &&
                String(member.last_name || "")
                  .toLowerCase()
                  .includes(directorTournamentPartnerLastNameFilter) &&
                index ===
                  members.findIndex(
                    (candidate: any) =>
                      String(candidate.nz_bridge_number) ===
                      String(member.nz_bridge_number)
                  )
            )
            .sort((firstMember: any, secondMember: any) =>
              `${firstMember.first_name || ""} ${
                firstMember.last_name || ""
              }`.localeCompare(
                `${secondMember.first_name || ""} ${
                  secondMember.last_name || ""
                }`
              )
            )
        : [];

    function resetTournamentRegistrationForm() {
      setTournamentRegisteringPlayerSearch("");
      setSelectedTournamentRegisteringPlayer(null);
      setTournamentPartnerSearch("");
      setSelectedTournamentPartner(null);
      setUseManualTournamentPartner(false);
      setManualTournamentPartnerFirstName("");
      setManualTournamentPartnerLastName("");
      setManualTournamentPartnerNzBridgeNumber("");
      setManualTournamentPartnerClub("");
      setManualTournamentPartnerEmail("");
      setManualTournamentPartnerPhone("");
    }

    function openTournamentRegistrationModal() {
      resetTournamentRegistrationForm();
      setShowTournamentRegistrationModal(true);
    }

    function getTournamentMatchPlayers(match: any) {
      const requester = supabaseMembers.find(
        (member: any) =>
          String(member.nz_bridge_number) ===
          String(match.requester_nz_bridge_number)
      );
      const partner = supabaseMembers.find(
        (member: any) =>
          String(member.nz_bridge_number) ===
          String(match.partner_nz_bridge_number)
      );

      return [
        {
          member: requester,
          name: requester
            ? `${requester.first_name || ""} ${requester.last_name || ""}`.trim()
            : `NZ Bridge #${match.requester_nz_bridge_number}`,
          nzBridgeNumber: match.requester_nz_bridge_number,
        },
        {
          member: partner,
          name: partner
            ? `${partner.first_name || ""} ${partner.last_name || ""}`.trim()
            : `NZ Bridge #${match.partner_nz_bridge_number}`,
          nzBridgeNumber: match.partner_nz_bridge_number,
        },
      ];
    }

    function renderTournamentMatchList(
      matches: any[],
      emptyMessage: string,
      activityLabel?: string
    ) {
      if (matches.length === 0) {
        return <p style={styles.text}>{emptyMessage}</p>;
      }

      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[...matches]
            .sort((firstMatch: any, secondMatch: any) => {
              const firstCancellationTime =
                firstMatch.cancelled_at || firstMatch.created_at;

              const secondCancellationTime =
                secondMatch.cancelled_at || secondMatch.created_at;

              return (
                new Date(secondCancellationTime).getTime() -
                new Date(firstCancellationTime).getTime()
              );
            })
            .map((match: any) => {
              const [firstPlayer, secondPlayer] =
                getTournamentMatchPlayers(match);

              const cancelledByMember = supabaseMembers.find(
                (member: any) =>
                  String(member.nz_bridge_number) ===
                  String(match.cancelled_by_nz_bridge_number)
              );

              const cancelledByName = cancelledByMember
                ? `${cancelledByMember.first_name || ""} ${
                    cancelledByMember.last_name || ""
                  }`.trim()
                : match.cancelled_by_nz_bridge_number
                  ? `NZ Bridge #${match.cancelled_by_nz_bridge_number}`
                  : "Not recorded";

              return (
                <div
                  key={match.match_id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: activityLabel
                      ? "1fr 180px"
                      : "1fr 140px 140px",
                    gap: "16px",
                    alignItems: "start",
                    marginBottom: activityLabel ? "16px" : 0,
                  }}
                >
                  <div style={styles.lookingPlayerCard}>
                    <div style={{ fontSize: "16px" }}>
                      {renderTournamentRegistrationPlayerName(
                        firstPlayer.member,
                        firstPlayer.name,
                        firstPlayer.nzBridgeNumber
                      )}
                      {" with "}
                      {renderTournamentRegistrationPlayerName(
                        secondPlayer.member,
                        secondPlayer.name,
                        secondPlayer.nzBridgeNumber
                      )}
                    </div>

                    {activityLabel && (
                      <div
                        style={{
                          color: "#475569",
                          fontSize: "12px",
                          marginTop: "8px",
                        }}
                      >
                        <div>{activityLabel}</div>

                        <div style={{ marginTop: "3px" }}>
                          Cancelled by:{" "}
                          {match.cancelled_by_role === "Director"
                            ? `Director — ${cancelledByName}`
                            : cancelledByName}
                        </div>

                        {match.note && (
                          <div style={{ marginTop: "3px" }}>
                            Reason: {match.note}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {activityLabel ? (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        minWidth: "180px",
                      }}
                    >
                      {match.cancelled_at && (
                        <div
                          style={{
                            color: "#64748b",
                            fontSize: "12px",
                            whiteSpace: "nowrap",
                            textAlign: "right",
                          }}
                        >
                          {new Date(match.cancelled_at).toLocaleString(
                            "en-NZ",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            }
                          )}
                        </div>
                      )}
                    </div>
                  ) : isCurrentUserDirector ? (
                    <>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <button
                          type="button"
                          style={styles.matchButton}
                          onClick={() => {
                            // TODO: Register Pair
                          }}
                        >
                          Register Pair
                        </button>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <button
                          type="button"
                          style={styles.matchButton}
                          onClick={() => {
                            setMatchToCancel(match);
                            setMatchCancelReason("");
                          }}
                        >
                          Cancel Match
                        </button>
                      </div>
                    </>
                  ) : null}
                </div>
              );
            })}
        </div>
      );
    }

    function renderTournamentStandbyList() {
      if (tournamentStandbyItems.length === 0) {
        return <p style={styles.text}>No players are currently on standby.</p>;
      }

      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {tournamentStandbyItems.map((standby: any) => {
            const playerName = standby.member
              ? `${standby.member.first_name || ""} ${
                  standby.member.last_name || ""
                }`.trim()
              : `${standby.first_name || ""} ${standby.last_name || ""}`.trim() ||
                `NZ Bridge #${standby.nz_bridge_number}`;
            const playingLevels = Array.isArray(standby.playing_level_ids)
              ? standby.playing_level_ids
                  .map(
                    (levelId: any) =>
                      supabaseLevels.find(
                        (level: any) =>
                          Number(level.level_id) === Number(levelId)
                      )?.level_name
                  )
                  .filter(Boolean)
                  .join(", ")
              : "";
            const systems = Array.isArray(standby.system_ids)
              ? standby.system_ids
                  .map(
                    (systemId: any) =>
                      supabaseSystems.find(
                        (system: any) =>
                          Number(system.system_id) === Number(systemId)
                      )?.system_name
                  )
                  .filter(Boolean)
                  .join(", ")
              : "";

            return (
              <div
                key={standby.standby_id}
                style={{
                  border: "1px solid #cbd5e1",
                  borderRadius: "12px",
                  background: "#f8fafc",
                  padding: "14px",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "16px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div style={{ fontSize: "16px" }}>
                    {renderTournamentRegistrationPlayerName(
                      standby.member,
                      playerName,
                      standby.nz_bridge_number
                    )}
                  </div>
                  {(playingLevels || systems) && (
                    <div style={{ ...styles.smallText, marginTop: "6px" }}>
                      {[playingLevels, systems].filter(Boolean).join(" · ")}
                    </div>
                  )}
                  {standby.phone && (
                    <div style={{ ...styles.smallText, marginTop: "4px" }}>
                      Phone: {standby.phone}
                    </div>
                  )}
                </div>
                <div style={{ color: "#0f766e", fontSize: "13px", fontWeight: 700 }}>
                  {standby.standby_status || "Available"}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    async function cancelCurrentMemberTournamentRegistration() {
      if (
        !currentMemberTournamentRegistration ||
        !currentMember?.nz_bridge_number
      ) {
        return;
      }

      const confirmed = window.confirm(
        "Are you sure you want to cancel this tournament registration? This will cancel the pair for both players."
      );

      if (!confirmed) return;

      const registrationId = Number(
        currentMemberTournamentRegistration.registration_id
      );
      setCancellingTournamentRegistrationId(registrationId);

      try {
        const { error: cancellationError } = await supabase.rpc(
          "cancel_tournament_pair",
          {
            p_registration_id: registrationId,
            p_cancelling_nz_bridge_number: Number(
              currentMember.nz_bridge_number
            ),
          }
        );

        if (cancellationError) {
          console.error(
            "Tournament registration cancellation error:",
            JSON.stringify(cancellationError, null, 2)
          );
          alert(
            `Registration could not be cancelled: ${
              cancellationError.message || "Unknown Supabase error"
            }`
          );
          return;
        }

        await refreshSupabaseData();
        setTournamentDetailFilter("Cancelled");
        alert("Tournament registration cancelled.");
      } catch (cancellationException) {
        console.error(
          "Unexpected tournament cancellation error:",
          cancellationException
        );
        alert("Registration could not be cancelled. Please try again.");
      } finally {
        setCancellingTournamentRegistrationId(null);
      }
    }

    async function cancelCurrentTournamentStandby() {
      if (
        !currentStandbyRecord ||
        !selectedSessionId ||
        !currentMember?.nz_bridge_number
      ) {
        return;
      }

      const { data: standbyCancelled, error: cancelStandbyError } =
        await supabase.rpc("cancel_player_standby", {
          p_standby_id: Number(currentStandbyRecord.standby_id),
          p_session_instance_id: selectedSessionId,
          p_nz_bridge_number: Number(currentMember.nz_bridge_number),
        });

      if (cancelStandbyError) {
        console.error(
          "Cancel tournament standby error:",
          JSON.stringify(cancelStandbyError, null, 2)
        );
        return;
      }

      if (standbyCancelled !== true) {
        alert("Standby could not be cancelled.");
        return;
      }

      setCurrentStandbyRecord(null);
      await refreshSupabaseData();
    }

    async function saveCurrentTournamentStandby() {
      if (!selectedSessionId || !currentMember?.nz_bridge_number) return;

      if (!standbyPhone.trim()) {
        alert("Please enter your phone number.");
        return;
      }

      if (standbyLevelIds.length === 0) {
        alert("Please select at least one playing level.");
        return;
      }

      if (standbySystemIds.length === 0) {
        alert("Please select at least one system.");
        return;
      }

      const { data: existingStandbyRows, error: existingStandbyError } =
        await supabase
          .from("session_standby")
          .select("standby_id")
          .eq("session_instance_id", selectedSessionId)
          .eq("nz_bridge_number", Number(currentMember.nz_bridge_number))
          .eq("standby_status", "Available");

      if (existingStandbyError) {
        console.error(
          "Check tournament standby error:",
          existingStandbyError
        );
        return;
      }

      if (existingStandbyRows && existingStandbyRows.length > 0) {
        alert("You are already registered as standby for this tournament.");
        return;
      }

      const { error: insertStandbyError } = await supabase
        .from("session_standby")
        .insert({
          session_instance_id: selectedSessionId,
          nz_bridge_number: Number(currentMember.nz_bridge_number),
          standby_status: "Available",
          phone: standbyPhone.trim(),
          playing_level_ids: standbyLevelIds,
          system_ids: standbySystemIds,
          update_profile: standbyUpdateProfile,
          note: standbyNote.trim() || null,
        });

      if (insertStandbyError) {
        console.error(
          "Insert tournament standby error:",
          JSON.stringify(insertStandbyError, null, 2)
        );
        alert(
          `Standby could not be saved: ${
            insertStandbyError.message || "Unknown Supabase error"
          }`
        );
        return;
      }

      const { data: standbyStatusData, error: standbyStatusError } =
        await supabase.rpc("get_player_standby_status", {
          p_session_instance_id: selectedSessionId,
          p_nz_bridge_number: Number(currentMember.nz_bridge_number),
        });

      if (standbyStatusError) {
        console.error(
          "Refresh tournament standby status error:",
          JSON.stringify(standbyStatusError, null, 2)
        );
      } else {
        setCurrentStandbyRecord(
          standbyStatusData && standbyStatusData.length > 0
            ? standbyStatusData[0]
            : null
        );
      }

      await refreshSupabaseData();
      setShowStandbyModal(false);
      setStandbyPhone("");
      setStandbyLevelIds([]);
      setStandbySystemIds([]);
      setStandbyUpdateProfile(true);
      setStandbyNote("");
    }

    async function expressTournamentInterest(request: any) {
      if (!currentMember?.nz_bridge_number) return;

      const { data: existingInterests, error: existingInterestError } =
        await supabase
          .from("interests")
          .select("interest_id, interest_status")
          .eq("request_id", request.request_id)
          .eq(
            "interested_nz_bridge_number",
            Number(currentMember.nz_bridge_number)
          );

      if (existingInterestError) {
        console.error(
          "Check tournament interest error:",
          existingInterestError
        );
        return;
      }

      const existingActiveInterest = existingInterests?.find(
        (interest: any) =>
          !["Cancelled", "Closed", "Withdrawn"].includes(
            String(interest.interest_status).trim()
          )
      );

      if (existingActiveInterest) {
        await refreshSupabaseData();
        return;
      }

      const { error: insertInterestError } = await supabase
        .from("interests")
        .insert({
          request_id: Number(request.request_id),
          interested_nz_bridge_number: Number(
            currentMember.nz_bridge_number
          ),
          interest_status: "Pending",
          note: null,
        });

      if (insertInterestError) {
        console.error(
          "Insert tournament interest error:",
          insertInterestError
        );
        return;
      }

      const {
        data: insertedInterestRecord,
        error: insertedInterestLookupError,
      } = await supabase
        .from("interests")
        .select("interest_id")
        .eq("request_id", Number(request.request_id))
        .eq(
          "interested_nz_bridge_number",
          Number(currentMember.nz_bridge_number)
        )
        .eq("interest_status", "Pending")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (insertedInterestLookupError) {
        console.error(
          "Tournament interest lookup error:",
          insertedInterestLookupError
        );
      }

      const { error: insertNotificationError } = await supabase
        .from("notifications")
        .insert({
          nz_bridge_number: Number(request.nz_bridge_number),
          session_instance_id: selectedSessionId,
          request_id: Number(request.request_id),
          interest_id: insertedInterestRecord?.interest_id
            ? Number(insertedInterestRecord.interest_id)
            : null,
          notification_type: "InterestReceived",
          message: `${currentMember.first_name} ${currentMember.last_name} expressed interest in partnering with you for ${selectedTournament.session_name}.`,
          is_read: false,
        });

      if (insertNotificationError) {
        console.error(
          "Insert tournament interest notification error:",
          JSON.stringify(insertNotificationError, null, 2)
        );
      }

      await refreshSupabaseData();
    }

    async function withdrawTournamentInterest(request: any) {
      if (!currentMember?.nz_bridge_number) return;

      const { error: withdrawInterestError } = await supabase
        .from("interests")
        .update({ interest_status: "Cancelled" })
        .eq("request_id", Number(request.request_id))
        .eq(
          "interested_nz_bridge_number",
          Number(currentMember.nz_bridge_number)
        )
        .eq("interest_status", "Pending");

      if (withdrawInterestError) {
        console.error(
          "Withdraw tournament interest error:",
          withdrawInterestError
        );
        return;
      }

      await refreshSupabaseData();
    }

    async function respondToTournamentInterest(
      interest: any,
      outcome: "match" | "register" | "decline",
      declineReasonValue: string | null = null
    ) {
      if (!currentMember?.nz_bridge_number || !interest?.interest_id) return;

      setIsTournamentInterestResponding(true);

      try {
        const { error: responseError } = await supabase.rpc(
          "respond_to_tournament_interest",
          {
            p_interest_id: Number(interest.interest_id),
            p_responding_nz_bridge_number: Number(
              currentMember.nz_bridge_number
            ),
            p_outcome: outcome,
            p_decline_reason: declineReasonValue,
          }
        );

        if (responseError) {
          console.error(
            "Tournament interest response error:",
            JSON.stringify(responseError, null, 2)
          );
          alert(
            `Interest could not be updated: ${
              responseError.message || "Unknown Supabase error"
            }`
          );
          return;
        }

        await refreshSupabaseData();
        setTournamentInterestToAccept(null);
        setTournamentInterestToDecline(null);
        setTournamentDeclineReason("");
        setTournamentDetailFilter(
          outcome === "register" ? "Registered" : outcome === "match" ? "My Status" : "Looking"
        );
      } finally {
        setIsTournamentInterestResponding(false);
      }
    }

    async function registerCurrentTournamentMatch() {
      if (
        !selectedSessionId ||
        !currentMember?.nz_bridge_number ||
        !currentMemberTournamentMatchPartnerNumber
      ) {
        return;
      }

      const { error: registrationError } = await supabase.rpc(
        "register_tournament_pair",
        {
          p_session_instance_id: String(selectedSessionId),
          p_registering_nz_bridge_number: Number(
            currentMember.nz_bridge_number
          ),
          p_partner_nz_bridge_number: Number(
            currentMemberTournamentMatchPartnerNumber
          ),
        }
      );

      if (registrationError) {
        console.error(
          "Register matched tournament pair error:",
          JSON.stringify(registrationError, null, 2)
        );
        alert(
          `Pair could not be registered: ${
            registrationError.message || "Unknown Supabase error"
          }`
        );
        return;
      }

      await refreshSupabaseData();
      setTournamentDetailFilter("Registered");
    }

    function renderTournamentRegistrationPlayerName(
      member: any,
      name: string,
      nzBridgeNumber: any
    ) {
      const isCurrentMember =
        !isCurrentUserDirector &&
        String(nzBridgeNumber) === String(currentMember?.nz_bridge_number);
      const canOpenProfile = !!member && !isCurrentMember;

      return (
        <>
          <span
            style={{
              color: canOpenProfile ? "#4338ca" : "inherit",
              fontWeight: 700,
              cursor: canOpenProfile ? "pointer" : "default",
              textDecoration: canOpenProfile ? "underline" : "none",
              textUnderlineOffset: "3px",
            }}
            onClick={(event) => {
              if (!canOpenProfile) return;
              event.stopPropagation();
              setProfileToView(member);
            }}
          >
            {name}
          </span>
          {isCurrentMember && <span style={{ fontWeight: 400 }}> (You)</span>}
        </>
      );
    }

    function getTournamentPairDisplayPlayers(registration: any) {
      const registeringPlayer = {
        member: registration.registeringMember,
        name: registration.registeringName,
        nzBridgeNumber: registration.registering_nz_bridge_number,
      };
      const partnerPlayer = {
        member: registration.partnerMember,
        name: registration.partnerName,
        nzBridgeNumber:
          registration.partner_nz_bridge_number ||
          registration.manual_partner_nz_bridge_number,
      };

      const partnerIsCurrentMember =
        String(partnerPlayer.nzBridgeNumber) ===
        String(currentMember?.nz_bridge_number);

      return partnerIsCurrentMember
        ? [partnerPlayer, registeringPlayer]
        : [registeringPlayer, partnerPlayer];
    }

    const currentMemberTournamentPartner =
      currentMemberTournamentRegistration
        ? getTournamentPairDisplayPlayers(
            currentMemberTournamentRegistration
          )[1]
        : null;

    function renderTournamentPairList(
      pairs: any[],
      emptyMessage: string,
      activityLabel?: string
    ) {
      if (pairs.length === 0) {
        return <p style={styles.text}>{emptyMessage}</p>;
      }

      const sortedPairs = [...pairs].sort((firstPair, secondPair) => {
        const firstPairHasCurrentMember = getTournamentPairDisplayPlayers(
          firstPair
        ).some(
          (player) =>
            !!currentMember?.nz_bridge_number &&
            String(player.nzBridgeNumber) ===
            String(currentMember?.nz_bridge_number)
        );
        const secondPairHasCurrentMember = getTournamentPairDisplayPlayers(
          secondPair
        ).some(
          (player) =>
            !!currentMember?.nz_bridge_number &&
            String(player.nzBridgeNumber) ===
            String(currentMember?.nz_bridge_number)
        );

        if (firstPairHasCurrentMember !== secondPairHasCurrentMember) {
          return firstPairHasCurrentMember ? -1 : 1;
        }

        if (tournamentPairSort === "registrationNewest") {
          return (
            new Date(secondPair.created_at).getTime() -
            new Date(firstPair.created_at).getTime()
          );
        }

        if (tournamentPairSort === "registrationOldest") {
          return (
            new Date(firstPair.created_at).getTime() -
            new Date(secondPair.created_at).getTime()
          );
        }

        const firstPairName = getTournamentPairDisplayPlayers(firstPair)
          .map((player) => player.name)
          .join(" ");
        const secondPairName = getTournamentPairDisplayPlayers(secondPair)
          .map((player) => player.name)
          .join(" ");
        const nameComparison = firstPairName.localeCompare(secondPairName, "en-NZ", {
          sensitivity: "base",
        });

        return tournamentPairSort === "nameDesc"
          ? -nameComparison
          : nameComparison;
      });

      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {sortedPairs.map((registration: any) => {
            const [firstPlayer, secondPlayer] =
              getTournamentPairDisplayPlayers(registration);

            return (
              <div
                key={registration.registration_id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 180px",
                  gap: "16px",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <div style={styles.lookingPlayerCard}>
                  <div style={{ fontSize: "16px" }}>
                    {renderTournamentRegistrationPlayerName(
                      firstPlayer.member,
                      firstPlayer.name,
                      firstPlayer.nzBridgeNumber
                    )}
                    {" with "}
                    {renderTournamentRegistrationPlayerName(
                      secondPlayer.member,
                      secondPlayer.name,
                      secondPlayer.nzBridgeNumber
                    )}
                  </div>

                  {activityLabel &&
                    (() => {
                      const cancelledByMember = supabaseMembers.find(
                        (member: any) =>
                          String(member.nz_bridge_number) ===
                          String(
                            registration.cancelled_by_nz_bridge_number
                          )
                      );

                      const cancelledByName = cancelledByMember
                        ? `${cancelledByMember.first_name || ""} ${
                            cancelledByMember.last_name || ""
                          }`.trim()
                        : registration.cancelled_by_nz_bridge_number
                          ? `NZ Bridge #${registration.cancelled_by_nz_bridge_number}`
                          : "Not recorded";

                      return (
                        <div
                          style={{
                            color: "#475569",
                            fontSize: "12px",
                            marginTop: "8px",
                          }}
                        >
                          <div>{activityLabel}</div>

                          <div style={{ marginTop: "3px" }}>
                            Cancelled by:{" "}
                            {registration.cancelled_by_role === "Director"
                              ? `Director — ${cancelledByName}`
                              : cancelledByName}
                          </div>

                          {registration.cancellation_reason && (
                            <div style={{ marginTop: "3px" }}>
                              Reason: {registration.cancellation_reason}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "flex-end",
                    minWidth: "180px",
                  }}
                >
                  {activityLabel ? (
                    registration.cancelled_at ? (
                      <div
                        style={{
                          color: "#64748b",
                          fontSize: "12px",
                          whiteSpace: "nowrap",
                          textAlign: "right",
                        }}
                      >
                        {new Date(
                          registration.cancelled_at
                        ).toLocaleString("en-NZ", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </div>
                    ) : null
                  ) : isCurrentUserDirector ? (
                    <button
                      type="button"
                      disabled={
                        cancellingTournamentRegistrationId ===
                        Number(registration.registration_id)
                      }
                      onClick={async () => {
                        const confirmed = window.confirm(
                          "Are you sure you want to cancel this tournament registration? This will cancel the pair for both players."
                        );

                        if (!confirmed) return;

                        const registrationId = Number(
                          registration.registration_id
                        );

                        setCancellingTournamentRegistrationId(registrationId);

                        const { error } = await supabase.rpc(
                          "cancel_tournament_pair",
                          {
                            p_registration_id: registrationId,
                            p_cancelling_nz_bridge_number: Number(
                              currentMember.nz_bridge_number
                            ),
                          }
                        );

                        if (error) {
                          console.error(
                            "Director tournament registration cancellation error:",
                            JSON.stringify(error, null, 2)
                          );
                          alert(
                            `Registration could not be cancelled: ${
                              error.message || "Unknown Supabase error"
                            }`
                          );
                          setCancellingTournamentRegistrationId(null);
                          return;
                        }

                        await refreshSupabaseData();
                        setCancellingTournamentRegistrationId(null);
                      }}
                      style={{
                        ...styles.matchButton,
                        opacity:
                          cancellingTournamentRegistrationId ===
                          Number(registration.registration_id)
                            ? 0.65
                            : 1,
                        cursor:
                          cancellingTournamentRegistrationId ===
                          Number(registration.registration_id)
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      {cancellingTournamentRegistrationId ===
                      Number(registration.registration_id)
                        ? "Cancelling..."
                        : "Cancel Registration"}
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    function renderTournamentPairSortControl() {
      return (
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#475569",
            fontSize: "13px",
          }}
        >
          Sort by
          <select
            value={tournamentPairSort}
            onChange={(event) => setTournamentPairSort(event.target.value)}
            style={{
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
              background: "white",
              color: "#1e293b",
              padding: "6px 10px",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            <option value="nameAsc">Name: A–Z</option>
            <option value="nameDesc">Name: Z–A</option>
            <option value="registrationNewest">
              Registration: newest first
            </option>
            <option value="registrationOldest">
              Registration: oldest first
            </option>
          </select>
        </label>
      );
    }

    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <Nav
            view={view}
            setView={navigateFromSessionDetail}
            notifications={notifications}
            unreadNotifications={unreadNotifications}
            unreadChatCount={unreadChatCount}
            matchCount={filteredMatches.length}
          />

          {!isCurrentUserDirector && (
            <PersonalMenu
              view={view}
              setView={navigateFromSessionDetail}
              unreadNotifications={unreadNotifications}
              unreadChatCount={unreadChatCount}
              matchCount={filteredMatches.length}
            />
          )}

          <div style={styles.detailTabBar}>
          {(isCurrentUserDirector
            ? ["Looking", "Registered", "Matched", "Cancelled", "Standby"]
            : ["My Status", "Registered", "Looking", "Cancelled"]
            ).map((filterName) => (
                <button
                  key={filterName}
                  type="button"
                  onClick={() => setTournamentDetailFilter(filterName)}
                  style={{
                    ...styles.detailTab,
                    ...(displayedTournamentDetailFilter === filterName
                      ? styles.detailTabActive
                      : {}),
                  }}
                >
                  {filterName}
                </button>
              ))}
          </div>

          <Card>
            <div
              style={{
                color: "#334155",
                fontSize: "14px",
                marginBottom: "20px",
              }}
            >
              <span
                onClick={() => {
                  setScrollToSessionId(selectedSessionId);
                  setView("sessions");
                }}
                style={{
                  color: "#4338ca",
                  fontWeight: 400,
                  fontSize: "14px",
                  cursor: "pointer",
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                }}
              >
                {new Date(
                  selectedTournament.session_date + "T00:00:00"
                ).toLocaleDateString("en-NZ", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
                {" · "}
                {selectedTournament.start_time?.slice(0, 5)}
              </span>

              <span
                style={{
                  color: "#1e293b",
                  marginLeft: "8px",
                }}
              >
                {selectedTournament.session_name}
              </span>

              <span
                style={{
                  color: "#dc2626",
                  fontWeight: 400,
                  marginLeft: "6px",
                }}
              >
                (Tournament)
              </span>
            </div>

            {!isCurrentUserDirector &&
              displayedTournamentDetailFilter === "My Status" && (
              <div>
                {currentMemberTournamentRegistration ? (
                  <>
                    <button
                      type="button"
                      disabled={
                        cancellingTournamentRegistrationId ===
                        Number(
                          currentMemberTournamentRegistration.registration_id
                        )
                      }
                      onClick={cancelCurrentMemberTournamentRegistration}
                      style={{
                        ...styles.matchButton,
                        cursor:
                          cancellingTournamentRegistrationId ===
                          Number(
                            currentMemberTournamentRegistration.registration_id
                          )
                            ? "not-allowed"
                            : "pointer",
                        opacity:
                          cancellingTournamentRegistrationId ===
                          Number(
                            currentMemberTournamentRegistration.registration_id
                          )
                            ? 0.65
                            : 1,
                      }}
                    >
                      {cancellingTournamentRegistrationId ===
                      Number(
                        currentMemberTournamentRegistration.registration_id
                      )
                        ? "Cancelling..."
                        : "Cancel registration"}
                    </button>
                    <MyStatusSummary
                      status="REGISTERED"
                      onClick={() => setTournamentDetailFilter("Registered")}
                    >
                      You are registered with{" "}
                      {currentMemberTournamentPartner
                        ? renderTournamentRegistrationPlayerName(
                            currentMemberTournamentPartner.member,
                            currentMemberTournamentPartner.name,
                            currentMemberTournamentPartner.nzBridgeNumber
                          )
                        : "your partner"}{" "}
                      for this tournament.
                    </MyStatusSummary>
                  </>
                ) : currentMemberTournamentMatch ? (
                  <>
                    <button
                      type="button"
                      onClick={registerCurrentTournamentMatch}
                      style={{
                        ...styles.matchButton,
                        background: "#267c89",
                        color: "white",
                      }}
                    >
                      Register Pair
                    </button>
                    <MyStatusSummary
                      status="MATCHED"
                      onClick={() => setView("matches")}
                    >
                      You are matched with{" "}
                      {currentMemberTournamentMatchPartner
                        ? renderTournamentRegistrationPlayerName(
                            currentMemberTournamentMatchPartner,
                            `${currentMemberTournamentMatchPartner.first_name || ""} ${
                              currentMemberTournamentMatchPartner.last_name || ""
                            }`.trim(),
                            currentMemberTournamentMatchPartnerNumber
                          )
                        : `NZ Bridge #${currentMemberTournamentMatchPartnerNumber}`}{" "}
                      for this tournament.
                    </MyStatusSummary>
                  </>
                ) : currentMemberTournamentLookingRequest ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        if (currentMemberTournamentRequestHasAnyInterest) {
                          setRequestToRemove(
                            currentMemberTournamentLookingRequest
                          );
                          return;
                        }

                        setWantedLevel(
                          currentMemberTournamentLookingRequest.wanted_levels
                            ? currentMemberTournamentLookingRequest.wanted_levels
                                .split(",")
                                .map((item: string) => item.trim())
                                .filter(Boolean)
                                .join(",")
                            : ""
                        );
                        setWantedSystems(
                          currentMemberTournamentLookingRequest.wanted_systems
                            ? currentMemberTournamentLookingRequest.wanted_systems
                                .split(",")
                                .map((item: string) => item.trim())
                            : []
                        );
                        setShowRequestTypeModal(true);
                      }}
                      style={styles.matchButton}
                    >
                      {currentMemberTournamentRequestHasAnyInterest
                        ? "Remove looking request"
                        : "Edit / Remove looking request"}
                    </button>
                    <MyStatusSummary
                      status="LOOKING"
                      onClick={() => setTournamentDetailFilter("Looking")}
                    >
                      You are on the tournament looking list.
                    </MyStatusSummary>
                  </>
                ) : currentStandbyRecord ? (
                  <>
                    <button
                      type="button"
                      onClick={cancelCurrentTournamentStandby}
                      style={styles.matchButton}
                    >
                      Cancel standby
                    </button>
                    <MyStatusSummary status="STANDBY">
                      You are available as standby for this tournament.
                    </MyStatusSummary>
                  </>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setTournamentPartnerSearch("");
                        setSelectedTournamentPartner(null);
                        setUseManualTournamentPartner(false);
                        setManualTournamentPartnerFirstName("");
                        setManualTournamentPartnerLastName("");
                        setManualTournamentPartnerNzBridgeNumber("");
                        setManualTournamentPartnerClub("");
                        setManualTournamentPartnerEmail("");
                        setManualTournamentPartnerPhone("");
                        setShowTournamentRegistrationModal(true);
                      }}
                      style={{
                        ...styles.matchButton,
                        background: "#267c89",
                        color: "white",
                      }}
                    >
                      Register Pair
                    </button>

                    <button
                      type="button"
                      onClick={openNewLookingRequestModal}
                      style={{
                        ...styles.matchButton,
                        background: "#267c89",
                        color: "white",
                      }}
                    >
                      Add me to looking list
                    </button>

                    <button
                      type="button"
                      onClick={openNewStandbyModal}
                      style={{
                        ...styles.matchButton,
                        background: "#267c89",
                        color: "white",
                      }}
                    >
                      Add me as standby
                    </button>
                  </div>
                )}
              </div>
            )}

            {displayedTournamentDetailFilter === "Registered" && (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      isCurrentUserDirector || currentMemberTournamentRegistration
                      ? "space-between"
                      : "flex-end",
                    alignItems: "center",
                    gap: "12px",
                    flexWrap: "wrap",
                    marginBottom: "18px",
                  }}
                >
                  {isCurrentUserDirector && (
                    <button
                      type="button"
                      onClick={openTournamentRegistrationModal}
                      style={{
                        ...styles.matchButton,
                        background: "#267c89",
                        color: "white",
                      }}
                    >
                      Register Pair
                    </button>
                  )}

                  {!isCurrentUserDirector &&
                    currentMemberTournamentRegistration && (
                    <button
                      type="button"
                      disabled={
                        cancellingTournamentRegistrationId ===
                        Number(
                          currentMemberTournamentRegistration.registration_id
                        )
                      }
                      onClick={cancelCurrentMemberTournamentRegistration}
                      style={{
                        ...styles.matchButton,
                        cursor:
                          cancellingTournamentRegistrationId ===
                          Number(
                            currentMemberTournamentRegistration.registration_id
                          )
                            ? "not-allowed"
                            : "pointer",
                        opacity:
                          cancellingTournamentRegistrationId ===
                          Number(
                            currentMemberTournamentRegistration.registration_id
                          )
                            ? 0.65
                            : 1,
                      }}
                    >
                      {cancellingTournamentRegistrationId ===
                      Number(
                        currentMemberTournamentRegistration.registration_id
                      )
                        ? "Cancelling..."
                        : "Cancel registration"}
                    </button>
                  )}

                  {renderTournamentPairSortControl()}
                </div>

                {renderTournamentPairList(
                  registeredTournamentPairs,
                  "No pairs are registered yet."
                )}
              </>
            )}

            {displayedTournamentDetailFilter === "Looking" && (
              <>

                {tournamentLookingRequests.length === 0 ? (
                  <p style={styles.text}>
                    No players are looking for a partner yet.
                  </p>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    {tournamentLookingRequests.map((request: any) => {
                      const playerName = request.member
                        ? `${request.member.first_name || ""} ${
                            request.member.last_name || ""
                          }`.trim()
                        : `NZ Bridge #${request.nz_bridge_number}`;
                      const isOwnRequest =
                        String(request.nz_bridge_number) ===
                        String(currentMember?.nz_bridge_number);
                      const requestPlayerAlreadyAssigned =
                        activeTournamentMatchedPlayerNumbers.includes(
                          String(request.nz_bridge_number)
                        ) ||
                        registeredTournamentPlayerNumbers.includes(
                          String(request.nz_bridge_number)
                        );
                      const requestHasAnyInterest = supabaseInterests.some(
                        (interest: any) =>
                          Number(interest.request_id) ===
                          Number(request.request_id)
                      );
                      const currentPendingInterest = supabaseInterests.find(
                        (interest: any) =>
                          Number(interest.request_id) ===
                            Number(request.request_id) &&
                          Number(interest.interested_nz_bridge_number) ===
                            Number(currentMember?.nz_bridge_number) &&
                          String(interest.interest_status).trim() === "Pending"
                      );
                      const currentDeclinedInterest = supabaseInterests.find(
                        (interest: any) =>
                          Number(interest.request_id) ===
                            Number(request.request_id) &&
                          Number(interest.interested_nz_bridge_number) ===
                            Number(currentMember?.nz_bridge_number) &&
                          String(interest.interest_status).trim() === "Declined"
                      );
                      const pendingInterestedPlayers = supabaseInterests
                        .filter(
                          (interest: any) =>
                            Number(interest.request_id) ===
                              Number(request.request_id) &&
                            String(interest.interest_status).trim() === "Pending"
                        )
                        .map((interest: any) => ({
                          ...interest,
                          member: supabaseMembers.find(
                            (member: any) =>
                              String(member.nz_bridge_number) ===
                              String(interest.interested_nz_bridge_number)
                          ),
                        }));

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
                          <div style={styles.lookingPlayerCard}>
                            <div>
                              <div
                                style={{ fontSize: "16px" }}
                              >
                                {renderTournamentRegistrationPlayerName(
                                  request.member,
                                  playerName,
                                  request.nz_bridge_number
                                )}
                              </div>
                            </div>

                            {!isOwnRequest &&
                              !isCurrentUserDirector &&
                              renderVisiblePlayerCardDetails(
                                request.nz_bridge_number
                              )}

                            {renderLookingPreferences(request)}

                            {isOwnRequest && !isCurrentUserDirector && (
                              <div style={{ marginTop: "16px" }}>
                                {pendingInterestedPlayers.length === 0 ? (
                                  <div style={styles.smallText}>
                                    No interested players yet.
                                  </div>
                                ) : (
                                  <>
                                    <div style={styles.text}>
                                      Interested players:
                                    </div>
                                    {pendingInterestedPlayers.map(
                                      (interest: any) => {
                                        const interestedName = interest.member
                                          ? `${interest.member.first_name || ""} ${
                                              interest.member.last_name || ""
                                            }`.trim()
                                          : `NZ Bridge #${interest.interested_nz_bridge_number}`;

                                        return (
                                          <div
                                            key={interest.interest_id}
                                            style={styles.interestedPlayerCard}
                                          >
                                            {renderTournamentRegistrationPlayerName(
                                              interest.member,
                                              interestedName,
                                              interest.interested_nz_bridge_number
                                            )}

                                            {renderVisiblePlayerCardDetails(
                                              interest.interested_nz_bridge_number
                                            )}

                                            <div style={styles.buttonRow}>
                                              <button
                                                type="button"
                                                style={styles.compactPrimaryAction}
                                                onClick={() =>
                                                  setTournamentInterestToAccept(
                                                    interest
                                                  )
                                                }
                                              >
                                                Accept
                                              </button>

                                              <button
                                                type="button"
                                                style={styles.compactPrimaryAction}
                                                onClick={() => {
                                                  setTournamentInterestToDecline(
                                                    interest
                                                  );
                                                  setTournamentDeclineReason("");
                                                }}
                                              >
                                                Decline
                                              </button>
                                            </div>
                                          </div>
                                        );
                                      }
                                    )}
                                  </>
                                )}
                              </div>
                            )}
                          </div>

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "flex-end",
                              minWidth: "180px",
                            }}
                          >
                            {isCurrentUserDirector &&
                            requestPlayerAlreadyAssigned ? (
                              <div
                                style={{
                                  color: "#64748b",
                                  fontSize: "13px",
                                  fontWeight: 700,
                                  textAlign: "right",
                                }}
                              >
                                Already assigned
                              </div>
                            ) : isCurrentUserDirector ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setDirectorMatchRequest({
                                    ...request,
                                    first_name: request.member?.first_name,
                                    last_name: request.member?.last_name,
                                  });
                                  setDirectorMatchPartnerNumber("");
                                  setDirectorMatchStandbyId(null);
                                  setDirectorMatchNote("");
                                }}
                                style={styles.compactPrimaryAction}
                              >
                                Create Match
                              </button>
                            ) : isOwnRequest ? (
                              <button
                                type="button"
                                onClick={() => {
                                  if (requestHasAnyInterest) {
                                    setRequestToRemove(request);
                                    return;
                                  }

                                  setWantedLevel(
                                    request.wanted_levels
                                      ? request.wanted_levels
                                          .split(",")
                                          .map((item: string) => item.trim())
                                          .filter(Boolean)
                                          .join(",")
                                      : ""
                                  );
                                  setWantedSystems(
                                    request.wanted_systems
                                      ? request.wanted_systems
                                          .split(",")
                                          .map((item: string) => item.trim())
                                      : []
                                  );
                                  setShowRequestTypeModal(true);
                                }}
                                style={styles.compactSecondaryAction}
                              >
                                {requestHasAnyInterest
                                  ? "Remove"
                                  : "Edit / Remove"}
                              </button>
                            ) : currentPendingInterest ? (
                              <button
                                type="button"
                                onClick={() =>
                                  withdrawTournamentInterest(request)
                                }
                                style={styles.compactSecondaryAction}
                              >
                                Withdraw Interest
                              </button>
                            ) : currentDeclinedInterest ? (
                              <div
                                style={{
                                  color: "#9a3412",
                                  fontSize: "13px",
                                  fontWeight: 700,
                                }}
                              >
                                Interest declined
                              </div>
                            ) : !currentMemberTournamentRegistration &&
                              !currentStandbyRecord ? (
                              <button
                                type="button"
                                onClick={() =>
                                  expressTournamentInterest(request)
                                }
                                style={styles.compactPrimaryAction}
                              >
                                Express Interest
                              </button>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {isCurrentUserDirector &&
              displayedTournamentDetailFilter === "Matched" &&
              renderTournamentMatchList(
                activeTournamentMatches,
                "No tournament matches have been created yet."
              )}

            {isCurrentUserDirector &&
              displayedTournamentDetailFilter === "Standby" &&
              renderTournamentStandbyList()}

            {displayedTournamentDetailFilter === "Cancelled" && (
              isCurrentUserDirector ? (
                cancelledTournamentPairs.length === 0 &&
                cancelledTournamentMatches.length === 0 ? (
                  <p style={styles.text}>No cancelled tournament activity.</p>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    {[
                      ...cancelledTournamentPairs.map(
                        (registration: any) => ({
                          activityType: "registration",
                          record: registration,
                          cancelledAt:
                            registration.cancelled_at ||
                            registration.created_at,
                        })
                      ),
                      ...cancelledTournamentMatches.map((match: any) => ({
                        activityType: "match",
                        record: match,
                        cancelledAt:
                          match.cancelled_at || match.created_at,
                      })),
                    ]
                      .sort(
                        (firstActivity: any, secondActivity: any) =>
                          new Date(secondActivity.cancelledAt).getTime() -
                          new Date(firstActivity.cancelledAt).getTime()
                      )
                      .map((activity: any) =>
                        activity.activityType === "registration" ? (
                          <React.Fragment
                            key={`registration-${activity.record.registration_id}`}
                          >
                            {renderTournamentPairList(
                              [activity.record],
                              "",
                              "Cancelled registration"
                            )}
                          </React.Fragment>
                        ) : (
                          <React.Fragment
                            key={`match-${activity.record.match_id}`}
                          >
                            {renderTournamentMatchList(
                              [activity.record],
                              "",
                              "Cancelled match"
                            )}
                          </React.Fragment>
                        )
                      )}
                  </div>
                )
              ) : (
                renderTournamentPairList(
                  cancelledTournamentPairs,
                  "No cancelled registrations.",
                  "Cancelled registration"
                )
              )
            )}
          </Card>

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
                zIndex: 1100,
                padding: "24px",
              }}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="tournament-looking-title"
                style={{
                  background: "white",
                  borderRadius: "20px",
                  padding: "32px",
                  width: "100%",
                  maxWidth: "460px",
                  maxHeight: "90vh",
                  overflowY: "auto",
                  boxShadow: "0 24px 80px rgba(15, 23, 42, 0.25)",
                }}
              >
                <h2 id="tournament-looking-title" style={styles.sectionTitle}>
                  Looking for a partner
                </h2>

                <p style={{ ...styles.smallText, marginBottom: "20px" }}>
                  Preferences are optional. Your saved playing levels and
                  systems have been selected as a starting point; change or
                  clear them for this request if needed.
                </p>

                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "16px",
                    fontWeight: 700,
                  }}
                >
                  Partner level(s)
                </label>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    marginBottom: "20px",
                  }}
                >
                  {supabaseLevels.map((level: any) => (
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
                        checked={wantedLevel
                          .split(",")
                          .map((item) => item.trim())
                          .includes(level.level_name)}
                        onChange={(event) => {
                          const currentLevels = wantedLevel
                            ? wantedLevel.split(",")
                            : [];

                          setWantedLevel(
                            event.target.checked
                              ? [...currentLevels, level.level_name].join(",")
                              : currentLevels
                                  .filter(
                                    (item) => item !== level.level_name
                                  )
                                  .join(",")
                          );
                        }}
                      />
                      {level.level_name}
                    </label>
                  ))}
                </div>

                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "16px",
                    fontWeight: 700,
                  }}
                >
                  Partner system(s)
                </label>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    marginBottom: "20px",
                  }}
                >
                  {supabaseSystems.map((system: any) => (
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
                        onChange={(event) => {
                          setWantedSystems(
                            event.target.checked
                              ? [...wantedSystems, system.system_name]
                              : wantedSystems.filter(
                                  (item) => item !== system.system_name
                                )
                          );
                        }}
                      />
                      {system.system_name}
                    </label>
                  ))}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    onClick={async () => {
                      if (currentMemberTournamentLookingRequest) {
                        await updateRequest();
                      } else {
                        await createRequest();
                      }
                      setShowRequestTypeModal(false);
                      setTournamentDetailFilter("Looking");
                    }}
                    style={{
                      ...styles.matchButton,
                      background: "#267c89",
                      color: "white",
                    }}
                  >
                    Confirm
                  </button>

                  {currentMemberTournamentLookingRequest && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowRequestTypeModal(false);
                        setRequestToRemove(
                          currentMemberTournamentLookingRequest
                        );
                      }}
                      style={{
                        ...styles.matchButton,
                        background: "#267c89",
                        color: "white",
                      }}
                    >
                      Remove
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowRequestTypeModal(false)}
                    style={{
                      ...styles.matchButton,
                      background: "#267c89",
                      color: "white",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {requestToRemove && (
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
                zIndex: 1100,
                padding: "24px",
              }}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="remove-tournament-request-title"
                style={{
                  background: "white",
                  borderRadius: "20px",
                  padding: "32px",
                  width: "100%",
                  maxWidth: "420px",
                  boxShadow: "0 24px 80px rgba(15, 23, 42, 0.25)",
                }}
              >
                <h2
                  id="remove-tournament-request-title"
                  style={styles.sectionTitle}
                >
                  Remove request?
                </h2>

                <p style={styles.text}>
                  This will remove you from the tournament looking list.
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    marginTop: "24px",
                  }}
                >
                  <button
                    type="button"
                    onClick={async () => {
                      await removeRequest();
                      setTournamentDetailFilter("My Status");
                    }}
                    style={{
                      ...styles.matchButton,
                      background: "#267c89",
                      color: "white",
                    }}
                  >
                    Yes, remove me
                  </button>

                  <button
                    type="button"
                    onClick={() => setRequestToRemove(null)}
                    style={{
                      ...styles.matchButton,
                      background: "#267c89",
                      color: "white",
                    }}
                  >
                    Keep request
                  </button>
                </div>
              </div>
            </div>
          )}

          {tournamentInterestToAccept && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(15, 23, 42, 0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1100,
                padding: "24px",
              }}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="accept-tournament-interest-title"
                style={{
                  background: "white",
                  borderRadius: "20px",
                  padding: "32px",
                  width: "100%",
                  maxWidth: "460px",
                  boxShadow: "0 24px 80px rgba(15, 23, 42, 0.25)",
                }}
              >
                <h2
                  id="accept-tournament-interest-title"
                  style={styles.sectionTitle}
                >
                  Accept interest
                </h2>

                <p style={styles.text}>
                  Choose whether to create a match with{" "}
                  <strong>
                    {tournamentInterestToAccept.member
                      ? `${tournamentInterestToAccept.member.first_name || ""} ${
                          tournamentInterestToAccept.member.last_name || ""
                        }`.trim()
                      : `NZ Bridge #${tournamentInterestToAccept.interested_nz_bridge_number}`}
                  </strong>{" "}
                  or register the pair immediately.
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    marginTop: "24px",
                  }}
                >
                  <button
                    type="button"
                    disabled={isTournamentInterestResponding}
                    onClick={() =>
                      respondToTournamentInterest(
                        tournamentInterestToAccept,
                        "match"
                      )
                    }
                    style={{
                      ...styles.matchButton,
                      background: "#267c89",
                      color: "white",
                    }}
                  >
                    Create Match
                  </button>

                  <button
                    type="button"
                    disabled={isTournamentInterestResponding}
                    onClick={() =>
                      respondToTournamentInterest(
                        tournamentInterestToAccept,
                        "register"
                      )
                    }
                    style={{
                      ...styles.matchButton,
                      background: "#267c89",
                      color: "white",
                    }}
                  >
                    Register Pair
                  </button>

                  <button
                    type="button"
                    disabled={isTournamentInterestResponding}
                    onClick={() => setTournamentInterestToAccept(null)}
                    style={{
                      ...styles.matchButton,
                      background: "#267c89",
                      color: "white",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {tournamentInterestToDecline && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(15, 23, 42, 0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1100,
                padding: "24px",
              }}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="decline-tournament-interest-title"
                style={{
                  background: "white",
                  borderRadius: "20px",
                  padding: "32px",
                  width: "100%",
                  maxWidth: "460px",
                  boxShadow: "0 24px 80px rgba(15, 23, 42, 0.25)",
                }}
              >
                <h2
                  id="decline-tournament-interest-title"
                  style={styles.sectionTitle}
                >
                  Decline interest?
                </h2>

                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#475569",
                    fontSize: "14px",
                    fontWeight: 700,
                  }}
                >
                  Reason (optional)
                </label>

                <textarea
                  value={tournamentDeclineReason}
                  onChange={(event) =>
                    setTournamentDeclineReason(event.target.value)
                  }
                  placeholder="Add a short reason"
                  style={{
                    width: "100%",
                    minHeight: "90px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "12px",
                    padding: "12px",
                    fontSize: "15px",
                    boxSizing: "border-box",
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    marginTop: "24px",
                  }}
                >
                  <button
                    type="button"
                    disabled={isTournamentInterestResponding}
                    onClick={() =>
                      respondToTournamentInterest(
                        tournamentInterestToDecline,
                        "decline",
                        tournamentDeclineReason.trim() || null
                      )
                    }
                    style={{
                      ...styles.matchButton,
                      background: "#267c89",
                      color: "white",
                    }}
                  >
                    Decline
                  </button>

                  <button
                    type="button"
                    disabled={isTournamentInterestResponding}
                    onClick={() => {
                      setTournamentInterestToDecline(null);
                      setTournamentDeclineReason("");
                    }}
                    style={{
                      ...styles.matchButton,
                      background: "#267c89",
                      color: "white",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {showStandbyModal && (
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
                zIndex: 1100,
                padding: "24px",
                overflowY: "auto",
              }}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="tournament-standby-title"
                style={{
                  background: "white",
                  borderRadius: "20px",
                  padding: "32px",
                  width: "100%",
                  maxWidth: "520px",
                  maxHeight: "90vh",
                  overflowY: "auto",
                  boxShadow: "0 24px 80px rgba(15, 23, 42, 0.25)",
                }}
              >
                <h2 id="tournament-standby-title" style={styles.sectionTitle}>
                  Standby availability
                </h2>

                <p style={styles.text}>
                  Your details will only be visible to club directors. Other
                  players cannot see the standby list. Available details from
                  My Account have been filled in and can be changed for this
                  session.
                </p>

                <label
                  style={{
                    display: "block",
                    marginTop: "20px",
                    marginBottom: "8px",
                    fontSize: "16px",
                    fontWeight: 700,
                  }}
                >
                  Phone number
                </label>

                <input
                  type="tel"
                  value={standbyPhone}
                  onChange={(event) => setStandbyPhone(event.target.value)}
                  placeholder="Enter your phone number"
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "12px",
                    border: "1px solid #cbd5e1",
                    marginBottom: "18px",
                    fontSize: "15px",
                    boxSizing: "border-box",
                  }}
                />

                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "16px",
                    fontWeight: 700,
                  }}
                >
                  Your real playing level(s)
                </label>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    marginBottom: "20px",
                  }}
                >
                  {supabaseLevels.map((level: any) => (
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
                        checked={standbyLevelIds.includes(
                          Number(level.level_id)
                        )}
                        onChange={(event) => {
                          const levelId = Number(level.level_id);
                          setStandbyLevelIds(
                            event.target.checked
                              ? [...standbyLevelIds, levelId]
                              : standbyLevelIds.filter(
                                  (selectedLevelId) =>
                                    selectedLevelId !== levelId
                                )
                          );
                        }}
                      />
                      {level.level_name}
                    </label>
                  ))}
                </div>

                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "16px",
                    fontWeight: 700,
                  }}
                >
                  Systems you are knowledgeable about or happy to play
                </label>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    marginBottom: "20px",
                  }}
                >
                  {supabaseSystems.map((system: any) => (
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
                        checked={standbySystemIds.includes(
                          Number(system.system_id)
                        )}
                        onChange={(event) => {
                          const systemId = Number(system.system_id);
                          setStandbySystemIds(
                            event.target.checked
                              ? [...standbySystemIds, systemId]
                              : standbySystemIds.filter(
                                  (selectedSystemId) =>
                                    selectedSystemId !== systemId
                                )
                          );
                        }}
                      />
                      {system.system_name}
                    </label>
                  ))}
                </div>

                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "16px",
                    fontWeight: 700,
                  }}
                >
                  Optional note for the directors
                </label>

                <textarea
                  value={standbyNote}
                  onChange={(event) => setStandbyNote(event.target.value)}
                  placeholder="Anything the directors should know"
                  style={{
                    width: "100%",
                    minHeight: "90px",
                    padding: "12px",
                    borderRadius: "12px",
                    border: "1px solid #cbd5e1",
                    marginBottom: "18px",
                    fontSize: "15px",
                    boxSizing: "border-box",
                  }}
                />

                <label
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    marginBottom: "24px",
                    color: "#475569",
                    fontSize: "14px",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={standbyUpdateProfile}
                    onChange={(event) =>
                      setStandbyUpdateProfile(event.target.checked)
                    }
                  />
                  Update my profile with this phone number and playing
                  information.
                </label>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    onClick={saveCurrentTournamentStandby}
                    style={{
                      ...styles.matchButton,
                      background: "#267c89",
                      color: "white",
                    }}
                  >
                    Confirm standby
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowStandbyModal(false)}
                    style={{
                      ...styles.matchButton,
                      background: "#267c89",
                      color: "white",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {directorMatchRequest && isCurrentUserDirector && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(15, 23, 42, 0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1200,
                padding: "24px",
                overflowY: "auto",
              }}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="director-tournament-match-title"
                style={{
                  background: "white",
                  borderRadius: "20px",
                  padding: "32px",
                  width: "100%",
                  maxWidth: "520px",
                  maxHeight: "90vh",
                  overflowY: "auto",
                  boxShadow: "0 24px 80px rgba(15, 23, 42, 0.25)",
                }}
              >
                <h2
                  id="director-tournament-match-title"
                  style={styles.sectionTitle}
                >
                  Create match
                </h2>

                <p style={styles.text}>
                  Match{" "}
                  <strong>
                    {directorMatchRequest.first_name || "Unknown"}{" "}
                    {directorMatchRequest.last_name || "player"}
                  </strong>{" "}
                  with a confirmed partner.
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "12px",
                    marginTop: "20px",
                    marginBottom: "16px",
                  }}
                >
                  <label
                    htmlFor="director-tournament-partner-first-name"
                    style={{ fontSize: "15px", fontWeight: 700 }}
                  >
                    First name
                    <input
                      id="director-tournament-partner-first-name"
                      type="search"
                      value={directorMatchPartnerSearch}
                      onChange={(event) => {
                        setDirectorMatchPartnerSearch(event.target.value);
                        setDirectorMatchPartnerNumber("");
                        setDirectorMatchStandbyId(null);
                      }}
                      placeholder="First name"
                      autoComplete="off"
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "12px",
                        borderRadius: "12px",
                        border: "1px solid #cbd5e1",
                        marginTop: "8px",
                        fontSize: "15px",
                        fontWeight: 400,
                        boxSizing: "border-box",
                      }}
                    />
                  </label>

                  <label
                    htmlFor="director-tournament-partner-last-name"
                    style={{ fontSize: "15px", fontWeight: 700 }}
                  >
                    Last name
                    <input
                      id="director-tournament-partner-last-name"
                      type="search"
                      value={directorMatchPartnerSurnameSearch}
                      onChange={(event) => {
                        setDirectorMatchPartnerSurnameSearch(event.target.value);
                        setDirectorMatchPartnerNumber("");
                        setDirectorMatchStandbyId(null);
                      }}
                      placeholder="Last name"
                      autoComplete="off"
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "12px",
                        borderRadius: "12px",
                        border: "1px solid #cbd5e1",
                        marginTop: "8px",
                        fontSize: "15px",
                        fontWeight: 400,
                        boxSizing: "border-box",
                      }}
                    />
                  </label>

                  <label
                    htmlFor="director-tournament-partner-club"
                    style={{ fontSize: "15px", fontWeight: 700 }}
                  >
                    Club
                    <select
                      id="director-tournament-partner-club"
                      value={directorSelectedTournamentClubId}
                      onChange={(event) => {
                        setDirectorMatchClubId(event.target.value);
                        setDirectorMatchPartnerNumber("");
                        setDirectorMatchStandbyId(null);
                      }}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "12px",
                        borderRadius: "12px",
                        border: "1px solid #cbd5e1",
                        marginTop: "8px",
                        fontSize: "15px",
                        fontWeight: 400,
                        boxSizing: "border-box",
                        background: "white",
                      }}
                    >
                      <option value={directorTournamentClubId}>
                        {directorTournamentClubName}
                      </option>
                    </select>
                  </label>
                </div>

                <div style={{ marginBottom: "18px" }}>
                  <div
                    style={{
                      marginBottom: "8px",
                      fontSize: "16px",
                      fontWeight: 700,
                    }}
                  >
                    Available players
                  </div>

                  {directorAvailableTournamentStandbyPartners.length === 0 &&
                  directorAvailableTournamentMemberPartners.length === 0 ? (
                    <p style={{ ...styles.smallText, margin: 0 }}>
                      {hasDirectorTournamentPartnerSearch
                        ? "No available players match your search."
                        : "No available players for this tournament."}
                    </p>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        maxHeight: "280px",
                        overflowY: "auto",
                        paddingRight: "4px",
                      }}
                    >
                      {directorAvailableTournamentStandbyPartners.map(
                        (standbyPlayer: any) => {
                          const isSelected =
                            Number(directorMatchStandbyId) ===
                            Number(standbyPlayer.standby_id);

                          return (
                            <button
                              key={`tournament-standby-result-${standbyPlayer.standby_id}`}
                              type="button"
                              aria-pressed={isSelected}
                              onClick={() => {
                                setDirectorMatchStandbyId(
                                  Number(standbyPlayer.standby_id)
                                );
                                setDirectorMatchPartnerNumber(
                                  String(standbyPlayer.nz_bridge_number)
                                );
                              }}
                              style={{
                                width: "100%",
                                border: isSelected
                                  ? "2px solid #2b8792"
                                  : "1px solid #cbd5e1",
                                borderRadius: "12px",
                                background: isSelected ? "#e0f2f4" : "#f8fafc",
                                color: "#0f172a",
                                padding: "12px 14px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: "12px",
                                textAlign: "left",
                                cursor: "pointer",
                              }}
                            >
                              <span style={{ fontWeight: 700 }}>
                                {standbyPlayer.first_name || "Unknown"}{" "}
                                {standbyPlayer.last_name || "player"}
                              </span>

                              <span
                                style={{
                                  color: "#0f766e",
                                  fontSize: "12px",
                                  fontWeight: 700,
                                }}
                              >
                                Standby
                              </span>
                            </button>
                          );
                        }
                      )}

                      {directorAvailableTournamentMemberPartners.map((member: any) => {
                        const isSelected =
                          !directorMatchStandbyId &&
                          String(directorMatchPartnerNumber) ===
                            String(member.nz_bridge_number);

                        return (
                          <button
                            key={`tournament-member-result-${member.nz_bridge_number}`}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => {
                              setDirectorMatchStandbyId(null);
                              setDirectorMatchPartnerNumber(
                                String(member.nz_bridge_number)
                              );
                            }}
                            style={{
                              width: "100%",
                              border: isSelected
                                ? "2px solid #2b8792"
                                : "1px solid #cbd5e1",
                              borderRadius: "12px",
                              background: isSelected ? "#e0f2f4" : "#f8fafc",
                              color: "#0f172a",
                              padding: "12px 14px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "12px",
                              textAlign: "left",
                              cursor: "pointer",
                            }}
                          >
                            <span style={{ fontWeight: 700 }}>
                              {member.first_name || "Unknown"}{" "}
                              {member.last_name || "player"}
                            </span>

                            <span style={{ color: "#64748b", fontSize: "12px" }}>
                              NZ Bridge #{member.nz_bridge_number}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <label
                  htmlFor="director-tournament-match-note"
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "15px",
                    fontWeight: 700,
                  }}
                >
                  Optional note
                </label>

                <textarea
                  id="director-tournament-match-note"
                  value={directorMatchNote}
                  onChange={(event) =>
                    setDirectorMatchNote(event.target.value)
                  }
                  placeholder="For example: Confirmed by phone"
                  style={{
                    width: "100%",
                    minHeight: "90px",
                    padding: "12px",
                    borderRadius: "12px",
                    border: "1px solid #cbd5e1",
                    marginBottom: "24px",
                    fontSize: "15px",
                    boxSizing: "border-box",
                  }}
                />

                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={async () => {
                      if (
                        !selectedSessionId ||
                        !currentMember?.nz_bridge_number ||
                        !directorMatchRequest?.request_id
                      ) {
                        alert(
                          "The selected tournament or looking request is missing."
                        );
                        return;
                      }

                      if (!directorMatchPartnerNumber) {
                        alert("Please select a partner.");
                        return;
                      }

                      const {
                        data: createdMatchId,
                        error: createDirectorMatchError,
                      } = await supabase.rpc("director_create_match", {
                        p_session_instance_id: selectedSessionId,
                        p_director_nz_bridge_number: Number(
                          currentMember.nz_bridge_number
                        ),
                        p_request_id: Number(
                          directorMatchRequest.request_id
                        ),
                        p_partner_nz_bridge_number: Number(
                          directorMatchPartnerNumber
                        ),
                        p_standby_id: directorMatchStandbyId
                          ? Number(directorMatchStandbyId)
                          : null,
                        p_note: directorMatchNote.trim() || null,
                      });

                      if (createDirectorMatchError) {
                        console.error(
                          "Director tournament create match error:",
                          JSON.stringify(createDirectorMatchError, null, 2)
                        );
                        alert(
                          createDirectorMatchError.message ||
                            "The match could not be created."
                        );
                        return;
                      }

                      if (!createdMatchId) {
                        alert("The match was not created.");
                        return;
                      }

                      await refreshSupabaseData();
                      setDirectorMatchRequest(null);
                      setDirectorMatchPartnerNumber("");
                      setDirectorMatchStandbyId(null);
                      setDirectorMatchNote("");
                      setTournamentDetailFilter("Matched");
                    }}
                    style={{
                      ...styles.matchButton,
                      background: "#267c89",
                      color: "white",
                    }}
                  >
                    Confirm Match
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDirectorMatchRequest(null);
                      setDirectorMatchPartnerNumber("");
                      setDirectorMatchStandbyId(null);
                      setDirectorMatchNote("");
                    }}
                    style={{
                      ...styles.matchButton,
                      background: "#267c89",
                      color: "white",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {showTournamentRegistrationModal && (
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
                zIndex: 1100,
                padding: "24px",
              }}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="tournament-registration-title"
                style={{
                  background: "white",
                  borderRadius: "20px",
                  padding: "32px",
                  width: "100%",
                  maxWidth: "520px",
                  maxHeight: "90vh",
                  overflowY: "auto",
                  boxShadow: "0 24px 80px rgba(15, 23, 42, 0.25)",
                }}
              >
                <h2
                  id="tournament-registration-title"
                  style={styles.sectionTitle}
                >
                  Register pair
                </h2>

                {isCurrentUserDirector && (
                  <div style={{ marginTop: "20px" }}>
                    <label
                      htmlFor="tournament-registering-player-search"
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontSize: "15px",
                        fontWeight: 700,
                      }}
                    >
                      First player
                    </label>

                    <input
                      id="tournament-registering-player-search"
                      type="search"
                      value={tournamentRegisteringPlayerSearch}
                      onChange={(event) => {
                        setTournamentRegisteringPlayerSearch(
                          event.target.value
                        );
                        setSelectedTournamentRegisteringPlayer(null);
                        setSelectedTournamentPartner(null);
                      }}
                      placeholder="Search by name or NZ Bridge number"
                      autoComplete="off"
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "12px",
                        border: "1px solid #cbd5e1",
                        fontSize: "15px",
                        boxSizing: "border-box",
                      }}
                    />

                    {tournamentRegisteringPlayerSearch.trim().length >= 2 &&
                      tournamentRegisteringPlayerMatches.length === 0 && (
                        <p style={{ ...styles.smallText, marginTop: "12px" }}>
                          No BridgeBuddy players found.
                        </p>
                      )}

                    {tournamentRegisteringPlayerMatches.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                          marginTop: "12px",
                        }}
                      >
                        {tournamentRegisteringPlayerMatches.map(
                          (member: any) => {
                            const isSelected =
                              String(
                                selectedTournamentRegisteringPlayer?.nz_bridge_number
                              ) === String(member.nz_bridge_number);

                            return (
                              <button
                                key={`registering-${member.nz_bridge_number}`}
                                type="button"
                                onClick={() => {
                                  setSelectedTournamentRegisteringPlayer(
                                    member
                                  );
                                  setTournamentRegisteringPlayerSearch(
                                    `${member.first_name || ""} ${
                                      member.last_name || ""
                                    }`.trim()
                                  );
                                  setSelectedTournamentPartner(null);
                                  setTournamentPartnerSearch("");
                                }}
                                style={{
                                  width: "100%",
                                  border: isSelected
                                    ? "2px solid #2b8792"
                                    : "1px solid #cbd5e1",
                                  borderRadius: "12px",
                                  background: isSelected
                                    ? "#e0f2f4"
                                    : "white",
                                  color: "#0f172a",
                                  padding: "12px",
                                  textAlign: "left",
                                  cursor: "pointer",
                                }}
                              >
                                <span
                                  style={{ display: "block", fontWeight: 700 }}
                                >
                                  {member.first_name} {member.last_name}
                                </span>
                                <span style={styles.smallText}>
                                  NZ Bridge number: {member.nz_bridge_number}
                                </span>
                              </button>
                            );
                          }
                        )}
                      </div>
                    )}

                    {selectedTournamentRegisteringPlayer && (
                      <div
                        style={{
                          marginTop: "12px",
                          color: "#0f766e",
                          fontSize: "13px",
                          fontWeight: 700,
                        }}
                      >
                        First player selected
                      </div>
                    )}
                  </div>
                )}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px",
                    marginTop: isCurrentUserDirector ? "24px" : "20px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setUseManualTournamentPartner(false)}
                    style={{
                      border: !useManualTournamentPartner
                        ? "2px solid #2b8792"
                        : "1px solid #cbd5e1",
                      borderRadius: "12px",
                      background: !useManualTournamentPartner
                        ? "#e0f2f4"
                        : "white",
                      color: "#0f172a",
                      padding: "10px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    BridgeBuddy member
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUseManualTournamentPartner(true);
                      setSelectedTournamentPartner(null);
                    }}
                    style={{
                      border: useManualTournamentPartner
                        ? "2px solid #2b8792"
                        : "1px solid #cbd5e1",
                      borderRadius: "12px",
                      background: useManualTournamentPartner
                        ? "#e0f2f4"
                        : "white",
                      color: "#0f172a",
                      padding: "10px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Enter manually
                  </button>
                </div>

                {!useManualTournamentPartner && (
                  <>
                    <p style={{ ...styles.text, marginTop: "20px" }}>
                      Search by name or NZ Bridge number.
                    </p>

                    <label
                      htmlFor="tournament-partner-search"
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontSize: "15px",
                        fontWeight: 700,
                      }}
                    >
                      BridgeBuddy partner
                    </label>

                    <input
                      id="tournament-partner-search"
                      type="search"
                      value={tournamentPartnerSearch}
                      onChange={(event) => {
                        setTournamentPartnerSearch(event.target.value);
                        setSelectedTournamentPartner(null);
                      }}
                      placeholder="Enter at least two characters"
                      autoComplete="off"
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "12px",
                        border: "1px solid #cbd5e1",
                        fontSize: "15px",
                        boxSizing: "border-box",
                      }}
                    />

                    {tournamentPartnerSearch.trim().length >= 2 &&
                      tournamentPartnerMatches.length === 0 && (
                        <p style={{ ...styles.smallText, marginTop: "12px" }}>
                          No BridgeBuddy members found.
                        </p>
                      )}

                    {tournamentPartnerMatches.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                          marginTop: "12px",
                        }}
                      >
                        {tournamentPartnerMatches.map((member: any) => {
                          const isSelected =
                            String(
                              selectedTournamentPartner?.nz_bridge_number
                            ) === String(member.nz_bridge_number);

                          return (
                            <button
                              key={member.nz_bridge_number}
                              type="button"
                              onClick={() =>
                                setSelectedTournamentPartner(member)
                              }
                              style={{
                                width: "100%",
                                border: isSelected
                                  ? "2px solid #2b8792"
                                  : "1px solid #cbd5e1",
                                borderRadius: "12px",
                                background: isSelected ? "#e0f2f4" : "white",
                                color: "#0f172a",
                                padding: "12px",
                                textAlign: "left",
                                cursor: "pointer",
                              }}
                            >
                              <span
                                style={{ display: "block", fontWeight: 700 }}
                              >
                                {member.first_name} {member.last_name}
                              </span>
                              <span style={styles.smallText}>
                                NZ Bridge number: {member.nz_bridge_number}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}

                {useManualTournamentPartner && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "14px",
                      marginTop: "20px",
                    }}
                  >
                    <p style={{ ...styles.smallText, margin: 0 }}>
                      Fields marked * are required. All other details are optional.
                    </p>

                    {[
                      {
                        id: "manual-partner-first-name",
                        label: "First name",
                        required: true,
                        type: "text",
                        value: manualTournamentPartnerFirstName,
                        onChange: setManualTournamentPartnerFirstName,
                      },
                      {
                        id: "manual-partner-last-name",
                        label: "Last name",
                        required: true,
                        type: "text",
                        value: manualTournamentPartnerLastName,
                        onChange: setManualTournamentPartnerLastName,
                      },
                      {
                        id: "manual-partner-nz-bridge-number",
                        label: "NZ Bridge number",
                        required: false,
                        type: "text",
                        value: manualTournamentPartnerNzBridgeNumber,
                        onChange: setManualTournamentPartnerNzBridgeNumber,
                      },
                      {
                        id: "manual-partner-club",
                        label: "Club",
                        required: false,
                        type: "text",
                        value: manualTournamentPartnerClub,
                        onChange: setManualTournamentPartnerClub,
                      },
                      {
                        id: "manual-partner-email",
                        label: "Email",
                        required: false,
                        type: "email",
                        value: manualTournamentPartnerEmail,
                        onChange: setManualTournamentPartnerEmail,
                      },
                      {
                        id: "manual-partner-phone",
                        label: "Phone",
                        required: false,
                        type: "tel",
                        value: manualTournamentPartnerPhone,
                        onChange: setManualTournamentPartnerPhone,
                      },
                    ].map((field) => (
                      <label
                        key={field.id}
                        htmlFor={field.id}
                        style={{ fontSize: "15px", fontWeight: 700 }}
                      >
                        {field.label}
                        {field.required ? " *" : " (optional)"}
                        <input
                          id={field.id}
                          type={field.type}
                          required={field.required}
                          value={field.value}
                          onChange={(event) => field.onChange(event.target.value)}
                          style={{
                            display: "block",
                            width: "100%",
                            marginTop: "8px",
                            padding: "12px",
                            borderRadius: "12px",
                            border: "1px solid #cbd5e1",
                            fontSize: "15px",
                            fontWeight: 400,
                            boxSizing: "border-box",
                          }}
                        />
                      </label>
                    ))}
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap",
                    marginTop: "24px",
                  }}
                >
                  <button
                    type="button"
                    disabled={isTournamentRegistrationSubmitting}
                    onClick={async () => {
                      if (!selectedSessionId || !currentMember?.nz_bridge_number) {
                        alert("Please log in and reopen this tournament.");
                        return;
                      }

                      if (
                        isCurrentUserDirector &&
                        !selectedTournamentRegisteringPlayer?.nz_bridge_number
                      ) {
                        alert("Please select the first player.");
                        return;
                      }

                      if (
                        !useManualTournamentPartner &&
                        !selectedTournamentPartner?.nz_bridge_number
                      ) {
                        alert("Please select a BridgeBuddy partner.");
                        return;
                      }

                      const manualFirstName =
                        manualTournamentPartnerFirstName.trim();
                      const manualLastName =
                        manualTournamentPartnerLastName.trim();
                      const manualNzBridgeNumber =
                        manualTournamentPartnerNzBridgeNumber.trim();

                      if (
                        useManualTournamentPartner &&
                        (!manualFirstName || !manualLastName)
                      ) {
                        alert("Please enter your partner's first and last name.");
                        return;
                      }

                      if (
                        useManualTournamentPartner &&
                        manualNzBridgeNumber &&
                        !/^\d+$/.test(manualNzBridgeNumber)
                      ) {
                        alert("The NZ Bridge number must contain numbers only.");
                        return;
                      }

                      setIsTournamentRegistrationSubmitting(true);

                      try {
                        const partnerArguments = {
                          p_partner_nz_bridge_number:
                            useManualTournamentPartner
                              ? null
                              : Number(
                                  selectedTournamentPartner.nz_bridge_number
                                ),
                          p_manual_partner_first_name:
                            useManualTournamentPartner
                              ? manualFirstName
                              : null,
                          p_manual_partner_last_name:
                            useManualTournamentPartner
                              ? manualLastName
                              : null,
                          p_manual_partner_nz_bridge_number:
                            useManualTournamentPartner && manualNzBridgeNumber
                              ? Number(manualNzBridgeNumber)
                              : null,
                          p_manual_partner_club:
                            useManualTournamentPartner
                              ? manualTournamentPartnerClub.trim() || null
                              : null,
                          p_manual_partner_email:
                            useManualTournamentPartner
                              ? manualTournamentPartnerEmail.trim() || null
                              : null,
                          p_manual_partner_phone:
                            useManualTournamentPartner
                              ? manualTournamentPartnerPhone.trim() || null
                              : null,
                        };
                        const { error: registrationError } = await supabase.rpc(
                          isCurrentUserDirector
                            ? "director_register_tournament_pair"
                            : "register_tournament_pair",
                          isCurrentUserDirector
                            ? {
                                p_session_instance_id: String(
                                  selectedSessionId
                                ),
                                p_director_nz_bridge_number: Number(
                                  currentMember.nz_bridge_number
                                ),
                                p_player_one_nz_bridge_number: Number(
                                  selectedTournamentRegisteringPlayer.nz_bridge_number
                                ),
                                ...partnerArguments,
                              }
                            : {
                                p_session_instance_id: String(
                                  selectedSessionId
                                ),
                                p_registering_nz_bridge_number: Number(
                                  currentMember.nz_bridge_number
                                ),
                                ...partnerArguments,
                              }
                        );

                        if (registrationError) {
                          console.error(
                            "Tournament pair registration error:",
                            JSON.stringify(registrationError, null, 2)
                          );
                          alert(
                            `Pair could not be registered: ${
                              registrationError.message || "Unknown Supabase error"
                            }`
                          );
                          return;
                        }

                        await refreshSupabaseData();
                        setShowTournamentRegistrationModal(false);
                        resetTournamentRegistrationForm();
                        setTournamentDetailFilter("Registered");
                        alert("Pair registered successfully.");
                      } catch (registrationException) {
                        console.error(
                          "Unexpected tournament registration error:",
                          registrationException
                        );
                        alert("Pair could not be registered. Please try again.");
                      } finally {
                        setIsTournamentRegistrationSubmitting(false);
                      }
                    }}
                    style={{
                      ...styles.button,
                      opacity: isTournamentRegistrationSubmitting ? 0.65 : 1,
                      cursor: isTournamentRegistrationSubmitting
                        ? "not-allowed"
                        : "pointer",
                    }}
                  >
                    {isTournamentRegistrationSubmitting
                      ? "Registering..."
                      : "Register Pair"}
                  </button>

                  <Button
                    secondary={true}
                    onClick={() => {
                      setShowTournamentRegistrationModal(false);
                      resetTournamentRegistrationForm();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {renderPlayerProfileModal()}
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

    const matchedPartnershipsForSelectedSession = supabaseMatches
      .filter(
        (match: any) =>
          String(match.session_instance_id) === String(selectedSessionId) &&
          String(match.match_status).trim() === "Active"
      )
      .map((match: any) => {
        const requester = supabaseMembers.find(
          (member: any) =>
            String(member.nz_bridge_number) === String(match.requester_nz_bridge_number)
        );

        const partner = supabaseMembers.find(
          (member: any) =>
            String(member.nz_bridge_number) === String(match.partner_nz_bridge_number)
        );

        return {
          ...match,
          requester,
          partner,
        };
      })
      .sort((a: any, b: any) => {
        const currentMemberNumber = String(currentMember?.nz_bridge_number);

        const aIncludesCurrentMember =
          String(a.requester_nz_bridge_number) === currentMemberNumber ||
          String(a.partner_nz_bridge_number) === currentMemberNumber;

        const bIncludesCurrentMember =
          String(b.requester_nz_bridge_number) === currentMemberNumber ||
          String(b.partner_nz_bridge_number) === currentMemberNumber;

        return Number(bIncludesCurrentMember) - Number(aIncludesCurrentMember);
      });

    const currentMemberActiveMatchForSelectedSession = currentMember
      ? matchedPartnershipsForSelectedSession.find(
          (match: any) =>
            String(match.requester_nz_bridge_number) === String(currentMember.nz_bridge_number) ||
            String(match.partner_nz_bridge_number) === String(currentMember.nz_bridge_number)
        )
      : null;

    const mySessionMatchForDetail = currentMemberActiveMatchForSelectedSession
      ? (() => {
          const isRequester =
            String(currentMemberActiveMatchForSelectedSession.requester_nz_bridge_number) ===
            String(currentMember?.nz_bridge_number);

          const matchedPartnerNumber = isRequester
            ? currentMemberActiveMatchForSelectedSession.partner_nz_bridge_number
            : currentMemberActiveMatchForSelectedSession.requester_nz_bridge_number;

          const matchedPartner = isRequester
            ? currentMemberActiveMatchForSelectedSession.partner
            : currentMemberActiveMatchForSelectedSession.requester;

          return {
            ...currentMemberActiveMatchForSelectedSession,
            member_number: currentMember?.nz_bridge_number,
            matched_partner_number: matchedPartnerNumber,
            matched_partner_first_name: matchedPartner?.first_name || "Unknown",
            matched_partner_last_name: matchedPartner?.last_name || "player",
          };
        })()
      : null;

    const mySessionMatchedPartner = mySessionMatchForDetail
      ? supabaseMembers.find(
          (member: any) =>
            String(member.nz_bridge_number) ===
            String(mySessionMatchForDetail.matched_partner_number)
        )
      : null;
      
    const sessionRequestRecords = supabaseRequestRecords.filter(
      (request: any) =>
        String(request.session_instance_id) === String(selectedSessionId)
    );

    const matchedRequestRecords = sessionRequestRecords
      .filter((request: any) => request.request_status === "Matched")
      .filter(
        (request: any, index: number, array: any[]) =>
          index ===
          array.findIndex(
            (item: any) =>
              String(item.nz_bridge_number) === String(request.nz_bridge_number)
          )
      );

    const cancelledRequestRecords = sessionRequestRecords.filter(
      (request: any) => request.request_status === "Cancelled"
    );

    const cancelledPartnershipsForSelectedSession = supabaseMatches
      .filter(
        (match: any) =>
          String(match.session_instance_id) === String(selectedSessionId) &&
          String(match.match_status).trim() === "Cancelled"
      )
      .map((match: any) => {
        const requester = supabaseMembers.find(
          (member: any) =>
            String(member.nz_bridge_number) === String(match.requester_nz_bridge_number)
        );

        const partner = supabaseMembers.find(
          (member: any) =>
            String(member.nz_bridge_number) === String(match.partner_nz_bridge_number)
        );

        return {
          ...match,
          requester,
          partner,
        };
      })
      .filter((match: any, index: number, array: any[]) => {
        const matchPairKey = [
          String(match.requester_nz_bridge_number),
          String(match.partner_nz_bridge_number),
        ]
          .sort()
          .join("-");

        return (
          index ===
          array.findIndex((item: any) => {
            const itemPairKey = [
              String(item.requester_nz_bridge_number),
              String(item.partner_nz_bridge_number),
            ]
              .sort()
              .join("-");

            return itemPairKey === matchPairKey;
          })
        );
      })
      .sort((a: any, b: any) => {
        const currentMemberNumber = String(currentMember?.nz_bridge_number);

        const aIncludesCurrentMember =
          String(a.requester_nz_bridge_number) === currentMemberNumber ||
          String(a.partner_nz_bridge_number) === currentMemberNumber;

        const bIncludesCurrentMember =
          String(b.requester_nz_bridge_number) === currentMemberNumber ||
          String(b.partner_nz_bridge_number) === currentMemberNumber;

        return Number(bIncludesCurrentMember) - Number(aIncludesCurrentMember);
      });

    const hasDirectorPartnerSearch = Boolean(
      directorMatchPartnerSearch.trim() ||
        directorMatchPartnerSurnameSearch.trim()
    );
    const directorPartnerFirstNameFilter =
      directorMatchPartnerSearch.trim().toLowerCase();
    const directorPartnerLastNameFilter =
      directorMatchPartnerSurnameSearch.trim().toLowerCase();
    const directorSessionClubId = String(
      selectedSession?.club_id || currentMember?.club_id || ""
    );
    const directorSelectedClubId =
      directorMatchClubId || directorSessionClubId;
    const directorSessionClubMember = supabaseMembers.find(
      (member: any) =>
        String(member.club_id) === directorSessionClubId &&
        String(member.clubs || member.club_name || "").trim()
    );
    const directorSessionClubName = String(
      directorSessionClubMember?.clubs ||
        directorSessionClubMember?.club_name ||
        (String(currentMember?.club_id) === directorSessionClubId
          ? currentMember?.clubs || currentMember?.club_name
          : "") ||
        "Session club"
    ).trim();
    const directorAvailableStandbyPartners = directorMatchRequest
      ? directorSelectedClubId === directorSessionClubId
        ? directorStandbyList
          .filter(
            (standbyPlayer: any) =>
              String(standbyPlayer.nz_bridge_number) !==
                String(directorMatchRequest.nz_bridge_number) &&
              String(standbyPlayer.nz_bridge_number) !==
                String(currentMember?.nz_bridge_number) &&
              String(standbyPlayer.first_name || "")
                .toLowerCase()
                .includes(directorPartnerFirstNameFilter) &&
              String(standbyPlayer.last_name || "")
                .toLowerCase()
                .includes(directorPartnerLastNameFilter)
          )
          .sort((firstPlayer: any, secondPlayer: any) =>
            `${firstPlayer.first_name || ""} ${
              firstPlayer.last_name || ""
            }`.localeCompare(
              `${secondPlayer.first_name || ""} ${
                secondPlayer.last_name || ""
              }`
            )
          )
        : []
      : [];
    const directorAvailableStandbyNumbers = directorStandbyList.map(
      (standbyPlayer: any) => String(standbyPlayer.nz_bridge_number)
    );
    const directorAvailableMemberPartners =
      directorMatchRequest && selectedSession
        ? supabaseMembers
            .filter(
              (member: any) =>
                String(member.club_id) === directorSelectedClubId &&
                member.is_active !== false &&
                String(member.nz_bridge_number) !==
                  String(directorMatchRequest.nz_bridge_number) &&
                String(member.nz_bridge_number) !==
                  String(currentMember?.nz_bridge_number) &&
                !directorAvailableStandbyNumbers.includes(
                  String(member.nz_bridge_number)
                ) &&
                !activeMatchedPlayerNumbersForSelectedSession.includes(
                  String(member.nz_bridge_number)
                ) &&
                String(member.first_name || "")
                  .toLowerCase()
                  .includes(directorPartnerFirstNameFilter) &&
                String(member.last_name || "")
                  .toLowerCase()
                  .includes(directorPartnerLastNameFilter)
            )
            .sort((firstMember: any, secondMember: any) =>
              `${firstMember.first_name || ""} ${
                firstMember.last_name || ""
              }`.localeCompare(
                `${secondMember.first_name || ""} ${
                  secondMember.last_name || ""
                }`
              )
            )
        : [];

      const currentMemberIsMatchedInSessionDetail =
        !!currentMemberActiveMatchForSelectedSession;

      const currentMemberPendingInterestsForSelectedSession =
        supabaseInterests
          .filter((interest: any) => {
            if (
              String(interest.interested_nz_bridge_number) !==
                String(currentMember?.nz_bridge_number) ||
              String(interest.interest_status).trim() !== "Pending"
            ) {
              return false;
            }

            const relatedRequest = supabaseRequestRecords.find(
              (request: any) =>
                Number(request.request_id) === Number(interest.request_id)
            );

            return (
              relatedRequest &&
              String(relatedRequest.session_instance_id) ===
                String(selectedSessionId) &&
              String(relatedRequest.request_status).trim() === "Open"
            );
          })
          .map((interest: any) => {
            const relatedRequest = supabaseRequestRecords.find(
              (request: any) =>
                Number(request.request_id) === Number(interest.request_id)
            );

            const requestOwner = supabaseMembers.find(
              (member: any) =>
                String(member.nz_bridge_number) ===
                String(relatedRequest?.nz_bridge_number)
            );

            return {
              ...interest,
              requestOwner,
            };
          });
    
    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <Nav
            view={view}
            setView={navigateFromSessionDetail}
            notifications={notifications}
            unreadNotifications={unreadNotifications}
            unreadChatCount={unreadChatCount}
            matchCount={filteredMatches.length}
          />

          {!isCurrentUserDirector && (
            <PersonalMenu
              view={view}
              setView={navigateFromSessionDetail}
              unreadNotifications={unreadNotifications}
              unreadChatCount={unreadChatCount}
              matchCount={filteredMatches.length}
            />
          )}

          <div style={styles.detailTabBar}>
            {(isCurrentUserDirector
              ? ["Active", "Matched", "Cancelled", "Standby"]
              : ["Active", "Looking", "Matched", "Cancelled"]
            ).map((filterName) => (
              <button
                key={filterName}
                type="button"
                onClick={() => setSessionDetailFilter(filterName)}
                style={{
                  ...styles.detailTab,
                  ...(sessionDetailFilter === filterName
                    ? styles.detailTabActive
                    : {}),
                }}
              >
                {filterName === "Active"
                  ? isCurrentUserDirector
                    ? "Looking"
                    : "My Status"
                  : filterName}
              </button>
            ))}
          </div>

          <Card>        
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "16px",
                color: "#334155",
                fontWeight: 400,
                fontSize: "14px",
                marginBottom: "16px",
              }}
            >
              <div>
                <span
                  onClick={() => {
                    setScrollToSessionId(selectedSessionId);
                    setView("sessions");
                  }}
                  style={{
                    color: "#4338ca",
                    fontWeight: 400,
                    cursor: "pointer",
                    textDecoration: "underline",
                    textUnderlineOffset: "3px",
                  }}
                >
                  {new Date(selectedSession.session_date + "T00:00:00").toLocaleDateString("en-NZ", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                  {" · "}
                  {selectedSession.start_time?.slice(0, 5)}
                </span>

                {" "}

                <span>{selectedSession.session_name}</span>

                <span
                  style={{
                    color: selectedSession.location_type === "Online" ? "#16a34a" : "#f59e0b",
                    marginLeft: "6px",
                  }}
                >
                  ({selectedSession.location_type})
                </span>
              </div>

              {isCurrentUserDirector && (
                <span
                  style={{
                    flexShrink: 0,
                    padding: "3px 10px",
                    borderRadius: "999px",
                    background: "#dc2626",
                    color: "white",
                    fontSize: "12px",
                    fontWeight: 700,
                  }}
                >
                  Director
                </span>
              )}
            </div>
   
            <div style={{ marginTop: "24px" }}>
              {(sessionDetailFilter === "Active" ||
                sessionDetailFilter === "Looking") && (
                <>
                  {!isCurrentUserDirector &&
                    sessionDetailFilter === "Active" &&
                    currentMemberIsMatchedInSessionDetail && (
                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          setMatchCancelReason("");
                          setMatchToCancel(currentMemberActiveMatchForSelectedSession);
                        }}
                        style={styles.matchButton}
                      >
                        Cancel match
                      </button>
                      <MyStatusSummary
                        status="MATCHED"
                        onClick={() => setSessionDetailFilter("Matched")}
                      >
                        You are matched with{" "}
                        <span
                          style={{
                            color: mySessionMatchedPartner
                              ? "#4338ca"
                              : "inherit",
                            fontWeight: 700,
                            textDecoration: mySessionMatchedPartner
                              ? "underline"
                              : "none",
                            textUnderlineOffset: "3px",
                          }}
                          onClick={(event) => {
                            if (!mySessionMatchedPartner) return;
                            event.stopPropagation();
                            setProfileToView(mySessionMatchedPartner);
                          }}
                        >
                          {mySessionMatchForDetail
                            ? `${mySessionMatchForDetail.matched_partner_first_name} ${mySessionMatchForDetail.matched_partner_last_name}`
                            : "your partner"}
                        </span>{" "}
                        for this session.
                      </MyStatusSummary>
                    </div>
                  )}

                  {!isCurrentUserDirector &&
                    sessionDetailFilter === "Active" &&
                    !currentMemberIsMatchedInSessionDetail &&
                    myRequest && (
                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          if (myRequestHasAnyInterest) {
                            setRequestToRemove(myRequest);
                            return;
                          }

                          setWantedLevel(
                            myRequest.wanted_levels
                              ? myRequest.wanted_levels
                                  .split(",")
                                  .map((item: string) => item.trim())
                                  .filter(Boolean)
                                  .join(",")
                              : ""
                          );
                          setWantedSystems(
                            myRequest.wanted_systems
                              ? myRequest.wanted_systems
                                  .split(",")
                                  .map((item: string) => item.trim())
                              : []
                          );
                          setShowRequestTypeModal(true);
                        }}
                        style={styles.matchButton}
                      >
                        {myRequestHasAnyInterest
                          ? "Remove looking request"
                          : "Edit / Remove looking request"}
                      </button>
                      <MyStatusSummary
                        status="LOOKING"
                        onClick={() => setSessionDetailFilter("Looking")}
                      >
                        You are on the looking list for this session.
                      </MyStatusSummary>
                    </div>
                  )}

                  {!isCurrentUserDirector &&
                    sessionDetailFilter === "Active" &&
                    !myRequest &&
                    !currentMemberIsMatchedInSessionDetail && (
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        flexWrap: "wrap",
                        marginBottom: "18px",
                      }}
                    >
                      {!currentStandbyRecord && (
                        <button
                          type="button"
                          onClick={openNewLookingRequestModal}
                          style={{
                            background: "#2b8792",
                            color: "white",
                            border: "none",
                            borderRadius: "999px",
                            padding: "8px 16px",
                            fontSize: "14px",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          Add me to looking list
                        </button>
                      )}

                      {currentStandbyRecord ||
                      !supabaseInterests.some((interest: any) => {
                        if (
                          String(interest.interested_nz_bridge_number) !==
                            String(currentMember?.nz_bridge_number) ||
                          String(interest.interest_status).trim() !== "Pending"
                        ) {
                          return false;
                        }

                        const relatedRequest = supabaseRequestRecords.find(
                          (request: any) =>
                            Number(request.request_id) ===
                            Number(interest.request_id)
                        );

                        return (
                          relatedRequest &&
                          String(relatedRequest.session_instance_id) ===
                            String(selectedSessionId) &&
                          String(relatedRequest.request_status).trim() === "Open"
                        );
                      }) ? (
                        <button
                          type="button"
                          onClick={async () => {
                            if (currentStandbyRecord) {
                              if (!selectedSessionId || !currentMember) return;

                              const {
                                data: standbyCancelled,
                                error: cancelStandbyError,
                              } = await supabase.rpc(
                                "cancel_player_standby",
                                {
                                  p_standby_id: Number(
                                    currentStandbyRecord.standby_id
                                  ),
                                  p_session_instance_id: selectedSessionId,
                                  p_nz_bridge_number: Number(
                                    currentMember.nz_bridge_number
                                  ),
                                }
                              );

                              if (cancelStandbyError) {
                                console.error(
                                  "Cancel standby error:",
                                  JSON.stringify(cancelStandbyError, null, 2)
                                );
                                return;
                              }

                              if (standbyCancelled !== true) {
                                alert("Standby could not be cancelled.");
                                return;
                              }

                              setCurrentStandbyRecord(null);
                              await refreshSupabaseData();
                              return;
                            }

                            openNewStandbyModal();
                          }}
                          style={{
                            background: currentStandbyRecord
                              ? "#e0f2f4"
                              : "#2b8792",
                            color: currentStandbyRecord
                              ? "#064e5f"
                              : "white",
                            border: "none",
                            borderRadius: "999px",
                            padding: "8px 16px",
                            fontSize: "14px",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          {currentStandbyRecord
                            ? "Cancel Standby"
                            : "Add me as standby"}
                        </button>
                      ) : null}
                    </div>
                  )}

                  {!isCurrentUserDirector &&
                    sessionDetailFilter === "Active" &&
                    !currentMemberIsMatchedInSessionDetail &&
                    !myRequest &&
                    currentMemberPendingInterestsForSelectedSession.length > 0 && (
                      <div>
                        {currentMemberPendingInterestsForSelectedSession.map(
                          (interest: any) => {
                            const requestOwnerName = interest.requestOwner
                              ? `${interest.requestOwner.first_name || ""} ${
                                  interest.requestOwner.last_name || ""
                                }`.trim()
                              : "another player";

                            return (
                              <MyStatusSummary
                                key={interest.interest_id}
                                status="INTEREST PENDING"
                                onClick={() => setSessionDetailFilter("Looking")}
                              >
                                You have expressed interest in partnering with{" "}
                                <strong>{requestOwnerName}</strong>.
                              </MyStatusSummary>
                            );
                          }
                        )}
                      </div>
                  )}

                  {!isCurrentUserDirector &&
                    sessionDetailFilter === "Active" &&
                    !currentMemberIsMatchedInSessionDetail &&
                    !myRequest &&
                    currentStandbyRecord && (
                    <MyStatusSummary status="STANDBY">
                      You are available as standby for this session.
                    </MyStatusSummary>
                  )}

                  {(sessionDetailFilter === "Looking" ||
                    isCurrentUserDirector) && (
                    <>
                      {uniqueSessionRequests.length === 0 && (
                        <p style={styles.text}>
                          No one is looking for a partner yet.
                        </p>
                      )}

              {uniqueSessionRequests.map((request: any) => {
                const requestPlayer = supabaseMembers.find(
                  (member: any) =>
                    String(member.nz_bridge_number) === String(request.nz_bridge_number)
                );

                const player = requestPlayer || {
                  first_name: request.first_name,
                  last_name: request.last_name,
                  level: request.level_name,
                };

                const isOwnRequest =
                  String(request.nz_bridge_number) === String(currentMember?.nz_bridge_number);

                const interestedPlayers = supabaseInterests.filter(
                  (interest: any) =>
                    Number(interest.request_id) === Number(request.request_id) &&
                    interest.interest_status === "Pending" &&
                    !activeMatchedPlayerNumbersForSelectedSession.includes(
                      String(interest.interested_nz_bridge_number)
                    )
                );

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
                   
                    <div style={styles.lookingPlayerCard}>
                    <div style={styles.name}>
                      <span
                        style={{
                          cursor: !isOwnRequest && requestPlayer ? "pointer" : "default",
                          textDecoration: !isOwnRequest && requestPlayer ? "underline" : "none",
                          textUnderlineOffset: "3px",
                        }}
                        onClick={() => {
                          if (!isOwnRequest && requestPlayer) {
                            setProfileToView(requestPlayer);
                          }
                        }}
                      >
                        {player?.first_name} {player?.last_name}
                        {isOwnRequest && " (You)"}
                      </span>
                    </div>

                    {renderLookingPreferences(request)}

                    {String(request.nz_bridge_number) === String(currentMember?.nz_bridge_number) && (
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
                          const interestedPlayer = supabaseMembers.find(
                            (member: any) =>
                              String(member.nz_bridge_number) === String(interest.interested_nz_bridge_number)
                          );

                          return (
                            <div
                              key={interest.interest_id}
                              style={styles.interestedPlayerCard}
                            >
                              <div
                                style={{
                                  ...styles.name,
                                  cursor: "pointer",
                                  textDecoration: "underline",
                                  textUnderlineOffset: "3px",
                                }}
                                onClick={() => {
                                  setProfileToView(interestedPlayer);
                                }}
                              >
                                {interestedPlayer?.first_name} {interestedPlayer?.last_name}
                              </div>

                              {renderVisiblePlayerCardDetails(
                                interest.interested_nz_bridge_number
                              )}

                              <div style={styles.buttonRow}>

                                <button
                                  type="button"
                                  style={styles.compactPrimaryAction}
                                  onClick={async () => {
                                    const { error: updateRequestError } = await supabase
                                      .from("session_requests")
                                      .update({
                                        request_status: "Matched",
                                      })
                                      .eq("request_id", request.request_id);

                                    if (updateRequestError) {
                                      console.error("Update request error:", updateRequestError);
                                      return;
                                    }

                                    const { error: updateAcceptedInterestError } = await supabase
                                      .from("interests")
                                      .update({
                                        interest_status: "Accepted",
                                      })
                                      .eq("interest_id", interest.interest_id);

                                    if (updateAcceptedInterestError) {
                                      console.error("Update accepted interest error:", updateAcceptedInterestError);
                                      return;
                                    }

                                    const { error: declineOtherInterestsError } = await supabase
                                      .from("interests")
                                      .update({
                                        interest_status: "Closed",
                                        note: "Another player has been selected for this session.",
                                      })
                                      .eq("request_id", request.request_id)
                                      .neq("interest_id", interest.interest_id)
                                      .eq("interest_status", "Pending");

                                    if (declineOtherInterestsError) {
                                      console.error("Decline other interests error:", declineOtherInterestsError);
                                      return;
                                    }

                                    const { error: insertMatchError } = await supabase
                                      .from("matches")
                                      .insert({
                                        session_instance_id: selectedSessionId,
                                        request_id: request.request_id,
                                        requester_nz_bridge_number: request.nz_bridge_number,
                                        partner_nz_bridge_number: interest.interested_nz_bridge_number,
                                        match_status: "Active",
                                        interest_id: interest.interest_id,
                                      });

                                    if (insertMatchError) {
                                      console.error("Insert match error:", insertMatchError);
                                      return;
                                    }

                                    const matchedPlayerNumbers = [
                                      Number(request.nz_bridge_number),
                                      Number(interest.interested_nz_bridge_number),
                                    ];

                                    const requestIdsForThisSession = supabaseRequestRecords
                                      .filter(
                                        (requestRecord: any) =>
                                          String(requestRecord.session_instance_id) === String(selectedSessionId)
                                      )
                                      .map((requestRecord: any) => Number(requestRecord.request_id));

                                    if (requestIdsForThisSession.length > 0) {
                                      const { error: closeMatchedPlayersOtherInterestsError } = await supabase
                                        .from("interests")
                                        .update({
                                          interest_status: "Closed",
                                          note: "Player matched in this session.",
                                        })
                                        .in("request_id", requestIdsForThisSession)
                                        .in("interested_nz_bridge_number", matchedPlayerNumbers)
                                        .neq("interest_id", interest.interest_id)
                                        .eq("interest_status", "Pending");

                                      if (closeMatchedPlayersOtherInterestsError) {
                                        console.error(
                                          "Close matched players other interests error:",
                                          closeMatchedPlayersOtherInterestsError
                                        );
                                        return;
                                      }
                                    }

                                    const { error: updateMatchedPlayersRequestsError } = await supabase
                                      .from("session_requests")
                                      .update({
                                        request_status: "Matched",
                                      })
                                      .eq("session_instance_id", selectedSessionId)
                                      .in("nz_bridge_number", matchedPlayerNumbers)
                                      .eq("request_status", "Open");

                                    if (updateMatchedPlayersRequestsError) {
                                      console.error(
                                        "Update matched players requests error:",
                                        updateMatchedPlayersRequestsError
                                      );
                                      return;
                                    }

                                    const { error: insertAcceptedNotificationError } = await supabase
                                      .from("notifications")
                                      .insert({
                                        nz_bridge_number: Number(interest.interested_nz_bridge_number),
                                        session_instance_id: selectedSessionId,
                                        request_id: Number(request.request_id),
                                        interest_id: Number(interest.interest_id),
                                        notification_type: "InterestAccepted",
                                        message: `${currentMember?.first_name} ${currentMember?.last_name} accepted your interest. You are now matched for this session.`,
                                        is_read: false,
                                      });

                                    if (insertAcceptedNotificationError) {
                                      console.error(
                                        "Insert accepted notification error:",
                                        JSON.stringify(insertAcceptedNotificationError, null, 2)
                                      );
                                    }

                                    await refreshSupabaseData();
                                  }}
                                >
                                  Accept
                                </button>

                                <button
                                  type="button"
                                  style={styles.compactPrimaryAction}
                                  onClick={() => {
                                    setInterestToDecline(interest);
                                    setDeclineReason("");
                                  }}
                                >
                                  Decline
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      minWidth: "180px",
                    }}
                  >
                    {isCurrentUserDirector && (
                      <button
                        type="button"
                        onClick={() => {
                          setDirectorMatchRequest(request);
                          setDirectorMatchPartnerSearch("");
                          setDirectorMatchPartnerSurnameSearch("");
                          setDirectorMatchClubId(
                            String(selectedSession.club_id || "")
                          );
                          setDirectorMatchPartnerNumber("");
                          setDirectorMatchStandbyId(null);
                          setDirectorMatchNote("");
                        }}
                        style={styles.matchButton}
                      >
                        Create Match
                      </button>
                    )}

                        {!currentStandbyRecord &&
                        !currentMemberIsMatchedInSessionDetail && supabaseInterests.some((interest: any) =>
                          Number(interest.interested_nz_bridge_number) === Number(currentMember?.nz_bridge_number) &&
                          Number(interest.request_id) === Number(request.request_id) &&
                          interest.interest_status === "Pending"
                        ) && (
                        <button
                          style={styles.compactSecondaryAction}
                          onClick={async () => {
                            const { error: withdrawError } = await supabase
                              .from("interests")
                              .update({
                                interest_status: "Cancelled",
                              })
                              .eq("request_id", request.request_id)
                              .eq("interested_nz_bridge_number", Number(currentMember?.nz_bridge_number))
                              .eq("interest_status", "Pending");

                            if (withdrawError) {
                              console.error("Withdraw interest error:", withdrawError);
                              return;
                            }

                            await refreshSupabaseData();
                          }}
                        >
                          Withdraw Interest
                        </button>
                      )}

                      {!currentMemberIsMatchedInSessionDetail && String(request.nz_bridge_number) !== String(currentMember?.nz_bridge_number) && (() => {
                        const declinedInterest = supabaseInterests.find(
                          (interest: any) =>
                            Number(interest.interested_nz_bridge_number) === Number(currentMember?.nz_bridge_number) &&
                            Number(interest.request_id) === Number(request.request_id) &&
                            interest.interest_status === "Declined"
                        );

                        if (!declinedInterest) return null;

                        return (
                          <div
                            style={{
                              background: "#fff7ed",
                              color: "#9a3412",
                              border: "1px solid #fed7aa",
                              borderRadius: "10px",
                              padding: "12px 16px",
                              minWidth: "180px",
                              fontWeight: 700,
                              fontSize: "14px",
                              textAlign: "center",
                            }}
                          >
                            Interest declined
                            {declinedInterest.note && (
                              <div style={{ marginTop: "6px", fontWeight: 500 }}>
                                Reason: {declinedInterest.note}
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {!currentStandbyRecord &&
                      !currentMemberIsMatchedInSessionDetail && String(request.nz_bridge_number) === String(currentMember?.nz_bridge_number) && (
                        <button
                          style={styles.compactSecondaryAction}
                          
                          onClick={() => {
                            if (myRequestHasAnyInterest) {
                              setRequestToRemove(request);
                              return;
                            }

                            setWantedLevel(
                              request.wanted_levels
                                ? request.wanted_levels
                                    .split(",")
                                    .map((item: string) => item.trim())
                                    .filter(Boolean)
                                    .join(",")
                                : ""
                            );

                            setWantedSystems(
                              request.wanted_systems
                                ? request.wanted_systems.split(",").map((item: string) => item.trim())
                                : []
                            );

                            setShowRequestTypeModal(true);
                          }}
                        >
                          {myRequestHasAnyInterest ? "Remove" : "Edit / Remove"}
                        </button>
                      )}
                    
                      {!isCurrentUserDirector &&
                       !currentStandbyRecord &&
                       !currentMemberIsMatchedInSessionDetail &&
                       String(request.nz_bridge_number) !== String(currentMember?.nz_bridge_number) &&
                       !supabaseInterests.some((interest: any) =>
                          Number(interest.interested_nz_bridge_number) === Number(currentMember?.nz_bridge_number) &&
                          Number(interest.request_id) === Number(request.request_id) &&
                          !["Cancelled", "Closed", "Withdrawn"].includes(String(interest.interest_status).trim())
                      ) && (

                      <button
                        type="button"
                        style={styles.compactPrimaryAction}
                        onClick={async () => {
                          if (!currentMember) return;

                          const { data: existingInterests, error: existingInterestError } = await supabase
                            .from("interests")
                            .select("interest_id, interest_status")
                            .eq("request_id", request.request_id)
                            .eq("interested_nz_bridge_number", Number(currentMember.nz_bridge_number));

                          if (existingInterestError) {
                            console.error("Check existing interest error:", existingInterestError);
                            return;
                          }

                          const existingActiveInterest = existingInterests?.find(
                            (interest: any) =>
                              !["Cancelled", "Closed", "Withdrawn"].includes(
                                String(interest.interest_status).trim()
                              )
                          );

                          if (existingActiveInterest) {
                            await refreshSupabaseData();
                            return;
                          }

                          const { error: insertInterestError } = await supabase
                            .from("interests")
                            .insert({
                              request_id: request.request_id,
                              interested_nz_bridge_number: Number(currentMember.nz_bridge_number),
                              interest_status: "Pending",
                              note: null,
                            });

                          if (insertInterestError) {
                            console.error("Insert interest error:", insertInterestError);
                            return;
                          }

                          const { data: insertedInterestRecord, error: insertedInterestLookupError } = await supabase
                            .from("interests")
                            .select("interest_id")
                            .eq("request_id", request.request_id)
                            .eq("interested_nz_bridge_number", Number(currentMember.nz_bridge_number))
                            .eq("interest_status", "Pending")
                            .order("created_at", { ascending: false })
                            .limit(1)
                            .maybeSingle();

                          if (insertedInterestLookupError) {
                            console.error("Inserted interest lookup error:", insertedInterestLookupError);
                          }

                          const { error: insertNotificationError } = await supabase
                            .from("notifications")
                            .insert({
                              nz_bridge_number: Number(request.nz_bridge_number),
                              session_instance_id: selectedSessionId,
                              request_id: Number(request.request_id),
                              interest_id: insertedInterestRecord?.interest_id
                                ? Number(insertedInterestRecord.interest_id)
                                : null,
                              notification_type: "InterestReceived",
                              message: `${currentMember?.first_name} ${currentMember?.last_name} expressed interest in your request.`,
                              is_read: false,
                            });

                          if (insertNotificationError) {
                            console.error(
                              "Insert notification error:",
                              JSON.stringify(insertNotificationError, null, 2)
                            );
                          }

                          await refreshSupabaseData();
                        }}
                      >
                        Express Interest
                      </button>
                      )}
                  </div>
                  </div>
                );
              })}
                    </>
                  )}
                </>
              )}

              {sessionDetailFilter === "Standby" &&
                isCurrentUserDirector && (
                  <>
                    {directorStandbyList.length === 0 && (
                      <p style={styles.text}>
                        No players are currently available as standby.
                      </p>
                    )}

                    {directorStandbyList.map((standbyPlayer: any) => {
                      const playingLevels = Array.isArray(
                        standbyPlayer.playing_level_ids
                      )
                        ? standbyPlayer.playing_level_ids
                            .map(
                              (levelId: any) =>
                                supabaseLevels.find(
                                  (level: any) =>
                                    Number(level.level_id) === Number(levelId)
                                )?.level_name
                            )
                            .filter(Boolean)
                            .join(", ")
                        : "";

                      const playingSystems = Array.isArray(
                        standbyPlayer.system_ids
                      )
                        ? standbyPlayer.system_ids
                            .map(
                              (systemId: any) =>
                                supabaseSystems.find(
                                  (system: any) =>
                                    Number(system.system_id) ===
                                    Number(systemId)
                                )?.system_name
                            )
                            .filter(Boolean)
                            .join(", ")
                        : "";

                      return (
                        <div
                          key={`standby-${standbyPlayer.standby_id}`}
                          style={{
                            background: "white",
                            borderRadius: "14px",
                            padding: "14px 16px",
                            boxShadow:
                              "0 6px 18px rgba(15, 23, 42, 0.06)",
                            marginBottom: "10px",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <div style={styles.name}>
                            {standbyPlayer.first_name || "Unknown"}{" "}
                            {standbyPlayer.last_name || "player"}
                          </div>

                          <div style={styles.text}>
                            Phone:{" "}
                            <strong>
                              {standbyPlayer.phone || "Not provided"}
                            </strong>
                          </div>

                          <div style={styles.text}>
                            Playing level(s):{" "}
                            <strong>
                              {playingLevels || "Not provided"}
                            </strong>
                          </div>

                          <div style={styles.text}>
                            Systems:{" "}
                            <strong>
                              {playingSystems || "Not provided"}
                            </strong>
                          </div>

                          {standbyPlayer.note && (
                            <div style={styles.text}>
                              Note: <strong>{standbyPlayer.note}</strong>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </>
                )}

                {sessionDetailFilter === "Matched" && (
                  <>
                    {matchedPartnershipsForSelectedSession.length === 0 && (
                    <p style={styles.text}>No matched partnerships yet.</p>
                  )}

                  {matchedPartnershipsForSelectedSession.map((match: any) => {
                    const requesterIsCurrentMember =
                      String(match.requester_nz_bridge_number) === String(currentMember?.nz_bridge_number);

                    const partnerIsCurrentMember =
                      String(match.partner_nz_bridge_number) === String(currentMember?.nz_bridge_number);

                    const renderMatchedName = (
                      player: any,
                      bridgeNumber: any,
                      isCurrentMember: boolean
                    ) => (
                      <span
                        style={{
                          ...styles.name,
                          cursor: player && !isCurrentMember ? "pointer" : "default",
                          textDecoration: player && !isCurrentMember ? "underline" : "none",
                          textUnderlineOffset: "3px",
                        }}
                        onClick={() => {
                          if (player && !isCurrentMember) {
                            setProfileToView(player);
                          }
                        }}
                      >
                        {player?.first_name || "Unknown"}{" "}
                        {player?.last_name || "player"}
                        {isCurrentMember && " (You)"}
                      </span>
                    );

                    const currentMemberIsInThisMatch =
                      requesterIsCurrentMember || partnerIsCurrentMember;

                    return (
                      <div
                        key={`matched-${match.match_id}`}
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            currentMemberIsInThisMatch ||
                            isCurrentUserDirector
                              ? "1fr 180px"
                              : "1fr",
                          gap: "16px",
                          alignItems: "center",
                          marginBottom: "10px",
                        }}
                      >
                        <div
                          style={{
                            background: "white",
                            borderRadius: "14px",
                            padding: "10px 14px",
                            boxShadow:
                              "0 6px 18px rgba(15, 23, 42, 0.06)",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <div
                            style={{
                              ...styles.nameLine,
                              gap: "8px",
                              marginBottom: 0,
                              flexWrap: "wrap",
                            }}
                          >
                            {currentMemberIsInThisMatch ? (
                              <>
                                {requesterIsCurrentMember
                                  ? renderMatchedName(
                                      match.requester,
                                      match.requester_nz_bridge_number,
                                      true
                                    )
                                  : renderMatchedName(
                                      match.partner,
                                      match.partner_nz_bridge_number,
                                      true
                                    )}

                                <span style={styles.text}>with</span>

                                {requesterIsCurrentMember
                                  ? renderMatchedName(
                                      match.partner,
                                      match.partner_nz_bridge_number,
                                      false
                                    )
                                  : renderMatchedName(
                                      match.requester,
                                      match.requester_nz_bridge_number,
                                      false
                                    )}
                              </>
                            ) : (
                              <>
                                {renderMatchedName(
                                  match.requester,
                                  match.requester_nz_bridge_number,
                                  false
                                )}

                                <span style={styles.text}>with</span>

                                {renderMatchedName(
                                  match.partner,
                                  match.partner_nz_bridge_number,
                                  false
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        {(currentMemberIsInThisMatch ||
                          isCurrentUserDirector) && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "flex-end",
                              minWidth: "180px",
                            }}
                          >
                            <button
                              type="button"
                              style={styles.matchButton}
                              onClick={() => {
                                setMatchToCancel(match);
                              }}
                            >
                              Cancel Match
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              )}

                {sessionDetailFilter === "Cancelled" && (
                  <>
                    {cancelledPartnershipsForSelectedSession.length === 0 && (
                    <p style={styles.text}>No cancelled matches for this session.</p>
                  )}

                  {cancelledPartnershipsForSelectedSession.length > 0 && (
                    <h3 style={{ ...styles.smallText, marginBottom: "10px" }}>
                    </h3>
                  )}

                  {cancelledPartnershipsForSelectedSession.map((match: any) => {
                    const requesterIsCurrentMember =
                      String(match.requester_nz_bridge_number) === String(currentMember?.nz_bridge_number);

                    const partnerIsCurrentMember =
                      String(match.partner_nz_bridge_number) === String(currentMember?.nz_bridge_number);

                    const currentMemberIsInThisCancelledMatch =
                      requesterIsCurrentMember || partnerIsCurrentMember;

                    const renderCancelledName = (
                      player: any,
                      bridgeNumber: any,
                      isCurrentMember: boolean
                    ) => (
                      <span
                        style={{
                          ...styles.name,
                          cursor: player && !isCurrentMember ? "pointer" : "default",
                          textDecoration: player && !isCurrentMember ? "underline" : "none",
                          textUnderlineOffset: "3px",
                        }}
                        onClick={() => {
                          if (player && !isCurrentMember) {
                            setProfileToView(player);
                          }
                        }}
                      >
                        {player?.first_name || "Unknown"}{" "}
                        {player?.last_name || "player"}
                        {isCurrentMember && " (You)"}
                      </span>
                    );

                    return (
                      <div
                        key={`cancelled-match-${match.match_id}`}
                        style={{
                          background: "white",
                          borderRadius: "14px",
                          padding: "12px 16px",
                          boxShadow: "0 6px 18px rgba(15, 23, 42, 0.06)",
                          marginBottom: "10px",
                          border: "1px solid #e2e8f0",
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
                          <div
                            style={{
                              ...styles.nameLine,
                              gap: "8px",
                              marginBottom: 0,
                              flexWrap: "wrap",
                            }}
                          >
                            {currentMemberIsInThisCancelledMatch ? (
                              <>
                                {requesterIsCurrentMember
                                  ? renderCancelledName(
                                      match.requester,
                                      match.requester_nz_bridge_number,
                                      true
                                    )
                                  : renderCancelledName(
                                      match.partner,
                                      match.partner_nz_bridge_number,
                                      true
                                    )}

                                <span style={styles.text}>with</span>

                                {requesterIsCurrentMember
                                  ? renderCancelledName(
                                      match.partner,
                                      match.partner_nz_bridge_number,
                                      false
                                    )
                                  : renderCancelledName(
                                      match.requester,
                                      match.requester_nz_bridge_number,
                                      false
                                    )}
                              </>
                            ) : (
                              <>
                                {renderCancelledName(
                                  match.requester,
                                  match.requester_nz_bridge_number,
                                  false
                                )}

                                <span style={styles.text}>with</span>

                                {renderCancelledName(
                                  match.partner,
                                  match.partner_nz_bridge_number,
                                  false
                                )}
                              </>
                            )}
                          </div>

                          {match.cancelled_at && (
                            <div
                              style={{
                                color: "#64748b",
                                fontSize: "12px",
                                whiteSpace: "nowrap",
                                textAlign: "right",
                              }}
                            >
                              {new Date(match.cancelled_at).toLocaleString(
                                "en-NZ",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                }
                              )}
                            </div>
                          )}
                        </div>

                        {(() => {
                          const cancelledByMember = supabaseMembers.find(
                            (member: any) =>
                              String(member.nz_bridge_number) ===
                              String(match.cancelled_by_nz_bridge_number)
                          );

                          const cancelledByName = cancelledByMember
                            ? `${cancelledByMember.first_name || ""} ${
                                cancelledByMember.last_name || ""
                              }`.trim()
                            : match.cancelled_by_nz_bridge_number
                              ? `NZ Bridge #${match.cancelled_by_nz_bridge_number}`
                              : "Not recorded";

                          return (
                            <div
                              style={{
                                color: "#475569",
                                fontSize: "12px",
                                marginTop: "8px",
                              }}
                            >
                              <div>
                                Cancelled by:{" "}
                                {match.cancelled_by_role === "Director"
                                  ? `Director — ${cancelledByName}`
                                  : cancelledByName}
                              </div>

                              {match.note && (
                                <div style={{ marginTop: "3px" }}>
                                  Reason: {match.note}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })}
                </>
              )}
             </div>
          </Card>
        </div>

        {directorMatchRequest && isCurrentUserDirector && (
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
              zIndex: 1200,
              padding: "24px",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                background: "white",
                borderRadius: "20px",
                padding: "32px",
                width: "100%",
                maxWidth: "520px",
                maxHeight: "90vh",
                overflowY: "auto",
                boxShadow: "0 24px 80px rgba(15, 23, 42, 0.25)",
              }}
            >
              <h2 style={styles.sectionTitle}>Create Match</h2>

              <p style={styles.text}>
                Match{" "}
                <strong>
                  {directorMatchRequest.first_name || "Unknown"}{" "}
                  {directorMatchRequest.last_name || "player"}
                </strong>{" "}
                with a confirmed partner.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "12px",
                  marginTop: "20px",
                  marginBottom: "16px",
                }}
              >
                <label
                  htmlFor="director-session-partner-first-name"
                  style={{ fontSize: "15px", fontWeight: 700 }}
                >
                  First name
                  <input
                    id="director-session-partner-first-name"
                    type="search"
                    value={directorMatchPartnerSearch}
                    onChange={(event) => {
                      setDirectorMatchPartnerSearch(event.target.value);
                      setDirectorMatchPartnerNumber("");
                      setDirectorMatchStandbyId(null);
                    }}
                    placeholder="First name"
                    autoComplete="off"
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "12px",
                      borderRadius: "12px",
                      border: "1px solid #cbd5e1",
                      marginTop: "8px",
                      fontSize: "15px",
                      fontWeight: 400,
                      boxSizing: "border-box",
                    }}
                  />
                </label>

                <label
                  htmlFor="director-session-partner-last-name"
                  style={{ fontSize: "15px", fontWeight: 700 }}
                >
                  Last name
                  <input
                    id="director-session-partner-last-name"
                    type="search"
                    value={directorMatchPartnerSurnameSearch}
                    onChange={(event) => {
                      setDirectorMatchPartnerSurnameSearch(event.target.value);
                      setDirectorMatchPartnerNumber("");
                      setDirectorMatchStandbyId(null);
                    }}
                    placeholder="Last name"
                    autoComplete="off"
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "12px",
                      borderRadius: "12px",
                      border: "1px solid #cbd5e1",
                      marginTop: "8px",
                      fontSize: "15px",
                      fontWeight: 400,
                      boxSizing: "border-box",
                    }}
                  />
                </label>

                <label
                  htmlFor="director-session-partner-club"
                  style={{ fontSize: "15px", fontWeight: 700 }}
                >
                  Club
                  <select
                    id="director-session-partner-club"
                    value={directorSelectedClubId}
                    onChange={(event) => {
                      setDirectorMatchClubId(event.target.value);
                      setDirectorMatchPartnerNumber("");
                      setDirectorMatchStandbyId(null);
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "12px",
                      borderRadius: "12px",
                      border: "1px solid #cbd5e1",
                      marginTop: "8px",
                      fontSize: "15px",
                      fontWeight: 400,
                      boxSizing: "border-box",
                      background: "white",
                    }}
                  >
                    <option value={directorSessionClubId}>
                      {directorSessionClubName}
                    </option>
                  </select>
                </label>
              </div>

              <div style={{ marginBottom: "18px" }}>
                <div
                  style={{
                    marginBottom: "8px",
                    fontSize: "16px",
                    fontWeight: 700,
                  }}
                >
                  Available players
                </div>

                  {directorAvailableStandbyPartners.length === 0 &&
                  directorAvailableMemberPartners.length === 0 ? (
                    <p style={{ ...styles.smallText, margin: 0 }}>
                      {hasDirectorPartnerSearch
                        ? "No available players match your search."
                        : "No available players for this session."}
                    </p>
                  ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      maxHeight: "280px",
                      overflowY: "auto",
                      paddingRight: "4px",
                    }}
                  >
                    {directorAvailableStandbyPartners.map(
                      (standbyPlayer: any) => {
                        const isSelected =
                          Number(directorMatchStandbyId) ===
                          Number(standbyPlayer.standby_id);

                        return (
                          <button
                            key={`standby-result-${standbyPlayer.standby_id}`}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => {
                              setDirectorMatchStandbyId(
                                Number(standbyPlayer.standby_id)
                              );
                              setDirectorMatchPartnerNumber(
                                String(standbyPlayer.nz_bridge_number)
                              );
                            }}
                            style={{
                              width: "100%",
                              border: isSelected
                                ? "2px solid #2b8792"
                                : "1px solid #cbd5e1",
                              borderRadius: "12px",
                              background: isSelected ? "#e0f2f4" : "#f8fafc",
                              color: "#0f172a",
                              padding: "12px 14px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "12px",
                              textAlign: "left",
                              cursor: "pointer",
                            }}
                          >
                            <span style={{ fontWeight: 700 }}>
                              {standbyPlayer.first_name || "Unknown"}{" "}
                              {standbyPlayer.last_name || "player"}
                            </span>
                            <span
                              style={{
                                color: "#0f766e",
                                fontSize: "12px",
                                fontWeight: 700,
                              }}
                            >
                              Standby
                            </span>
                          </button>
                        );
                      }
                    )}

                    {directorAvailableMemberPartners.map((member: any) => {
                      const isSelected =
                        !directorMatchStandbyId &&
                        String(directorMatchPartnerNumber) ===
                          String(member.nz_bridge_number);

                      return (
                        <button
                          key={`member-result-${member.nz_bridge_number}`}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => {
                            setDirectorMatchStandbyId(null);
                            setDirectorMatchPartnerNumber(
                              String(member.nz_bridge_number)
                            );
                          }}
                          style={{
                            width: "100%",
                            border: isSelected
                              ? "2px solid #2b8792"
                              : "1px solid #cbd5e1",
                            borderRadius: "12px",
                            background: isSelected ? "#e0f2f4" : "#f8fafc",
                            color: "#0f172a",
                            padding: "12px 14px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "12px",
                            textAlign: "left",
                            cursor: "pointer",
                          }}
                        >
                          <span style={{ fontWeight: 700 }}>
                            {member.first_name || "Unknown"}{" "}
                            {member.last_name || "player"}
                          </span>
                          <span
                            style={{ color: "#64748b", fontSize: "12px" }}
                          >
                            NZ Bridge #{member.nz_bridge_number}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "16px",
                  fontWeight: 700,
                }}
              >
                Optional note
              </label>

              <textarea
                value={directorMatchNote}
                onChange={(event) =>
                  setDirectorMatchNote(event.target.value)
                }
                placeholder="For example: Confirmed by phone"
                style={{
                  width: "100%",
                  minHeight: "90px",
                  padding: "12px",
                  borderRadius: "12px",
                  border: "1px solid #cbd5e1",
                  marginBottom: "24px",
                  fontSize: "15px",
                  boxSizing: "border-box",
                }}
              />

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                }}
              >
                <Button
                  secondary={true}
                  onClick={async () => {
                    if (
                      !selectedSessionId ||
                      !currentMember?.nz_bridge_number ||
                      !directorMatchRequest?.request_id
                    ) {
                      alert("The selected session or looking request is missing.");
                      return;
                    }

                    if (!directorMatchPartnerNumber) {
                      alert("Please select a partner.");
                      return;
                    }

                    const {
                      data: createdMatchId,
                      error: createDirectorMatchError,
                    } = await supabase.rpc("director_create_match", {
                      p_session_instance_id: selectedSessionId,
                      p_director_nz_bridge_number: Number(
                        currentMember.nz_bridge_number
                      ),
                      p_request_id: Number(
                        directorMatchRequest.request_id
                      ),
                      p_partner_nz_bridge_number: Number(
                        directorMatchPartnerNumber
                      ),
                      p_standby_id: directorMatchStandbyId
                        ? Number(directorMatchStandbyId)
                        : null,
                      p_note: directorMatchNote.trim() || null,
                    });

                    if (createDirectorMatchError) {
                      console.error(
                        "Director create match error:",
                        JSON.stringify(createDirectorMatchError, null, 2)
                      );

                      alert(
                        createDirectorMatchError.message ||
                          "The match could not be created."
                      );
                      return;
                    }

                    if (!createdMatchId) {
                      alert("The match was not created.");
                      return;
                    }

                    await refreshSupabaseData();

                    if (directorMatchStandbyId) {
                      setDirectorStandbyList((currentList) =>
                        currentList.filter(
                          (standbyPlayer: any) =>
                            Number(standbyPlayer.standby_id) !==
                            Number(directorMatchStandbyId)
                        )
                      );

                      setDirectorStandbyCounts((currentCounts) =>
                        currentCounts
                          .map((standbyCount: any) =>
                            String(standbyCount.session_instance_id) ===
                            String(selectedSessionId)
                              ? {
                                  ...standbyCount,
                                  standby_count: Math.max(
                                    0,
                                    Number(standbyCount.standby_count || 0) - 1
                                  ),
                                }
                              : standbyCount
                          )
                          .filter(
                            (standbyCount: any) =>
                              Number(standbyCount.standby_count || 0) > 0
                          )
                      );
                    }

                    setDirectorMatchRequest(null);
                    setDirectorMatchPartnerSearch("");
                    setDirectorMatchPartnerSurnameSearch("");
                    setDirectorMatchClubId("");
                    setDirectorMatchPartnerNumber("");
                    setDirectorMatchStandbyId(null);
                    setDirectorMatchNote("");
                    setSessionDetailFilter("Matched");
                  }}
                >
                  Confirm Match
                </Button>

                <Button
                  secondary={true}
                  onClick={() => {
                    setDirectorMatchRequest(null);
                    setDirectorMatchPartnerSearch("");
                    setDirectorMatchPartnerSurnameSearch("");
                    setDirectorMatchClubId("");
                    setDirectorMatchPartnerNumber("");
                    setDirectorMatchStandbyId(null);
                    setDirectorMatchNote("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {interestToDecline && (
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
              <h2 style={styles.sectionTitle}>Decline interest?</h2>

              <p style={styles.text}>
                You can add a short reason if you would like the player to see why their interest was declined.
              </p>

              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Optional reason"
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
                    setInterestToDecline(null);
                    setDeclineReason("");
                  }}
                >
                  Close
                </Button>

                <Button
                  secondary={true}
                  onClick={async () => {
                    const { error: declineInterestError } = await supabase
                      .from("interests")
                      .update({
                        interest_status: "Declined",
                        note: declineReason.trim() || null,
                      })
                      .eq("interest_id", interestToDecline.interest_id);

                    if (declineInterestError) {
                      console.error("Decline interest error:", declineInterestError);
                      return;
                    }

                    const declineMessage = `${currentMember?.first_name} ${currentMember?.last_name} declined your interest.${
                      declineReason.trim() ? ` Reason: ${declineReason.trim()}` : ""
                    }`;

                    const { error: insertDeclinedNotificationError } = await supabase
                      .from("notifications")
                      .insert({
                        nz_bridge_number: Number(interestToDecline.interested_nz_bridge_number),
                        session_instance_id: selectedSessionId,
                        request_id: Number(interestToDecline.request_id),
                        interest_id: Number(interestToDecline.interest_id),
                        notification_type: "InterestDeclined",
                        message: declineMessage,
                        is_read: false,
                      });

                    if (insertDeclinedNotificationError) {
                      console.error(
                        "Insert declined notification error:",
                        JSON.stringify(insertDeclinedNotificationError, null, 2)
                      );
                    }

                    await refreshSupabaseData();

                    setInterestToDecline(null);
                    setDeclineReason("");
                  }}
                >
                  Submit Decline
                </Button>
              </div>
            </div>
          </div>
        )}

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

                <Button
                  secondary={true}
                  onClick={async () => {
                    if (
                      !matchToCancel?.match_id ||
                      !currentMember?.nz_bridge_number
                    ) {
                      alert("The selected match or director details are missing.");
                      return;
                    }

                    if (isCurrentUserDirector) {
                      const {
                        data: matchCancelled,
                        error: directorCancelMatchError,
                      } = await supabase.rpc("director_cancel_match", {
                        p_match_id: Number(matchToCancel.match_id),
                        p_director_nz_bridge_number: Number(
                          currentMember.nz_bridge_number
                        ),
                        p_reason: matchCancelReason.trim() || null,
                      });

                      if (directorCancelMatchError) {
                        console.error(
                          "Director cancel match error:",
                          JSON.stringify(directorCancelMatchError, null, 2)
                        );

                        alert(
                          directorCancelMatchError.message ||
                            "The match could not be cancelled."
                        );
                        return;
                      }

                      if (matchCancelled !== true) {
                        alert("The match was not cancelled.");
                        return;
                      }
                    } else {
                    const { error: cancelMatchError } = await supabase
                      .from("matches")
                      .update({
                        match_status: "Cancelled",
                        note: matchCancelReason.trim() || null,
                        cancelled_by_nz_bridge_number: Number(
                          currentMember.nz_bridge_number
                        ),
                        cancelled_by_role: "Player",
                        cancelled_at: new Date().toISOString(),
                      })
                      .eq("match_id", matchToCancel.match_id);

                      if (cancelMatchError) {
                        console.error(
                          "Cancel match error:",
                          cancelMatchError
                        );
                        return;
                      }

                      const cancelledPlayerNumbers = [
                        Number(
                          matchToCancel.requester_nz_bridge_number
                        ),
                        Number(
                          matchToCancel.partner_nz_bridge_number
                        ),
                      ].filter(Boolean);

                      if (cancelledPlayerNumbers.length > 0) {
                        const {
                          error: cancelRelatedRequestsError,
                        } = await supabase
                          .from("session_requests")
                          .update({
                            request_status: "Cancelled",
                          })
                          .eq(
                            "session_instance_id",
                            matchToCancel.session_instance_id
                          )
                          .in(
                            "nz_bridge_number",
                            cancelledPlayerNumbers
                          )
                          .in("request_status", ["Open", "Matched"]);

                        if (cancelRelatedRequestsError) {
                          console.error(
                            "Cancel related requests error:",
                            cancelRelatedRequestsError
                          );
                          return;
                        }
                      }
                    }

                    await refreshSupabaseData();

                    setMatchToCancel(null);
                    setMatchCancelReason("");
                    setSessionDetailFilter("Cancelled");
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
                Level:{" "}
                {visibleProfileDetail(
                  profileToView,
                  profileToView.level,
                  profileToView.level_visible,
                  "Not completed"
                )}
              </div>

              <div style={styles.text}>
                Systems:{" "}
                {visibleProfileDetail(
                  profileToView,
                  profileToView.systems,
                  profileToView.systems_visible,
                  "Not completed"
                )}
              </div>

              <div style={styles.text}>
                Club:{" "}
                {visibleProfileDetail(
                  profileToView,
                  profileToView.clubs,
                  profileToView.club_visible,
                  "Not listed"
                )}
              </div>

              <div
                style={{
                  marginTop: "24px",
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setChatPartner(profileToView);
                    setChatReturnView(view);
                    setProfileToView(null);
                    setView("chat");
                  }}
                  style={{
                    background: "#2b8792",
                    color: "white",
                    border: "none",
                    borderRadius: "999px",
                    padding: "8px 16px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Chat
                </button>

                <button
                  type="button"
                  onClick={() => setProfileToView(null)}
                  style={{
                    background: "#2b8792",
                    color: "white",
                    border: "none",
                    borderRadius: "999px",
                    padding: "8px 16px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
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

              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
              >
                Partner level(s)
              </label>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  marginBottom: "20px",
                }}
              >
                {supabaseLevels.map((level: any) => (
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
                      checked={wantedLevel.split(",").map((item) => item.trim()).includes(level.level_name)}
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

              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
              >
                Partner system(s)
              </label>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  marginBottom: "20px",
                }}
              >
                {supabaseSystems.map((system: any) => (
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
                <Button secondary={true}
                  onClick={async () => {
                    if (myRequest) {
                      await updateRequest();
                    } else {
                      await createRequest();
                    }
                    setShowRequestTypeModal(false);
                    setSessionDetailFilter("Looking");
                  }}
                >
                  Confirm
                </Button>

                {myRequest && (
                  <Button
                    secondary={true}
                    onClick={() => {
                      setShowRequestTypeModal(false);
                      setRequestToRemove(myRequest);
                    }}
                  >
                    Delete
                  </Button>
                )}

                <Button secondary={true}
                  onClick={() => setShowRequestTypeModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {showStandbyModal && (
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
              zIndex: 1100,
              padding: "24px",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                background: "white",
                borderRadius: "20px",
                padding: "32px",
                width: "100%",
                maxWidth: "520px",
                maxHeight: "90vh",
                overflowY: "auto",
                boxShadow: "0 24px 80px rgba(15, 23, 42, 0.25)",
              }}
            >
              <h2 style={styles.sectionTitle}>Standby Availability</h2>

              <p style={styles.text}>
                Your details will only be visible to club directors. Other players cannot see the standby list.
              </p>

              <label
                style={{
                  display: "block",
                  marginTop: "20px",
                  marginBottom: "8px",
                  fontSize: "16px",
                  fontWeight: 700,
                }}
              >
                Phone number
              </label>

              <input
                type="tel"
                value={standbyPhone}
                onChange={(event) => setStandbyPhone(event.target.value)}
                placeholder="Enter your phone number"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "12px",
                  border: "1px solid #cbd5e1",
                  marginBottom: "18px",
                  fontSize: "15px",
                  boxSizing: "border-box",
                }}
              />

              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "16px",
                  fontWeight: 700,
                }}
              >
                Your real playing level(s)
              </label>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  marginBottom: "20px",
                }}
              >
                {supabaseLevels.map((level: any) => (
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
                      checked={standbyLevelIds.includes(Number(level.level_id))}
                      onChange={(event) => {
                        const levelId = Number(level.level_id);

                        if (event.target.checked) {
                          setStandbyLevelIds([...standbyLevelIds, levelId]);
                        } else {
                          setStandbyLevelIds(
                            standbyLevelIds.filter(
                              (selectedLevelId) => selectedLevelId !== levelId
                            )
                          );
                        }
                      }}
                    />

                    {level.level_name}
                  </label>
                ))}
              </div>

              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "16px",
                  fontWeight: 700,
                }}
              >
                Systems you are knowledgeable about or happy to play
              </label>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  marginBottom: "20px",
                }}
              >
                {supabaseSystems.map((system: any) => (
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
                      checked={standbySystemIds.includes(Number(system.system_id))}
                      onChange={(event) => {
                        const systemId = Number(system.system_id);

                        if (event.target.checked) {
                          setStandbySystemIds([...standbySystemIds, systemId]);
                        } else {
                          setStandbySystemIds(
                            standbySystemIds.filter(
                              (selectedSystemId) => selectedSystemId !== systemId
                            )
                          );
                        }
                      }}
                    />

                    {system.system_name}
                  </label>
                ))}
              </div>

              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "16px",
                  fontWeight: 700,
                }}
              >
                Optional note for the directors
              </label>

              <textarea
                value={standbyNote}
                onChange={(event) => setStandbyNote(event.target.value)}
                placeholder="Anything the directors should know"
                style={{
                  width: "100%",
                  minHeight: "90px",
                  padding: "12px",
                  borderRadius: "12px",
                  border: "1px solid #cbd5e1",
                  marginBottom: "18px",
                  fontSize: "15px",
                  boxSizing: "border-box",
                }}
              />

              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  marginBottom: "24px",
                  color: "#475569",
                  fontSize: "14px",
                }}
              >
                <input
                  type="checkbox"
                  checked={standbyUpdateProfile}
                  onChange={(event) =>
                    setStandbyUpdateProfile(event.target.checked)
                  }
                />

                Update my profile with this phone number and playing information.
              </label>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                }}
              >
                <Button
                  secondary={true}
                  onClick={async () => {
                    if (!selectedSessionId || !currentMember) return;

                    if (!standbyPhone.trim()) {
                      alert("Please enter your phone number.");
                      return;
                    }

                    if (standbyLevelIds.length === 0) {
                      alert("Please select at least one playing level.");
                      return;
                    }

                    if (standbySystemIds.length === 0) {
                      alert("Please select at least one system.");
                      return;
                    }

                    const { data: existingStandbyRows, error: existingStandbyError } =
                      await supabase
                        .from("session_standby")
                        .select("standby_id")
                        .eq("session_instance_id", selectedSessionId)
                        .eq(
                          "nz_bridge_number",
                          Number(currentMember.nz_bridge_number)
                        )
                        .eq("standby_status", "Available");

                    if (existingStandbyError) {
                      console.error(
                        "Check existing standby error:",
                        existingStandbyError
                      );
                      return;
                    }

                    if (
                      existingStandbyRows &&
                      existingStandbyRows.length > 0
                    ) {
                      alert(
                        "You are already registered as standby for this session."
                      );
                      return;
                    }

                    const standbyPayload = {
                      session_instance_id: selectedSessionId,
                      nz_bridge_number: Number(
                        currentMember.nz_bridge_number
                      ),
                      standby_status: "Available",
                      phone: standbyPhone.trim(),
                      playing_level_ids: standbyLevelIds,
                      system_ids: standbySystemIds,
                      update_profile: standbyUpdateProfile,
                      note: standbyNote.trim() || null,
                    };

                    console.log(
                      "STANDBY PAYLOAD:",
                      JSON.stringify(standbyPayload, null, 2)
                    );

                    const { error: insertStandbyError } = await supabase
                      .from("session_standby")
                      .insert(standbyPayload);

                    if (insertStandbyError) {
                      console.error(
                        "Insert standby error:",
                        JSON.stringify(insertStandbyError, null, 2)
                      );
                      alert(
                        `Standby could not be saved: ${
                          insertStandbyError.message || "Unknown Supabase error"
                        }`
                      );
                      return;
                    }

                    const {
                      data: standbyStatusData,
                      error: standbyStatusError,
                    } = await supabase.rpc("get_player_standby_status", {
                      p_session_instance_id: selectedSessionId,
                      p_nz_bridge_number: Number(
                        currentMember.nz_bridge_number
                      ),
                    });

                    if (standbyStatusError) {
                      console.error(
                        "Refresh standby status error:",
                        JSON.stringify(standbyStatusError, null, 2)
                      );
                    } else {
                      setCurrentStandbyRecord(
                        standbyStatusData && standbyStatusData.length > 0
                          ? standbyStatusData[0]
                          : null
                      );
                    }

                    await refreshSupabaseData();

                    setShowStandbyModal(false);
                    setStandbyPhone("");
                    setStandbyLevelIds([]);
                    setStandbySystemIds([]);
                    setStandbyUpdateProfile(true);
                    setStandbyNote("");
                  }}
                >
                  Confirm Standby
                </Button>

                <Button
                  secondary={true}
                  onClick={() => {
                    setShowStandbyModal(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {requestToRemove && (
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
              zIndex: 1100,
              padding: "24px",
            }}
          >
            <div
              style={{
                background: "white",
                borderRadius: "20px",
                padding: "32px",
                width: "100%",
                maxWidth: "420px",
                boxShadow: "0 24px 80px rgba(15, 23, 42, 0.25)",
              }}
            >
              <h2 style={styles.sectionTitle}>Remove request?</h2>

              <p style={styles.text}>
                This will remove you from the looking list for this session.
              </p>

              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <Button
                  secondary={true}
                  onClick={async () => {
                    await removeRequest();
                    setSessionDetailFilter("Active");
                  }}
                >
                  Yes, remove me
                </Button>

                <Button
                  secondary={true}
                  onClick={() => setRequestToRemove(null)}
                >
                  Keep request
                </Button>
              </div>
            </div>
          </div>
        )}

      </main>
    );
  }

    if (view === "myStandbys") {
    const activeMyStandbys = myStandbySessions
      .filter(
        (standbySession: any) =>
          String(standbySession.standby_status).trim() === "Available"
      )
      .map((standbySession: any) => {
        const session = supabaseSessions.find(
          (session: any) =>
            String(session.session_instance_id) ===
            String(standbySession.session_instance_id)
        );

        return {
          ...standbySession,
          session,
        };
      })
      .filter((standbySession: any) => standbySession.session)
      .sort(
        (a: any, b: any) =>
          new Date(
            `${a.session.session_date}T${a.session.start_time || "00:00:00"}`
          ).getTime() -
          new Date(
            `${b.session.session_date}T${b.session.start_time || "00:00:00"}`
          ).getTime()
      );

    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <Nav
            view={view}
            setView={setView}
            notifications={notifications}
            unreadNotifications={unreadNotifications}
            unreadChatCount={unreadChatCount}
            matchCount={filteredMatches.length}
          />

          {!isCurrentUserDirector && (
            <PersonalMenu
              view={view}
              setView={setView}
              unreadNotifications={unreadNotifications}
              unreadChatCount={unreadChatCount}
              matchCount={filteredMatches.length}
            />
          )}

          <h1 style={styles.sectionTitle}>Standbys</h1>

          {activeMyStandbys.length === 0 && (
            <Card>
              <p style={styles.text}>
                You are not currently registered as standby for any upcoming
                sessions.
              </p>
            </Card>
          )}

          {activeMyStandbys.map((standbySession: any) => (
            <Card
              key={`my-standby-${standbySession.standby_id}`}
              onClick={() => {
                setSessionReturnView("myStandbys");
                setSelectedSessionId(
                  standbySession.session.session_instance_id
                );
                setSessionDetailFilter("Active");
                setView("sessionDetail");
              }}
            >
              <div>
                <span
                  style={{
                    color: "#4338ca",
                    fontWeight: 700,
                    fontSize: "16px",
                    cursor: "pointer",
                    textDecoration: "underline",
                    textUnderlineOffset: "3px",
                  }}
                >
                  {new Date(
                    standbySession.session.session_date + "T00:00:00"
                  ).toLocaleDateString("en-NZ", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                  {" · "}
                  {standbySession.session.start_time?.slice(0, 5)}
                </span>

                <span
                  style={{
                    color: "#1e293b",
                    fontSize: "14px",
                    marginLeft: "8px",
                  }}
                >
                  {standbySession.session.session_name}

                  <span
                    style={{
                      color:
                        standbySession.session.location_type === "Online"
                          ? "#16a34a"
                          : "#f59e0b",
                      fontSize: "13px",
                      marginLeft: "6px",
                    }}
                  >
                    ({standbySession.session.location_type})
                  </span>
                </span>
              </div>

              <div
                style={{
                  ...styles.smallText,
                  marginTop: "6px",
                }}
              >
                Standby status: <strong>Available</strong>
              </div>
            </Card>
          ))}
        </div>
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
            unreadChatCount={unreadChatCount}
            matchCount={filteredMatches.length}
          />

          {!isCurrentUserDirector && (
            <PersonalMenu
              view={view}
              setView={setView}
              unreadNotifications={unreadNotifications}
              unreadChatCount={unreadChatCount}
              matchCount={filteredMatches.length}
            />
          )}

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
              String(match.requester_nz_bridge_number) === String(currentMember?.nz_bridge_number)
                ? match.partner_nz_bridge_number
                : match.requester_nz_bridge_number;

            const partner = supabaseMembers.find(
              (member: any) => String(member.nz_bridge_number) === String(partnerId)
            );

            const session = supabaseSessions.find(
              (session: any) =>
                String(session.session_instance_id) === String(match.session_instance_id)
            );

            return (
              <div
                key={`${match.match_id}-${match.requester_nz_bridge_number}-${match.partner_nz_bridge_number}-${match.session_instance_id}-${index}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 180px",
                    gap: "16px",
                    alignItems: "center",
                    marginBottom: "16px",
                  }}
              >
                <Card>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "16px",
                    }}
                  >
                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          setSessionReturnView("matches");
                          setSelectedSessionId(match.session_instance_id);
                          setSessionDetailFilter(
                            match.match_status === "Cancelled" ? "Cancelled" : "Matched"
                          );
                          setView("sessionDetail");
                        }}
                        style={{
                          border: "none",
                          background: "transparent",
                          padding: 0,
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                      >
                        <span
                          style={{
                            color: "#4338ca",
                            fontWeight: 700,
                            fontSize: "16px",
                            textDecoration: "underline",
                            textUnderlineOffset: "3px",
                          }}
                        >
                          {new Date(session?.session_date + "T00:00:00").toLocaleDateString("en-NZ", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}
                          {" · "}
                          {String(session?.start_time).slice(0, 5)}
                        </span>

                        <span
                          style={{
                            color: "#1e293b",
                            fontWeight: 400,
                            fontSize: "14px",
                            marginLeft: "8px",
                          }}
                        >
                          {session?.session_name || "Session"}
                          <span
                            style={{
                              color:
                                session?.location_type === "Online"
                                  ? "#16a34a"
                                  : "#f59e0b",
                              fontSize: "13px",
                              marginLeft: "6px",
                            }}
                          >
                            ({session?.location_type})
                          </span>
                        </span>
                      </button>
                    </div>

                    <div
                      style={{
                        color: "#0f172a",
                        fontWeight: 400,
                        fontSize: "15px",
                        whiteSpace: "nowrap",
                        textAlign: "right",
                      }}
                    >
                      Matched with{" "}
                      <span
                        style={{
                          color: partner ? "#4338ca" : "#0f172a",
                          fontWeight: 700,
                          cursor: partner ? "pointer" : "default",
                          textDecoration: partner ? "underline" : "none",
                          textUnderlineOffset: "3px",
                        }}
                        onClick={() => {
                          if (partner) {
                            setProfileToView(partner);
                          }
                        }}
                      >
                        {partner?.first_name} {partner?.last_name}
                      </span>
                    </div>
                  </div>
                </Card>

                  <div>
                    {match.match_status === "Active" &&
                      new Date(session?.session_date + "T00:00:00") >= new Date(new Date().setHours(0, 0, 0, 0)) && (
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
                Level:{" "}
                {visibleProfileDetail(
                  profileToView,
                  profileToView.level || profileToView.level_name,
                  profileToView.level_visible,
                  "Not completed"
                )}
              </div>

              <div style={styles.text}>
                Systems:{" "}
                {visibleProfileDetail(
                  profileToView,
                  profileToView.systems,
                  profileToView.systems_visible,
                  "Not completed"
                )}
              </div>

              <div style={styles.text}>
                Club:{" "}
                {visibleProfileDetail(
                  profileToView,
                  profileToView.clubs,
                  profileToView.club_visible,
                  "Not listed"
                )}
              </div>

              <div
                style={{
                  marginTop: "24px",
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                {String(profileToView.nz_bridge_number) !== String(currentMember?.nz_bridge_number) && (
                  <button
                    type="button"
                    onClick={() => {
                      setChatPartner(profileToView);
                      setChatReturnView(view);
                      setProfileToView(null);
                      setView("chat");
                    }}
                    style={{
                      background: "#2b8792",
                      color: "white",
                      border: "none",
                      borderRadius: "999px",
                      padding: "8px 16px",
                      fontSize: "14px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Chat
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setProfileToView(null)}
                  style={{
                    background: "#2b8792",
                    color: "white",
                    border: "none",
                    borderRadius: "999px",
                    padding: "8px 16px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

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

              <Button
                secondary={true}
                onClick={async () => {
                const { error: cancelMatchError } = await supabase
                  .from("matches")
                  .update({
                    match_status: "Cancelled",
                    note: matchCancelReason.trim() || null,
                    cancelled_by_nz_bridge_number: Number(
                      currentMember.nz_bridge_number
                    ),
                    cancelled_by_role: "Player",
                    cancelled_at: new Date().toISOString(),
                  })
                  .eq("match_id", matchToCancel.match_id);

                  if (cancelMatchError) {
                    console.error("Cancel match error:", cancelMatchError);
                    return;
                  }

                  const cancelledPlayerNumbers = [
                    Number(matchToCancel.requester_nz_bridge_number),
                    Number(matchToCancel.partner_nz_bridge_number),
                  ].filter(Boolean);

                  if (cancelledPlayerNumbers.length > 0) {
                    const { error: cancelRelatedRequestsError } = await supabase
                      .from("session_requests")
                      .update({
                        request_status: "Cancelled",
                      })
                      .eq("session_instance_id", matchToCancel.session_instance_id)
                      .in("nz_bridge_number", cancelledPlayerNumbers)
                      .in("request_status", ["Open", "Matched"]);

                    if (cancelRelatedRequestsError) {
                      console.error("Cancel related requests error:", cancelRelatedRequestsError);
                      return;
                    }
                  }

                  await refreshSupabaseData();

                  setMatchToCancel(null);
                  setMatchCancelReason("");
                }}
              >
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
            unreadChatCount={unreadChatCount}
            matchCount={filteredMatches.length}
          />

          {!isCurrentUserDirector && (
            <PersonalMenu
              view={view}
              setView={setView}
              unreadNotifications={unreadNotifications}
              unreadChatCount={unreadChatCount}
              matchCount={filteredMatches.length}
            />
          )}

            <div style={{ marginTop: "8px" }}></div>

        {myNotifications.length === 0 && (
          <Card>
            <p style={styles.text}>No notifications yet.</p>
          </Card>
        )}

        {myNotifications.map((notification: any) => {
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
                <span
                  style={{
                    cursor:
                      notification.type === "ChatMessage" && notification.otherPlayer
                        ? "pointer"
                        : notification.sessionInstanceId
                        ? "pointer"
                        : "default",
                    textDecoration: "none",
                    fontWeight: 400,
                  }}
                  onClick={() => {
                    if (notification.type === "ChatMessage" && notification.otherPlayer) {
                      setChatPartner(notification.otherPlayer);
                      setChatReturnView(view);
                      setProfileToView(null);
                      setView("chat");
                      return;
                    }

                    if (!notification.sessionInstanceId) return;

                    setProfileToView(null);
                    setScrollToSessionId(notification.sessionInstanceId);
                    setView("sessions");
                  }}
                >
                  {notification.type === "ChatMessage" ? (
                    <span
                      style={{
                        color: "#4338ca",
                        fontWeight: 700,
                        textDecoration: "underline",
                        textUnderlineOffset: "3px",
                      }}
                    >
                      Chat message
                    </span>
                  ) : (
                    <>
                      <span
                        style={{
                          color: "#4338ca",
                          fontWeight: 400,
                          fontSize: "14px",
                          textDecoration: notification.sessionInstanceId ? "underline" : "none",
                          textUnderlineOffset: "3px",
                        }}
                      >
                        {String(notification.sessionLabel).split(" ").slice(0, 5).join(" ")}
                      </span>

                      <span
                        style={{
                          color: "#1e293b",
                          fontWeight: 400,
                          marginLeft: "8px",
                        }}
                      >
                        {String(notification.sessionLabel).split(" ").slice(5).join(" ")}
                        {notification.sessionLocationType && (
                          <span
                            style={{
                              color:
                                notification.sessionLocationType === "Online"
                                  ? "#16a34a"
                                  : notification.sessionLocationType ===
                                    "Tournaments"
                                  ? "#dc2626"
                                  : "#f59e0b",
                              fontSize: "13px",
                              fontWeight: 400,
                              marginLeft: "6px",
                            }}
                          >
                            {`(${
                              notification.sessionLocationType === "Tournaments"
                                ? "Tournament"
                                : notification.sessionLocationType
                            })`}
                          </span>
                        )}
                      </span>
                    </>
                  )}
                </span>

                <span>{actionTime}</span>
              </div>

              <div
                style={{
                  ...styles.text,
                  marginTop: "6px",
                }}
              >
                {notification.type === "TournamentPairRegistered" ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: "16px",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: "15px", fontWeight: 400 }}>
                      Pair:{" "}
                      <span
                        style={{
                          color: notification.otherPlayer ? "#4338ca" : "inherit",
                          fontWeight: 700,
                          cursor: notification.otherPlayer ? "pointer" : "default",
                          textDecoration: notification.otherPlayer
                            ? "underline"
                            : "none",
                          textUnderlineOffset: "3px",
                        }}
                        onClick={(event) => {
                          if (!notification.otherPlayer) return;
                          event.stopPropagation();
                          setProfileToView(notification.otherPlayer);
                        }}
                      >
                        {notification.registeredByName}
                      </span>
                      {" & "}
                      <span
                        style={{
                          color:
                            notification.tournamentPartner &&
                            String(
                              notification.tournamentPartner.nz_bridge_number
                            ) !== String(currentMember?.nz_bridge_number)
                              ? "#4338ca"
                              : "inherit",
                          fontWeight: 700,
                          cursor:
                            notification.tournamentPartner &&
                            String(
                              notification.tournamentPartner.nz_bridge_number
                            ) !== String(currentMember?.nz_bridge_number)
                              ? "pointer"
                              : "default",
                          textDecoration:
                            notification.tournamentPartner &&
                            String(
                              notification.tournamentPartner.nz_bridge_number
                            ) !== String(currentMember?.nz_bridge_number)
                              ? "underline"
                              : "none",
                          textUnderlineOffset: "3px",
                        }}
                        onClick={(event) => {
                          if (
                            !notification.tournamentPartner ||
                            String(
                              notification.tournamentPartner.nz_bridge_number
                            ) === String(currentMember?.nz_bridge_number)
                          ) {
                            return;
                          }
                          event.stopPropagation();
                          setProfileToView(notification.tournamentPartner);
                        }}
                      >
                        {notification.registeredPartnerName}
                      </span>
                      {notification.tournamentPartner &&
                        String(
                          notification.tournamentPartner.nz_bridge_number
                        ) === String(currentMember?.nz_bridge_number) &&
                        " (You)"}
                      </div>

                      <div
                        style={{
                          ...styles.smallText,
                          fontSize: "12px",
                          marginTop: "4px",
                        }}
                      >
                        Registered by{" "}
                        <span
                          style={{
                            color: notification.otherPlayer
                              ? "#4338ca"
                              : "inherit",
                            fontWeight: 700,
                            cursor: notification.otherPlayer
                              ? "pointer"
                              : "default",
                            textDecoration: notification.otherPlayer
                              ? "underline"
                              : "none",
                            textUnderlineOffset: "3px",
                          }}
                          onClick={(event) => {
                            if (!notification.otherPlayer) return;
                            event.stopPropagation();
                            setProfileToView(notification.otherPlayer);
                          }}
                        >
                          {notification.registeredByName}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <span>{notification.alertAction}</span>

                    {notification.otherPlayer && (
                      <>
                        {" - "}
                        <span
                          style={{
                            color: "#4338ca",
                            fontWeight: 700,
                            cursor: "pointer",
                            textDecoration: "underline",
                            textUnderlineOffset: "3px",
                          }}
                          onClick={(event) => {
                            event.stopPropagation();
                            setProfileToView(notification.otherPlayer);
                          }}
                        >
                          {notification.otherPlayer.first_name}{" "}
                          {notification.otherPlayer.last_name}
                        </span>
                      </>
                    )}
                  </>
                )}
              </div>

              {notification.alertReason && (
                <div
                  style={{
                    ...styles.smallText,
                    marginTop: "4px",
                    color: "#64748b",
                  }}
                >
                  Reason: {notification.alertReason}
                </div>
              )}
            </div>
          );
        })}

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
                Level:{" "}
                {visibleProfileDetail(
                  profileToView,
                  profileToView.level || profileToView.level_name,
                  profileToView.level_visible,
                  "Not completed"
                )}
              </div>

              <div style={styles.text}>
                Systems:{" "}
                {visibleProfileDetail(
                  profileToView,
                  profileToView.systems,
                  profileToView.systems_visible,
                  "Not completed"
                )}
              </div>

              <div style={styles.text}>
                Club:{" "}
                {visibleProfileDetail(
                  profileToView,
                  profileToView.clubs,
                  profileToView.club_visible,
                  "Not listed"
                )}
              </div>

              <div
                style={{
                  marginTop: "24px",
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setChatPartner(profileToView);
                    setChatReturnView(view);
                    setProfileToView(null);
                    setView("chat");
                  }}
                  style={{
                    background: "#2b8792",
                    color: "white",
                    border: "none",
                    borderRadius: "999px",
                    padding: "8px 16px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Chat
                </button>

                <button
                  type="button"
                  onClick={() => setProfileToView(null)}
                  style={{
                    background: "#e0f2f4",
                    color: "#064e5f",
                    border: "none",
                    borderRadius: "999px",
                    padding: "8px 16px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

  if (view === "chats") {
    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <Nav
            view={view}
            setView={setView}
            notifications={notifications}
            unreadNotifications={unreadNotifications}
            unreadChatCount={unreadChatCount}
            matchCount={filteredMatches.length}
          />

          {!isCurrentUserDirector && (
            <PersonalMenu
              view={view}
              setView={setView}
              unreadNotifications={unreadNotifications}
              unreadChatCount={unreadChatCount}
              matchCount={filteredMatches.length}
            />
          )}

          {chatListItems.length === 0 && (
            <Card>
              <p style={styles.text}>No chats yet.</p>
            </Card>
          )}

          {chatListItems.map((chat: any) => (
            <Card
              key={chat.partnerNumber}
              onClick={() => {
                setChatPartner(chat.partner);
                setChatReturnView("chats");
                setView("chat");
              }}
            >
              <div style={styles.rowBetween}>
                <div style={styles.chatListIdentity}>
                  <MemberAvatar
                    avatarKey={
                      memberAvatarDisplays[String(chat.partnerNumber)]
                        ?.avatarKey ||
                      "initials"
                    }
                    photoUrl={getAvatarPhotoUrl(
                      memberAvatarDisplays[String(chat.partnerNumber)]
                        ?.avatarPhotoPath
                    )}
                    initials={getMemberInitials(chat.partner)}
                    size={54}
                  />

                  <div style={{ minWidth: 0 }}>
                    <div style={styles.chatListNameLine}>
                      <span
                        style={{
                          ...styles.name,
                          cursor: "pointer",
                          textDecoration: "underline",
                          textUnderlineOffset: "3px",
                        }}
                      >
                        {chat.partner.first_name} {chat.partner.last_name}
                        {chat.unreadCount > 0
                          ? ` (${chat.unreadCount})`
                          : ""}
                      </span>
                      {chatBlockStatusesByNumber[
                        String(chat.partnerNumber)
                      ] && (
                        <span style={styles.chatBlockedLabel}>
                          (blocked)
                        </span>
                      )}
                    </div>

                    <div style={styles.text}>
                      {chat.lastMessage?.message_text || "No messages yet."}
                    </div>
                  </div>
                </div>

                <div style={styles.smallText}>
                  {chat.lastMessage?.created_at
                    ? new Date(chat.lastMessage.created_at).toLocaleDateString("en-NZ", {
                        day: "numeric",
                        month: "short",
                      })
                    : ""}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    );
  }

  if (view === "chat") {
    const conversationMessages = supabaseChatMessages.filter(
      (message: any) =>
        currentMember &&
        chatPartner &&
        (
          (
            String(message.from_nz_bridge_number) === String(currentMember.nz_bridge_number) &&
            String(message.to_nz_bridge_number) === String(chatPartner.nz_bridge_number)
          ) ||
          (
            String(message.from_nz_bridge_number) === String(chatPartner.nz_bridge_number) &&
            String(message.to_nz_bridge_number) === String(currentMember.nz_bridge_number)
          )
        )
    );
    const chatPartnerAvatarDisplay = memberAvatarDisplays[
      String(chatPartner?.nz_bridge_number)
    ] || { avatarKey: "initials", avatarPhotoPath: null };
    const chatPartnerAvatarKey = chatPartnerAvatarDisplay.avatarKey;
    const chatPartnerAvatarPhotoUrl = getAvatarPhotoUrl(
      chatPartnerAvatarDisplay.avatarPhotoPath
    );
    const currentMemberAvatarPhotoUrl = getAvatarPhotoUrl(
      accountProfile.avatarPhotoPath
    );
    const currentMemberInitials = getMemberInitials(currentMember);
    const chatPartnerInitials = getMemberInitials(chatPartner);
    const chatMessagingDisabled =
      isChatBlockStatusLoading || chatBlockStatus.conversationBlocked;
    const chatSendDisabled =
      chatMessagingDisabled || !chatMessageText.trim();
    const chatBlockedByOtherOnly =
      chatBlockStatus.blockedMe && !chatBlockStatus.blockedByMe;
    const chatBlockButtonDisabled =
      isChatBlockStatusLoading ||
      isChatBlockSaving ||
      chatBlockedByOtherOnly;

    async function applyChatBlockAction() {
      if (
        !currentMember?.nz_bridge_number ||
        !chatPartner?.nz_bridge_number ||
        !chatBlockAction
      ) {
        return;
      }

      setIsChatBlockSaving(true);
      setChatBlockError("");

      const shouldBlock = chatBlockAction === "block";
      const { data, error } = await supabase.rpc(
        "manage_chat_user_block",
        {
          p_current_nz_bridge_number: Number(
            currentMember.nz_bridge_number
          ),
          p_other_nz_bridge_number: Number(
            chatPartner.nz_bridge_number
          ),
          p_should_block: shouldBlock,
        }
      );

      if (error) {
        console.error(
          "Update chat block error:",
          JSON.stringify(error, null, 2)
        );
        setChatBlockError(
          shouldBlock
            ? "This player could not be blocked."
            : "This player could not be unblocked."
        );
        setIsChatBlockSaving(false);
        return;
      }

      const updatedBlockStatus = normaliseChatBlockStatus(data);
      setChatBlockStatus(updatedBlockStatus);
      setChatBlockStatusesByNumber((currentStatuses) => ({
        ...currentStatuses,
        [String(chatPartner.nz_bridge_number)]:
          updatedBlockStatus.conversationBlocked,
      }));
      if (shouldBlock) setChatMessageText("");
      setChatBlockAction(null);
      setIsChatBlockSaving(false);
    }

    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <Nav
            view={view}
            setView={setView}
            notifications={notifications}
            unreadNotifications={unreadNotifications}
            unreadChatCount={unreadChatCount}
            matchCount={filteredMatches.length}
          />

          {!isCurrentUserDirector && (
            <PersonalMenu
              view={view}
              setView={setView}
              unreadNotifications={unreadNotifications}
              unreadChatCount={unreadChatCount}
              matchCount={filteredMatches.length}
            />
          )}

          <Card>
            <div style={styles.chatConversationTop}>
              <div style={styles.chatConversationHeader}>
                <MemberAvatar
                  avatarKey={chatPartnerAvatarKey}
                  photoUrl={chatPartnerAvatarPhotoUrl}
                  initials={chatPartnerInitials}
                  size={58}
                />
                <h1 style={{ ...styles.sectionTitle, margin: 0 }}>
                  {chatPartner?.first_name} {chatPartner?.last_name}
                </h1>
              </div>

              <button
                type="button"
                disabled={chatBlockButtonDisabled}
                onClick={() => {
                  if (chatBlockedByOtherOnly) return;
                  setChatBlockError("");
                  setChatBlockAction(
                    chatBlockStatus.blockedByMe ? "unblock" : "block"
                  );
                }}
                style={{
                  ...(isChatBlockStatusLoading ||
                  chatBlockStatus.blockedByMe ||
                  chatBlockedByOtherOnly
                    ? styles.compactSecondaryAction
                    : styles.compactDangerAction),
                  opacity: chatBlockButtonDisabled ? 0.6 : 1,
                  cursor: chatBlockButtonDisabled
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                {isChatBlockStatusLoading
                  ? "Checking..."
                  : chatBlockStatus.blockedByMe
                    ? "Unblock user"
                    : chatBlockStatus.blockedMe
                      ? "Blocked"
                      : "Block user"}
              </button>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                marginTop: "20px",
                marginBottom: "20px",
              }}
            >
              {conversationMessages.length === 0 && (
                <p style={styles.text}>No messages yet.</p>
              )}

              {conversationMessages.map((message: any) => {
                const isMyMessage =
                  String(message.from_nz_bridge_number) ===
                  String(currentMember?.nz_bridge_number);

                return (
                  <div
                    key={message.message_id}
                    style={{
                      alignSelf: isMyMessage ? "flex-end" : "flex-start",
                      display: "flex",
                      alignItems: "flex-end",
                      flexDirection: isMyMessage ? "row-reverse" : "row",
                      gap: "8px",
                      maxWidth: "82%",
                    }}
                  >
                    <MemberAvatar
                      avatarKey={
                        isMyMessage
                          ? accountProfile.avatarKey
                          : chatPartnerAvatarKey
                      }
                      photoUrl={
                        isMyMessage
                          ? currentMemberAvatarPhotoUrl
                          : chatPartnerAvatarPhotoUrl
                      }
                      initials={
                        isMyMessage
                          ? currentMemberInitials
                          : chatPartnerInitials
                      }
                      size={42}
                    />

                    <div
                      style={{
                        minWidth: 0,
                        background: isMyMessage ? "#dff3f1" : "#f8fafc",
                        borderWidth: "1px",
                        borderStyle: "solid",
                        borderColor: isMyMessage ? "#b7deda" : "#e2e8f0",
                        borderRadius: "14px",
                        padding: "10px 14px",
                      }}
                    >
                      <div style={styles.text}>{message.message_text}</div>

                      <div style={{ ...styles.smallText, marginTop: "4px" }}>
                        {new Date(message.created_at).toLocaleString("en-NZ", {
                          day: "numeric",
                          month: "short",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {chatBlockStatus.conversationBlocked && (
              <div style={styles.chatBlockedNotice}>
                <div style={styles.chatBlockedNoticeTitle}>
                  {chatBlockStatus.blockedByMe
                    ? `You blocked ${chatPartner?.first_name}.`
                    : "Messaging is unavailable."}
                </div>
                <div style={styles.chatBlockedNoticeText}>
                  {chatBlockStatus.blockedByMe
                    ? "Unblock this player to exchange new messages. Existing messages remain visible."
                    : "This player has blocked new messages in this conversation."}
                </div>
              </div>
            )}

            {chatBlockError && !chatBlockAction && (
              <div style={styles.chatBlockError}>{chatBlockError}</div>
            )}

            <textarea
              value={chatMessageText}
              onChange={(event) => setChatMessageText(event.target.value)}
              disabled={chatMessagingDisabled}
              placeholder={
                chatBlockStatus.conversationBlocked
                  ? "Messaging is unavailable."
                  : "Type your message..."
              }
              style={{
                width: "100%",
                minHeight: "90px",
                border: "1px solid #83bec6",
                borderRadius: "12px",
                padding: "12px",
                fontSize: "15px",
                marginBottom: "12px",
                boxSizing: "border-box",
                background: chatMessagingDisabled ? "#f8fafc" : "white",
                color: chatMessagingDisabled ? "#94a3b8" : "#0f172a",
                cursor: chatMessagingDisabled ? "not-allowed" : "text",
              }}
            />

            <button
              type="button"
              disabled={chatSendDisabled}
              onClick={async () => {
                if (!currentMember || !chatPartner || !chatMessageText.trim()) return;

                const { data: insertedChatMessage, error: sendMessageError } = await supabase
                  .from("chat_messages")
                  .insert({
                    from_nz_bridge_number: Number(currentMember.nz_bridge_number),
                    to_nz_bridge_number: Number(chatPartner.nz_bridge_number),
                    message_text: chatMessageText.trim(),
                    is_read: false,
                  })
                  .select("message_id")
                  .single();

                if (sendMessageError) {
                  console.error(
                    "Send chat message error:",
                    JSON.stringify(sendMessageError, null, 2)
                  );
                  const sendMessageErrorText = String(
                    sendMessageError.message || ""
                  ).toLowerCase();

                  if (sendMessageErrorText.includes("blocked")) {
                    setChatBlockStatus({
                      blockedByMe: false,
                      blockedMe: true,
                      conversationBlocked: true,
                    });
                    setChatBlockError(
                      "Messaging is unavailable in this conversation."
                    );
                  } else if (
                    sendMessageErrorText.includes("club members only")
                  ) {
                    setChatBlockError(
                      "This conversation is limited to club members."
                    );
                  } else {
                    setChatBlockError("Your message could not be sent.");
                  }
                  return;
                }

                const { error: insertChatNotificationError } = await supabase
                  .from("notifications")
                  .insert({
                    nz_bridge_number: Number(chatPartner.nz_bridge_number),
                    chat_message_id: insertedChatMessage?.message_id
                      ? Number(insertedChatMessage.message_id)
                      : null,
                    notification_type: "ChatMessage",
                    message: `${currentMember?.first_name} ${currentMember?.last_name} sent you a chat message.`,
                    is_read: false,
                  });

                if (insertChatNotificationError) {
                  console.error(
                    "Insert chat notification error:",
                    JSON.stringify(insertChatNotificationError, null, 2)
                  );
                }

                setChatMessageText("");
                await refreshSupabaseData();
              }}
              style={{
                ...styles.compactPrimaryAction,
                cursor: chatSendDisabled ? "not-allowed" : "pointer",
              }}
            >
              Send
            </button>
          </Card>

          {chatBlockAction && (
            <div style={styles.modalOverlay}>
              <div style={styles.chatBlockModal}>
                <h2 style={{ ...styles.sectionTitle, marginTop: 0 }}>
                  {chatBlockAction === "block"
                    ? `Block ${chatPartner?.first_name}?`
                    : `Unblock ${chatPartner?.first_name}?`}
                </h2>

                <p style={styles.text}>
                  {chatBlockAction === "block"
                    ? "You will no longer be able to exchange new messages with this player. Existing messages will remain visible."
                    : "You will be able to exchange new messages again, unless this player has also blocked you."}
                </p>

                {chatBlockError && (
                  <div style={styles.chatBlockError}>{chatBlockError}</div>
                )}

                <div style={styles.chatBlockModalActions}>
                  <button
                    type="button"
                    disabled={isChatBlockSaving}
                    onClick={applyChatBlockAction}
                    style={{
                      ...(chatBlockAction === "block"
                        ? styles.compactDangerAction
                        : styles.compactPrimaryAction),
                      opacity: isChatBlockSaving ? 0.6 : 1,
                      cursor: isChatBlockSaving
                        ? "not-allowed"
                        : "pointer",
                    }}
                  >
                    {isChatBlockSaving
                      ? "Saving..."
                      : chatBlockAction === "block"
                        ? "Block user"
                        : "Unblock user"}
                  </button>

                  <button
                    type="button"
                    disabled={isChatBlockSaving}
                    onClick={() => {
                      setChatBlockAction(null);
                      setChatBlockError("");
                    }}
                    style={{
                      ...styles.compactPrimaryAction,
                      opacity: isChatBlockSaving ? 0.6 : 1,
                      cursor: isChatBlockSaving
                        ? "not-allowed"
                        : "pointer",
                    }}
                  >
                    {chatBlockAction === "block"
                      ? "Keep conversation"
                      : "Cancel"}
                  </button>
                </div>
              </div>
            </div>
          )}
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
            unreadChatCount={unreadChatCount}
            matchCount={filteredMatches.length}
          />

          {!isCurrentUserDirector && (
            <PersonalMenu
              view={view}
              setView={setView}
              unreadNotifications={unreadNotifications}
              unreadChatCount={unreadChatCount}
              matchCount={filteredMatches.length}
            />
          )}

          <div style={styles.directorySearchBar}>
            <label style={styles.directorySearchField}>
              <span style={styles.directorySearchLabel}>First name</span>
              <input
                type="search"
                value={directoryFirstNameSearch}
                onChange={(event) =>
                  setDirectoryFirstNameSearch(event.target.value)
                }
                placeholder="e.g. Sal"
                style={styles.directorySearchInput}
              />
            </label>
            <label style={styles.directorySearchField}>
              <span style={styles.directorySearchLabel}>Surname</span>
              <input
                type="search"
                value={directorySurnameSearch}
                onChange={(event) =>
                  setDirectorySurnameSearch(event.target.value)
                }
                placeholder="e.g. She"
                style={styles.directorySearchInput}
              />
            </label>
            <label style={styles.directorySearchField}>
              <span style={styles.directorySearchLabel}>Club</span>
              <select
                value={directoryClubSearch}
                onChange={(event) =>
                  setDirectoryClubSearch(event.target.value)
                }
                style={styles.directorySearchSelect}
              >
                <option value="">All visible clubs</option>
                {directoryClubOptions.map((clubName) => (
                  <option key={clubName} value={clubName}>
                    {clubName}
                  </option>
                ))}
              </select>
            </label>
            {directoryFiltersActive && (
              <button
                type="button"
                onClick={() => {
                  setDirectoryFirstNameSearch("");
                  setDirectorySurnameSearch("");
                  setDirectoryClubSearch("");
                }}
                style={{
                  ...styles.compactSecondaryAction,
                  alignSelf: "end",
                  marginBottom: "1px",
                }}
              >
                Clear filters
              </button>
            )}
          </div>

          <div style={styles.directoryPlayerList}>
            {filteredDirectoryPlayers.map((player: any) => {
              const playerNumber = Number(
                player.nz_bridge_number || player.member_id
              );
              const playerNumberKey = String(playerNumber);
              const isCurrentPlayer =
                playerNumberKey ===
                String(currentMember?.nz_bridge_number || "");
              const visibleProfile = visibleMemberProfiles[playerNumberKey];
              const playerIdentity = {
                ...player,
                ...(!visibleProfile?._profileLoadError
                  ? visibleProfile
                  : null),
                nz_bridge_number: playerNumber,
              };
              const avatarDisplay = isCurrentPlayer
                ? {
                    avatarKey: accountProfile.avatarKey,
                    avatarPhotoPath: accountProfile.avatarPhotoPath,
                  }
                : memberAvatarDisplays[playerNumberKey] || {
                    avatarKey: "initials",
                    avatarPhotoPath: null,
                  };
              const visibleClub =
                visibleProfile?.club_visible === true
                  ? String(visibleProfile.clubs || "").trim()
                  : "";

              return (
                <button
                  key={playerNumberKey}
                  type="button"
                  onClick={() => setProfileToView(playerIdentity)}
                  style={styles.directoryPlayerRow}
                >
                  <div style={styles.directoryPlayerIdentity}>
                    <MemberAvatar
                      avatarKey={avatarDisplay.avatarKey}
                      photoUrl={getAvatarPhotoUrl(
                        avatarDisplay.avatarPhotoPath
                      )}
                      initials={getMemberInitials(playerIdentity)}
                      size={52}
                    />

                    <div style={styles.directoryPlayerSummary}>
                      <div style={styles.directoryPlayerName}>
                        {playerIdentity.first_name} {playerIdentity.last_name}
                        {isCurrentPlayer ? " (You)" : ""}
                      </div>
                      {visibleClub && (
                        <div style={styles.directoryPlayerClub}>
                          {visibleClub}
                        </div>
                      )}
                    </div>
                  </div>
                  <span style={styles.directoryPlayerChevron} aria-hidden="true">
                    ›
                  </span>
                </button>
              );
            })}
          </div>

          {filteredDirectoryPlayers.length === 0 && (
            <Card>
              {directoryFiltersActive
                ? "No players match your search."
                : "No completed profiles found."}
            </Card>
          )}

          {renderPlayerProfileModal()}
        </div>
      </main>
    );
  }

  return (
    <main style={styles.landingPage}>
      <style>{`
        @keyframes bridgeBuddySplash {
          0% { opacity: 1; visibility: visible; }
          84% { opacity: 1; visibility: visible; }
          100% { opacity: 0; visibility: hidden; }
        }
        @keyframes bridgeBuddyScene {
          0% { transform: scale(1.1) translate3d(-1.5%, 1%, 0); }
          100% { transform: scale(1) translate3d(0, 0, 0); }
        }
        @keyframes bridgeBuddySplashName {
          0%, 20% { opacity: 0; transform: translateY(12px); letter-spacing: 0.03em; }
          38% { opacity: 1; transform: translateY(0); letter-spacing: 0.08em; }
          80% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-8px); }
        }
        @keyframes bridgeBuddySuitHeart {
          0% { opacity: 0; transform: translate3d(-58vw, 27vh, 0) rotate(-28deg) scale(0.58); }
          18% { opacity: 0.92; }
          62% { opacity: 1; transform: translate3d(-6vw, -8vh, 0) rotate(14deg) scale(1.06); }
          100% { opacity: 0; transform: translate3d(42vw, -30vh, 0) rotate(40deg) scale(0.72); }
        }
        @keyframes bridgeBuddySuitSpade {
          0% { opacity: 0; transform: translate3d(58vw, -30vh, 0) rotate(28deg) scale(0.56); }
          20% { opacity: 0.92; }
          64% { opacity: 1; transform: translate3d(4vw, 5vh, 0) rotate(-16deg) scale(1); }
          100% { opacity: 0; transform: translate3d(-45vw, 29vh, 0) rotate(-42deg) scale(0.7); }
        }
        @keyframes bridgeBuddySuitDiamond {
          0% { opacity: 0; transform: translate3d(-48vw, -35vh, 0) rotate(-8deg) scale(0.45); }
          22% { opacity: 0.84; }
          68% { opacity: 0.95; transform: translate3d(8vw, -2vh, 0) rotate(24deg) scale(0.82); }
          100% { opacity: 0; transform: translate3d(48vw, 22vh, 0) rotate(52deg) scale(0.55); }
        }
        @keyframes bridgeBuddySuitClub {
          0% { opacity: 0; transform: translate3d(50vw, 34vh, 0) rotate(18deg) scale(0.42); }
          22% { opacity: 0.82; }
          66% { opacity: 0.94; transform: translate3d(-8vw, 7vh, 0) rotate(-18deg) scale(0.8); }
          100% { opacity: 0; transform: translate3d(-48vw, -25vh, 0) rotate(-48deg) scale(0.52); }
        }
        .bridgebuddy-auth-input:focus {
          border-color: #0f766e !important;
          box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.14) !important;
          outline: none !important;
        }
        .bridgebuddy-auth-input:-webkit-autofill,
        .bridgebuddy-auth-input:-webkit-autofill:hover,
        .bridgebuddy-auth-input:-webkit-autofill:focus,
        .bridgebuddy-auth-input:-webkit-autofill:active {
          -webkit-text-fill-color: #123b43 !important;
          caret-color: #0f766e !important;
          box-shadow: 0 0 0 1000px #f1f9f8 inset !important;
          transition: background-color 9999s ease-out 0s;
        }
        @media (prefers-reduced-motion: reduce) {
          .bridgebuddy-splash { animation-duration: 0.4s !important; }
          .bridgebuddy-splash-name { animation: none !important; }
          .bridgebuddy-splash-scene { animation: none !important; }
          .bridgebuddy-moving-suit { display: none !important; }
        }
      `}</style>

      <div className="bridgebuddy-splash" style={styles.landingSplash} aria-hidden="true">
        <div className="bridgebuddy-splash-scene" style={styles.landingSplashScene} />
        <div style={styles.landingSplashShade} />
        <span
          className="bridgebuddy-moving-suit"
          style={{ ...styles.landingMovingSuit, color: "#d7544d", animation: "bridgeBuddySuitHeart 3.8s ease-in-out forwards" }}
        >
          ♥
        </span>
        <span
          className="bridgebuddy-moving-suit"
          style={{ ...styles.landingMovingSuit, color: "#102f38", animation: "bridgeBuddySuitSpade 3.8s ease-in-out forwards" }}
        >
          ♠
        </span>
        <span
          className="bridgebuddy-moving-suit"
          style={{ ...styles.landingMovingSuit, color: "#e46657", animation: "bridgeBuddySuitDiamond 3.35s 0.2s ease-in-out forwards" }}
        >
          ♦
        </span>
        <span
          className="bridgebuddy-moving-suit"
          style={{ ...styles.landingMovingSuit, color: "#0b5c5c", animation: "bridgeBuddySuitClub 3.35s 0.28s ease-in-out forwards" }}
        >
          ♣
        </span>
        <div className="bridgebuddy-splash-name" style={styles.landingSplashWordmark}>
          <strong>BRIDGE BUDDY</strong>
        </div>
      </div>

      <section style={styles.landingShell}>
        <div style={styles.landingWelcome}>
          <div style={styles.landingBrand}>
            <div style={styles.landingLogoCrop} aria-hidden="true">
              <img
                src="/bridgebuddy-logo-concept.png"
                alt=""
                style={styles.landingLogoImage}
              />
            </div>
            <div style={styles.landingBrandName}>BRIDGE BUDDY</div>
          </div>

          <form
            style={styles.landingLoginForm}
            onSubmit={(event) => {
              event.preventDefault();
              if (landingAuthMode === "register") {
                registerBridgeBuddyAccount();
              } else {
                loginWithMemberEmail();
              }
            }}
          >
            <label style={styles.landingFieldLabel}>
              Email
              <input
                className="bridgebuddy-auth-input"
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                value={profileEmail}
                onChange={(event) => setProfileEmail(event.target.value)}
                style={styles.landingInput}
              />
            </label>

            <label style={styles.landingFieldLabel}>
              <span>
                {landingAuthMode === "register" ? "Create password" : "Password"}
              </span>
              <div style={styles.landingPasswordField}>
                <input
                  className="bridgebuddy-auth-input"
                  aria-label={
                    landingAuthMode === "register"
                      ? "Create password"
                      : "Password"
                  }
                  type={showLoginPassword ? "text" : "password"}
                  autoComplete={
                    landingAuthMode === "register"
                      ? "new-password"
                      : "current-password"
                  }
                  placeholder={
                    landingAuthMode === "register"
                      ? "Create a password"
                      : "Password (optional for test members)"
                  }
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                  style={styles.landingPasswordInput}
                />
                <button
                  type="button"
                  aria-label={showLoginPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowLoginPassword((isVisible) => !isVisible)}
                  style={styles.landingPasswordVisibility}
                >
                  {showLoginPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            {landingAuthMode === "register" && (
              <label style={styles.landingFieldLabel}>
                <span>Confirm password</span>
                <div style={styles.landingPasswordField}>
                  <input
                    className="bridgebuddy-auth-input"
                    aria-label="Confirm password"
                    type={showConfirmLoginPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Enter the password again"
                    value={confirmLoginPassword}
                    onChange={(event) =>
                      setConfirmLoginPassword(event.target.value)
                    }
                    style={styles.landingPasswordInput}
                  />
                  <button
                    type="button"
                    aria-label={
                      showConfirmLoginPassword
                        ? "Hide confirmed password"
                        : "Show confirmed password"
                    }
                    onClick={() =>
                      setShowConfirmLoginPassword((isVisible) => !isVisible)
                    }
                    style={styles.landingPasswordVisibility}
                  >
                    {showConfirmLoginPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </label>
            )}

            {landingAuthMode === "login" && (
              <label style={styles.landingRememberLogin}>
                <input
                  type="checkbox"
                  checked={rememberLogin}
                  onChange={(event) => setRememberLogin(event.target.checked)}
                  style={styles.landingRememberCheckbox}
                />
                Remember me
              </label>
            )}

            {landingAuthError && (
              <div role="alert" style={styles.landingAuthError}>
                {landingAuthError}
              </div>
            )}

            {landingAuthMessage && (
              <div role="status" style={styles.landingAuthMessage}>
                {landingAuthMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isLandingAuthSubmitting}
              style={{
                ...styles.landingPrimaryButton,
                opacity: isLandingAuthSubmitting ? 0.65 : 1,
                cursor: isLandingAuthSubmitting ? "wait" : "pointer",
              }}
            >
              {isLandingAuthSubmitting
                ? landingAuthMode === "register"
                  ? "Creating account..."
                  : "Logging in..."
                : landingAuthMode === "register"
                  ? "Create account"
                  : "Log in"}
            </button>
          </form>

          <div style={styles.landingRegisterPrompt}>
            {landingAuthMode === "register"
              ? "Already have an account?"
              : "No account yet?"}{" "}
            <button
              type="button"
              onClick={() => {
                setLandingAuthMode((currentMode) =>
                  currentMode === "login" ? "register" : "login"
                );
                setLoginPassword("");
                setConfirmLoginPassword("");
                setLandingAuthError("");
                setLandingAuthMessage("");
                window.setTimeout(() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }, 0);
              }}
              style={styles.landingRegisterLink}
            >
              {landingAuthMode === "register" ? "Log in" : "Register"}
            </button>
          </div>

          <p style={styles.landingCopy}>
            Find a bridge partner for a club or online session or register for a
            tournament.
          </p>
        </div>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  landingPage: {
    minHeight: "100vh",
    boxSizing: "border-box",
    position: "relative",
    overflowX: "hidden",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    padding: "clamp(20px, 5vw, 64px)",
    background: "#ffffff",
    fontFamily: "Arial, sans-serif",
  },
  landingSplash: {
    position: "fixed",
    inset: 0,
    zIndex: 100,
    display: "grid",
    placeItems: "center",
    overflow: "hidden",
    background: "#064e5f",
    animation: "bridgeBuddySplash 4s ease-in-out forwards",
    pointerEvents: "none",
  },
  landingSplashScene: {
    position: "absolute",
    inset: "-5%",
    background: "url('/bridgebuddy-motion-hero-v2.png') center / cover no-repeat",
    animation: "bridgeBuddyScene 3.9s ease-out forwards",
    willChange: "transform",
  },
  landingSplashShade: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(90deg, rgba(4, 47, 46, 0.72), rgba(4, 78, 82, 0.12) 62%, rgba(4, 47, 46, 0.08))",
  },
  landingMovingSuit: {
    position: "absolute",
    left: "50%",
    top: "50%",
    zIndex: 2,
    opacity: 0,
    fontSize: "clamp(90px, 15vw, 210px)",
    lineHeight: 1,
    filter: "drop-shadow(0 14px 18px rgba(1, 32, 36, 0.34))",
    willChange: "transform, opacity",
  },
  landingSplashWordmark: {
    position: "absolute",
    zIndex: 3,
    left: "clamp(30px, 8vw, 110px)",
    bottom: "clamp(34px, 8vh, 86px)",
    display: "flex",
    alignItems: "center",
    gap: "18px",
    padding: "0 24px",
    color: "white",
    fontSize: "clamp(34px, 6vw, 68px)",
    lineHeight: 1,
    textAlign: "center",
    textShadow: "0 5px 28px rgba(0, 0, 0, 0.34)",
    animation: "bridgeBuddySplashName 3.75s ease-in-out forwards",
  },
  landingSplashMark: {
    fontSize: "0.82em",
    lineHeight: 1,
  },
  landingSuit: {
    position: "absolute",
    fontSize: "clamp(110px, 18vw, 230px)",
    lineHeight: 1,
    color: "white",
    opacity: 0.055,
    pointerEvents: "none",
    userSelect: "none",
  },
  landingShell: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: "520px",
    margin: "auto",
    overflow: "visible",
  },
  landingWelcome: {
    width: "100%",
    boxSizing: "border-box",
    padding: "clamp(28px, 5vw, 44px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    background: "transparent",
  },
  landingBrand: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
    justifyContent: "center",
  },
  landingLogoCrop: {
    position: "relative",
    width: "340px",
    maxWidth: "100%",
    height: "145px",
    overflow: "hidden",
    flexShrink: 0,
  },
  landingLogoImage: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "340px",
    maxWidth: "100%",
    transform: "translate(-50%, -50%)",
  },
  landingMark: {
    width: "42px",
    height: "42px",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    borderRadius: "13px",
    background: "#0f766e",
    boxShadow: "0 9px 24px rgba(15, 118, 110, 0.24)",
    color: "white",
    fontSize: "23px",
    lineHeight: 1,
  },
  landingBrandName: {
    color: "#064e5f",
    fontSize: "22px",
    fontWeight: 800,
    letterSpacing: "0.7px",
  },
  landingBrandTag: {
    marginTop: "3px",
    color: "#64748b",
    fontSize: "9px",
    fontWeight: 800,
    letterSpacing: "1.7px",
  },
  landingEyebrow: {
    marginTop: "clamp(30px, 4vw, 42px)",
    color: "#0f766e",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "1.8px",
  },
  landingTitle: {
    maxWidth: "360px",
    margin: "34px 0 14px",
    color: "#123b43",
    fontSize: "clamp(27px, 3.3vw, 34px)",
    fontWeight: 800,
    lineHeight: 1.15,
    letterSpacing: "-0.8px",
  },
  landingCopy: {
    width: "min(100%, 350px)",
    maxWidth: "350px",
    margin: "82px 0 0",
    color: "#5b6874",
    fontSize: "13px",
    lineHeight: 1.85,
  },
  landingPurposeRow: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: "14px",
    marginTop: "30px",
    color: "#0f5f5c",
    fontSize: "14px",
    fontWeight: 800,
  },
  landingPurposeItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  landingPurposeIcon: {
    color: "#0f766e",
    fontSize: "19px",
  },
  landingPurposeDivider: {
    width: "1px",
    height: "22px",
    background: "#cbdedc",
  },
  landingLoginForm: {
    width: "min(100%, 350px)",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    marginTop: "44px",
  },
  landingFieldLabel: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    color: "#0f5f5c",
    fontSize: "13px",
    fontWeight: 800,
    textAlign: "left",
  },
  landingInput: {
    width: "100%",
    boxSizing: "border-box",
    paddingTop: "14px",
    paddingRight: "15px",
    paddingBottom: "14px",
    paddingLeft: "15px",
    border: "1px solid #afd1ce",
    borderRadius: "11px",
    background: "#f8fbfb",
    color: "#123b43",
    fontSize: "15px",
    fontWeight: 500,
    outlineColor: "#0f766e",
  },
  landingPasswordInput: {
    width: "100%",
    boxSizing: "border-box",
    paddingTop: "14px",
    paddingRight: "66px",
    paddingBottom: "14px",
    paddingLeft: "15px",
    border: "1px solid #afd1ce",
    borderRadius: "11px",
    background: "#f8fbfb",
    color: "#123b43",
    fontSize: "15px",
    fontWeight: 500,
    outlineColor: "#0f766e",
  },
  landingPasswordField: {
    position: "relative",
    width: "100%",
  },
  landingPasswordVisibility: {
    position: "absolute",
    top: "50%",
    right: "13px",
    transform: "translateY(-50%)",
    padding: "5px 6px",
    border: "none",
    background: "transparent",
    color: "#0f766e",
    fontSize: "12px",
    fontWeight: 800,
    cursor: "pointer",
  },
  landingRememberLogin: {
    display: "flex",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: "9px",
    color: "#416466",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
  },
  landingRememberCheckbox: {
    width: "16px",
    height: "16px",
    margin: 0,
    accentColor: "#0f766e",
    cursor: "pointer",
  },
  landingAuthError: {
    padding: "10px 12px",
    border: "1px solid #fecaca",
    borderRadius: "9px",
    background: "#fef2f2",
    color: "#b91c1c",
    fontSize: "12px",
    lineHeight: 1.45,
    textAlign: "left",
  },
  landingAuthMessage: {
    padding: "10px 12px",
    border: "1px solid #99d5ce",
    borderRadius: "9px",
    background: "#edfafa",
    color: "#0f5f5c",
    fontSize: "12px",
    lineHeight: 1.45,
    textAlign: "left",
  },
  landingActions: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "12px",
    width: "100%",
    marginTop: "52px",
  },
  landingPrimaryButton: {
    width: "min(100%, 350px)",
    padding: "16px 26px",
    border: "1px solid #0f766e",
    borderRadius: "12px",
    background: "#0f766e",
    boxShadow: "0 10px 24px rgba(15, 118, 110, 0.22)",
    color: "white",
    fontSize: "17px",
    fontWeight: 800,
    cursor: "pointer",
  },
  landingRegisterPrompt: {
    width: "100%",
    marginTop: "15px",
    color: "#64748b",
    fontSize: "12px",
    textAlign: "center",
  },
  landingRegisterLink: {
    padding: 0,
    border: "none",
    background: "transparent",
    color: "#0f766e",
    font: "inherit",
    fontWeight: 800,
    textDecoration: "underline",
    cursor: "pointer",
  },
  landingSecondaryButton: {
    minWidth: "148px",
    padding: "13px 24px",
    border: "1px solid #76b8b2",
    borderRadius: "12px",
    background: "white",
    color: "#0f665f",
    fontSize: "15px",
    fontWeight: 800,
    cursor: "pointer",
  },
  landingFeatures: {
    display: "flex",
    flexWrap: "wrap",
    gap: "16px 22px",
    marginTop: "25px",
    paddingTop: "19px",
    borderTop: "1px solid #e2e8f0",
  },
  landingFeature: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    color: "#475569",
    fontSize: "13px",
    fontWeight: 700,
  },
  landingPreview: {
    minWidth: 0,
    padding: "clamp(28px, 4vw, 46px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    background:
      "radial-gradient(circle at 90% 10%, rgba(255,255,255,0.9), transparent 30%), linear-gradient(155deg, #eef2ff 0%, #e6fffb 100%)",
    borderLeft: "1px solid #dbeafe",
  },
  landingPreviewHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    color: "#64748b",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "1.4px",
  },
  landingLiveBadge: {
    color: "#0f766e",
    fontSize: "9px",
    letterSpacing: "1px",
  },
  landingPreviewIntro: {
    margin: "14px 0 20px",
    color: "#172554",
    fontSize: "24px",
    fontWeight: 800,
    lineHeight: 1.2,
  },
  landingPreviewCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px",
    padding: "13px",
    background: "rgba(255, 255, 255, 0.92)",
    border: "1px solid rgba(203, 213, 225, 0.85)",
    borderRadius: "16px",
    boxShadow: "0 10px 24px rgba(51, 65, 85, 0.08)",
  },
  landingDateTile: {
    width: "52px",
    height: "52px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    borderRadius: "12px",
    fontSize: "9px",
    fontWeight: 800,
    letterSpacing: "0.8px",
  },
  landingPreviewDetails: {
    minWidth: 0,
    display: "flex",
    flex: 1,
    flexDirection: "column",
    gap: "4px",
    color: "#172554",
    fontSize: "14px",
  },
  landingStatusPill: {
    flexShrink: 0,
    padding: "6px 9px",
    borderRadius: "999px",
    fontSize: "10px",
    fontWeight: 800,
    whiteSpace: "nowrap",
  },
  landingConnectionCard: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginTop: "12px",
    padding: "17px",
    background: "rgba(255, 255, 255, 0.58)",
    border: "1px dashed #a5b4fc",
    borderRadius: "16px",
  },
  landingAvatars: {
    display: "flex",
    flexShrink: 0,
  },
  landingAvatar: {
    width: "36px",
    height: "36px",
    display: "grid",
    placeItems: "center",
    border: "3px solid white",
    borderRadius: "50%",
    color: "white",
    fontSize: "10px",
    fontWeight: 800,
  },
  landingFooter: {
    position: "relative",
    zIndex: 1,
    margin: "18px auto 0",
    color: "rgba(255, 255, 255, 0.72)",
    fontSize: "12px",
    letterSpacing: "0.2px",
    textAlign: "center",
  },
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    color: "#0f172a",
    padding: "24px 24px 120px",
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
  accountReadOnlyField: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    alignItems: "center",
    gap: "12px 24px",
    padding: "14px 16px",
    minWidth: 0,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
  },
  accountIdentity: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    minWidth: 0,
  },
  accountGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "14px",
  },
  accountAvatarField: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    padding: "16px",
    minWidth: 0,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
  },
  accountAvatarHelp: {
    color: "#64748b",
    fontSize: "13px",
    lineHeight: 1.4,
    marginTop: "4px",
  },
  accountPhotoActions: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  accountAvatarChoices: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(72px, 1fr))",
    gap: "12px",
    width: "100%",
  },
  accountAvatarChoice: {
    width: "72px",
    height: "72px",
    display: "grid",
    placeItems: "center",
    justifySelf: "center",
    padding: "2px",
    background: "white",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "transparent",
    borderRadius: "50%",
    cursor: "pointer",
    boxSizing: "border-box",
  },
  accountAvatarChoiceSelected: {
    borderColor: "#128078",
    boxShadow: "0 0 0 3px rgba(18, 128, 120, 0.16)",
  },
  accountEditableField: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    alignItems: "center",
    gap: "12px 24px",
    padding: "14px 16px",
    minWidth: 0,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
  },
  accountDetailMain: {
    minWidth: 0,
  },
  accountChatTitle: {
    color: "#1e293b",
    fontSize: "16px",
    fontWeight: 700,
    lineHeight: 1.4,
  },
  accountChatSetting: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "flex-end",
    justifySelf: "end",
    gap: "6px",
    width: "100%",
    minWidth: 0,
  },
  accountChatValue: {
    color: "#475569",
    fontSize: "11px",
    fontWeight: 600,
    textAlign: "right",
  },
  accountLabel: {
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: 500,
    lineHeight: 1.3,
  },
  accountValue: {
    color: "#1e293b",
    fontSize: "16px",
    fontWeight: 700,
    lineHeight: 1.4,
    marginTop: "4px",
    overflowWrap: "anywhere",
  },
  accountVisibilitySetting: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    justifySelf: "end",
    gap: "6px",
    flexWrap: "wrap",
    width: "100%",
    minWidth: 0,
  },
  accountVisibilityLabel: {
    color: "#94a3b8",
    fontSize: "11px",
    fontWeight: 500,
  },
  accountVisibilityValue: {
    color: "#475569",
    fontSize: "11px",
    fontWeight: 600,
  },
  accountVisibilityChoices: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "7px 14px",
    flexWrap: "wrap",
  },
  accountVisibilityChoice: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    color: "#334155",
    fontSize: "12px",
    fontWeight: 600,
    whiteSpace: "nowrap",
    cursor: "pointer",
  },
  accountControl: {
    width: "100%",
    marginTop: "7px",
    padding: "10px 12px",
    border: "1px solid #83bec6",
    borderRadius: "10px",
    background: "white",
    color: "#1e293b",
    fontSize: "15px",
    fontWeight: 600,
    boxSizing: "border-box",
  },
  lookingPlayerCard: {
    background: "white",
    border: "1px solid #dbe4ee",
    borderRadius: "16px",
    padding: "18px 20px",
    boxShadow: "0 5px 16px rgba(15, 23, 42, 0.06)",
    minWidth: 0,
  },
  playerProfileDetailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "10px 16px",
    marginTop: "14px",
  },
  playerProfileDetail: {
    minWidth: 0,
  },
  playerProfileDetailLabel: {
    color: "#94a3b8",
    fontSize: "11px",
    fontWeight: 500,
  },
  playerProfileDetailValue: {
    color: "#334155",
    fontSize: "13px",
    fontWeight: 700,
    lineHeight: 1.35,
    marginTop: "2px",
    overflowWrap: "anywhere",
  },
  playerDetailsMessage: {
    color: "#64748b",
    fontSize: "12px",
    marginTop: "12px",
  },
  playerProfileModalIdentity: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "20px",
  },
  directorySearchBar: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    alignItems: "end",
    gap: "10px",
    marginBottom: "14px",
  },
  directorySearchField: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    minWidth: 0,
  },
  directorySearchLabel: {
    color: "#475569",
    fontSize: "12px",
    fontWeight: 700,
  },
  directorySearchInput: {
    width: "100%",
    minWidth: 0,
    padding: "10px 13px",
    background: "white",
    border: "1px solid #b9ccd3",
    borderRadius: "10px",
    color: "#1e293b",
    fontSize: "14px",
    fontFamily: "inherit",
    outlineColor: "#0f766e",
    boxSizing: "border-box",
  },
  directorySearchSelect: {
    width: "100%",
    minWidth: 0,
    padding: "10px 34px 10px 12px",
    background: "white",
    border: "1px solid #b9ccd3",
    borderRadius: "10px",
    color: "#334155",
    fontSize: "13px",
    fontFamily: "inherit",
    cursor: "pointer",
    boxSizing: "border-box",
  },
  directoryPlayerList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  directoryPlayerRow: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "14px",
    padding: "12px 16px",
    background: "white",
    border: "1px solid #dbe4ee",
    borderRadius: "14px",
    boxShadow: "0 3px 10px rgba(15, 23, 42, 0.04)",
    fontFamily: "inherit",
    textAlign: "left",
    cursor: "pointer",
    boxSizing: "border-box",
  },
  directoryPlayerIdentity: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    minWidth: 0,
  },
  directoryPlayerSummary: {
    minWidth: 0,
  },
  directoryPlayerName: {
    color: "#1e293b",
    fontSize: "16px",
    fontWeight: 800,
    lineHeight: 1.35,
  },
  directoryPlayerClub: {
    color: "#64748b",
    fontSize: "13px",
    lineHeight: 1.35,
    marginTop: "3px",
  },
  directoryPlayerChevron: {
    flexShrink: 0,
    color: "#0f766e",
    fontSize: "26px",
    fontWeight: 500,
    lineHeight: 1,
  },
  lookingPreferences: {
    marginTop: "15px",
    paddingTop: "12px",
    borderTop: "1px solid #e2e8f0",
  },
  lookingPreferencesTitle: {
    color: "#475569",
    fontSize: "12px",
    fontWeight: 700,
    marginBottom: "7px",
  },
  lookingPreferencesGrid: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px 24px",
    flexWrap: "wrap",
  },
  lookingPreferenceLabel: {
    display: "block",
    color: "#94a3b8",
    fontSize: "11px",
    marginBottom: "2px",
  },
  lookingPreferenceValue: {
    display: "block",
    color: "#334155",
    fontSize: "13px",
    fontWeight: 700,
    lineHeight: 1.35,
  },
  interestedPlayerCard: {
    marginTop: "10px",
    padding: "12px 14px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
  },
  myStatusSummary: {
    margin: "14px 0 4px",
    padding: "14px 16px",
    background: "#f8fafc",
    border: "1px solid #cbd5e1",
    borderRadius: 12,
  },
  myStatusLabel: {
    color: "#4338ca",
    fontSize: 15,
    fontWeight: 800,
    letterSpacing: "0.08em",
    marginBottom: 7,
  },
  myStatusLinkLabel: {
    textDecoration: "underline",
    textUnderlineOffset: "3px",
  },
  myStatusText: {
    color: "#334155",
    fontSize: 16,
    fontWeight: 400,
    lineHeight: 1.5,
  },
  detailTabBar: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    flexWrap: "nowrap",
    width: "fit-content",
    maxWidth: "100%",
    overflowX: "auto",
    background: "#eef2f7",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "4px",
    boxSizing: "border-box",
    marginBottom: "18px",
  },
  detailTab: {
    border: "none",
    borderRadius: "8px",
    background: "transparent",
    color: "#475569",
    padding: "9px 14px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  detailTabActive: {
    background: "white",
    color: "#3730a3",
    fontWeight: 700,
    boxShadow: "0 1px 4px rgba(15, 23, 42, 0.16)",
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
  compactPrimaryAction: {
    background: "#267c89",
    color: "white",
    border: "none",
    borderRadius: "999px",
    padding: "8px 16px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  compactSecondaryAction: {
    background: "#e0f2f4",
    color: "#064e5f",
    border: "none",
    borderRadius: "999px",
    padding: "8px 16px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  compactDangerAction: {
    background: "#c62828",
    color: "white",
    border: "none",
    borderRadius: "999px",
    padding: "8px 16px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  compactActionDisabled: {
    background: "#e2e8f0",
    color: "#64748b",
    cursor: "not-allowed",
    boxShadow: "none",
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
  chatListIdentity: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    minWidth: 0,
  },
  chatListNameLine: {
    display: "flex",
    alignItems: "baseline",
    gap: "5px",
    flexWrap: "wrap",
  },
  chatBlockedLabel: {
    color: "#64748b",
    fontSize: "14px",
    fontWeight: 400,
  },
  chatConversationTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "14px",
    flexWrap: "wrap",
  },
  chatConversationHeader: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    minWidth: 0,
  },
  chatBlockedNotice: {
    marginBottom: "14px",
    padding: "12px 14px",
    background: "#e0f2f4",
    border: "1px solid #b7deda",
    borderRadius: "12px",
  },
  chatBlockedNoticeTitle: {
    color: "#064e5f",
    fontSize: "14px",
    fontWeight: 800,
  },
  chatBlockedNoticeText: {
    color: "#365b62",
    fontSize: "13px",
    lineHeight: 1.4,
    marginTop: "4px",
  },
  chatBlockError: {
    margin: "12px 0",
    color: "#9f1239",
    fontSize: "13px",
    fontWeight: 700,
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 100,
    display: "grid",
    placeItems: "center",
    padding: "20px",
    background: "rgba(15, 23, 42, 0.42)",
    boxSizing: "border-box",
  },
  chatBlockModal: {
    width: "100%",
    maxWidth: "430px",
    padding: "28px",
    background: "white",
    borderRadius: "20px",
    boxShadow: "0 24px 80px rgba(15, 23, 42, 0.25)",
  },
  chatBlockModalActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "22px",
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

import React from "react";

export const staffResponsibilities = [
  "Partner matching", "Tournament registrations", "Session enquiries",
  "Standby players", "Membership enquiries", "Other",
];

export type StaffProfile = {
  role_title: string;
  contact_email: string;
  responsibilities: string[];
  about: string;
};

export function emptyStaffProfile(roleTitle = "", email = ""): StaffProfile {
  return { role_title: roleTitle, contact_email: email, responsibilities: [], about: "" };
}

export function staffRoleFor(member: any, roles: any[]) {
  return roles.find(role =>
    String(role.nz_bridge_number) === String(member?.nz_bridge_number) &&
    String(role.club_id) === String(member?.club_id) &&
    role.is_current === true && ["Admin", "Director"].includes(role.role_name)
  );
}

export function StaffProfileFields({ profile, club, phone, editing, onChange, onPhoneChange, styles }: {
  profile: StaffProfile; club: string; phone: string; editing: boolean;
  onChange: (profile: StaffProfile) => void; onPhoneChange: (phone: string) => void;
  styles: Record<string, React.CSSProperties>;
}) {
  return <>
    <div style={styles.accountReadOnlyField}>
      <div style={styles.accountDetailMain}>
        <div style={styles.accountLabel}>Club</div>
        <div style={styles.accountValue}>{club}</div>
      </div>
    </div>
    {([
      ["Role/title", "role_title", "text"],
      ["Email", "contact_email", "email"],
    ] as const).map(([label, key, type]) => <div key={key} style={styles.accountEditableField}>
      <label style={styles.accountDetailMain}>
        <span style={styles.accountLabel}>{label}</span>
        {editing ? <input type={type} value={profile[key]} required={key === "role_title"}
          maxLength={key === "role_title" ? 100 : 254}
          onChange={e => onChange({ ...profile, [key]: e.target.value })}
          style={styles.accountControl} /> : <div style={styles.accountValue}>{profile[key]}</div>}
      </label>
    </div>)}
    <div style={styles.accountEditableField}>
      <label style={styles.accountDetailMain}>
        <span style={styles.accountLabel}>Contact phone</span>
        {editing ? <input type="tel" value={phone} maxLength={100}
          onChange={e => onPhoneChange(e.target.value)} style={styles.accountControl} />
          : <div style={styles.accountValue}>{phone}</div>}
      </label>
    </div>
    <div style={styles.accountEditableField}>
      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend style={styles.accountLabel}>Can help with</legend>
        {editing ? staffResponsibilities.map(item => <label key={item}
          style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
          <input type="checkbox" checked={profile.responsibilities.includes(item)}
            onChange={e => onChange({ ...profile, responsibilities: e.target.checked
              ? [...profile.responsibilities, item]
              : profile.responsibilities.filter(value => value !== item) })} />{item}
        </label>) : <div style={styles.accountValue}>{profile.responsibilities.join(", ")}</div>}
      </fieldset>
    </div>
    {(editing || profile.about) && <div style={styles.accountEditableField}>
      <label style={styles.accountDetailMain}>
        <span style={styles.accountLabel}>About / Notes{editing ? " (optional)" : ""}</span>
        {editing ? <textarea value={profile.about} maxLength={2000} rows={4}
          onChange={e => onChange({ ...profile, about: e.target.value })}
          style={styles.accountControl} />
          : <div style={{ ...styles.accountValue, whiteSpace: "pre-wrap" }}>{profile.about}</div>}
      </label>
    </div>}
  </>;
}

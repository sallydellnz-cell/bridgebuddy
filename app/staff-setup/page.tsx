"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function StaffSetup() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (mounted) {
        setEmail(data.user?.email || "");
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  return <main style={{maxWidth: "28rem", margin: "4rem auto", padding: "0 1rem"}}>
    <h1>Club staff sign-in</h1>
    {loading ? <p>Checking your sign-in…</p> : email ? <form style={{display:"grid", gap:"1rem"}} onSubmit={async event => {
      event.preventDefault();
      if (password !== repeat) { setMessage("The passwords must match."); return; }
      setSaving(true);
      try {
        const { error } = await supabase.auth.updateUser({password});
        if (error) { setMessage(error.message); return; }
        window.location.assign("/account");
      } catch { setMessage("Could not save the password. Please try again."); }
      finally { setSaving(false); }
    }}>
      <p>Choose a password for <strong>{email}</strong>. Use this address and password for future sign-ins.</p>
      <label>New password <input required minLength={8} type="password" autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)}/></label>
      <label>Confirm password <input required minLength={8} type="password" autoComplete="new-password" value={repeat} onChange={e=>setRepeat(e.target.value)}/></label>
      <button disabled={saving} type="submit">{saving ? "Saving…" : "Save password and open account"}</button>
      {message && <p role="alert">{message}</p>}
    </form> : <p>Open the invitation from the club mailbox to choose a password. If you already set one, <a href="/login">log in to BridgeBuddy</a>.</p>}
  </main>;
}

import { useEffect, useState } from "react";
import api from "../../api.js";
import { useAuth } from "../../store.js";
import { Btn, Spinner } from "../../components/primitives.jsx";

const COLORS = ["#3b6ea5", "#3f8e6e", "#c2683f", "#6d5bd0", "#a3324e", "#1f6b78"];

export default function Settings() {
  const [org, setOrg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const setOrganization = useAuth((s) => s.setOrganization);

  useEffect(() => {
    api.get("/organization").then(({ data }) => setOrg(data.organization));
  }, []);

  async function save(patch) {
    setBusy(true);
    try {
      const { data } = await api.patch("/organization", patch);
      setOrg(data.organization);
      setOrganization(data.organization);
      setMsg("Mentve.");
      setTimeout(() => setMsg(""), 2000);
    } finally {
      setBusy(false);
    }
  }

  async function uploadLogo(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    const fd = new FormData();
    fd.append("logo", file);
    try {
      const { data } = await api.post("/organization/logo", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setOrg(data.organization);
      setOrganization(data.organization);
    } finally {
      setBusy(false);
    }
  }

  if (!org) return <div className="p-8"><Spinner /></div>;

  return (
    <div className="p-8 max-w-[800px] mx-auto">
      <header className="mb-6">
        <h1 className="font-head text-3xl">Beállítások</h1>
        <p className="text-subtle text-sm mt-1">
          Szervezet alapadatai és branding — ez jelenik meg a meghívókon és PDF
          riportokon.
        </p>
      </header>

      <section className="card mb-5">
        <h2 className="font-head text-xl mb-4">Szervezet</h2>
        <div className="space-y-4">
          <label className="block">
            <span className="label">Név</span>
            <input
              className="input mt-1"
              defaultValue={org.name}
              onBlur={(e) => e.target.value !== org.name && save({ name: e.target.value })}
            />
          </label>

          <div>
            <div className="label mb-2">Fő szín</div>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => save({ primaryColor: c })}
                  className="h-10 w-10 rounded-lg border-2 transition"
                  style={{
                    background: c,
                    borderColor: org.primaryColor === c ? "#ffffff" : "rgba(255,255,255,0.1)",
                  }}
                  aria-label={c}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="label mb-2">Logó</div>
            <div className="flex items-center gap-4">
              {org.logoUrl ? (
                <img src={org.logoUrl} alt="" className="h-16 w-16 rounded-lg object-cover border" />
              ) : (
                <div className="h-16 w-16 rounded-lg border-2 border-dashed border-line flex items-center justify-center text-subtle text-xs">
                  nincs
                </div>
              )}
              <label className="btn cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={uploadLogo} />
                Feltöltés
              </label>
            </div>
            <div className="text-xs text-subtle mt-1">Max 2 MB, PNG/JPG/SVG.</div>
          </div>
        </div>
        {msg && <div className="text-xs text-green-700 mt-3">{msg}</div>}
      </section>

      <section className="card">
        <h2 className="font-head text-xl mb-4">Csapattagok</h2>
        <UserList orgUsers={org.users || []} />
      </section>
    </div>
  );
}

function UserList({ orgUsers }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [users, setUsers] = useState(orgUsers);
  const [err, setErr] = useState("");

  async function add() {
    setErr("");
    try {
      const { data } = await api.post("/auth/invite-organizer", form);
      setUsers([...users, data.user]);
      setForm({ name: "", email: "", password: "" });
      setOpen(false);
    } catch (e) {
      setErr(e.response?.data?.error || "Hiba.");
    }
  }

  return (
    <div>
      <ul className="divide-y divide-line/60">
        {users.map((u) => (
          <li key={u.id} className="py-2 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">{u.name}</div>
              <div className="text-xs text-subtle">{u.email}</div>
            </div>
            <span className="text-xs text-subtle">
              {u.role === "ADMIN" ? "Admin" : "Szervező"}
            </span>
          </li>
        ))}
      </ul>

      {open ? (
        <div className="mt-4 space-y-2 border-t border-dashed border-line pt-4">
          <input className="input" placeholder="Név" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input" placeholder="Email" type="email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input" placeholder="Kezdő jelszó" type="password" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {err && <div className="text-xs text-red-700">{err}</div>}
          <div className="flex justify-end gap-2">
            <Btn ghost onClick={() => setOpen(false)}>Mégsem</Btn>
            <Btn primary onClick={add}>Hozzáadás</Btn>
          </div>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="mt-3 text-sm text-brand-600 hover:underline">
          + Új szervező
        </button>
      )}
    </div>
  );
}

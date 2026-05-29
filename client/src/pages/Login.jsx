import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store.js";
import { Btn } from "../components/primitives.jsx";

export default function Login() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    organizationName: "",
  });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const { login, register } = useAuth();
  const nav = useNavigate();

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        await register(form);
      }
      nav("/");
    } catch (e) {
      setErr(e.response?.data?.error || "Belépés sikertelen.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500 text-white text-2xl font-head">
            ✦
          </div>
          <h1 className="font-head text-4xl mt-3">Csapatépítő</h1>
          <p className="text-subtle text-sm mt-1">
            Belsős HR-eszköz csapatépítő rendezvényekre
          </p>
        </div>

        <div className="card">
          <div className="flex gap-2 mb-5">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border-2 ${
                mode === "login"
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-line text-subtle"
              }`}
            >
              Belépés
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border-2 ${
                mode === "register"
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-line text-subtle"
              }`}
            >
              Új szervezet
            </button>
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === "register" && (
              <>
                <Field
                  label="Szervezet neve"
                  value={form.organizationName}
                  onChange={set("organizationName")}
                  placeholder="pl. Acme Kft."
                />
                <Field
                  label="A te neved"
                  value={form.name}
                  onChange={set("name")}
                  placeholder="pl. Kovács Anna"
                />
              </>
            )}
            <Field
              label="Email"
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="te@ceg.hu"
            />
            <Field
              label="Jelszó"
              type="password"
              value={form.password}
              onChange={set("password")}
              placeholder="legalább 6 karakter"
            />

            {err && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-2">
                {err}
              </div>
            )}

            <Btn primary className="w-full" disabled={busy}>
              {busy ? "Pillanat…" : mode === "login" ? "Belépés" : "Szervezet létrehozása"}
            </Btn>
          </form>
        </div>

        <p className="text-center text-xs text-subtle mt-4">
          Belsős eszköz — a céged hozzáférési politikája szerint használd.
        </p>
      </div>
    </div>
  );
}

function Field({ label, ...rest }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <input className="input mt-1" {...rest} required />
    </label>
  );
}

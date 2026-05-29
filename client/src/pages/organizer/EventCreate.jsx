import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api.js";
import { Btn, Chip, AvStack } from "../../components/primitives.jsx";

const STEPS = [
  { key: "basics", label: "Alapok" },
  { key: "schedule", label: "Időpont" },
  { key: "activities", label: "Aktivitás" },
  { key: "invites", label: "Meghívók" },
];

const GOAL_OPTS = [
  { v: "kotodes", l: "Csapatkohézió" },
  { v: "kommunikacio", l: "Kommunikáció" },
  { v: "problemamegoldas", l: "Problémamegoldás" },
  { v: "kikapcsolodas", l: "Kikapcsolódás" },
  { v: "integracio", l: "Új tagok integrációja" },
];

const TYPE_OPTS = [
  { v: "CSAPATNAP", l: "Csapatnap" },
  { v: "OFFSITE", l: "Offsite" },
  { v: "RETRO", l: "Negyedéves retro" },
  { v: "WORKSHOP", l: "Workshop" },
  { v: "BULI", l: "Buli / összejövetel" },
];

const DURATIONS = [
  { v: 120, l: "2 óra" },
  { v: 240, l: "Fél nap" },
  { v: 480, l: "Egész nap" },
  { v: 960, l: "Két nap" },
];

export default function EventCreate() {
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    type: "CSAPATNAP",
    goals: [],
    expectedHeadcount: 20,
    description: "",
    startDate: "",
    endDate: "",
    duration: 240,
    voteEnabled: false,
    location: "",
    activityIds: [],
    inviteLines: "",
  });
  const [activities, setActivities] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get("/activities").then(({ data }) => setActivities(data.activities.slice(0, 24)));
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggle = (k, v) =>
    setForm((f) => ({
      ...f,
      [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v],
    }));

  async function finish() {
    setBusy(true);
    try {
      const { data } = await api.post("/events", {
        name: form.name,
        type: form.type,
        startDate: form.startDate || null,
        endDate: form.endDate || form.startDate || null,
        location: form.location,
        description: form.description,
        expectedHeadcount: Number(form.expectedHeadcount),
        goals: form.goals,
        status: form.voteEnabled ? "SZAVAZAS" : "VEGLEGES",
      });
      const eventId = data.event.id;

      // Aktivitások hozzáadása az agendához (alapból sorban, 09:00-tól)
      let t = startMinutes(form.startDate || "09:00");
      for (const aid of form.activityIds) {
        const a = activities.find((x) => x.id === aid);
        await api.post(`/events/${eventId}/agenda`, {
          activityId: aid,
          startTime: minutesToHHmm(t),
          durationMin: a?.durationMin || 30,
          lane: "Fő helyszín",
        });
        t += (a?.durationMin || 30) + 15; // 15 perc szünet
      }

      // Résztvevők hozzáadása bulk-ban
      const lines = form.inviteLines.split(/\n+/).filter((s) => s.trim());
      if (lines.length) {
        await api.post("/participants/bulk", { eventId, lines });
      }
      nav(`/events/${eventId}`);
    } finally {
      setBusy(false);
    }
  }

  const canNext = () => {
    if (step === 0) return form.name.trim().length > 0;
    if (step === 1) return !!form.startDate;
    return true;
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      <header className="mb-6">
        <h1 className="font-head text-3xl">Új esemény</h1>
        <p className="text-subtle text-sm mt-1">
          4 lépés alatt összeáll a meghívható kártya. Jobb oldalt élőben látod az eredményt.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[160px_1fr_280px] gap-6">
        {/* Stepper */}
        <div>
          <div className="label mb-2">Lépések</div>
          <ol className="space-y-1.5">
            {STEPS.map((s, i) => (
              <li
                key={s.key}
                className={`flex items-center gap-2 text-sm py-1.5 ${
                  i === step
                    ? "text-ink font-medium"
                    : i < step
                    ? "text-subtle"
                    : "text-subtle/60"
                }`}
              >
                <span
                  className={`h-6 w-6 inline-flex items-center justify-center rounded-full text-xs ${
                    i < step
                      ? "bg-brand-500 text-white"
                      : i === step
                      ? "border-2 border-brand-500 text-brand-700"
                      : "border-2 border-line"
                  }`}
                >
                  {i < step ? "✓" : i + 1}
                </span>
                {s.label}
              </li>
            ))}
          </ol>
        </div>

        {/* Form */}
        <div className="card">
          {step === 0 && <StepBasics form={form} set={set} toggle={toggle} />}
          {step === 1 && <StepSchedule form={form} set={set} />}
          {step === 2 && (
            <StepActivities
              form={form}
              set={set}
              toggle={toggle}
              activities={activities}
            />
          )}
          {step === 3 && <StepInvites form={form} set={set} />}

          <div className="flex justify-between mt-6 pt-4 border-t border-line/60">
            <Btn ghost onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
              ← Vissza
            </Btn>
            {step < STEPS.length - 1 ? (
              <Btn primary onClick={() => setStep((s) => s + 1)} disabled={!canNext()}>
                Tovább →
              </Btn>
            ) : (
              <Btn primary onClick={finish} disabled={busy}>
                {busy ? "Mentés…" : "Esemény létrehozása"}
              </Btn>
            )}
          </div>
        </div>

        {/* Élő előnézet */}
        <div>
          <div className="label mb-2">Élő előnézet</div>
          <PreviewCard form={form} activities={activities} />
        </div>
      </div>
    </div>
  );
}

function StepBasics({ form, set, toggle }) {
  return (
    <div className="space-y-4">
      <h2 className="font-head text-xl">Mit szervezel?</h2>

      <Labeled label="Esemény neve">
        <input
          className="input"
          placeholder="pl. Q3 Csapatnap"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
        />
      </Labeled>

      <Labeled label="Típus">
        <div className="flex flex-wrap gap-2">
          {TYPE_OPTS.map((o) => (
            <button
              key={o.v}
              type="button"
              onClick={() => set("type", o.v)}
              className={form.type === o.v ? "chip chip-on" : "chip"}
            >
              {o.l}
            </button>
          ))}
        </div>
      </Labeled>

      <Labeled label="Célok (válassz többet)">
        <div className="flex flex-wrap gap-2">
          {GOAL_OPTS.map((o) => (
            <button
              key={o.v}
              type="button"
              onClick={() => toggle("goals", o.v)}
              className={form.goals.includes(o.v) ? "chip chip-on" : "chip chip-ghost"}
            >
              {o.l}
            </button>
          ))}
        </div>
      </Labeled>

      <div className="grid grid-cols-2 gap-3">
        <Labeled label="Várt létszám">
          <input
            type="number"
            min="1"
            className="input"
            value={form.expectedHeadcount}
            onChange={(e) => set("expectedHeadcount", e.target.value)}
          />
        </Labeled>
        <Labeled label="Időtartam">
          <select
            className="input"
            value={form.duration}
            onChange={(e) => set("duration", Number(e.target.value))}
          >
            {DURATIONS.map((d) => (
              <option key={d.v} value={d.v}>
                {d.l}
              </option>
            ))}
          </select>
        </Labeled>
      </div>

      <Labeled label="Rövid leírás (opcionális)">
        <textarea
          className="input min-h-[80px]"
          placeholder="Mi a cél? Milyen hangulat? Mit várunk a csapattól?"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </Labeled>
    </div>
  );
}

function StepSchedule({ form, set }) {
  return (
    <div className="space-y-4">
      <h2 className="font-head text-xl">Mikor lesz?</h2>

      <Labeled label="Kezdés">
        <input
          type="datetime-local"
          className="input"
          value={form.startDate}
          onChange={(e) => set("startDate", e.target.value)}
        />
      </Labeled>

      <Labeled label="Vége (opcionális)">
        <input
          type="datetime-local"
          className="input"
          value={form.endDate}
          onChange={(e) => set("endDate", e.target.value)}
        />
      </Labeled>

      <Labeled label="Helyszín">
        <input
          className="input"
          placeholder="pl. Balaton, kültéri helyszín"
          value={form.location}
          onChange={(e) => set("location", e.target.value)}
        />
      </Labeled>

      <Labeled label="Időpont-szavazás">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => set("voteEnabled", true)}
            className={form.voteEnabled ? "chip chip-on" : "chip"}
          >
            Igen, a csapat szavazzon
          </button>
          <button
            type="button"
            onClick={() => set("voteEnabled", false)}
            className={!form.voteEnabled ? "chip chip-on" : "chip chip-ghost"}
          >
            Én döntök
          </button>
        </div>
      </Labeled>

      <div className="text-xs text-subtle bg-paper rounded-lg p-3">
        ✦ AI tipp: ha a csapatnak elfoglaltak naptárai, érdemes szavazást indítani — a végén
        automatikusan beáll a legtöbb szavazatot kapott dátum.
      </div>
    </div>
  );
}

function StepActivities({ form, set, toggle, activities }) {
  return (
    <div className="space-y-4">
      <h2 className="font-head text-xl">Mit fogtok csinálni?</h2>
      <p className="text-sm text-subtle">
        Válaszd ki azokat az aktivitásokat, amiket az agendára szeretnél. A sorrend
        később finomítható.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[420px] overflow-y-auto pr-1">
        {activities.map((a) => {
          const on = form.activityIds.includes(a.id);
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => toggle("activityIds", a.id)}
              className={`text-left flex gap-3 items-start p-3 rounded-xl border-2 transition ${
                on
                  ? "border-brand-500 bg-brand-50"
                  : "border-line bg-card hover:border-ink"
              }`}
            >
              <span className="text-2xl flex-shrink-0">{a.imageEmoji}</span>
              <div className="min-w-0">
                <div className="font-medium text-sm leading-snug">{a.name}</div>
                <div className="text-xs text-subtle mt-0.5">
                  {a.durationMin} perc · {a.minSize}-{a.maxSize} fő ·{" "}
                  {a.indoor && a.outdoor ? "bel/kül" : a.indoor ? "beltér" : "kültér"}
                </div>
              </div>
              {on && <span className="text-brand-500 text-lg">✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepInvites({ form, set }) {
  return (
    <div className="space-y-4">
      <h2 className="font-head text-xl">Kit hívsz meg?</h2>
      <p className="text-sm text-subtle">
        Egy sor egy résztvevő. Lehet csak név, csak email, vagy „Név, email" formátumban.
      </p>

      <Labeled label="Résztvevők">
        <textarea
          className="input min-h-[220px] font-mono text-sm"
          placeholder={"Kovács Anna, anna@ceg.hu\nNagy Béla, bela@ceg.hu\nbalint@ceg.hu"}
          value={form.inviteLines}
          onChange={(e) => set("inviteLines", e.target.value)}
        />
      </Labeled>

      <div className="text-xs text-subtle bg-paper rounded-lg p-3">
        ✓ Az esemény mentése után minden résztvevő egyedi token-linket kap a mobil-nézet
        eléréséhez. Külön CSV-importot is használhatsz a részleteknél (étkezés, csapat).
      </div>
    </div>
  );
}

function PreviewCard({ form, activities }) {
  const selected = activities.filter((a) => form.activityIds.includes(a.id));
  const inviteCount = form.inviteLines.split(/\n+/).filter((s) => s.trim()).length;
  return (
    <div className="card">
      <div className="h-24 rounded-lg bg-gradient-to-br from-brand-100 to-brand-300 mb-3 flex items-center justify-center text-3xl">
        ✦
      </div>
      <div className="font-head text-xl">{form.name || "Esemény címe"}</div>
      {form.startDate && (
        <Chip className="mt-2">
          {new Date(form.startDate).toLocaleDateString("hu-HU", {
            month: "short",
            day: "numeric",
            weekday: "long",
          })}
        </Chip>
      )}
      {form.location && (
        <div className="text-xs text-subtle mt-2">{form.location}</div>
      )}
      <div className="my-3 border-t border-dashed border-line" />
      {form.goals.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {form.goals.map((g) => {
            const o = GOAL_OPTS.find((x) => x.v === g);
            return <Chip key={g}>{o?.l || g}</Chip>;
          })}
        </div>
      )}
      {selected.length > 0 && (
        <div className="text-xs text-subtle mb-2">
          {selected.length} programpont · ~
          {selected.reduce((s, a) => s + a.durationMin, 0)} perc
        </div>
      )}
      {inviteCount > 0 && (
        <div className="flex items-center justify-between text-xs">
          <AvStack names={["A", "B", "K"]} extra={`+${Math.max(0, inviteCount - 3)}`} />
          <span className="text-subtle">{inviteCount} meghívott</span>
        </div>
      )}
    </div>
  );
}

function Labeled({ label, children }) {
  return (
    <label className="block space-y-1">
      <span className="label">{label}</span>
      {children}
    </label>
  );
}

function startMinutes(dateOrTime) {
  const s = String(dateOrTime);
  if (s.includes("T")) {
    const t = s.split("T")[1].slice(0, 5);
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  }
  return 9 * 60;
}

function minutesToHHmm(m) {
  const h = String(Math.floor(m / 60)).padStart(2, "0");
  const mm = String(m % 60).padStart(2, "0");
  return `${h}:${mm}`;
}

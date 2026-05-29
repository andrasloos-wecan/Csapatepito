/* app.jsx — fő alkalmazás: tabok + tweaks */
const {
  useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakColor, TweakToggle,
  DashboardA, DashboardB, CreateA, CreateB, DetailsA, DetailsB, TimelineA, TimelineB,
} = window;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#3b6ea5",
  "font": "hand",
  "sketchy": true,
  "density": "regular",
  "annotations": true
}/*EDITMODE-END*/;

const SCREENS = [
  { id: "dash", label: "Vezérlőpult", A: DashboardA, B: DashboardB },
  { id: "create", label: "Esemény-létrehozás", A: CreateA, B: CreateB },
  { id: "details", label: "Esemény-részletek", A: DetailsA, B: DetailsB },
  { id: "timeline", label: "Esemény-napi timeline", A: TimelineA, B: TimelineB },
];

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [tab, setTab] = React.useState(0);
  const S = SCREENS[tab];

  const rootCls = [
    "wf-root",
    t.sketchy ? "sketchy" : "smooth",
    t.density === "dense" ? "dense" : "",
    t.font === "neutral" ? "font-neutral" : "",
    t.annotations ? "show-annot" : "hide-annot",
  ].join(" ");

  return (
    <div className={rootCls} style={{ "--accent": t.accent }}>
      <div className="page">
        <header className="masthead">
          <span className="kicker">Wireframe felfedezés · v1</span>
          <h1>Csapatépítő szervező</h1>
          <p>Szervezői nézet · 4 képernyő × 2 kreatív UX irány · low-fi vázlat</p>
        </header>

        <nav className="tabs" role="tablist">
          {SCREENS.map((s, i) => (
            <button key={s.id} role="tab" aria-selected={i === tab} className="tab" onClick={() => setTab(i)}>
              <span className="num">{String(i + 1).padStart(2, "0")}</span>{s.label}
            </button>
          ))}
        </nav>

        <div className="screen-intro">
          <h2>{S.label}</h2>
          <span>— két eltérő megközelítés egymás mellett</span>
        </div>

        <div className="variations">
          <S.A />
          <S.B />
        </div>

        <div className="foot">
          Vázlat — a végleges vizuál (tipó, szín, képek) később. Váltogasd a fülekkel a képernyőket; a Tweaks panelen állítható az accent, a font, a vázlatosság és a sűrűség.
        </div>
      </div>

      <TweaksPanel>
        <TweakSection label="Stílus" />
        <TweakColor label="Accent" value={t.accent}
          options={["#3b6ea5", "#3f8e6e", "#c2683f", "#6d5bd0"]}
          onChange={(v) => setTweak("accent", v)} />
        <TweakRadio label="Vonalvezetés" value={t.sketchy ? "sketchy" : "smooth"}
          options={["sketchy", "smooth"]}
          onChange={(v) => setTweak("sketchy", v === "sketchy")} />
        <TweakRadio label="Betűtípus" value={t.font}
          options={["hand", "neutral"]}
          onChange={(v) => setTweak("font", v)} />
        <TweakSection label="Sűrűség & jegyzetek" />
        <TweakRadio label="Sűrűség" value={t.density}
          options={["regular", "dense"]}
          onChange={(v) => setTweak("density", v)} />
        <TweakToggle label="UX-jegyzetek" value={t.annotations}
          onChange={(v) => setTweak("annotations", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

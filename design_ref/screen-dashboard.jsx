/* screen-dashboard.jsx — Vezérlőpult, 2 variáció */
const { Frame, Mk, Bar, Lines, Chip, Btn, Avatar, AvStack, Ph, Meter, Ring, Variant } = window;

function DashboardA() {
  return (
    <Variant
      tag="A" name="Vezérlő-központ" sub="Egy esemény a fókuszban + készenléti pontszám"
      notes={[
        { n: 1, title: "Egyesített készenléti gyűrű.", text: "RSVP, költség és feladatok egyetlen 0–100 pontszámmá olvad — egy pillantás, és tudod, hol tart a szervezés." },
        { n: 2, title: "Teendő-feed javaslatokkal.", text: "A rendszer maga jelzi a kockázatot („6 fő nem válaszolt”) és kínál egy gombot a megoldásra." },
        { n: 3, title: "Vízszintes esemény-szalag.", text: "A közelgő események idővonalon, nem listában — gyors átugrás bármelyikre." },
      ]}
    >
      <Frame title="csapatepito.app / vezérlőpult">
        <div className="row between" style={{ marginBottom: "var(--gap)" }}>
          <div className="col" style={{ gap: 2 }}>
            <span className="label-lg">Szia, Anna</span>
            <span className="muted tiny">1 aktív esemény · 2 vázlat</span>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <Btn sm>Naptár</Btn>
            <Btn sm solid>+ Új esemény</Btn>
          </div>
        </div>

        {/* hero */}
        <div className="box box--fill" style={{ marginBottom: "var(--gap)" }}>
          <div className="row" style={{ alignItems: "flex-start", gap: 20 }}>
            <div className="col" style={{ alignItems: "center", gap: 4 }}>
              <div className="row" style={{ gap: 6 }}><Mk n={1} /><span className="eyebrow">Készenlét</span></div>
              <Ring pct={78} label="indulásra kész" />
            </div>
            <div className="grow col">
              <div className="row between">
                <span className="label-lg">Q3 Csapatnap</span>
                <Chip>júl 18 · péntek</Chip>
              </div>
              <span className="muted tiny">Balaton, kültéri helyszín · egész nap</span>
              <div className="col" style={{ gap: 9, marginTop: 6 }}>
                <div className="col" style={{ gap: 4 }}>
                  <div className="row between tiny"><span className="label">RSVP</span><span className="muted">24 / 30</span></div>
                  <Meter pct={80} />
                </div>
                <div className="col" style={{ gap: 4 }}>
                  <div className="row between tiny"><span className="label">Költségkeret</span><span className="muted">60%</span></div>
                  <Meter pct={60} />
                </div>
                <div className="col" style={{ gap: 4 }}>
                  <div className="row between tiny"><span className="label">Feladatok</span><span className="muted">8 / 12</span></div>
                  <Meter pct={66} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* nudge feed */}
        <div className="box box--accent" style={{ marginBottom: "var(--gap)" }}>
          <div className="row" style={{ gap: 6, marginBottom: 10 }}><Mk n={2} /><span className="eyebrow">Mire figyelj most</span></div>
          <div className="col" style={{ gap: 9 }}>
            <div className="row between">
              <span className="label">6 fő még nem válaszolt a meghívóra</span>
              <Btn sm marker>Emlékeztető</Btn>
            </div>
            <div className="divider"></div>
            <div className="row between">
              <span className="label">A helyszín foglalása még nincs véglegesítve</span>
              <Btn sm>Megnyit</Btn>
            </div>
          </div>
        </div>

        {/* upcoming strip */}
        <div className="row" style={{ gap: 6, marginBottom: 8 }}><Mk n={3} /><span className="eyebrow">Közelgő események</span></div>
        <div className="row row--wrap" style={{ gap: 10 }}>
          {[["aug 02", "Welcome new joiners"], ["szept", "Negyedéves retro"], ["okt", "Halloween est"]].map((e, i) => (
            <div className="box" key={i} style={{ flex: 1, minWidth: 120, padding: 11 }}>
              <span className="eyebrow">{e[0]}</span>
              <div className="label" style={{ marginTop: 4 }}>{e[1]}</div>
              <AvStack names={["B", "K", "+"]} />
            </div>
          ))}
        </div>
      </Frame>
    </Variant>
  );
}

function DashboardB() {
  const cols = [
    { t: "Ötletelés", c: 2, cards: [["Karácsonyi buli", "dec · ~40 fő"], ["Sportnap", "ötlet"]] },
    { t: "Szavazás alatt", c: 1, cards: [["Q3 Csapatnap", "időpont-szavazás", true]] },
    { t: "Véglegesítve", c: 1, cards: [["Welcome lunch", "aug 02 · kész"]] },
    { t: "Lezajlott", c: 2, cards: [["Tavaszi túra", "★ 4.6"], ["Főzőkurzus", "★ 4.9"]] },
  ];
  return (
    <Variant
      tag="B" name="Esemény-pipeline" sub="Kanban az életciklus szerint, dátum helyett"
      notes={[
        { n: 1, title: "AI parancssor felül.", text: "„Szervezz fél napos csapatnapot 20 főnek” → kész vázlat egy kártyaként az Ötletelés oszlopban." },
        { n: 2, title: "Életciklus-oszlopok.", text: "Az események állapot szerint rendeződnek (ötlet → szavazás → kész → lezajlott), nem időrendben — látszik, mi akad el." },
        { n: 3, title: "Húzd-át a státuszhoz.", text: "Egy kártya áthúzásával lép tovább az esemény; a szervezés vizuális, mint egy feladat-tábla." },
      ]}
    >
      <Frame title="csapatepito.app / pipeline">
        {/* AI command bar */}
        <div className="box box--accent row" style={{ gap: 10, marginBottom: "var(--gap)" }}>
          <Mk n={1} />
          <div className="grow box box--ghost" style={{ padding: "8px 12px" }}>
            <span className="muted">„Szervezz fél napos csapatnapot ~20 főnek, kültéren…”</span>
          </div>
          <Btn solid>Javaslat</Btn>
        </div>

        <div className="kanban">
          {cols.map((col, i) => (
            <div className="kcol" key={i}>
              <h4>{col.t} <span>{col.c}</span></h4>
              {col.cards.map((cd, j) => (
                <div className="kcard" key={j}>
                  {cd[2] ? <div className="row" style={{ gap: 5, marginBottom: 4 }}><Mk n={3} /><span className="eyebrow">húzd át →</span></div> : null}
                  <div className="label" style={{ fontSize: 15 }}>{cd[0]}</div>
                  <span className="muted tiny">{cd[1]}</span>
                  <div style={{ marginTop: 7 }}><AvStack names={["A", "B"]} extra="+" /></div>
                </div>
              ))}
              {col.cards.length === 0 ? <div className="box--ghost box" style={{ textAlign: "center" }}><span className="muted tiny">húzz ide</span></div> : null}
            </div>
          ))}
        </div>
        <div className="row" style={{ gap: 6, marginTop: 12 }}><Mk n={2} /><span className="muted tiny">Az oszlopok az esemény életciklusát követik, nem a naptárt.</span></div>
      </Frame>
    </Variant>
  );
}

Object.assign(window, { DashboardA, DashboardB });

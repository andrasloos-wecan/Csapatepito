/* screen-timeline.jsx — Esemény-napi menetrend, 2 variáció */
const { Frame, Mk, Bar, Lines, Chip, Btn, Avatar, AvStack, Ph, Meter, Ring, Variant } = window;

function TimelineA() {
  const items = [
    { t: "09:00", title: "Érkezés, reggeli", who: "A", checks: [true, true], done: true },
    { t: "10:30", title: "Csapat-túraverseny", who: "B", checks: [true, false], now: true },
    { t: "13:00", title: "Közös ebéd", who: "K", checks: [false, false] },
    { t: "14:30", title: "Workshop — visszajelzés", who: "M", checks: [false, false] },
    { t: "16:30", title: "Záró koccintás", who: "A", checks: [false, false] },
  ];
  return (
    <Variant
      tag="A" name="Élő menetrend-sín" sub="Függőleges idővonal „MOST” jelzővel"
      notes={[
        { n: 1, title: "Élő „MOST” vonal.", text: "Az aktuális programpont kiemelve, a sín automatikusan lép tovább — a szervező egy pillantásból tudja, hol tart a nap." },
        { n: 2, title: "Felelős + checklist pontonként.", text: "Minden blokkhoz tartozik egy felelős avatar és pár pipálható teendő (pl. „mikrofon bekapcs”)." },
        { n: 3, title: "Prezentáló mód.", text: "Egy gomb teljes képernyős, kivetíthető nézetet ad az aktuális és következő pontról — a csapatnak is mutatható." },
      ]}
    >
      <Frame title="csapatepito.app / Q3-csapatnap / menetrend">
        <div className="row between" style={{ marginBottom: "var(--gap)" }}>
          <div className="col" style={{ gap: 2 }}>
            <span className="label-lg">Mai menetrend</span>
            <span className="muted tiny">júl 18 · 5 programpont</span>
          </div>
          <div className="row" style={{ gap: 6 }}><Mk n={3} /><Btn sm solid>▶ Prezentáló mód</Btn></div>
        </div>

        <div className="rail">
          {items.map((it, i) => (
            <React.Fragment key={i}>
              {it.now ? (
                <div className="nowline">
                  <span className="tagnow">MOST · 11:05</span><span className="dash"></span>
                  <Mk n={1} />
                </div>
              ) : null}
              <div className={"railitem" + (it.now ? " now" : "")}>
                <div className={"box" + (it.now ? " box--accent" : it.done ? "" : " box--ghost")} style={{ padding: 11, opacity: it.done ? .6 : 1 }}>
                  <div className="row between">
                    <div className="row" style={{ gap: 9 }}>
                      <Chip ghost>{it.t}</Chip>
                      <span className="label">{it.title}</span>
                    </div>
                    <div className="row" style={{ gap: 7 }}>
                      {i === 0 ? <Mk n={2} /> : null}
                      <Avatar sm>{it.who}</Avatar>
                    </div>
                  </div>
                  {it.now || i === 0 ? (
                    <div className="col" style={{ gap: 4, marginTop: 9 }}>
                      <div className="row" style={{ gap: 7 }}><span className="chip chip--ghost" style={{ padding: "0 6px" }}>{it.checks[0] ? "✓" : "○"}</span><span className="tiny muted">eszközök kiosztva</span></div>
                      <div className="row" style={{ gap: 7 }}><span className="chip chip--ghost" style={{ padding: "0 6px" }}>{it.checks[1] ? "✓" : "○"}</span><span className="tiny muted">csapatok kihirdetve</span></div>
                    </div>
                  ) : null}
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </Frame>
    </Variant>
  );
}

function TimelineB() {
  // grid columns 2..9 == 09:00 .. 16:00
  const lanes = [
    { name: "Fő helyszín", cls: "", blocks: [["Megnyitó", 1, 1], ["Túraverseny", 2, 3], ["Záró", 7, 2]] },
    { name: "Terem B", cls: "alt", blocks: [["Workshop A", 2, 2], ["Workshop B", 5, 2]] },
    { name: "Catering", cls: "cat", blocks: [["Reggeli", 1, 1], ["Ebéd", 4, 2], ["Snack", 7, 1]] },
  ];
  return (
    <Variant
      tag="B" name="Párhuzamos sávok" sub="Vízszintes idő-tengely, helyszínenként sávok"
      notes={[
        { n: 1, title: "Párhuzamos sávok.", text: "Több helyszín / terem egyszerre látszik — a szervező azonnal észreveszi az átfedéseket és üresjáratokat." },
        { n: 2, title: "Ütközés-jelzés.", text: "Ha két blokk ugyanazt az erőforrást (terem, felelős) kéri egyszerre, a nézet figyelmeztet." },
        { n: 3, title: "Élő-szavazás indító dokk.", text: "Alul egy gombbal kvíz vagy hangulat-szavazás indítható a résztvevők telefonjára menet közben." },
      ]}
    >
      <Frame title="csapatepito.app / Q3-csapatnap / sávok">
        <div className="row between" style={{ marginBottom: 12 }}>
          <span className="label-lg">Párhuzamos menetrend</span>
          <div className="row" style={{ gap: 6 }}><Mk n={2} /><Chip ghost>1 átfedés</Chip></div>
        </div>

        <div className="laneaxis" style={{ marginBottom: 6 }}>
          <span></span>
          {["09", "10", "11", "12", "13", "14", "15", "16"].map((h) => <span key={h}>{h}</span>)}
        </div>

        <div className="lanes">
          {lanes.map((ln, i) => (
            <div className="lane" key={i}>
              <div className="lane__name">{ln.name}</div>
              <div className="lane__track">
                {ln.blocks.map((b, j) => (
                  <div className={"lblock " + ln.cls} key={j} style={{ gridColumn: `${b[1]} / span ${b[2]}` }}>{b[0]}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="row" style={{ gap: 6, marginTop: 8 }}><Mk n={1} /><span className="muted tiny">A sávok egymás alatt → a párhuzamos programok egy nézetben.</span></div>

        {/* live poll dock */}
        <div className="box box--accent row between" style={{ marginTop: "var(--gap)" }}>
          <div className="row" style={{ gap: 9 }}>
            <Mk n={3} />
            <div className="col" style={{ gap: 1 }}>
              <span className="label">Élő interakció</span>
              <span className="muted tiny">kvíz · hangulat-szavazás · kérdezz-felelek</span>
            </div>
          </div>
          <div className="row" style={{ gap: 8 }}><Btn sm marker>Kvíz</Btn><Btn sm solid>Szavazás indítása</Btn></div>
        </div>
      </Frame>
    </Variant>
  );
}

Object.assign(window, { TimelineA, TimelineB });

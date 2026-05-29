/* screen-create.jsx — Esemény-létrehozás, 2 variáció */
const { Frame, Mk, Bar, Lines, Chip, Btn, Avatar, AvStack, Ph, Meter, Ring, Variant } = window;

function CreateA() {
  return (
    <Variant
      tag="A" name="Beszélgető AI-varázsló" sub="Egy mondatból kész terv"
      notes={[
        { n: 1, title: "Egy mondat → teljes terv.", text: "Szabad szöveg (létszám, vibe, keret) alapján az AI kitölti az egész eseményt — nincs üres űrlap." },
        { n: 2, title: "Szerkeszthető javaslat.", text: "A generált tervet kártyánként finomítod: aktivitás-csere, dátum-opciók, becsült költség egy helyen." },
        { n: 3, title: "Rákérdez a hiányzóra.", text: "Az asszisztens csak azt kérdezi meg, ami tényleg hiányzik (pl. allergia), chat-szerűen." },
      ]}
    >
      <Frame title="csapatepito.app / új esemény">
        <div className="col" style={{ alignItems: "center", gap: 4, marginBottom: "var(--gap)" }}>
          <span className="label-lg">Mit szerveznél?</span>
          <span className="muted tiny">Írd le egy mondatban — a többit elintézzük</span>
        </div>

        {/* free text */}
        <div className="box box--accent" style={{ marginBottom: 6 }}>
          <div className="row" style={{ gap: 6, marginBottom: 8 }}><Mk n={1} /><span className="eyebrow">Egy mondatos brief</span></div>
          <div className="box box--ghost" style={{ minHeight: 56, padding: 12 }}>
            <span className="muted">„12 fős fejlesztő csapat, fél nap, kültér, kb. 50e Ft/fő, csapatkohézió a cél…”</span>
          </div>
          <div className="row between" style={{ marginTop: 10 }}>
            <div className="row" style={{ gap: 6 }}><Chip ghost>hangfelvétel</Chip><Chip ghost>sablonból</Chip></div>
            <Btn solid>✦ Terv generálása</Btn>
          </div>
        </div>

        <div className="col" style={{ alignItems: "center", margin: "8px 0" }}><span className="muted tiny">▽ az AI javaslata</span></div>

        {/* generated plan */}
        <div className="box" style={{ marginBottom: "var(--gap)" }}>
          <div className="row" style={{ gap: 6, marginBottom: 10 }}><Mk n={2} /><span className="label">Javasolt program — „Aktív fél nap a Normafán”</span></div>
          <div className="row row--wrap" style={{ gap: 8, marginBottom: 12 }}>
            <Chip on>Csapat-túraverseny</Chip><Chip>Közös bográcsozás</Chip><Chip ghost>+ csere</Chip>
          </div>
          <div className="row" style={{ gap: 12, alignItems: "stretch" }}>
            <div className="box box--fill grow" style={{ padding: 11 }}>
              <span className="eyebrow">Időpont-opciók</span>
              <div className="col" style={{ gap: 6, marginTop: 6 }}>
                <Chip>júl 18 · ✓ mind ráér</Chip><Chip>júl 25</Chip>
              </div>
            </div>
            <div className="box box--fill grow" style={{ padding: 11 }}>
              <span className="eyebrow">Becsült költség</span>
              <div className="label-lg" style={{ marginTop: 6 }}>~ 580e Ft</div>
              <span className="muted tiny">≈ 48e Ft / fő</span>
            </div>
          </div>
          <div className="row" style={{ gap: 8, marginTop: 12 }}>
            <Btn solid>Elfogadom</Btn><Btn>Módosítom</Btn>
          </div>
        </div>

        {/* follow-up question */}
        <div className="box box--ghost row" style={{ gap: 9 }}>
          <Mk n={3} />
          <div className="grow"><span className="label">Van bárkinek ételallergiája, amit jelezzek a cateringnek?</span></div>
          <Btn sm>Válasz</Btn>
        </div>
      </Frame>
    </Variant>
  );
}

function CreateB() {
  const steps = [
    { t: "Alapok", s: "done" },
    { t: "Időpont", s: "active" },
    { t: "Aktivitás", s: "" },
    { t: "Meghívók", s: "" },
  ];
  return (
    <Variant
      tag="B" name="Lépésenkénti varázsló + élő előnézet" sub="Strukturált űrlap, jobbra a kész kártya"
      notes={[
        { n: 1, title: "Élő esemény-előnézet.", text: "Ahogy töltöd az űrlapot, jobbra valós időben épül a meghívó-kártya — látod, mit kapnak a résztvevők." },
        { n: 2, title: "Mezőnkénti „AI javasol”.", text: "Minden mező mellett egy gomb: dátumot, aktivitást, helyszínt kérhetsz az AI-tól anélkül, hogy elhagynád az űrlapot." },
        { n: 3, title: "Áttekinthető lépés-sáv.", text: "A bal oldali stepper mutatja a haladást és engedi a szabad ugrálást a kész lépések közt." },
      ]}
    >
      <Frame title="csapatepito.app / új esemény — varázsló">
        <div className="row" style={{ gap: 14, alignItems: "stretch" }}>
          {/* steps */}
          <div style={{ width: 120, flex: "none" }}>
            <div className="row" style={{ gap: 5, marginBottom: 8 }}><Mk n={3} /><span className="eyebrow">Lépések</span></div>
            <div className="steps">
              {steps.map((st, i) => (
                <div className={"step " + st.s} key={i}>
                  <span className="sdot">{st.s === "done" ? "✓" : i + 1}</span>{st.t}
                </div>
              ))}
            </div>
          </div>

          {/* form for current step */}
          <div className="grow col">
            <span className="label-lg">Időpont kiválasztása</span>
            <div className="col" style={{ gap: 5 }}>
              <span className="label tiny">Javasolt dátumok</span>
              <div className="row between">
                <div className="box box--ghost grow" style={{ padding: "8px 12px" }}><span className="muted">júl 18 – júl 25 között…</span></div>
                <div className="row" style={{ gap: 5, marginLeft: 8 }}><Mk n={2} /><Btn sm marker>✦ AI javasol</Btn></div>
              </div>
            </div>
            <div className="col" style={{ gap: 5 }}>
              <span className="label tiny">Időpont-szavazás a csapatnak?</span>
              <div className="row" style={{ gap: 8 }}><Chip on>Igen, szavazzanak</Chip><Chip ghost>Én döntök</Chip></div>
            </div>
            <div className="col" style={{ gap: 5 }}>
              <span className="label tiny">Időtartam</span>
              <div className="row" style={{ gap: 8 }}><Chip>2 óra</Chip><Chip on>Fél nap</Chip><Chip>Egész nap</Chip></div>
            </div>
            <div className="row between" style={{ marginTop: 6 }}>
              <Btn>← Vissza</Btn><Btn solid>Tovább →</Btn>
            </div>
          </div>

          {/* live preview */}
          <div style={{ width: 168, flex: "none" }}>
            <div className="row" style={{ gap: 5, marginBottom: 8 }}><Mk n={1} /><span className="eyebrow">Élő előnézet</span></div>
            <div className="box" style={{ padding: 11 }}>
              <Ph h={56} label="borító" />
              <div className="label" style={{ marginTop: 8 }}>Q3 Csapatnap</div>
              <Chip>júl 18 · péntek</Chip>
              <div className="divider"></div>
              <Lines rows={2} last="70%" />
              <div style={{ marginTop: 8 }}><AvStack names={["A", "B", "K"]} extra="+" /></div>
              <Btn sm solid>RSVP</Btn>
            </div>
          </div>
        </div>
      </Frame>
    </Variant>
  );
}

Object.assign(window, { CreateA, CreateB });

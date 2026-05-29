/* screen-details.jsx — Esemény-részletek, 2 variáció */
const { Frame, Mk, Bar, Lines, Chip, Btn, Avatar, AvStack, Ph, Meter, Ring, Variant } = window;

function DetailsA() {
  return (
    <Variant
      tag="A" name="Hub fülekkel" sub="Áttekintő fejléc + szekció-fülek + gyors-műveletek"
      notes={[
        { n: 1, title: "Gyors-művelet sáv.", text: "Megosztás, emlékeztető, szerkesztés mindig kéznél a fejlécben — a szervező leggyakoribb műveletei egy kattintásra." },
        { n: 2, title: "Szekció-fülek.", text: "Áttekintés / Résztvevők / Program / Költség — a sűrű esemény-adat fülekre bontva, nem végtelen görgetés." },
        { n: 3, title: "Készenléti státusz-sáv.", text: "A fejlécben azonnal látszik, mi van kész és mi hiányzik még az eseményhez." },
      ]}
    >
      <Frame title="csapatepito.app / esemény / Q3-csapatnap">
        {/* hero */}
        <div className="row between" style={{ marginBottom: 10 }}>
          <div className="col" style={{ gap: 3 }}>
            <span className="eyebrow">júl 18 · péntek · egész nap</span>
            <span className="label-lg" style={{ fontSize: 30 }}>Q3 Csapatnap</span>
            <span className="muted tiny">Balaton, kültéri helyszín</span>
          </div>
          <div className="col" style={{ alignItems: "flex-end", gap: 8 }}>
            <div className="row" style={{ gap: 6 }}>
              <Mk n={1} /><Btn sm>Megosztás</Btn><Btn sm>Emlékeztető</Btn><Btn sm solid>Szerkesztés</Btn>
            </div>
            <div className="row" style={{ gap: 6 }}><Mk n={3} /><Chip on>78% kész</Chip></div>
          </div>
        </div>

        {/* tabs */}
        <div className="row" style={{ gap: 8, marginBottom: 12, borderBottom: "2px dashed var(--line)", paddingBottom: 8 }}>
          <Mk n={2} /><Chip on>Áttekintés</Chip><Chip>Résztvevők</Chip><Chip>Program</Chip><Chip>Költség</Chip>
        </div>

        {/* overview grid */}
        <div className="row" style={{ gap: 12, alignItems: "stretch", marginBottom: 12 }}>
          <div className="box grow" style={{ padding: 0, overflow: "hidden" }}>
            <Ph h={120} label="térkép — helyszín" />
          </div>
          <div className="box box--fill" style={{ width: 150, flex: "none" }}>
            <span className="eyebrow">Résztvevők</span>
            <div className="label-lg" style={{ margin: "6px 0" }}>24 / 30</div>
            <AvStack names={["A", "B", "K", "M"]} extra="+20" />
            <div className="divider"></div>
            <Lines rows={2} last="50%" />
          </div>
        </div>
        <div className="row" style={{ gap: 12, alignItems: "stretch" }}>
          <div className="box box--fill grow">
            <span className="eyebrow">Program — kivonat</span>
            <div className="col" style={{ gap: 5, marginTop: 7 }}>
              <div className="row" style={{ gap: 8 }}><Chip ghost>09:00</Chip><span className="label">Érkezés, reggeli</span></div>
              <div className="row" style={{ gap: 8 }}><Chip ghost>10:30</Chip><span className="label">Csapat-túraverseny</span></div>
              <div className="row" style={{ gap: 8 }}><Chip ghost>13:00</Chip><span className="label">Közös ebéd</span></div>
            </div>
          </div>
          <div className="box box--fill" style={{ width: 150, flex: "none" }}>
            <span className="eyebrow">Költségkeret</span>
            <div className="label-lg" style={{ margin: "6px 0" }}>60%</div>
            <Meter pct={60} />
            <span className="muted tiny">348e / 580e Ft</span>
          </div>
        </div>
      </Frame>
    </Variant>
  );
}

function DetailsB() {
  return (
    <Variant
      tag="B" name="Görgethető „sztori” + jegyzetek" sub="Ragadós oldal-nav, modul-blokkok, beszúrt komment"
      notes={[
        { n: 1, title: "Blokkhoz tűzött kommentek.", text: "A csapat közvetlenül egy szekcióhoz fűz megjegyzést („van parkoló?”) — a vita ott marad, ahol releváns." },
        { n: 2, title: "Ragadós szekció-nav.", text: "Bal oldalon végig látszik, hol jársz; egy kattintással bárhová ugorhatsz a hosszú oldalon." },
        { n: 3, title: "Moduláris blokkok.", text: "Minden téma egy önálló, átrendezhető blokk — a szervező a fontosat felülre húzhatja." },
      ]}
    >
      <Frame title="csapatepito.app / esemény / Q3-csapatnap">
        <div className="story">
          {/* sticky nav */}
          <div className="snav">
            <div className="row" style={{ gap: 5, marginBottom: 4 }}><Mk n={2} /><span className="eyebrow">Ugrás</span></div>
            <a className="on">Helyszín</a>
            <a>Program</a>
            <a>Csapat</a>
            <a>Költség</a>
            <a>Fotók</a>
          </div>

          {/* scroll blocks */}
          <div className="col" style={{ gap: 12 }}>
            <div className="box">
              <div className="row between" style={{ marginBottom: 8 }}>
                <span className="label-lg">Helyszín</span>
                <div className="row" style={{ gap: 6 }}><Mk n={3} /><Chip ghost>blokk ↕</Chip></div>
              </div>
              <Ph h={92} label="térkép — Balaton" />
              <div className="row" style={{ gap: 6, marginTop: 10 }}>
                <Mk n={1} />
                <span className="comment"><Avatar sm>B</Avatar> @Béla: van a helyszínen parkoló 8 autónak?</span>
              </div>
            </div>

            <div className="box box--fill">
              <span className="label-lg">Program</span>
              <div className="col" style={{ gap: 6, marginTop: 8 }}>
                <div className="row" style={{ gap: 8 }}><Chip ghost>09:00</Chip><span className="label">Érkezés</span></div>
                <div className="row" style={{ gap: 8 }}><Chip ghost>10:30</Chip><span className="label">Csapat-túraverseny</span></div>
                <div className="row" style={{ gap: 8 }}><Chip ghost>13:00</Chip><span className="label">Közös ebéd</span></div>
              </div>
            </div>

            <div className="box box--fill">
              <span className="label-lg">Csapat</span>
              <div className="row between" style={{ marginTop: 8 }}>
                <AvStack names={["A", "B", "K", "M", "D"]} extra="+19" />
                <Chip on>24 / 30 megerősítve</Chip>
              </div>
            </div>
          </div>
        </div>
      </Frame>
    </Variant>
  );
}

Object.assign(window, { DetailsA, DetailsB });

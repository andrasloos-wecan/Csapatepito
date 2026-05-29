import "dotenv/config";
import { prisma } from "./db.js";

/**
 * Magyar nyelvű aktivitás-könyvtár — 32 darab, kategóriánként arányos.
 * organizationId = null => globális (minden cég látja).
 */
const ACTIVITIES = [
  // ===== JÉGTÖRŐ =====
  {
    name: "Két igazság, egy hazugság",
    category: "JEGTORO",
    minSize: 4, maxSize: 30, durationMin: 15, indoor: true, outdoor: true,
    energyLevel: "ALACSONY", imageEmoji: "🎭",
    description: "Klasszikus bemutatkozó játék — mindenki három állítást mond magáról, a többiek tippelnek, melyik a hazugság.",
    materials: "Nincs külön eszköz",
    steps: [
      "Körben vagy körkörösen helyezkednek el a résztvevők.",
      "Mindenki előre kitalál három állítást magáról — kettő igaz, egy hazugság.",
      "Sorra elmondja a háromat, a többiek megszavazzák, melyik a hazugság.",
      "A mondó felfedi a megoldást — rövid magyarázattal.",
    ],
    tips: "Új csapatoknál jól oldja a feszültséget. Bátorítsd a meglepő igazságokat.",
    variations: "Csapatok között: minden csapat egy közös tagjának ír 3-at, és a másik csapatok tippelnek.",
  },
  {
    name: "Emberi bingó",
    category: "JEGTORO",
    minSize: 8, maxSize: 50, durationMin: 20, indoor: true,
    energyLevel: "KOZEPES", imageEmoji: "📋",
    description: "Bingó-lap apró tényekkel (pl. „beszél spanyolul”, „volt már Ázsiában”). A résztvevők kérdezgetve gyűjtik az aláírásokat.",
    materials: "Bingó-lapok (5×5), tollak",
    steps: [
      "Minden résztvevő kap egy bingó-lapot 25 állítással.",
      "Szabadon járkálva kérdéseket tesznek fel egymásnak.",
      "Akire igaz egy állítás, aláírja az adott cellát — egy emberre 1 cella.",
      "Az első, akinek sora vagy oszlopa megtelik, kiabálja: BINGÓ.",
    ],
    tips: "Az állítások készülhetnek HR-rel együtt, hogy a csapatra szabottak legyenek.",
    variations: "Online verzió: Miro vagy Google Sheets táblával.",
  },
  {
    name: "Szuperhős ön-portré",
    category: "JEGTORO",
    minSize: 6, maxSize: 25, durationMin: 25, indoor: true,
    energyLevel: "ALACSONY", imageEmoji: "🦸",
    description: "Mindenki rajzol magáról egy szuperhős verziót, megnevezi a szuperképességét és gyengeségét.",
    materials: "A4 lapok, színes filcek",
    steps: [
      "Kiosztod a lapokat és a filceket.",
      "10 perc rajzolás: szuperhős-jelmez, szuperképesség, gyengeség.",
      "Kis csoportokban (3-4 fő) bemutatják a karaktereket.",
      "Plenáris záróban mindenki 1 mondatban összefoglalja.",
    ],
    tips: "A gyengeségről beszélni emberközelibb — érdemes bátorítani.",
    variations: "",
  },

  // ===== KOMMUNIKÁCIÓ =====
  {
    name: "Vakvezetés (akadálypálya)",
    category: "KOMMUNIKACIO",
    minSize: 6, maxSize: 24, durationMin: 40, indoor: true, outdoor: true,
    energyLevel: "KOZEPES", imageEmoji: "🕶️",
    description: "Párokban: egyik bekötött szemmel halad, a másik csak szóban irányítja az akadálypályán.",
    materials: "Kendők, akadályok (székek, kúpok, dobozok)",
    steps: [
      "Felállítunk egy egyszerű akadálypályát.",
      "Mindenki párba áll. Egyik bekötött szem, másik a verbalizáló navigátor.",
      "Cél: a végpontig akadály-érintés nélkül.",
      "Csere — utána debrief: mi segített, mi zavart a kommunikációban.",
    ],
    tips: "A kulcs a debrief — kis csapatokban beszéltesd át, ki mit tanult.",
    variations: "Több pár egyszerre, csak gesztusokkal navigálva.",
  },
  {
    name: "Néma sor",
    category: "KOMMUNIKACIO",
    minSize: 8, maxSize: 40, durationMin: 15, indoor: true, outdoor: true,
    energyLevel: "KOZEPES", imageEmoji: "🤫",
    description: "A csapatnak hang nélkül kell sorba állnia egy paraméter szerint (pl. születésnap, cipőméret, vállalati évek).",
    materials: "Nincs",
    steps: [
      "A facilitátor megadja a rendezési szabályt.",
      "Beszélni és írni tilos — csak gesztusok.",
      "Amikor a csapat azt hiszi, kész, megáll.",
      "Ellenőrzés és debrief.",
    ],
    tips: "Több körben más-más paraméter (magasság, kedvenc szín kódja stb.).",
    variations: "",
  },
  {
    name: "Origami távolból",
    category: "KOMMUNIKACIO",
    minSize: 4, maxSize: 30, durationMin: 25, indoor: true,
    energyLevel: "ALACSONY", imageEmoji: "📄",
    description: "Egy résztvevő egy összetett origamit visszafelé bont, és csak szavakkal írja le a többieknek, akik követni próbálják.",
    materials: "Egy minta origami, papírok",
    steps: [
      "Egy önkéntes előáll egy kész origamival.",
      "Háttal állva (vagy paraván mögött) szavakkal magyarázza a hajtásokat.",
      "A többiek megpróbálják követni — kérdezni nem lehet (vagy 3 kérdés).",
      "Vége: összehasonlítjuk az eredményeket. Debrief.",
    ],
    tips: "Először kérdés nélkül; másodjára kérdezhetnek — látványos különbség.",
    variations: "",
  },

  // ===== BIZALOM =====
  {
    name: "Hátradőlés bizalmi körben",
    category: "BIZALOM",
    minSize: 6, maxSize: 14, durationMin: 20, indoor: true, outdoor: true,
    energyLevel: "ALACSONY", imageEmoji: "🤝",
    description: "Egy résztvevő a kör közepén, csukott szemmel dől hátra; a többiek finoman visszanyomják.",
    materials: "Nincs (sík talaj)",
    steps: [
      "Szoros, kis kör 6-8 fős csoporttal.",
      "Egy önkéntes a közepén csukott szemmel, kezét keresztben mellkasán.",
      "Lágyan dől hátra, a kör tagjai finoman visszanyomják.",
      "Mindenki sorra kerül — utána rövid debrief.",
    ],
    tips: "Csak akkor, ha mindenki önkéntes alapon vesz részt. Bizalmi környezet kell.",
    variations: "Földre ereszkedés erősebb csoportoknál — fokozott figyelemmel.",
  },
  {
    name: "Minefield",
    category: "BIZALOM",
    minSize: 8, maxSize: 24, durationMin: 35, indoor: true, outdoor: true,
    energyLevel: "KOZEPES", imageEmoji: "💣",
    description: "Tárgyakkal teleszórt „akna-mező”. Az egyik játékos bekötött szemmel megy át, csak párja verbális utasításai alapján.",
    materials: "Kis tárgyak (kúpok, kockák, labdák), kendő",
    steps: [
      "Kijelölsz egy 4×4 m-es területet.",
      "Tárgyakat dobsz/raksz le rendetlenül („aknák”).",
      "Egy önkéntes belép a területre bekötött szemmel.",
      "Párja a vonalon kívülről verbálisan vezeti át — érintés nélkül.",
    ],
    tips: "Több pár egyszerre, hangzavar nehezíti — ez a tanulság.",
    variations: "",
  },

  // ===== PROBLÉMAMEGOLDÓ =====
  {
    name: "Marshmallow-torony",
    category: "PROBLEMA",
    minSize: 8, maxSize: 30, durationMin: 30, indoor: true,
    energyLevel: "KOZEPES", imageEmoji: "🍡",
    description: "Csapatok 18 perc alatt minél magasabb, önállóan álló tornyot építenek spagettiből, ragasztószalagból és egy marshmallow-ból.",
    materials: "20 szál spagetti, 1 m ragasztószalag, 1 m zsineg, 1 marshmallow / csapat",
    steps: [
      "4-5 fős csapatok, mindegyik megkapja a készletet.",
      "Cél: egy önálló torony, a tetején a teljes marshmallow.",
      "Időkeret: 18 perc.",
      "Mérés cm-ben, debrief — prototyping, gyors iteráció tanulság.",
    ],
    tips: "Pre-event: tanulságok már a Tom Wujec TED Talk-ban.",
    variations: "Csak papírból, gemkapcsokkal.",
  },
  {
    name: "Tojás-ejtés",
    category: "PROBLEMA",
    minSize: 6, maxSize: 30, durationMin: 45, indoor: true, outdoor: true,
    energyLevel: "MAGAS", imageEmoji: "🥚",
    description: "Csapatok védőszerkezetet építenek, hogy egy tojás magasból sértetlenül essen le.",
    materials: "Tojások, hullámpapír, szívószál, ragasztószalag, fólia, gumi, papír",
    steps: [
      "Csapatok kapnak építőkészletet és 1 tojást.",
      "20 perc tervezés-építés.",
      "Egy emelet magasról (kb. 3 m) dobjuk le egyszerre az alkotásokat.",
      "Sértetlen tojás = győzelem. Debrief: tervezés vs improvizáció.",
    ],
    tips: "Lecsendesedés és design phase fontos — érdemes első 5 percre tilos építeni.",
    variations: "",
  },
  {
    name: "Escape room mini",
    category: "PROBLEMA",
    minSize: 4, maxSize: 16, durationMin: 60, indoor: true,
    energyLevel: "KOZEPES", imageEmoji: "🔐",
    description: "Saját kialakítású, 4-6 fejtörős mini-szabadulószoba (lakat, kódok, képek, üzenetek).",
    materials: "Lakatok, kódzárak, borítékok, képek, rejtvények",
    steps: [
      "Előkészítés (előtte 1-2 óra): fejtörők egymásra építve.",
      "Csapatok egy szobába zárva, időkorlát 45 perc.",
      "Cél: a végső kód megfejtése.",
      "Debrief: csapatdinamika, ki vezetett, hogyan oszlott el a feladat.",
    ],
    tips: "Ha nincs idő tervezésre: bérelt escape room.",
    variations: "Online: Genially-vel.",
  },

  // ===== KREATÍV =====
  {
    name: "Csapat-pingo",
    category: "KREATIV",
    minSize: 6, maxSize: 30, durationMin: 30, indoor: true,
    energyLevel: "KOZEPES", imageEmoji: "🎨",
    description: "Csapatok pingo-rajzot készítenek pár perc alatt egy adott szóra — egymás után rajzolva, beszéd nélkül.",
    materials: "Nagy papírlapok, filcek",
    steps: [
      "Csapatok megkapnak egy témát (pl. „cég jövője”).",
      "Sorban 30 másodpercig mindenki hozzátesz egy elemet a rajzhoz, szó nélkül.",
      "5-7 kör után kész a mű.",
      "Plenárisan minden csapat bemutatja és értelmezi.",
    ],
    tips: "Nincs jó vagy rossz — a folyamat a fontos.",
    variations: "Témaválasztás megosztott rendszerre, célokra.",
  },
  {
    name: "Cégtörténet képregényben",
    category: "KREATIV",
    minSize: 8, maxSize: 30, durationMin: 45, indoor: true,
    energyLevel: "ALACSONY", imageEmoji: "📚",
    description: "Csapatok 6-paneles képregényben elmesélik a cég vagy a csapat „eredettörténetét”.",
    materials: "A3-as lapok 6 keretes táblákkal, filcek",
    steps: [
      "Csapatok 4-5 főben dolgoznak.",
      "Brainstorm a fontosabb állomásokról (10 perc).",
      "Rajzolás + szövegezés (25 perc).",
      "Galéria bemutatás — mindenki járja végig a többi csapat művét.",
    ],
    tips: "Nem a művészi minőség számít, hanem az emlékek és narratíva.",
    variations: "",
  },
  {
    name: "Üzenet 10 év múlvának",
    category: "KREATIV",
    minSize: 4, maxSize: 50, durationMin: 25, indoor: true, outdoor: true,
    energyLevel: "ALACSONY", imageEmoji: "✉️",
    description: "Mindenki ír egy levelet saját magának 10 év múlvára — a célokról, értékekről, a csapatról. Borítékban marad, később postázzuk.",
    materials: "Papírok, tollak, borítékok, bélyegek (vagy digitális tároló)",
    steps: [
      "Csendes 15 perces írás-időt biztosítunk halk zenével.",
      "A levél tartalma magánügy — nem kell megosztani.",
      "Borítékba zárás, lepecsételés.",
      "A szervező összegyűjti, 10 év múlva postázza.",
    ],
    tips: "FutureMe.org online verzió is jó.",
    variations: "1 év múlva — sokkal kézzelfoghatóbb.",
  },

  // ===== FIZIKAI =====
  {
    name: "Csapat-túraverseny",
    category: "FIZIKAI",
    minSize: 8, maxSize: 60, durationMin: 180, outdoor: true, indoor: false,
    energyLevel: "MAGAS", imageEmoji: "🥾",
    description: "Csapatok GPS-koordinátákkal vagy térképpel egy útvonalat járnak be, miközben feladatokat oldanak meg az állomásokon.",
    materials: "Térkép vagy GPS app, feladatlapok, állomásfeladatok eszközei",
    steps: [
      "Útvonal- és állomás-tervezés előre.",
      "Csapatok 4-6 fő, eltérő indulási idővel.",
      "Minden állomáson kis feladat: kvíz, ügyességi, csapat-fotó.",
      "Cél: a leggyorsabb teljes idő + legtöbb pont.",
    ],
    tips: "Időjárás-tartalék fontos. Vész-kontakt mindenkinél.",
    variations: "Kerékpáros vagy autós verzió hosszabb távra.",
  },
  {
    name: "Akrobata-építés",
    category: "FIZIKAI",
    minSize: 6, maxSize: 18, durationMin: 30, indoor: true, outdoor: true,
    energyLevel: "MAGAS", imageEmoji: "🤸",
    description: "Csapatok 3 fős „emberi piramist” vagy közös pózt építenek — biztonságos verziókban.",
    materials: "Puha aljzat (szőnyeg) ajánlott",
    steps: [
      "Bemelegítés 5 perc.",
      "Csapatok kapnak 3-4 fókusz-elemet (pl. szív, csillag, híd).",
      "Megpróbálják fizikailag „létrehozni” — fotók készülnek.",
      "Plenáris záró: galéria + szavazás a legjobbra.",
    ],
    tips: "Fizikai biztonság a legfontosabb — opcionális részvétel.",
    variations: "",
  },

  // ===== ONLINE =====
  {
    name: "Online Pictionary",
    category: "ONLINE",
    minSize: 4, maxSize: 20, durationMin: 30, indoor: true,
    energyLevel: "KOZEPES", imageEmoji: "🖌️",
    description: "Skribbl.io vagy hasonló — két csapat egymás ellen rajzol és tippel.",
    materials: "Számítógép, Skribbl.io vagy Drawasaurus",
    steps: [
      "Linket küldünk, mindenki belép.",
      "Csapatok rotáció szerint rajzolnak.",
      "Adott idő alatt a többiek beírják, mi az.",
      "Pontozás automatikusan, debrief után.",
    ],
    tips: "Magyar szótárral játsszátok — sokkal viccesebb.",
    variations: "",
  },
  {
    name: "Virtuális kávészünet",
    category: "ONLINE",
    minSize: 4, maxSize: 40, durationMin: 20, indoor: true,
    energyLevel: "ALACSONY", imageEmoji: "☕",
    description: "Strukturált spontán beszélgetés Wonder.me-n vagy Gather Townban — kis kávészünetnyi időre.",
    materials: "Wonder.me / Gather Town / Meet breakout-roomokkal",
    steps: [
      "Virtuális kávézó-térkép vagy beszélgető-szigetek.",
      "Random rotáció 5-7 percenként.",
      "Beszélgetés-indító kártyák kinn (pl. „kedvenc gyerekkori könyved?”).",
      "Visszatérés plenárisba 5 perc közös zárásra.",
    ],
    tips: "Önkéntes kamera-on — soha ne kötelező.",
    variations: "",
  },
  {
    name: "Geoguessr team",
    category: "ONLINE",
    minSize: 4, maxSize: 16, durationMin: 30, indoor: true,
    energyLevel: "KOZEPES", imageEmoji: "🌍",
    description: "Csapatok Geoguessr-en versenyeznek — Street View képekből tippelik a helyszínt.",
    materials: "Geoguessr csapat-előfizetés",
    steps: [
      "Csapatok 3-4 fő, külön szobákban.",
      "5 forduló random helyszínekkel.",
      "Pontok távolság-alapon.",
      "Plenáris zárás: a legjobb tipp díjazása.",
    ],
    tips: "Magyar-térkép verzió: csak Mo-i lokációk.",
    variations: "",
  },

  // ===== KVÍZ =====
  {
    name: "Cégtörténeti kvíz",
    category: "KVIZ",
    minSize: 8, maxSize: 60, durationMin: 30, indoor: true,
    energyLevel: "ALACSONY", imageEmoji: "🏢",
    description: "Kahoot-szerű kvíz a cégről, a kollégákról, a termékről — előre összeállítva.",
    materials: "Kahoot vagy Mentimeter, projektor",
    steps: [
      "10-15 kérdés előre, vegyes nehézséggel.",
      "Csapatokra osztás 3-5 fő.",
      "5-10 perces kvíz-kör.",
      "Leaderboard, díjazás.",
    ],
    tips: "Kérj kollégáktól „rejtett” tényeket — sokkal viccesebb.",
    variations: "",
  },
  {
    name: "Pub-kvíz",
    category: "KVIZ",
    minSize: 8, maxSize: 50, durationMin: 75, indoor: true,
    energyLevel: "ALACSONY", imageEmoji: "🍻",
    description: "Klasszikus pub-kvíz 4-6 körben: zene, film, sport, általános, kép-felismerés.",
    materials: "Kérdéslapok, válasz-lapok, tollak, projektor a vetített kérdésekhez",
    steps: [
      "Csapatok 4-5 fő, csapatnévvel.",
      "Kérdés-körönként a csapat papírra írja a választ.",
      "Minden kör után pontozás és részeredmény.",
      "Befejezés, díjazás.",
    ],
    tips: "Kiegyensúlyozott témaválasztás — ne csak egy korosztálynak.",
    variations: "Online: SpeedQuizzing.",
  },

  // ===== EXTRA — sokoldalú =====
  {
    name: "Főzőkurzus csapatban",
    category: "KREATIV",
    minSize: 8, maxSize: 24, durationMin: 180, indoor: true,
    energyLevel: "KOZEPES", imageEmoji: "👨‍🍳",
    description: "Csapatok közös menüt készítenek profi séf vezetésével — előétel, főétel, desszert.",
    materials: "Konyha, alapanyagok, séf-koordinátor",
    steps: [
      "Csoportokra osztás (3-4 csapat).",
      "Minden csapat egy fogást kap.",
      "120 perc főzés.",
      "Közös vacsora 30 perc.",
    ],
    tips: "Diétás igények előre. Bérelt főzőstúdió ajánlott.",
    variations: "",
  },
  {
    name: "Borkóstoló moderátorral",
    category: "JEGTORO",
    minSize: 6, maxSize: 30, durationMin: 90, indoor: true,
    energyLevel: "ALACSONY", imageEmoji: "🍷",
    description: "Vezetett borkóstoló 5-6 borral, sommelier vezetésével.",
    materials: "Borok, poharak, falatkák, sommelier",
    steps: [
      "5-6 bor előkészítve állványon.",
      "Sommelier bemutat 10-15 percben fajtánként.",
      "Kóstolás után rövid beszélgetés.",
      "Záró: kedvenc bor szavazás.",
    ],
    tips: "Alkohol-mentes alternatíva mindig biztosított.",
    variations: "Sörkóstoló vagy kávékóstoló is.",
  },
  {
    name: "Hangulat-térkép (mood mapping)",
    category: "KOMMUNIKACIO",
    minSize: 4, maxSize: 30, durationMin: 20, indoor: true,
    energyLevel: "ALACSONY", imageEmoji: "📍",
    description: "Mindenki egy 2-tengelyes térképre (pl. energia × elköteleződés) odaragasztja a saját nevét — beszélgetés-indító.",
    materials: "Nagy 2-tengelyes térkép, post-it-ek",
    steps: [
      "Bemutatod a 2 tengelyt és a 4 negyedet.",
      "Mindenki gondolkodik 2 percig, hova teszi magát.",
      "Felragasztják a nevüket.",
      "Beszélgetés 10 perc kis csoportokban negyedenként.",
    ],
    tips: "A térkép tengelyei az event céljához igazodjanak.",
    variations: "",
  },
  {
    name: "Lego Serious Play mini",
    category: "PROBLEMA",
    minSize: 6, maxSize: 16, durationMin: 60, indoor: true,
    energyLevel: "ALACSONY", imageEmoji: "🧱",
    description: "Mindenki LEGO-ból modellezi a saját szerepét vagy a csapat-jövőképet, majd közös modellt építünk.",
    materials: "LEGO Serious Play készlet vagy nagy adag vegyes LEGO",
    steps: [
      "Egyéni 5 perces építés egy témára (pl. „mi vagyok a csapatban?”).",
      "Bemutatás 1 perc/fő.",
      "Közös modell összerakása.",
      "Reflexió.",
    ],
    tips: "Certified facilitator komolyabb verzióhoz; mini-verzióval is működik.",
    variations: "",
  },
  {
    name: "Szerencsekerék-bemutatkozás",
    category: "JEGTORO",
    minSize: 6, maxSize: 30, durationMin: 20, indoor: true, outdoor: true,
    energyLevel: "ALACSONY", imageEmoji: "🎡",
    description: "Egy random kérdés-szerencsekerékkel mindenki kap egy bemutatkozó kérdést.",
    materials: "Wheelofnames.com vagy fizikai kerék",
    steps: [
      "10-15 kérdés a keréken (pl. „kedvenc útikalandod”).",
      "Mindenki forgatja, és válaszol.",
      "Rövid follow-up kérdés a többiektől.",
      "Körkörösen halad végig.",
    ],
    tips: "A kérdések szintje álljon a csapathoz: új csapatban könnyű, érettnél mélyebb.",
    variations: "",
  },
  {
    name: "Csapat-szelfi vadászat",
    category: "KREATIV",
    minSize: 8, maxSize: 40, durationMin: 45, indoor: true, outdoor: true,
    energyLevel: "KOZEPES", imageEmoji: "📸",
    description: "Csapatok listát kapnak 10-15 témáról; minden témára egy szelfit kell készíteni a meghatározott idő alatt.",
    materials: "Telefonok, lista-kártyák",
    steps: [
      "Csapatok 4-5 fő, megkapják a listát.",
      "30 perc szelfi-készítés (pl. „a csapat egy szobornál”).",
      "Visszatérés, képek megosztása.",
      "Zsűri szavazás eredetiségre.",
    ],
    tips: "Kreatív kategória (pl. „fejjel lefelé”) szórakoztatóbb.",
    variations: "",
  },
  {
    name: "Kockázat-szavazás",
    category: "PROBLEMA",
    minSize: 6, maxSize: 25, durationMin: 30, indoor: true,
    energyLevel: "ALACSONY", imageEmoji: "🎲",
    description: "A csapatnak 5-7 valós problémát adunk meg; közösen rangsoroljuk fontosság és sürgősség szerint.",
    materials: "Nagy papír 2-tengelyes mátrixszal, post-it-ek",
    steps: [
      "Problémák bemutatása a falon.",
      "Mindenki 3 pontot tehet bármely problémára.",
      "Beszélgetés a top 3-ról.",
      "Akcióterv felvázolása.",
    ],
    tips: "Jó pre-quarterly-retro alkalmával.",
    variations: "",
  },
  {
    name: "Improvizációs körök",
    category: "KOMMUNIKACIO",
    minSize: 6, maxSize: 20, durationMin: 40, indoor: true,
    energyLevel: "KOZEPES", imageEmoji: "🎭",
    description: "Klasszikus improv-gyakorlatok („yes, and”, „one-word story”, „freeze”).",
    materials: "Nincs",
    steps: [
      "Bemelegítés 5 perc (pl. „yes, and” párokban).",
      "One-word story körkörösen.",
      "Freeze: két játékos jelenetet kezd, „freeze” szóra mások átveszik.",
      "Debrief.",
    ],
    tips: "Improv-trénerrel meredekebben emelkedik az élmény.",
    variations: "",
  },
  {
    name: "Társasjáték-est",
    category: "BIZALOM",
    minSize: 6, maxSize: 30, durationMin: 90, indoor: true,
    energyLevel: "ALACSONY", imageEmoji: "🎲",
    description: "Vegyes társasjáték-est: kooperatív és kompetitív játékok többféle asztalnál.",
    materials: "5-8 különböző társasjáték (Codenames, Dixit, Carcassonne, stb.)",
    steps: [
      "Asztalonként 1 játék-vezető.",
      "Csapatok 5-7 fő, váltogatás 30 percenként.",
      "Snack és ital a háttérben.",
      "Záró: legkedveltebb játék szavazás.",
    ],
    tips: "Bemelegítő játékok rövidebbek legyenek.",
    variations: "",
  },
];

async function ensureGlobalActivities() {
  let added = 0;
  for (const a of ACTIVITIES) {
    const exists = await prisma.activity.findFirst({
      where: { name: a.name, organizationId: null },
    });
    if (exists) continue;
    await prisma.activity.create({
      data: {
        ...a,
        outdoor: a.outdoor ?? false,
        steps: JSON.stringify(a.steps || []),
        organizationId: null,
        isCustom: false,
      },
    });
    added++;
  }
  return added;
}

async function main() {
  const added = await ensureGlobalActivities();
  console.log(`[seed] ${added} új aktivitás hozzáadva (összesen elérhető: ${ACTIVITIES.length}).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

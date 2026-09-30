/*
 * MAP YOUR FUTURE — konfigurace kiosku
 * =====================================================================
 *  DEMO – neschváleno
 *  Otázky, odpovědi, hodnocení a texty jsou pracovní návrh pro vývoj
 *  (krok 1: průchod S0–S7). Finální znění a scoring schvaluje MetLife
 *  (docs/design.md kap. 6, otázky 6, 7 a 9). Později se konfigurace
 *  bude načítat z administrace.
 *
 *  Je to JS (window.MYF_CONFIG), ne JSON, aby kiosk běžel i otevřený
 *  přímo z disku (file://) bez serveru.
 * =====================================================================
 */
window.MYF_CONFIG = {
  status: 'DEMO – neschváleno',
  locale: 'cs',

  event: {
    id: 'demo-2026',
    name: 'Roadshow MetLife – DEMO',
    date: '30. 9. 2026'
  },

  assets: {
    logo: { src: '../../assets/logo/metlife-white.svg', alt: 'MetLife' }
  },

  // Časování v ms (design.md kap. 3, „Stavy napříč aplikací")
  timers: {
    idleWarningMs: 50000,     // S1–S5: dialog „Jste tam ještě?"
    idleResetMs: 60000,       // S1–S5: návrat na S0 (dialog tedy běží 10 s)
    ctaIdleResetMs: 90000,    // S6: návrat na S0 bez dialogu
    thanksCountdownMs: 8000,  // S7: odpočet do návratu na S0
    calculationMs: 2000,      // S3: 1,5–2,5 s
    attractRotateMs: 6000,    // S0: jedna výzva
    answerAdvanceMs: 180      // S2: prodleva po výběru, aby byla vidět volba
  },

  // DEMO – neschváleno. Pevné hodnocení odpovědí; skutečný scoring přijde v kroku 2.
  ratings: {
    good:  { label: 'V pořádku' },
    watch: { label: 'Stojí za pozornost' },
    risk:  { label: 'Prostor ke zlepšení' }
  },

  // DEMO – neschváleno. Oblasti, které návštěvník může ovlivnit (karty S4, ikony S3).
  areas: [
    {
      id: 'exercise',
      label: 'Pohyb',
      recommendations: {
        good:  'Pokračujte – pravidelný pohyb je jeden z nejsilnějších návyků.',
        watch: 'Zkuste přidat dvě svižné procházky týdně.',
        risk:  'Začněte 20 minutami chůze denně – i to se počítá.'
      }
    },
    {
      id: 'sleep',
      label: 'Spánek',
      recommendations: {
        good:  'Držte pravidelný rytmus i o víkendu.',
        watch: 'Cílem je 7–9 hodin v pravidelném rytmu.',
        risk:  'Dopřejte si aspoň 7 hodin – spánek je základ regenerace.'
      }
    },
    {
      id: 'smoking',
      label: 'Kouření',
      recommendations: {
        good:  'Skvělé – bez tabáku má tělo víc prostoru.',
        watch: 'I příležitostné kouření se počítá – zkuste ho omezit.',
        risk:  'Přestat se vyplatí v každém věku a pomoc je dostupná.'
      }
    },
    {
      id: 'alcohol',
      label: 'Alkohol',
      recommendations: {
        good:  'Umírněnost je dobrá volba – jen tak dál.',
        watch: 'Zkuste do týdne zařadit víc dní bez alkoholu.',
        risk:  'Méně alkoholu znamená lepší spánek i víc energie.'
      }
    },
    {
      id: 'stress',
      label: 'Stres',
      recommendations: {
        good:  'Zátěž zvládáte dobře – chraňte si čas na odpočinek.',
        watch: 'Najděte si každý den chvíli jen pro sebe.',
        risk:  'Dlouhodobý stres je signál – nebojte se říct si o podporu.'
      }
    }
  ],

  // DEMO – neschváleno. type: 'tiles' = volba v mřížce, 'buttons' = odpověďová tlačítka.
  // Otázka bez `area` se nehodnotí (věk, pohlaví) — slouží jen pro statistiky.
  questions: [
    {
      id: 'age',
      type: 'tiles',
      text: 'Kolik je vám let?',
      answers: [
        { id: '18-29', label: '18–29' },
        { id: '30-39', label: '30–39' },
        { id: '40-49', label: '40–49' },
        { id: '50-59', label: '50–59' },
        { id: '60+',   label: '60 a více' }
      ]
    },
    {
      id: 'sex',
      type: 'tiles',
      text: 'Jaké je vaše pohlaví?',
      answers: [
        { id: 'female',      label: 'Žena' },
        { id: 'male',        label: 'Muž' },
        { id: 'undisclosed', label: 'Nechci uvádět' }
      ]
    },
    {
      id: 'exercise',
      area: 'exercise',
      type: 'buttons',
      text: 'Kolik hodin týdně se hýbete?',
      answers: [
        { id: 'lt1', label: 'Méně než 1 hodinu', rating: 'risk' },
        { id: '1-3', label: '1–3 hodiny',        rating: 'watch' },
        { id: '3-5', label: '3–5 hodin',         rating: 'good' },
        { id: 'gt5', label: 'Více než 5 hodin',  rating: 'good' }
      ]
    },
    {
      id: 'sleep',
      area: 'sleep',
      type: 'buttons',
      text: 'Kolik hodin obvykle spíte?',
      answers: [
        { id: 'lt6', label: 'Méně než 6 hodin', rating: 'risk' },
        { id: '6-7', label: '6–7 hodin',        rating: 'watch' },
        { id: '7-9', label: '7–9 hodin',        rating: 'good' },
        { id: 'gt9', label: 'Více než 9 hodin', rating: 'watch' }
      ]
    },
    {
      id: 'smoking',
      area: 'smoking',
      type: 'buttons',
      text: 'Kouříte cigarety nebo e-cigarety?',
      answers: [
        { id: 'never',      label: 'Ne, nikdy',            rating: 'good' },
        { id: 'former',     label: 'Dříve ano, teď už ne', rating: 'good' },
        { id: 'occasional', label: 'Příležitostně',        rating: 'watch' },
        { id: 'daily',      label: 'Denně',                rating: 'risk' }
      ]
    },
    {
      id: 'alcohol',
      area: 'alcohol',
      type: 'buttons',
      text: 'Jak často pijete alkohol?',
      answers: [
        { id: 'rarely',     label: 'Vůbec nebo výjimečně', rating: 'good' },
        { id: 'weekly-1-2', label: '1–2× týdně',           rating: 'good' },
        { id: 'weekly-3-4', label: '3–4× týdně',           rating: 'watch' },
        { id: 'daily',      label: 'Skoro každý den',      rating: 'risk' }
      ]
    },
    {
      id: 'stress',
      area: 'stress',
      type: 'buttons',
      text: 'Jak často se cítíte ve stresu?',
      answers: [
        { id: 'rarely',    label: 'Málokdy',     rating: 'good' },
        { id: 'sometimes', label: 'Občas',       rating: 'good' },
        { id: 'often',     label: 'Často',       rating: 'watch' },
        { id: 'always',    label: 'Téměř pořád', rating: 'risk' }
      ]
    }
  ],

  // [OTEVŘENÉ] Cíl QR kódu — design.md kap. 6, otázka 7. V kroku 1 jen placeholder.
  qr: { url: '' },

  // Texty obrazovek. {n}, {total}, {count}, {good}, {s} doplňuje aplikace.
  texts: {
    documentTitle: 'Map Your Future – MetLife',
    back: 'Zpět',

    // S0 — výzvy podle design.md (finální znění schvaluje MetLife)
    attract: {
      prompts: [
        'Kolik let zdraví máte před sebou?',
        'Mapa vašich návyků za 2 minuty.',
        'Co můžete ovlivnit — a co ne?'
      ],
      cta: 'Začít'
    },

    // S1
    intro: {
      label: 'Map your future',
      title: 'Mapa vašich návyků',
      text: 'Odpovězte na pár otázek o svém životním stylu. Ukážeme vám, co můžete ovlivnit – a co ne.',
      facts: [
        { value: '{count}', label: 'otázek' },
        { value: '2',       label: 'minuty' },
        { value: '0',       label: 'osobních údajů' }
      ],
      privacy: 'Neukládáme žádné osobní údaje. Výsledek se nikam neposílá.',
      cta: 'Jdeme na to'
    },

    // S2
    question: {
      progress: 'Otázka {n} z {total}'
    },

    // S3
    calculation: {
      text: 'Skládáme vaši mapu…'
    },

    // S4 — hero bez „let ve zdraví", dokud to MetLife neschválí (DEMO)
    result: {
      label: 'Co můžete ovlivnit',
      hero: '{good} z {total}',
      heroLabel: 'oblastí máte v pořádku',
      cta: 'Pokračovat'
    },

    // S5 — DEMO – neschváleno (kromě přemostění z design.md)
    fixed: {
      label: 'Co ovlivnit nemůžete',
      title: 'Některé věci nenaplánujete',
      items: [
        { title: 'Nemoc',            text: 'Může přijít i při zdravém životním stylu.' },
        { title: 'Úraz',             text: 'Stává se nečekaně – doma, na cestách i při sportu.' },
        { title: 'Invalidita',       text: 'Může dlouhodobě změnit příjem i každodenní život.' },
        { title: 'Závažná diagnóza', text: 'Týká se i lidí, kteří o sebe pečují.' }
      ],
      bridge: 'Zdraví můžete ovlivnit. Ne všechno ale můžete předvídat.',
      cta: 'Pokračovat'
    },

    // S6 — DEMO – neschváleno
    cta: {
      label: 'MetLife',
      title: 'Pojištění chrání váš životní plán, když zdraví selže.',
      text: 'Zdravé návyky pomáhají prodloužit život ve zdraví.',
      qrPlaceholder: 'QR – DEMO',
      qrCaption: 'Naskenujte a domluvte si nezávaznou konzultaci s poradcem.',
      primary: 'Dokončit',
      secondary: 'Zeptat se u stánku'
    },

    // S7 — DEMO – neschváleno
    thanks: {
      title: 'Děkujeme!',
      text: 'Přejeme hodně zdraví a dobrých návyků.',
      textBooth: 'Kolegové u stánku se vám rádi budou věnovat.',
      countdown: 'Za {s} s se vrátíme na začátek.',
      cta: 'Hotovo'
    },

    // Dialog nečinnosti (S1–S5)
    idle: {
      title: 'Jste tam ještě?',
      text: 'Pokud ne, za chvíli se vrátíme na začátek.',
      countdown: 'Za {s} s se vrátíme na začátek.',
      cta: 'Ano, pokračuji'
    }
  }
};

# MAP YOUR FUTURE — Design description aplikace

**Verze:** 2.0 · 30. 9. 2026
**Nahrazuje:** v1.0 z 9. 9. 2026 (identita akce *She in progress*) — v1.0 je jen v historii / `docs/archive/`, **neplatí**
**Vizuální směr:** výhradně korporátní značka MetLife
**Určeno pro:** dodavatele / IT a Claude Code jako podklad k vývoji
**Navazuje na:** brief „MAP YOUR FUTURE – interaktivní životní kalkulačka" (`docs/brief.md`)

---

## 0. Jak číst tento dokument

| Značka | Význam |
|---|---|
| **[ZÁVAZNÉ]** | Rozhodnuto — implementovat tak, jak je napsáno |
| **[NÁVRH]** | Doporučení k připomínkování MetLife, pro vývoj ho ber jako výchozí stav |
| **[OVĚŘIT]** | Hodnota převzatá z veřejných zdrojů, ne z brand manuálu MetLife — v kódu jen přes tokeny, aby šla změnit na jednom místě |
| **[OTEVŘENÉ]** | Chybí vstup, blokuje finální design nebo odhad |

**Pravidlo pro implementaci:** žádná barva, písmo ani rozměr se nepíše do komponent napřímo. Vše jde přes CSS custom properties z kap. 2.1 a 2.2. Až MetLife dodá oficiální hodnoty, mění se jen tokeny.

### 0.1 Co se změnilo proti v1.0

| Oblast | v1.0 (neplatí) | v2.0 |
|---|---|---|
| Identita | Event identita *She in progress* | Korporátní značka MetLife |
| Barvy | Mint `#A9F2B7` + mořská modř | MetLife Blue, Dark Blue, Green + tmavé plochy |
| Písmo | Merchant + Archivo Narrow | Jedna rodina: brand písmo MetLife (Effra), fallback Albert Sans |
| Pozadí | Fotka mořské hladiny, závoje, overlay | **Plochá tmavá barva**, žádná fotografie |
| Motiv | Mintové linky (i jako osa výsledku) | Bez dekorativního motivu; data nesou pruhy a body |
| Co-branding | MetLife + OVB napevno | Jen MetLife; slot pro partnera volitelný, výchozí vypnutý |
| S0, S3, S4, L4 | Stavěné na linkách a stage slidu | Přepracováno — viz kap. 3 a 4 |

Beze změny zůstává: průchod obrazovkami S0–S7 a L1–L5, ergonomie kiosku, stavy a časování, offline chování, práce s `event_id`, GDPR, administrace.

---

## 1. Vizuální identita

### 1.1 Barvy značky [OVĚŘIT]

Oficiální brand manuál není k dispozici. Hodnoty jsou shodně uváděné veřejnými brand databázemi; před spuštěním potvrdit u MetLife.

| Token | Hex | Název |
|---|---|---|
| `--ml-blue` | `#0090DA` | MetLife Blue |
| `--ml-blue-dark` | `#0061A0` | MetLife Dark Blue |
| `--ml-green` | `#A4CE4E` | MetLife Green |

**Omezení vyplývající z kontrastu (WCAG, ověřeno výpočtem):**

- **MetLife Green** na tmavé ploše `--ink-900` → **9,0 : 1** ✓ — hlavní akcent, použitelný i pro text.
- **MetLife Blue** na `--ink-900` → **4,7 : 1**, na `--ink-800` jen **4,1 : 1** — **ne pro běžný text.** Jen grafika (pruhy, progress, ikony) a velký text ≥ 32 px.
- **Bílý text na MetLife Blue** → **3,5 : 1** — modré tlačítko s bílým textem jen při velikosti ≥ 32 px SemiBold. Proto primární CTA není modré, ale zelené (kap. 2.4).
- **Zelená na bílé** → **1,8 : 1** ✗ — zelená se nikdy nepoužije na světlém podkladu. Aplikace je celá tmavá, světlý mód se nedělá. **[ZÁVAZNÉ]**

### 1.2 Typografie

**Jedna rodina písma pro všechno.** Hierarchie se řeší velikostí a řezem, ne druhým písmem. **[ZÁVAZNÉ]**

| | Písmo | Stav |
|---|---|---|
| Primární | **Effra** (Dalton Maag) — písmo wordmarku MetLife | [OVĚŘIT] že jde o brand písmo pro digitál · [OTEVŘENÉ] webfont licence — komerční písmo, bez licence ho nelze embedovat |
| Fallback | **Albert Sans** (Google Fonts, OFL, latin-ext) | Použitelné hned, self-hosted. Vývoj začíná s ním. |

```css
--font-brand: "Effra", "Albert Sans", system-ui, sans-serif;
```

Až bude licence Effra, přidá se `@font-face` a nic dalšího se nemění. Pokud licence nebude, zůstává Albert Sans — je to plnohodnotné řešení, ne provizorium.

Řezy: Regular 400, Medium 500, SemiBold 600, Bold 700. Nic lehčího než 400 — tenké řezy na tmavé ploše a z dálky mizí.

**Prostrkání:**

- verzálky (labely, stavy) → **+8 až +12 %**
- běžný text a nadpisy → **0 %**
- velká čísla a display → **−1 až −2 %**

Diakritiku ověřit na slově „Škopová" a „ŘÍJEN" ve všech použitých řezech — platí pro Effru i fallback.

### 1.3 Grafický jazyk [ZÁVAZNÉ]

- **Ploché tmavé plochy.** Žádné fotografie, přechody, textury, stíny, glassmorphism.
- Vrstvení jen posunem plochy o stupeň + hairline.
- Jediné „ozdoby" jsou datové prvky: pruhy, body, progress — **grafika vzniká z dat**, ne z dekorace.
- Symbol „M" z loga se **nepoužívá jako dekorativní motiv, vzor ani osa grafu.** [OTEVŘENÉ] — pokud brand pravidla MetLife práci se symbolem dovolují, dá se to doplnit později.

### 1.4 Pozadí [ZÁVAZNÉ]

- Tablet: plná barva `--ink-900`, jedna na celý průchod. Sekce S5 („co neovlivníte") `--ink-950`.
- LED: plná barva `--ink-950`.
- Žádný obrázek na pozadí → odpadá předrenderování, ořezy pro orientace i riziko nekonzistentního vykreslení na kiosku.

### 1.5 Logo

- **Varianta:** MetLife pro tmavý podklad — bílý wordmark, symbol v modré a zelené. Zdroj `loga/metlife_new/MetLife_LOGO_WHITE.PDF` → převést do **SVG** (vektor). PNG nepoužívat.
- **Ochranná zóna a minimální velikost:** [OTEVŘENÉ] — do potvrzení MetLife ochranná zóna = výška symbolu „M" na všech stranách, minimální výška loga 40 px (tablet) / 80 px (LED).
- **Umístění:** jedno místo napříč všemi obrazovkami tabletu (patička, vpravo). [NÁVRH]
- **Logo se nemění, nebarví, nedeformuje, nedává do rámečku.**

**Akce a partner (konfigurovatelné z administrace):**

- Název a datum akce — **jako text** v brand písmu, ne jako logo akce.
- Slot pro logo partnera — volitelný, **výchozí stav vypnuto.** Pokud se zapne: stejná výška jako MetLife, oddělené svislou hairline, vždy vpravo od MetLife.

### 1.6 Co se NEpřebírá ⚠️

Z v1.0 a z Figma souboru *She in progress* se do aplikace **nepřebírá nic vizuálního**: mint `#A9F2B7`, mořská modř `#003652` / `#002F48`, písma Merchant a Archivo Narrow, fotka mořské hladiny, overlay, mintové ani zlaté linky, lockup „she / IN PROGRESS", logo OVB, stage slide jako attract obrazovka. Stejně tak šedé „Link" pilulky s `#1A73E8` a Inter z Figmy.

---

## 2. Design systém aplikace

### 2.1 Paleta — tokeny

```css
:root {
  /* Plochy [NÁVRH] — odvozeno z tónu MetLife Dark Blue */
  --ink-950: #00182A;   /* LED pozadí, S5, scrim modálů          */
  --ink-900: #002238;   /* základní plocha tabletu               */
  --ink-800: #002D4A;   /* karta, tlačítko odpovědi              */
  --ink-700: #0A4163;   /* track progressu/slideru, pressed stav */

  /* Značka [OVĚŘIT] */
  --ml-blue:      #0090DA;
  --ml-blue-dark: #0061A0;
  --ml-green:     #A4CE4E;

  /* Odvozené [NÁVRH] */
  --ml-blue-300:  #5CB8E8;   /* modrá pro text/ikony, kde je čistá modrá málo kontrastní */

  /* Text */
  --white:    #FFFFFF;
  --white-80: rgba(255,255,255,0.80);
  --white-55: rgba(255,255,255,0.55);
  --hairline: rgba(255,255,255,0.12);

  /* Vyhodnocení */
  --eval-good:  var(--ml-green);
  --eval-watch: #FFC46B;
  --eval-risk:  #FF9A8B;
  --eval-fixed: var(--white-55);
}
```

**Kontrastní tabulka (ověřeno výpočtem):**

| Popředí | na `--ink-950` | na `--ink-900` | na `--ink-800` | na `--ink-700` |
|---|---|---|---|---|
| white | 18,0 | 16,3 | 14,2 | 10,8 |
| white-80 | 11,7 | 10,8 | 9,6 | 7,5 |
| white-55 | 6,0 | 5,8 | 5,3 | 4,4 |
| `--ml-green` | 9,9 | 9,0 | 7,8 | 5,9 |
| `--ml-blue` | 5,2 | 4,7 | 4,1 ⚠ | 3,1 ⚠ |
| `--ml-blue-300` | 8,1 | 7,4 | 6,4 | 4,9 |
| `--eval-watch` | 11,5 | 10,4 | 9,1 | 6,9 |
| `--eval-risk` | 8,8 | 8,0 | 7,0 | 5,3 |

**Role barev [ZÁVAZNÉ]** — jednoduché pravidlo, které drží celou aplikaci:

- **Zelená = volba a akce.** Vybraná odpověď, primární CTA, stav „dobré".
- **Modrá = průběh a data.** Progress, slider, načítání, neutrální grafy, čísla na LED.
- **Bílá = obsah.** Otázky, texty, hodnocení.

Zelená má dvě role (akce i hodnocení „dobré"). Je to přijatelné, protože se na jedné obrazovce nepotkají — CTA není na obrazovce s kartami výsledků, nebo je od nich prostorově oddělené.

**Dvě rozhodnutí k obhájení u MetLife** (beze změny z v1.0):

1. **Sekce „co ovlivnit nemůžete" není červená**, ale neutrální `--eval-fixed`. Červená by z edukačního nástroje udělala strašení.
2. **`--eval-risk` je tlumený korál**, ne signální červená — na tmavé ploše nepůsobí jako chybové hlášení.

### 2.2 Typografická škála

Všechno `--font-brand`.

**Tablet — návrhový základ 1200 × 1600 px (portrét), škáluje se přes `clamp()` / `vmin`:**

| Role | Řez | Velikost | LH | LS | Barva |
|---|---|---|---|---|---|
| `display` (hero číslo, attract) | Bold 700 | 120 px | 1,0 | −2 % | white / green |
| `h1` (znění otázky) | SemiBold 600 | 56 px | 1,15 | 0 | white |
| `h2` | SemiBold 600 | 40 px | 1,2 | 0 | white |
| `answer` | Medium 500 | 32 px | 1,3 | 0 | white |
| `body` | Regular 400 | 28 px | 1,4 | 0 | white-80 |
| `label` (verzálky) | SemiBold 600 | 22 px | 1,2 | +10 % | green / white-80 |
| `legal` | Regular 400 | 18 px | 1,45 | 0 | white-55 |

Minimum pro čtení vestoje z ~50 cm: **28 px**. Nic pod 18 px, a to jen pro právní patičku.

**LED — návrhový základ 1920 × 1080 px:**

| Role | Řez | Velikost | Pozn. |
|---|---|---|---|
| `led-hero` | Bold 700 | 280 px | hlavní číslo L1 |
| `led-number` | SemiBold 600 | 200 px | čísla statistik, **tabular figures** |
| `led-h1` | SemiBold 600 | 120 px | textové sdělení MetLife |
| `led-label` | SemiBold 600 | 48 px | verzálky, +10 % LS, green |
| `led-caption` | Regular 400 | 32 px | patička, „aktualizováno …" |

Čitelnost z 5–8 m: velká čísla min. **150 px** při 1080p → na LED **maximálně 3 datové údaje na obrazovku.**

Tabular figures: ověřit, že je Effra i fallback mají (`font-variant-numeric: tabular-nums`). Pokud ne, čísla na LED sázet do boxu pevné šířky.

### 2.3 Spacing, rádiusy, elevace

- **Grid:** 8 px. Škála `8 / 16 / 24 / 32 / 48 / 64 / 96 / 128`.
- **Tablet layout:** 12 sloupců, okraj 64 px, gutter 24 px. Bezpečná zóna 48 px od okraje displeje.
- **LED layout:** 12 sloupců, okraj 96 px, gutter 32 px. **Safe area 5 % od každého okraje.**
- **Rádiusy:** karty `24 px`, tlačítka a chipy `999 px` (pilulka), plnoplošné panely `0`. [NÁVRH]
- **Elevace:** žádné stíny. Vrstvení = posun plochy o stupeň (`ink-900` → `ink-800`) + `1px var(--hairline)`.

### 2.4 Komponenty

| Komponenta | Specifikace |
|---|---|
| **Odpověďové tlačítko** | Plná šířka sloupce, výška **120 px**, radius 999, plocha `--ink-800`, border `1px --hairline`, text `answer`. Stisk: `--ink-700`. Vybráno: plocha `--ml-green`, text `--ink-900` (9,0 : 1). Bez hover stavu. |
| **Volba v mřížce** (věk, pohlaví) | Dlaždice min. **200 × 200 px**, ikona + label, stejná stavová logika. |
| **Slider** (spánek, pohyb) | Track 16 px `--ink-700`, výplň `--ml-blue`, úchyt **ø 88 px** bílý. Vždy s číselným popiskem nad úchytem. |
| **Progress otázek** | Tenký pruh nahoře 8 px, `--ink-700` / `--ml-blue`, + label „Otázka 3 z 7" (white-80). Vidět od první otázky. |
| **Karta výsledku (oblast)** | `--ink-800`, radius 24, padding 32. Vlevo 8px barevný sloupec v `--eval-*`, uvnitř: název oblasti (`label`), hodnocení (`h2`), jednořádkové doporučení (`body`). |
| **Primární CTA** | Pilulka, plocha `--ml-green`, text `--ink-900` SemiBold 32 px, výška 112 px, padding 48. Jediné plné zelené tlačítko na obrazovce. |
| **Sekundární akce** | Text-only, white-80, podtržení, výška zásahu 88 px. |
| **QR kód** | Min. **440 × 440 px**. **Vždy tmavý kód na bílé ploše** s paddingem 32. Pod ním popisek, co se skenováním získá. |
| **Logo** | SVG, stálá pozice v patičce, výška 48 px (tablet) / 96 px (LED). Volitelný partner vpravo za hairline. |

### 2.5 Ergonomie kiosku (beze změny)

- **Minimální dotykový cíl 88 × 88 px**, mezera mezi cíli **min. 24 px**.
- **Horních 15 % obrazovky bez interaktivních prvků** — jen progress a branding.
- Primární akce **v dolní třetině**, zarovnaná k palci.
- Žádná klávesnice, žádný scroll uvnitř kroku. Jedna otázka = jedna obrazovka bez rolování.
- Žádné hover stavy, tooltipy, pravý klik.

### 2.6 Motion

| Situace | Chování |
|---|---|
| Přechod mezi otázkami | 240 ms, `cubic-bezier(0.2, 0, 0, 1)`, posun 32 px + fade |
| Výběr odpovědi | 120 ms změna plochy, žádný „bounce" |
| Odhalení výsledku | Karty postupně, stagger 80 ms, celkem max 1,2 s; barevný sloupec karty „naroste" shora dolů |
| Attract loop | Střídání tří úvodních výzev, crossfade 600 ms, 6 s na výzvu; CTA jemně pulzuje (scale 1 → 1,03, perioda 2 s) |
| LED rotace obrazovek | Crossfade 600 ms, prodleva **12 s** na obrazovku |
| Reduced motion | Vše bez posunu a pulzu, jen fade 120 ms |

Pozadí se **nehýbe** — plochá barva, žádný drift. Pohyb nese obsah, ne dekorace.

Strop: **žádná animace nebrání dalšímu kliknutí.**

---

## 3. Tablet / kiosk — obrazovka po obrazovce

**[OTEVŘENÉ]** Cílové zařízení a rozlišení nejsou určeny. Základ **portrét 1200 × 1600**, fluidní škálování; landscape jako fallback s dvousloupcovým layoutem.

### S0 — Attract loop  *(přepracováno)*
Běží, když nikdo neinteraguje.
- Plocha `--ink-900`, logo MetLife v patičce, nahoře název akce z administrace (`label`).
- Střed: `display` — střídají se tři výzvy, např. „Kolik let zdraví máte před sebou?", „Mapa vašich návyků za 2 minuty.", „Co můžete ovlivnit — a co ne?" (finální znění schvaluje MetLife).
- Pod tím pulzující primární CTA „Začít".
- [NÁVRH] Volitelně malý údaj „Dnes už se zapojilo 47 lidí" — sociální důkaz, bere se z agregátu aktuální akce, skrytý pod 10 účastníků.
- Jakýkoli dotek kdekoli → S1.

### S1 — Úvod  *(beze změny)*
- 6–8 otázek, 1–2 minuty, žádné osobní údaje.
- Explicitní věta: **„Neukládáme žádné osobní údaje. Výsledek se nikam neposílá."**
- CTA „Jdeme na to".

### S2 — Otázky (6–8 obrazovek)  *(beze změny, jen barvy)*

```
┌────────────────────────────────┐
│ ▓▓▓▓▓░░░░░░░  Otázka 3 z 7     │  progress (modrá) + label
│                                │
│  Kolik hodin týdně             │  h1, max 3 řádky
│  se hýbete?                    │
│                                │
│  ┌──────────────────────────┐  │
│  │  Méně než 1 hodinu       │  │  answer button 120px
│  ├──────────────────────────┤  │
│  │  1–3 hodiny              │  │
│  ├──────────────────────────┤  │
│  │  3–5 hodin               │  │
│  ├──────────────────────────┤  │
│  │  Více než 5 hodin        │  │
│  └──────────────────────────┘  │
│                                │
│  ← Zpět                        │  sekundární
│                        MetLife │  logo
└────────────────────────────────┘
```

- Volba odpovědi **rovnou posouvá dál** (bez potvrzovacího tlačítka).
- „Zpět" vždy dostupné, dosud zadané odpovědi se pamatují.
- Max 5 možností na otázku; 6+ znamená rozdělit otázku.

### S3 — Výpočet  *(přepracováno)*
- 1,5–2,5 s, ne víc.
- Vizuál: řada ikon oblastí (pohyb, spánek, stres, …) — postupně se rozsvěcují zleva doprava, pod nimi modrý progress pruh.
- Text: „Skládáme vaši mapu…"

### S4 — Výsledek: co můžete ovlivnit  *(upraveno)*
- Hero: hlavní údaj v `display`, zeleně, např. „+7 let ve zdraví" (viz otevřená otázka 5).
- Pod ním **„mapa" = řada 3–5 karet oblastí** s barevným sloupcem `--eval-good / watch / risk`. Mapa je tedy tvořena kartami samotnými, žádná křivka navíc.
- Každá karta: oblast, hodnocení, **jedna konkrétní věta doporučení**.
- Bez „real age" v letech, pokud to MetLife neschválí.

### S5 — Výsledek: co ovlivnit nemůžete  *(beze změny, jen barvy)*
- Jiný rytmus: plocha `--ink-950`, neutrální `--eval-fixed`, žádné barevné sloupce.
- Nemoc, úraz, invalidita, závažná diagnóza — jako fakta, ne hrozby.
- Přemostění: **„Zdraví můžete ovlivnit. Ne všechno ale můžete předvídat."**

### S6 — MetLife CTA  *(beze změny)*
- Sdělení + **QR kód** (min. 440 px, tmavý na bílé) + popisek, co za ním je.
- Sekundární: „Zeptat se u stánku".
- **Sběr leadu je samostatný dobrovolný krok** — nikdy podmínka zobrazení výsledku.

### S7 — Poděkování a reset  *(beze změny)*
- Poděkování, odpočet 8 s, tlačítko „Hotovo".
- Auto-návrat na S0, **kompletní vymazání stavu relace**.

### Stavy napříč aplikací  *(beze změny)*

| Stav | Chování |
|---|---|
| **Nečinnost v S1–S5** | 45 s → dialog „Jste tam ještě?" (10 s) → 60 s → reset na S0 |
| **Nečinnost v S6** | 90 s → reset |
| **Offline** | Aplikace **funguje dál** — vyhodnocení běží lokálně. Diskrétní indikátor v patičce, výsledky se frontují lokálně a odešlou po obnovení spojení. Návštěvník nesmí poznat, že něco nefunguje. |
| **Chyba odeslání** | Nikdy nezobrazovat návštěvníkovi. Log do administrace. |
| **Prázdný / první průchod** | Bez zvláštního stavu — aplikace nezobrazuje vlastní historii |

---

## 4. LED dashboard — obrazovky

### 4.1 Formát [OTEVŘENÉ — blokuje layout]
Návrh vychází z **1920 × 1080 (16:9)**. Pokud je panel ultrawide, layout se přepracuje (data vedle sebe, ne pod sebou).

**Potřeba od dodavatele: fyzický rozměr panelu, nativní rozlišení, rozteč pixelů, pozorovací vzdálenost.**

### 4.2 Rotace obrazovek
Fullscreen URL, žádné ovládací prvky, 12 s na obrazovku, crossfade 600 ms, nekonečná smyčka. Pozadí `--ink-950`.

| # | Obrazovka | Obsah |
|---|---|---|
| **L1** | Zapojení | Jedno velké číslo (`led-hero`, zeleně) — „už se zapojilo 247 lidí". Live inkrement s animací počítadla. |
| **L2** | TOP statistiky | Max 3 údaje vedle sebe, číslo (`led-number`, bílá) + label (zelená). Např. průměrný spánek, % pravidelně sportujících, % nekuřáků. |
| **L3** | Nejčastější rizika | Horizontální pruhy, 3–4 položky, barvy `--eval-*`. Bez os a mřížky — popisek a hodnota na konci pruhu. |
| **L4** | Mapa oblastí *(přepracováno)* | Pro každou oblast (max 4 řádky) jeden **dělený pruh 100 %**: podíl účastníků v `good / watch / risk`. Ukazuje celkový obraz, ne jedno číslo. |
| **L5** | MetLife message | „Zdraví můžete ovlivnit. Ne všechno ale můžete předvídat." v `led-h1` + logo + QR (tmavý na bílé). |

### 4.3 Pravidla pro LED
- **Max 3 datové údaje na obrazovku** (L4 je jeden graf, ne 4 údaje).
- Čísla v **tabular figures**.
- **Prázdný stav (< 10 účastníků):** L2, L3 a L4 se přeskočí, smyčka jede L1 → L5.
- **Nic pod `led-caption` (32 px).** Právní patičky na LED nepatří.
- **Žádný statický prvek na stejném pixelu déle než 12 s** (burn-in). Týká se i loga — střídá pozici mezi obrazovkami (vlevo dole / vpravo dole).
- Zobrazuje se **výhradně agregát**, nikdy výsledek konkrétního člověka, ani nepřímo („poslední účastník…").

---

## 5. Mapování na technické zadání

| Požadavek z briefu | Co z toho plyne pro design a vývoj |
|---|---|
| PWA, dotyk, kiosk režim | Fullscreen bez URL lišty, zakázat pinch-zoom, text selection, pull-to-refresh, kontextové menu. `user-select: none`, `touch-action: manipulation`. |
| Rychlé načítání | Bez obrázku na pozadí. Logo a ikony jako inline SVG. Písma: preload 2 řezů, celkem cíl **< 500 kB**. Bez animačních knihoven — CSS stačí. |
| Písmo | Albert Sans self-hosted (OFL — subset na latin-ext povolen). Effra jen při potvrzené webfont licenci; podmínky úprav/subsetu podle licence. Vše přes `--font-brand`. |
| Odolnost vůči výpadku | Service worker, app shell offline-first, výsledky do IndexedDB, synchronizace na pozadí po obnovení. Vyhodnocení **výhradně lokálně**. |
| Auto-reset | Viz tabulka stavů. Reset maže i historii navigace. |
| Administrace bez nové verze | **Konfigurovatelné:** texty otázek a odpovědí, váhy a prahy scoringu, texty výsledků a doporučení, texty attract výzev, CTA text, cíl QR, název a datum akce, logo partnera (výchozí žádné), zapnutí/vypnutí volitelných otázek, sada obrazovek v LED rotaci a prodleva. |
| Reset statistik mezi akcemi | Každý záznam nese `event_id`. Dashboard přepínatelný „aktuální akce / kumulativně". Reset = nový `event_id`, ne mazání dat. |
| Export anonymních statistik | CSV/XLSX z administrace, agregáty i anonymizované řádky. |
| GDPR | Základní průchod bez osobních údajů. Žádné cookies vyžadující souhlas. Lead capture jako oddělený dobrovolný krok s vlastním souhlasem. |
| Brand tokeny | Barvy a písmo jen přes CSS custom properties (kap. 2.1). Hodnoty [OVĚŘIT] se po potvrzení MetLife mění na jednom místě. |

---

## 6. Otevřené otázky

**Blokující (bez nich nelze dokončit design):**

1. Cílový tablet — model, rozlišení, orientace, typ stojanu?
2. LED panel — fyzický rozměr, nativní rozlišení, pozorovací vzdálenost, 16:9 nebo ultrawide?

**Brand — potvrdit u MetLife:**

3. Barvy `#0090DA`, `#0061A0`, `#A4CE4E` — odpovídají platnému brand manuálu? Existují doplňkové barvy?
4. Brand písmo pro digitál — je to Effra? Máme webfont licenci, nebo zůstává Albert Sans?
5. Logo — ochranná zóna, minimální velikost, varianta pro tmavý podklad. Smí se symbol „M" použít graficky?

**K rozhodnutí s MetLife:**

6. Výsledek jako **„real age" v letech**, nebo **kvalitativní hodnocení oblastí**? Doporučení: kvalitativní hodnocení s jedním pozitivně formulovaným souhrnným číslem („+7 let ve zdraví").
7. Kam vede QR — konzultace, detail výsledku, nebo web MetLife?
8. Schválení, že sekce „co ovlivnit nemůžete" je neutrální, ne červená (kap. 2.1).
9. Finální znění 6–8 otázek a jejich váhy — teprve pak jde dokončit layout obrazovek s otázkami.

**Vyřešeno od v1.0:**

- ~~Vazba na akci *She in progress*~~ → aplikace je generický roadshow nástroj pod značkou MetLife; akce se nastavuje v administraci.
- ~~Licence Merchant~~ → písmo se nepoužívá.

---

## 7. Assety

| Co | Kde | Stav |
|---|---|---|
| MetLife logo pro tmavý podklad | `loga/metlife_new/MetLife_LOGO_WHITE.PDF` | **převést do SVG** → `assets/logo/metlife-white.svg` |
| MetLife logo barevné / černé | `loga/metlife_new/` (EPS, PDF, PNG) | pro aplikaci se nepoužije (světlý podklad) |
| Albert Sans | Google Fonts | stáhnout, self-host → `assets/fonts/` |
| Effra | — | [OTEVŘENÉ] licence |
| Ikony oblastí (pohyb, spánek, stres, kouření, alkohol, strava, prevence) | — | **chybí** — jednobarevné liniové SVG, tah 2 px při 48 px, jedna sada |

**Nepoužívá se** (zůstává jen v `PODKLADY_MATERIALY`): Merchant, Archivo Narrow, `pozadi/*`, `linie/*`, `loga/OVB/*`, `Logo Event.png`, `speakeri/`.

---

## 8. Mockup

Existující mockup „Map Your Future — mockup" (claude.ai artifact, 9. 9. 2026) je postavený na **identitě v1.0 a neplatí vizuálně.** Použitelný je jen jako reference **layoutu a proporcí** — rozmístění prvků, velikosti tlačítek, pořadí obrazovek.

- Do repozitáře ho neukládat jako vizuální předlohu. Pokud ano, pak do `docs/archive/` s poznámkou „jen layout".
- Nový mockup v MetLife identitě je potřeba vytvořit podle tohoto dokumentu.

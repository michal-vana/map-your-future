# MAP YOUR FUTURE — brief projektu

Pracujeme na projektu "MAP YOUR FUTURE" – interaktivní životní kalkulačka
pro MetLife, určená jako hlavní prvek promo stánku na roadshow akcích.

CO TO JE
- Dotyková aplikace (tablet/kiosk), kde návštěvník za 1–2 minuty odpoví
  na 6–8 otázek o životním stylu (věk, pohlaví, pohyb, kouření, alkohol,
  spánek, stres, volitelně BMI/strava/prevence).
- Na základě odpovědí dostane vizuální vyhodnocení: co může ovlivnit
  (zelená/oranžová/červená u jednotlivých oblastí) a co ovlivnit nemůže
  (nemoc, úraz, invalidita, závažná diagnóza).
- Následuje MetLife CTA sdělení: "Zdraví můžete ovlivnit. Ne všechno ale
  můžete předvídat." + možnost konzultace/QR kód.
- Vedle tabletu je LED panel zobrazující anonymizované, průběžně
  aktualizované agregované statistiky všech účastníků (ne osobní výsledek
  konkrétního člověka).

DVĚ ROZHRANÍ
A) Tablet/kiosk – interaktivní aplikace pro návštěvníka.
B) LED dashboard – samostatná fullscreen URL pro LED panel, rotující mezi
   obrazovkami (počet zapojených → TOP statistiky → nejčastější rizika →
   souhrnná mapa → MetLife message).

PRÁCE S DATY / ROADSHOW
- Aplikace se používá opakovaně na různých akcích.
- Potřeba: založení/označení akce, reset zobrazovaných statistik pro
  novou akci při zachování historických anonymních dat, přepínání
  zobrazení "aktuální akce" vs. "kumulativní roadshow", export
  anonymních statistik.

TECHNICKÉ POŽADAVKY
- Preferovaně webová aplikace / PWA, optimalizovaná na dotyk.
- Kiosk/fullscreen režim, velké dotykové prvky, bez klávesnice,
  rychlé načítání, auto-návrat na úvodní obrazovku při nečinnosti,
  auto-reset po dokončení.
- Odolnost vůči výpadku/nestabilitě internetu, se synchronizací dat
  po obnovení připojení.
- Administrace: úprava textů, scoringu, QR kódu a nastavení akce bez
  nutnosti nové verze aplikace.

GDPR
- Základní varianta nesbírá osobní údaje (jméno, telefon, e-mail).
- Výsledky se ukládají anonymně jen pro statistiku a LED dashboard.
- Případný sběr leadů = samostatný dobrovolný krok navíc.

STAV ROZPRACOVANOSTI
- Toto je zatím brief pro prvotní nacenění a technický návrh od IT.
- Finální otázky, jejich váhy/scoring, textace výsledků, grafický design
  a přesná rozlišení zařízení budou upřesněny a schváleny MetLife před
  finálním vývojem – zatím jde o MVP rozsah.

ROLE CLAUDE V TOMTO PROJEKTU
- Pomáhej s přípravou a upřesňováním zadání pro IT (texty briefů, e-maily,
  otázky k dodavateli, porovnání nabídek).
- Pomáhej navrhovat/ladit konkrétní otázky, scoring logiku a textace
  výsledků/CTA zpráv.
- Pomáhej promýšlet UX flow, strukturu LED dashboardu a datový model
  (jaké statistiky agregovat, jak řešit reset mezi akcemi).
- Drž se principu komunikace: "Zdravé návyky pomáhají prodloužit život
  ve zdraví. Pojištění chrání životní plán, když zdraví selže." – nejde
  o zdravotní diagnostiku, ale o edukační/engagement nástroj.
- Piš věcně, stručně a v češtině, pokud není řečeno jinak.
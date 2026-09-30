# MAP YOUR FUTURE — MetLife kiosk aplikace

Interaktivní životní kalkulačka pro promo stánek MetLife na roadshow akcích.
Návštěvník na tabletu odpoví na 6–8 otázek o životním stylu a dostane vizuální
vyhodnocení (co může ovlivnit / co ne) a MetLife CTA s QR kódem. Vedle běží LED
dashboard s anonymními agregovanými statistikami všech účastníků.

Jde o edukační / engagement nástroj, **ne zdravotní diagnostiku**.

## Zdroje pravdy

- `docs/brief.md` — zadání, rozsah, požadavky
- `docs/design.md` — design v2.0: tokeny, komponenty, obrazovky S0–S7 a L1–L5

Při rozporu platí `docs/design.md`. Když něco v dokumentech chybí, zeptej se —
nevymýšlej texty otázek, scoring ani brand hodnoty.

## Stack

- Backend: plain PHP + MySQL na sdíleném hostingu (verzi PHP ověřit na hostingu)
- Frontend: vanilla HTML / CSS / JS jako PWA (service worker, IndexedDB)
- Bez frameworků a bez build kroku, pokud se výslovně nedohodneme jinak

## Struktura

```
public/kiosk/   tablet aplikace (PWA)
public/led/     LED dashboard (fullscreen URL)
api/            PHP endpointy (ukládání výsledků, agregace, config)
admin/          PHP administrace (texty, scoring, akce, export)
db/             schema.sql a migrace
assets/         logo, písma, ikony
docs/           zadání a design
```

## Tvrdá pravidla

- Žádné osobní údaje v základním průchodu. Lead capture = samostatný dobrovolný krok.
- Vyhodnocení běží lokálně v prohlížeči; aplikace musí fungovat offline a výsledky
  synchronizovat po obnovení spojení.
- Každý uložený záznam nese `event_id`. Reset statistik = nový `event_id`, nikdy mazání.
- Texty, otázky, váhy scoringu, QR cíl a nastavení akce se berou z konfigurace
  (administrace), nikdy nejsou napevno v kódu.
- Barvy a písma jen přes CSS custom properties z `docs/design.md` kap. 2.1–2.2.
- LED zobrazuje výhradně agregáty, nikdy výsledek jednotlivce.
- Přístupové údaje nikdy do repozitáře: `api/config.php` je v `.gitignore`,
  commituje se jen `api/config.example.php`.
- Nic vizuálního z identity *She in progress* (mint, Merchant, mořská fotka, linky, OVB).

## Jak pracovat

- UI texty česky.
- Po malých krocích, v tomto pořadí: kiosk průchod s pevnou konfigurací → scoring
  z JSON konfigurace → PHP API + MySQL → LED dashboard → administrace → offline
  fronta a synchronizace → nasazení na hosting.
- Před každým větším krokem navrhni plán a počkej na potvrzení. Po každém kroku commit.

# Projekt-Anlegen Mockups — Iterations-Übersicht

**Datum:** 2026-04-27/28 Nacht-Lauf
**Auftrag:** Patrick will Long-Form-Layout, visuell viel besser strukturiert als EventWorx, **Power-User-optimal mit Bürokraft-Tauglichkeit**.

## Files (Reihenfolge nach Iteration)

| File | Stand | Charakter |
|---|---|---|
| `projects-anlegen-vergleich.html` | Initial | A/B/C-Pattern-Vergleich — Patrick wählte A |
| `projects-anlegen-V1.html` | erste A-Form | Card-Layout + Lucide-Icons + Smart Defaults — **Accent-Farbe falsch** (Grün statt Orange) |
| `projects-anlegen-V2.html` | ci-Fix | V1 + Accent #CC8844 + alle Token-Fixes |
| `projects-anlegen-V3.html` | UX-Polish | V2 + responsive AppShell + Read-only Adresse + Range-Block + ⌘K |
| **`projects-anlegen-V4.html`** | **Final** | **V3-Power-Features + Bürokraft-Sicherheitsnetz aus Marlene-Walkthrough** |

## V4 ist die Empfehlung

V4 vereint Power-User-Optimum (⌘K, Range-Block, Live-Stats) mit Bürokraft-Sicherheitsnetz (Identity oben, Klartext-Labels, Validation oben+unten, rote Pflichtfeld-Highlights, Demo-State).

## Reviewer-Findings die V4 prägten

### ci-reviewer auf V1 (kritisch)
- **Accent #5B7A5E (Grün) FALSCH** → cueplex-CI ist `#CC8844` Orange/Gold (Engram `99e18ca5`)
- 4 weitere Token-Issues: radius-xl, font-weight 800/300, hardcoded white, Focus-Ring rgba

### gemini-reviewer auf V1 (UX)
- AppShell `height: 1024px` zu starr → responsive
- Toggle versteckt Adresse → Read-only Block sichtbar
- 4 isolierte datetime-locals → Range-Block

### gemini-reviewer auf V3 (Bürokraft-Perspektive)
- Tech-Jargon (`Disposition`, `Reverse-Charge`, `Fibu-Konto`) → Klartext
- Kollabierte Sektionen → permanent sichtbar
- 3 Buttons → 2 (Abbrechen + Speichern)
- Vergleich: V3 ≈ DATEV. Ziel: lexoffice.

### naive-user-Walkthrough „Marlene" (kritisch)
- **„Patrick · du" verwirrte total** („Bin ich im falschen Projekt?") → Identity-Pill `MM Marlene Müller` oben
- **Vorausgefüllter Beispiel-Titel** scheute User → leerer Input mit Placeholder-Frage
- **„Pflichtfelder vollständig"** während Kunde leer = Vertrauensbruch → echte Live-Validation
- **„Anlegen + Angebot starten"** Angst vor Mail → Tooltip „verschickt nichts"
- **Computed-Pills** sahen wie Inputs aus → mit dashed-Border + „Berechnet:"-Präfix klar markiert

### ci-reviewer Sanity auf V3 (final)
- 1 Hard Violation: `font-weight: 300` in Arrow → gefixt
- Title sagt noch V2 → korrigiert

## Power-User-Features in V4

- **⌘K / Strg+K Schnellzugriff-Pille** in Topbar mit Erklärung „Schnellzugriff"
- **Range-Block** für Mietzeitraum (visueller Pfeil mit Auto-Dauer)
- **Live-Computed Stats** im Hero („Berechnet: Dauer X Tage")
- **Strg+S** Hint auf Speichern-Button
- **Klare Sub-Labels** „Beginn"/"Ende" damit auch Power-User schnell scannen

## Bürokraft-Sicherheitsnetz in V4

- **Identity-Pill** mit Avatar + eingeloggtem User („Du arbeitest als Marlene Müller")
- **Validation-Banner OBEN UND UNTEN** mit Jump-Link zu fehlendem Feld
- **Pflichtfelder rot** (Border + Background + pulsierender Asterisk)
- **Klartext-Labels** statt Tech-Jargon
- **„(freiwillig — kann leer bleiben)"** statt „(optional)"
- **Tooltips** auf Speichern-Button („verschickt nichts")
- **Lieferung + Notizen offen** (nicht kollabiert)
- **Read-only Adresse mit Empty-State** („Erscheint sobald Kunde gewählt")
- **Demo-State** unten zeigt grünen Speichern-Button

## Wahl-Hilfe

| Wenn du willst... | Datei |
|---|---|
| Pure Power-User-Variante (komplexer) | V3 |
| Pure Bürokraft-Variante (sehr simpel) | nicht gebaut — V4 deckt's mit |
| **Beides — Power-optimal + Bürokraft-tauglich** | **V4 ← Empfehlung** |
| Token/CI-Compliance ohne UX-Erweiterung | V2 |
| Pattern-Vergleich verschiedener Layouts | `projects-anlegen-vergleich.html` |

## Nächster Schritt

Implementation-Aufwand bis MVP V4:
- Komponenten extrahieren (HeroHeader, ValidationBanner, FormCard, RangeDatetimePicker, AddressBlock, ToggleSwitch, ActionBar mit Live-Validation) → ~6h
- Cmd+K Command-Palette (kann v1 ohne sein) → ~4h
- DB-Schema-Migration (siehe `cueplex-projects-datenmodell-2026-04-27.md`) → ~1d
- API + Frontend-Page → ~1d
- **Total V4-Implementation:** 2-3 Tage Coding nach Schema-Decision

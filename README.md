# Rootwise

Pflanzenpflege für Home Assistant mit echten Sensordaten.

Rootwise zeigt dir, welche Pflanze heute Wasser braucht und wie es ihr geht: Bodenfeuchte in Prozent, Temperatur, Luftfeuchte, Licht und Dünger, jeweils mit dem Zielbereich der Art. Gießen trägst du mit einem Tap ein. Später erkennt Rootwise das Gießen selbst, sagt das nächste voraus und prüft Fotos mit KI.

> **Status:** frühe Entwicklung (v0.2). Phasen: v0.2 Werte, Arten, Karten · v0.3 Gieß-Erkennung und Prognose · v0.4 Panel und Kalibrierung · v0.5 Fotos und KI · v0.6 Licht und Pflegeaufgaben · v1.0. Details in [PLAN.md](PLAN.md).

## Was Rootwise kann

### Pflanzen anlegen

*Einstellungen → Geräte & Dienste → Rootwise → Pflanze hinzufügen.* Je nach Einrichtung bietet Rootwise drei Wege an:

- **In OpenPlantbook suchen** (wenn die Integration [OpenPlantbook](https://github.com/Olen/home-assistant-openplantbook) eingerichtet ist): Art suchen, auswählen, fertig. Du bekommst Bild, deutschen Namen und Zielbereiche für Temperatur, Luftfeuchte, Licht und Dünger. Die Werte werden bei der Pflanze gespeichert; Rootwise braucht OpenPlantbook danach nicht mehr.
- **Aus Plant Monitor übernehmen**: Name, Raum, Art, Bild, die echten Sensoren und die Zielbereiche. Gibt es die Pflanze in Rootwise schon, werden beide **zusammengeführt**.
- **Ohne OpenPlantbook**: mit der eingebauten Artenliste.

Danach folgen Name und Bodensensor, weitere Sensoren (Rootwise schlägt sie vom Gerät des Bodensensors und aus dem Raum vor), die Zielbereiche und der Topf. Über *Pflanze ändern* kannst du die Art später auch aktualisieren.

### Pro Pflanze

Jede Pflanze ist ein eigenes Gerät mit:

- **Status**: alles gut, braucht Wasser, zu nass, Sensor offline, noch nicht gegossen. Mit Artbild und Begründung.
- **Messwerten als eigene Sensoren**, nur für zugeordnete Sensoren: Bodenfeuchte, Temperatur, Luftfeuchte, Licht, Dünger (Leitwert), Batterie. Jeder mit Zielbereich (`min`, `max`, Herkunft) und Bewertung (zu niedrig, passt, zu hoch).
- **Bodenfeuchte in fünf Stufen**: trocken · bald gießen · passt · nass, frisch gegossen · zu nass. Direkt nach dem Gießen ist nasse Erde normal und löst keinen Alarm aus; erst zwei Tage über der Schwelle gilt als „zu nass“.
- **Hinweise** wie „Luft zu trocken: 41 %, mindestens 50 %“. Sie erscheinen in Karte und Status, melden aber kein Problem. Ein Problem meldet nur die Bodenfeuchte.
- **Braucht Wasser**, **Problem**, **Zuletzt gegossen**, Knöpfe **Gegossen**, **Gedüngt**, **+1 Tag**, einstellbare Feuchte-Schwellen.

Ohne Bodensensor gilt ein Gieß-Intervall (Artwert, überschreibbar). Global gibt es **Pflanzen brauchen Wasser**, den **Urlaubsmodus** und die To-do-Liste **Pflanzenpflege**.

### Karten

Rootwise bringt zwei Karten mit. Sie werden automatisch geladen, du musst keine Ressource anlegen. Im Dashboard: *Bearbeiten → Karte hinzufügen →* „Rootwise“ suchen.

- **Rootwise Übersicht**: „Heute gießen“ mit einem Haken pro Pflanze (nochmal tippen nimmt es zurück), „Alle als gegossen eintragen“ und alle Pflanzen als Kacheln. Optional nach Raum gefiltert.
- **Rootwise Pflanze**: eine Pflanze mit Bild, Status, Bereichsbalken für alle Messwerte, Hinweisen und Verlauf.
  - **Gegossen** tippen trägt jetzt ein, mit 10 Sekunden **Rückgängig**.
  - **Lange drücken** oder das Menü `…` fragt nach der Zeit: gerade eben, vor ein paar Stunden, gestern, oder Datum und Uhrzeit.
  - Im Menü außerdem **Gedüngt** und **Sensor umgesteckt**.
  - Im **Verlauf** löschst du falsche Einträge (zweimal tippen). Admins dürfen alles löschen, andere nur ihre eigenen.

```yaml
type: custom:rootwise-overview-card
area_id: wohnzimmer    # optional
show_tiles: true
```

```yaml
type: custom:rootwise-plant-card
device_id: <Gerät der Pflanze>   # im visuellen Editor auswählen
show_history: true
```

Beide Karten folgen dem hellen oder dunklen Theme deines Dashboards und sprechen Deutsch oder Englisch.

### Reparaturen

Liest eine Pflanze einen **Spiegel-Sensor** (etwa die Kopie „Monstera Bodenfeuchtigkeit“ von Plant Monitor) statt des echten Sensors, meldet Rootwise das unter *Einstellungen → Reparaturen*. Ein Klick stellt auf den echten Sensor um. Spiegel-Sensoren stehen beim Anlegen gar nicht erst zur Wahl.

### Aktionen

`rootwise.log_care` (mit optionaler Zeit `when`, zum Nachtragen), `rootwise.snooze` und `rootwise.set_vacation` für Automationen, NFC-Tags oder Assist.

## Installation (HACS, benutzerdefiniertes Repository)

1. HACS → Menü oben rechts → *Benutzerdefinierte Repositories*
2. URL `https://github.com/michi-walchsi/ha-rootwise`, Kategorie **Integration**
3. Rootwise installieren, Home Assistant neu starten
4. *Einstellungen → Geräte & Dienste → Integration hinzufügen → Rootwise*
5. Bei Rootwise auf **Pflanze hinzufügen** klicken

Voraussetzung: Home Assistant 2026.9 oder neuer. Für die Artsuche zusätzlich die Integration OpenPlantbook mit eigenem Zugang.

## Umstieg von Plant Monitor

1. Jede Pflanze über **Pflanze hinzufügen → Aus Plant Monitor übernehmen** holen. Bereits vorhandene Rootwise-Pflanzen werden dabei zusammengeführt.
2. Eine offene Reparatur „liest Spiegel-Sensoren“ mit einem Klick beheben.
3. Die Rootwise-Karten ins Dashboard legen.
4. Ein bis zwei Wochen parallel laufen lassen und vergleichen.
5. Danach die flower-card aus den Dashboards entfernen und die Pflanzen in Plant Monitor löschen, zuletzt die Integration selbst. Die OpenPlantbook-Integration kann für die Artsuche bleiben.

## Bodenfeuchtesensor richtig einrichten

- **Platzierung:** Den Sensor senkrecht bis zur Markierung in die Wurzelzone stecken, nicht an den Topfrand. Nach dem Umstecken ändern sich die Werte; trag dann in der Karte **Sensor umgesteckt** ein.
- **Skala:** Der Sensor misst roh, und jeder Topf ist anders. Rootwise startet mit Richtwerten aus dem Gießstil der Art. Die Kalibrierung mit „trocken“ und „frisch gegossen“ kommt mit v0.4. Die Feuchtewerte von OpenPlantbook und Plant Monitor nutzt Rootwise bewusst nicht: Sie stammen von einer anderen Sensor-Skala.
- **Langzeitstatistik:** Rootwise braucht die Langzeitstatistik des Sensors (`state_class: measurement`). Zigbee2MQTT setzt das bei Bodenfeuchtesensoren automatisch. Die Messwert-Spiegel von Rootwise haben bewusst keine eigene Statistik und schreiben höchstens einmal pro Minute: Das schont die SD-Karte.
- **Empfohlene Sensoren:**
  - Feuchte: ThirdReality Soil Moisture (Zigbee)
  - Licht: ein Lux-Sensor pro Fenster, zum Beispiel Aqara Light Sensor T1 oder ESPHome mit VEML7700
  - Leitwert (optional): Mi Flora

## Echte Daten für die Gieß-Erkennung (v0.3)

Du brauchst **keine Helfer** mehr. Jeder Eintrag in Rootwise (Knopf, Karte, To-do, Aktion) landet im Journal, bei Einträgen für „jetzt“ mit der Bodenfeuchte in diesem Moment. Die Langzeitstatistik deines Sensors hält den Verlauf dauerhaft. Beides zusammen ist die Grundlage, um die Gieß-Erkennung an deinen echten Kurven einzustellen.

Wer die Daten selbst ansehen will, exportiert sie auf dem PC (sie bleiben lokal in `dev/data/`). Den Token legst du unter *Profil → Sicherheit → Langlebige Zugriffstokens* an:

```powershell
$env:HA_URL = "https://<dein-host>.ts.net"
$env:HA_TOKEN = "<Token>"
.venv\Scripts\python dev\tools\export_history.py --journal
```

## Foto-Check vorbereiten: Google Gemini (für v0.5)

Der Foto-Check nutzt die KI, die du in Home Assistant einrichtest. Rootwise speichert selbst keinen Schlüssel.

1. Unter [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) einen API-Schlüssel erstellen. Dafür brauchst du ein Google-Konto ab 18; die Gratis-Stufe reicht.
2. In Home Assistant die Integration **Google Gemini** hinzufügen und den Schlüssel einfügen.
3. Bei der Integration eine **KI-Aufgabe** (AI Task) hinzufügen: einmal mit einem Flash-Modell (bessere Qualität, ca. 20 Anfragen pro Tag) und einmal mit Flash-Lite (ca. 500 pro Tag).

**Datenschutz:** Für Nutzer in der EU gelten auch in der Gratis-Stufe die Datenregeln der Bezahl-Stufe: Google trainiert nicht mit deinen Anfragen. Hochgeladene Fotos liegen bis zu 48 Stunden bei Google.

## Datenschutz

Rootwise arbeitet lokal.

- Die Artsuche läuft über deine OpenPlantbook-Integration und nur, während du eine Pflanze anlegst oder änderst. Das Artbild lädt dein Browser direkt von OpenPlantbook.
- Die KI-Funktionen (ab v0.5) laufen ausschließlich über eine KI, die du in Home Assistant selbst einrichtest, zum Beispiel Google Gemini. Sie brauchen eine ausdrückliche Einwilligung.

**Hinweis:** Ist dein Home Assistant öffentlich erreichbar, etwa über Tailscale Funnel, gilt das auch für jede Integration. Stell den Fernzugriff besser auf „nur Tailnet“ und aktiviere 2FA.

## Entwicklung

```bash
uv venv --python 3.14 .venv
uv pip install -r requirements_test.txt
.venv/Scripts/python -m pytest
```

Karten (`frontend/`, Lit und TypeScript):

```bash
cd frontend
npm ci
npm test && npm run lint && npm run typecheck
npm run build      # schreibt custom_components/rootwise/www/
npm run sandbox    # Karten mit Beispieldaten, hell und dunkel, auf http://localhost:5199
```

Den Build immer mit einchecken; die CI prüft, dass er aktuell ist. Die Tests mit Home-Assistant-Fixture laufen in GitHub Actions unter Linux. Unter Windows helfen die Stubs in `tests/conftest.py`.

## Lizenz

MIT

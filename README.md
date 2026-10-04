# Rootwise

Pflanzenpflege für Home Assistant mit echten Sensordaten.

Rootwise zeigt dir, welche Pflanze heute Wasser braucht und wie es ihr geht: Bodenfeuchte in Prozent, Temperatur, Luftfeuchte, Licht und Dünger, jeweils mit dem Zielbereich der Art. Es erkennt das Gießen am Sensor selbst, lernt, wann du gießt, sagt das nächste Gießen voraus und erinnert dich am Handy. Im Panel **Pflanzen** siehst du den Feuchteverlauf, sammelst Fotos jeder Pflanze und kalibrierst den Sensor. Ab v0.5 prüft eine KI die Fotos.

> **Status:** frühe Entwicklung (v0.4). Phasen: v0.2 Werte, Arten, Karten ✓ · v0.3 Gieß-Erkennung, Prognose, Benachrichtigungen ✓ · v0.4 Panel, Fotos, Kalibrierung ✓ · v0.5 KI-Foto-Check und Arterkennung · v0.6 Licht und Pflegeaufgaben · v1.0. Details in [PLAN.md](PLAN.md).

## Was Rootwise kann

### Panel „Pflanzen“

Nach der Installation erscheint in der Seitenleiste **Pflanzen**.

- **Übersicht:** „Heute gießen“ zum Abhaken und alle Pflanzen als Kacheln mit Titelbild. Der Ring ums Bild zeigt den Status, die Zeile darunter sagt ihn in Worten. Oben filterst du nach Raum.
- **Pflanzenseite** (Kachel antippen):
  - Titelbild und alle Werte und Knöpfe der Pflanzen-Karte
  - **Feuchteverlauf** über 14 oder 30 Tage, mit Zielband, Gieß-Markern und der Prognose samt Zeitfenster. Antippen zeigt den Wert zu jeder Zeit.
  - **Fotos**, **Kalibrierung**, der **Topf** mit Gießmenge (etwa „ca. 350–600 ml, bis unten Wasser austritt“) und die **Art** mit Gießweise, Licht, Düngen und Giftigkeit für Katzen, Hunde und Kinder.
- **Pflanze hinzufügen** (nur Admins, Knopf **+ Pflanze**), siehe unten.

Alle Benutzer sehen das Panel und dürfen Pflege eintragen und Fotos hinzufügen. Pflanzen anlegen und kalibrieren dürfen nur Admins.

### Pflanzen anlegen

**Im Panel** (am schnellsten, auch am Handy): *Pflanzen → + Pflanze.* Jeder Schritt lässt sich überspringen:

1. **Foto:** wird das Titelbild.
2. **Art:** aus OpenPlantbook (wenn die Integration eingerichtet ist) oder aus der eingebauten Artenliste. Ohne Art startet Rootwise mit mittleren Werten und lernt aus deinem Gießen.
3. **Name und Raum.**
4. **Sensoren:** Rootwise schlägt sie nach Raum und Messart vor, mit den aktuellen Werten. Noch freie Geräte stehen oben.
5. **Topf:** Größe, Material, Fenster, Standort, Abzugsloch.
6. **Fertig:** Rootwise liest sofort die letzten 60 Tage des Bodensensors, findet frühere Gießrunden und hat damit gleich eine Prognose. Hast du gerade gegossen, startest du hier die Kalibrierung.

**In den Einstellungen**: *Einstellungen → Geräte & Dienste → Rootwise → Pflanze hinzufügen.* Hier gibt es zusätzlich:

- **In OpenPlantbook suchen** (wenn die Integration [OpenPlantbook](https://github.com/Olen/home-assistant-openplantbook) eingerichtet ist). Du bekommst Bild, deutschen Namen und Zielbereiche für Temperatur, Luftfeuchte, Licht und Dünger. Die Werte werden bei der Pflanze gespeichert; Rootwise braucht OpenPlantbook danach nicht mehr.
- **Aus Plant Monitor übernehmen**: Name, Raum, Art, Bild, die echten Sensoren und die Zielbereiche. Gibt es die Pflanze in Rootwise schon, werden beide **zusammengeführt**.
- **Ohne OpenPlantbook** mit der eingebauten Artenliste.

Über *Pflanze ändern* passt du Sensoren, Zielbereiche und Topf an und aktualisierst die Art.

### Pro Pflanze

Jede Pflanze ist ein eigenes Gerät mit:

- **Status**: alles gut, braucht Wasser, zu nass, Sensor offline, noch nicht gegossen. Mit Bild und Begründung.
- **Messwerten als eigene Sensoren**, nur für zugeordnete Sensoren: Bodenfeuchte, Temperatur, Luftfeuchte, Licht, Dünger (Leitwert), Batterie. Jeder mit Zielbereich (`min`, `max`, Herkunft) und Bewertung (zu niedrig, passt, zu hoch).
- **Bodenfeuchte in fünf Stufen**: trocken · bald gießen · passt · nass, frisch gegossen · zu nass. Direkt nach dem Gießen ist nasse Erde normal und löst keinen Alarm aus; erst zwei Tage über der Schwelle gilt als „zu nass“.
- **Hinweise** wie „Luft zu trocken: 41 %, mindestens 50 %“. Sie erscheinen in Karte und Status, melden aber kein Problem. Ein Problem meldet nur die Bodenfeuchte.
- **Braucht Wasser**, **Problem**, **Zuletzt gegossen**, Knöpfe **Gegossen**, **Gedüngt**, **+1 Tag** und einstellbare Feuchte-Schwellen.
- **Nächstes Gießen** als Zeitpunkt, mit Zeitfenster, Sicherheit und Austrocknung pro Tag.
- **Foto**: das Titelbild als Bild-Entität, etwa für eigene Dashboards.

Ohne Bodensensor gilt ein Gieß-Intervall: erst der Artwert, nach drei eingetragenen Gießrunden dein übliches Intervall (überschreibbar). Global gibt es **Pflanzen brauchen Wasser**, den **Urlaubsmodus**, die To-do-Liste **Pflanzenpflege** und den Kalender **Pflanzenpflege** (nächste Gießtermine, darunter alles Eingetragene).

### Gießen erkennen, lernen, vorhersagen

- **Erkennen:** Steigt die Bodenfeuchte innerhalb von Minuten deutlich (mindestens 8 Punkte) und bleibt eine Stunde später oben, trägt Rootwise „Gegossen (erkannt)“ ins Journal ein, mit dem Wert davor und danach. Hast du selbst schon eingetragen, gibt es keinen zweiten Eintrag. Beim ersten Start liest Rootwise dazu die letzten 60 Tage aus dem Recorder.
- **„War ich nicht“:** Ein falsch erkannter Eintrag lässt sich in der Karte oder direkt im Push zurückweisen. Er kommt dann nicht wieder.
- **Lernen:** Nach zwei Gießrunden kennt Rootwise deinen Sensor und deinen Topf. Die Trocken-Schwelle ist dann der Wert, bei dem du gießt, die Nass-Schwelle liegt 10 Punkte über dem Wert nach dem Abtropfen. Gelernte Schwellen ersetzen die Artwerte. Hast du selbst Schwellen eingestellt, gelten deine, und die Karte bietet die gelernten zum Übernehmen an.
- **Vorhersagen:** Aus dem Austrocknen der letzten Tage berechnet Rootwise, wann die Trocken-Schwelle erreicht ist. Die Rechnung ist robust gegen Tagesschwankungen und lässt die Stunden direkt nach dem Gießen weg. Je mehr Gießrunden bekannt sind, desto enger wird das Zeitfenster.

### Kalibrieren

Ein Bodensensor misst roh, und jeder Topf ist anders: In einem echten Topf hieß „trocken genug“ etwa 60 % und „frisch gegossen“ etwa 78 %. Nach der Kalibrierung heißt **0 % richtig trocken** und **100 % frisch gegossen und abgetropft**. Admins öffnen dazu auf der Pflanzenseite **Kalibrieren**:

1. **Trocken:** Ist die Erde auch 5 cm tief trocken, speicherst du den aktuellen Wert als 0 %.
2. **Nass:** Gieße durchdringend, bis unten Wasser austritt, und tippe **Ich habe gegossen**. Rootwise trägt das Gießen ein, wartet zwei Stunden aufs Abtropfen und misst dann vier Stunden lang. Der Mittelwert (Median) ist 100 %, die sogenannte Feldkapazität. Den kurzen Spitzenwert direkt nach dem Gießen nimmt Rootwise bewusst nicht.

Kennt Rootwise schon Gießrunden, bietet es einen **Vorschlag aus deinen Daten** zum Übernehmen an. Danach folgen die Schwellen dem Gießstil der Art, etwa „Gießen unter 15 % · zu nass über 80 %“ bei Pflanzen, die oben 3–5 cm antrocknen sollen. Karten und Panel zeigen die kalibrierten Prozent und darunter den Rohwert. Es gilt diese Reihenfolge: eigene Schwellen, dann die Kalibrierung, dann gelernte Schwellen, dann die Artwerte.

Die Kalibrierung gehört zum Sensor. Trägst du danach **Sensor umgesteckt** oder **Umgetopft** ein, empfiehlt Rootwise, neu zu kalibrieren.

### Fotos

Auf der Pflanzenseite unter **Fotos** oder mit dem Knopf **Foto** in der Karte:

- **Kamera** zeigt ein Livebild. Das geht nur, wenn du Home Assistant über HTTPS öffnest, siehe unten.
- **Galerie** geht immer. Ohne HTTPS nimmst du das Foto vorher mit der Kamera-App auf und wählst es hier aus.

Das Foto wird schon im Browser auf höchstens 1600 Pixel verkleinert, und Home Assistant speichert es noch einmal neu ab. Standort, Kameradaten und andere Metadaten fallen dabei weg. HEIC-Fotos (iPhone) kann der Browser nicht lesen; stell die Kamera dann auf „Maximale Kompatibilität“.

Die Fotos liegen unter `/media/rootwise/<Pflanze>/` und erscheinen auch unter *Medien → Meine Medien*. Rootwise liefert sie nur an angemeldete Benutzer aus. Im Fotoverlauf siehst du jedes Foto im Vollbild, wählst das **Titelbild** (sonst gilt das neueste) und löschst einzelne Fotos. Wird eine Pflanze gelöscht, verschiebt Rootwise ihre Fotos nach `/media/rootwise/_archive/`. Sichere `/media` in deinen Backups mit, wenn dir die Fotos wichtig sind.

**Live-Kamera und HTTPS:** Browser geben die Kamera nur über HTTPS frei. Nutzt die Companion-App zu Hause eine Adresse wie `http://homeassistant.local:8123`, geht dort nur die Galerie. Für die Live-Kamera trägst du in der App bei deinem Server als interne Adresse eine HTTPS-Adresse ein. Mit Tailscale ist das zum Beispiel `https://<dein-host>.ts.net` über Tailscale Serve, ohne Funnel; Tailscale muss dann auch am Handy laufen. Unterwegs, über eine HTTPS-Adresse, geht die Live-Kamera ohnehin. Wer zu Hause unabhängig vom Internet bleiben will, lässt die interne Adresse auf http und nimmt dort die Galerie.

### Karten

Rootwise bringt zwei Karten mit. Sie werden automatisch geladen, du musst keine Ressource anlegen. Im Dashboard: *Bearbeiten → Karte hinzufügen →* „Rootwise“ suchen.

- **Rootwise Übersicht**: „Heute gießen“ mit einem Haken pro Pflanze (nochmal tippen nimmt es zurück) und der Gießmenge, „Alle als gegossen eintragen“ und alle Pflanzen als Kacheln mit Titelbild. Optional nach Raum gefiltert. Eine Kachel öffnet die Pflanzenseite im Panel.
- **Rootwise Pflanze**: eine Pflanze mit Titelbild, Status, Bereichsbalken für alle Messwerte, Hinweisen, einem kleinen **14-Tage-Chart** und dem Verlauf. Tippen auf den Namen öffnet die Pflanzenseite.
  - **Gegossen** tippen trägt jetzt ein, mit 10 Sekunden **Rückgängig**.
  - **Lange drücken** oder das Menü `…` fragt nach der Zeit: gerade eben, vor ein paar Stunden, gestern, oder Datum und Uhrzeit.
  - **Foto** nimmt ein Foto auf oder wählt eines aus der Galerie.
  - Im Menü außerdem **Gedüngt**, **Umgetopft** und **Sensor umgesteckt**.
  - Im **Verlauf** löschst du falsche Einträge (zweimal tippen). Admins dürfen alles löschen, andere nur ihre eigenen.

```yaml
type: custom:rootwise-overview-card
area_id: wohnzimmer    # optional
show_tiles: true
```

```yaml
type: custom:rootwise-plant-card
device_id: <Gerät der Pflanze>   # im visuellen Editor auswählen
show_chart: true
show_history: true
```

Beide Karten folgen dem hellen oder dunklen Theme deines Dashboards und sprechen Deutsch oder Englisch. In schmalen Spalten rücken die Knöpfe zusammen und die Balken bekommen eine eigene Zeile.

### Benachrichtigungen

Unter *Einstellungen → Geräte & Dienste → Rootwise → Konfigurieren* wählst du die Handys (Home-Assistant-App) und die Uhrzeit der Tagesübersicht. Dann kommen:

- **Tagesübersicht** (Standard 8:00): welche Pflanzen heute Wasser brauchen, mit den Knöpfen **Gegossen ✓** und **+1 Tag**.
- **Gießen erkannt**: kurz nach dem Gießen, mit **War ich nicht** (abschaltbar).
- **Kritische Warnungen**: tagelang zu nass oder sehr trocken (10 Punkte unter der Trocken-Schwelle). Sie kommen sofort, auch in der Ruhezeit und im Urlaub, höchstens alle 12 Stunden.

In der Ruhezeit (Standard 22–7 Uhr) und im Urlaubsmodus gibt es keine Tagesübersicht und keine Bestätigungen. Die Knöpfe in einem Push funktionieren nur einmal und nur für Benutzer, deren Handy ausgewählt ist.

### Reparaturen

- Liest eine Pflanze einen **Spiegel-Sensor** (etwa die Kopie „Monstera Bodenfeuchtigkeit“ von Plant Monitor) statt des echten Sensors, meldet Rootwise das unter *Einstellungen → Reparaturen*. Ein Klick stellt auf den echten Sensor um. Spiegel-Sensoren stehen beim Anlegen gar nicht erst zur Wahl.
- Meldet sich ein **Bodensensor 12 Stunden** lang nicht (oder ist er nicht verfügbar), kommt ein Hinweis mit Tipps und einem Knopf zu den Pflanzen-Einstellungen. Er verschwindet von selbst, sobald wieder Werte kommen. Sensoren, die nur bei Änderung melden, dürfen dabei mehrere Stunden still sein.

### Aktionen

- `rootwise.log_care` trägt Pflege ein, mit optionaler Zeit `when` zum Nachtragen.
- `rootwise.snooze` schiebt das Gießen auf, `rootwise.set_vacation` schaltet den Urlaubsmodus (nur Admins). Beide eignen sich für Automationen, NFC-Tags oder Assist.
- `rootwise.upload_photo` speichert ein Foto zur Pflanze: eine Datei (`file_path`, etwa unter `/media`; andere Ordner nur, wenn sie in `allowlist_external_dirs` stehen) oder ein Schnappschuss einer Kamera (`camera`), dazu optional eine Notiz.

Bei jedem erkannten Gießen feuert das Ereignis `rootwise_watering_detected` (Pflanze, Wert davor und danach).

## Installation (HACS, benutzerdefiniertes Repository)

1. HACS → Menü oben rechts → *Benutzerdefinierte Repositories*
2. URL `https://github.com/michi-walchsi/ha-rootwise`, Kategorie **Integration**
3. Rootwise installieren, Home Assistant neu starten
4. *Einstellungen → Geräte & Dienste → Integration hinzufügen → Rootwise*
5. In der Seitenleiste **Pflanzen** öffnen und **+ Pflanze** tippen

Voraussetzung: Home Assistant 2026.9 oder neuer. Für die Artsuche zusätzlich die Integration OpenPlantbook mit eigenem Zugang.

## Umstieg von Plant Monitor

1. Jede Pflanze über **Pflanze hinzufügen → Aus Plant Monitor übernehmen** holen (in den Einstellungen). Bereits vorhandene Rootwise-Pflanzen werden dabei zusammengeführt.
2. Eine offene Reparatur „liest Spiegel-Sensoren“ mit einem Klick beheben.
3. Die Rootwise-Karten ins Dashboard legen.
4. Ein bis zwei Wochen parallel laufen lassen und vergleichen.
5. Danach die flower-card aus den Dashboards entfernen und die Pflanzen in Plant Monitor löschen, zuletzt die Integration selbst. Die OpenPlantbook-Integration kann für die Artsuche bleiben.

## Bodenfeuchtesensor richtig einrichten

- **Platzierung:** Den Sensor senkrecht bis zur Markierung in die Wurzelzone stecken, nicht an den Topfrand. Nach dem Umstecken ändern sich die Werte; trag dann in der Karte **Sensor umgesteckt** ein.
- **Skala:** Der Sensor misst roh, und jeder Topf ist anders. Deshalb startet Rootwise mit Richtwerten aus dem Gießstil der Art, lernt nach zwei Gießrunden die echten Werte und rechnet nach der **Kalibrierung** (siehe oben) in echte Prozent um. Die Feuchtewerte von OpenPlantbook und Plant Monitor nutzt Rootwise bewusst nicht: Sie stammen von einer anderen Sensor-Skala.
- **Langzeitstatistik:** Rootwise braucht die Langzeitstatistik des Sensors (`state_class: measurement`), um vergangene Gießrunden zu finden und den Verlauf zu zeichnen. Zigbee2MQTT setzt das bei Bodenfeuchtesensoren automatisch. Die Messwert-Spiegel von Rootwise haben bewusst keine eigene Statistik und schreiben höchstens einmal pro Minute: Das schont die SD-Karte.
- **Empfohlene Sensoren:**
  - Feuchte: ThirdReality Soil Moisture (Zigbee)
  - Licht: ein Lux-Sensor pro Fenster, zum Beispiel Aqara Light Sensor T1 oder ESPHome mit VEML7700
  - Leitwert (optional): Mi Flora

## Daten selbst ansehen und nachrechnen

Du brauchst **keine Helfer**. Jeder Eintrag in Rootwise (Knopf, Karte, Panel, To-do, Push, Aktion, erkannt) landet im Journal, die Langzeitstatistik deines Sensors hält den Verlauf dauerhaft.

Wer die Daten selbst ansehen will, exportiert sie auf dem PC (sie bleiben lokal in `dev/data/`) und spielt Erkennung und Prognose darauf nach. Den Token legst du unter *Profil → Sicherheit → Langlebige Zugriffstokens* an:

```powershell
$env:HA_URL = "https://<dein-host>.ts.net"
$env:HA_TOKEN = "<Token>"
.venv/Scripts/python dev/tools/export_history.py --journal
.venv/Scripts/python dev/tools/backtest.py sensor.<dein_bodenfeuchtesensor>
```

Der Backtest zeigt die gefundenen Gießrunden neben dem Journal, die gelernten Schwellen, das Austrocknen pro Runde und wie weit die Prognose bei 25, 50 und 75 % jeder Runde danebengelegen hätte.

## Foto-Check vorbereiten: Google Gemini (für v0.5)

Der Foto-Check in v0.5 beschreibt, was auf dem Foto zu sehen ist, und verbindet es mit den Sensordaten. Er nutzt die KI, die du in Home Assistant einrichtest; Rootwise speichert selbst keinen Schlüssel.

1. Unter [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) einen API-Schlüssel erstellen. Dafür brauchst du ein Google-Konto ab 18; die Gratis-Stufe reicht.
2. In Home Assistant die Integration **Google Gemini** hinzufügen und den Schlüssel einfügen.
3. Bei der Integration zwei **KI-Aufgaben** (AI Task) hinzufügen: eine mit einem Flash-Modell (bessere Qualität, ca. 20 Anfragen pro Tag) und eine mit Flash-Lite (ca. 500 pro Tag). Rootwise wird zuerst die erste nehmen und bei erreichtem Limit auf die zweite ausweichen.
4. Unter *Entwicklerwerkzeuge → Aktionen* testen: `ai_task.generate_data` mit einer der beiden Entitäten und einer kurzen Frage. Kommt eine Antwort, ist alles bereit.

**Datenschutz:** Für Nutzer in der EU gelten auch in der Gratis-Stufe die Datenregeln der Bezahl-Stufe: Google trainiert nicht mit deinen Anfragen. Hochgeladene Fotos liegen bis zu 48 Stunden bei Google. Rootwise schickt erst etwas, wenn du in den Optionen ausdrücklich einwilligst (ab v0.5).

## Datenschutz

Rootwise arbeitet lokal.

- Fotos bleiben auf deinem Home Assistant, ohne Standort- und Kameradaten, und sind nur für angemeldete Benutzer abrufbar.
- Die Artsuche läuft über deine OpenPlantbook-Integration und nur, während du eine Pflanze anlegst oder änderst. Das Artbild lädt dein Browser direkt von OpenPlantbook.
- Die KI-Funktionen (ab v0.5) laufen ausschließlich über eine KI, die du in Home Assistant selbst einrichtest, zum Beispiel Google Gemini. Sie brauchen eine ausdrückliche Einwilligung.

**Hinweis:** Ist dein Home Assistant öffentlich erreichbar, etwa über Tailscale Funnel, gilt das auch für jede Integration. Stell den Fernzugriff besser auf „nur Tailnet“ (Tailscale Serve) und aktiviere 2FA.

## Entwicklung

```bash
uv venv --python 3.14 .venv
uv pip install -r requirements_test.txt
.venv/Scripts/python -m pytest
```

Karten und Panel (`frontend/`, Lit und TypeScript):

```bash
cd frontend
npm ci
npm test && npm run lint && npm run typecheck
npm run build      # schreibt custom_components/rootwise/www/
npm run sandbox    # Beispieldaten, hell und dunkel: Karten auf http://localhost:5199, Panel auf /panel.html
```

Den Build immer mit einchecken; die CI prüft, dass er aktuell ist. Die Tests mit Home-Assistant-Fixture laufen in GitHub Actions unter Linux. Unter Windows helfen die Stubs in `tests/conftest.py`.

## Lizenz

MIT

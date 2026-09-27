# Changelog

Format nach [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), Versionen nach [SemVer](https://semver.org/lang/de/).

## [Unreleased]

## [0.2.0] - 2026-09-27 (Werte, Arten, Karten)

### Neu
- **Messwerte als eigene Sensoren** pro Pflanze (Bodenfeuchte, Temperatur, Luftfeuchte, Licht, Dünger, Batterie) mit Zielbereich, Herkunft des Bereichs und Bewertung „zu niedrig / passt / zu hoch“. Ohne `state_class` und höchstens ein Schreibvorgang pro Minute, um die SD-Karte zu schonen.
- **Bodenfeuchte in fünf Stufen**: trocken, bald gießen, passt, nass – frisch gegossen, zu nass. Nasse Erde direkt nach dem Gießen ist kein Alarm mehr.
- **Hinweise** zu Klima und Batterie (etwa „Luft zu trocken“), ohne ein Problem zu melden. Der Status zeigt das Artbild.
- **Artsuche über OpenPlantbook** beim Anlegen und Ändern (über die OpenPlantbook-Integration): Bild, deutscher Name und Zielbereiche werden bei der Pflanze gespeichert. Neuer Schritt „Zielbereiche“.
- **Import aus Plant Monitor**, bei vorhandener Pflanze als Zusammenführen: echte Sensoren statt Spiegel, Art, Bild, Zielbereiche.
- **Spiegel-Sensoren** (Plant Monitor, Rootwise) werden erkannt: nicht mehr wählbar, beim Ändern durch den echten Sensor ersetzt, und als **Reparatur** mit Ein-Klick-Lösung gemeldet.
- **Karten** „Rootwise Übersicht“ (heute gießen zum Abhaken, alle Pflanzen als Kacheln) und „Rootwise Pflanze“ (Bereichsbalken, Gegossen mit Rückgängig, Zeit nachtragen per langem Drücken, Verlauf mit Löschen). Automatisch geladen, mit visuellem Editor, hell und dunkel, Deutsch und Englisch.
- **WebSocket-API** für die Karten: Pflanzen abonnieren, Pflege eintragen (auch nachträglich), Einträge löschen (Admins alle, andere nur eigene), Journal lesen.
- Pflegeart **Sensor umgesteckt**. Journal-Einträge speichern, wer sie angelegt hat, und bei Einträgen für „jetzt“ die Bodenfeuchte.
- Export-Werkzeug: `--journal` exportiert das Pflege-Journal; ohne Sensorangabe werden alle Bodensensoren der Pflanzen exportiert. Helfer-Tasten sind nicht mehr nötig.

### Geändert
- Nicht mehr benötigte Entitäten (etwa nach dem Entfernen eines Sensors) werden beim Laden aufgeräumt.
- Die Aktion `rootwise.log_care` lehnt Zeiten in der Zukunft ab.

### Behoben
- Raumsensoren wurden nicht vorgeschlagen, wenn eine Pflanze keinen Bodensensor hat.
- Nachgetragene Einträge wurden nach Text statt nach Zeit sortiert, wenn sie mit Zeitzone kamen.

## [0.1.0] - 2026-09-27 (Phase 1: Fundament)

### Neu
- Integration mit Haupteintrag, Optionen und Unterpunkt „Pflanze“ (anlegen, ändern, löschen)
- Pflanze anlegen in drei Schritten; weitere Sensoren werden vom Gerät des Bodensensors und aus dem Raum vorgeschlagen (Temperatur, Luftfeuchte, Licht, Leitwert, Batterie)
- Pro Pflanze ein Gerät mit Status, „Braucht Wasser“, „Problem“, „Zuletzt gegossen“, Knöpfen und Feuchte-Schwellen
- Gieß-Intervall für Pflanzen ohne Bodensensor
- Urlaubsmodus, Zähler „Pflanzen brauchen Wasser“, To-do-Liste „Pflanzenpflege“
- Aktionen `log_care`, `snooze`, `set_vacation` (Urlaub nur für Admins)
- Offline-Artenliste mit 10 Zimmerpflanzen inklusive Giftigkeit
- Diagnose-Download
- Export-Werkzeug für echte Sensordaten und ein Testskript für KI-Aufgaben

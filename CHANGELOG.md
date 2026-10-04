# Changelog

Format nach [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), Versionen nach [SemVer](https://semver.org/lang/de/).

## [Unreleased]

## [0.4.0] - 2026-10-04 (Panel, Fotos, Kalibrierung)

### Neu
- **Panel „Pflanzen“** in der Seitenleiste:
  - Übersicht mit „Heute gießen“, Kacheln mit Titelbild und Filter nach Raum.
  - Eine Seite pro Pflanze mit allen Werten und dem **Feuchteverlauf** über 14 oder 30 Tage: Zielband, Gieß-Marker, Prognose mit Zeitfenster, Werte beim Antippen.
  - Dazu Fotos, Kalibrierung, der Topf mit **Gießmenge** (etwa „ca. 350–600 ml“) und Artinfos: Gießweise, Licht, Düngen, Giftigkeit für Katzen, Hunde und Kinder.
- **Pflanze hinzufügen im Panel** (Admins) in sechs Schritten:
  - Foto, Art (OpenPlantbook oder Offline-Liste), Name und Raum.
  - Sensoren mit aktuellen Werten, vorgeschlagen nach Raum und Messart, freie Geräte zuerst.
  - Topf, dann fertig: Rootwise liest sofort die letzten 60 Tage des Bodensensors.
- **Fotos** pro Pflanze:
  - Aufnahme mit Live-Kamera (nur über HTTPS) oder aus der Galerie.
  - Höchstens 1600 px, ohne Standort- und Kameradaten, gespeichert unter `/media/rootwise/` und nur für angemeldete Benutzer abrufbar.
  - Fotoverlauf mit Vollbild, Titelbild wählen, löschen. Fotos gelöschter Pflanzen kommen ins Archiv.
  - Neue Bild-Entität **Foto** pro Pflanze und Aktion `rootwise.upload_photo` (Datei oder Kamera-Schnappschuss).
- **Kalibrier-Assistent** (Admins):
  - „Erde ist jetzt richtig trocken“ ergibt 0 %. Nach dem durchdringenden Gießen misst Rootwise 2–6 Stunden danach die Feldkapazität als 100 %.
  - Alternativ übernimmst du den Vorschlag aus deinen Gießrunden.
  - Die Schwellen folgen dann dem Gießstil der Art. Karten und Panel zeigen kalibrierte Prozent und den Rohwert darunter.
  - Nach „Sensor umgesteckt“ oder „Umgetopft“ empfiehlt Rootwise, neu zu kalibrieren.
- **Pflanzen-Karte:** kleiner 14-Tage-Chart (im Editor abschaltbar), Knopf **Foto** und dein Titelbild statt des Artbilds. Tippen auf den Namen öffnet die Pflanzenseite. Im Menü neu: **Umgetopft**.
- **Übersichts-Karte:** Kacheln mit Titelbild und Status als Ring; Gießmenge bei „Heute gießen“; Tippen öffnet die Pflanzenseite.
- Anleitung im README: Google Gemini für den Foto-Check in v0.5 vorbereiten.

### Geändert
- Schwellen gelten in dieser Reihenfolge: eigene, kalibrierte, gelernte, Artwerte.
- In schmalen Spalten bleiben alle Knöpfe der Pflanzen-Karte sichtbar, und die Balken bekommen eine eigene Zeile.

## [0.3.1] - 2026-10-04

### Behoben
- **Karten in der Companion-App**: Am Handy zeigten die Rootwise-Karten „Konfigurationsfehler – Custom element doesn't exist“. Home Assistant tauscht beim Start die Liste der eigenen Elemente gegen eine neue aus. Die Karten laden parallel dazu und waren auf dem Handy oft schneller, sodass sie in der alten Liste landeten, die Home Assistant danach nicht mehr liest. Die Karten melden sich jetzt erst an, wenn Home Assistant gestartet ist.

## [0.3.0] - 2026-10-03 (Gieß-Erkennung, Prognose, Benachrichtigungen)

### Neu
- **Gieß-Erkennung** aus den Sensordaten: deutlicher Anstieg (mindestens 8 Punkte) innerhalb von Minuten, der eine Stunde später noch hält. Rootwise trägt „Gegossen (erkannt)“ mit dem Wert davor und danach ins Journal ein, liest beim Start die letzten 60 Tage aus dem Recorder und verdoppelt nichts, was du schon eingetragen hast. Ereignis `rootwise_watering_detected`.
- **„War ich nicht“** für erkannte Einträge in Karte und Push; zurückgewiesene Einträge kommen nicht wieder.
- **Gelernte Schwellen** nach zwei Gießrunden: trocken = wo du gießt, nass = Wert nach dem Abtropfen + 10. Sie ersetzen die Artwerte; eigene Schwellen haben Vorrang, die Karte bietet die gelernten zum Übernehmen an.
- **Gelerntes Intervall** für Pflanzen ohne Sensor nach drei Gießrunden.
- Sensor **„Nächstes Gießen“** pro Pflanze: Trend der letzten Tage mit Zeitfenster, Sicherheit und Austrocknung pro Tag, sonst letztes Gießen plus Intervall.
- **Benachrichtigungen** an die Companion-App: Tagesübersicht mit „Gegossen“ und „+1 Tag“, „Gießen erkannt“ mit „War ich nicht“, kritische Warnungen (tagelang zu nass, sehr trocken) sofort und höchstens alle 12 Stunden. Ruhezeit und Urlaub werden beachtet; Knöpfe gelten nur einmal und nur für Benutzer der ausgewählten Handys.
- Kalender **Pflanzenpflege** mit den nächsten Gießterminen und allem Eingetragenen.
- **Reparatur**, wenn ein Bodensensor 12 Stunden offline ist, mit Sprung in die Pflanzen-Einstellungen.
- Karten: Zeile „Nächstes Gießen“ mit Zeitfenster, Hinweis auf gelernte Schwellen, erkannte Einträge im Verlauf, Prognose in den Kacheln.
- Backtest-Werkzeug `dev/tools/backtest.py` für Erkennung und Prognose auf exportierten Daten.

### Geändert
- Die Optionen enthalten jetzt Handys, Tagesübersicht, Bestätigungs-Pushes und Ruhezeit.

## [0.2.1] - 2026-10-03

### Behoben
- **Kein falsches „Sensor offline“ mehr**: Bodensensoren, die nur bei Änderung melden, schweigen bei stabilem Wert mehrere Stunden (gemessen: bis 3,5 h). Rootwise hielt sie schon nach 3 Stunden für offline. Jetzt erst nach 12 Stunden ohne Meldung; meldet die Integration den Sensor als „nicht verfügbar“, gilt er weiterhin sofort als offline.

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

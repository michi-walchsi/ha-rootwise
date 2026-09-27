# Changelog

Format nach [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), Versionen nach [SemVer](https://semver.org/lang/de/).

## [Unreleased]

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

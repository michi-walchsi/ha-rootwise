# Rootwise

Pflanzenpflege für Home Assistant mit echten Sensordaten.

Rootwise zeigt dir, welche Pflanze heute Wasser braucht. Du trägst das Gießen mit einem Tap ein oder lässt es automatisch erkennen. Später sagt Rootwise das nächste Gießen voraus und prüft Fotos mit KI.

> **Status:** frühe Entwicklung (v0.1). Phase 1 von 6, siehe [PLAN.md](PLAN.md).

## Was Phase 1 kann

- Pflanzen anlegen: unter *Einstellungen → Geräte & Dienste → Rootwise → Pflanze hinzufügen*. Das geht in drei kurzen Schritten:
  1. Name, Art, Raum und Bodensensor
  2. Weitere Sensoren: Temperatur, Luftfeuchte, Licht, Leitwert und Batterie. Rootwise schlägt sie vom Gerät des Bodensensors und aus dem Raum vor.
  3. Topf und Standort
- Jede Pflanze ist ein eigenes Gerät mit:
  - **Status**: ok, durstig, zu nass, Sensor offline
  - **Braucht Wasser** und **Problem** (binäre Sensoren)
  - **Zuletzt gegossen**
  - Knöpfen **Gegossen**, **Gedüngt** und **+1 Tag**
  - einstellbaren Feuchte-Schwellen
- Ohne Bodensensor gilt ein Gieß-Intervall (Artwert, überschreibbar).
- Global:
  - **Pflanzen brauchen Wasser** (Anzahl)
  - Schalter **Urlaubsmodus**
  - To-do-Liste **Pflanzenpflege** mit den heute fälligen Pflanzen. Abhaken trägt das Gießen ein, Löschen verschiebt um einen Tag.
- Aktionen `rootwise.log_care`, `rootwise.snooze` und `rootwise.set_vacation` für Automationen, NFC-Tags oder Assist.

## Installation (HACS, benutzerdefiniertes Repository)

1. HACS → Menü oben rechts → *Benutzerdefinierte Repositories*
2. URL `https://github.com/michi-walchsi/ha-rootwise`, Kategorie **Integration**
3. Rootwise installieren, Home Assistant neu starten
4. *Einstellungen → Geräte & Dienste → Integration hinzufügen → Rootwise*
5. Bei Rootwise auf **Pflanze hinzufügen** klicken

Voraussetzung: Home Assistant 2026.9 oder neuer.

## Bodenfeuchtesensor richtig einrichten

- **Platzierung:** Den Sensor senkrecht bis zur Markierung in die Wurzelzone stecken, nicht an den Topfrand. Nach dem Umstecken ändern sich die Rohwerte.
- **Skala:** Der Sensor misst roh, und jeder Topf ist anders. Rootwise startet mit Richtwerten der Art. Die Kalibrierung mit „trocken“ und „frisch gegossen“ kommt in Phase 2.
- **Langzeitstatistik:** Rootwise braucht die Langzeitstatistik des Sensors (`state_class: measurement`). Zigbee2MQTT setzt das bei Bodenfeuchtesensoren automatisch.
- **Empfohlene Sensoren:**
  - Feuchte: ThirdReality Soil Moisture (Zigbee)
  - Licht: ein Lux-Sensor pro Fenster, zum Beispiel Aqara Light Sensor T1 oder ESPHome mit VEML7700
  - Leitwert (optional): Mi Flora

## Echte Daten sammeln (für die Gieß-Erkennung in Phase 3)

Die Gieß-Erkennung und die Prognose werden an echten Kurven deines Sensors eingestellt. Dafür zwei Dinge:

1. **Zwei Helfer anlegen**, als „Wahrheit“ zum Vergleich:
   - *Einstellungen → Geräte & Dienste → Helfer → Helfer erstellen → Taste*
   - Name „Monstera gegossen“ → `input_button.monstera_gegossen`
   - Name „Monstera Sensor bewegt“ → `input_button.monstera_sensor_bewegt`
   - Beide aufs Handy-Dashboard legen. Beim Gießen bzw. Umstecken des Sensors einmal tippen.
2. **Einmal pro Woche exportieren** (auf dem PC, die Daten bleiben lokal in `dev/data/`):
   - Den Token legst du unter *Profil → Sicherheit → Langlebige Zugriffstokens* an.
   ```powershell
   $env:HA_URL = "https://<dein-host>.ts.net"
   $env:HA_TOKEN = "<Token>"
   .venv\Scripts\python dev\tools\export_history.py sensor.<dein_bodenfeuchtesensor> `
       --buttons input_button.monstera_gegossen input_button.monstera_sensor_bewegt
   ```

## Foto-Check vorbereiten: Google Gemini (für Phase 4)

Der Foto-Check nutzt die KI, die du in Home Assistant einrichtest. Rootwise speichert selbst keinen Schlüssel.

1. Unter [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) einen API-Schlüssel erstellen. Dafür brauchst du ein Google-Konto ab 18; die Gratis-Stufe reicht.
2. In Home Assistant die Integration **Google Gemini** hinzufügen und den Schlüssel einfügen.
3. Bei der Integration eine **KI-Aufgabe** (AI Task) hinzufügen: einmal mit einem Flash-Modell (bessere Qualität, ca. 20 Anfragen pro Tag) und einmal mit Flash-Lite (ca. 500 pro Tag).
4. Test mit dem Spike-Skript. Optional kannst du vorher ein Pflanzenfoto unter *Medien → Meine Medien* hochladen und mitschicken:
   ```powershell
   .venv\Scripts\python dev\tools\ai_task_spike.py ai_task.<deine_ki_aufgabe> `
       --photo media-source://media_source/local/<foto>.jpg
   ```

**Datenschutz:** Für Nutzer in der EU gelten auch in der Gratis-Stufe die Datenregeln der Bezahl-Stufe: Google trainiert nicht mit deinen Anfragen. Hochgeladene Fotos liegen bis zu 48 Stunden bei Google.

## Datenschutz

Rootwise arbeitet lokal.
- Die KI-Funktionen (ab Phase 4) laufen ausschließlich über eine KI, die du in Home Assistant selbst einrichtest, zum Beispiel Google Gemini. Sie brauchen eine ausdrückliche Einwilligung.
- Fotos werden vor dem Hochladen ohne Standortdaten gespeichert.

**Hinweis:** Ist dein Home Assistant öffentlich erreichbar, etwa über Tailscale Funnel, gilt das auch für jede Integration. Stell den Fernzugriff besser auf „nur Tailnet“ und aktiviere 2FA.

## Entwicklung

```bash
uv venv --python 3.14 .venv
uv pip install -r requirements_test.txt
.venv/Scripts/python -m pytest
```

Die Tests mit Home-Assistant-Fixture laufen in GitHub Actions unter Linux. Unter Windows helfen die Stubs in `tests/conftest.py`.

## Lizenz

MIT

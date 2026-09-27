# Gieß-Engine – Review von v0 und MVP-Entwurf (Grundlage für Phase 3)

Quelle: Review-Subagent (Plan) vom 27.09.2026, gegen PLAN v0 §7–9, ADR-3/4/5/11 und §15. Teilweise am HA-Core-Quellcode (dev) geprüft.
Status: Entwurf. Die Parameter werden im Simulator eingestellt und an echten Monstera-Daten plausibilisiert (Phase 3).

**Kernthese:** Den Prognosefehler bestimmt vor allem das Wetter, nicht die Kurvenform. An sonnigen und trüben Tagen schwankt die Trocknungsrate um etwa ±30–50 %. Deshalb dürfte ein einfacher, robuster Schätzer mit empirischer Korrektur aus den eigenen Zyklen genauso gut sein wie Exponential-Fit, AICc und Präzisionsgewichtung. Er braucht dafür nur etwa ein Drittel des Codes und keine iterative Numerik. Diese Hypothese muss der Backtest belegen (Entscheidungsregel unten).

**Am Core-Quellcode geprüft:**
- `state_reported` legt keine neue Zeile an, sondern führt ein `UPDATE states.last_reported_ts` aus.
- `history/history_during_period` liefert kein `last_reported`.
- `recorder/statistics_during_period` kennt `period: 5minute|hour|day…` und `types: mean|min|max`.

## 1. Bewertung der v0-Bausteine

| Baustein | Urteil | Begründung |
|---|---|---|
| Sample-and-hold | behalten | Kanonisches Format sind Stunden-Buckets `{mean (zeitgewichtet), min, max}`, also das Format der Langzeitstatistik. So gibt es einen Codepfad für Live, Backfill, Bootstrap und Tests. Ein Wert gilt höchstens 3 h, danach zählt es als Lücke. |
| Kausaler Spike-Filter (Median-5 + MAD-Floor) | streichen | Bei 1-%-Quantisierung ist der MAD fast immer 0. Einzelne Ausreißer fängt schon die Bestätigung ab, im Fit Theil–Sen. Es bleibt eine Plausibilitätsprüfung (numerisch, 0–100). |
| Detektor A `max(R, 4·MAD, P99)` | vereinfachen | Die Trocknung liegt bei höchstens ~1 %/h, der Sonnen- bzw. Temperatureffekt bei 1–3 % über Stunden. Gießen bringt +15–40 % in Minuten, also genügt eine feste Schwelle R. Das P99 ist zirkulär, weil es gelabelte Daten bräuchte. |
| Detektor B (12 h monoton) | v1.1 | Ein 3-h-Fenster erfasst Untersetzer-Gießen meist schon. 12 h überlappen den Tagesgang und erzeugen Fehlalarme. |
| Bestätigung | behalten | Als fester Timer bei +60 min, nicht über den „nächsten Wert“, der wegen des Heartbeats bis 1 h dauern kann. |
| Episoden-Merge über die Steigung | vereinfachen | Alles innerhalb von 6 h ab Beginn ist eine Gießung. |
| Tombstones, Event-Hash, Wasserzeichen | vereinfachen | Das Journal ist die einzige Wahrheit. „War ich nicht“ legt `watering_rejected` an. Der Detektor schlägt nur vor, wenn im Journal ±6 h leer ist. Beim Start werden die letzten 72 h neu durchlaufen. |
| Feldkapazität (Median 2–6 h nach dem Gießen) | behalten | Physikalisch richtig und trivial. |
| Exponential (log-linear + Gauss-Newton/Huber) | v1.1, nur wenn der Backtest es verlangt | Iterativ, braucht Guards und eine Baseline b, die ohne Kalibrierung unbekannt ist. |
| Robuste lineare IRLS | durch Theil–Sen ersetzen | Nicht iterativ, Bruchpunkt 29 %. Bei ≤ 96 Punkten sind es 4.560 Paare, also wenige ms auf dem Pi. |
| AICc | streichen | Setzt unabhängige Residuen voraus; Stundenwerte mit Tagesgang sind stark autokorreliert. |
| Prior (gewichteter Median von log k, Temperatur-Ähnlichkeit) | vereinfachen | Stattdessen das Niveau-Profil früherer Zyklen (Zeit je 1-%-Stufe) und daraus die Restzeit formfrei ablesen. Gewichtet wird nur nach Aktualität, die Temperatur kommt in v1.1. |
| Präzisionsgewichtete Kombination | ersetzen | Die Varianz aus autokorrelierten Punkten ist zu optimistisch. Stattdessen eine lineare Rampe nach Datenmenge. |
| Backtest-Konfidenz P10/P90 | behalten und aufwerten | Liefert Bias-Korrektur und Intervall (Split-Conformal-Idee). |
| Intervallmodell ohne Sensor | vereinfachen | Die Saisontabelle bleibt. Temperaturfaktor und gelernte Saisonfaktoren kommen in v1.1, weil sie ~1 Jahr Daten brauchen. Bei nur 3–5 Werten ist 3·MAD wertlos; stattdessen ein Faktor-2-Band. |
| Kaltstart-Faktoren (Topf, Material, Fenster) | behalten | In der UI als „grob“ kennzeichnen. |
| Überwässerung | vereinfachen | Nur „N Tage über der Nass-Schwelle“. „k unter P10“ braucht ≥ 10 Zyklen und kommt in v1.1. |
| Sonderfälle §7.7 | weitgehend behalten | Umtopfen = neues Regime. Umgesteckt = Segmentbruch. Aus der Erde = 6 h flach unter „trocken“. Selbstbewässerung → Intervallmodell. Der Drift-Trend kommt in v1.1. |
| Hysterese + 30-min-Mindestdauer | vereinfachen | Ein Band von max(3 Punkte, gemessene Tagesgang-Amplitude) genügt; die Mindestdauer entfällt. |
| Health-Score (6 Faktoren × Dauer) | vereinfachen | „Zeit im Zielbereich“ der letzten 7 Tage mit den Gewichten Feuchte 0,5, Licht 0,25 und Temperatur 0,25. |
| Schwelle ohne Kalibrierung | ergänzen | Ab 2 Zyklen gilt als Default der Median der Werte kurz vor dem Gießen („wie du gießt“). |

**Widerspruch in v0:** `reasons[]` enthielt `value` und `since`, obwohl ADR-11 genau solche Live-Felder in Attributen verbietet. In v1 gibt es deshalb nur statische Codes und Schwellen.

## 2. MVP-Engine

**Konstanten:** q = 1 (Quantisierungsstufe), R = 8 Rohpunkte, S = 6 h Drainage, 3-h-Detektorfenster. Sie gelten global, werden im Simulator eingestellt und an echten Daten geprüft. Intern rechnet die Engine in Rohwerten; die Kalibrierung dient nur für Anzeige und Schwellen.

**Erkennung** (Events und LTS-Buckets identisch):
```python
def on_sample(t, v):
    base = held_min(t - 3h, t)                     # incl. held start value
    if v - base >= R and not journal_has(t, ±6h) and not ep_open:
        ep = Episode(t0=last_time_at(base), base=base, peak=v)
        schedule_at(ep.t0 + 60min, confirm)        # point-in-time timer
    elif ep_open and t < ep.t0 + 6h: ep.peak = max(ep.peak, v)
    if not in_drainage(t) and held_max(t-90min, t) - v >= R:
        segment_break("disturbed")                 # no "thirsty" for 2 h
def confirm():
    if level_now() >= ep.base + 0.5*R: journal.add("watered", "auto", rise=ep.peak-ep.base)
# gap > 3 h: v_after - v_before >= R -> watered(t=first_after_gap, flag="gap")
# LTS: rise = max_h - min(min_{h-3..h}); t0 ≈ h_start + 60min*(max_h-mean_h)/(max_h-min_h)
```

**Zyklen:**
```python
cycle = [watered_i, watered_{i+1}), cut at disturbance/regime change
fc_i = median(mean_h for h in [t_w+2h, t_w+6h])
profile_i = [(level, h since t_w+S)] at each 1-%-crossing of 24h-centered mean  # <=40 pairs
```

**Prognose:**
```python
win = buckets since t_w+S: last 48 h, grow to <=96 h until drop >= 4q
if span(win) >= 24h and len(win) >= 16:
    s, L = theil_sen(win)                                  # slope, level at now
    T_cur = (L - thr) / -s if s < -0.01 else None          # else "barely drying"
T_prior = wmedian(p.t(thr) - p.t(L) for p in profiles, w=0.5**(age/60d))
          # cycle ended above thr: extrapolate its last 48 h linearly, max 3 d
w = clamp((span(win) - 24h) / 24h, 0, 1)
T = w*T_cur + (1-w)*T_prior           # one missing -> other; none -> interval model
rho = plant.rho if n>=6 else pooled_rho if n_pool>=6 else (0.7, 1.0, 1.5)
next = now + T*med(rho);  window = now + T*(q10(rho), q90(rho))
# L <= thr: due since first crossing; horizon <= 30 d
conf = "high" if n>=9 and width/T<=0.5 else "medium" if width/T<=1 else "low"
```

**Backtest beim Zyklusabschluss:**
- Das Ziel-Niveau ist X = max(thr, Zyklus-Minimum + q). Dieses Niveau wurde tatsächlich erreicht, es gibt also keine Zensierung, auch wenn vor der Schwelle gegossen wurde.
- Der Prädiktor wird bei 25/50/75 % von [t_w+S, t_X] nachgespielt. Gespeichert wird jeweils `rho = (t_X − t_p)/T_p`, also 3 Floats pro Zyklus.

**Ohne Sensor:**
```python
d   = intervals between "watered" entries (manual+auto), 365 d, 0.5 < Δ < 60 d, no vacation
S   = {Dec-Feb: 1.5, Mar/Nov: 1.25, Apr/Oct: 1.1, else: 1.0}   # shift 6 months if latitude < 0
ref = [Δ / S[month] for Δ in d]
base = wmedian([r for r in ref if med/2 <= r <= 2*med], half_life=90d) if len(ref) >= 3 \
       else override or species.summer * pot_factor
next = last + base*S[now];  window = next-scaled (min, max)(ref[-5:]/base) or (0.75, 1.3)
```
Pflanzen mit Sensor füttern dieses Modell mit den erkannten Gießungen. Fällt der Sensor aus, ist der Fallback also schon trainiert.

## 3. Validierung mit echten Daten

**Export vom PC, ohne SSH:** `dev/tools/export_history.py` mit aiohttp. Den Token legst du selbst an (Profil → Sicherheit); das Skript liest ihn aus `HA_TOKEN`.
1. `recorder/list_statistic_ids` prüft, ob der Sensor eine `state_class` besitzt.
2. `history/history_during_period` holt die letzten 10 Tage roh (`significant_changes_only: false`, `minimal_response`, `no_attributes`).
3. `recorder/statistics_during_period` mit `period: "hour"` und `types: [mean, min, max]` ab Sensorstart, zusätzlich `"5minute"` für die letzten 10 Tage (älteres wird gelöscht).

Das Skript läuft wöchentlich und baut ein Rohdaten-Archiv auf.

**Ground Truth:**
- **Rückblickend:** Das Skript plottet die Kandidaten, du markierst in `labels.csv` bestätigt, falsch oder fehlend. Das sind schwache Labels (±1 Tag).
- **Ab sofort exakt:** `input_button.monstera_gegossen` und `input_button.monstera_sensor_bewegt` auf dem Handy-Dashboard oder per NFC.

**Metriken und Ziele:**
- **Erkennung:** Treffer innerhalb ±2 h (roh) bzw. ±3 h (LTS). Gemessen werden Precision, Recall und der Zeitversatz. Ziele: Recall ≥ 95 %, ≤ 1 Fehlalarm pro Pflanze und Monat, Versatz ≤ 30 min (roh) bzw. ≤ 60 min (LTS).
- **Prognose** bei 25/50/75 %: MAE in Stunden, Bias, relativer Fehler, Tages-Trefferquote ±1 Tag. Die Coverage des P10–P90-Fensters soll 70–90 % betragen; dazu die mittlere Fensterbreite.
- **Entscheidungsregel:** Die Exponential-Variante (nur im Dev-Harness) kommt ins Produkt, wenn sie den MAE bei 25 **und** 50 % um ≥ 15 % senkt.
- Derselbe Zeitraum wird roh, als 5-min-Statistik und als LTS ausgewertet. So zeigt sich, ob der Bootstrap aus der LTS gleichwertig ist.

**Mindestdaten:** 8 gelabelte Gießungen und 5 vollständige Zyklen (bei der Monstera ~5–10 Wochen). Mit einem Sensor ist das ein Plausibilitätstest, kein Tuning.

**LTS-Erkennung:** Sie funktioniert, wenn min/max verwendet werden. Das Minimum der Stunde enthält den Wert vor dem Sprung, das Maximum den danach. Der Zeitpunkt lässt sich über `(max − mean)/(max − min)` auf etwa ±15 min rekonstruieren. Grenzen: Gießen, während der Sensor `unavailable` ist, und Gießmengen unter R.

**Simulator** (reines Python, fester Seed):
- **Trocknung:** Tagesrate lognormal (σ ≈ 0,25), Form zwischen linear und exponentiell mischbar.
- **Störeinflüsse:** temperaturgekoppelter Tagesgang 0–2 %, Drainage-Überschwinger (τ ≈ 1,5 h), Teilgießen, Untersetzer (1–3 h Anstieg).
- **Sensorverhalten:** 1-%-Quantisierung, Report-on-change, ≥ 10 s Abstand, Heartbeat 1 h.
- **Fehlerbilder:** Lücken von 2–30 h, Umstecken mit ±3–10 %, seltene Spikes.
- **Ausgabe:** im Format des Exports plus die Wahrheit, ≥ 500 Zyklen je Szenario.

## 4. Pi-/SD-Last (N = 10, grobe Schätzung)

**Drei Fallen:**
- Jede Entity mit `state_class` erzeugt unabhängig von Änderungen 288 Kurzzeit- und 24 LTS-Zeilen pro Tag.
- `_unrecorded_attributes` verhindert keine Zeile in `states`.
- Ein unveränderter Write löst `state_reported` aus und damit ein UPDATE.

| Pro Pflanze und Tag | v0 | MVP |
|---|---|---|
| Kalibrierte Feuchte (measurement) | 25 + 312 Statistikzeilen | 0 (das Panel rechnet die LTS der Quelle um) |
| Health (measurement, ≤ 30 min) | 15 + 312 | 2 (stündlich, ohne `state_class`) |
| DLI heute (5 min) | 80 + 312 | 1 (Ø 7 Tage, täglich) |
| `next_watering` | 15 | 4 |
| Status/Problem | 20 | 4 |
| Rest | 5 | 3 |
| Coordinator-Push je Sample/Heartbeat | bis 750 UPDATEs | 0 (Write-Guard) |
| **Summe** | **~1.850** | **~14** |

**Store:** v0 schrieb alle 15 min einen Snapshot (~5 MB/Tag). Im MVP sind es 5–10 ereignisgetriebene Saves (~0,3 MB).

**Regeln:**
- Kein `state_class` auf abgeleiteten Werten.
- Nur statische Attribute.
- Write-Guard auf `(state, attrs)`.
- Rundung: `next_watering` auf `clamp(10 % der Restzeit, 15 min, 6 h)`; Health ganzzahlig, stündlich, Δ ≥ 2; DLI täglich.
- Höchstens 1 Write pro Minute und Entity, außer beim Wechsel zu „kritisch“.
- DLI einmal pro Lux-Sensor.
- `async_delay_save(120 s)` nur bei Ereignissen.

**Tick:**
- Samples ereignisgetrieben in O(1), ohne Debouncer.
- Stündlicher Tick (`async_track_utc_time_change(minute=0, second=7)`): Bucket abschließen, Prognose und Health aktualisieren, Stale-Check, Überwässerung.
- Ein Deadline-Timer pro Pflanze (`async_track_point_in_utc_time`): Bestätigung +60 min, Snooze- bzw. Urlaubsende, Fälligkeit sensorloser Pflanzen.
- Mitternachts-Job für die Tagesaggregate.

## 5. Top-5-Risiken

1. **Temperaturkopplung des kapazitiven Sensors** (Südfenster). Der Harness misst das P95 der 3-h-Anstiege und die Korrelation zwischen Residuum und Temperatur; eine Kompensation kommt in v1.1.
2. **Das Gießverhalten zensiert die Zyklen.** Dagegen helfen das Ziel-Niveau X, eine Profil-Extrapolation von höchstens 3 Tagen und ein gepooltes ρ.
3. **Zu wenige Zyklen:** Die P10/P90-Werte sind dann praktisch Minimum und Maximum. Dagegen helfen Default- oder Pool-ρ, die Stufe „niedrig“ und n sichtbar in der UI.
4. **Versteckte Write-Verstärkung.** Ein Test zählt die Recorder-Zeilen pro Entity über 24 h; Soll sind ≤ 20 pro Pflanze.
5. **Umstecken nach oben sieht aus wie Gießen.** Dagegen hilft „War ich nicht / Sensor bewegt“. Heuristik für v1.1: Echtes Gießen zeigt einen Drainage-Abfall in den ersten 2–6 h.

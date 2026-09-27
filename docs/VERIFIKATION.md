# Rootwise – Verifikationsbericht PLAN v0 (Stand 27.09.2026)

Auszug aus PLAN.md §2. Vollständige Notizen mit Quellzeilen: `../research_notes/Rootwise Faktenprüfung Plan v0/` (je ein File pro Strang; *_NACHTRAG.md = Ergänzungen nach dem Plan-Modus).


Legende: ✅ verifiziert · ⚠️ geändert (alt → neu) · ❓ nicht verifizierbar. Alle Quellen wurden am 27.09.2026 abgerufen. Die vollständigen Notizen mit Zeilenangaben zum Quellcode liegen in `Desktop\rootwise\research_notes\Rootwise Faktenprüfung Plan v0\`.

### 2.1 Home Assistant Core

| # | Aussage in v0 | Urteil | Richtig ist / Quelle |
|---|---|---|---|
| 1 | Aktuell ist HA 2026.9.3, braucht Python ≥ 3.14.2; pytest-homeassistant-custom-component 0.13.366 pinnt 2026.9.3 | ✅ | [PyPI homeassistant](https://pypi.org/project/homeassistant/), [PyPI phcc](https://pypi.org/project/pytest-homeassistant-custom-component/). 2026.9.4 liegt im `rc`-Branch. Die 2026.10-Beta kommt voraussichtlich am 30.09., das Release am 07.10. (abgeleitet aus der „erster Mittwoch“-Regel) |
| 2 | Anlegen, Ändern und Löschen eines Subentry lösen nur Update-Listener aus, kein Reload | ✅ | `_async_save_and_notify` in [config_entries.py](https://github.com/home-assistant/core/blob/dev/homeassistant/config_entries.py#L2783-L2895) |
| 3 | Löschen eines Subentry entfernt dessen Devices und Entities | ✅ | `async_clear_config_subentry` in Device- und Entity-Registry |
| 4 | `async_add_entities(..., config_subentry_id=)` | ✅ | [entity_platform.py @2026.9.3](https://github.com/home-assistant/core/blob/2026.9.3/homeassistant/helpers/entity_platform.py#L130-L152); eine unbekannte ID wirft `HomeAssistantError` |
| 5 | Seit 2026.8 gehört ein Device genau einem Entry und höchstens einem Subentry | ✅ | [Dev-Blog 21.07.2026](https://developers.home-assistant.io/blog/2026/07/21/device-registry-single-config-entry). **Pflicht: ein Device pro Pflanzen-Subentry.** Ein geteiltes Device über mehrere Subentries wird still verschoben und wirft ab 2027.8 einen Fehler |
| 6 | Update-Listener plus `*_reload_and_abort` ist deprecated, ab 2026.12 ein Fehler | ✅, aber verschärft | Bei **Subentry-Flows ist es heute schon ein harter `ValueError`**. Dasselbe gilt für `OptionsFlowWithReload` mit Listener. [Blog 07.05.2026](https://developers.home-assistant.io/blog/2026/05/07/config-entry-listener-together-with-reloading-methods) |
| 7 | Config-Flows können nur Formulare, Menüs, Progress und External Step | ✅ | Dazu kommen Sections, `read_only`-Selectors und Preview. Eigene UI-Schritte sind nicht möglich |
| 8 | 2026.9 ersetzt voluptuous durch probatio; eigene Validatoren in Flows brechen | ⚠️ | probatio gibt es und es ersetzt voluptuous seit 2026.9.0 ([PR #175128](https://github.com/home-assistant/core/pull/175128)). Der Shim `import voluptuous` ist **dauerhaft**, der PR nennt ausdrücklich **keine Breaking Changes** für Custom-Integrationen. „Validatoren brechen“ hat keine Quelle. Selectors bleiben trotzdem richtig, weil nur sie im Formular serialisierbar sind |
| 9 | hassfest lehnt seit 09/2026 `requirements` ab, die Core schon hat oder mit `==` pinnen | ⚠️ | Kommt erst mit **2026.10** ([PR #181913](https://github.com/home-assistant/core/pull/181913)). `==` ist nur für Pakete verboten, die HA selbst pinnt. Für uns egal: `requirements: []` |
| 10 | Seit 2026.3 liegen Brand-Bilder in `custom_components/<domain>/brand/` | ✅ | [Blog 24.02.2026](https://developers.home-assistant.io/blog/2026/02/24/brands-proxy-api); HACS akzeptiert das seit [PR #5128](https://github.com/hacs/integration). ⚠️ Das HACS-eigene UI zeigt lokale Icons noch nicht ([#5171](https://github.com/hacs/integration/issues/5171) offen), rein kosmetisch |
| 11 | Kein `homeassistant`-Key in `manifest.json`, die Mindestversion gehört in `hacs.json` | ✅ | hassfest-Schema lehnt unbekannte Keys ab |
| 12 | `via_device` ist deprecated | ✅ | Seit 2026.8 gilt `via_device_id`; `via_device` ist aus `DeviceInfo` entfernt und läuft bis 2027.8 mit Warnung |
| 13 | Subentries haben keine eigene Version, Migration läuft über den Haupt-Entry | ✅ | Neu in 2026.10: Migration darf `ConfigEntryNotReady` werfen, dazu `async_retry_migration` |
| 14 | Repair-Flows können keinen Subentry-Reconfigure öffnen | ⚠️ falsch | Seit **2026.9.0** geht das über `next_flow=(FlowType.CONFIG_SUBENTRIES_FLOW, flow_id)` ([PR #172489](https://github.com/home-assistant/core/pull/172489), [Doku](https://developers.home-assistant.io/docs/core/platform/repairs)). Nutzen wir für „Sensor fehlt – neu zuordnen“ |
| 15 | Die Quality Scale gilt nicht für Custom-Integrationen | ✅ | [Doku](https://developers.home-assistant.io/docs/core/integration-quality-scale/) |
| 16 | Store mit Version, Minor-Version, Migration und `async_delay_save` | ✅ | Seit 2025.12 wird standardmäßig im Event-Loop serialisiert |
| 17 | Recorder hält 10 Tage, die Langzeitstatistik ist unbegrenzt | ✅ | `state_reported` erzeugt **keine neue Zeile**, sondern ein UPDATE von `last_reported_ts`; `history_during_period` liefert kein `last_reported` (Engine-Review, am Quellcode geprüft) |
| 18a | Panel über `panel_custom.async_register_panel`, statische Dateien über `async_register_static_paths(StaticPathConfig)` | ✅ | Alle Parameter gibt es, `handle_safe_area` seit 2026.8.2. ⚠️ **Statische Pfade sind ohne Login abrufbar**, deshalb nie Fotos dort ablegen |
| 18b | Karten global über `add_extra_js_url`, auch im YAML-Dashboard-Modus | ✅ | Wird in die Hauptseite injiziert. Lovelace-Ressourcen per Code anzulegen geht nur über interne API im Storage-Modus, deshalb nicht verwenden |
| 18c | `ha-textfield` seit 2026.5 entfernt; Karten-Editor über `getConfigForm()` | ✅ | Ersetzt durch `ha-input`. HAs Aussagen zu `ha-*` in eigenen Karten sind widersprüchlich, also Lit selbst bündeln |
| 18d | HTTP-Views: 16 MiB Standardgrenze; Multipart kann streamen; Upload per `hass.fetchWithAuth(FormData)` | ✅ + ⚠️ | Wer in Chunks streamt, umgeht die Grenze. Deshalb setzt Rootwise ein **eigenes Größenlimit** |
| 18e | Core `image_upload` liefert ohne Login aus und behält EXIF/GPS | ✅ | Dazu: nur JPEG/PNG/GIF (kein HEIC/WebP), höchstens 10 MiB. Wird nicht genutzt |
| 18f | Actionable Notifications nur über die Legacy-Services `notify.mobile_app_*` | ✅ | Die NotifyEntity (2026.5) kann nur Titel und Text. ⚠️ **Fälschung bestätigt:** Jedes registrierte Handy, auch eines Nicht-Admins, kann über den Webhook `fire_event` beliebige Events auslösen. Das Event enthält kein device_id, nur `context.user_id`. Deshalb Einmal-Nonce **plus** Prüfung des Users |
| 18g | Recorder 10 Tage; Langzeitstatistik unbegrenzt | ✅ + ⚠️ | Die stündliche Langzeitstatistik bleibt, **die 5-Minuten-Statistik wird nach 10 Tagen gelöscht**. `state_reported` erzeugt keine neue Zeile, nur ein UPDATE |
| 18h | `async_track_state_report_event` | ✅ | Feuert nur, wenn Zustand **und** Attribute unverändert sind (ohne `force_update`). Daten: `entity_id`, `last_reported`, `old_last_reported`, `new_state` |
| 18i | `get_significant_states(...)`, `statistics_during_period(...)` | ⚠️ | `filters` muss `None` sein, `entity_ids` ist Pflicht. `statistics_during_period` braucht `units` **und** `types`. Die WebSocket-Befehle `recorder/statistics_during_period` und `history/stream` stimmen |
| 18j | todo, calendar, image | ✅ | todo löscht mit `async_delete_todo_items(uids)` (Plural). Ganztägige Kalendereinträge haben ein exklusives Ende. Der Token der Image-Entity rotiert alle 5 min |
| 18k | Repairs, Diagnostics, Media Source, signierte Pfade | ✅ | Das Signier-Secret liegt nur im RAM, signierte URLs sterben also beim Neustart. `BrowseMediaSource` braucht seit 2026.6 `domain`. HA-OS-Medienordner ist `/media` |
| 18l | Core-Trigger `moisture` (2026.4) | ✅ | Trigger detected/cleared/changed/crossed threshold und passende Conditions für `device_class: moisture` mit `%`. Kein neues Pflanzen-Feature in Core |
| 18m | (neu) Neue HA-OS-Installationen nutzen seit 2026.8 Port 80 | neu | Nie `:8123` fest einbauen |
| 19 | `ai_task.generate_data` mit Bild-Anhang und **verschachteltem** `structure` | ✅ mit Korrekturen | Geht: `object`-Selector mit `fields` und `multiple: true`, Enums über `select`. HA und Gemini lösen das rekursiv auf ([ai_task.py](https://github.com/home-assistant/core/blob/2026.9.3/homeassistant/components/ai_task/)). ⚠️ In Python sind alle Argumente nach `hass` **keyword-only**, und `structure` muss ein `vol.Schema` sein. ⚠️ **HA prüft die Antwort nicht gegen das Schema**; Gemini ignoriert min/max. ⚠️ **Jeder Fehler, auch 429, kommt als allgemeiner `HomeAssistantError`**, die Ursache steht in `__cause__`. Es gibt kein HA-Timeout. ⚠️ Anhänge müssen auf eine lokale Datei zeigen (PlayMedia mit `path`). Kamera- und Image-Entities werden gesondert behandelt (`media-source://image/<entity>`). AI-Task-Anbieter in Core: anthropic, cloud, Gemini, ollama, open_router, openai |
| 20 | Weitere Deprecations bis 2027 | neu | `show_advanced_options` fällt 2027.6 weg. Entity-IDs mit falscher Domain gehen ab 2027.5 nicht mehr. `PERCENTAGE` wird durch `UnitOfRatio.PERCENTAGE` ersetzt. Eine Entity ohne `unique_id` verliert ihre Device-Verknüpfung. `DeviceEntry.config_entries` warnt ab 2026.10 |

### 2.2 HACS

| # | Aussage | Urteil | Richtig ist / Quelle |
|---|---|---|---|
| 21 | HACS 2.x | ✅ | Neuestes Release ist 2.0.5 (Jan. 2025) |
| 22 | Private Repos gehen nicht; Custom-Repos schon | ✅ | [hacs.xyz](https://hacs.xyz) |
| 23 | `hacs.json` ohne `zip_release` | ✅ | Erlaubt sind genau 10 Keys; `render_readme` ist Altlast. Ein unbekannter Key lässt die Validierung scheitern |
| 24 | `hacs/action` prüft Brands | ✅ + ⚠️ | Es sind 10 Checks. **Neu seit Juli 2026 ist ein `license`-Check**: eine OSI-Lizenz ist Pflicht, v0 hatte keine LICENSE-Datei eingeplant |
| 25 | HACS nutzt GitHub-Releases | ✅ | Ohne Release zeigt HACS nur den Commit-Hash; Releases sind für Custom-Repos optional |

### 2.3 Bestehende Lösungen

| # | Aussage | Urteil | Richtig ist / Quelle |
|---|---|---|---|
| 26 | Olen/homeassistant-plant: 870★, aktiv, überschreibt die Domain `plant` | ✅ | v2026.9.0, 0 offene Issues. Inzwischen mit VPD, 5-%-Hysterese und `plant.*`-Triggern (HA 2026.7) |
| 27 | Olen fehlt Gieß-Log, Prognose, Kalibrierung, Fotos/KI, todo und Kalender | ✅ | Log, todo und Kalender hat der Maintainer **bewusst abgelehnt** ([#326](https://github.com/Olen/homeassistant-plant/issues/326), [#415](https://github.com/Olen/homeassistant-plant/issues/415)). Ein Upstream-Beitrag ist also aussichtslos |
| 28 | Offene Olen-Issues: hängender Problem-Status, moisture vs. humidity | ⚠️ | Beide sind geschlossen (#252 per PR #305, #454) |
| 29 | Plant-Monitor-Plus, adaptive_plant | ✅ | 5★ bzw. 95★ |
| 30 | plantlab: nur Cloud, 3 Diagnosen pro Tag gratis | ⚠️ | Stimmt, aber es kann **nur Cannabis** und ist für Zimmerpflanzen nutzlos |
| 31 | „Lücken, die nur wir füllen“ | ⚠️ | Der Markt ist 2026 voll: `smart-plants` (seit 25.09., Panel, Deutsch), `HA-Plant-Monitor` (Prognose), `plants-hass` (Gieß-Erkennung mit Tau-Filter), `ha-plant-helper` (Kalibrierung und Lernen). **Wirklich neu ist nur:** KI-Fotodiagnose für Zimmerpflanzen in HA plus alles in *einer* ausgereiften, mobilen Oberfläche |
| 32 | OpenPlantbook: `/token/`, `plant/detail/{pid}`, `*_light_mmol/1000` = DLI, MiFlora-Skala | ⚠️/❓ | Token-URL ist `/api/v1/token/`; `lang=de` geht. mmol/1000 und die MiFlora-Skala sind **nicht dokumentiert**, das stammt aus Olens Code |
| 33 | Name „Rootwise“ frei | ✅ | Keine Kollision in HA-Core, Brands oder HACS. Einzige Pflanzen-Überschneidung: Raindrips „RootWise™“-Bewässerungsmatte (Produkt, keine App). EUIPO wurde nicht geprüft ❓ |
| 34 | „PlantPilot“ kollidiert | ✅ | Bestätigt, dazu noch drei weitere Treffer |

### 2.4 KI

| # | Aussage | Urteil | Richtig ist / Quelle |
|---|---|---|---|
| 35 | Ollama 0.34.x | ⚠️ | Auf dem PC läuft 0.34.1, aktuell ist 0.34.4 (23.09.) |
| 36 | `/api/chat` mit `images` und JSON-Schema in `format` | ✅ | Live bestätigt |
| 37 | Standardkontext 4k bei 16 GB | ⚠️ | Auf deinem PC ist 64k eingestellt; immer `num_ctx` mitschicken |
| 38 | RX 9070 XT über ROCm oder Vulkan, qwen3-vl-Abstürze unter Vulkan | ⚠️ | Dein PC läuft über ROCm 7.1. Der Absturzbericht betraf eine RX 6750 XT |
| 39 | qwen3.5:9b 6,6 GB · gemma4:12b ~8 GB · qwen3-vl:8b · mistral-small3.2 passt nicht | ✅ | 6,6 / 7,6 / 6,1 GB; mistral-small3.2 hat 15 GB. „gemma4 hat besseres Deutsch“ ❓ |
| 40 | Vision-Sprachmodelle sind schwach bei feiner Arterkennung und Krankheiten | ✅ | Arten: Gemini-2.0 49,7 % gegen 91 % für einen trainierten Klassifikator ([OpenPlant, 2026](https://pmc.ncbi.nlm.nih.gov/articles/PMC12986848/)). Krankheiten: Gemini-3-Flash war das beste Modell in [PlantInquiryVQA](https://arxiv.org/abs/2604.20983), trifft die Krankheit aber nur zu 44 %; offene Antworten liegen bei ~30 % ([arXiv 2512.15977](https://arxiv.org/abs/2512.15977)). **Es gibt keinen Zimmerpflanzen-Benchmark.** Symptome beschreiben die Modelle gut, Ursachen schlechter |
| 41 | Pl@ntNet: `POST /v2/identify/all`, 500 pro Tag gratis, Quellenangabe erbeten | ✅ / ⚠️ | Die Preisseite verlangt ein **„powered by Pl@ntNet“-Logo**. Nur nicht-kommerziell. Fotos bleiben nur im RAM ([Terms](https://my.plantnet.org/terms_of_use)) |
| 42 | Pl@ntNet-Diseases deckt nur Nutzpflanzen ab (Tomate, Weizen, Wein) | ⚠️ | ~100 Arten und 395 Schadbilder, vor allem französische Kulturen (Raps, Kaffee, Wein) ([Blog 14.09.2026](https://plantnet.org/en/2026/09/14/plntnet-diseases-pests-eng/)). Keine Zimmerpflanzen, also nutzlos |
| 43 | plant.id: 100 Gratis-Credits, dann 1–5 ct pro Credit | ⚠️ | Realistisch sind 0,05 € pro Credit bei 50 € Mindestbestellung, also ~0,10 € pro Foto. **plant.health** (548 Klassen, Zimmerpflanzen) wäre das passende Produkt ([Kindwise](https://www.kindwise.com/pricing)) |
| 44 | Gemini gratis: je nach Modell ~20–500 Anfragen pro Tag | ⚠️/❓ | Google veröffentlicht keine Zahlen mehr, nur noch im AI Studio. Laut Sekundärquelle (Sept. 2026) sind es ~20/Tag für 3.x Flash und ~500/Tag für Flash-Lite |
| 45 | Gemini gratis: Google nutzt Inhalte zur Verbesserung, Menschen können mitlesen | ⚠️ **falsch für dich** | **In EWR, Schweiz und UK gelten auch für die Gratis-Stufe die Datenregeln der Bezahl-Stufe**: keine Produktverbesserung, nur befristete Logs gegen Missbrauch ([Gemini-API-Terms](https://ai.google.dev/gemini-api/terms)). Fotos liegen 48 h in der Files-API. Nutzung ab 18 |
| 46 | HA-Integration „Google Gemini“ kann AI Task mit Bild | ✅ | Unterstützt Anhänge und `structure`; Default-Modell `gemini-3.1-flash-lite` |
| 47 | Groq gratis, trainiert nicht, Modelle wechseln oft | ⚠️ | Llama 4 ist weg; das einzige Vision-Modell ist die Preview `qwen3.8-27b`. Daten liegen bis 30 Tage in den USA. **Kein AI-Task-Weg in HA.** Deshalb gestrichen |
| 48 | Claude Haiku 4.5 ≈ 0,8 ct pro Foto; Claude Pro deckt die API nicht ab | ✅ | Obergrenze; realistisch 0,5–0,9 US-Cent |
| 49 | (neu) Mistral und OpenRouter als Alternativen | neu | Mistral: EU-Hosting, aber Training im Gratis-Plan standardmäßig an, nur über HACS. OpenRouter: Core-AI-Task, 50 Anfragen/Tag gratis, Anbieter dürfen je nach Einstellung loggen |
| 50 | (neu) Ollama geht auch als AI-Task-Entity | ✅ | Die Core-Integration `ollama` hat AI Task mit Anhängen und Schema. Ein späterer lokaler Weg braucht also **keinen eigenen Client** |

### 2.5 Android Companion App und Sensorik

| # | Aussage | Urteil | Richtig ist / Quelle |
|---|---|---|---|
| 51 | `capture="environment"` öffnet nur die Galerie; #6055 offen, PR #6794 ungemergt | ✅ | Beide sind echt. Der PR hat **Merge-Konflikte**, weil der Code in den neuen Compose-Frontend-Code umgezogen ist. Stabile App: 2026.6.5; Betas bis 2026.8.4. Ein Fix vor Jahresende ist unsicher |
| 52 | `getUserMedia` funktioniert in der WebView | ✅ + ⚠️ | Die Kamera-Berechtigung wird weitergereicht ([#7355](https://github.com/home-assistant/android/issues/7355): Livebild 1080×1920). **Aber:** Nutzer melden unscharfe Bilder (nur manueller Fokus). Außerdem braucht es HTTPS; **zu Hause nutzt die App oft `http://homeassistant.local:8123` – dort gibt es keine Kamera** |
| 53 | Fallback „Im Browser öffnen“ | ✅ | Teilen an HA geht nur mit Text, nicht mit Bildern |
| 54 | ThirdReality Gen2 (3RSM0347Z): Feuchte, Temperatur, Batterie; Reporting 10 s / 1 h / 1 %; `device_class: moisture` | ✅ | Dazu 3 Kalibrier-Werte und OTA. Mit ZHA gäbe es eine doppelte Humidity-Entity (Z2M ist richtig). Der **Matter/Thread-Nachfolger ist nur angekündigt** (IFA 2026) |
| 55 | Aqara Light Sensor T1: 0–83.000 lx | ✅ | Laut Händlern (die Aqara-Seite liefert 404). Das Reporting bestimmt das Gerät. VEML7700 mit ESPHome schafft bis ~120.000 lx |
| 56 | Matter-Bodensensoren seit HA 2026.7 (Matter 1.5) | ✅ | Seit 2026.7.0 unterstützt; der Typ kam mit Matter 1.5. **Kaufbar ist noch keiner** |
| 57 | b-parasite als DIY | ✅ | Aktiv gepflegt; BTHome, `device_class: moisture` |
| 58 | Mi Flora für EC | ✅ | Die Batterie wird nur einmal am Tag per Verbindung gelesen |

---


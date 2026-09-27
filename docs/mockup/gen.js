// Builds the Rootwise canvas files (dark + light variants) from tpl/ into project/.
const fs = require('fs');
const path = require('path');

const base = __dirname;
const tpl = (f) => fs.readFileSync(path.join(base, 'tpl', f), 'utf8');
const head = tpl('_head.html');

const ICONS = {
  menu: '<path d="M4 7h16M4 12h16M4 17h16"></path>',
  bell: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15z"></path><path d="M10 20.5h4"></path>',
  drop: '<path d="M12 3.5c3 3.6 6 7 6 10.2a6 6 0 0 1-12 0c0-3.2 3-6.6 6-10.2z"></path>',
  dropfill: '<path d="M12 3.5c3 3.6 6 7 6 10.2a6 6 0 0 1-12 0c0-3.2 3-6.6 6-10.2z" style="fill: currentColor"></path>',
  check: '<path d="M5 12.5l4.2 4.2L19 7"></path>',
  plus: '<path d="M12 5v14M5 12h14"></path>',
  camera: '<path d="M4 8h3l2-2.5h6L17 8h3v11H4z"></path><circle cx="12" cy="13.5" r="3.5"></circle>',
  image: '<rect x="4" y="5" width="16" height="14" rx="2"></rect><path d="M4 16l4.5-4.5 4 4 2.5-2.5L20 18"></path><circle cx="15.5" cy="9.5" r="1.5"></circle>',
  back: '<path d="M15 5l-7 7 7 7"></path>',
  fwd: '<path d="M9 5l7 7-7 7"></path>',
  down: '<path d="M6 9l6 6 6-6"></path>',
  close: '<path d="M6 6l12 12M18 6L6 18"></path>',
  tune: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"></path><circle cx="16" cy="7" r="2"></circle><circle cx="10" cy="17" r="2"></circle>',
  fert: '<path d="M9 3h6M10 3v5l-4.5 9a2 2 0 0 0 1.8 3h9.4a2 2 0 0 0 1.8-3L14 8V3"></path><path d="M7.5 14h9"></path>',
  clock: '<circle cx="12" cy="12" r="8"></circle><path d="M12 8v4.5l3 2"></path>',
  thermo: '<path d="M10 14.5V5a2 2 0 0 1 4 0v9.5a4 4 0 1 1-4 0z"></path>',
  air: '<path d="M3 9c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0M3 15c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0"></path>',
  sun: '<circle cx="12" cy="12" r="4"></circle><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"></path>',
  cat: '<path d="M5 20v-9l1.5-5.5L10 9h4l3.5-3.5L19 11v9z"></path><path d="M9.5 14h.01M14.5 14h.01"></path>',
  dog: '<path d="M7 8h10v7a5 5 0 0 1-10 0z"></path><path d="M7 8L4 14l3 1M17 8l3 6-3 1"></path><path d="M10.5 13h.01M13.5 13h.01"></path>',
  child: '<circle cx="12" cy="6" r="2.5"></circle><path d="M8 21v-5l-2-4 6-2 6 2-2 4v5"></path>',
  search: '<circle cx="11" cy="11" r="6"></circle><path d="M20 20l-4.5-4.5"></path>',
  sensor: '<path d="M12 12v8"></path><path d="M8.5 8.5a5 5 0 0 1 7 0M5.8 5.8a8.8 8.8 0 0 1 12.4 0"></path>',
  alert: '<path d="M12 4l9 16H3z"></path><path d="M12 10v4M12 17v.5"></path>',
  cloud: '<path d="M7 18h10a4 4 0 0 0 .5-8A5.5 5.5 0 0 0 7 9.5 4.3 4.3 0 0 0 7 18z"></path>',
  sprout: '<path d="M12 20v-8"></path><path d="M12 12c0-4-3-6-7-6 0 4 3 6 7 6zM12 10c0-4 3-6 7-6 0 4-3 6-7 6z"></path>',
  switchico: '<rect x="3" y="7" width="18" height="10" rx="5"></rect><circle cx="8" cy="12" r="3"></circle>'
};

const icon = (name, size) => {
  if (!ICONS[name]) throw new Error('unknown icon ' + name);
  return '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink: 0">' + ICONS[name] + '</svg>';
};

// Placeholder illustration for plant photos (clearly a placeholder, not a photo).
const leaf = (size) =>
  '<svg viewBox="0 0 120 120" width="' + size + '" height="' + size + '" aria-hidden="true" style="flex-shrink: 0">' +
  '<path d="M60 112V70" style="fill: none; stroke: var(--accent); stroke-width: 4; stroke-linecap: round"></path>' +
  '<path d="M60 72C30 72 14 56 14 36c0-14 11-24 24-24 9 0 16 5 22 12 6-7 13-12 22-12 13 0 24 10 24 24 0 20-16 36-46 36z" style="fill: var(--accent); fill-opacity: 0.85"></path>' +
  '<path d="M60 70V26M60 50L36 38M60 50l24-12M60 60L32 55M60 60l28-5" style="fill: none; stroke: var(--bg); stroke-width: 3; stroke-linecap: round; opacity: 0.5"></path>' +
  '<path d="M18 40l12 3M102 40l-12 3M26 58l11-4M94 58l-11-4" style="fill: none; stroke: var(--bg); stroke-width: 5; stroke-linecap: round"></path>' +
  '</svg>';

const expand = (t) =>
  t.replace('__HEAD__', head)
    .replace(/\[\[i:([a-z]+)(?::(\d+))?\]\]/g, (m, n, sz) => icon(n, sz || 22))
    .replace(/\[\[leaf:(\d+)\]\]/g, (m, sz) => leaf(sz));

const outDir = path.join(base, 'project');
fs.mkdirSync(outDir, { recursive: true });

const screens = [
  ['Dashboard', '1 · Dashboard-Karten', 980],
  ['Main', '2 · Übersicht „Heute gießen“', 1180],
  ['Detail', '3 · Detail Monstera mit Chart', 2230],
  ['Fotocheck', '4 · Foto-Check', 2080],
  ['Wizard', '5 · Anlege-Wizard', 844],
  ['Kalibrierung', '6 · Kalibrier-Assistent', 980],
  ['Push', '7 · Push-Benachrichtigung', 844]
];

const boards = {};
const order = [];
const ROW2 = 2230 + 420;
screens.forEach(([name, title, h], i) => {
  const t = expand(tpl(name + '.dc.html'));
  for (const [sfx, theme, y, label] of [['', 'dark', 0, ''], ['-hell', 'light', ROW2, ' (hell)']]) {
    const out = t.replace(/__SFX__/g, sfx).replace(/__THEME__/g, theme);
    if (/__[A-Z]+__|\[\[(i|leaf):/.test(out)) throw new Error('unreplaced placeholder in ' + name + sfx);
    const file = name + sfx + '.dc.html';
    fs.writeFileSync(path.join(outDir, file), out);
    boards[file] = { x: i * 470, y: y, w: 390, h: h, title: title + label, is_interactive: true };
    order.push(file);
  }
});

const arch = expand(tpl('Architektur.dc.html'));
if (/__[A-Z]+__|\[\[(i|leaf):/.test(arch)) throw new Error('unreplaced placeholder in Architektur');
fs.writeFileSync(path.join(outDir, 'Architektur.dc.html'), arch);
boards['Architektur.dc.html'] = { x: 7 * 470, y: 0, w: 1280, h: 900, title: 'Architektur' };
order.push('Architektur.dc.html');

const canvas = {
  v: 3,
  createdOnFiles: { v: 1, at: new Date().toISOString().replace(/\.\d+Z$/, 'Z') },
  title: 'Rootwise Mockup v1',
  launch: { view: 'canvas' },
  pages: [],
  boards: boards,
  order: order,
  notes: {
    tdark: { x: 0, y: -300, text: 'Rootwise · Mockup v1 · Dunkel', kind: 'title1', maxW: 3200 },
    tlight: { x: 0, y: ROW2 - 300, text: 'Hell', kind: 'title1', maxW: 3200 },
    assume: {
      x: 7 * 470, y: 1000, w: 420, fill: 'green', size: 'm',
      text: 'Annahmen\n• Nur die Monstera spiegelt dein Setup (ThirdReality im Wohnzimmer). Calathea, Efeutute, Geigenfeige, Zamioculcas und Bogenhanf sind Beispielpflanzen.\n• Chart-Werte sind simuliert: 4 Gieß-Zyklen, Prognose Mi 30.09.\n• Play-Modus: Screens sind verlinkt, Knöpfe reagieren (Abhaken, Filter, 14/30 Tage, Tag vor/zurück, Wizard-Schritte, Kalibrierung, Push-Aktionen).\n• Tweaks: Hell/Dunkel pro Screen; Foto-Check zusätzlich Zustand „läuft“ und „Warteschlange“.\n• Fotos sind Platzhalter-Illustrationen.'
    }
  },
  designSystems: []
};
fs.writeFileSync(path.join(outDir, 'canvas.json'), JSON.stringify(canvas, null, 2));
console.log('boards', order.length);

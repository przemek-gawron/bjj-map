import { Resvg } from '@resvg/resvg-js';
import { mkdirSync, writeFileSync } from 'node:fs';

const LIME = '#C6F432';
const DARK = '#0B0B0F';
// Regenerate: npm i --no-save @resvg/resvg-js && node assets/brand/generate.mjs /tmp/icons, then copy into assets/images.
const OUT = process.argv[2] ?? 'out';
mkdirSync(OUT, { recursive: true });

// Mark: three position tiles chained by arrows into a loop (top → left → right → top),
// drawn in a 1024 box around (512, 512).
const TW = 220;
const TH = 160;
const TR = 48;
const SW = 30; // tile outline
const LW = 34; // arrow line
const AH = 70; // arrowhead length

// tiles sit on a circle; arrows run along it between them, top → left → right → top
const CX = 512;
const CY = 540;
const R = 300;
const ANGLES = [270, 150, 30];
const GAP = 36; // degrees kept clear on each side of a tile

const pt = (deg, r = R) => [CX + r * Math.cos((deg * Math.PI) / 180), CY + r * Math.sin((deg * Math.PI) / 180)];

function arc(from, to, color) {
  // counterclockwise on screen = decreasing angle
  const a1 = from - GAP;
  const a2 = to + GAP;
  const headDeg = (AH / (2 * Math.PI * R)) * 360;
  const [sx, sy] = pt(a1);
  const [bx, by] = pt(a2 + headDeg * 0.7);
  const [ex, ey] = pt(a2);
  // tangent of travel at the tip
  const t = ((a2 + headDeg * 0.5) * Math.PI) / 180;
  const ux = Math.sin(t);
  const uy = -Math.cos(t);
  const px = -uy;
  const py = ux;
  const w = AH * 0.62;
  const head = `M ${ex} ${ey} L ${ex - ux * AH + px * w} ${ey - uy * AH + py * w} L ${ex - ux * AH - px * w} ${ey - uy * AH - py * w} Z`;
  return `<path d="M ${sx} ${sy} A ${R} ${R} 0 0 0 ${bx} ${by}" stroke="${color}" stroke-width="${LW}" stroke-linecap="round" fill="none"/>
<path d="${head}" fill="${color}" stroke="${color}" stroke-width="10" stroke-linejoin="round"/>`;
}

function mark(fg, bg) {
  const arrows = [arc(270, 150, fg), arc(150, 30, fg), arc(30, -90, fg)].join('\n');
  const rects = ANGLES.map((deg, i) => {
    const [cx, cy] = pt(deg);
    const x = cx - TW / 2;
    const y = cy - TH / 2;
    return i === 0
      ? // filled tile split by a belt-rank bar (plain paths, no masks, so Icon Composer takes it too)
        `<path d="M ${x + TR} ${y} H ${x + TW - 92} V ${y + TH} H ${x + TR} A ${TR} ${TR} 0 0 1 ${x} ${y + TH - TR} V ${y + TR} A ${TR} ${TR} 0 0 1 ${x + TR} ${y} Z" fill="${fg}"/>
<path d="M ${x + TW - 48} ${y} H ${x + TW - TR} A ${TR} ${TR} 0 0 1 ${x + TW} ${y + TR} V ${y + TH - TR} A ${TR} ${TR} 0 0 1 ${x + TW - TR} ${y + TH} H ${x + TW - 48} Z" fill="${fg}"/>`
      : `<rect x="${x + SW / 2}" y="${y + SW / 2}" width="${TW - SW}" height="${TH - SW}" rx="${TR - SW / 2}" fill="${bg ?? 'none'}" stroke="${fg}" stroke-width="${SW}"/>`;
  }).join('\n');
  return `${arrows}\n${rects}`;
}

/** Wraps the mark scaled by `s` around the centre of a `size` canvas. */
function svg({ size = 1024, s = 1, fg = LIME, bg = null, tileBg = null }) {
  const k = (size / 1024) * s;
  const off = (size - 1024 * k) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
${bg ? `<rect width="${size}" height="${size}" fill="${bg}"/>` : ''}
<g transform="translate(${off} ${off}) scale(${k})">
${mark(fg, tileBg)}
</g>
</svg>`;
}

function png(name, source, width) {
  const out = new Resvg(source, { fitTo: { mode: 'width', value: width } }).render().asPng();
  writeFileSync(`${OUT}/${name}`, out);
}

const files = {
  'mark.svg': svg({}),
  'icon.svg': svg({ bg: DARK, s: 0.9, tileBg: DARK }),
  'splash.svg': svg({ tileBg: DARK }),
  'splash-light.svg': svg({ fg: '#4D7C0F', tileBg: '#F5F6F1' }),
  'adaptive-fg.svg': svg({ s: 0.56, tileBg: DARK }),
  'adaptive-bg.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><rect width="1024" height="1024" fill="${DARK}"/></svg>`,
  'monochrome.svg': svg({ s: 0.56, fg: '#FFFFFF' }),
};
for (const [name, source] of Object.entries(files)) writeFileSync(`${OUT}/${name}`, source);

png('icon.png', files['icon.svg'], 1024);
png('splash-icon.png', files['splash.svg'], 1024);
png('splash-icon-light.png', files['splash-light.svg'], 1024);
png('android-icon-foreground.png', files['adaptive-fg.svg'], 1024);
png('android-icon-background.png', files['adaptive-bg.svg'], 1024);
png('android-icon-monochrome.png', files['monochrome.svg'], 1024);
png('favicon.png', svg({ bg: DARK, s: 0.9, tileBg: DARK }), 48);
console.log('ok');

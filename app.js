/* ============================================================
   Elena's BBQ RSVP — app logic
   ============================================================ */

// ============== SUPABASE CONFIG ==============
const SUPABASE_URL = 'https://zihofwyeyhvnhatwtmju.supabase.co';
const SUPABASE_KEY = 'sb_publishable_OzfTQtRZ7hbzJ5ZJU7H3wQ_-xOYep1l';

// Initialize the Supabase client
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ============== TEST MODE ==============
// Enable by adding ?test=1 to the URL.
const TEST_MODE = new URLSearchParams(location.search).get('test') === '1';
if (TEST_MODE) document.getElementById('test-panel').classList.add('visible');
if (TEST_MODE) document.body.classList.add('test-mode');

// ============== APP CONSTANTS ==============
const BACKGROUNDS = {
  earlyMorning: 'bbq_background_early_morning.jpg',
  day:          'bbq_background.jpg',
  sunset:       'bbq_background_sunset.jpg',
  night:        'bbq_background_night.jpg',
};
const WELCOME_MESSAGE = "We're firing up the grill for Elena's birthday and have plenty to go around. No need to bring any gifts, your company is all we need! If you'd like to bring a dish or snack, anything shareable would be a hit :)";

const MAX_GUESTS = 50;
const TOKEN_KEY = 'bbq:my-token';

// ============== AVATAR DEFINITIONS ==============
const Y_OFFSET = 8;

function chickBase(overrides) {
  const Y = overrides?.body || '#F4E04A', YS = overrides?.shadow || '#D9C027', O = '#7A2A2A',
        P = '#E8A878', PS = '#B8784A', C = '#E89898', E = '#5A1818';
  const o = Y_OFFSET;
  return [
    [12,4+o,8,1,O],[10,5+o,2,1,O],[20,5+o,2,1,O],[9,6+o,1,1,O],[22,6+o,1,1,O],
    [8,7+o,1,2,O],[23,7+o,1,2,O],[7,9+o,1,5,O],[24,9+o,1,5,O],
    [6,14+o,1,4,O],[25,14+o,1,4,O],[7,18+o,1,2,O],[24,18+o,1,2,O],
    [8,20+o,1,2,O],[23,20+o,1,2,O],[9,22+o,2,1,O],[21,22+o,2,1,O],
    [11,23+o,10,1,O],[11,24+o,2,3,O],[19,24+o,2,3,O],
    [10,27+o,4,1,O],[18,27+o,4,1,O],
    [12,5+o,8,1,Y],[10,6+o,12,1,Y],[9,7+o,14,2,Y],[8,9+o,16,5,Y],
    [7,14+o,18,4,Y],[8,18+o,16,2,Y],[9,20+o,14,2,Y],[11,22+o,10,1,Y],
    [21,8+o,1,10,YS],[22,9+o,1,8,YS],[20,18+o,2,1,YS],[19,19+o,3,2,YS],[18,21+o,4,1,YS],
    [9,12+o,2,2,C],[21,12+o,2,2,C],
    [15,14+o,2,1,P],[15,15+o,2,1,E],
    [12,11+o,1,2,E],[19,11+o,1,2,E],[12,11+o,1,1,O],[19,11+o,1,1,O],
    [11,24+o,2,3,P],[19,24+o,2,3,P],[11,27+o,3,1,P],[18,27+o,3,1,P],
    [12,26+o,1,1,PS],[20,26+o,1,1,PS],
  ];
}

const HATS = {
  none: { name: 'None', pixels: () => [] },
  cap_red: {
    name: 'Baseball cap',
    pixels: () => {
      const c='#C73E3E', sh='#8A2424', o='#3D0808', btn='#FFD93D';
      return [[15,7,2,1,btn],[13,8,6,1,o],[12,9,8,1,c],[11,10,10,1,c],
              [11,10,1,1,o],[20,10,1,1,o],[11,11,10,1,o],[21,10,5,1,o],
              [21,11,6,1,c],[22,12,5,1,o],[13,9,6,1,sh]];
    }
  },
  flower_crown: {
    name: 'Flower crown',
    pixels: () => {
      const stem='#3B6D11', stemD='#264A0A', p1='#ED93B1', p1d='#C7568A',
            p2='#F4C842', p2d='#C99828', p3='#7F77DD', p3d='#534AB7',
            p4='#FFFFFF', ctr='#C73E3E';
      return [[10,10,12,1,stem],[9,10,1,1,stemD],[22,10,1,1,stemD],[10,11,12,1,stemD],
              [10,8,2,2,p1],[10,9,1,1,p1d],[11,9,1,1,ctr],
              [13,8,2,2,p2],[13,9,1,1,p2d],[14,9,1,1,ctr],
              [16,8,2,2,p3],[16,9,1,1,p3d],[17,9,1,1,ctr],
              [19,8,2,2,p4],[19,9,1,1,stemD],[20,9,1,1,ctr],
              [12,7,1,1,stem],[15,7,1,1,stem],[18,7,1,1,stem]];
    }
  },
  chef: {
    name: 'Chef hat',
    pixels: () => {
      const o='#888888', w='#FFFFFF', sh='#DDDDDD';
      return [[13,1,6,1,o],[12,2,8,1,w],[11,3,10,1,w],[11,3,1,1,o],[20,3,1,1,o],
              [10,4,12,1,w],[10,4,1,1,o],[21,4,1,1,o],[10,5,12,2,w],
              [10,5,1,2,o],[21,5,1,2,o],[11,7,10,1,w],[11,7,1,1,o],[20,7,1,1,o],
              [11,8,10,1,o],[11,9,10,2,w],[11,9,1,2,o],[20,9,1,2,o],[11,11,10,1,o],
              [18,3,1,1,sh],[19,4,1,1,sh],[19,5,1,2,sh],[19,9,1,2,sh]];
    }
  },
  party: {
    name: 'Party hat',
    pixels: () => {
      const c='#D85A30', stripe='#FFFFFF', o='#4A1408', pom1='#F4C842', pom2='#FFE066';
      return [[15,0,2,1,pom2],[14,1,4,1,pom1],[14,1,1,1,pom2],[17,1,1,1,pom2],
              [15,2,2,1,pom1],[15,3,2,1,o],[15,4,2,1,c],[14,5,4,1,c],
              [14,5,1,1,o],[17,5,1,1,o],[13,6,6,1,stripe],[13,6,1,1,o],[18,6,1,1,o],
              [13,7,6,1,c],[13,7,1,1,o],[18,7,1,1,o],[12,8,8,1,c],
              [12,8,1,1,o],[19,8,1,1,o],[12,9,8,1,stripe],[12,9,1,1,o],[19,9,1,1,o],
              [11,10,10,1,c],[11,10,1,1,o],[20,10,1,1,o],[11,11,10,1,o]];
    }
  },
  cowboy: {
    name: 'Cowboy hat',
    pixels: () => {
      const c='#8B5A2B', sh='#5C3A1A', o='#2A1810', band='#3F2A14';
      return [[13,4,2,1,o],[17,4,2,1,o],[15,5,2,1,o],[13,5,2,1,c],[17,5,2,1,c],
              [12,6,8,1,c],[12,6,1,1,o],[19,6,1,1,o],[11,7,10,1,c],
              [11,7,1,1,o],[20,7,1,1,o],[11,8,10,1,band],[11,8,1,1,o],[20,8,1,1,o],
              [11,9,10,1,o],[6,10,20,1,o],[5,11,22,1,c],[4,12,24,1,c],
              [4,12,1,1,o],[27,12,1,1,o],[4,13,24,1,o],[4,11,1,1,c],[27,11,1,1,c],
              [3,12,1,1,o],[28,12,1,1,o],[8,11,1,1,sh],[14,11,1,1,sh],[20,11,1,1,sh],
              [6,12,1,1,sh],[12,12,1,1,sh],[18,12,1,1,sh],[24,12,1,1,sh]];
    }
  },
};

const CLOTHES = {
  none: { name: 'None', pixels: () => [] },
  bowtie: {
    name: 'Bow tie',
    pixels: () => {
      const c='#C73E3E', sh='#8A2424', o='#3D0808';
      return [[13,24,1,3,o],[14,24,1,1,c],[14,25,1,1,c],[14,26,1,1,sh],
              [18,24,1,3,o],[17,24,1,1,c],[17,25,1,1,c],[17,26,1,1,sh],
              [15,24,2,1,o],[15,25,2,1,c],[15,26,2,1,o]];
    }
  },
  pool_floatie: {
    name: 'Pool floatie',
    pixels: () => {
      const c='#FF8AB4', sh='#D45A8C', o='#7A2A4A', hi='#FFCDDC';
      return [[3,24,3,1,o],[2,25,4,2,c],[2,25,1,2,o],[2,27,4,2,c],[3,29,3,1,o],
              [26,24,3,1,o],[26,25,4,2,c],[29,25,1,2,o],[26,27,4,2,c],[26,29,3,1,o],
              [6,23,20,1,o],[6,24,1,1,o],[25,24,1,1,o],[6,30,20,1,c],
              [6,29,1,1,o],[25,29,1,1,o],[6,31,20,1,o],
              [3,25,1,1,hi],[27,25,1,1,hi],[9,30,2,1,hi],[18,30,2,1,hi],[7,30,18,1,sh]];
    }
  },
  hawaiian_pink: {
    name: 'Pink Hawaiian',
    pixels: () => {
      const c='#ED93B1', sh='#C7568A', o='#7A2A4A', f1='#F4C842', f2='#5DCAA5',
            leaf='#3B6D11', white='#FFF0F5';
      return [[13,24,1,1,o],[18,24,1,1,o],[14,24,4,1,white],
              [10,25,1,1,o],[21,25,1,1,o],[10,26,12,5,c],
              [9,26,1,4,c],[22,26,1,4,c],[9,26,1,1,o],[22,26,1,1,o],
              [9,30,1,1,o],[22,30,1,1,o],[10,31,12,1,o],
              [11,27,1,1,f1],[14,28,1,1,f2],[17,27,1,1,leaf],[20,28,1,1,f1],
              [12,29,1,1,leaf],[19,29,1,1,f2],[15,30,1,1,f1],
              [16,26,1,1,white],[16,28,1,1,white],[16,30,1,1,white]];
    }
  },
  hawaiian: {
    name: 'Green Hawaiian',
    pixels: () => {
      const c='#5DCAA5', sh='#1D9E75', o='#0F4A36', f1='#ED93B1', f2='#F4C842',
            leaf='#3B6D11', white='#F0F8E8';
      return [[13,24,1,1,o],[18,24,1,1,o],[14,24,4,1,white],
              [10,25,1,1,o],[21,25,1,1,o],[10,26,12,5,c],
              [9,26,1,4,c],[22,26,1,4,c],[9,26,1,1,o],[22,26,1,1,o],
              [9,30,1,1,o],[22,30,1,1,o],[10,31,12,1,o],
              [11,27,1,1,f1],[14,28,1,1,f2],[17,27,1,1,leaf],[20,28,1,1,f1],
              [12,29,1,1,leaf],[19,29,1,1,f2],[15,30,1,1,f1],
              [16,26,1,1,white],[16,28,1,1,white],[16,30,1,1,white]];
    }
  },
  boots: {
    name: 'Boots',
    pixels: () => {
      const leather='#7A4018', leatherD='#4A2410', leatherL='#A86438',
            sole='#2A1408', lace='#F4C842';
      return [[10,30,4,1,leatherD],[10,31,4,1,leather],[10,32,4,1,leather],
              [10,33,4,1,leather],[10,33,1,3,leatherD],[13,33,1,3,leatherD],
              [11,34,2,2,leather],[13,34,1,2,leatherL],[10,36,4,1,sole],
              [11,31,1,1,lace],[11,32,1,1,lace],[10,30,4,1,leatherL],
              [18,30,4,1,leatherD],[18,31,4,1,leather],[18,32,4,1,leather],
              [18,33,4,1,leather],[18,33,1,3,leatherD],[21,33,1,3,leatherD],
              [19,34,2,2,leather],[21,34,1,2,leatherL],[18,36,4,1,sole],
              [19,31,1,1,lace],[19,32,1,1,lace],[18,30,4,1,leatherL]];
    }
  },
};

// ============== AVATAR RENDERING ==============
function renderToString(choice) {
  const chick = chickBase();
  const clothes = (CLOTHES[choice.clothes] || CLOTHES.none).pixels();
  const hat = (HATS[choice.hat] || HATS.none).pixels();
  let body = '';
  if (choice.clothes === 'pool_floatie') {
    for (const [x, y, w, h, c] of clothes) {
      if (y < 24) body += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
    }
    for (const [x, y, w, h, c] of chick) {
      body += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
    }
    for (const [x, y, w, h, c] of clothes) {
      if (y >= 24) body += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
    }
  } else {
    for (const [x, y, w, h, c] of chick) {
      body += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
    }
    for (const [x, y, w, h, c] of clothes) {
      body += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
    }
  }
  for (const [x, y, w, h, c] of hat) {
    body += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
  }
  return `<svg viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">${body}</svg>`;
}

function renderAvatar(targetEl, choice) {
  const html = renderToString(choice);
  const inner = html.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
  targetEl.innerHTML = inner;
  targetEl.setAttribute('shape-rendering', 'crispEdges');
}

function renderMascotSvg() {
  const pixels = chickBase({ body: '#FFFFFF', shadow: '#E0E0E0' });
  let body = '';
  for (const [x, y, w, h, c] of pixels) {
    body += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
  }
  return `<svg viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">${body}</svg>`;
}

// ============== STATE ==============
let currentChoice = { clothes: 'none', hat: 'none' };
let guests = [];
const positions = new Map();
let myToken = null;
let soundEnabled = localStorage.getItem('bbq:sound-enabled') !== 'false';

// ============== TOKEN (browser-stored, used to identify the current user) ==============
function getOrCreateToken() {
  let token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    token = 'tok_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(TOKEN_KEY, token);
  }
  return token;
}

function findMyRsvp() {
  return guests.find(g => g.token === myToken);
}

// ============== PLACEMENT ==============
const CHICK_HALF_WIDTH = 3;
const NAME_LABEL_HALF = 5;
const SAFE_X_MARGIN = Math.max(CHICK_HALF_WIDTH, NAME_LABEL_HALF) + 2;
const CHICK_HEIGHT_PCT = 12;
const SAFE_BOTTOM_MARGIN = 4;

const YARD = {
  xMin: SAFE_X_MARGIN,
  xMax: 100 - SAFE_X_MARGIN,
  yMin: 55,
  yMax: 82,
};
const MIN_DIST = 11;


function isValidSpot(x, y, ignoreToken) {
  if (x < YARD.xMin || x > YARD.xMax || y < YARD.yMin || y > YARD.yMax) return false;
  for (const g of guests) {
    if (g.token === ignoreToken) continue;
    const home = homePosition(g);
    const dx = home.x - x, dy = home.y - y;
    if (Math.sqrt(dx * dx + dy * dy) < MIN_DIST) return false;
  }
  return true;
}

function homeFromSeed(seed) {
  const s2 = ((seed * 9301 + 49297) % 233280) / 233280;
  return {
    x: YARD.xMin + seed * (YARD.xMax - YARD.xMin),
    y: YARD.yMin + s2 * (YARD.yMax - YARD.yMin),
  };
}

function homePosition(g) {
  if (g.pos_x != null && g.pos_y != null) return { x: g.pos_x, y: g.pos_y };
  return homeFromSeed(g.seed);
}

function generateGoodSeed() {
  for (let attempt = 0; attempt < 200; attempt++) {
    const seed = Math.random();
    const home = homeFromSeed(seed);
    if (isValidSpot(home.x, home.y, null)) return seed;
  }
  return Math.random();
}

// ============== WANDERING ==============
const WANDER_RADIUS = 3.5;
const STEP_INTERVAL_MIN = 2500;
const STEP_INTERVAL_MAX = 6000;

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function pickWanderTarget(home) {
  const angle = Math.random() * Math.PI * 2;
  const dist = Math.random() * WANDER_RADIUS;
  const x = home.x + Math.cos(angle) * dist;
  const y = home.y + Math.sin(angle) * dist;
  return constrainToYard(x, y);
}

function startWandering(token, wrapEl) {
  function step() {
    const guest = guests.find(g => g.token === token);
    if (!guest) return;
    if (!wanderPaused.has(token) && Math.random() > 0.25) {
      const home = homePosition(guest);
      const target = pickWanderTarget(home);
      const prev = positions.get(token) || home;
      positions.set(token, target);
      const guestEl = wrapEl.querySelector('.guest');
      if (guestEl) {
        if (target.x < prev.x - 0.2) guestEl.classList.add('facing-left');
        else if (target.x > prev.x + 0.2) guestEl.classList.remove('facing-left');
      }
      wrapEl.style.left = target.x + '%';
      wrapEl.style.top = target.y + '%';
      updateTooltipAnchor(wrapEl, target.x);
    }
    const next = STEP_INTERVAL_MIN + Math.random() * (STEP_INTERVAL_MAX - STEP_INTERVAL_MIN);
    setTimeout(step, next);
  }
  setTimeout(step, Math.random() * 2000);
}

function updateTooltipAnchor(wrapEl, xPct) {
  const tooltip = wrapEl.querySelector('.guest-tooltip');
  if (!tooltip) return;
  tooltip.classList.remove('anchor-left', 'anchor-right');
  if (xPct < 18) tooltip.classList.add('anchor-left');
  else if (xPct > 82) tooltip.classList.add('anchor-right');
}

// ============== DRAG & TAP ==============
const wanderPaused = new Set();
let justDragged = false;
let lastTapTime = 0;

const dragState = {
  active: false,
  wrapEl: null,
  pointerStartX: 0,
  pointerStartY: 0,
  chickStartX: 0,
  chickStartY: 0,
  moved: false,
};

function getPointerPos(e) {
  const t = e.touches ? e.touches[0] : e;
  return { pageX: t.pageX, pageY: t.pageY };
}

function constrainToYard(x, y) {
  return {
    x: clamp(x, YARD.xMin, YARD.xMax),
    y: clamp(y, YARD.yMin, YARD.yMax),
  };
}

function isUIElement(el) {
  return el.closest('.invite-card') || el.closest('.modal-backdrop') ||
         el.closest('.test-panel') || el.closest('.loading-overlay') ||
         el.closest('.error-overlay') || el.closest('.sound-toggle');
}

function onYardPointerDown(e) {
  if (isUIElement(e.target)) return;
  const chickWrap = e.target.closest('.guest-wrap');
  if (chickWrap && !chickWrap.classList.contains('my-chick')) return;
  if (!findMyRsvp()) return;
  const wrap = document.querySelector('.guest-wrap.my-chick');
  if (!wrap) return;
  if (dragState.active) return;

  e.preventDefault();
  const pos = getPointerPos(e);
  const chickPos = positions.get(myToken) || homePosition(findMyRsvp());

  dragState.active = true;
  dragState.wrapEl = wrap;
  dragState.pointerStartX = pos.pageX;
  dragState.pointerStartY = pos.pageY;
  dragState.chickStartX = chickPos.x;
  dragState.chickStartY = chickPos.y;
  dragState.moved = false;

  wanderPaused.add(myToken);
  chirpedThisSession = false;
  wrap.classList.add('dragging');
  wrap.style.transition = 'none';
  displacedTokens.clear();
}

function onPointerMove(e) {
  if (!dragState.active) return;
  e.preventDefault();
  const pos = getPointerPos(e);
  const dx = pos.pageX - dragState.pointerStartX;
  const dy = pos.pageY - dragState.pointerStartY;
  if (Math.abs(dx) > 5 || Math.abs(dy) > 5) dragState.moved = true;

  const rect = document.getElementById('bbq-app').getBoundingClientRect();
  const dxPct = (dx / rect.width) * 100;
  const dyPct = (dy / rect.height) * 100;

  const c = constrainToYard(dragState.chickStartX + dxPct, dragState.chickStartY + dyPct);
  dragState.wrapEl.style.left = c.x + '%';
  dragState.wrapEl.style.top = c.y + '%';
  positions.set(myToken, c);
  updateTooltipAnchor(dragState.wrapEl, c.x);
  displaceNearbyChicks(c.x, c.y);
}

function onPointerUp() {
  if (!dragState.active) return;
  const wrap = dragState.wrapEl;
  const moved = dragState.moved;
  wrap.classList.remove('dragging');
  wrap.style.transition = '';
  dragState.active = false;
  wanderPaused.delete(myToken);

  if (moved) {
    justDragged = true;
    const pos = positions.get(myToken);
    if (pos) {
      const guest = findMyRsvp();
      if (guest) { guest.pos_x = pos.x; guest.pos_y = pos.y; }
      savePosition(myToken, pos.x, pos.y);
    }
    saveDisplacedChicks();
  } else {
    handleChickTap(wrap);
  }
}

function handleChickTap(wrapEl) {
  document.querySelectorAll('.guest-wrap.show-tooltip').forEach(el => {
    el.classList.remove('show-tooltip');
  });
  const now = Date.now();
  if (now - lastTapTime < 300) {
    lastTapTime = 0;
    doSmash(wrapEl);
  } else {
    lastTapTime = now;
    doJump(wrapEl);
  }
}

function doJump(wrapEl) {
  wrapEl.classList.remove('jumping', 'smash-rising', 'smash-hovering', 'smashing');
  void wrapEl.offsetWidth;
  wrapEl.classList.add('jumping');
  wrapEl.addEventListener('animationend', function h() {
    wrapEl.classList.remove('jumping');
    wrapEl.removeEventListener('animationend', h);
  });
}

function doSmash(wrapEl) {
  chirpedThisSession = false;
  wrapEl.classList.remove('jumping', 'smash-rising', 'smash-hovering', 'smashing');
  void wrapEl.offsetWidth;

  // Phase 1: rise to apex
  wrapEl.classList.add('smash-rising');
  wrapEl.addEventListener('animationend', function rise() {
    wrapEl.removeEventListener('animationend', rise);
    wrapEl.classList.remove('smash-rising');

    // Phase 2: hover at apex
    wrapEl.classList.add('smash-hovering');
    setTimeout(() => {
      wrapEl.classList.remove('smash-hovering');

      // Phase 3: slam down
      wrapEl.classList.add('smashing');
      setTimeout(() => {
        createSmashPuff(wrapEl);
        smashLand(wrapEl);
      }, 90);
      wrapEl.addEventListener('animationend', function slam() {
        wrapEl.classList.remove('smashing');
        wrapEl.removeEventListener('animationend', slam);
      });
    }, 100);
  });
}

function smashLand(wrapEl) {
  const pos = positions.get(myToken);
  if (!pos) return;

  const newY = Math.min(pos.y + SMASH_DROP, YARD.yMax);
  pos.y = newY;
  wrapEl.style.top = newY + '%';
  positions.set(myToken, pos);
  const guest = findMyRsvp();
  if (guest) { guest.pos_y = newY; }
  savePosition(myToken, pos.x, newY);

  for (const g of guests) {
    if (g.token === myToken) continue;
    const gPos = positions.get(g.token);
    if (!gPos) continue;
    const dx = gPos.x - pos.x;
    const dy = gPos.y - pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist >= SMASH_RADIUS) continue;

    let pushX, pushY;
    if (dist < 0.1) {
      const angle = Math.random() * Math.PI * 2;
      pushX = Math.cos(angle) * SMASH_NUDGE;
      pushY = Math.sin(angle) * SMASH_NUDGE;
    } else {
      pushX = (dx / dist) * SMASH_NUDGE;
      pushY = (dy / dist) * SMASH_NUDGE;
    }

    const newPos = constrainToYard(gPos.x + pushX, gPos.y + pushY);
    const wrap = document.querySelector(`.guest-wrap[data-token="${g.token}"]`);
    if (!wrap) continue;

    playChirp();
    createDustPuff(wrap);

    wrap.classList.add('being-smashed');
    wrap.style.left = newPos.x + '%';
    wrap.style.top = newPos.y + '%';
    positions.set(g.token, newPos);
    updateTooltipAnchor(wrap, newPos.x);
    g.pos_x = newPos.x;
    g.pos_y = newPos.y;
    savePosition(g.token, newPos.x, newPos.y);

    const timeoutKey = 'smash_' + g.token;
    if (pushTimeouts.has(timeoutKey)) clearTimeout(pushTimeouts.get(timeoutKey));
    pushTimeouts.set(timeoutKey, setTimeout(() => {
      const w = document.querySelector(`.guest-wrap[data-token="${g.token}"]`);
      if (w) w.classList.remove('being-smashed');
      pushTimeouts.delete(timeoutKey);
    }, 300));
  }
}

function createDustPuff(wrapEl) {
  const count = 9;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'dust-particle';
    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
    const dist = 20 + Math.random() * 35;
    p.style.setProperty('--dx', (Math.cos(angle) * dist) + 'px');
    p.style.setProperty('--dy', (Math.sin(angle) * dist * 0.4) + 'px');
    p.style.setProperty('--size', (7 + Math.random() * 7) + 'px');
    p.style.animationDelay = (Math.random() * 50) + 'ms';
    wrapEl.appendChild(p);
    setTimeout(() => p.remove(), 600);
  }
}

function createSmashPuff(wrapEl) {
  const count = 18;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'dust-particle smash-dust';
    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
    const dist = 35 + Math.random() * 50;
    p.style.setProperty('--dx', (Math.cos(angle) * dist) + 'px');
    p.style.setProperty('--dy', (Math.sin(angle) * dist * 0.4) + 'px');
    p.style.setProperty('--size', (10 + Math.random() * 10) + 'px');
    p.style.animationDelay = (Math.random() * 60) + 'ms';
    wrapEl.appendChild(p);
    setTimeout(() => p.remove(), 700);
  }
}

document.getElementById('bbq-app').addEventListener('mousedown', onYardPointerDown);
document.getElementById('bbq-app').addEventListener('touchstart', onYardPointerDown, { passive: false });
document.addEventListener('mousemove', onPointerMove);
document.addEventListener('mouseup', onPointerUp);
document.addEventListener('touchmove', onPointerMove, { passive: false });
document.addEventListener('touchend', onPointerUp);

async function savePosition(token, x, y) {
  const { error } = await db
    .from('rsvps')
    .update({ pos_x: x, pos_y: y })
    .eq('token', token);
  if (error) console.error('Failed to save position:', error);
}

// ============== CHICK DISPLACEMENT ==============
const PERSONAL_SPACE = 8;
const NUDGE_AMOUNT = 1.5;
const SMASH_NUDGE = NUDGE_AMOUNT * 6;
const SMASH_DROP = 3;
const SMASH_RADIUS = PERSONAL_SPACE * 1.5;
const displacedTokens = new Set();
const pushTimeouts = new Map();

// ============== CHIRP SOUND ==============
let audioCtx = null;
let chirpedThisSession = false;

function playChirp() {
  if (!soundEnabled) return;
  if (chirpedThisSession) return;
  chirpedThisSession = true;

  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const ctx = audioCtx;
  const t = ctx.currentTime;

  function chirp(start) {
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(2000, start);
    osc.frequency.exponentialRampToValueAtTime(3500, start + 0.06);
    filter.type = 'bandpass';
    filter.frequency.value = 2500;
    filter.Q.value = 5;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.15, start + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.06);
    osc.connect(filter).connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.06);
  }

  chirp(t);
  chirp(t + 0.14);
}


function displaceNearbyChicks(myX, myY) {
  for (const g of guests) {
    if (g.token === myToken) continue;

    const pos = positions.get(g.token);
    if (!pos) continue;

    const dx = pos.x - myX;
    const dy = pos.y - myY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist >= PERSONAL_SPACE) continue;

    let pushX, pushY;
    if (dist < 0.1) {
      const angle = Math.random() * Math.PI * 2;
      pushX = Math.cos(angle) * NUDGE_AMOUNT;
      pushY = Math.sin(angle) * NUDGE_AMOUNT;
    } else {
      pushX = (dx / dist) * NUDGE_AMOUNT;
      pushY = (dy / dist) * NUDGE_AMOUNT;
    }

    const newPos = constrainToYard(pos.x + pushX, pos.y + pushY);

    // Loose chain-reaction check — only block if very close to another chick
    let blocked = false;
    for (const other of guests) {
      if (other.token === myToken || other.token === g.token) continue;
      const op = positions.get(other.token);
      if (!op) continue;
      const odx = newPos.x - op.x, ody = newPos.y - op.y;
      if (Math.sqrt(odx * odx + ody * ody) < PERSONAL_SPACE / 2) { blocked = true; break; }
    }
    if (blocked) continue;
    playChirp();

    const wrap = document.querySelector(`.guest-wrap[data-token="${g.token}"]`);
    if (!wrap) continue;

    wrap.classList.add('being-pushed');
    wrap.style.left = newPos.x + '%';
    wrap.style.top = newPos.y + '%';

    // Remove fast-transition class after 1s of no further nudges
    if (pushTimeouts.has(g.token)) clearTimeout(pushTimeouts.get(g.token));
    pushTimeouts.set(g.token, setTimeout(() => {
      const w = document.querySelector(`.guest-wrap[data-token="${g.token}"]`);
      if (w) w.classList.remove('being-pushed');
      pushTimeouts.delete(g.token);
    }, 1000));

    positions.set(g.token, newPos);
    updateTooltipAnchor(wrap, newPos.x);
    g.pos_x = newPos.x;
    g.pos_y = newPos.y;

    const guestEl = wrap.querySelector('.guest');
    if (guestEl) {
      if (pushX < -0.2) guestEl.classList.add('facing-left');
      else if (pushX > 0.2) guestEl.classList.remove('facing-left');
    }

    displacedTokens.add(g.token);
  }
}

async function saveDisplacedChicks() {
  const tokens = [...displacedTokens];
  displacedTokens.clear();
  for (const token of tokens) {
    const pos = positions.get(token);
    if (pos) {
      savePosition(token, pos.x, pos.y).catch(err =>
        console.error('Failed to save displaced chick:', err)
      );
    }
  }
}

// ============== GUEST RENDERING ==============
function renderGuests() {
  if (dragState.active) return;
  if (typeof walkLoopId !== 'undefined' && walkLoopId) {
    cancelAnimationFrame(walkLoopId);
    walkLoopId = null;
    keysHeld.clear();
    wanderPaused.delete(myToken);
  }
  const layer = document.getElementById('guest-layer');
  layer.innerHTML = '';
  positions.clear();

  for (const g of guests) {
    const wrap = document.createElement('div');
    wrap.className = 'guest-wrap';
    wrap.dataset.token = g.token;
    const home = homePosition(g);
    positions.set(g.token, home);
    wrap.style.left = home.x + '%';
    wrap.style.top = home.y + '%';
    wrap.style.width = '6%';
    wrap.style.minWidth = '40px';
    wrap.style.maxWidth = '80px';

    const chickEl = document.createElement('div');
    chickEl.className = 'guest';
    chickEl.style.animationDelay = (g.seed * 1.4) + 's';
    chickEl.innerHTML = renderToString({ clothes: g.clothes, hat: g.hat });

    const nameEl = document.createElement('div');
    nameEl.className = 'guest-name';
    nameEl.textContent = g.name;

    wrap.appendChild(nameEl);
    wrap.appendChild(chickEl);

    if (g.note && g.note.trim()) {
      const tooltip = document.createElement('div');
      tooltip.className = 'guest-tooltip';
      tooltip.textContent = '"' + g.note + '"';
      wrap.appendChild(tooltip);
    }

    updateTooltipAnchor(wrap, home.x);

    wrap.addEventListener('mouseenter', () => wrap.classList.add('show-tooltip'));
    wrap.addEventListener('mouseleave', () => wrap.classList.remove('show-tooltip'));
    wrap.addEventListener('click', (e) => {
      if (justDragged) { justDragged = false; return; }
      if (g.token === myToken) return;
      e.stopPropagation();
      document.querySelectorAll('.guest-wrap.show-tooltip').forEach(el => {
        if (el !== wrap) el.classList.remove('show-tooltip');
      });
      wrap.classList.toggle('show-tooltip');
    });

    if (g.token === myToken) {
      wrap.classList.add('my-chick');
    }

    layer.appendChild(wrap);
    startWandering(g.token, wrap);
  }
  updateTestCount();
}

// Click outside any chick clears tooltips
document.getElementById('bbq-app').addEventListener('click', (e) => {
  if (!e.target.closest('.guest-wrap')) {
    document.querySelectorAll('.guest-wrap.show-tooltip').forEach(el => {
      el.classList.remove('show-tooltip');
    });
  }
});

// ============== SUPABASE STORAGE ==============
async function loadGuests() {
  const { data, error } = await db
    .from('rsvps')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  guests = data || [];
}

async function saveNewGuest(guest) {
  const { data, error } = await db
    .from('rsvps')
    .insert([guest])
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function deleteMyGuest() {
  const { error } = await db
    .from('rsvps')
    .delete()
    .eq('token', myToken);

  if (error) throw error;
}

async function deleteTestChicks() {
  const { error } = await db
    .from('rsvps')
    .delete()
    .eq('is_test', true);

  if (error) throw error;
}

// ============== UI: BUTTON STATE ==============
function updateButtons() {
  const row = document.getElementById('btn-row');
  row.innerHTML = '';
  const myRsvp = findMyRsvp();

  if (myRsvp) {
    const unBtn = document.createElement('button');
    unBtn.className = 'unrsvp-cta';
    unBtn.textContent = 'Un-RSVP';
    unBtn.onclick = openUnrsvpModal;
    row.appendChild(unBtn);
  } else if (guests.length >= MAX_GUESTS) {
    const fullBtn = document.createElement('button');
    fullBtn.className = 'rsvp-cta';
    fullBtn.textContent = 'Yard is full!';
    fullBtn.disabled = true;
    row.appendChild(fullBtn);
  } else {
    const btn = document.createElement('button');
    btn.className = 'rsvp-cta';
    btn.textContent = 'RSVP';
    btn.onclick = openRsvpModal;
    row.appendChild(btn);
  }
}

// ============== MODAL ==============
const modal = document.getElementById('modal-backdrop');
const modalContent = document.getElementById('modal-content');

function openRsvpModal() {
  modalContent.innerHTML = `
    <p class="modal-title">Dress your chick & RSVP</p>
    <div class="welcome-message">${escapeHtml(WELCOME_MESSAGE)}</div>
    <input type="text" class="name-input" id="name-input" placeholder="Your name" maxlength="20" />
    <textarea class="note-input" id="note-input" placeholder="Leave a note (optional)" maxlength="150"></textarea>
    <div class="char-count"><span id="char-count">0</span>/150</div>
    <div class="builder-grid">
      <div class="preview-box">
        <svg id="avatar-preview" viewBox="0 0 32 40"></svg>
      </div>
      <div>
        <div class="layer-section">
          <span class="layer-label">Outfit</span>
          <div class="option-grid" id="opt-clothes"></div>
        </div>
        <div class="layer-section">
          <span class="layer-label">Hat</span>
          <div class="option-grid" id="opt-hat"></div>
        </div>
      </div>
    </div>
    <button class="submit-btn" id="submit-btn">RSVP and join the yard</button>
  `;
  rebuildAllOptions();
  renderAvatar(document.getElementById('avatar-preview'), currentChoice);
  document.getElementById('note-input').oninput = (e) => {
    document.getElementById('char-count').textContent = e.target.value.length;
  };
  document.getElementById('submit-btn').onclick = handleSubmit;
  modal.classList.add('open');
}

function openUnrsvpModal() {
  const myRsvp = findMyRsvp();
  if (!myRsvp) return;
  modalContent.innerHTML = `
    <p class="modal-title">Un-RSVP</p>
    <p class="modal-body-text">Are you sure you want to remove <strong>${escapeHtml(myRsvp.name)}</strong>'s chick from the yard?</p>
    <button class="danger-btn" id="confirm-unrsvp-btn">Yes, remove me</button>
    <button class="cancel-btn" id="cancel-unrsvp-btn">Never mind</button>
  `;
  document.getElementById('confirm-unrsvp-btn').onclick = handleUnrsvp;
  document.getElementById('cancel-unrsvp-btn').onclick = closeModal;
  modal.classList.add('open');
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function closeModal() {
  modal.classList.remove('open');
}
document.getElementById('modal-close-btn').onclick = closeModal;

function buildOptions(containerId, options, layerKey) {
  const c = document.getElementById(containerId);
  if (!c) return;
  c.innerHTML = '';
  for (const [key, opt] of Object.entries(options)) {
    const btn = document.createElement('div');
    btn.className = 'option-btn' + (currentChoice[layerKey] === key ? ' selected' : '');
    btn.title = opt.name;
    const previewChoice = layerKey === 'clothes'
      ? { clothes: key, hat: 'none' }
      : { clothes: 'none', hat: key };
    btn.innerHTML = renderToString(previewChoice);
    btn.onclick = () => {
      currentChoice[layerKey] = key;
      renderAvatar(document.getElementById('avatar-preview'), currentChoice);
      rebuildAllOptions();
    };
    c.appendChild(btn);
  }
}

function rebuildAllOptions() {
  buildOptions('opt-clothes', CLOTHES, 'clothes');
  buildOptions('opt-hat', HATS, 'hat');
}

async function handleSubmit() {
  const nameInput = document.getElementById('name-input');
  const submitBtn = document.getElementById('submit-btn');
  const name = nameInput.value.trim();
  const note = document.getElementById('note-input').value.trim();

  if (!name) {
    nameInput.focus();
    return;
  }
  if (guests.length >= MAX_GUESTS) return;

  // Disable button and show submitting state to prevent double-clicks
  submitBtn.disabled = true;
  submitBtn.textContent = 'Joining the yard...';

  try {
    const newGuest = {
      name,
      hat: currentChoice.hat,
      clothes: currentChoice.clothes,
      seed: generateGoodSeed(),
      note,
      token: myToken,
      is_test: false,
    };
    const saved = await saveNewGuest(newGuest);
    guests.push(saved);
    renderGuests();
    updateButtons();
    currentChoice = { clothes: 'none', hat: 'none' };

    modalContent.innerHTML = `
      <p class="modal-title">🎉 You're in!</p>
      <p class="modal-body-text">${escapeHtml(name)}'s chick has joined the yard.</p>
    `;
  } catch (err) {
    console.error('RSVP submission failed:', err);
    submitBtn.disabled = false;
    submitBtn.textContent = 'RSVP and join the yard';
    alert("Couldn't save your RSVP. Please check your connection and try again.");
  }
}

async function handleUnrsvp() {
  const confirmBtn = document.getElementById('confirm-unrsvp-btn');
  confirmBtn.disabled = true;
  confirmBtn.textContent = 'Removing...';

  try {
    await deleteMyGuest();
    guests = guests.filter(g => g.token !== myToken);
    renderGuests();
    updateButtons();
    modalContent.innerHTML = `
      <p class="modal-title">Removed</p>
      <p class="modal-body-text">Your chick has left the yard. You can RSVP again anytime.</p>
    `;
  } catch (err) {
    console.error('Un-RSVP failed:', err);
    confirmBtn.disabled = false;
    confirmBtn.textContent = 'Yes, remove me';
    alert("Couldn't remove your RSVP. Please check your connection and try again.");
  }
}

// ============== TEST MODE ==============
const FAKE_NAMES = ['Sam', 'Avery', 'Jordan', 'Quinn', 'Riley', 'Casey', 'Morgan',
  'Reese', 'Sage', 'River', 'Phoenix', 'Rowan', 'Skyler', 'Drew', 'Blake',
  'Emerson', 'Finley', 'Hayden', 'Jamie', 'Kendall', 'Logan', 'Parker',
  'Robin', 'Sasha', 'Taylor', 'Wren'];

const FAKE_NOTES = ['', 'Bringing pie!', '', 'Cant wait!', 'Vegan options please',
  '', 'Will arrive late', 'Bringing kids', 'Running 10 min behind', '',
  'Excited!!', 'Bringing watermelon', 'Need to leave by 8', '',
  'Allergic to peanuts', 'Bringing the dog', '', 'Have plus one',
  'Will bring drinks', 'Looking forward to it'];

const HAT_KEYS = Object.keys(HATS);
const CLOTH_KEYS = Object.keys(CLOTHES);

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function addTestChick() {
  if (guests.length >= MAX_GUESTS) return;
  const name = pickRandom(FAKE_NAMES) +
    (Math.random() > 0.7 ? ' ' + Math.floor(Math.random() * 100) : '');
  try {
    const saved = await saveNewGuest({
      name,
      hat: pickRandom(HAT_KEYS),
      clothes: pickRandom(CLOTH_KEYS),
      seed: generateGoodSeed(),
      note: pickRandom(FAKE_NOTES),
      token: 'test_' + Math.random().toString(36).slice(2),
      is_test: true,
    });
    guests.push(saved);
    renderGuests();
    updateButtons();
  } catch (err) {
    console.error('Failed to add test chick:', err);
  }
}

async function clearTestChicks() {
  try {
    await deleteTestChicks();
    guests = guests.filter(g => !g.is_test);
    renderGuests();
    updateButtons();
  } catch (err) {
    console.error('Failed to clear test chicks:', err);
  }
}

function updateTestCount() {
  const el = document.getElementById('test-count');
  if (!el) return;
  const total = guests.length;
  const tests = guests.filter(g => g.is_test).length;
  const real = total - tests;
  el.textContent = `${total} total · ${real} real · ${tests} test`;
}

if (TEST_MODE) {
  document.getElementById('add-test-chick').onclick = addTestChick;
  document.getElementById('add-five-chicks').onclick = async () => {
    for (let i = 0; i < 5; i++) await addTestChick();
  };
  document.getElementById('clear-test-chicks').onclick = clearTestChicks;
}

// ============== ERROR HANDLING ==============
function showError(msg) {
  const errorEl = document.getElementById('error-overlay');
  document.getElementById('error-text').textContent = msg ||
    "Something went wrong. Please refresh and try again.";
  errorEl.classList.add('visible');
  document.getElementById('loading-overlay').classList.add('hidden');
}

// ============== KEYBOARD CONTROLS ==============
const keysHeld = new Set();
const WALK_SPEED = 0.2;
let walkLoopId = null;
let lastSpaceTime = 0;

function isInputFocused() {
  const tag = document.activeElement?.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

function isModalOpen() {
  return modal.classList.contains('open');
}

function startWalkLoop() {
  if (walkLoopId) return;
  const wrap = document.querySelector('.guest-wrap.my-chick');
  if (!wrap) return;
  wanderPaused.add(myToken);
  chirpedThisSession = false;
  wrap.style.transition = 'none';
  displacedTokens.clear();

  function frame() {
    if (keysHeld.size === 0) {
      walkLoopId = null;
      wrap.style.transition = '';
      wanderPaused.delete(myToken);
      const pos = positions.get(myToken);
      if (pos) {
        const guest = findMyRsvp();
        if (guest) { guest.pos_x = pos.x; guest.pos_y = pos.y; }
        savePosition(myToken, pos.x, pos.y);
      }
      saveDisplacedChicks();
      return;
    }

    let dx = 0, dy = 0;
    if (keysHeld.has('ArrowLeft')) dx -= WALK_SPEED;
    if (keysHeld.has('ArrowRight')) dx += WALK_SPEED;
    if (keysHeld.has('ArrowUp')) dy -= WALK_SPEED;
    if (keysHeld.has('ArrowDown')) dy += WALK_SPEED;
    if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }

    if (dx !== 0 || dy !== 0) {
      const prev = positions.get(myToken) || homePosition(findMyRsvp());
      const c = constrainToYard(prev.x + dx, prev.y + dy);
      wrap.style.left = c.x + '%';
      wrap.style.top = c.y + '%';
      positions.set(myToken, c);
          updateTooltipAnchor(wrap, c.x);
      displaceNearbyChicks(c.x, c.y);

      const guestEl = wrap.querySelector('.guest');
      if (guestEl) {
        if (dx < 0) guestEl.classList.add('facing-left');
        else if (dx > 0) guestEl.classList.remove('facing-left');
      }
    }

    walkLoopId = requestAnimationFrame(frame);
  }
  walkLoopId = requestAnimationFrame(frame);
}

document.addEventListener('keydown', (e) => {
  if (isInputFocused() || isModalOpen()) return;
  if (!findMyRsvp()) return;

  if (e.key === ' ') {
    e.preventDefault();
    if (e.repeat) return;
    const wrap = document.querySelector('.guest-wrap.my-chick');
    if (!wrap) return;
    const now = Date.now();
    if (now - lastSpaceTime < 300) {
      lastSpaceTime = 0;
      doSmash(wrap);
    } else {
      lastSpaceTime = now;
      doJump(wrap);
    }
    return;
  }

  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
    e.preventDefault();
    if (!keysHeld.has(e.key)) {
      keysHeld.add(e.key);
      startWalkLoop();
    }
  }
});

document.addEventListener('keyup', (e) => {
  keysHeld.delete(e.key);
});

window.addEventListener('blur', () => keysHeld.clear());

// ============== MASCOT CHICK ==============
function showMascot() {
  if (window.innerWidth >= 768) return;
  const app = document.getElementById('bbq-app');
  const wrap = document.createElement('div');
  wrap.className = 'mascot-wrap';
  wrap.style.left = '50%';
  wrap.style.top = '60%';

  const chickEl = document.createElement('div');
  chickEl.className = 'guest';
  chickEl.innerHTML = renderMascotSvg();

  const bubble = document.createElement('div');
  bubble.className = 'mascot-bubble';
  bubble.textContent = 'Pssst. Try on desktop for the best experience.';

  wrap.appendChild(bubble);
  wrap.appendChild(chickEl);
  app.appendChild(wrap);

  wrap.addEventListener('transitionstart', () => {
    chickEl.classList.add('walking');
  });
  wrap.addEventListener('transitionend', (e) => {
    if (e.target === wrap && e.propertyName === 'left') wrap.remove();
  });

  let dismissed = false;
  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    document.removeEventListener('click', dismiss, true);
    document.removeEventListener('touchend', dismiss, true);
    bubble.classList.add('fading');
    wrap.style.left = '-15%';
  }

  document.addEventListener('click', dismiss, true);
  document.addEventListener('touchend', dismiss, true);
}

// ============== TIME-OF-DAY BACKGROUND ==============
function setTimeOfDayBackground() {
  const hour = new Date().getHours();
  let bg;
  if (hour >= 5 && hour < 8)       bg = BACKGROUNDS.earlyMorning;
  else if (hour >= 8 && hour < 17)  bg = BACKGROUNDS.day;
  else if (hour >= 17 && hour < 20) bg = BACKGROUNDS.sunset;
  else                               bg = BACKGROUNDS.night;
  document.getElementById('scene-bg').src = bg;
}

// ============== SOUND TOGGLE ==============
const SPEAKER_ON_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="#7A4018" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>';
const SPEAKER_OFF_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="#7A4018" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>';

const soundBtn = document.getElementById('sound-toggle');
function updateSoundBtn() {
  soundBtn.innerHTML = soundEnabled ? SPEAKER_ON_SVG : SPEAKER_OFF_SVG;
  soundBtn.title = soundEnabled ? 'Mute sounds' : 'Unmute sounds';
}
soundBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  soundEnabled = !soundEnabled;
  localStorage.setItem('bbq:sound-enabled', String(soundEnabled));
  updateSoundBtn();
});
updateSoundBtn();

// ============== INIT ==============
(async function init() {
  try {
    setTimeOfDayBackground();
    myToken = getOrCreateToken();
    await loadGuests();
    renderGuests();
    updateButtons();
    document.getElementById('loading-overlay').classList.add('hidden');
    showMascot();
  } catch (err) {
    console.error('Init failed:', err);
    showError("Couldn't connect to the database. Please check your internet connection and refresh.");
  }
})();

/* Arcade Agents landing — pixel-creature engine + interactive notch demo.
   Ported verbatim from the original index.html <script>. Loaded via next/script
   (afterInteractive) so it runs once against the server-rendered markup by id. */
/* =========================================================================
   Pixel creatures — ported from the app's Creature.swift.
   Body = which agent, crown = what it's doing, colour = status.
   16×16 grids; '#' solid, '+' mid, '.' empty (empty inside a body is an eye).
   ========================================================================= */
const B4 = "................";
const bodies = {
  claude:[[B4,B4,B4,B4,"..############..","..##..####..##..","..##..####..##..","..############..","..############..","..############..","..###......###..","..##........##..","..##........##..","..##........##..",B4,B4],
          [B4,B4,B4,B4,"..############..","..##..####..##..","..##..####..##..","..############..","..############..","..############..","..###......###..","..##........##..","..##........##..",".##..........##.",B4,B4]],
  codex:[[B4,B4,B4,B4,"...##########...","...##.####.##...","...##.####.##...","...##########...","..############..","..#..######..#..","..############..","..###......###..","...##......##...","...##......##...",B4,B4],
         [B4,B4,B4,B4,"...##########...","...##.####.##...","...##.####.##...","...##########...","..############..","..#..######..#..","..############..","..###......###..","...##......##...","..##........##..",B4,B4]],
  grok:[[B4,B4,B4,B4,"..############..",".###..####..###.",".###..####..###.","..############..",".##############.","..############..","..############..","..##..####..##..","..##..####..##..","..##..####..##..",B4,B4],
        [B4,B4,B4,B4,"..############..",".###..####..###.",".###..####..###.","..############..",".##############.","..############..","..############..","..##..####..##..","..##..####..##..",".##...####...##.",B4,B4]],
  kiro:[[B4,B4,B4,B4,".##############.",".##..######..##.",".##..######..##.",".##..######..##.",".##############.",".##############.",".####......####.",".###........###.",".###........###.",".###........###.",B4,B4],
        [B4,B4,B4,B4,".##############.",".##..######..##.",".##..######..##.",".##..######..##.",".##############.",".##############.",".####......####.",".###........###.",".###........###.","###..........###",B4,B4]],
};
const T12 = Array(12).fill(B4);
const c = r => r.concat(T12);
const crowns = {
  idle:[c([B4,B4,B4,".##############."]), c([B4,B4,B4,".##############."])],
  thinking:[c([B4,"...##......##...","...##......##...","...##......##..."]), c([B4,"..##........##..","..##........##..","...##......##..."])],
  shell:[c([B4,B4,"....##....##....","...##########..."]), c([B4,B4,"....##....##....","...##########..."])],
  needsApproval:[c(["....####........","....####........","....##..........","...##########..."]), c([B4,"...#####........","....##..........","..##########...."])],
  done:[c([B4,".#............#.","..#..##..##..#..","...##########..."]), c(["#..............#",".#............#.","..#..##..##..#..","...##########..."])],
};
function merge(agent, state){
  const body = bodies[agent] || bodies.claude;
  const crown = crowns[state] || crowns.idle;
  return [0,1].map(f=>{
    const b = body[f], cr = crown[f];
    return Array.from({length:16}, (_,r)=>{
      const br = b[r].split(''), c2 = cr[r].split('');
      return Array.from({length:16}, (_,x)=> br[x] !== '.' ? br[x] : c2[x]).join('');
    });
  });
}
const COL = {pink:"#fa87bf", green:"#8ce88c", yellow:"#fad96b"};
function statusColor(state){
  if(state==="done") return COL.green;
  if(["needsApproval","question","planReview","error"].includes(state)) return COL.yellow;
  return COL.pink; // idle/thinking/reading/writing/shell = active
}

/* render one creature onto a canvas, animating its two frames.
   Each sprite registers with a single shared clock and only repaints when on-screen —
   a page full of continuously-animating canvases is otherwise needless load. */
const SPRITES = [];
const spriteVisible = new WeakMap();
const spriteIO = new IntersectionObserver(es=> es.forEach(e=> spriteVisible.set(e.target, e.isIntersecting)), {rootMargin:"120px"});
function mountSprite(canvas, agent, state, colorKey){
  const frames = merge(agent, state);
  const color = colorKey ? COL[colorKey] : statusColor(state);
  const ctx = canvas.getContext('2d');
  const N = 16, W = canvas.width, cell = W / N;
  let fi = 0;
  function paint(){
    ctx.clearRect(0,0,W,canvas.height);
    ctx.fillStyle = color;
    const g = frames[fi];
    for(let y=0;y<N;y++) for(let x=0;x<N;x++){
      if(g[y][x] !== '.'){
        ctx.globalAlpha = g[y][x]==='+' ? .6 : 1;
        ctx.fillRect(Math.round(x*cell)+cell*0.06, Math.round(y*cell)+cell*0.06, cell*0.86, cell*0.86);
      }
    }
    ctx.globalAlpha = 1;
  }
  paint();
  spriteVisible.set(canvas, true);
  spriteIO.observe(canvas);
  const s = { canvas, tick(){ fi ^= 1; paint(); } };
  SPRITES.push(s);
  return s;
}

/* ---- the arcade-cabinet icon, drawn to canvas ---- */
/* The app icon, flat 2D — ink field, pink creature, three status pips. Same mark the DMG
   ships, drawn here rather than shipped as an image so the page stays self-contained. */
function mountCabinet(canvas){
  const ctx = canvas.getContext('2d'), S = canvas.width, U = S/100;
  ctx.clearRect(0,0,S,S);
  ctx.fillStyle = "#14121a";
  ctx.beginPath(); ctx.roundRect(5.5*U, 5.5*U, 89*U, 89*U, 21*U); ctx.fill();

  const g = merge("claude","idle")[0];
  const art = 56*U, cell = art/16, ox = 50*U - art/2, oy = 20*U;
  ctx.fillStyle = "#fa87bf";
  for(let y=0;y<16;y++) for(let x=0;x<16;x++)
    if(g[y][x] !== '.') ctx.fillRect(ox + x*cell, oy + y*cell, cell*0.9, cell*0.9);

  // pink · green · yellow — the whole colour language, stated once
  [["#fa87bf",36],["#8ce88c",50],["#fad96b",64]].forEach(([col,cx])=>{
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx*U, 82*U, 4*U, 0, 7); ctx.fill();
  });
}

/* =========================================================================
   Web Audio — the app's 8-bit blips, ported.
   ========================================================================= */
let AC;
function blip(notes, dur){
  try{
    AC = AC || new (window.AudioContext||window.webkitAudioContext)();
    const t0 = AC.currentTime;
    notes.forEach((f,i)=>{
      const o = AC.createOscillator(), g = AC.createGain();
      o.type = "square"; o.frequency.value = f;
      const t = t0 + i*dur;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.16, t+0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t+dur*0.95);
      o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t+dur);
    });
  }catch(e){}
}
const sndAllow = ()=> blip([660,990], 0.09);
const sndDeny  = ()=> blip([220,160], 0.14);
const sndBoot  = ()=> blip([523,659,784,1046], 0.08);

/* =========================================================================
   Mount all static sprites + icons
   ========================================================================= */
document.querySelectorAll('canvas[data-sprite]').forEach(cv=>{
  const [agent,state,color] = cv.dataset.sprite.split(':');
  mountSprite(cv, agent, state, color);
});
document.querySelectorAll('canvas[data-icon="cabinet"]').forEach(mountCabinet);

/* ONE clock for every sprite on the page. Skips off-screen canvases and pauses entirely when
   the tab is hidden, so the page isn't burning paint on things nobody's looking at. */
let clock = null;
function startClock(){
  if(clock) return;
  clock = setInterval(()=>{
    if(document.hidden) return;
    for(const s of SPRITES){
      if(spriteVisible.get(s.canvas) === false) continue;
      // don't repaint a creature sitting in a faded-out layer (opacity:0 still "intersects")
      const layer = s.canvas.closest('.layer');
      if(layer && getComputedStyle(layer).opacity === '0') continue;
      s.tick();
    }
  }, 520);
}
document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) startClock(); });
startClock();

/* =========================================================================
   Interactive island demo — a little state machine.
   ========================================================================= */
const island = document.getElementById('island');
const ears = document.getElementById('ears');
const panelBody = document.getElementById('panelBody');
const layerPanel = document.getElementById('layerPanel');
const collapsedActivity = document.getElementById('collapsedActivity');
const activeCount = document.getElementById('activeCount');
/* single source of truth for the collapsed height — read from the CSS var so the two can't drift */
const COLLAPSED_H = getComputedStyle(document.documentElement).getPropertyValue('--isl-h').trim() || '46px';

/* Open the island and animate its HEIGHT to exactly fit the panel content. CSS can't transition
   to `auto`, so we measure the panel's CONTENT (layer-panel is content-height, not stretched to
   the island bottom, so offsetHeight is the true content size regardless of the island's current
   height) and set an explicit pixel height — the transition then eases in BOTH directions. */
function openPanel(){
  island.classList.add('open');
  // Reading offsetHeight forces a synchronous layout, so this is the true content height AFTER
  // the width change from .open — no stale-frame race. Setting it inline drives the transition.
  island.style.height = layerPanel.offsetHeight + 'px';
}
function collapseIsland(){
  island.classList.remove('open');
  island.style.height = COLLAPSED_H;
}

const DEMO_AGENTS = [
  {agent:"claude", name:"Claude Code", where:"~/arcade-agents", tool:"Bash"},
  {agent:"codex",  name:"Codex",       where:"~/friday",        tool:"Edit"},
  {agent:"grok",   name:"Grok Build",  where:"~/sparrow",       tool:"Read"},
];
function renderEars(states){
  ears.innerHTML = "";
  DEMO_AGENTS.forEach((a,i)=>{
    const cv = document.createElement('canvas'); cv.width=36; cv.height=36;
    ears.appendChild(cv);
    mountSprite(cv, a.agent, states[i]);   // the shared clock animates it
  });
}
function gateCard(){
  activeCount.textContent = "1 needs you";
  panelBody.innerHTML = `
    <div class="gate-top">
      <canvas id="gateSprite" width="56" height="56"></canvas>
      <div><div class="gate-name">Claude Code</div><div class="gate-sub">needs approval · arcade-agents</div></div>
      <div class="gate-tool">Bash</div>
    </div>
    <div class="gate-risk"><span class="dot" style="background:var(--pink)"></span>
      <span class="accent-pink" style="font-weight:700">DESTRUCTIVE</span>
      <span style="color:var(--ink3)">recursive/forced delete</span></div>
    <div class="gate-cmd">rm -rf ./build &amp;&amp; npm run deploy --production</div>
    <div class="gate-actions">
      <button class="gate-btn deny" id="demoDeny">Deny</button>
      <button class="gate-btn allow" id="demoAllow">Allow</button>
    </div>`;
  mountSprite(document.getElementById('gateSprite'), "claude", "needsApproval");
  document.getElementById('demoAllow').onclick = ()=>{ sndAllow(); resolve("allow"); };
  document.getElementById('demoDeny').onclick  = ()=>{ sndDeny();  resolve("deny"); };
  openPanel();
}
function sessionList(){
  activeCount.textContent = "3 active";
  const states = ["shell","done","thinking"];
  const metas = ["12 tools · 2m","done · 5m","working · 41s"];
  panelBody.innerHTML = DEMO_AGENTS.map((a,i)=>{
    const st = states[i]; const col = statusColor(st);
    const label = st==="done"?"COMPLETED":(["needsApproval"].includes(st)?"NEEDS YOU":"ACTIVE");
    return `<div class="sess">
      <canvas class="ls" data-a="${a.agent}" data-s="${st}" width="48" height="48"></canvas>
      <div><div class="who">${a.name}</div><div class="where">${a.where}</div></div>
      <div class="meta">${metas[i]}</div>
    </div>`;
  }).join('') +
  `<div class="ctxbar">${Array.from({length:12},(_,i)=>`<div class="ctxseg" style="background:${i<8?'var(--pink)':'rgba(255,255,255,.1)'}"></div>`).join('')}</div>`;
  document.querySelectorAll('.sess .ls').forEach(cv=> mountSprite(cv, cv.dataset.a, cv.dataset.s));
  openPanel();
}
function collapse(){
  collapseIsland();
  renderEars(["shell","done","thinking"]);
  collapsedActivity.textContent = "Running Bash";
}

/* =========================================================================
   The victory lap — ported from Celebration.swift.
   When an agent finishes, its creature runs the island, hopping, throwing off pixel sparks
   in the three status colours. 1.5s, then the island snaps back to its ear.
   ========================================================================= */
const lapCanvas = document.getElementById('lapCanvas');
const LAP_MS = 1500, LAP_SPARKS = 20;

/* Draw one lap onto any canvas. `onEnd` lets the island collapse afterwards while the
   standalone feature-card demo simply loops. */
/* One frame of the lap at progress p (0…1). Pure — no timers — so the island's one-shot lap and
   the feature card's continuous loop can both drive it. */
function paintLapFrame(canvas, agent, p){
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const frames = merge(agent, "done");                 // green: completed
  const size = Math.min(46, H - 8), cell = size/16, run = W - size, mid = H/2;
  ctx.clearRect(0,0,W,H);

  // sparks exist only BEHIND the runner, and only briefly
  for(let i=0;i<LAP_SPARKS;i++){
    const at = i/(LAP_SPARKS-1), age = p - at;
    if(age <= 0 || age >= 0.30) continue;
    const fade = 1 - age/0.30;
    const x = at*run + size/2;
    // deterministic scatter — a real RNG would re-roll each frame and the sparks would jitter
    const j = Math.sin(i*12.9898)*43758.5453;
    const side = (j - Math.floor(j))*10 - 5;
    const up = Math.sin(i*2.1)*13;
    ctx.fillStyle = ["#8ce88c","#fad96b","#fa87bf"][i%3];
    ctx.globalAlpha = fade;        ctx.fillRect(x+side, mid + up*0.4, 5, 5);
    ctx.globalAlpha = fade*0.75;   ctx.fillRect(x+side+10, mid - up - fade*8, 5, 5);
  }
  ctx.globalAlpha = 1;

  // the runner, hopping
  const g = frames[Math.floor(p*10) % 2];
  const cx = p*run, cy = mid - size/2 - Math.abs(Math.sin(p*Math.PI*3))*11;
  ctx.fillStyle = "#8ce88c";
  for(let y=0;y<16;y++) for(let x=0;x<16;x++)
    if(g[y][x] !== '.') ctx.fillRect(cx + x*cell, cy + y*cell, cell*0.88, cell*0.88);
}

function paintLap(canvas, agent, onEnd){
  const t0 = performance.now();
  let raf = null;
  (function frame(now){
    const p = Math.min((now - t0) / LAP_MS, 1);
    paintLapFrame(canvas, agent, p);
    if(p < 1) raf = requestAnimationFrame(frame); else if(onEnd) onEnd();
  })(t0);
  return ()=> cancelAnimationFrame(raf);
}

let cancelLap = null;

function runVictoryLap(agent){
  cancelLap && cancelLap();
  island.classList.remove('open');
  island.classList.add('lap');
  island.style.height = '64px';
  cancelLap = paintLap(lapCanvas, agent, ()=> setTimeout(()=>{
    // A lap that's still running when the user jumps to another state must NOT drag the island
    // back to collapsed underneath them — only finish the lap we're still actually in.
    if(!island.classList.contains('lap')) return;
    island.classList.remove('lap');
    collapse();
  }, 120));
}

/* The feature-card lap runs on ONE continuous clock rather than a restarted timer. A restarted
   timer leaves the canvas blank in the gap between laps, and a blank black box reads as broken.
   Here the runner always exists: it laps, rests at the finish line, then resets. */
const lapDemo = document.getElementById('lapDemo');
if(lapDemo){
  const CYCLE = LAP_MS + 700;                 // lap, then a beat parked at the line
  let onScreen = false, raf = null;
  const start = performance.now();

  function loop(now){
    if(!onScreen || document.hidden){ raf = null; return; }
    const t = (now - start) % CYCLE;
    paintLapFrame(lapDemo, "grok", Math.min(t / LAP_MS, 1));
    raf = requestAnimationFrame(loop);
  }
  new IntersectionObserver(es=>{
    onScreen = es[0].isIntersecting;
    if(onScreen && !raf) raf = requestAnimationFrame(loop);
  }, {threshold:.25}).observe(lapDemo);
  document.addEventListener('visibilitychange', ()=>{ if(!document.hidden && onScreen && !raf) raf = requestAnimationFrame(loop); });
}

/* auto demo loop */
let auto = true, step = 0;
const sequence = ["collapsed","working","approval","sessions","lap"];
function resolve(kind){
  const cmd = panelBody.querySelector('.gate-cmd');
  if(cmd){ cmd.style.transition="opacity .3s"; cmd.style.opacity=".4"; }
  const sub = panelBody.querySelector('.gate-sub');
  if(sub){ sub.textContent = kind==="allow" ? "approved · running" : "denied · stopped";
           sub.style.color = kind==="allow" ? "var(--green)" : "var(--pink)"; }
  auto = false; setLive(false);
  // Allow and the agent runs; when it finishes, it takes its lap. Deny and it just stands down.
  setTimeout(()=>{ kind==="allow" ? runVictoryLap("claude") : collapse(); }, 900);
}
function go(name){
  pruneSprites();
  if(name !== "lap"){ cancelLap && cancelLap(); island.classList.remove('lap'); }
  if(name==="collapsed"){ collapse(); }
  // Present tense on purpose: the notch reports what an agent is doing NOW, not what it finished.
  else if(name==="working"){ collapseIsland(); renderEars(["shell","thinking","shell"]); collapsedActivity.textContent="Running Edit"; }
  else if(name==="approval"){ gateCard(); }
  else if(name==="lap"){ runVictoryLap("grok"); }
  else if(name==="sessions" || name==="done"){ sessionList(); }
}
function autoTick(){
  if(!auto) return;
  step = (step+1) % sequence.length;
  go(sequence[step]);
}
function setLive(on){
  auto = on;
  const b = document.getElementById('ctlLive');
  b.textContent = on ? "● live demo" : "▶ resume";
  b.classList.toggle('live', on);
}
document.getElementById('ctlLive').onclick = ()=>{ setLive(!auto); if(auto){ step=0; go("collapsed"); } };
document.querySelectorAll('[data-jump]').forEach(btn=>{
  btn.onclick = ()=>{ setLive(false); go(btn.dataset.jump); };
});

/* demo sprites (ears, session list, gate) are created via mountSprite, so the shared clock
   already animates them — no separate interval needed. Prune dead sprites when the demo
   re-renders so the SPRITES list doesn't grow without bound. */
function pruneSprites(){
  for(let i=SPRITES.length-1;i>=0;i--){ if(!document.body.contains(SPRITES[i].canvas)) SPRITES.splice(i,1); }
}

renderEars(["shell","done","thinking"]);
setInterval(autoTick, 2600);

/* boot sound on first interaction (autoplay policy) */
let booted = false;
window.addEventListener('pointerdown', ()=>{ if(!booted){ booted = true; sndBoot(); } }, {once:false});

/* scroll reveal */
const io = new IntersectionObserver((es)=> es.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('in'); }), {threshold:.14});
document.querySelectorAll('.reveal').forEach((el,i)=>{ el.style.transitionDelay = (i%3*0.06)+"s"; io.observe(el); });

/* wire the static feature-card Allow/Deny to make sound too */
document.querySelectorAll('.feat-visual .allow').forEach(b=> b.onclick = sndAllow);
document.querySelectorAll('.feat-visual .deny').forEach(b=> b.onclick = sndDeny);

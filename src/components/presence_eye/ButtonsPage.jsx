// src/components/presence_eye/ButtonsPage.jsx
// Add this route in App.jsx:
//   import ButtonsPage from "./components/presence_eye/ButtonsPage.jsx";
//   <Route path="/presence-eye/buttons" element={<ButtonsPage />} />
//
// ── SETUP ──────────────────────────────────────────────────────────────────
// 1. Replace PLAY_STORE with your real Google Play URL
// 2. Replace the image placeholder with: 
//    <img src="/assets/images/buttons-device.png" alt="Buttons device"
//         style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:36}} />
// ───────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';

const PLAY_STORE = 'https://play.google.com/store/apps/details?id=info.byose.presenceeye&pcampaignid=web_share';

const C = {
  brand:     '#195C51',
  brandL:    '#22897A',
  brandFade: 'rgba(25,92,81,0.10)',
  dark:      '#060B0F',
  darkCard:  '#0C1520',
  ink:       '#1A242F',
  muted:     '#6B7280',
  surface:   '#F4F6F5',
  white:     '#FFFFFF',
  gold:      '#F5C842',
  danger:    '#EF4444',
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');

.bp * { box-sizing: border-box; margin: 0; padding: 0; }
.bp   { font-family: 'DM Sans', sans-serif; }
.bp h1,.bp h2,.bp h3,.bp h4 { font-family: 'DM Serif Display', serif; }

@keyframes bp-float    { 0%,100%{transform:translateY(0) rotate(0deg)}   50%{transform:translateY(-10px) rotate(1.5deg)} }
@keyframes bp-blip     { 0%,100%{opacity:1;transform:scale(1)}            50%{opacity:.3;transform:scale(.85)} }
@keyframes bp-ring     { 0%{transform:translate(-50%,-50%) scale(.8);opacity:1} 100%{transform:translate(-50%,-50%) scale(3.2);opacity:0} }
@keyframes bp-fadeUp   { from{opacity:0;transform:translateY(22px)}       to{opacity:1;transform:translateY(0)} }
@keyframes bp-shimmer  { 0%{background-position:-200% center}             100%{background-position:200% center} }
@keyframes bp-particle { 0%{transform:translate(0,0) scale(1);opacity:1}  100%{transform:translate(var(--px),var(--py)) scale(0);opacity:0} }
@keyframes bp-confetti { 0%{transform:translate(0,0) rotate(0deg);opacity:1} 100%{transform:translate(var(--cx),var(--cy)) rotate(720deg);opacity:0} }
@keyframes bp-success  { 0%{transform:scale(0) rotate(-15deg);opacity:0}  60%{transform:scale(1.15) rotate(3deg)} 100%{transform:scale(1) rotate(0deg);opacity:1} }
@keyframes bp-gateOpen { from{transform:scaleX(1)}  to{transform:scaleX(0.04)} }
@keyframes bp-gateClose{ from{transform:scaleX(0.04)} to{transform:scaleX(1)} }
@keyframes bp-scanline { 0%{top:-10%} 100%{top:110%} }
@keyframes bp-btnPulse { 0%,100%{box-shadow:0 0 0 0 rgba(25,92,81,.9),0 6px 28px rgba(25,92,81,.4)} 50%{box-shadow:0 0 0 18px rgba(25,92,81,0),0 6px 50px rgba(25,92,81,.8)} }
@keyframes bp-closePulse{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.9)}   50%{box-shadow:0 0 0 18px rgba(239,68,68,0)} }
@keyframes bp-ctaAnim  { 0%,100%{transform:translateY(0) scale(1)}        50%{transform:translateY(-5px) scale(1.03)} }
@keyframes bp-glow     { 0%,100%{filter:brightness(1) drop-shadow(0 0 4px rgba(25,92,81,.3))} 50%{filter:brightness(1.25) drop-shadow(0 0 18px rgba(25,92,81,.8))} }
@keyframes bp-bounce   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }

.bp-float     { animation: bp-float 4s ease-in-out infinite; }
.bp-blip      { animation: bp-blip 1.6s ease-in-out infinite; }
.bp-glow-loop { animation: bp-glow 2.5s ease-in-out infinite; }
.bp-step-in   { animation: bp-fadeUp .42s ease forwards; }
.bp-bounce    { animation: bp-bounce 1.4s ease-in-out infinite; }

.bp-cta {
  position: relative; overflow: hidden;
  background: linear-gradient(135deg,#195C51,#22897A,#195C51);
  background-size: 200% 200%;
  animation: bp-shimmer 2.8s linear infinite, bp-ctaAnim 2.2s ease-in-out infinite;
  color: #fff; border: none; border-radius: 50px;
  padding: 17px 42px;
  font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 800;
  letter-spacing: .08em; text-transform: uppercase;
  cursor: pointer; text-decoration: none; display: inline-block;
  box-shadow: 0 8px 32px rgba(25,92,81,.55);
  transition: transform .2s, box-shadow .2s;
}
.bp-cta::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(120deg,transparent 20%,rgba(255,255,255,.3) 50%,transparent 80%);
  transform: translateX(-100%); transition: transform .5s;
}
.bp-cta:hover::before { transform: translateX(100%); }
.bp-cta:hover {
  transform: scale(1.07) translateY(-4px) !important;
  animation: none !important;
  box-shadow: 0 18px 50px rgba(25,92,81,.7) !important;
  background: linear-gradient(135deg,#22897A,#2BA090) !important;
}

.bp-open-btn {
  animation: bp-btnPulse 1.35s ease-in-out infinite;
  cursor: pointer; border: none;
  font-family: 'DM Sans',sans-serif; font-weight: 800;
  letter-spacing: .1em; text-transform: uppercase;
}
.bp-close-btn {
  animation: bp-closePulse 1.35s ease-in-out infinite;
  cursor: pointer; border: none;
  font-family: 'DM Sans',sans-serif; font-weight: 800;
  letter-spacing: .1em; text-transform: uppercase;
}

.bp-gate-l { transform-origin: left center; }
.bp-gate-r { transform-origin: right center; }
.bp-gate-open-l  { animation: bp-gateOpen  .9s cubic-bezier(.4,0,.2,1) forwards; }
.bp-gate-open-r  { animation: bp-gateOpen  .9s cubic-bezier(.4,0,.2,1) forwards; }
.bp-gate-close-l { animation: bp-gateClose .9s cubic-bezier(.4,0,.2,1) forwards; }
.bp-gate-close-r { animation: bp-gateClose .9s cubic-bezier(.4,0,.2,1) forwards; }

.bp-scanline {
  position: absolute; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg,transparent,rgba(25,92,81,.7),transparent);
  animation: bp-scanline 2.2s linear infinite; pointer-events: none;
}

.bp-feat { transition: transform .3s ease, box-shadow .3s ease; }
.bp-feat:hover { transform: translateY(-6px) rotate(-.4deg); box-shadow: 0 24px 64px rgba(25,92,81,.18) !important; }

.bp-step-row { transition: border-left-color .25s, background .25s; }
.bp-step-row:hover { border-left-color: #195C51 !important; background: rgba(25,92,81,.1) !important; }
`;

/* ── PARTICLES ─────────────────────────────────── */
function Burst({ on, color = C.brand, n = 14 }) {
  if (!on) return null;
  return (
    <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:30, overflow:'visible' }}>
      {Array.from({ length: n }, (_, i) => {
        const angle = (i / n) * 360;
        const dist  = 36 + Math.random() * 28;
        const px    = Math.cos(angle * Math.PI / 180) * dist;
        const py    = Math.sin(angle * Math.PI / 180) * dist;
        const size  = 4 + Math.random() * 5;
        return (
          <div key={i} style={{
            position:'absolute', top:'50%', left:'50%',
            width: size, height: size, borderRadius:'50%',
            background: i % 3 === 0 ? C.gold : color,
            '--px': `${px}px`, '--py': `${py}px`,
            animation: `bp-particle ${.45 + Math.random() * .35}s ease-out ${Math.random() * .12}s forwards`,
            transform:'translate(-50%,-50%)',
          }} />
        );
      })}
    </div>
  );
}

function Confetti({ on }) {
  if (!on) return null;
  const cols = [C.brand, C.brandL, C.gold, '#fff', '#4EB8A6', '#F472B6'];
  return (
    <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:40, overflow:'visible' }}>
      {Array.from({ length: 24 }, (_, i) => {
        const cx = (Math.random() - .5) * 220;
        const cy = -(60 + Math.random() * 110);
        const w  = 5 + Math.random() * 7;
        const h  = 3 + Math.random() * 4;
        return (
          <div key={i} style={{
            position:'absolute', bottom:'50%', left:'50%',
            width: w, height: h, background: cols[i % cols.length], borderRadius:2,
            '--cx': `${cx}px`, '--cy': `${cy}px`,
            animation: `bp-confetti ${.75 + Math.random() * .55}s ease-out ${Math.random() * .2}s forwards`,
          }} />
        );
      })}
    </div>
  );
}

function Rings({ on, color = C.brand }) {
  if (!on) return null;
  return (
    <>
      {[0, .22, .44].map((d, i) => (
        <div key={i} style={{
          position:'absolute', top:'50%', left:'50%',
          width:56, height:56, borderRadius:'50%',
          border: `2px solid ${color}`,
          animation: `bp-ring 1.1s ease-out ${d}s forwards`,
          pointerEvents:'none', zIndex:20,
        }} />
      ))}
    </>
  );
}

/* ── DEVICE ────────────────────────────────────── */
function Device({ wired, powered, burst }) {
  return (
    <div style={{ position:'relative', display:'flex', flexDirection:'column', alignItems:'center' }}>
      <Burst on={burst} />
      <Rings on={burst} />
      <div style={{
        width:76, height:76,
        background:'linear-gradient(145deg,#F2EFE8,#E5E0D4)',
        borderRadius:20,
        boxShadow: wired
          ? `0 0 0 2.5px ${C.brand},0 0 28px rgba(25,92,81,.5),0 8px 28px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.9)`
          : '0 8px 28px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.7)',
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        transition:'box-shadow .6s', position:'relative', overflow:'hidden',
      }}>
        {powered && <div className="bp-scanline" />}
        <div style={{ fontSize:7, fontWeight:800, color:C.brand, letterSpacing:'.06em', textAlign:'center', lineHeight:1.3, zIndex:1 }}>
          BYOSE<br/>Tech
        </div>
        <div style={{ position:'absolute', bottom:16, left:8, right:8, height:1, background:'rgba(25,92,81,.15)' }} />
        <div style={{
          position:'absolute', bottom:7, right:7,
          width:8, height:8, borderRadius:'50%',
          background: powered ? C.brand : '#374151',
          boxShadow: powered ? `0 0 12px ${C.brand},0 0 24px rgba(25,92,81,.5)` : 'none',
          transition:'all .5s', zIndex:2,
        }} className={powered ? 'bp-blip' : ''} />
      </div>
      <div style={{ width:3, height:14, background: wired ? '#C0BDB4' : '#374151', transition:'background .5s' }} />
      <div style={{ width:12, height:8, borderRadius:3, background: wired ? '#A09C96' : '#374151', transition:'background .5s' }} />
    </div>
  );
}

/* ── REMOTE ────────────────────────────────────── */
function Remote({ active, burst }) {
  const btns = ['▲','◀','▶','▼'];
  return (
    <div style={{ position:'relative', display:'flex', flexDirection:'column', alignItems:'center' }}>
      <Burst on={burst} color={C.brandL} />
      <Rings on={burst} color={C.brandL} />
      <div style={{
        width:58, height:96,
        background:'linear-gradient(160deg,#2A3544,#181F2B)',
        borderRadius:16,
        boxShadow: active
          ? `0 0 0 2px ${C.brand},0 0 28px rgba(25,92,81,.5),0 8px 24px rgba(0,0,0,.6)`
          : '0 8px 24px rgba(0,0,0,.5)',
        display:'flex', flexDirection:'column', alignItems:'center',
        padding:'10px 7px', gap:5,
        transition:'box-shadow .5s', position:'relative', overflow:'hidden',
      }}>
        {active && <div className="bp-scanline" />}
        <div style={{ width:22, height:3.5, background:'#374151', borderRadius:2, marginBottom:4 }} />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:5 }}>
          {btns.map((b, i) => (
            <div key={i} style={{
              width:19, height:19, borderRadius:6,
              background: active && i === 2
                ? `linear-gradient(135deg,${C.brand},${C.brandL})`
                : 'linear-gradient(135deg,#374151,#2D3748)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:8, color: active ? '#9CA3AF' : '#4B5563',
              boxShadow: active && i === 2 ? `0 0 10px rgba(25,92,81,.6)` : 'none',
              transition:'all .4s',
            }}>{b}</div>
          ))}
        </div>
        {active && (
          <div style={{ fontSize:6, color:C.brandL, marginTop:2, letterSpacing:'.12em', fontWeight:700 }}>PAIRED</div>
        )}
      </div>
    </div>
  );
}

/* ── PHONE ─────────────────────────────────────── */
function Phone({ online, open, onToggle, justOpened }) {
  return (
    <div style={{
      width:76, height:128,
      background:'linear-gradient(160deg,#1C2535,#0F1520)',
      borderRadius:18,
      boxShadow: online
        ? `0 0 0 2px ${C.brand},0 12px 40px rgba(25,92,81,.4),0 4px 16px rgba(0,0,0,.6)`
        : '0 8px 32px rgba(0,0,0,.6)',
      display:'flex', flexDirection:'column', alignItems:'center',
      overflow:'hidden',
      border: online ? 'none' : '2px solid #1F2937',
      transition:'box-shadow .5s', position:'relative',
    }}>
      <div style={{ width:28, height:6, background:'#0F1520', borderRadius:'0 0 8px 8px', marginTop:4 }} />
      <div style={{
        width:'100%', flex:1,
        background: online ? (open ? '#120808' : '#091410') : '#090D12',
        display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        gap:7, padding:'4px 6px 6px',
        transition:'background .6s', position:'relative', overflow:'hidden',
      }}>
        {online && <div className="bp-scanline" />}
        {!online
          ? <div style={{ fontSize:7, color:'#1F2937', textAlign:'center', letterSpacing:'.08em', lineHeight:1.5 }}>
              waiting<br/>setup…
            </div>
          : <>
              <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:C.brand }} className="bp-blip" />
                <span style={{ fontSize:6, color:C.brand, fontWeight:700, letterSpacing:'.12em' }}>ONLINE</span>
              </div>
              <div style={{ fontSize:5, color:'#374151', letterSpacing:'.1em', fontWeight:600 }}>BYOSE BUTTONS</div>

              {/* THE GATE BUTTON */}
              <div style={{ position:'relative' }}>
                {!open && [0, .3, .6].map((d, i) => (
                  <div key={i} style={{
                    position:'absolute', top:'50%', left:'50%',
                    width:46, height:46, borderRadius:'50%',
                    border: `1.5px solid rgba(25,92,81,${.65 - i * .2})`,
                    animation: `bp-ring 1.9s ease-out ${d}s infinite`,
                    pointerEvents:'none',
                  }} />
                ))}
                <button
                  onClick={onToggle}
                  className={open ? 'bp-close-btn' : 'bp-open-btn'}
                  style={{
                    width:46, height:46, borderRadius:'50%',
                    background: open
                      ? `linear-gradient(135deg,${C.danger},#B91C1C)`
                      : `linear-gradient(135deg,${C.brand},${C.brandL})`,
                    fontSize:20, color:'#fff',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    position:'relative', zIndex:2, transition:'background .4s',
                  }}
                >
                  {open ? '🔒' : '🔓'}
                </button>
              </div>

              <div style={{ fontSize:6, color: open ? C.danger : C.brand, fontWeight:700, letterSpacing:'.08em', transition:'color .4s' }}>
                {open ? 'TAP TO CLOSE' : 'TAP TO OPEN'}
              </div>
              <div style={{ width:'80%', height:1.5, background: open ? C.danger : '#1F2937', borderRadius:1, transition:'background .5s' }} />
            </>
        }
      </div>
      <div style={{ width:'100%', height:14, background:'#090D12', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ width:22, height:3, background:'#1F2937', borderRadius:2 }} />
      </div>
      <Confetti on={justOpened} />
    </div>
  );
}

/* ── GATE ──────────────────────────────────────── */
function Gate({ open, burst }) {
  return (
    <div style={{ position:'relative', width:112, height:90, flexShrink:0 }}>
      <Burst on={burst && open} color={C.gold} n={18} />
      <div style={{ position:'absolute', left:0, top:0, width:8, height:'100%', background:'linear-gradient(180deg,#6B7280,#374151)', borderRadius:'4px 0 0 4px', zIndex:2 }} />
      <div style={{ position:'absolute', right:0, top:0, width:8, height:'100%', background:'linear-gradient(180deg,#6B7280,#374151)', borderRadius:'0 4px 4px 0', zIndex:2 }} />
      <div style={{ position:'absolute', inset:0, border:'3px solid #4B5563', borderRadius:6 }} />
      <div className={`bp-gate-l ${open ? 'bp-gate-open-l' : 'bp-gate-close-l'}`} style={{
        position:'absolute', left:8, top:3, width:'calc(50% - 8px)', height:'calc(100% - 6px)',
        background: open
          ? 'linear-gradient(180deg,rgba(25,92,81,.15),rgba(25,92,81,.05))'
          : 'repeating-linear-gradient(90deg,#374151 0,#374151 3px,#4B5563 3px,#4B5563 13px)',
        transition:'background .5s',
      }} />
      <div className={`bp-gate-r ${open ? 'bp-gate-open-r' : 'bp-gate-close-r'}`} style={{
        position:'absolute', right:8, top:3, width:'calc(50% - 8px)', height:'calc(100% - 6px)',
        background: open
          ? 'linear-gradient(180deg,rgba(25,92,81,.15),rgba(25,92,81,.05))'
          : 'repeating-linear-gradient(90deg,#4B5563 0,#4B5563 3px,#374151 3px,#374151 13px)',
        transition:'background .5s',
      }} />
      {open && (
        <div style={{
          position:'absolute', inset:3, borderRadius:4,
          background:'radial-gradient(ellipse,rgba(25,92,81,.2) 0%,transparent 70%)',
        }} className="bp-float" />
      )}
      <div style={{
        position:'absolute', bottom:-22, left:'50%', transform:'translateX(-50%)',
        fontSize:10, color: open ? C.brand : '#6B7280',
        fontWeight:700, whiteSpace:'nowrap', letterSpacing:'.1em', transition:'color .5s',
      }}>
        {open ? '✓ OPEN' : '● CLOSED'}
      </div>
    </div>
  );
}

/* ── POWER SOCKET ──────────────────────────────── */
function Power({ on, burst }) {
  return (
    <div style={{ position:'relative', display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
      <Burst on={burst} color={C.gold} n={10} />
      <Rings on={burst} color={C.gold} />
      <div style={{
        width:46, height:46, borderRadius:13,
        background: on
          ? `linear-gradient(135deg,#B45309,${C.gold},#D97706)`
          : 'linear-gradient(135deg,#1F2937,#111827)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:22,
        boxShadow: on
          ? `0 0 0 2px ${C.gold},0 0 24px rgba(245,200,66,.5)`
          : '0 4px 12px rgba(0,0,0,.4)',
        border: on ? 'none' : '2px solid #374151',
        transition:'all .6s', position:'relative', overflow:'hidden',
      }}>
        {on && <div className="bp-scanline" />}
        <span style={{ position:'relative', zIndex:1 }}>{on ? '⚡' : '🔌'}</span>
      </div>
      <span style={{ fontSize:8, color: on ? C.gold : '#4B5563', letterSpacing:'.1em', fontWeight:600, textTransform:'uppercase', transition:'color .5s' }}>
        {on ? 'Powered' : 'Socket'}
      </span>
    </div>
  );
}

/* ── CONNECTOR LINE ────────────────────────────── */
function Line({ on, color = C.brand, delay = '0s' }) {
  return (
    <div style={{ flex:1, height:24, minWidth:14, display:'flex', alignItems:'center' }}>
      <svg width="100%" height="24" style={{ overflow:'visible' }}>
        <line x1="0" y1="12" x2="100%" y2="12"
          stroke={on ? color : '#1F2937'} strokeWidth="2.5" strokeLinecap="round"
          strokeDasharray="200" strokeDashoffset={on ? 0 : 200}
          style={{ transition:`stroke-dashoffset .7s ease ${delay}, stroke .5s` }}
        />
        {on && (
          <circle cx="100%" cy="12" r="4" fill={color} style={{ filter:`drop-shadow(0 0 5px ${color})` }}>
            <animate attributeName="r" values="4;6;4" dur="1.5s" repeatCount="indefinite" />
          </circle>
        )}
      </svg>
    </div>
  );
}

/* ── SUCCESS BADGE ─────────────────────────────── */
function Badge({ text }) {
  if (!text) return null;
  return (
    <div style={{
      position:'absolute', top:14, right:14, zIndex:50,
      background:`linear-gradient(135deg,${C.brand},${C.brandL})`,
      borderRadius:50, padding:'7px 16px',
      display:'flex', alignItems:'center', gap:6,
      boxShadow:`0 4px 20px rgba(25,92,81,.6)`,
      animation:'bp-success .4s ease forwards',
    }}>
      <span style={{ fontSize:13 }}>✓</span>
      <span style={{ fontSize:10, fontWeight:700, color:'#fff', letterSpacing:'.1em', textTransform:'uppercase' }}>{text}</span>
    </div>
  );
}

/* ── INTERACTIVE DEMO ──────────────────────────── */
const STEPS = [
  {
    title: 'Mount & Connect',
    desc:  'Tap the button below to wire the Buttons device to your gate remote. Watch the connection come alive.',
    action:'⚡ Connect Wire',
  },
  {
    title: 'Power Up',
    desc:  'Great! Now plug the USB power cable into the wall socket. The device boots up instantly.',
    action:'🔌 Plug In',
  },
  {
    title: 'Open Your Gate',
    desc:  'Your phone is live! Tap the glowing button on the phone screen to open the gate.',
    action: null,
  },
];

function Demo() {
  const [step,       setStep]       = useState(0);
  const [open,       setOpen]       = useState(false);
  const [b1,         setB1]         = useState(false);
  const [b2,         setB2]         = useState(false);
  const [bPow,       setBPow]       = useState(false);
  const [bGate,      setBGate]      = useState(false);
  const [justOpened, setJustOpened] = useState(false);
  const [badge,      setBadge]      = useState('');
  const [mobile,     setMobile]     = useState(false);

  useEffect(() => {
    const f = () => setMobile(window.innerWidth < 700);
    f();
    window.addEventListener('resize', f);
    return () => window.removeEventListener('resize', f);
  }, []);

  const burst = (fn) => { fn(true); setTimeout(() => fn(false), 900); };
  const flash = (t)  => { setBadge(t); setTimeout(() => setBadge(''), 2600); };

  const act = () => {
    if (step === 0) {
      burst(setB1); burst(setB2);
      flash('Wire Connected! 🔌');
      setTimeout(() => setStep(1), 150);
    } else if (step === 1) {
      burst(setBPow);
      flash('Powered On! ⚡');
      setTimeout(() => setStep(2), 150);
    }
  };

  const toggle = () => {
    if (step < 2) return;
    const opening = !open;
    setOpen(opening);
    if (opening) {
      burst(setBGate);
      setJustOpened(true);
      flash('Gate Opened! 🎉');
      setTimeout(() => setJustOpened(false), 1400);
    } else {
      flash('Gate Closed 🔒');
    }
  };

  const pct = step === 0 ? 0 : step === 1 ? 50 : 100;

  return (
    <div style={{
      background:`
        radial-gradient(ellipse at 20% 50%,rgba(25,92,81,.14) 0%,transparent 50%),
        radial-gradient(ellipse at 80% 50%,rgba(25,92,81,.09) 0%,transparent 50%),
        linear-gradient(160deg,#060B0F 0%,#0C1520 50%,#060B0F 100%)`,
      borderRadius:28,
      padding: mobile ? '24px 16px 36px' : '36px 32px 44px',
      position:'relative', overflow:'hidden',
      border:'1px solid rgba(25,92,81,.22)',
      boxShadow:'0 32px 96px rgba(0,0,0,.6)',
    }}>
      {/* grid bg */}
      <div style={{
        position:'absolute', inset:0, opacity:.04,
        backgroundImage:'linear-gradient(rgba(25,92,81,1) 1px,transparent 1px),linear-gradient(90deg,rgba(25,92,81,1) 1px,transparent 1px)',
        backgroundSize:'32px 32px', pointerEvents:'none',
      }} />

      <Badge text={badge} />

      {/* header */}
      <div style={{ position:'relative', zIndex:3, marginBottom:26 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10, flexWrap:'wrap', gap:8 }}>
          <span style={{ fontSize:10, fontWeight:700, color:C.brand, letterSpacing:'.2em', textTransform:'uppercase' }}>
            Interactive Setup
          </span>
          <div style={{ display:'flex', gap:6 }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{
                width: i === step ? 26 : 8, height:8, borderRadius:4,
                background: i < step ? C.brand : i === step ? C.brandL : '#1F2937',
                boxShadow: i === step ? `0 0 8px ${C.brand}` : 'none',
                transition:'all .5s cubic-bezier(.4,0,.2,1)',
              }} />
            ))}
          </div>
        </div>

        {/* progress bar */}
        <div style={{ height:3, background:'#0F1821', borderRadius:2, marginBottom:14, overflow:'hidden' }}>
          <div style={{
            height:'100%', borderRadius:2,
            background:`linear-gradient(90deg,${C.brand},${C.brandL})`,
            width:`${pct}%`, transition:'width .7s cubic-bezier(.4,0,.2,1)',
          }} />
        </div>

        {/* instruction */}
        <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
          <div style={{
            width:34, height:34, borderRadius:10, flexShrink:0,
            background:`linear-gradient(135deg,${C.brand},${C.brandL})`,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:14, fontWeight:800, color:'#fff',
            fontFamily:'DM Serif Display,serif',
            boxShadow:`0 4px 14px rgba(25,92,81,.45)`,
          }}>{step + 1}</div>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:'#fff', marginBottom:3, fontFamily:'DM Serif Display,serif' }}>
              {STEPS[step].title}
            </div>
            <p key={step} className="bp-step-in" style={{ fontSize:13, color:'#9CA3AF', lineHeight:1.55, margin:0 }}>
              {STEPS[step].desc}
            </p>
          </div>
        </div>
      </div>

      {/* components stage */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'center',
        gap: mobile ? 4 : 8,
        flexWrap: mobile ? 'wrap' : 'nowrap',
        position:'relative', zIndex:2,
        padding: mobile ? '0 0 28px' : '8px 0 36px',
        rowGap: mobile ? 28 : 8,
      }}>

        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
          <Device wired={step >= 1} powered={step >= 2} burst={b1} />
          <span style={{ fontSize:9, color:'#4B5563', letterSpacing:'.12em', textTransform:'uppercase', fontWeight:600 }}>Device</span>
        </div>

        <Line on={step >= 1} color={C.brand}  delay=".1s" />

        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
          <Remote active={step >= 1} burst={b2} />
          <span style={{ fontSize:9, color:'#4B5563', letterSpacing:'.12em', textTransform:'uppercase', fontWeight:600 }}>Remote</span>
        </div>

        <Line on={step >= 2} color={C.gold}   delay=".2s" />

        <Power on={step >= 2} burst={bPow} />

        {mobile && <div style={{ width:'100%', height:0 }} />}

        <Line on={step >= 2} color={C.brandL} delay=".3s" />

        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
          <Phone online={step >= 2} open={open} onToggle={toggle} justOpened={justOpened} />
          <span style={{ fontSize:9, color:'#4B5563', letterSpacing:'.12em', textTransform:'uppercase', fontWeight:600 }}>Your Phone</span>
        </div>

        <Line on={open} color={C.brand} delay="0s" />

        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
          <Gate open={open} burst={bGate} />
          <span style={{ fontSize:9, color:'#4B5563', letterSpacing:'.12em', textTransform:'uppercase', fontWeight:600, marginTop:22 }}>Gate</span>
        </div>

      </div>

      {/* action buttons */}
      <div style={{ position:'relative', zIndex:3, display:'flex', flexDirection:'column', alignItems:'center', gap:10, marginTop:4 }}>
        {STEPS[step].action && (
          <button
            onClick={act}
            className="bp-open-btn"
            style={{
              padding:'15px 38px',
              background:`linear-gradient(135deg,${C.brand},${C.brandL})`,
              color:'#fff', fontSize:14, fontWeight:800,
              letterSpacing:'.08em', textTransform:'uppercase',
              borderRadius:50, fontFamily:'DM Sans,sans-serif',
            }}
          >
            {STEPS[step].action}
          </button>
        )}
        {step === 2 && (
          <p className="bp-bounce" style={{ fontSize:11, color:C.brand, fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', textAlign:'center' }}>
            👆 Tap the glowing button on the phone to open the gate!
          </p>
        )}
        {step > 0 && (
          <button
            onClick={() => { setStep(0); setOpen(false); setBadge(''); }}
            style={{
              background:'transparent', border:'1px solid #1F2937', borderRadius:50,
              padding:'8px 20px', color:'#4B5563', fontSize:11, fontWeight:600,
              cursor:'pointer', letterSpacing:'.08em', textTransform:'uppercase',
              fontFamily:'DM Sans,sans-serif',
            }}
          >
            ↺ Reset
          </button>
        )}
      </div>
    </div>
  );
}

/* ── FEATURES DATA ─────────────────────────────── */
const features = [
  { icon:'📡', title:'Extended Range',
    body:'Physical remotes max out at ~10 m. Buttons routes commands through Wi-Fi — open your gate from anywhere with an internet connection.' },
  { icon:'👥', title:'Shared Access',
    body:'Add family members or apartment neighbours to the app. No more buying extra physical remotes for the whole household.' },
  { icon:'🔒', title:'Safe & Tested',
    body:'Attaches to your existing remote without modification. Rigorously tested — zero damage risk to your hardware or environment.' },
  { icon:'⚡', title:'Ultra-Low Power',
    body:'Sips minimal current via USB. Stays plugged in 24/7 without impacting your electricity bill.' },
  { icon:'📱', title:'Plug & Play',
    body:'Mount to any physical remote, connect to Wi-Fi once. Done. The device sits invisibly in the background, always ready.' },
  { icon:'🌍', title:'Promotes Digitalisation',
    body:'Modernise legacy gate systems without replacing them. Bridge the gap between analog hardware and the smart home era.' },
];

/* ── INSTALLATION STEPS ────────────────────────── */
const installSteps = [
  { n:'01', title:'We Come to You',
    body:'A BYOSE Tech technician schedules a visit at your convenience — home, apartment, or workplace.' },
  { n:'02', title:'Device Mounted',
    body:"We clip the Buttons device to your existing physical gate remote. No drilling, no tools needed on your part." },
  { n:'03', title:'Wired & Connected',
    body:'Our technician wires the device contacts to your remote and routes the USB power cable to a nearby socket.' },
  { n:'04', title:'Wi-Fi Setup',
    body:'We configure the device on your home Wi-Fi and pair it with the BYOSE Buttons app on your smartphone.' },
  { n:'05', title:"You're Live",
    body:"We hand over control, walk you through sharing access with family, and leave. Fully autonomous from day one." },
];

/* ── PAGE ──────────────────────────────────────── */
export default function ButtonsPage() {

  useEffect(() => {
    const id = 'bp-styles';
    if (!document.getElementById(id)) {
      const s = document.createElement('style');
      s.id = id; s.textContent = CSS;
      document.head.appendChild(s);
    }
  }, []);

  return (
    <div className="bp" style={{ background:C.white, color:C.ink }}>

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section style={{
        background:`
          radial-gradient(ellipse at 30% 20%,rgba(25,92,81,.25) 0%,transparent 45%),
          radial-gradient(ellipse at 70% 80%,rgba(25,92,81,.15) 0%,transparent 40%),
          linear-gradient(160deg,#040810 0%,#0A1619 40%,#040810 100%)`,
        minHeight:'90vh',
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        padding:'clamp(80px,10vw,120px) clamp(16px,4vw,40px) 60px',
        position:'relative', overflow:'hidden',
      }}>
        {[200,360,520].map((s, i) => (
          <div key={i} style={{
            position:'absolute', top:'50%', left:'50%',
            width:s, height:s, borderRadius:'50%',
            border:`1px solid rgba(25,92,81,${.12 - i * .03})`,
            transform:'translate(-50%,-50%)', pointerEvents:'none',
          }} />
        ))}

        <div style={{ textAlign:'center', position:'relative', zIndex:2, maxWidth:720 }}>
          {/* live badge */}
          <div style={{
            display:'inline-flex', alignItems:'center', gap:8,
            background:'rgba(25,92,81,.12)', border:'1px solid rgba(25,92,81,.3)',
            borderRadius:50, padding:'7px 20px', marginBottom:28,
          }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:C.brand }} className="bp-blip" />
            <span style={{ fontSize:11, fontWeight:700, color:C.brand, letterSpacing:'.2em', textTransform:'uppercase' }}>
              New Product · BYOSE Tech
            </span>
          </div>

          <h1 style={{ fontSize:'clamp(3.5rem,11vw,7.5rem)', lineHeight:.95, color:'#fff', marginBottom:10, letterSpacing:'-.02em' }}>
            Buttons<span style={{ color:C.brand }}>.</span>
          </h1>
          <p style={{ fontFamily:'DM Serif Display,serif', fontSize:'clamp(1.1rem,3vw,1.6rem)', color:'#6B7280', fontStyle:'italic', marginBottom:24 }}>
            Your gate remote — gone wireless.
          </p>
          <p style={{ fontSize:'clamp(14px,2vw,17px)', color:'#4B5563', lineHeight:1.75, maxWidth:540, margin:'0 auto 44px' }}>
            Mount once. Share with everyone. Control your motor gate from anywhere — no extra remotes, no limited range, no hassle.
          </p>

          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <a href="#demo" className="bp-cta">✦ Explore Buttons</a>
            <a href="#how" style={{
              padding:'16px 32px', background:'transparent', color:'#6B7280',
              border:'1px solid #1F2937', borderRadius:50, fontSize:14, fontWeight:600,
              textDecoration:'none', letterSpacing:'.06em', textTransform:'uppercase',
              display:'inline-block', transition:'color .3s, border-color .3s',
            }}>How it works</a>
          </div>

          {/* Play Store */}
          <div style={{ marginTop:30, display:'flex', justifyContent:'center' }}>
            <a href={PLAY_STORE} target="_blank" rel="noopener noreferrer" style={{
              display:'inline-flex', alignItems:'center', gap:12,
              background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.12)',
              borderRadius:14, padding:'11px 22px', textDecoration:'none',
              backdropFilter:'blur(10px)', transition:'background .3s, border-color .3s',
            }}
            onMouseOver={e => { e.currentTarget.style.background='rgba(25,92,81,.15)'; e.currentTarget.style.borderColor='rgba(25,92,81,.4)'; }}
            onMouseOut={e  => { e.currentTarget.style.background='rgba(255,255,255,.06)'; e.currentTarget.style.borderColor='rgba(255,255,255,.12)'; }}>
              <span style={{ fontSize:28, lineHeight:1 }}>▶</span>
              <div>
                <div style={{ fontSize:9, color:'#9CA3AF', letterSpacing:'.1em', textTransform:'uppercase', fontWeight:600 }}>Available on</div>
                <div style={{ fontSize:15, color:'#fff', fontWeight:700, letterSpacing:'.02em' }}>Google Play</div>
              </div>
            </a>
          </div>
        </div>

        {/* floating device strip */}
        <div className="bp-float" style={{ marginTop:52, position:'relative', zIndex:2 }}>
          <div style={{
            background:'rgba(25,92,81,.07)', border:'1px solid rgba(25,92,81,.2)',
            borderRadius:28, padding:'22px 36px',
            display:'flex', gap:20, alignItems:'center', backdropFilter:'blur(12px)',
          }}>
            <Device wired powered />
            <Line on color={C.brand} />
            <Remote active />
            <Line on color={C.brand} />
            <div style={{ fontSize:12, color:C.brand, fontWeight:700, letterSpacing:'.1em', textAlign:'center' }}>
              📱<br /><span style={{ fontSize:8 }}>APP</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          DEVICE IMAGE + DESCRIPTION
      ══════════════════════════════════════════ */}
      <section style={{ padding:'clamp(48px,8vw,96px) clamp(16px,4vw,40px)', background:C.white }}>
        <div style={{
          maxWidth:1080, margin:'0 auto',
          display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,440px),1fr))',
          gap:56, alignItems:'center',
        }}>
          {/* image */}
          <div style={{ display:'flex', justifyContent:'center' }}>
            <div style={{ position:'relative' }}>
              <div style={{ position:'absolute', inset:-32, background:`radial-gradient(ellipse,rgba(25,92,81,.15) 0%,transparent 70%)`, borderRadius:'50%', pointerEvents:'none' }} />
              <div style={{
                width:280, height:280,
                background:'linear-gradient(145deg,#F0EDE6,#E5E0D6)',
                borderRadius:36,
                boxShadow:'0 32px 80px rgba(0,0,0,.15),0 0 0 1px rgba(0,0,0,.06),inset 0 2px 0 rgba(255,255,255,.8)',
                display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                position:'relative', overflow:'hidden',
              }}>
                
    
                                                               
                  <img                                         
                    src="/assets/images/buttons.png"   
                    alt="BYOSE Buttons device"                 
                    style={{                                   
                      width:'100%', height:'100%',             
                      objectFit:'cover', borderRadius:36       
                    }}                                         
                 />                                           
            

                <div style={{ position:'absolute', bottom:20, right:20, width:12, height:12, borderRadius:'50%', background:C.brand, boxShadow:`0 0 16px ${C.brand}` }} className="bp-blip" />
                <div style={{ position:'absolute', bottom:-28, left:'50%', transform:'translateX(-50%)', width:4, height:28, background:'#C0BDB4', borderRadius:'0 0 3px 3px' }} />
                <div style={{ position:'absolute', bottom:-40, left:'50%', transform:'translateX(-50%)', width:14, height:12, background:'#9CA3AF', borderRadius:4 }} />
              </div>
            </div>
          </div>

          {/* text */}
          <div>
            <span style={{ fontSize:11, fontWeight:700, color:C.brand, letterSpacing:'.2em', textTransform:'uppercase' }}>The Hardware</span>
            <h2 style={{ fontSize:'clamp(1.8rem,4vw,3rem)', margin:'12px 0 20px', color:C.ink, lineHeight:1.1 }}>
              A small square.<br/>A big upgrade.
            </h2>
            <p style={{ color:C.muted, lineHeight:1.75, fontSize:15, marginBottom:14 }}>
              Buttons is a compact, whitish device with soft rounded corners — roughly the size of a matchbox. The BYOSE Tech logo sits elegantly on the face. A thin wire extends from the base and connects directly to your existing physical gate remote.
            </p>
            <p style={{ color:C.muted, lineHeight:1.75, fontSize:15 }}>
              A second USB cable provides power. Once mounted and plugged in, the device disappears into the background — invisible, always on, always ready.
            </p>
            <div style={{ marginTop:22, display:'flex', gap:10, flexWrap:'wrap' }}>
              {['WiFi 2.4 GHz','USB-C Power','App Controlled','Multi-user','Always On'].map(t => (
                <span key={t} style={{ padding:'7px 16px', borderRadius:50, background:C.brandFade, color:C.brand, fontSize:12, fontWeight:700, letterSpacing:'.06em' }}>{t}</span>
              ))}
            </div>

            {/* Play Store inline */}
            <div style={{ marginTop:28 }}>
              <a href={PLAY_STORE} target="_blank" rel="noopener noreferrer" style={{
                display:'inline-flex', alignItems:'center', gap:12,
                background:C.dark, border:`1px solid rgba(25,92,81,.3)`,
                borderRadius:14, padding:'12px 22px', textDecoration:'none',
                transition:'box-shadow .3s',
              }}
              onMouseOver={e => e.currentTarget.style.boxShadow=`0 8px 24px rgba(25,92,81,.3)`}
              onMouseOut={e  => e.currentTarget.style.boxShadow='none'}>
                <span style={{ fontSize:28 }}>▶</span>
                <div>
                  <div style={{ fontSize:9, color:'#6B7280', letterSpacing:'.1em', textTransform:'uppercase' }}>Download on</div>
                  <div style={{ fontSize:15, color:'#fff', fontWeight:700 }}>Google Play</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          INTERACTIVE DEMO
      ══════════════════════════════════════════ */}
      <section id="demo" style={{ padding:'clamp(48px,8vw,96px) clamp(16px,4vw,40px)', background:C.surface }}>
        <div style={{ maxWidth:960, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:44 }}>
            <span style={{ fontSize:11, fontWeight:700, color:C.brand, letterSpacing:'.2em', textTransform:'uppercase' }}>Try it</span>
            <h2 style={{ fontSize:'clamp(2rem,5vw,3.5rem)', margin:'12px 0 8px', color:C.ink }}>Setup in 3 steps.</h2>
            <p style={{ color:C.muted, fontSize:15 }}>Walk through the full installation flow interactively.</p>
          </div>
          <Demo />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════ */}
      <section style={{ padding:'clamp(48px,8vw,96px) clamp(16px,4vw,40px)', background:C.white }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:52 }}>
            <span style={{ fontSize:11, fontWeight:700, color:C.brand, letterSpacing:'.2em', textTransform:'uppercase' }}>Why Buttons</span>
            <h2 style={{ fontSize:'clamp(2rem,5vw,3.5rem)', margin:'12px 0 0', color:C.ink }}>
              Every advantage,<br/>in one small device.
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,310px),1fr))', gap:20 }}>
            {features.map((f, i) => (
              <div key={i} className="bp-feat" style={{
                background:C.surface, borderRadius:22, padding:'28px 24px',
                borderTop:`3px solid ${C.brand}`, boxShadow:'0 4px 20px rgba(0,0,0,.04)',
              }}>
                <div style={{ fontSize:34, marginBottom:14 }}>{f.icon}</div>
                <h3 style={{ fontSize:20, margin:'0 0 10px', color:C.ink }}>{f.title}</h3>
                <p style={{ fontSize:14, color:C.muted, lineHeight:1.7, margin:0 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS — WE DO IT FOR YOU
      ══════════════════════════════════════════ */}
      <section id="how" style={{ padding:'clamp(48px,8vw,96px) clamp(16px,4vw,40px)', background:C.dark }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:16 }}>
            <span style={{ fontSize:11, fontWeight:700, color:C.brand, letterSpacing:'.2em', textTransform:'uppercase' }}>Installation</span>
            <h2 style={{ fontSize:'clamp(2rem,5vw,3.5rem)', margin:'12px 0 0', color:'#fff' }}>We do it for you.</h2>
          </div>

          {/* callout box */}
          <div style={{
            background:'linear-gradient(135deg,rgba(25,92,81,.15),rgba(25,92,81,.05))',
            border:'1px solid rgba(25,92,81,.3)', borderRadius:20,
            padding:'20px 24px', display:'flex', alignItems:'flex-start', gap:14,
            margin:'24px 0 40px',
          }}>
            <span style={{ fontSize:28, flexShrink:0 }}>🛠️</span>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:'#fff', marginBottom:4 }}>Zero effort on your end</div>
              <p style={{ fontSize:13, color:'#9CA3AF', lineHeight:1.6, margin:0 }}>
                No technical knowledge needed. A BYOSE technician handles everything — mounting, wiring, Wi-Fi setup, and app configuration — right at your location. You just open the door.
              </p>
            </div>
          </div>

          {/* steps */}
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            {installSteps.map((s, i) => (
              <div key={i} className="bp-step-row" style={{
                display:'flex', gap:20, alignItems:'flex-start',
                padding:'20px 24px', borderRadius:16,
                background: i % 2 === 0 ? 'rgba(25,92,81,.06)' : 'transparent',
                borderLeft:'3px solid transparent', cursor:'default',
              }}>
                <div style={{ fontFamily:'DM Serif Display,serif', fontSize:36, lineHeight:1.1, color:C.brand, opacity:.5, minWidth:52, flexShrink:0 }}>
                  {s.n}
                </div>
                <div>
                  <h3 style={{ fontSize:20, margin:'0 0 6px', color:'#fff' }}>{s.title}</h3>
                  <p style={{ fontSize:14, color:'#6B7280', margin:0, lineHeight:1.65 }}>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA FOOTER
      ══════════════════════════════════════════ */}
      <section style={{
        margin:'0 16px 48px', background:C.dark, borderRadius:36,
        padding:'clamp(56px,8vw,100px) 24px', textAlign:'center',
        position:'relative', overflow:'hidden',
      }}>
        <div style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse at 50% -10%,rgba(25,92,81,.35) 0%,transparent 55%)`, pointerEvents:'none' }} />
        {[160,280,420].map((s, i) => (
          <div key={i} style={{
            position:'absolute', top:0, left:'50%',
            width:s, height:s, borderRadius:'50%',
            border:`1px solid rgba(25,92,81,${.15 - i * .04})`,
            transform:'translate(-50%,-60%)', pointerEvents:'none',
          }} />
        ))}
        <div style={{ position:'relative', zIndex:1 }}>
          <span style={{ fontSize:11, fontWeight:700, color:C.brand, letterSpacing:'.2em', textTransform:'uppercase' }}>
            Get Early Access
          </span>
          <h2 style={{ fontSize:'clamp(2.2rem,6vw,5rem)', color:'#fff', margin:'16px 0 8px', lineHeight:1.05, letterSpacing:'-.02em' }}>
            Open every gate<br/>
            <span style={{
              background:`linear-gradient(90deg,${C.brand} 20%,${C.brandL} 40%,#4EB8A6 60%,${C.brand} 80%)`,
              backgroundSize:'200% auto', WebkitBackgroundClip:'text',
              WebkitTextFillColor:'transparent', backgroundClip:'text',
              animation:'bp-shimmer 3s linear infinite',
            }}>
              with one tap.
            </span>
          </h2>
          <p style={{ color:'#4B5563', fontSize:16, marginBottom:40 }}>
            Be among the first households to go fully digital.
          </p>
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap', alignItems:'center' }}>
            <a href="/contact" className="bp-cta" style={{ textDecoration:'none' }}>
              Contact Us — Get Started
            </a>
            <a href={PLAY_STORE} target="_blank" rel="noopener noreferrer" style={{
              display:'inline-flex', alignItems:'center', gap:10,
              background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.15)',
              borderRadius:50, padding:'15px 26px', textDecoration:'none', transition:'all .3s',
            }}
            onMouseOver={e => e.currentTarget.style.background='rgba(25,92,81,.15)'}
            onMouseOut={e  => e.currentTarget.style.background='rgba(255,255,255,.06)'}>
              <span style={{ fontSize:22 }}>▶</span>
              <span style={{ fontSize:14, color:'#fff', fontWeight:700, letterSpacing:'.04em' }}>Download on Google Play</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
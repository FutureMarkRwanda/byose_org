// src/components/presence_eye/ButtonsPage.jsx
// Route: <Route path="/presence-eye/buttons" element={<ButtonsPage />} />
//
// ── SETUP ──────────────────────────────────────────────────────────────────
// 1. Replace PLAY_STORE with your real Google Play URL
// 2. Place device image at: /assets/images/buttons.png
// ───────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef } from 'react';

const PLAY_STORE = 'https://play.google.com/store/apps/details?id=info.byose.presenceeye&pcampaignid=web_share';
const APPLE_STORE = 'https://apps.apple.com/us/app/presence-eye/id6758922721';

const C = {
  brand:     '#195C51',
  brandL:    '#22897A',
  brandXL:   '#4EB8A6',
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
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

.bp * { box-sizing: border-box; margin: 0; padding: 0; }
.bp   { font-family: 'DM Sans', sans-serif; }
.bp h1,.bp h2,.bp h3,.bp h4 { font-family: 'Syne', sans-serif; }

/* ── ANIMATIONS ── */
@keyframes bp-float    { 0%,100%{transform:translateY(0)}   50%{transform:translateY(-10px)} }
@keyframes bp-blip     { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.3;transform:scale(.85)} }
@keyframes bp-ring     { 0%{transform:translate(-50%,-50%) scale(.8);opacity:.9} 100%{transform:translate(-50%,-50%) scale(3.4);opacity:0} }
@keyframes bp-fadeUp   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
@keyframes bp-fadeIn   { from{opacity:0} to{opacity:1} }
@keyframes bp-shimmer  { 0%{background-position:-200% center} 100%{background-position:200% center} }
@keyframes bp-particle { 0%{transform:translate(0,0) scale(1);opacity:1} 100%{transform:translate(var(--px),var(--py)) scale(0);opacity:0} }
@keyframes bp-confetti { 0%{transform:translate(0,0) rotate(0deg);opacity:1} 100%{transform:translate(var(--cx),var(--cy)) rotate(720deg);opacity:0} }
@keyframes bp-success  { 0%{transform:scale(0) rotate(-15deg);opacity:0} 60%{transform:scale(1.15) rotate(3deg)} 100%{transform:scale(1) rotate(0deg);opacity:1} }
@keyframes bp-gateOpen { from{transform:scaleX(1)} to{transform:scaleX(0.04)} }
@keyframes bp-gateClose{ from{transform:scaleX(0.04)} to{transform:scaleX(1)} }
@keyframes bp-scanline { 0%{top:-10%} 100%{top:110%} }
@keyframes bp-btnPulse { 0%,100%{box-shadow:0 0 0 0 rgba(25,92,81,.9),0 6px 28px rgba(25,92,81,.35)} 50%{box-shadow:0 0 0 16px rgba(25,92,81,0),0 6px 50px rgba(25,92,81,.7)} }
@keyframes bp-closePulse{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.9)} 50%{box-shadow:0 0 0 16px rgba(239,68,68,0)} }
@keyframes bp-ctaFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
@keyframes bp-glow     { 0%,100%{filter:brightness(1) drop-shadow(0 0 4px rgba(25,92,81,.3))} 50%{filter:brightness(1.2) drop-shadow(0 0 18px rgba(25,92,81,.8))} }
@keyframes bp-bounce   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
@keyframes bp-rotate   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
@keyframes bp-slideInL { from{opacity:0;transform:translateX(-32px)} to{opacity:1;transform:translateX(0)} }
@keyframes bp-slideInR { from{opacity:0;transform:translateX(32px)} to{opacity:1;transform:translateX(0)} }
@keyframes bp-pulse-border { 0%,100%{border-color:rgba(25,92,81,.25)} 50%{border-color:rgba(25,92,81,.65)} }
@keyframes bp-number   { from{opacity:0;transform:translateY(10px) scale(.8)} to{opacity:1;transform:translateY(0) scale(1)} }

.bp-float     { animation: bp-float 4s ease-in-out infinite; }
.bp-blip      { animation: bp-blip 1.6s ease-in-out infinite; }
.bp-glow-loop { animation: bp-glow 2.5s ease-in-out infinite; }
.bp-step-in   { animation: bp-fadeUp .45s ease forwards; }
.bp-bounce    { animation: bp-bounce 1.4s ease-in-out infinite; }
.bp-fade-up   { opacity:0; animation: bp-fadeUp .6s ease forwards; }

/* ── CTA BUTTON ── */
.bp-cta {
  position: relative; overflow: hidden;
  background: linear-gradient(135deg,#195C51,#22897A,#195C51);
  background-size: 200% 200%;
  animation: bp-shimmer 3s linear infinite, bp-ctaFloat 2.4s ease-in-out infinite;
  color: #fff; border: none; border-radius: 50px;
  padding: 16px 40px;
  font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700;
  letter-spacing: .06em; text-transform: uppercase;
  cursor: pointer; text-decoration: none; display: inline-block;
  box-shadow: 0 8px 32px rgba(25,92,81,.5);
  transition: transform .2s, box-shadow .2s;
}
.bp-cta::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(120deg,transparent 20%,rgba(255,255,255,.25) 50%,transparent 80%);
  transform: translateX(-100%); transition: transform .5s;
}
.bp-cta:hover::before { transform: translateX(100%); }
.bp-cta:hover {
  transform: scale(1.06) translateY(-3px) !important;
  animation: none !important;
  box-shadow: 0 18px 48px rgba(25,92,81,.65) !important;
  background: linear-gradient(135deg,#22897A,#2BA090) !important;
}

/* ── GATE BUTTONS ── */
.bp-open-btn {
  animation: bp-btnPulse 1.35s ease-in-out infinite;
  cursor: pointer; border: none;
  font-family: 'Syne',sans-serif; font-weight: 700;
  letter-spacing: .08em; text-transform: uppercase;
}
.bp-close-btn {
  animation: bp-closePulse 1.35s ease-in-out infinite;
  cursor: pointer; border: none;
  font-family: 'Syne',sans-serif; font-weight: 700;
  letter-spacing: .08em; text-transform: uppercase;
}

/* ── GATE PANELS ── */
.bp-gate-l { transform-origin: left center; }
.bp-gate-r { transform-origin: right center; }
.bp-gate-open-l  { animation: bp-gateOpen  .9s cubic-bezier(.4,0,.2,1) forwards; }
.bp-gate-open-r  { animation: bp-gateOpen  .9s cubic-bezier(.4,0,.2,1) forwards; }
.bp-gate-close-l { animation: bp-gateClose .9s cubic-bezier(.4,0,.2,1) forwards; }
.bp-gate-close-r { animation: bp-gateClose .9s cubic-bezier(.4,0,.2,1) forwards; }

/* ── SCANLINE ── */
.bp-scanline {
  position: absolute; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg,transparent,rgba(25,92,81,.6),transparent);
  animation: bp-scanline 2.2s linear infinite; pointer-events: none;
}

/* ── CARDS ── */
.bp-feat {
  transition: transform .3s ease, box-shadow .3s ease;
  cursor: default;
}
.bp-feat:hover {
  transform: translateY(-6px);
  box-shadow: 0 24px 56px rgba(25,92,81,.15) !important;
}

/* ── STEP ROWS ── */
.bp-step-row { transition: border-left-color .25s, background .25s; }
.bp-step-row:hover { border-left-color: #195C51 !important; background: rgba(25,92,81,.08) !important; }

/* ── UNDERSTAND ITEM ── */
.bp-understand { transition: transform .3s, box-shadow .3s; }
.bp-understand:hover { transform: translateY(-4px); box-shadow: 0 20px 50px rgba(25,92,81,.14) !important; }

/* ── BEFORE/AFTER TOGGLE ── */
.bp-toggle-pill {
  background: rgba(25,92,81,.1);
  border: 1px solid rgba(25,92,81,.2);
  border-radius: 50px;
  padding: 4px;
  display: inline-flex;
  gap: 4px;
}
.bp-toggle-opt {
  padding: 8px 20px;
  border-radius: 50px;
  font-family: 'Syne',sans-serif;
  font-weight: 600;
  font-size: 13px;
  letter-spacing: .04em;
  cursor: pointer;
  transition: all .25s;
  border: none;
}
`;

/* ── PARTICLE BURST ── */
function Burst({ on, color = C.brand, n = 14 }) {
  if (!on) return null;
  return (
    <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:30, overflow:'visible' }}>
      {Array.from({ length: n }, (_, i) => {
        const angle = (i / n) * 360;
        const dist  = 36 + Math.random() * 28;
        return (
          <div key={i} style={{
            position:'absolute', top:'50%', left:'50%',
            width: 4 + Math.random() * 5, height: 4 + Math.random() * 5,
            borderRadius:'50%',
            background: i % 3 === 0 ? C.gold : color,
            '--px': `${Math.cos(angle * Math.PI / 180) * dist}px`,
            '--py': `${Math.sin(angle * Math.PI / 180) * dist}px`,
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
  const cols = [C.brand, C.brandL, C.gold, '#fff', '#4EB8A6'];
  return (
    <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:40, overflow:'visible' }}>
      {Array.from({ length: 22 }, (_, i) => (
        <div key={i} style={{
          position:'absolute', bottom:'50%', left:'50%',
          width: 5 + Math.random() * 6, height: 3 + Math.random() * 4,
          background: cols[i % cols.length], borderRadius:2,
          '--cx': `${(Math.random() - .5) * 220}px`,
          '--cy': `${-(60 + Math.random() * 100)}px`,
          animation: `bp-confetti ${.75 + Math.random() * .55}s ease-out ${Math.random() * .2}s forwards`,
        }} />
      ))}
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

/* ── MINI DEVICE COMPONENTS FOR DEMO ── */
function MiniDevice({ wired, powered, burst }) {
  return (
    <div style={{ position:'relative', display:'flex', flexDirection:'column', alignItems:'center' }}>
      <Burst on={burst} />
      <Rings on={burst} />
      <div style={{
        width:72, height:72,
        background:'linear-gradient(145deg,#F2EFE8,#E5E0D4)',
        borderRadius:18,
        boxShadow: wired
          ? `0 0 0 2.5px ${C.brand},0 0 24px rgba(25,92,81,.45),0 8px 24px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.9)`
          : '0 8px 24px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.7)',
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        transition:'box-shadow .6s', position:'relative', overflow:'hidden',
      }}>
        {powered && <div className="bp-scanline" />}
        <div style={{ fontSize:7, fontWeight:800, color:C.brand, letterSpacing:'.06em', textAlign:'center', lineHeight:1.3, zIndex:1 }}>
          BYOSE<br/>Tech
        </div>
        <div style={{
          position:'absolute', bottom:7, right:7,
          width:8, height:8, borderRadius:'50%',
          background: powered ? C.brand : '#374151',
          boxShadow: powered ? `0 0 12px ${C.brand}` : 'none',
          transition:'all .5s', zIndex:2,
        }} className={powered ? 'bp-blip' : ''} />
      </div>
      <div style={{ width:3, height:12, background: wired ? '#C0BDB4' : '#374151', transition:'background .5s' }} />
      <div style={{ width:12, height:8, borderRadius:3, background: wired ? '#A09C96' : '#374151', transition:'background .5s' }} />
    </div>
  );
}

function MiniRemote({ active, burst }) {
  return (
    <div style={{ position:'relative', display:'flex', flexDirection:'column', alignItems:'center' }}>
      <Burst on={burst} color={C.brandL} />
      <Rings on={burst} color={C.brandL} />
      <div style={{
        width:54, height:88,
        background:'linear-gradient(160deg,#2A3544,#181F2B)',
        borderRadius:14,
        boxShadow: active
          ? `0 0 0 2px ${C.brand},0 0 24px rgba(25,92,81,.45),0 8px 20px rgba(0,0,0,.55)`
          : '0 8px 20px rgba(0,0,0,.45)',
        display:'flex', flexDirection:'column', alignItems:'center',
        padding:'10px 7px', gap:5,
        transition:'box-shadow .5s', position:'relative', overflow:'hidden',
      }}>
        {active && <div className="bp-scanline" />}
        <div style={{ width:20, height:3, background:'#374151', borderRadius:2, marginBottom:3 }} />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:4 }}>
          {['▲','◀','▶','▼'].map((b, i) => (
            <div key={i} style={{
              width:18, height:18, borderRadius:5,
              background: active && i === 2
                ? `linear-gradient(135deg,${C.brand},${C.brandL})`
                : 'linear-gradient(135deg,#374151,#2D3748)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:7, color: active ? '#9CA3AF' : '#4B5563',
              boxShadow: active && i === 2 ? `0 0 8px rgba(25,92,81,.6)` : 'none',
              transition:'all .4s',
            }}>{b}</div>
          ))}
        </div>
        {active && (
          <div style={{ fontSize:6, color:C.brandL, marginTop:2, letterSpacing:'.1em', fontWeight:700 }}>PAIRED</div>
        )}
      </div>
    </div>
  );
}

function MiniPhone({ online, open, onToggle, justOpened }) {
  return (
    <div style={{
      width:70, height:118,
      background:'linear-gradient(160deg,#1C2535,#0F1520)',
      borderRadius:16,
      boxShadow: online
        ? `0 0 0 2px ${C.brand},0 12px 36px rgba(25,92,81,.4),0 4px 14px rgba(0,0,0,.55)`
        : '0 8px 28px rgba(0,0,0,.55)',
      display:'flex', flexDirection:'column', alignItems:'center',
      overflow:'hidden',
      border: online ? 'none' : '2px solid #1F2937',
      transition:'box-shadow .5s', position:'relative',
    }}>
      <div style={{ width:26, height:5, background:'#0F1520', borderRadius:'0 0 8px 8px', marginTop:4 }} />
      <div style={{
        width:'100%', flex:1,
        background: online ? (open ? '#120808' : '#091410') : '#090D12',
        display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        gap:6, padding:'4px 6px 5px',
        transition:'background .6s', position:'relative', overflow:'hidden',
      }}>
        {online && <div className="bp-scanline" />}
        {!online
          ? <div style={{ fontSize:7, color:'#1F2937', textAlign:'center', letterSpacing:'.08em', lineHeight:1.5 }}>waiting<br/>setup…</div>
          : <>
              <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                <div style={{ width:5, height:5, borderRadius:'50%', background:C.brand }} className="bp-blip" />
                <span style={{ fontSize:6, color:C.brand, fontWeight:700, letterSpacing:'.1em' }}>ONLINE</span>
              </div>
              <div style={{ fontSize:5, color:'#374151', letterSpacing:'.08em', fontWeight:600 }}>BYOSE BUTTONS</div>
              <div style={{ position:'relative' }}>
                {!open && [0,.3,.6].map((d, i) => (
                  <div key={i} style={{
                    position:'absolute', top:'50%', left:'50%',
                    width:42, height:42, borderRadius:'50%',
                    border:`1.5px solid rgba(25,92,81,${.65 - i * .2})`,
                    animation:`bp-ring 1.9s ease-out ${d}s infinite`,
                    pointerEvents:'none',
                  }} />
                ))}
                <button onClick={onToggle} className={open ? 'bp-close-btn' : 'bp-open-btn'}
                  style={{
                    width:42, height:42, borderRadius:'50%',
                    background: open ? `linear-gradient(135deg,${C.danger},#B91C1C)` : `linear-gradient(135deg,${C.brand},${C.brandL})`,
                    fontSize:18, color:'#fff',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    position:'relative', zIndex:2, transition:'background .4s',
                  }}>{open ? '🔒' : '🔓'}</button>
              </div>
              <div style={{ fontSize:6, color: open ? C.danger : C.brand, fontWeight:700, letterSpacing:'.06em', transition:'color .4s' }}>
                {open ? 'TAP TO CLOSE' : 'TAP TO OPEN'}
              </div>
            </>
        }
      </div>
      <div style={{ width:'100%', height:12, background:'#090D12', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ width:20, height:2.5, background:'#1F2937', borderRadius:2 }} />
      </div>
      <Confetti on={justOpened} />
    </div>
  );
}

function MiniGate({ open, burst }) {
  return (
    <div style={{ position:'relative', width:100, height:82, flexShrink:0 }}>
      <Burst on={burst && open} color={C.gold} n={18} />
      <div style={{ position:'absolute', left:0, top:0, width:7, height:'100%', background:'linear-gradient(180deg,#6B7280,#374151)', borderRadius:'4px 0 0 4px', zIndex:2 }} />
      <div style={{ position:'absolute', right:0, top:0, width:7, height:'100%', background:'linear-gradient(180deg,#6B7280,#374151)', borderRadius:'0 4px 4px 0', zIndex:2 }} />
      <div style={{ position:'absolute', inset:0, border:'3px solid #4B5563', borderRadius:5 }} />
      <div className={`bp-gate-l ${open ? 'bp-gate-open-l' : 'bp-gate-close-l'}`} style={{
        position:'absolute', left:7, top:3, width:'calc(50% - 7px)', height:'calc(100% - 6px)',
        background: open ? 'linear-gradient(180deg,rgba(25,92,81,.15),rgba(25,92,81,.05))' : 'repeating-linear-gradient(90deg,#374151 0,#374151 3px,#4B5563 3px,#4B5563 12px)',
        transition:'background .5s',
      }} />
      <div className={`bp-gate-r ${open ? 'bp-gate-open-r' : 'bp-gate-close-r'}`} style={{
        position:'absolute', right:7, top:3, width:'calc(50% - 7px)', height:'calc(100% - 6px)',
        background: open ? 'linear-gradient(180deg,rgba(25,92,81,.15),rgba(25,92,81,.05))' : 'repeating-linear-gradient(90deg,#4B5563 0,#4B5563 3px,#374151 3px,#374151 12px)',
        transition:'background .5s',
      }} />
      {open && <div style={{ position:'absolute', inset:3, borderRadius:4, background:'radial-gradient(ellipse,rgba(25,92,81,.2) 0%,transparent 70%)' }} className="bp-float" />}
      <div style={{
        position:'absolute', bottom:-20, left:'50%', transform:'translateX(-50%)',
        fontSize:9, color: open ? C.brand : '#6B7280', fontWeight:700, whiteSpace:'nowrap', letterSpacing:'.1em', transition:'color .5s',
      }}>{open ? '✓ OPEN' : '● CLOSED'}</div>
    </div>
  );
}

function MiniPower({ on, burst }) {
  return (
    <div style={{ position:'relative', display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
      <Burst on={burst} color={C.gold} n={10} />
      <Rings on={burst} color={C.gold} />
      <div style={{
        width:42, height:42, borderRadius:12,
        background: on ? `linear-gradient(135deg,#B45309,${C.gold},#D97706)` : 'linear-gradient(135deg,#1F2937,#111827)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:20,
        boxShadow: on ? `0 0 0 2px ${C.gold},0 0 20px rgba(245,200,66,.45)` : '0 4px 12px rgba(0,0,0,.4)',
        border: on ? 'none' : '2px solid #374151',
        transition:'all .6s', position:'relative', overflow:'hidden',
      }}>
        {on && <div className="bp-scanline" />}
        <span style={{ position:'relative', zIndex:1 }}>{on ? '⚡' : '🔌'}</span>
      </div>
      <span style={{ fontSize:7, color: on ? C.gold : '#4B5563', letterSpacing:'.1em', fontWeight:600, textTransform:'uppercase', transition:'color .5s' }}>
        {on ? 'Powered' : 'Socket'}
      </span>
    </div>
  );
}

function ConnLine({ on, color = C.brand, delay = '0s' }) {
  return (
    <div style={{ flex:1, height:24, minWidth:12, display:'flex', alignItems:'center' }}>
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

function Badge({ text }) {
  if (!text) return null;
  return (
    <div style={{
      position:'absolute', top:14, right:14, zIndex:50,
      background:`linear-gradient(135deg,${C.brand},${C.brandL})`,
      borderRadius:50, padding:'7px 16px',
      display:'flex', alignItems:'center', gap:6,
      boxShadow:`0 4px 20px rgba(25,92,81,.55)`,
      animation:'bp-success .4s ease forwards',
    }}>
      <span style={{ fontSize:13 }}>✓</span>
      <span style={{ fontSize:10, fontWeight:700, color:'#fff', letterSpacing:'.1em', textTransform:'uppercase' }}>{text}</span>
    </div>
  );
}

/* ── INTERACTIVE DEMO ── */
const STEPS = [
  { title:'Mount & Connect', desc:'Tap below to clip the Buttons device onto your physical gate remote. Watch them pair up.', action:'⚡ Connect Device' },
  { title:'Plug In Power',   desc:'Now connect the USB cable to a nearby wall socket. The device boots up instantly.', action:'🔌 Plug In' },
  { title:'Control from Your Phone', desc:'Your phone is now live! Tap the glowing button on the phone screen to open the gate from anywhere.', action: null },
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
    const f = () => setMobile(window.innerWidth < 680);
    f();
    window.addEventListener('resize', f);
    return () => window.removeEventListener('resize', f);
  }, []);

  const burst = (fn) => { fn(true); setTimeout(() => fn(false), 900); };
  const flash = (t)  => { setBadge(t); setTimeout(() => setBadge(''), 2600); };

  const act = () => {
    if (step === 0) { burst(setB1); burst(setB2); flash('Device Connected!'); setTimeout(() => setStep(1), 150); }
    else if (step === 1) { burst(setBPow); flash('Powered On!'); setTimeout(() => setStep(2), 150); }
  };

  const toggle = () => {
    if (step < 2) return;
    const opening = !open;
    setOpen(opening);
    if (opening) { burst(setBGate); setJustOpened(true); flash('Gate Opened! 🎉'); setTimeout(() => setJustOpened(false), 1400); }
    else { flash('Gate Closed 🔒'); }
  };

  return (
    <div style={{
      background:`radial-gradient(ellipse at 20% 50%,rgba(25,92,81,.13) 0%,transparent 50%),radial-gradient(ellipse at 80% 50%,rgba(25,92,81,.08) 0%,transparent 50%),linear-gradient(160deg,#060B0F,#0C1520 50%,#060B0F)`,
      borderRadius:24, padding: mobile ? '24px 16px 32px' : '32px 32px 40px',
      position:'relative', overflow:'hidden',
      border:'1px solid rgba(25,92,81,.22)',
      boxShadow:'0 24px 80px rgba(0,0,0,.55)',
    }}>
      <div style={{ position:'absolute', inset:0, opacity:.035, backgroundImage:'linear-gradient(rgba(25,92,81,1) 1px,transparent 1px),linear-gradient(90deg,rgba(25,92,81,1) 1px,transparent 1px)', backgroundSize:'30px 30px', pointerEvents:'none' }} />
      <Badge text={badge} />

      {/* header */}
      <div style={{ position:'relative', zIndex:3, marginBottom:24 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10, flexWrap:'wrap', gap:8 }}>
          <span style={{ fontSize:10, fontWeight:700, color:C.brand, letterSpacing:'.2em', textTransform:'uppercase' }}>Interactive Setup</span>
          <div style={{ display:'flex', gap:5 }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{
                width: i === step ? 24 : 7, height:7, borderRadius:4,
                background: i < step ? C.brand : i === step ? C.brandL : '#1F2937',
                boxShadow: i === step ? `0 0 8px ${C.brand}` : 'none',
                transition:'all .5s cubic-bezier(.4,0,.2,1)',
              }} />
            ))}
          </div>
        </div>
        <div style={{ height:3, background:'#0F1821', borderRadius:2, marginBottom:14, overflow:'hidden' }}>
          <div style={{ height:'100%', borderRadius:2, background:`linear-gradient(90deg,${C.brand},${C.brandL})`, width:`${step === 0 ? 0 : step === 1 ? 50 : 100}%`, transition:'width .7s cubic-bezier(.4,0,.2,1)' }} />
        </div>
        <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
          <div style={{ width:32, height:32, borderRadius:9, flexShrink:0, background:`linear-gradient(135deg,${C.brand},${C.brandL})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:'#fff', fontFamily:'Syne,sans-serif', boxShadow:`0 4px 14px rgba(25,92,81,.4)` }}>{step + 1}</div>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:'#fff', marginBottom:3, fontFamily:'Syne,sans-serif' }}>{STEPS[step].title}</div>
            <p key={step} className="bp-step-in" style={{ fontSize:12, color:'#9CA3AF', lineHeight:1.6, margin:0 }}>{STEPS[step].desc}</p>
          </div>
        </div>
      </div>

      {/* stage */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap: mobile ? 3 : 7, flexWrap: mobile ? 'wrap' : 'nowrap', position:'relative', zIndex:2, padding: mobile ? '0 0 24px' : '6px 0 32px', rowGap: mobile ? 24 : 7 }}>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
          <MiniDevice wired={step >= 1} powered={step >= 2} burst={b1} />
          <span style={{ fontSize:8, color:'#4B5563', letterSpacing:'.1em', textTransform:'uppercase', fontWeight:600 }}>Device</span>
        </div>
        <ConnLine on={step >= 1} color={C.brand} delay=".1s" />
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
          <MiniRemote active={step >= 1} burst={b2} />
          <span style={{ fontSize:8, color:'#4B5563', letterSpacing:'.1em', textTransform:'uppercase', fontWeight:600 }}>Remote</span>
        </div>
        <ConnLine on={step >= 2} color={C.gold} delay=".2s" />
        <MiniPower on={step >= 2} burst={bPow} />
        {mobile && <div style={{ width:'100%', height:0 }} />}
        <ConnLine on={step >= 2} color={C.brandL} delay=".3s" />
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
          <MiniPhone online={step >= 2} open={open} onToggle={toggle} justOpened={justOpened} />
          <span style={{ fontSize:8, color:'#4B5563', letterSpacing:'.1em', textTransform:'uppercase', fontWeight:600 }}>Your Phone</span>
        </div>
        <ConnLine on={open} color={C.brand} delay="0s" />
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
          <MiniGate open={open} burst={bGate} />
          <span style={{ fontSize:8, color:'#4B5563', letterSpacing:'.1em', textTransform:'uppercase', fontWeight:600, marginTop:20 }}>Gate</span>
        </div>
      </div>

      {/* actions */}
      <div style={{ position:'relative', zIndex:3, display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
        {STEPS[step].action && (
          <button onClick={act} className="bp-open-btn" style={{ padding:'14px 36px', background:`linear-gradient(135deg,${C.brand},${C.brandL})`, color:'#fff', fontSize:13, fontWeight:700, letterSpacing:'.07em', textTransform:'uppercase', borderRadius:50 }}>
            {STEPS[step].action}
          </button>
        )}
        {step === 2 && (
          <p className="bp-bounce" style={{ fontSize:10, color:C.brand, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', textAlign:'center' }}>
            👆 Tap the glowing button on the phone!
          </p>
        )}
        {step > 0 && (
          <button onClick={() => { setStep(0); setOpen(false); setBadge(''); }} style={{ background:'transparent', border:'1px solid #1F2937', borderRadius:50, padding:'7px 20px', color:'#4B5563', fontSize:10, fontWeight:600, cursor:'pointer', letterSpacing:'.08em', textTransform:'uppercase', fontFamily:'DM Sans,sans-serif' }}>
            ↺ Reset
          </button>
        )}
      </div>
    </div>
  );
}

/* ── BEFORE / AFTER COMPARISON ── */
function BeforeAfter() {
  const [view, setView] = useState('before');
  const before = [
    { icon:'📡', title:'Range Limited to ~10m', body:'Physical remotes only work if you\'re close enough to the gate — a daily frustration.' },
    { icon:'💸', title:'Buy More Remotes', body:'Each household member needs their own physical remote. Costs add up fast.' },
    { icon:'🚗', title:'Must Be Present', body:'You need to physically be at the gate or send someone. Guests get locked out.' },
    { icon:'📦', title:'Lost = Replace', body:'Lose your remote? Get a new one programmed — waste of time and money.' },
  ];
  const after = [
    { icon:'🌍', title:'Open From Anywhere', body:'Command your gate from any device, anywhere in the world — all you need is internet.' },
    { icon:'👥', title:'Share Digitally', body:'Invite family, friends, or staff through the app. No physical remotes needed.' },
    { icon:'📱', title:'Phone Is Your Remote', body:'One tap in the app triggers the gate instantly. No extra hardware to carry.' },
    { icon:'🔄', title:'Revoke Anytime', body:'Remove someone\'s access instantly through the app. Full control, always.' },
  ];
  const items = view === 'before' ? before : after;
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'center', marginBottom:40 }}>
        <div className="bp-toggle-pill">
          {['before','after'].map(v => (
            <button key={v} className="bp-toggle-opt" onClick={() => setView(v)} style={{
              background: view === v ? C.brand : 'transparent',
              color: view === v ? '#fff' : C.muted,
            }}>
              {v === 'before' ? '😩 Without Buttons' : '✨ With Buttons'}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,240px),1fr))', gap:16 }}>
        {items.map((item, i) => (
          <div key={`${view}-${i}`} className="bp-understand bp-fade-up" style={{
            background: view === 'after' ? `linear-gradient(145deg,rgba(25,92,81,.07),rgba(25,92,81,.02))` : 'rgba(239,68,68,.04)',
            border: `1px solid ${view === 'after' ? 'rgba(25,92,81,.2)' : 'rgba(239,68,68,.12)'}`,
            borderRadius:18, padding:'24px 20px',
            animationDelay:`${i * .08}s`,
          }}>
            <div style={{ fontSize:28, marginBottom:12 }}>{item.icon}</div>
            <h4 style={{ fontSize:15, fontWeight:700, color:C.ink, marginBottom:8, lineHeight:1.3 }}>{item.title}</h4>
            <p style={{ fontSize:13, color:C.muted, lineHeight:1.65, margin:0 }}>{item.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── DATA ── */
const features = [
  { icon:'📡', title:'Extended Range', body:'Physical remotes max out at ~10m. Buttons routes commands over Wi-Fi — open your gate from across the city.' },
  { icon:'👥', title:'Shared Digital Access', body:'Add family, neighbours, or staff in the app. No extra remotes — they use their own phone.' },
  { icon:'🔒', title:'No Modification Needed', body:'Attached on your existing remote with zero damage to hardware. Tested for safety and reliability.' },
  { icon:'⚡', title:'Ultra-Low Power', body:'Sips minimal current via USB. Stays plugged in 24/7 without affecting your electricity bill.' },
  { icon:'📱', title:'Works With Any Gate', body:'If you have a physical remote for your gate, Buttons can work with it. No gate replacement needed.' },
  { icon:'🌍', title:'Modernise Without Replacing', body:'Bridge the gap between analog gate systems and the smart home era — without buying new hardware.' },
];

const installSteps = [
  { n:'01', title:'We Come to You', body:'A BYOSE Tech technician visits at your convenience — home, apartment complex, or workplace.' },
  { n:'02', title:'Device Mounted', body:'We clip Buttons onto your existing gate remote. No drilling, no special tools required.' },
  { n:'03', title:'Wired & Powered', body:'Our technician wires the contacts and routes a USB cable to a nearby power socket.' },
  { n:'04', title:'Wi-Fi & App Setup', body:'We connect the device to your home Wi-Fi and pair it with the Buttons app on your phone.' },
  { n:'05', title:"You're Live", body:"We walk you through sharing access with family and hand over full control. Done." },
];

/* ── PAGE ── */
export default function ButtonsPage() {
  useEffect(() => {
    const id = 'bp-styles';
    if (!document.getElementById(id)) {
      const s = document.createElement('style');
      s.id = id; s.textContent = CSS;
      document.head.appendChild(s);
    }
    return () => {};
  }, []);

  return (
    <div className="bp" style={{ background:C.white, color:C.ink }}>

      {/* ════════════════════════════════════════
          HERO
      ════════════════════════════════════════ */}
      <section style={{
        background:`radial-gradient(ellipse at 30% 20%,rgba(25,92,81,.28) 0%,transparent 45%),radial-gradient(ellipse at 70% 80%,rgba(25,92,81,.16) 0%,transparent 40%),linear-gradient(160deg,#040810 0%,#0A1619 40%,#040810 100%)`,
        minHeight:'95vh',
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        padding:'clamp(80px,10vw,120px) clamp(20px,5vw,60px) 60px',
        position:'relative', overflow:'hidden',
      }}>
        {/* decorative rings */}
        {[200,360,520].map((s, i) => (
          <div key={i} style={{
            position:'absolute', top:'50%', left:'50%',
            width:s, height:s, borderRadius:'50%',
            border:`1px solid rgba(25,92,81,${.12 - i * .03})`,
            transform:'translate(-50%,-50%)', pointerEvents:'none',
          }} />
        ))}

        <div style={{ textAlign:'center', position:'relative', zIndex:2, maxWidth:780 }}>
          {/* product badge */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:10, background:'rgba(25,92,81,.1)', border:'1px solid rgba(25,92,81,.3)', borderRadius:50, padding:'8px 22px', marginBottom:32 }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:C.brand }} className="bp-blip" />
            <span style={{ fontSize:11, fontWeight:700, color:C.brand, letterSpacing:'.2em', textTransform:'uppercase' }}>New Product · BYOSE Tech</span>
          </div>

          <h1 style={{ fontSize:'clamp(3.5rem,11vw,8rem)', lineHeight:.92, color:'#fff', marginBottom:12, letterSpacing:'-.03em', fontWeight:800 }}>
            Buttons<span style={{ color:C.brand }}>.</span>
          </h1>

          {/* ONE-LINE VALUE PROP — crystal clear */}
          <p style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(1.05rem,2.8vw,1.5rem)', color:'#9CA3AF', fontWeight:700, marginBottom:20, letterSpacing:'-.01em' }}>
            Turn your physical gate remote into a smart, app-controlled device.
          </p>

          {/* WHAT IT ACTUALLY IS — for the uninitiated */}
          <div style={{
            background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)',
            borderRadius:18, padding:'18px 28px', maxWidth:580, margin:'0 auto 40px',
            backdropFilter:'blur(12px)',
          }}>
            <p style={{ fontSize:'clamp(13px,2vw,15px)', color:'#6B7280', lineHeight:1.8, margin:0 }}>
              Buttons is a <span style={{ color:'#fff', fontWeight:700 }}>small hardware device</span> you clip onto your existing gate remote.
              It connects to your Wi-Fi so you can <span style={{ color:'#fff', fontWeight:700 }}>open your gate from anywhere</span> using your phone —
              and <span style={{ color:'#fff', fontWeight:700 }}>share access</span> with family without buying extra remotes.
            </p>
          </div>

          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap', alignItems:'center' }}>
            <a href="#demo" className="bp-cta">✦ See How It Works</a>
            <a href="#understand" style={{
              padding:'15px 30px', background:'transparent', color:'#6B7280',
              border:'1px solid rgba(255,255,255,.1)', borderRadius:50, fontSize:13, fontWeight:600,
              textDecoration:'none', letterSpacing:'.05em', textTransform:'uppercase', display:'inline-block',
              transition:'color .3s, border-color .3s',
            }}>What is it exactly?</a>
          </div>
            <div className='bp-float gap-6' style={{ marginTop:40, display:'flex', justifyContent:'center' }}>
          {/* Play Store */}
          <div style={{ marginTop:38, display:'flex', justifyContent:'center' }}>
            <a href={PLAY_STORE} target="_blank" rel="noopener noreferrer" style={{
              display:'inline-flex', alignItems:'center', gap:12,
              background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)',
              borderRadius:14, padding:'10px 20px', textDecoration:'none',
              backdropFilter:'blur(10px)', transition:'all .3s',
            }}
            onMouseOver={e => { e.currentTarget.style.background='rgba(25,92,81,.15)'; e.currentTarget.style.borderColor='rgba(25,92,81,.4)'; }}
            onMouseOut={e  => { e.currentTarget.style.background='rgba(255,255,255,.05)'; e.currentTarget.style.borderColor='rgba(255,255,255,.1)'; }}>
              <span style={{ fontSize:26, lineHeight:1 }}>▶</span>
              <div>
                <div style={{ fontSize:9, color:'#9CA3AF', letterSpacing:'.1em', textTransform:'uppercase', fontWeight:600 }}>Available on</div>
                <div style={{ fontSize:14, color:'#fff', fontWeight:700 }}>Google Play</div>
              </div>
            </a>
          </div>
          <div style={{ marginTop:38, display:'flex', justifyContent:'center' }}>
            <a href={APPLE_STORE} target="_blank" rel="noopener noreferrer" style={{
              display:'inline-flex', alignItems:'center', gap:12,
              background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)',
              borderRadius:14, padding:'10px 20px', textDecoration:'none',
              backdropFilter:'blur(10px)', transition:'all .3s',
            }}
            onMouseOver={e => { e.currentTarget.style.background='rgba(25,92,81,.15)'; e.currentTarget.style.borderColor='rgba(25,92,81,.4)'; }}
            onMouseOut={e  => { e.currentTarget.style.background='rgba(255,255,255,.05)'; e.currentTarget.style.borderColor='rgba(255,255,255,.1)'; }}>
              <span style={{ fontSize:26, lineHeight:1 }}>▶</span>
              <div>
                <div style={{ fontSize:9, color:'#9CA3AF', letterSpacing:'.1em', textTransform:'uppercase', fontWeight:600 }}>Available on</div>
                <div style={{ fontSize:14, color:'#fff', fontWeight:700 }}>Apple Store</div>
              </div>
            </a>
          </div>
          </div>
        </div>

        {/* floating demo strip */}
        <div className="bp-float" style={{ marginTop:56, position:'relative', zIndex:2 }}>
          <div style={{ background:'rgba(25,92,81,.07)', border:'1px solid rgba(25,92,81,.2)', borderRadius:24, padding:'20px 32px', display:'flex', gap:18, alignItems:'center', backdropFilter:'blur(12px)' }}>
            <MiniDevice wired powered />
            <ConnLine on color={C.brand} />
            <MiniRemote active />
            <ConnLine on color={C.brand} />
            <div style={{ fontSize:11, color:C.brand, fontWeight:700, letterSpacing:'.1em', textAlign:'center' }}>📱<br /><span style={{ fontSize:8 }}>APP</span></div>
            <ConnLine on color={C.brandL} />
            <div style={{ fontSize:11, color:'#4B5563', fontWeight:700, letterSpacing:'.08em', textAlign:'center' }}>🚪<br /><span style={{ fontSize:8 }}>GATE</span></div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          UNDERSTAND SECTION — "What exactly is it?"
      ════════════════════════════════════════ */}
      <section id="understand" style={{ padding:'clamp(60px,8vw,100px) clamp(20px,5vw,60px)', background:C.white }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:20 }}>
            <span style={{ fontSize:11, fontWeight:700, color:C.brand, letterSpacing:'.2em', textTransform:'uppercase' }}>The Big Picture</span>
            <h2 style={{ fontSize:'clamp(2rem,5vw,3.5rem)', margin:'12px 0 16px', color:C.ink, lineHeight:1.05, letterSpacing:'-.02em' }}>
              What is Buttons, exactly?
            </h2>
            <p style={{ fontSize:'clamp(14px,2vw,17px)', color:C.muted, maxWidth:580, margin:'0 auto', lineHeight:1.7 }}>
              If you have a physical remote for a gate at home or work, Buttons transforms it into a smart device — without replacing anything.
            </p>
          </div>

          {/* VISUAL EXPLAINER */}
          <div style={{
            display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,300px),1fr))',
            gap:2, marginBottom:60, background:C.surface, borderRadius:24, overflow:'hidden',
            border:`1px solid rgba(25,92,81,.1)`,
          }}>
            {[
              { step:'1', label:'You have this', title:'A physical gate remote', desc:'Works fine — but limited range, no sharing, must be present to use it.', icon:'📻', accent:'rgba(239,68,68,.1)', border:'rgba(239,68,68,.2)', color:C.danger },
              { step:'2', label:'You add this', title:'Buttons device', desc:'A small square device that is attached directly onto your existing remote.', icon:'🔲', accent:'rgba(25,92,81,.08)', border:'rgba(25,92,81,.25)', color:C.brand },
              { step:'3', label:'Now you get this', title:'Smart gate control', desc:'Open your gate from anywhere using your phone. Share access with family digitally. No limits on range.', icon:'✨', accent:'rgba(25,92,81,.12)', border:'rgba(25,92,81,.3)', color:C.brandL },
            ].map((item, i) => (
              <div key={i} style={{ padding:'32px 28px', background:`linear-gradient(145deg,${item.accent},transparent)`, borderLeft: i > 0 ? `1px solid ${item.border}` : 'none', position:'relative' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                  <div style={{ width:28, height:28, borderRadius:8, background:item.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:'#fff', fontFamily:'Syne,sans-serif' }}>{item.step}</div>
                  <span style={{ fontSize:10, fontWeight:700, color:item.color, letterSpacing:'.15em', textTransform:'uppercase' }}>{item.label}</span>
                </div>
                <div style={{ fontSize:32, marginBottom:12 }}>{item.icon}</div>
                <h3 style={{ fontSize:18, fontWeight:700, color:C.ink, marginBottom:8, lineHeight:1.2 }}>{item.title}</h3>
                <p style={{ fontSize:13, color:C.muted, lineHeight:1.7, margin:0 }}>{item.desc}</p>
              </div>
            ))}
          </div>

          {/* BEFORE / AFTER TOGGLE */}
          <BeforeAfter />
        </div>
      </section>

      {/* ════════════════════════════════════════
          DEVICE IMAGE + DESCRIPTION
      ════════════════════════════════════════ */}
      <section style={{ padding:'clamp(60px,8vw,100px) clamp(20px,5vw,60px)', background:C.surface }}>
        <div style={{ maxWidth:1060, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,420px),1fr))', gap:60, alignItems:'center' }}>
          {/* image */}
          <div style={{ display:'flex', justifyContent:'center' }}>
            <div style={{ position:'relative' }}>
              <div style={{ position:'absolute', inset:-40, background:`radial-gradient(ellipse,rgba(25,92,81,.13) 0%,transparent 70%)`, borderRadius:'50%', pointerEvents:'none' }} />
              <div className="bp-float" style={{
                width:280, height:280,
                background:'linear-gradient(145deg,#F0EDE6,#E5E0D6)',
                borderRadius:36,
                boxShadow:'0 32px 80px rgba(0,0,0,.14),0 0 0 1px rgba(0,0,0,.05),inset 0 2px 0 rgba(255,255,255,.8)',
                display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                position:'relative', overflow:'hidden',
              }}>
                <img src="/assets/images/buttons.png" alt="BYOSE Buttons device" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:36 }} />
                <div style={{ position:'absolute', bottom:20, right:20, width:11, height:11, borderRadius:'50%', background:C.brand, boxShadow:`0 0 14px ${C.brand}` }} className="bp-blip" />
                <div style={{ position:'absolute', bottom:-26, left:'50%', transform:'translateX(-50%)', width:4, height:26, background:'#C0BDB4', borderRadius:'0 0 3px 3px' }} />
                <div style={{ position:'absolute', bottom:-38, left:'50%', transform:'translateX(-50%)', width:14, height:12, background:'#9CA3AF', borderRadius:4 }} />
              </div>
            </div>
          </div>

          {/* text */}
          <div>
            <span style={{ fontSize:11, fontWeight:700, color:C.brand, letterSpacing:'.2em', textTransform:'uppercase' }}>The Hardware</span>
            <h2 style={{ fontSize:'clamp(1.8rem,4vw,3rem)', margin:'12px 0 20px', color:C.ink, lineHeight:1.1, letterSpacing:'-.02em' }}>
              A small square.<br/>A big upgrade.
            </h2>
            <p style={{ color:C.muted, lineHeight:1.8, fontSize:15, marginBottom:14 }}>
              Buttons is a compact, white device with soft rounded corners and the BYOSE Tech logo on its face. A thin wire extends from the base and connects directly to your gate remote's button contacts — no soldering, no permanent change.
            </p>
            <p style={{ color:C.muted, lineHeight:1.8, fontSize:15, marginBottom:22 }}>
              A USB power cable keeps it running 24/7. Once installed, it sits invisibly alongside your remote, always ready. Your physical remote still works exactly as before — Buttons just adds intelligence on top.
            </p>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:28 }}>
              {['Wi-Fi 2.4 GHz','App Controlled','Multi-user','Always On','Zero Modification'].map(t => (
                <span key={t} style={{ padding:'7px 15px', borderRadius:50, background:C.brandFade, color:C.brand, fontSize:12, fontWeight:700, letterSpacing:'.05em' }}>{t}</span>
              ))}
            </div>
            <div className='gap-10 flex'>
            <a href={PLAY_STORE} target="_blank" rel="noopener noreferrer" style={{
              display:'inline-flex', alignItems:'center', gap:12,
              background:C.dark, border:`1px solid rgba(25,92,81,.3)`,
              borderRadius:14, padding:'12px 22px', textDecoration:'none', transition:'box-shadow .3s',
            }}
            onMouseOver={e => e.currentTarget.style.boxShadow=`0 8px 24px rgba(25,92,81,.3)`}
            onMouseOut={e  => e.currentTarget.style.boxShadow='none'}>
              <span style={{ fontSize:26 }}>▶</span>
              <div>
                <div style={{ fontSize:9, color:'#6B7280', letterSpacing:'.1em', textTransform:'uppercase' }}>Download on</div>
                <div style={{ fontSize:14, color:'#fff', fontWeight:700 }}>Google Play</div>
              </div>
            </a>
               <a href={APPLE_STORE} target="_blank" rel="noopener noreferrer" style={{
              display:'inline-flex', alignItems:'center', gap:12,
              background:C.dark, border:`1px solid rgba(25,92,81,.3)`,
              borderRadius:14, padding:'12px 22px', textDecoration:'none', transition:'box-shadow .3s',
            }}
            onMouseOver={e => e.currentTarget.style.boxShadow=`0 8px 24px rgba(25,92,81,.3)`}
            onMouseOut={e  => e.currentTarget.style.boxShadow='none'}>
              <span style={{ fontSize:26 }}>▶</span>
              <div>
                <div style={{ fontSize:9, color:'#6B7280', letterSpacing:'.1em', textTransform:'uppercase' }}>Download on</div>
                <div style={{ fontSize:14, color:'#fff', fontWeight:700 }}>Apple Store</div>
              </div>
            </a>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          INTERACTIVE DEMO
      ════════════════════════════════════════ */}
      <section id="demo" style={{ padding:'clamp(60px,8vw,100px) clamp(20px,5vw,60px)', background:C.white }}>
        <div style={{ maxWidth:960, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:44 }}>
            <span style={{ fontSize:11, fontWeight:700, color:C.brand, letterSpacing:'.2em', textTransform:'uppercase' }}>Try It</span>
            <h2 style={{ fontSize:'clamp(2rem,5vw,3.5rem)', margin:'12px 0 8px', color:C.ink, letterSpacing:'-.02em' }}>
              Setup in 3 steps.
            </h2>
            <p style={{ color:C.muted, fontSize:15 }}>Walk through the full flow interactively.</p>
          </div>
          <Demo />
        </div>
      </section>

      {/* ════════════════════════════════════════
          FEATURES
      ════════════════════════════════════════ */}
      <section style={{ padding:'clamp(60px,8vw,100px) clamp(20px,5vw,60px)', background:C.surface }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:52 }}>
            <span style={{ fontSize:11, fontWeight:700, color:C.brand, letterSpacing:'.2em', textTransform:'uppercase' }}>Why Buttons</span>
            <h2 style={{ fontSize:'clamp(2rem,5vw,3.5rem)', margin:'12px 0 0', color:C.ink, letterSpacing:'-.02em' }}>
              Every advantage,<br/>in one small device.
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,310px),1fr))', gap:18 }}>
            {features.map((f, i) => (
              <div key={i} className="bp-feat" style={{
                background:C.white, borderRadius:20, padding:'28px 24px',
                borderTop:`3px solid ${C.brand}`, boxShadow:'0 4px 20px rgba(0,0,0,.04)',
              }}>
                <div style={{ fontSize:32, marginBottom:12 }}>{f.icon}</div>
                <h3 style={{ fontSize:18, margin:'0 0 10px', color:C.ink, fontWeight:700 }}>{f.title}</h3>
                <p style={{ fontSize:13, color:C.muted, lineHeight:1.75, margin:0 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          HOW IT WORKS — INSTALLATION
      ════════════════════════════════════════ */}
      <section id="how" style={{ padding:'clamp(60px,8vw,100px) clamp(20px,5vw,60px)', background:C.dark }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:16 }}>
            <span style={{ fontSize:11, fontWeight:700, color:C.brand, letterSpacing:'.2em', textTransform:'uppercase' }}>Installation</span>
            <h2 style={{ fontSize:'clamp(2rem,5vw,3.5rem)', margin:'12px 0 0', color:'#fff', letterSpacing:'-.02em' }}>We do it for you.</h2>
          </div>

          <div style={{ background:'linear-gradient(135deg,rgba(25,92,81,.15),rgba(25,92,81,.04))', border:'1px solid rgba(25,92,81,.28)', borderRadius:18, padding:'18px 22px', display:'flex', alignItems:'flex-start', gap:14, margin:'24px 0 40px' }}>
            <span style={{ fontSize:26, flexShrink:0 }}>🛠️</span>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:'#fff', marginBottom:3 }}>Zero effort on your end</div>
              <p style={{ fontSize:13, color:'#9CA3AF', lineHeight:1.65, margin:0 }}>
                No technical knowledge needed. A BYOSE technician handles mounting, wiring, Wi-Fi setup, and app configuration at your location.
              </p>
            </div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            {installSteps.map((s, i) => (
              <div key={i} className="bp-step-row" style={{
                display:'flex', gap:20, alignItems:'flex-start',
                padding:'20px 22px', borderRadius:14,
                background: i % 2 === 0 ? 'rgba(25,92,81,.06)' : 'transparent',
                borderLeft:'3px solid transparent', cursor:'default',
              }}>
                <div style={{ fontFamily:'Syne,sans-serif', fontSize:34, lineHeight:1.1, color:C.brand, opacity:.45, minWidth:50, flexShrink:0, fontWeight:800 }}>{s.n}</div>
                <div>
                  <h3 style={{ fontSize:18, margin:'0 0 5px', color:'#fff', fontWeight:700 }}>{s.title}</h3>
                  <p style={{ fontSize:13, color:'#6B7280', margin:0, lineHeight:1.65 }}>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          CTA FOOTER
      ════════════════════════════════════════ */}
<section style={{ margin:'80px 16px 48px', background:C.dark, borderRadius:36, padding:'clamp(60px,8vw,100px) 24px', textAlign:'center', position:'relative', overflow:'hidden' }}>
  <div style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse at 50% -10%,rgba(25,92,81,.35) 0%,transparent 55%)`, pointerEvents:'none' }} />
  {[160,280,420].map((s, i) => (
    <div key={i} style={{ position:'absolute', top:0, left:'50%', width:s, height:s, borderRadius:'50%', border:`1px solid rgba(25,92,81,${.14 - i * .04})`, transform:'translate(-50%,-60%)', pointerEvents:'none' }} />
  ))}
  <div style={{ position:'relative', zIndex:1 }}>
    <span style={{ fontSize:11, fontWeight:700, color:C.brand, letterSpacing:'.2em', textTransform:'uppercase' }}>Get Early Access</span>
    <h2 style={{ fontSize:'clamp(2.2rem,6vw,5rem)', color:'#fff', margin:'16px 0 8px', lineHeight:1.05, letterSpacing:'-.03em', fontWeight:800 }}>
      Open your gate<br/>
      <span style={{ background:`linear-gradient(90deg,${C.brand} 20%,${C.brandL} 40%,#4EB8A6 60%,${C.brand} 80%)`, backgroundSize:'200% auto', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', animation:'bp-shimmer 3s linear infinite' }}>
        with one tap.
      </span>
    </h2>
    <p style={{ color:'#4B5563', fontSize:16, marginBottom:40 }}>
      Be among the first households to go fully digital.
    </p>
    <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap', alignItems:'center' }}>
      <a href="/contact" className="bp-cta" style={{ textDecoration:'none' }}>Contact Us — Get Started</a>
      <a href={APPLE_STORE} target="_blank" rel="noopener noreferrer"
        style={{ display:'inline-flex', alignItems:'center', gap:10, background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.12)', borderRadius:50, padding:'14px 24px', textDecoration:'none', transition:'all .3s' }}
        onMouseOver={e => e.currentTarget.style.background='rgba(25,92,81,.15)'}
        onMouseOut={e  => e.currentTarget.style.background='rgba(255,255,255,.05)'}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color:'#fff' }}>
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
        </svg>
        <span style={{ fontSize:13, color:'#fff', fontWeight:700, letterSpacing:'.04em' }}>Download on Apple Store</span>
      </a>
      <a href={PLAY_STORE} target="_blank" rel="noopener noreferrer"
        style={{ display:'inline-flex', alignItems:'center', gap:10, background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.12)', borderRadius:50, padding:'14px 24px', textDecoration:'none', transition:'all .3s' }}
        onMouseOver={e => e.currentTarget.style.background='rgba(25,92,81,.15)'}
        onMouseOut={e  => e.currentTarget.style.background='rgba(255,255,255,.05)'}>
        <span style={{ fontSize:20 }}>▶</span>
        <span style={{ fontSize:13, color:'#fff', fontWeight:700, letterSpacing:'.04em' }}>Download on Google Play</span>
      </a>
    </div>
  </div>
</section>

    </div>
  );
}
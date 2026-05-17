import { useState, useEffect } from 'react';
import {CSS} from '../../utils/data.js';
// ── STORE LINKS ──
const PLAY_STORE = 'https://play.google.com/store/apps/details?id=info.byose.presenceeye&pcampaignid=web_share';
const APPLE_STORE = 'https://apps.apple.com/us/app/presence-eye/id6758922721';

// ── DESIGN TOKENS ──
const C = {
  brand: '#195C51',
  brandL: '#22897A',
  brandXL: '#4EB8A6',
  brandFade: 'rgba(25,92,81,0.10)',
  dark: '#060B0F',
  darkCard: '#0C1520',
  ink: '#1A242F',
  muted: '#6B7280',
  surface: '#F4F6F5',
  white: '#FFFFFF',
  gold: '#F5C842',
  danger: '#EF4444',
  amber: '#F59E0B',
};

// ── PARTICLES ──
function Burst({ on, color = C.brand, n = 14 }) {
  if (!on) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 30, overflow: 'visible' }}>
      {Array.from({ length: n }, (_, i) => {
        const angle = (i / n) * 360;
        const dist = 36 + Math.random() * 28;
        return (
          <div key={i} style={{
            position: 'absolute', top: '50%', left: '50%',
            width: 4 + Math.random() * 5, height: 4 + Math.random() * 5,
            borderRadius: '50%',
            background: i % 3 === 0 ? C.gold : color,
            '--px': `${Math.cos(angle * Math.PI / 180) * dist}px`,
            '--py': `${Math.sin(angle * Math.PI / 180) * dist}px`,
            animation: `pe-particle ${.45 + Math.random() * .35}s ease-out ${Math.random() * .12}s forwards`,
            transform: 'translate(-50%,-50%)',
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
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 40, overflow: 'visible' }}>
      {Array.from({ length: 22 }, (_, i) => (
        <div key={i} style={{
          position: 'absolute', bottom: '50%', left: '50%',
          width: 5 + Math.random() * 6, height: 3 + Math.random() * 4,
          background: cols[i % cols.length], borderRadius: 2,
          '--cx': `${(Math.random() - .5) * 220}px`,
          '--cy': `${-(60 + Math.random() * 100)}px`,
          animation: `pe-confetti ${.75 + Math.random() * .55}s ease-out ${Math.random() * .2}s forwards`,
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
          position: 'absolute', top: '50%', left: '50%',
          width: 56, height: 56, borderRadius: '50%',
          border: `2px solid ${color}`,
          animation: `pe-ring 1.1s ease-out ${d}s forwards`,
          pointerEvents: 'none', zIndex: 20,
        }} />
      ))}
    </>
  );
}

// ── DEMO MINI COMPONENTS ──
function MiniDevice({ wired, powered, burst }) {
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Burst on={burst} />
      <Rings on={burst} />
      <div style={{
        width: 72, height: 72, background: 'linear-gradient(145deg,#F2EFE8,#E5E0D4)', borderRadius: 18,
        boxShadow: wired ? `0 0 0 2.5px ${C.brand},0 0 24px rgba(25,92,81,.45),0 8px 24px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.9)` : '0 8px 24px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.7)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        transition: 'box-shadow .6s', position: 'relative', overflow: 'hidden',
      }}>
        {powered && <div className="pe-scanline" />}
        <div style={{ fontSize: 7, fontWeight: 800, color: C.brand, letterSpacing: '.06em', textAlign: 'center', lineHeight: 1.3, zIndex: 1 }}>BYOSE<br />Tech</div>
        <div style={{ position: 'absolute', bottom: 7, right: 7, width: 8, height: 8, borderRadius: '50%', background: powered ? C.brand : '#374151', boxShadow: powered ? `0 0 12px ${C.brand}` : 'none', transition: 'all .5s', zIndex: 2 }} className={powered ? 'pe-blip' : ''} />
      </div>
      <div style={{ width: 3, height: 12, background: wired ? '#C0BDB4' : '#374151', transition: 'background .5s' }} />
      <div style={{ width: 12, height: 8, borderRadius: 3, background: wired ? '#A09C96' : '#374151', transition: 'background .5s' }} />
    </div>
  );
}

function MiniRemote({ active, burst }) {
  const dpadIcons = ['ti-chevron-up', 'ti-chevron-left', 'ti-chevron-right', 'ti-chevron-down'];
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Burst on={burst} color={C.brandL} />
      <Rings on={burst} color={C.brandL} />
      <div style={{
        width: 54, height: 88, background: 'linear-gradient(160deg,#2A3544,#181F2B)', borderRadius: 14,
        boxShadow: active ? `0 0 0 2px ${C.brand},0 0 24px rgba(25,92,81,.45),0 8px 20px rgba(0,0,0,.55)` : '0 8px 20px rgba(0,0,0,.45)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 7px', gap: 5,
        transition: 'box-shadow .5s', position: 'relative', overflow: 'hidden',
      }}>
        {active && <div className="pe-scanline" />}
        <div style={{ width: 20, height: 3, background: '#374151', borderRadius: 2, marginBottom: 3 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {dpadIcons.map((icon, i) => (
            <div key={i} style={{
              width: 18, height: 18, borderRadius: 5,
              background: active && i === 2 ? `linear-gradient(135deg,${C.brand},${C.brandL})` : 'linear-gradient(135deg,#374151,#2D3748)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: active ? '#9CA3AF' : '#4B5563',
              boxShadow: active && i === 2 ? `0 0 8px rgba(25,92,81,.6)` : 'none', transition: 'all .4s',
            }}>
              <i className={`ti ${icon}`} style={{ fontSize: 9 }} aria-hidden="true" />
            </div>
          ))}
        </div>
        {active && <div style={{ fontSize: 6, color: C.brandL, marginTop: 2, letterSpacing: '.1em', fontWeight: 700 }}>PAIRED</div>}
      </div>
    </div>
  );
}

function MiniPhone({ online, open, onToggle, justOpened }) {
  return (
    <div style={{
      width: 70, height: 118, background: 'linear-gradient(160deg,#1C2535,#0F1520)', borderRadius: 16,
      boxShadow: online ? `0 0 0 2px ${C.brand},0 12px 36px rgba(25,92,81,.4),0 4px 14px rgba(0,0,0,.55)` : '0 8px 28px rgba(0,0,0,.55)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden',
      border: online ? 'none' : '2px solid #1F2937', transition: 'box-shadow .5s', position: 'relative',
    }}>
      <div style={{ width: 26, height: 5, background: '#0F1520', borderRadius: '0 0 8px 8px', marginTop: 4 }} />
      <div style={{
        width: '100%', flex: 1, background: online ? (open ? '#120808' : '#091410') : '#090D12',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 6, padding: '4px 6px 5px', transition: 'background .6s', position: 'relative', overflow: 'hidden',
      }}>
        {online && <div className="pe-scanline" />}
        {!online ? <div style={{ fontSize: 7, color: '#1F2937', textAlign: 'center', letterSpacing: '.08em', lineHeight: 1.5 }}>waiting<br />setup…</div>
          : <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.brand }} className="pe-blip" />
              <span style={{ fontSize: 6, color: C.brand, fontWeight: 700, letterSpacing: '.1em' }}>ONLINE</span>
            </div>
            <div style={{ fontSize: 5, color: '#374151', letterSpacing: '.08em', fontWeight: 600 }}>PRESENCE EYE</div>
            <div style={{ position: 'relative' }}>
              {!open && [0, .3, .6].map((d, i) => (
                <div key={i} style={{ position: 'absolute', top: '50%', left: '50%', width: 42, height: 42, borderRadius: '50%', border: `1.5px solid rgba(25,92,81,${.65 - i * .2})`, animation: `pe-ring 1.9s ease-out ${d}s infinite`, pointerEvents: 'none' }} />
              ))}
              <button onClick={onToggle} className={open ? 'pe-close-btn' : 'pe-open-btn'}
                style={{ width: 42, height: 42, borderRadius: '50%', background: open ? `linear-gradient(135deg,${C.danger},#B91C1C)` : `linear-gradient(135deg,${C.brand},${C.brandL})`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2, transition: 'background .4s' }}>
                <i className={`ti ${open ? 'ti-lock' : 'ti-lock-open'}`} style={{ fontSize: 18 }} aria-hidden="true" />
              </button>
            </div>
            <div style={{ fontSize: 6, color: open ? C.danger : C.brand, fontWeight: 700, letterSpacing: '.06em', transition: 'color .4s' }}>
              {open ? 'TAP TO CLOSE' : 'TAP TO OPEN'}
            </div>
          </>}
      </div>
      <div style={{ width: '100%', height: 12, background: '#090D12', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 20, height: 2.5, background: '#1F2937', borderRadius: 2 }} />
      </div>
      <Confetti on={justOpened} />
    </div>
  );
}

function MiniGate({ open, burst }) {
  return (
    <div style={{ position: 'relative', width: 100, height: 82, flexShrink: 0 }}>
      <Burst on={burst && open} color={C.gold} n={18} />
      <div style={{ position: 'absolute', left: 0, top: 0, width: 7, height: '100%', background: 'linear-gradient(180deg,#6B7280,#374151)', borderRadius: '4px 0 0 4px', zIndex: 2 }} />
      <div style={{ position: 'absolute', right: 0, top: 0, width: 7, height: '100%', background: 'linear-gradient(180deg,#6B7280,#374151)', borderRadius: '0 4px 4px 0', zIndex: 2 }} />
      <div style={{ position: 'absolute', inset: 0, border: '3px solid #4B5563', borderRadius: 5 }} />
      <div className={`pe-gate-l ${open ? 'pe-gate-open-l' : 'pe-gate-close-l'}`} style={{ position: 'absolute', left: 7, top: 3, width: 'calc(50% - 7px)', height: 'calc(100% - 6px)', background: open ? 'linear-gradient(180deg,rgba(25,92,81,.15),rgba(25,92,81,.05))' : 'repeating-linear-gradient(90deg,#374151 0,#374151 3px,#4B5563 3px,#4B5563 12px)', transition: 'background .5s' }} />
      <div className={`pe-gate-r ${open ? 'pe-gate-open-r' : 'pe-gate-close-r'}`} style={{ position: 'absolute', right: 7, top: 3, width: 'calc(50% - 7px)', height: 'calc(100% - 6px)', background: open ? 'linear-gradient(180deg,rgba(25,92,81,.15),rgba(25,92,81,.05))' : 'repeating-linear-gradient(90deg,#4B5563 0,#4B5563 3px,#374151 3px,#374151 12px)', transition: 'background .5s' }} />
      {open && <div style={{ position: 'absolute', inset: 3, borderRadius: 4, background: 'radial-gradient(ellipse,rgba(25,92,81,.2) 0%,transparent 70%)' }} className="pe-float" />}
      <div style={{ position: 'absolute', bottom: -20, left: '50%', transform: 'translateX(-50%)', fontSize: 9, color: open ? C.brand : '#6B7280', fontWeight: 700, whiteSpace: 'nowrap', letterSpacing: '.1em', transition: 'color .5s', display: 'flex', alignItems: 'center', gap: 3 }}>
        {open
          ? <><i className="ti ti-check" style={{ fontSize: 10 }} aria-hidden="true" /> OPEN</>
          : <><i className="ti ti-circle-dot" style={{ fontSize: 10 }} aria-hidden="true" /> CLOSED</>}
      </div>
    </div>
  );
}

function MiniPower({ on, burst }) {
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <Burst on={burst} color={C.gold} n={10} />
      <Rings on={burst} color={C.gold} />
      <div style={{ width: 42, height: 42, borderRadius: 12, background: on ? `linear-gradient(135deg,#B45309,${C.gold},#D97706)` : 'linear-gradient(135deg,#1F2937,#111827)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: on ? `0 0 0 2px ${C.gold},0 0 20px rgba(245,200,66,.45)` : '0 4px 12px rgba(0,0,0,.4)', border: on ? 'none' : '2px solid #374151', transition: 'all .6s', position: 'relative', overflow: 'hidden' }}>
        {on && <div className="pe-scanline" />}
        <i className={`ti ${on ? 'ti-bolt' : 'ti-plug'}`} style={{ fontSize: 20, color: on ? '#fff' : '#6B7280', position: 'relative', zIndex: 1 }} aria-hidden="true" />
      </div>
      <span style={{ fontSize: 7, color: on ? C.gold : '#4B5563', letterSpacing: '.1em', fontWeight: 600, textTransform: 'uppercase', transition: 'color .5s' }}>{on ? 'Powered' : 'Socket'}</span>
    </div>
  );
}

function ConnLine({ on, color = C.brand, delay = '0s' }) {
  return (
    <div style={{ flex: 1, height: 24, minWidth: 12, display: 'flex', alignItems: 'center' }}>
      <svg width="100%" height="24" style={{ overflow: 'visible' }}>
        <line x1="0" y1="12" x2="100%" y2="12" stroke={on ? color : '#1F2937'} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="200" strokeDashoffset={on ? 0 : 200} style={{ transition: `stroke-dashoffset .7s ease ${delay}, stroke .5s` }} />
        {on && <circle cx="100%" cy="12" r="4" fill={color} style={{ filter: `drop-shadow(0 0 5px ${color})` }}><animate attributeName="r" values="4;6;4" dur="1.5s" repeatCount="indefinite" /></circle>}
      </svg>
    </div>
  );
}

function Badge({ text }) {
  if (!text) return null;
  return (
    <div style={{ position: 'absolute', top: 14, right: 14, zIndex: 50, background: `linear-gradient(135deg,${C.brand},${C.brandL})`, borderRadius: 50, padding: '7px 16px', display: 'flex', alignItems: 'center', gap: 6, boxShadow: `0 4px 20px rgba(25,92,81,.55)`, animation: 'pe-fadeUp .4s ease forwards' }}>
      <i className="ti ti-check" style={{ fontSize: 13, color: '#fff' }} aria-hidden="true" />
      <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', letterSpacing: '.1em', textTransform: 'uppercase' }}>{text}</span>
    </div>
  );
}

// ── DEMO ──
const DEMO_STEPS = [
  { title: 'Mount & Connect', desc: 'Tap below to clip the Buttons device onto your physical gate remote. Watch them pair up.', action: 'Connect Device' },
  { title: 'Plug In Power', desc: 'Now connect the USB cable to a nearby wall socket. The device boots up instantly.', action: 'Plug In' },
  { title: 'Control from Your Phone', desc: 'Your phone is now live! Tap the glowing button on the phone screen to open the gate from anywhere.', action: null },
];

const DEMO_STEP_ICONS = ['ti-plug-connected', 'ti-plug', null];

function ButtonsDemo() {
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);
  const [b1, setB1] = useState(false);
  const [b2, setB2] = useState(false);
  const [bPow, setBPow] = useState(false);
  const [bGate, setBGate] = useState(false);
  const [justOpened, setJustOpened] = useState(false);
  const [badge, setBadge] = useState('');
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const f = () => setMobile(window.innerWidth < 680);
    f(); window.addEventListener('resize', f);
    return () => window.removeEventListener('resize', f);
  }, []);

  const burst = (fn) => { fn(true); setTimeout(() => fn(false), 900); };
  const flash = (t) => { setBadge(t); setTimeout(() => setBadge(''), 2600); };

  const act = () => {
    if (step === 0) { burst(setB1); burst(setB2); flash('Device Connected!'); setTimeout(() => setStep(1), 150); }
    else if (step === 1) { burst(setBPow); flash('Powered On!'); setTimeout(() => setStep(2), 150); }
  };
  const toggle = () => {
    if (step < 2) return;
    const opening = !open; setOpen(opening);
    if (opening) { burst(setBGate); setJustOpened(true); flash('Gate Opened!'); setTimeout(() => setJustOpened(false), 1400); }
    else { flash('Gate Closed'); }
  };

  return (
    <div style={{ background: `radial-gradient(ellipse at 20% 50%,rgba(25,92,81,.13) 0%,transparent 50%),radial-gradient(ellipse at 80% 50%,rgba(25,92,81,.08) 0%,transparent 50%),linear-gradient(160deg,#060B0F,#0C1520 50%,#060B0F)`, borderRadius: 24, padding: mobile ? '24px 16px 32px' : '32px 32px 40px', position: 'relative', overflow: 'hidden', border: '1px solid rgba(25,92,81,.22)', boxShadow: '0 24px 80px rgba(0,0,0,.55)' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: .035, backgroundImage: 'linear-gradient(rgba(25,92,81,1) 1px,transparent 1px),linear-gradient(90deg,rgba(25,92,81,1) 1px,transparent 1px)', backgroundSize: '30px 30px', pointerEvents: 'none' }} />
      <Badge text={badge} />
      <div style={{ position: 'relative', zIndex: 3, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: C.brand, letterSpacing: '.2em', textTransform: 'uppercase' }}>Interactive Setup</span>
          <div style={{ display: 'flex', gap: 5 }}>
            {DEMO_STEPS.map((_, i) => (
              <div key={i} style={{ width: i === step ? 24 : 7, height: 7, borderRadius: 4, background: i < step ? C.brand : i === step ? C.brandL : '#1F2937', boxShadow: i === step ? `0 0 8px ${C.brand}` : 'none', transition: 'all .5s cubic-bezier(.4,0,.2,1)' }} />
            ))}
          </div>
        </div>
        <div style={{ height: 3, background: '#0F1821', borderRadius: 2, marginBottom: 14, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 2, background: `linear-gradient(90deg,${C.brand},${C.brandL})`, width: `${step === 0 ? 0 : step === 1 ? 50 : 100}%`, transition: 'width .7s cubic-bezier(.4,0,.2,1)' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, background: `linear-gradient(135deg,${C.brand},${C.brandL})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff', fontFamily: 'Syne,sans-serif', boxShadow: `0 4px 14px rgba(25,92,81,.4)` }}>{step + 1}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 3, fontFamily: 'Syne,sans-serif' }}>{DEMO_STEPS[step].title}</div>
            <p key={step} className="pe-step-in" style={{ fontSize: 12, color: '#9CA3AF', lineHeight: 1.6, margin: 0 }}>{DEMO_STEPS[step].desc}</p>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: mobile ? 3 : 7, flexWrap: mobile ? 'wrap' : 'nowrap', position: 'relative', zIndex: 2, padding: mobile ? '0 0 24px' : '6px 0 32px', rowGap: mobile ? 24 : 7 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
          <MiniDevice wired={step >= 1} powered={step >= 2} burst={b1} />
          <span style={{ fontSize: 8, color: '#4B5563', letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 600 }}>Device</span>
        </div>
        <ConnLine on={step >= 1} color={C.brand} delay=".1s" />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
          <MiniRemote active={step >= 1} burst={b2} />
          <span style={{ fontSize: 8, color: '#4B5563', letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 600 }}>Remote</span>
        </div>
        <ConnLine on={step >= 2} color={C.gold} delay=".2s" />
        <MiniPower on={step >= 2} burst={bPow} />
        {mobile && <div style={{ width: '100%', height: 0 }} />}
        <ConnLine on={step >= 2} color={C.brandL} delay=".3s" />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
          <MiniPhone online={step >= 2} open={open} onToggle={toggle} justOpened={justOpened} />
          <span style={{ fontSize: 8, color: '#4B5563', letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 600 }}>Your Phone</span>
        </div>
        <ConnLine on={open} color={C.brand} delay="0s" />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
          <MiniGate open={open} burst={bGate} />
          <span style={{ fontSize: 8, color: '#4B5563', letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 600, marginTop: 20 }}>Gate</span>
        </div>
      </div>
      <div style={{ position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        {DEMO_STEPS[step].action && (
          <button onClick={act} className="pe-open-btn" style={{ padding: '14px 36px', background: `linear-gradient(135deg,${C.brand},${C.brandL})`, color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', borderRadius: 50, display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className={`ti ${DEMO_STEP_ICONS[step]}`} style={{ fontSize: 16 }} aria-hidden="true" />
            {DEMO_STEPS[step].action}
          </button>
        )}
        {step === 2 && (
          <p className="pe-bounce" style={{ fontSize: 10, color: C.brand, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', textAlign: 'center', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
            <i className="ti ti-hand-click" style={{ fontSize: 14 }} aria-hidden="true" />
            Tap the glowing button on the phone!
          </p>
        )}
        {step > 0 && (
          <button onClick={() => { setStep(0); setOpen(false); setBadge(''); }} style={{ background: 'transparent', border: '1px solid #1F2937', borderRadius: 50, padding: '7px 20px', color: '#4B5563', fontSize: 10, fontWeight: 600, cursor: 'pointer', letterSpacing: '.08em', textTransform: 'uppercase', fontFamily: 'DM Sans,sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className="ti ti-refresh" style={{ fontSize: 12 }} aria-hidden="true" />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

// ── PRODUCT DATA ──
const PRODUCTS = [
  {
    id: 'buttons',
    name: 'Digital Buttons',
    tagline: 'Your Remote, Reimagined',
    icon: 'ti-click',
    status: 'available',
    color: C.brand,
    colorL: C.brandL,
    image: 'https://res.cloudinary.com/ddsojj7zo/image/upload/v1778154648/WhatsApp_Image_2026-05-07_at_1.49.50_PM2_gzzhhp.jpg',
    shortDesc: 'Clips onto any physical remote to add Wi-Fi control. Open gates, ACs, window shutters — from anywhere.',
    useCases: ['Gate remotes', 'Window shutters', 'Air conditioners', 'Any pressable device'],
    specs: ['Wi-Fi 2.4GHz', 'App controlled', 'Multi-user sharing', 'No modification'],
    hasDemo: true,
  },
  {
    id: 'switch',
    name: 'Digital Switch',
    tagline: 'Smart Switching, Zero Rewiring',
    icon: 'ti-toggle-right',
    status: 'available',
    color: '#7C3AED',
    colorL: '#9F67FA',
    image: 'https://res.cloudinary.com/ddsojj7zo/image/upload/v1778212891/1000036252_f5qrwi.png',
    shortDesc: 'Replaces or augments your wall switch. Designed for lights and other fixed installations — smart control without replacing fixtures.',
    useCases: ['Lighting control', 'Fans', 'Fixed appliances', 'Office systems'],
    specs: ['In-wall install', 'App controlled', 'Schedule timers', 'Multi-user'],
    hasDemo: false,
  },
  {
    id: 'socket-lite',
    name: 'Digital Socket Lite',
    tagline: 'Plug In. Take Control.',
    icon: 'ti-plug',
    status: 'available',
    color: '#0369A1',
    colorL: '#0EA5E9',
    image: 'https://res.cloudinary.com/ddsojj7zo/image/upload/v1778212446/Gemini_Generated_Image_x7w8ovx7w8ovx7w8_nacqdt.png',
    shortDesc: 'Plug any appliance in and control it via app. Set timers, create schedules — no installation required.',
    useCases: ['Lamps', 'Small appliances', 'Phone chargers', 'TVs'],
    specs: ['Plug & play', 'App control', 'Timers', 'Schedules'],
    tier: 'lite',
    hasDemo: false,
  },
  {
    id: 'socket-max',
    name: 'Digital Socket Max',
    tagline: 'Smarter Power, Safer Appliances',
    icon: 'ti-bolt',
    status: 'available',
    color: '#B45309',
    colorL: '#F59E0B',
    image: 'https://res.cloudinary.com/ddsojj7zo/image/upload/v1778154065/ChatGPT_Image_May_7_2026_01_19_39_PM_svgfgu.png',
    shortDesc: 'All Lite features plus manual override when internet is down — critical for heaters, pumps and essential appliances.',
    useCases: ['Water heaters', 'Water pumps', 'Fridges', 'Critical appliances'],
    specs: ['Plug & play', 'App control', 'Timers', 'Schedules', 'Manual override'],
    tier: 'max',
    hasDemo: false,
  },
];

const COMING_SOON = [
  {
    name: 'Digital Socket Pro',
    icon: 'ti-cpu',
    desc: 'All Max features plus conditional automation via built-in sensors. Temperature-based triggers for water heaters, pumps, and more.',
    detail: 'Perfect for water heaters, industrial pumps, and any appliance that should react to its environment.',
    color: '#059669',
    tags: ['Temp sensor', 'Conditional logic', 'Auto-triggers', 'Plug & play'],
  },
  {
    name: 'Digital Meter',
    icon: 'ti-chart-bar',
    desc: 'Real-time power consumption monitoring across up to 4 electrical phases. Know exactly what is drawing power and when.',
    detail: 'Ideal for offices, apartment complexes, and landlords who need live energy data without guessing.',
    color: '#DC2626',
    tags: ['4-phase support', 'Live readings', 'Usage history', 'App dashboard'],
  },
];

const SOCKET_TIERS = [
  { name: 'Lite', color: '#0369A1', icon: 'ti-plug', features: ['Remote control', 'Timers', 'Schedules'], missing: ['Manual override', 'Sensor triggers'] },
  { name: 'Max', color: '#B45309', icon: 'ti-bolt', features: ['Remote control', 'Timers', 'Schedules', 'Manual override (no internet)'], missing: ['Sensor triggers'] },
  { name: 'Pro', color: '#059669', icon: 'ti-cpu', features: ['Remote control', 'Timers', 'Schedules', 'Manual override', 'Sensor-based conditions'], missing: [], comingSoon: true },
];

// ── TICKER STRIP ──
function Ticker() {
  const items = ['Digital Buttons', '·', 'Digital Switch', '·', 'Socket Lite', '·', 'Socket Max', '·', 'Socket Pro', '·', 'Digital Meter', '·', 'More coming soon', '·'];
  const doubled = [...items, ...items];
  return (
    <div className="pe-ticker-wrap" style={{ background: C.brand, padding: '10px 0', overflow: 'hidden' }}>
      <div className="pe-ticker-inner">
        {doubled.map((item, i) => (
          <span key={i} style={{ fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '.15em', textTransform: 'uppercase', padding: '0 20px', opacity: item === '·' ? .4 : 1 }}>{item}</span>
        ))}
      </div>
    </div>
  );
}

// ── PRODUCT DETAIL MODAL ──
function ProductModal({ product, onClose }) {
  if (!product) return null;
  const p = PRODUCTS.find(p => p.id === product);
  if (!p) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(6,11,15,.85)', backdropFilter: 'blur(12px)' }} />
      <div onClick={e => e.stopPropagation()} style={{ position: 'relative', width: '100%', maxWidth: 740, background: C.dark, borderRadius: 32, overflow: 'hidden', border: `1px solid ${p.color}33`, boxShadow: `0 40px 120px rgba(0,0,0,.7), 0 0 0 1px ${p.color}22`, animation: 'pe-fadeUp .35s ease forwards', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ height: 5, background: `linear-gradient(90deg,${p.color},${p.colorL})` }} />
        <div style={{ padding: '32px 32px 40px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: `${p.color}20`, border: `1px solid ${p.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className={`ti ${p.icon}`} style={{ fontSize: 26, color: p.color }} aria-hidden="true" />
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: p.color, letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 3 }}>{p.tagline}</div>
                <h3 style={{ fontSize: 24, fontWeight: 800, color: '#fff', fontFamily: 'Syne,sans-serif', lineHeight: 1.1 }}>{p.name}</h3>
              </div>
            </div>
            <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: '#9CA3AF', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className="ti ti-x" style={{ fontSize: 16 }} aria-hidden="true" />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 20, marginBottom: 28 }}>
            <div>
              <img src={p.image} alt={p.name} style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 18, border: `1px solid ${p.color}22` }} />
            </div>
            <div>
              <p style={{ fontSize: 14, color: '#9CA3AF', lineHeight: 1.75, marginBottom: 20 }}>{p.shortDesc}</p>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: p.color, letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: 10 }}>Use Cases</div>
                {p.useCases.map((u, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: '#D1D5DB' }}>{u}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {p.specs.map(s => (
                  <span key={s} style={{ padding: '4px 12px', borderRadius: 50, background: `${p.color}18`, color: p.color, fontSize: 11, fontWeight: 700, border: `1px solid ${p.color}30` }}>{s}</span>
                ))}
              </div>
            </div>
          </div>

          {p.hasDemo && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: p.color, letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 14 }}>Try It — Interactive Demo</div>
              <ButtonsDemo />
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a href={PLAY_STORE} target="_blank" rel="noopener" className="pe-cta" style={{ fontSize: 12, padding: '12px 28px' }}>
              <i className="ti ti-brand-google-play" style={{ fontSize: 15 }} aria-hidden="true" />
              Download on Google Play
            </a>
            <a href={APPLE_STORE} target="_blank" rel="noopener" style={{ padding: '12px 28px', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 50, color: '#fff', fontSize: 12, fontWeight: 700, fontFamily: 'Syne,sans-serif', letterSpacing: '.06em', textTransform: 'uppercase', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <i className="ti ti-brand-apple" style={{ fontSize: 15 }} aria-hidden="true" />
              Download on Apple Store
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SOCKET TIER COMPARISON ──
function SocketTiers() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
      {SOCKET_TIERS.map((tier, ti) => (
        <div key={ti} style={{ background: tier.comingSoon ? 'rgba(5,150,105,.04)' : 'rgba(25,92,81,.04)', border: `1px solid ${tier.color}30`, borderRadius: 20, padding: '24px 20px', position: 'relative', overflow: 'hidden' }}>
          {tier.comingSoon && (
            <div style={{ position: 'absolute', top: 12, right: 12, background: tier.color, borderRadius: 50, padding: '3px 10px', fontSize: 9, fontWeight: 700, color: '#fff', letterSpacing: '.1em', textTransform: 'uppercase' }}>Soon</div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${tier.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className={`ti ${tier.icon}`} style={{ fontSize: 18, color: tier.color }} aria-hidden="true" />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: tier.color, letterSpacing: '.15em', textTransform: 'uppercase' }}>Socket</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.ink, fontFamily: 'Syne,sans-serif' }}>{tier.name}</div>
            </div>
          </div>
          {tier.features.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <i className="ti ti-check" style={{ fontSize: 12, color: tier.color }} aria-hidden="true" />
              <span style={{ fontSize: 12, color: C.ink, fontWeight: 500 }}>{f}</span>
            </div>
          ))}
          {tier.missing.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, opacity: .35 }}>
              <i className="ti ti-x" style={{ fontSize: 12, color: C.muted }} aria-hidden="true" />
              <span style={{ fontSize: 12, color: C.muted }}>{f}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── MAIN COMPONENT ──
export default function PresenceEye() {
  const [modalProduct, setModalProduct] = useState(null);

  useEffect(() => {
    const id = 'pe-styles';
    if (!document.getElementById(id)) {
      const s = document.createElement('style');
      s.id = id; s.textContent = CSS;
      document.head.appendChild(s);
    }
  }, []);

  return (
    <div className="pe" style={{ background: C.white, color: C.ink }}>

      {/* ══ HERO ══ */}
      <section style={{
        minHeight: '95vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(80px,10vw,120px) clamp(20px,5vw,60px) 60px', position: 'relative', overflow: 'hidden',
      }}>
        {[200, 360, 520, 700].map((s, i) => (
          <div key={i} style={{ position: 'absolute', top: '50%', left: '50%', width: s, height: s, borderRadius: '50%', border: `1px solid rgba(25,92,81,${.12 - i * .025})`, transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
        ))}
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 2, maxWidth: 860 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(25,92,81,.1)', border: '1px solid rgba(25,92,81,.3)', borderRadius: 50, padding: '8px 22px', marginBottom: 32 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.brand }} className="pe-blip" />
            <span style={{ fontSize: 11, fontWeight: 700, color: C.brand, letterSpacing: '.2em', textTransform: 'uppercase' }}>Smart Home Ecosystem · BYOSE Tech</span>
          </div>

          <h1 style={{ fontSize: 'clamp(3rem,10vw,7.5rem)', lineHeight: .92, color: '#fff', marginBottom: 12, letterSpacing: '-.03em', fontWeight: 800 }}>
            <span style={{ background: `linear-gradient(90deg,${C.brand} 20%,${C.brandL} 40%,#4EB8A6 60%,${C.brand} 80%)`, backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', animation: 'pe-shimmer 3s linear infinite' }}>Presence Eye</span>
            <span style={{ color: C.brand }}>.</span>
          </h1>

          <p style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(1rem,2.5vw,1.4rem)', color: '#9C99AA', fontWeight: 600, marginBottom: 24, letterSpacing: '-.01em' }}>
            Every device in your home, connected. One app. Total control.
          </p>

          <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 18, padding: '18px 28px', maxWidth: 640, margin: '0 auto 40px', backdropFilter: 'blur(12px)' }}>
            <p style={{ fontSize: 'clamp(13px,2vw,15px)', color: '#6B7280', lineHeight: 1.8, margin: 0 }}>
              Presence Eye is BYOSE Tech&#39;s smart home platform — a growing family of devices that bring <span style={{ color: '#000', fontWeight: 700 }}>Wi-Fi intelligence</span> to gates, lights, sockets, and appliances you already own. <span style={{ color: '#000', fontWeight: 700 }}>No rewiring. No replacing. Just control.</span>
            </p>
          </div>

          {/* Product count bubbles */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 36 }}>
            {[
              { label: 'Products', value: '4', sub: 'Available now' },
              { label: 'Coming Soon', value: '2+', sub: 'In development' },
              { label: 'App', value: '1', sub: 'iOS & Android' },
            ].map((stat, i) => (
              <div key={i} style={{ background: 'rgba(25,92,81,.1)', border: '1px solid rgba(25,92,81,.25)', borderRadius: 16, padding: '14px 22px', textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#195c51', fontFamily: 'Syne,sans-serif', lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: 10, color: C.brand, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', marginTop: 4 }}>{stat.label}</div>
                <div style={{ fontSize: 10, color: '#374151', marginTop: 2 }}>{stat.sub}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
            <a href="#products" className="pe-cta">
              <i className="ti ti-layout-grid" style={{ fontSize: 15 }} aria-hidden="true" />
              Explore All Products
            </a>
          </div>
        </div>
      </section>

      {/* ══ TICKER ══ */}
      {/*<Ticker />*/}

      {/* ══ PRODUCT ECOSYSTEM GRID ══ */}
      <section id="products" style={{ padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,60px)', background: C.dark }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.brand, letterSpacing: '.2em', textTransform: 'uppercase' }}>The Family</span>
            <h2 style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', margin: '12px 0 16px', color: '#fff', lineHeight: 1.05, letterSpacing: '-.02em' }}>
              Every product, one ecosystem.
            </h2>
            <p style={{ fontSize: 'clamp(14px,2vw,17px)', color: '#6B7280', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
              Whether it plugs in, clips on, or installs — all devices talk to the same app. One interface for your whole home.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,280px),1fr))', gap: 18 }}>
            {PRODUCTS.map((p, i) => (
              <div key={p.id} className="pe-product-card" onClick={() => setModalProduct(p.id)}
                style={{ background: 'linear-gradient(160deg,#0C1520,#060B0F)', border: `1px solid ${p.color}25`, borderRadius: 24, overflow: 'hidden', boxShadow: `0 8px 32px rgba(0,0,0,.4)`, animationDelay: `${i * .07}s` }}>
                <div style={{ height: 4, background: `linear-gradient(90deg,${p.color},${p.colorL})` }} />
                <div style={{ height: 180, overflow: 'hidden', position: 'relative' }}>
                  <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .5s', display: 'block' }}
                    onMouseOver={e => e.target.style.transform = 'scale(1.06)'}
                    onMouseOut={e => e.target.style.transform = 'scale(1)'} />
                  <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top,${C.dark} 0%,transparent 55%)` }} />
                  <div style={{ position: 'absolute', top: 12, left: 12, background: `${p.color}22`, border: `1px solid ${p.color}40`, borderRadius: 50, padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: p.color }} className="pe-blip" />
                    <span style={{ fontSize: 9, fontWeight: 700, color: p.color, letterSpacing: '.12em', textTransform: 'uppercase' }}>Available</span>
                  </div>
                </div>
                <div style={{ padding: '20px 20px 24px' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: p.color, letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: 6 }}>{p.tagline}</div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', fontFamily: 'Syne,sans-serif', marginBottom: 10, lineHeight: 1.15 }}>{p.name}</h3>
                  <p style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.7, marginBottom: 16 }}>{p.shortDesc}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 16 }}>
                    {p.specs.slice(0, 3).map(s => (
                      <span key={s} style={{ padding: '3px 10px', borderRadius: 50, background: `${p.color}15`, color: p.color, fontSize: 10, fontWeight: 700, border: `1px solid ${p.color}25` }}>{s}</span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4EB8A6', fontSize: 11, fontWeight: 700, letterSpacing: '.08em' }}>
                    <span>View details</span>
                    <i className="ti ti-arrow-right" style={{ fontSize: 14 }} aria-hidden="true" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BUTTONS DEEP DIVE ══ */}
      <section style={{ padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,60px)', background: C.surface }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,440px),1fr))', gap: 60, alignItems: 'center', marginBottom: 64 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `${C.brand}15`, border: `1px solid ${C.brand}30`, borderRadius: 50, padding: '6px 16px', marginBottom: 20 }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: C.brand, letterSpacing: '.15em', textTransform: 'uppercase' }}>Spotlight — Digital Buttons</span>
              </div>
              <h2 style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', margin: '0 0 20px', color: C.ink, lineHeight: 1.1, letterSpacing: '-.02em' }}>Turn any remote into a smart remote.</h2>
              <p style={{ color: C.muted, lineHeight: 1.8, fontSize: 15, marginBottom: 16 }}>
                Got a gate that only opens when you're standing 10 metres away? An AC you have to walk across the room to change? A window shutter with a physical button on the wall?
              </p>
              <p style={{ color: C.muted, lineHeight: 1.8, fontSize: 15, marginBottom: 24 }}>
                Buttons clips directly onto that remote or button and connects it to your home Wi-Fi. Instantly, your phone becomes the remote — and you can share it with anyone.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {['Gate openers', 'Window shutters', 'Air conditioners', 'Garage doors', 'Barrier arms', 'Intercom systems'].map((u, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.brand, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: C.ink, fontWeight: 500 }}>{u}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.brand, letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 16 }}>Try the interactive demo</div>
              <ButtonsDemo />
            </div>
          </div>
        </div>
      </section>

      {/* ══ SWITCH SECTION ══ */}
      <section style={{ padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,60px)', background: C.white }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,440px),1fr))', gap: 60, alignItems: 'center' }}>
            <div style={{ order: 2 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(124,58,237,.1)', border: '1px solid rgba(124,58,237,.25)', borderRadius: 50, padding: '6px 16px', marginBottom: 20 }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: '#7C3AED', letterSpacing: '.15em', textTransform: 'uppercase' }}>Spotlight — Digital Switch</span>
              </div>
              <h2 style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', margin: '0 0 20px', color: C.ink, lineHeight: 1.1, letterSpacing: '-.02em' }}>Your wall switch, now a smart switch.</h2>
              <p style={{ color: C.muted, lineHeight: 1.8, fontSize: 15, marginBottom: 16 }}>
                Designed for lights, fans, and fixed appliances that are wired into your walls. The Digital Switch replaces or works alongside your existing switch — no electrician needed for most installations.
              </p>
              <p style={{ color: C.muted, lineHeight: 1.8, fontSize: 15, marginBottom: 24 }}>
                Set schedules, control remotely, and share access with everyone in the household. Perfect for offices, apartments, and homes that want smart lighting without ripping out their wiring.
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['App controlled', 'Schedule timers', 'Multi-user', 'In-wall install'].map(t => (
                  <span key={t} style={{ padding: '7px 15px', borderRadius: 50, background: 'rgba(124,58,237,.1)', color: '#7C3AED', fontSize: 12, fontWeight: 700, letterSpacing: '.05em', border: '1px solid rgba(124,58,237,.2)' }}>{t}</span>
                ))}
              </div>
            </div>
            <div style={{ order: 1, display: 'flex', justifyContent: 'center' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', inset: -40, background: 'radial-gradient(ellipse,rgba(124,58,237,.1) 0%,transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
                <div className="pe-float" style={{ width: 280, height: 280, background: 'linear-gradient(145deg,#F0EDE6,#E5E0D6)', borderRadius: 36, boxShadow: '0 32px 80px rgba(0,0,0,.14),inset 0 2px 0 rgba(255,255,255,.8)', overflow: 'hidden', position: 'relative' }}>
                  <img src="https://res.cloudinary.com/ddsojj7zo/image/upload/v1778212891/1000036252_f5qrwi.png" alt="Digital Switch" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 36 }} />
                  <div style={{ position: 'absolute', bottom: 20, right: 20, width: 11, height: 11, borderRadius: '50%', background: '#7C3AED', boxShadow: '0 0 14px #7C3AED' }} className="pe-blip" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ SOCKET SECTION ══ */}
      <section style={{ padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,60px)', background: C.surface }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#0369A1', letterSpacing: '.2em', textTransform: 'uppercase' }}>Spotlight — Digital Sockets</span>
            <h2 style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', margin: '12px 0 16px', color: C.ink, lineHeight: 1.05, letterSpacing: '-.02em' }}>
              Plug in. Never think about it again.
            </h2>
            <p style={{ fontSize: 'clamp(14px,2vw,17px)', color: C.muted, maxWidth: 580, margin: '0 auto', lineHeight: 1.7 }}>
              No installation. Plug any appliance into a Digital Socket and take full control — timers, schedules, remote on/off. Pick the tier that fits your needs.
            </p>
          </div>

          <SocketTiers />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,420px),1fr))', gap: 24, marginTop: 40 }}>
            {[
              {
                img: 'https://res.cloudinary.com/ddsojj7zo/image/upload/v1778212446/Gemini_Generated_Image_x7w8ovx7w8ovx7w8_nacqdt.png',
                name: 'Socket Lite', color: '#0369A1', colorL: '#0EA5E9',
                icon: 'ti-plug', tier: 'Lite',
                usecases: ['Lamps and lighting', 'TV and entertainment', 'Phone & laptop charging', 'Small kitchen appliances'],
                desc: "Perfect for everyday household appliances. Plug in, open the app, and you're in control."
              },
              {
                img: 'https://res.cloudinary.com/ddsojj7zo/image/upload/v1778154065/ChatGPT_Image_May_7_2026_01_19_39_PM_svgfgu.png',
                name: 'Socket Max', color: '#B45309', colorL: '#F59E0B',
                icon: 'ti-bolt', tier: 'Max',
                usecases: ['Water heaters', 'Water pumps', 'Industrial fans', 'Refrigerators'],
                desc: 'For critical appliances that need to keep running — even without internet. Manual override is always there.'
              }
            ].map((s, i) => (
              <div key={i} style={{ background: C.white, borderRadius: 24, overflow: 'hidden', border: `1px solid ${s.color}20`, boxShadow: '0 8px 32px rgba(0,0,0,.06)' }}>
                <div style={{ height: 4, background: `linear-gradient(90deg,${s.color},${s.colorL})` }} />
                <div style={{ height: 160, overflow: 'hidden' }}>
                  <img src={s.img} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '20px 22px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className={`ti ${s.icon}`} style={{ fontSize: 18, color: s.color }} aria-hidden="true" />
                    </div>
                    <div>
                      <div style={{ fontSize: 9, color: s.color, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase' }}>Socket {s.tier}</div>
                      <h3 style={{ fontSize: 18, fontWeight: 800, color: C.ink, fontFamily: 'Syne,sans-serif', lineHeight: 1.1 }}>{s.name}</h3>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, marginBottom: 14 }}>{s.desc}</p>
                  <div style={{ fontSize: 10, fontWeight: 700, color: s.color, letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: 10 }}>Common use cases</div>
                  {s.usecases.map((u, ui) => (
                    <div key={ui} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: C.ink }}>{u}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ COMING SOON ══ */}
      <section style={{ padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,60px)', background: C.dark }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(245,200,66,.1)', border: '1px solid rgba(245,200,66,.25)', borderRadius: 50, padding: '8px 22px', marginBottom: 20 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.gold }} className="pe-blip" />
              <span style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: '.2em', textTransform: 'uppercase' }}>In Development</span>
            </div>
            <h2 style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', margin: '0 0 16px', color: '#fff', letterSpacing: '-.02em' }}>What's coming next.</h2>
            <p style={{ color: '#6B7280', fontSize: 16, maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
              The Presence Eye ecosystem keeps growing. Here's a glimpse at what we're building.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,400px),1fr))', gap: 20 }}>
            {COMING_SOON.map((item, i) => (
              <div key={i} style={{ background: 'linear-gradient(160deg,#0C1520,#060B0F)', border: `1px solid ${item.color}25`, borderRadius: 24, padding: '32px 28px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${item.color},transparent)` }} />
                <div style={{ position: 'absolute', top: -60, right: -60, width: 180, height: 180, borderRadius: '50%', background: `${item.color}08`, pointerEvents: 'none' }} />
                <div style={{ display: 'inline-flex', background: `${item.color}15`, border: `1px solid ${item.color}30`, borderRadius: 50, padding: '4px 14px', marginBottom: 20 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: item.color, letterSpacing: '.15em', textTransform: 'uppercase' }}>Coming Soon</span>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <i className={`ti ${item.icon}`} style={{ fontSize: 36, color: item.color }} aria-hidden="true" />
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: '#fff', fontFamily: 'Syne,sans-serif', marginBottom: 12, lineHeight: 1.15 }}>{item.name}</h3>
                <p style={{ fontSize: 14, color: '#9CA3AF', lineHeight: 1.75, marginBottom: 16 }}>{item.desc}</p>
                <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.7, marginBottom: 20 }}>{item.detail}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {item.tags.map(t => (
                    <span key={t} style={{ padding: '4px 12px', borderRadius: 50, background: `${item.color}15`, color: item.color, fontSize: 11, fontWeight: 700, border: `1px solid ${item.color}25` }}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 48, padding: '32px', background: 'rgba(25,92,81,.06)', border: '1px solid rgba(25,92,81,.18)', borderRadius: 20 }}>
            <i className="ti ti-telescope" style={{ fontSize: 28, color: C.brand, marginBottom: 12, display: 'block' }} aria-hidden="true" />
            <p style={{ fontSize: 15, color: '#9CA3AF', lineHeight: 1.7, maxWidth: 480, margin: '0 auto 6px' }}>More IoT devices are on the roadmap. The Presence Eye ecosystem is built to grow — every device speaks the same language, managed from a single app.</p>
            <p style={{ fontSize: 12, color: '#374151', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase' }}>More announcements coming soon</p>
          </div>
        </div>
      </section>

      {/* ══ INSTALLATION ══ */}
      <section style={{ padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,60px)', background: C.white }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.brand, letterSpacing: '.2em', textTransform: 'uppercase' }}>How It Works</span>
            <h2 style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', margin: '12px 0 16px', color: C.ink, letterSpacing: '-.02em' }}>We come to you.</h2>
            <p style={{ fontSize: 16, color: C.muted, maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>A BYOSE Tech technician handles everything. You don't need any technical knowledge — just tell us where and when.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,260px),1fr))', gap: 16 }}>
            {[
              { n: '01', icon: 'ti-car', title: 'We Visit You', body: 'A BYOSE Tech technician comes to your home, apartment, or workplace at your convenience.' },
              { n: '02', icon: 'ti-click', title: 'Device Mounted', body: 'We clip or install the Buttons, Switch, or Socket onto your existing setup. No drilling required.' },
              { n: '03', icon: 'ti-wifi', title: 'Wi-Fi Connected', body: 'We connect the device to your home Wi-Fi and ensure everything is online and stable.' },
              { n: '04', icon: 'ti-device-mobile-check', title: "You're In Control", body: "App paired, access shared, full walkthrough given. We hand it over and you're done." },
            ].map((s, i) => (
              <div key={i} className="pe-feat" style={{ background: C.surface, borderRadius: 20, padding: '28px 22px', borderTop: `3px solid ${C.brand}`, boxShadow: '0 4px 20px rgba(0,0,0,.04)' }}>
                <i className={`ti ${s.icon}`} style={{ fontSize: 28, color: C.brand, marginBottom: 12, display: 'block' }} aria-hidden="true" />
                <div style={{ fontSize: 11, fontWeight: 700, color: C.brand, letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: 8 }}>Step {s.n}</div>
                <h3 style={{ fontSize: 16, margin: '0 0 10px', color: C.ink, fontWeight: 700 }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.75, margin: 0 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section style={{ margin: '40px 16px 60px', background: C.dark, borderRadius: 36, padding: 'clamp(60px,8vw,100px) 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% -10%,rgba(25,92,81,.35) 0%,transparent 55%)`, pointerEvents: 'none' }} />
        {[160, 280, 420].map((s, i) => (
          <div key={i} style={{ position: 'absolute', top: 0, left: '50%', width: s, height: s, borderRadius: '50%', border: `1px solid rgba(25,92,81,${.14 - i * .04})`, transform: 'translate(-50%,-60%)', pointerEvents: 'none' }} />
        ))}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.brand, letterSpacing: '.2em', textTransform: 'uppercase' }}>Get Started</span>
          <h2 style={{ fontSize: 'clamp(2.2rem,6vw,5rem)', color: '#fff', margin: '16px 0 8px', lineHeight: 1.05, letterSpacing: '-.03em', fontWeight: 800 }}>
            Your home,<br />
            <span style={{ background: `linear-gradient(90deg,${C.brand} 20%,${C.brandL} 40%,#4EB8A6 60%,${C.brand} 80%)`, backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', animation: 'pe-shimmer 3s linear infinite' }}>finally smart.</span>
          </h2>
          <p style={{ color: '#4B5563', fontSize: 16, marginBottom: 40, maxWidth: 420, margin: '0 auto 40px' }}>
            Join the first households going fully digital with BYOSE Tech.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
            <a href="/contact" className="pe-cta" style={{ textDecoration: 'none' }}>
              <i className="ti ti-message" style={{ fontSize: 15 }} aria-hidden="true" />
              Contact Us — Get Started
            </a>
            <a href={PLAY_STORE} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 50, padding: '14px 24px', textDecoration: 'none', transition: 'all .3s' }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(25,92,81,.15)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,.05)'}>
              <i className="ti ti-brand-google-play" style={{ fontSize: 15, color: '#fff' }} aria-hidden="true" />
              <span style={{ fontSize: 13, color: '#fff', fontWeight: 700, letterSpacing: '.04em' }}>Google Play</span>
            </a>
            <a href={APPLE_STORE} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 50, padding: '14px 24px', textDecoration: 'none', transition: 'all .3s' }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(25,92,81,.15)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,.05)'}>
              <i className="ti ti-brand-apple" style={{ fontSize: 15, color: '#fff' }} aria-hidden="true" />
              <span style={{ fontSize: 13, color: '#fff', fontWeight: 700, letterSpacing: '.04em' }}>Apple Store</span>
            </a>
          </div>
        </div>
      </section>

      {/* ══ PRODUCT MODAL ══ */}
      {modalProduct && <ProductModal product={modalProduct} onClose={() => setModalProduct(null)} />}
    </div>
  );
}
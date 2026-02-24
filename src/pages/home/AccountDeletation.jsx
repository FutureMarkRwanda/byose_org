import { useState } from 'react';
import emailjs from '@emailjs/browser';
import { publicKey, viteemailserviceid, viteemailtemplate } from "../../utils/variable.js";

// ─── Icons ───────────────────────────────────────────────────────────────────
const Icon = {
  deactivate: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M18.36 6.64A9 9 0 1 1 5.64 17.36" /><line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ),
  reactivate: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  ),
  delete: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  ),
  export: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  alert: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  chevron: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
    </svg>
  ),
};

// ─── Request type config ──────────────────────────────────────────────────────
const TYPES = {
  deactivate: {
    id: 'deactivate',
    label: 'Deactivate Account',
    badge: 'Temporary · 3 days',
    badgeStyle: { background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' },
    iconStyle: { background: '#FFFBEB', color: '#D97706', border: '1.5px solid #FCD34D' },
    accentColor: '#D97706',
    leftBorderColor: '#F59E0B',
    cardBg: '#FFFDF5',
    cardBorder: '#FDE68A',
    description: 'Temporarily suspend your account. Your data stays safe and you can reactivate any time.',
    consequences: [
      'Access to all Presence Eye devices is suspended',
      'All your data is fully preserved during suspension',
      'Reactivation takes up to 3 days to process',
      'You\'ll receive a secure email link to confirm the action',
    ],
    reasons: ['Taking a break', 'Privacy concerns', 'Security concern', 'Switching service', 'Other'],
    btnClass: 'bg-amber-500 hover:bg-amber-600 text-white',
    btnLabel: 'Submit Deactivation Request',
    processingTime: '3 days',
    icon: 'deactivate',
  },
  reactivate: {
    id: 'reactivate',
    label: 'Reactivate Account',
    badge: 'Restore · 3 days',
    badgeStyle: { background: '#D1FAE5', color: '#065F46', border: '1px solid #A7F3D0' },
    iconStyle: { background: '#ECFDF5', color: '#059669', border: '1.5px solid #6EE7B7' },
    accentColor: '#059669',
    leftBorderColor: '#10B981',
    cardBg: '#F6FFFB',
    cardBorder: '#A7F3D0',
    description: 'Restore your suspended account and regain full access to all your Presence Eye devices.',
    consequences: [
      'Full access to all Presence Eye devices restored',
      'All your data is available immediately',
      'Reactivation takes up to 3 days to process',
      'You\'ll receive a secure email link to confirm the action',
    ],
    reasons: ['Ready to resume using the app', 'Issue has been resolved', 'Changed my mind', 'Other'],
    btnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    btnLabel: 'Submit Reactivation Request',
    processingTime: '3 days',
    icon: 'reactivate',
  },
  delete: {
    id: 'delete',
    label: 'Permanently Delete Account',
    badge: 'Irreversible · 30 days',
    badgeStyle: { background: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA' },
    iconStyle: { background: '#FFF5F5', color: '#DC2626', border: '1.5px solid #FCA5A5' },
    accentColor: '#DC2626',
    leftBorderColor: '#EF4444',
    cardBg: '#FFFAFA',
    cardBorder: '#FECACA',
    description: 'Permanently erase your account and all associated data. This cannot be undone after the 30-day window.',
    consequences: [
      'Permanent loss of access to all Presence Eye devices',
      'All personal data is erased — this cannot be recovered',
      'Deletion is finalized 30 days after your confirmation',
      'You\'ll receive a secure email link to confirm the deletion',
    ],
    reasons: ['No longer using the service', 'Privacy / data concerns', 'Switching to another product', 'Security concern', 'Other'],
    btnClass: 'bg-red-600 hover:bg-red-700 text-white',
    btnLabel: 'Submit Deletion Request',
    processingTime: '30 days',
    icon: 'delete',
  },
  data_export: {
    id: 'data_export',
    label: 'Request My Data',
    badge: 'GDPR Right · 7 days',
    badgeStyle: { background: '#DBEAFE', color: '#1E40AF', border: '1px solid #BFDBFE' },
    iconStyle: { background: '#EFF6FF', color: '#2563EB', border: '1.5px solid #93C5FD' },
    accentColor: '#2563EB',
    leftBorderColor: '#3B82F6',
    cardBg: '#F8FBFF',
    cardBorder: '#BFDBFE',
    description: 'Request a full export of all data we hold about you — account info, device history, and activity logs.',
    consequences: [
      'Full export of all personal data we store about you',
      'Device history and activity logs included',
      'Delivered securely to your email within 7 days',
      'Your account remains fully active',
    ],
    reasons: ['Personal data review (GDPR)', 'Account closure preparation', 'Legal / compliance requirement', 'Curiosity / transparency', 'Other'],
    btnClass: 'bg-blue-600 hover:bg-blue-700 text-white',
    btnLabel: 'Request Data Export',
    processingTime: '7 days',
    icon: 'export',
  },
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AccountDeletion() {
  const [selectedType, setSelectedType] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [formData, setFormData] = useState({ fullName: '', email: '', reason: '', additionalInfo: '' });

  const cfg = selectedType ? TYPES[selectedType] : null;
  const isDelete = selectedType === 'delete';
  const canSubmit = !isDelete || confirmText === 'DELETE';

  const handleSelect = (type) => { setSelectedType(type); setStep(2); setError(''); setConfirmText(''); };
  const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleFormNext = (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.reason) {
      setError('Please fill in all required fields.'); return;
    }
    setError(''); setStep(3);
  };

  const handleSubmit = () => {
    if(formData.email==="guest@byose.info") {
      setError("This Is a Testing Email Please make sure you  add  email associated to you personal account ")
      return;
    }
    if (!canSubmit) return;
    setLoading(true); setError('');
    const params = {
      request_type: cfg.label,
      full_name: formData.fullName,
      email: formData.email,
      reason: formData.reason,
      additional_info: formData.additionalInfo || 'N/A',
      processing_time: cfg.processingTime,
      from_name: formData.fullName,
      reply_to: formData.email,
      to_name: 'Presence Eye Support',
      message: `REQUEST TYPE: ${cfg.label}\nPROCESSING TIME: ${cfg.processingTime}\n\nFull Name: ${formData.fullName}\nEmail: ${formData.email}\nReason: ${formData.reason}\nAdditional Info: ${formData.additionalInfo || 'None'}\n\nSubmitted via: presence-eye/account-deletion`,
    };
    emailjs.send(viteemailserviceid, viteemailtemplate, params, { publicKey })
      .then(() => setStep(4))
      .catch(() => setError('Failed to send your request. Please try again or email rw.byose@gmail.com directly.'))
      .finally(() => setLoading(false));
  };

  const reset = () => {
    setSelectedType(null); setStep(1);
    setFormData({ fullName: '', email: '', reason: '', additionalInfo: '' });
    setConfirmText(''); setError(''); setLoading(false);
  };

  const inputBase = `w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 
    placeholder:text-gray-400 outline-none focus:border-gray-400 transition-colors`;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen py-10 px-4" style={{ colorScheme: 'light' }}>
      <div className="container mx-auto md:text-2xl text-xl">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white border-2 border-gray-200 rounded-full px-4 py-2 text-xs font-bold text-gray-600 uppercase tracking-widest mb-4 shadow-sm">
            {Icon.shield}
            Account Management
          </div>
          <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto">
            All requests are verified by our team. A secure confirmation email is sent before any action is taken.
          </p>
        </div>

        {/* Progress bar */}
        {step < 4 && (
          <div className="flex items-center gap-0 mb-7">
            {['Choose', 'Details', 'Confirm'].map((label, i) => {
              const n = i + 1, done = step > n, active = step === n;
              return (
                <div key={label} className={`flex items-center ${n < 3 ? 'flex-1' : ''}`}>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                      ${done ? 'bg-[#195C51] text-white' : active ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-500'}`}>
                      {done ? Icon.check : n}
                    </div>
                    <span className={`text-xs font-semibold hidden sm:block ${active ? 'text-gray-900' : done ? 'text-[#195C51]' : 'text-gray-400'}`}>
                      {label}
                    </span>
                  </div>
                  {n < 3 && <div className={`flex-1 h-0.5 mx-3 rounded-full ${step > n ? 'bg-[#195C51]' : 'bg-gray-200'}`} />}
                </div>
              );
            })}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            STEP 1 — Choose
        ═══════════════════════════════════════════════════════════════ */}
        {step === 1 && (
          <div className="space-y-3">
            {Object.values(TYPES).map((t) => (
              <button key={t.id} onClick={() => handleSelect(t.id)}
                className="w-full text-left bg-white rounded-2xl border-2 border-gray-100 hover:border-gray-300 hover:shadow-md transition-all group p-5 flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"
                  style={t.iconStyle}>
                  {Icon[t.icon]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-gray-900">{t.label}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full" style={t.badgeStyle}>
                      {t.badge}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{t.description}</p>
                </div>
                <div className="self-center text-gray-400 group-hover:text-gray-600 transition-colors">{Icon.chevron}</div>
              </button>
            ))}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            STEP 2 — Form
        ═══════════════════════════════════════════════════════════════ */}
        {step === 2 && cfg && (
          <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm overflow-hidden">

            {/* Type header */}
            <div className="px-6 py-5 border-b-2 border-gray-100 flex items-start gap-4"
              style={{ background: cfg.cardBg, borderLeftWidth: 4, borderLeftColor: cfg.leftBorderColor, borderLeftStyle: 'solid' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={cfg.iconStyle}>
                {Icon[cfg.icon]}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-gray-900">{cfg.label}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full" style={cfg.badgeStyle}>
                    {cfg.badge}
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{cfg.description}</p>
              </div>
            </div>

            {/* What happens next */}
            <div className="px-6 py-4 bg-gray-50 border-b-2 border-gray-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2.5">What happens next</p>
              <ul className="space-y-2">
                {cfg.consequences.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                    <span className="mt-0.5 shrink-0" style={{ color: cfg.accentColor }}>{Icon.check}</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            {/* Fields */}
            <form onSubmit={handleFormNext} className="p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange}
                    placeholder="Jean Paul Uwimana" required className={inputBase} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange}
                    placeholder="you@example.com" required className={inputBase} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  Reason <span className="text-red-500">*</span>
                </label>
                <select name="reason" value={formData.reason} onChange={handleChange} required
                  className={`${inputBase} cursor-pointer`}>
                  <option value="">Select a reason…</option>
                  {cfg.reasons.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  Additional Information{' '}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea name="additionalInfo" value={formData.additionalInfo} onChange={handleChange}
                  rows={3} placeholder="Anything that may help us process your request…"
                  className={`${inputBase} resize-none`} />
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border-2 border-red-200 text-red-700 text-xs font-medium rounded-xl px-4 py-3">
                  {Icon.alert}<span>{error}</span>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={reset}
                  className="flex-1 border-2 border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition text-sm">
                  ← Back
                </button>
                <button type="submit"
                  className={`flex-[2] font-bold py-3 rounded-xl transition text-sm shadow-sm ${cfg.btnClass}`}>
                  Review Request →
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            STEP 3 — Confirm
        ═══════════════════════════════════════════════════════════════ */}
        {step === 3 && cfg && (
          <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-6 border-b-2 border-gray-100 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={cfg.iconStyle}>
                {Icon[cfg.icon]}
              </div>
              <h2 className="font-black text-gray-900 text-lg">Confirm Your Request</h2>
              <p className="text-gray-500 text-sm mt-1">Review everything below before sending.</p>
            </div>

            <div className="p-6 space-y-4">
              {/* Summary */}
              <div className="bg-gray-50 border-2 border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100">
                {[
                  { label: 'Request Type', value: cfg.label },
                  { label: 'Full Name', value: formData.fullName },
                  { label: 'Email', value: formData.email },
                  { label: 'Reason', value: formData.reason },
                  formData.additionalInfo && { label: 'Additional Info', value: formData.additionalInfo },
                  { label: 'Processing Time', value: cfg.processingTime },
                ].filter(Boolean).map(({ label, value }) => (
                  <div key={label} className="flex items-start gap-3 px-4 py-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 w-28 shrink-0 pt-0.5">{label}</span>
                    <span className="text-xs text-gray-900 font-medium leading-relaxed">{value}</span>
                  </div>
                ))}
              </div>

              {/* Delete warning */}
              {isDelete && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-start gap-2 text-red-800">
                    {Icon.alert}
                    <p className="text-xs font-semibold leading-relaxed">
                      <strong>This is permanent and irreversible.</strong> You will lose access to all Presence Eye devices and all data will be erased after 30 days.
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-red-800 mb-1.5">
                      Type{' '}
                      <span className="font-mono bg-red-100 border border-red-300 px-1.5 py-0.5 rounded text-red-900">DELETE</span>
                      {' '}to confirm
                    </label>
                    <input type="text" value={confirmText} onChange={e => setConfirmText(e.target.value)}
                      placeholder="DELETE"
                      className="w-full bg-white border-2 border-red-200 rounded-xl px-4 py-3 text-sm font-mono font-bold text-red-900 placeholder:text-red-300 outline-none focus:border-red-400 transition-colors" />
                    {confirmText.length > 0 && confirmText !== 'DELETE' && (
                      <p className="text-xs text-red-600 mt-1.5 font-semibold">Please type DELETE exactly (all caps)</p>
                    )}
                  </div>
                </div>
              )}

              {/* Security note */}
              <div className="flex items-start gap-3 bg-blue-50 border-2 border-blue-100 rounded-xl px-4 py-3">
                {Icon.mail}
                <p className="text-xs text-blue-900 leading-relaxed">
                  We'll verify your identity before processing. A secure confirmation link will be sent to{' '}
                  <strong>{formData.email}</strong>.
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border-2 border-red-200 text-red-700 text-xs font-medium rounded-xl px-4 py-3">
                  {Icon.alert}<span>{error}</span>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setStep(2); setError(''); }}
                  className="flex-1 border-2 border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition text-sm">
                  ← Edit
                </button>
                <button type="button" onClick={handleSubmit}
                  disabled={loading || !canSubmit}
                  className={`flex-[2] font-bold py-3 rounded-xl transition text-sm shadow-sm
                    flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed ${cfg.btnClass}`}>
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeLinecap="round" />
                      </svg>
                      Submitting…
                    </>
                  ) : cfg.btnLabel}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            STEP 4 — Success
        ═══════════════════════════════════════════════════════════════ */}
        {step === 4 && cfg && (
          <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm p-8 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={cfg.iconStyle}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <h2 className="font-black text-gray-900 text-xl mb-2">Request Submitted!</h2>
            <p className="text-gray-700 text-sm mb-1">
              Your <strong className="text-gray-900">{cfg.label.toLowerCase()}</strong> request has been received.
            </p>
            <p className="text-gray-500 text-sm leading-relaxed mb-5">
              A secure confirmation link will be sent to{' '}
              <strong className="text-gray-900">{formData.email}</strong>.
              Please also check your spam folder.
            </p>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 text-sm font-bold mb-7"
              style={{ borderColor: cfg.cardBorder, color: cfg.accentColor, background: cfg.cardBg }}>
              {Icon.clock}
              Processing time: {cfg.processingTime}
            </div>

            <div className="bg-gray-50 border-2 border-gray-100 rounded-xl p-4 text-left mb-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2.5">What to expect</p>
              <ul className="space-y-2">
                {cfg.consequences.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                    <span className="mt-0.5 shrink-0" style={{ color: cfg.accentColor }}>{Icon.check}</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            <button onClick={reset}
              className="text-xs font-bold text-gray-500 hover:text-gray-800 transition underline underline-offset-2">
              Submit another request
            </button>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-8">
          Need help?{' '}
          <a href="mailto:rw.byose@gmail.com" className="text-[#195C51] font-bold hover:underline">
            rw.byose@gmail.com
          </a>
          {' '}·{' '}
          <a href="https://www.byose.info" target="_blank" rel="noreferrer" className="text-[#195C51] font-bold hover:underline">
            Byose
          </a>
        </p>

      </div>
    </div>
  );
}
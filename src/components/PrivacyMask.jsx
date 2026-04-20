// src/components/PrivacyMask.jsx
// ─── Privacy Mask Utility ─────────────────────────────────────────────────────
// Displays:
//   - Name  → "John D." (first name + first char of last name + dot)
//   - Email → "joh***@gmail.com" (first 3 chars + asterisks before @, domain preserved)
//   - Phone → "+25***6159" (first 3 chars + asterisks + last 4 digits)
//
// Usage:
//   <MaskedName  firstName="John" lastName="Doe" />
//   <MaskedEmail email="john.doe@gmail.com" />
//   <MaskedPhone phone="+250798736159" />
//
//   Or as a hook:
//   const { maskedName, maskedEmail, maskedPhone } = usePrivacyMask(user)
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';

// ─── Pure helpers ─────────────────────────────────────────────────────────────

/**
 * Returns "FirstName L." where L is the first character of the last name.
 * Gracefully handles missing/undefined parts.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function maskName(firstName, lastName) {
  const first = (firstName || '').trim();
  const last  = (lastName  || '').trim();
  if (!first && !last) return 'Unknown';
  if (!last)           return first;
  return `${first} ${last[0].toUpperCase()}.`;
}

/**
 * Returns "joh***@domain.tld"
 * Shows first 3 chars of the local part, replaces the rest with *** before @.
 * Always preserves the full domain.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function maskEmail(email) {
  if (!email || typeof email !== 'string') return '***';
  const atIdx = email.indexOf('@');
  if (atIdx === -1) return `${email.slice(0, 3)}***`;

  const local  = email.slice(0, atIdx);
  const domain = email.slice(atIdx);        // includes the @

  const visible = local.slice(0, 3);
  const stars   = '*'.repeat(Math.max(3, local.length - 3));
  return `${visible}${stars}${domain}`;
}

/**
 * Returns "+25***6159" style masking.
 * Shows first 3 characters + asterisks + last 4 digits.
 */
export function maskPhone(phone) {
  if (!phone || typeof phone !== 'string') return '***';
  const clean = phone.trim();
  if (clean.length <= 7) return `${clean.slice(0, 3)}***`;

  const head = clean.slice(0, 3);
  const tail = clean.slice(-4);
  const stars = '*'.repeat(Math.max(3, clean.length - 7));
  return `${head}${stars}${tail}`;
}

// ─── React hook ──────────────────────────────────────────────────────────────

/**
 * Convenience hook that returns all three masked values at once.
 *
 * @param {{ firstName?: string, lastName?: string, email?: string, phone?: string }} user
 */
export function usePrivacyMask(user = {}) {
  return {
    maskedName:  maskName(user.firstName, user.lastName),
    maskedEmail: maskEmail(user.email),
    maskedPhone: maskPhone(user.phone || user.phoneNumber),
  };
}

// ─── React components ─────────────────────────────────────────────────────────

/**
 * Renders the masked name inline.
 * Props: firstName, lastName, className
 */
export function MaskedName({ firstName, lastName, className = '' }) {
  return (
    <span className={className}>
      {maskName(firstName, lastName)}
    </span>
  );
}

/**
 * Renders the masked email inline.
 * Props: email, className
 */
export function MaskedEmail({ email, className = '' }) {
  return (
    <span className={`font-mono ${className}`}>
      {maskEmail(email)}
    </span>
  );
}

/**
 * Renders the masked phone inline.
 * Props: phone, className
 */
export function MaskedPhone({ phone, className = '' }) {
  return (
    <span className={`font-mono ${className}`}>
      {maskPhone(phone)}
    </span>
  );
}

/**
 * All-in-one user card that shows name, email, and phone in masked form.
 * Useful for tables / leaderboards.
 *
 * Props:
 *   firstName, lastName, email, phone
 *   avatarBg  — background color for the avatar circle  (default: '#195C51')
 *   compact   — if true, only shows name + avatar (default: false)
 */
export function MaskedUserCard({
  firstName,
  lastName,
  email,
  phone,
  avatarBg = '#195C51',
  compact  = false,
}) {
  const name = maskName(firstName, lastName);
  const initial = (firstName || lastName || '?')[0].toUpperCase();

  return (
    <div className="flex items-center gap-2.5">
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-[11px] font-black flex-shrink-0"
        style={{ background: avatarBg }}
      >
        {initial}
      </div>

      {/* Text */}
      <div className="min-w-0">
        <p className="text-xs font-black text-[#1A2E2A] truncate leading-tight">
          {name}
        </p>
        {!compact && (
          <>
            {email && (
              <p className="text-[9px] text-gray-400 font-mono truncate">
                {maskEmail(email)}
              </p>
            )}
            {phone && (
              <p className="text-[9px] text-gray-400 font-mono truncate">
                {maskPhone(phone)}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default {
  MaskedName,
  MaskedEmail,
  MaskedPhone,
  MaskedUserCard,
  maskName,
  maskEmail,
  maskPhone,
  usePrivacyMask,
};
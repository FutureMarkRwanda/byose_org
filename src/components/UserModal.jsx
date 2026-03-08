// src/components/UserModal.jsx
// Changes: all sensitive fields masked — name, email, phone everywhere in the modal

import React from "react";

// ── Privacy helpers (same logic as PrivacyMask.jsx) ──────────────────────────
const maskName = (firstName, lastName) => {
  const first = (firstName || "").trim();
  const last  = (lastName  || "").trim();
  if (!first && !last) return "Unknown";
  if (!last)           return first;
  return `${first} ${last[0].toUpperCase()}.`;
};

const maskEmail = (email) => {
  if (!email) return "—";
  const at = email.indexOf("@");
  if (at === -1) return `${email.slice(0, 3)}***`;
  const local  = email.slice(0, at);
  const domain = email.slice(at); // includes the @
  return `${local.slice(0, 3)}${"*".repeat(Math.max(3, local.length - 3))}${domain}`;
};

const maskPhone = (phone) => {
  if (!phone) return "—";
  const clean = String(phone).trim();
  if (clean.length <= 7) return `${clean.slice(0, 3)}***`;
  const head  = clean.slice(0, 3);
  const tail  = clean.slice(-4);
  const stars = "*".repeat(Math.max(3, clean.length - 7));
  return `${head}${stars}${tail}`;
};
// ─────────────────────────────────────────────────────────────────────────────

export default function UserModal({ user, onClose, copyToClipboard }) {
  const displayName  = maskName(user.firstName, user.lastName);
  const displayEmail = maskEmail(user.email);
  const displayPhone = maskPhone(user.phone || user.phoneNumber);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />

      <div className="relative z-50 w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-auto max-h-[90vh]">

        {/* ── Header ── */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div>
            {/* Masked name in title */}
            <h3 className="text-lg font-bold text-[#1A2E2A]">{displayName}</h3>
            {/* Masked email + masked phone */}
            <div className="text-sm text-gray-400 font-mono mt-0.5">
              {displayEmail}
              {(user.phone || user.phoneNumber) && (
                <span className="ml-2 text-gray-300">·</span>
              )}
              {(user.phone || user.phoneNumber) && (
                <span className="ml-2">{displayPhone}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="text-xs text-gray-400">
              Status:{" "}
              <span className={`font-bold ml-0.5 ${
                user.status === "active" ? "text-green-600" : "text-gray-500"
              }`}>
                {user.status || "—"}
              </span>
            </div>
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs rounded-xl bg-gray-100 hover:bg-gray-200 font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="p-5 space-y-6">

          {/* Profile section */}
          <section>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Profile</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Email</p>
                {/* Masked */}
                <p className="text-sm text-gray-700 font-mono">{displayEmail}</p>
              </div>

              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Phone</p>
                {/* Masked */}
                <p className="text-sm text-gray-700 font-mono">{displayPhone}</p>
              </div>

              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Plan</p>
                <p className="text-sm text-gray-700 font-medium">{user.subscriptionPlan || "—"}</p>
              </div>

              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Verified</p>
                <p className={`text-sm font-bold ${user.isVerified ? "text-green-600" : "text-red-500"}`}>
                  {user.isVerified ? "Yes" : "No"}
                </p>
              </div>

            </div>
          </section>

          {/* Remotes / Buttons section */}
          <section>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
              Remotes / Buttons
            </h4>
            <div className="grid gap-2">
              {(user.buttons || []).length === 0 ? (
                <div className="text-sm text-gray-400 py-2">No remotes assigned</div>
              ) : (
                (user.buttons || []).map((b) => (
                  <div
                    key={b._id}
                    className="flex items-center justify-between bg-gray-50 rounded-xl p-3"
                  >
                    <div>
                      <div className="text-sm font-bold text-[#1A2E2A]">{b.labelName || "Remote"}</div>
                      <div className="text-xs text-gray-400 font-mono">{b.serialNumber}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {b.modelType}
                      </span>
                      <button
                        onClick={() => copyToClipboard(b._id, "Remote ID")}
                        className="px-2 py-1 text-[10px] font-bold rounded-lg bg-white border border-gray-200 hover:bg-gray-100 transition-colors"
                      >
                        Copy ID
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Extensions section */}
          <section>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Extensions</h4>
            <div className="grid gap-3">
              {(user.extensions || []).length === 0 ? (
                <div className="text-sm text-gray-400 py-2">No extensions</div>
              ) : (
                (user.extensions || []).map((ext) => (
                  <div key={ext._id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-bold text-sm text-[#1A2E2A]">{ext.labelName}</div>
                        <div className="text-xs text-gray-400 font-mono mt-0.5">{ext.serialNumber}</div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          Model: {ext.modelType} · Price: ${ext.price}
                        </div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(ext._id, "Extension ID")}
                        className="px-2 py-1 text-[10px] font-bold rounded-lg bg-white border border-gray-200 hover:bg-gray-100 transition-colors flex-shrink-0"
                      >
                        Copy ID
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
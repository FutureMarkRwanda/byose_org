// src/pages/dashboard/PresenceEye.jsx
// Changes:
//  1. Users table — name masked to "First L.", email & phone masked via PrivacyMask helpers
//  2. Mobile user cards — same masking applied
//  3. MapView filter labels reverted to "Enabled" / "Disabled" (not Online/Offline)

import React, { useEffect, useMemo, useState } from "react";
import {
  combineInitials,
  copyToClipboard,
  fetchData,
  formatDate,
  getOwnerLabel,
  returnToken,
} from "../../utils/helper.js";
import { presence_server } from "../../config/server_api.js";
import AddRemoteModal from "../../components/AddRemoteModal.jsx";
import { useNotification } from "../../context/NotificationContext.jsx";
import UserModal from "../../components/UserModal.jsx";
import RemoteDetailsModal from "../../components/RemoteDetailsModal.jsx";
import ExtensionModal from "../../components/ExtensionModal.jsx";
import {
  MdAdd,
  MdOutlineDevices,
  MdPeopleOutline,
  MdExtension,
  MdSearch,
  MdChevronLeft,
  MdChevronRight,
} from "react-icons/md";

// ─── Import PrivacyMask helpers ───────────────────────────────────────────────
// These are the same helpers from src/components/PrivacyMask.jsx
// Inline here so no import path issues if PrivacyMask.jsx isn't wired yet.
// Once PrivacyMask.jsx is in place, replace with:
//   import { maskName, maskEmail, maskPhone } from "../../components/PrivacyMask.jsx";

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

const API = {
  USERS_WITH_DEVICES: presence_server + "/users/more",
  EXTENSIONS:         presence_server + "/extensions/extensions",
  REMOTES:            presence_server + "/buttons/remotes",
};

const StatusBadge = ({ state }) => {
  const styles = {
    instore:  "bg-green-50  text-green-700  border-green-100",
    sold:     "bg-gray-100  text-gray-600   border-gray-200",
    active:   "bg-blue-50   text-blue-700   border-blue-100",
    inactive: "bg-red-50    text-red-700    border-red-100",
    online:   "bg-green-50  text-green-700  border-green-100",
    offline:  "bg-red-50    text-red-700    border-red-100",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${styles[state] || styles.sold}`}>
      {state || "N/A"}
    </span>
  );
};

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
      ${active ? "bg-[#195C51] text-white shadow-sm" : "text-gray-400 hover:text-[#195C51]"}`}
  >
    {children}
  </button>
);

export default function PresenceEyeAdmin() {
  const { showNotification } = useNotification();
  const [activeTab,          setActiveTab]          = useState("remotes");
  const [isModalOpen,        setModalOpen]          = useState(false);
  const [currentPage,        setCurrentPage]        = useState(1);
  const rowsPerPage = 6;

  const [users,      setUsers]      = useState([]);
  const [remotes,    setRemotes]    = useState([]);
  const [extensions, setExtensions] = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [search,     setSearch]     = useState("");

  const [selectedUser,      setSelectedUser]      = useState(null);
  const [selectedRemote,    setSelectedRemote]    = useState(null);
  const [selectedExtension, setSelectedExtension] = useState(null);

  async function load() {
    setLoading(true);
    const token = returnToken();
    try {
      if (activeTab === "users") {
        const { data } = await fetchData(API.USERS_WITH_DEVICES, token);
        setUsers(data?.users || data?.data || (Array.isArray(data) ? data : []));
      } else if (activeTab === "remotes") {
        const { data } = await fetchData(API.REMOTES, token);
        setRemotes(data?.remotes || []);
      } else if (activeTab === "extensions") {
        const { data } = await fetchData(API.EXTENSIONS, token);
        setExtensions(data?.extensions || data?.data || (Array.isArray(data) ? data : []));
      }
      setCurrentPage(1);
    } catch (err) {
      showNotification("Data sync failed", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [activeTab]);

  const allFilteredData = useMemo(() => {
    const q = search.toLowerCase();
    if (activeTab === "remotes")
      return (remotes || []).filter((r) => r.serialNumber?.toLowerCase().includes(q));
    if (activeTab === "users")
      return (users || []).filter((u) =>
        `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(q)
      );
    return (extensions || []).filter(
      (e) => e.serialNumber?.toLowerCase().includes(q) || e.labelName?.toLowerCase().includes(q)
    );
  }, [activeTab, remotes, users, extensions, search]);

  const totalPages    = Math.ceil(allFilteredData.length / rowsPerPage);
  const paginatedData = allFilteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleRemoteStatus = async (remote_id, isEnabled) => {
    try {
      const result = await patchData(
        `${presence_server}/buttons/remotes/change-status/${remote_id}`,
        { isEnabled: !isEnabled },
        returnToken()
      );
      if (result.error) throw new Error(result.error);
      showNotification(`Remote ${!isEnabled ? "Enabled" : "Disabled"}`, "success");
      load();
    } catch (error) {
      showNotification(error.message, "error");
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 animate-slide-entrance pb-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-2">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#333333]">Hardware Grid</h1>
          <p className="text-sm text-gray-500 font-medium tracking-tight">
            System managing {allFilteredData.length} active nodes.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-[#195C51] text-white px-5 sm:px-8 py-3 sm:py-3.5 rounded-2xl font-bold hover:bg-[#0E3A32] shadow-xl transition-all active:scale-95 text-sm"
        >
          <MdAdd size={18} /> Provision Remote
        </button>
      </div>

      {/* Segmented Controls & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between px-2">
        <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
          {["remotes", "users", "extensions"].map((tab) => (
            <TabButton key={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)}>
              {tab}
            </TabButton>
          ))}
        </div>

        <div className="relative group">
          <MdSearch
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#195C51]"
            size={18}
          />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72 lg:w-80 pl-11 pr-4 py-2.5 sm:py-3 bg-white border border-gray-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#195C51]/10 shadow-sm"
          />
        </div>
      </div>

      {/* ── Desktop Table ── */}
      <div className="hidden sm:block google-card overflow-hidden bg-white mx-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#F5F5F5]/40 border-b border-gray-100">
              <tr>
                {activeTab === "remotes" && (
                  <>
                    <th className="px-5 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Identity</th>
                    <th className="px-5 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Pins</th>
                    <th className="px-5 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Status</th>
                    <th className="px-5 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Created</th>
                    <th className="px-5 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Action</th>
                  </>
                )}
                {activeTab === "users" && (
                  <>
                    <th className="px-5 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">User</th>
                    <th className="px-5 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Email</th>
                    <th className="px-5 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Phone</th>
                    <th className="px-5 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Device Units</th>
                    <th className="px-5 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Registered</th>
                    <th className="px-5 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Action</th>
                  </>
                )}
                {activeTab === "extensions" && (
                  <>
                    <th className="px-5 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Device Label</th>
                    <th className="px-5 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Serial</th>
                    <th className="px-5 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Owner</th>
                    <th className="px-5 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Status</th>
                    <th className="px-5 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Action</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {!loading && paginatedData.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50/40 transition-colors">

                  {/* ── Remotes tab ── */}
                  {activeTab === "remotes" && (
                    <>
                      <td className="px-5 py-4">
                        <div className="font-bold text-[#333333] text-sm">{item.serialNumber}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase">{item.manufacture}</div>
                      </td>
                      <td className="px-5 py-4 text-xs font-medium text-gray-500">{item.buttons?.length || 0} Pins</td>
                      <td className="px-5 py-4"><StatusBadge state={item.state} /></td>
                      <td className="px-5 py-4 text-xs font-medium text-gray-400">{formatDate(item.createdAt)}</td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedRemote(item)}
                          className="px-3 py-1.5 rounded-xl bg-[#F5F5F5] text-[9px] font-black uppercase text-[#195C51] hover:bg-[#195C51] hover:text-white transition-all"
                        >
                          Manage
                        </button>
                      </td>
                    </>
                  )}

                  {/* ── Users tab — masked ── */}
                  {activeTab === "users" && (
                    <>
                      {/* Name — masked to "First L." */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[#195C51]/10 flex items-center justify-center text-[9px] font-black text-[#195C51] uppercase flex-shrink-0">
                            {combineInitials(item.firstName, item.lastName)}
                          </div>
                          <div className="font-bold text-sm text-[#333333]">
                            {maskName(item.firstName, item.lastName)}
                          </div>
                        </div>
                      </td>
                      {/* Email — masked: "joh***@domain.com" */}
                      <td className="px-5 py-4 text-sm text-gray-500 font-mono">
                        {maskEmail(item.email)}
                      </td>
                      {/* Phone — masked: "+25***6159" */}
                      <td className="px-5 py-4 text-sm text-gray-500 font-mono">
                        {maskPhone(item.phone || item.phoneNumber)}
                      </td>
                      <td className="px-5 py-4 text-xs font-medium text-gray-600">
                        {(item.extensions?.length || 0) + (item.buttons?.length || 0)} Units
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-400">{formatDate(item.createdAt)}</td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedUser(item)}
                          className="px-3 py-1.5 rounded-xl bg-[#F5F5F5] text-[9px] font-black uppercase text-[#195C51] hover:bg-[#195C51] hover:text-white transition-all"
                        >
                          Profile
                        </button>
                      </td>
                    </>
                  )}

                  {/* ── Extensions tab ── */}
                  {activeTab === "extensions" && (
                    <>
                      <td className="px-5 py-4">
                        <div className="font-bold text-[#333333] text-sm">{item.labelName || "Digital Twin"}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase">{item.modelType}</div>
                      </td>
                      <td className="px-5 py-4 text-xs font-mono text-gray-400">{item.serialNumber}</td>
                      <td className="px-5 py-4 text-sm font-medium text-gray-600">
                        {typeof item.owner === "object" ? getOwnerLabel(item.owner) : item.owner || "Unassigned"}
                      </td>
                      <td className="px-5 py-4"><StatusBadge state={item.status} /></td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedExtension(item)}
                          className="px-3 py-1.5 rounded-xl bg-[#F5F5F5] text-[9px] font-black uppercase text-[#195C51] hover:bg-[#195C51] hover:text-white transition-all"
                        >
                          Config
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 bg-[#F5F5F5]/30 border-t border-gray-50 flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            Page {currentPage} of {totalPages || 1}
          </p>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="p-2 rounded-xl bg-white border border-gray-100 text-gray-500 disabled:opacity-30 hover:text-[#195C51] transition-all"
            >
              <MdChevronLeft size={18} />
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-2 rounded-xl bg-white border border-gray-100 text-gray-500 disabled:opacity-30 hover:text-[#195C51] transition-all"
            >
              <MdChevronRight size={18} />
            </button>
          </div>
        </div>

        {loading && (
          <div className="p-16 text-center space-y-4">
            <div className="w-10 h-10 border-4 border-[#195C51]/10 border-t-[#195C51] rounded-full animate-spin mx-auto" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Retrieving Cloud Data...</p>
          </div>
        )}
      </div>

      {/* ── Mobile Cards ── */}
      <div className="sm:hidden space-y-3 px-2">
        {loading && (
          <div className="py-12 text-center">
            <div className="w-10 h-10 border-4 border-[#195C51]/10 border-t-[#195C51] rounded-full animate-spin mx-auto" />
          </div>
        )}
        {!loading && paginatedData.length === 0 && (
          <div className="google-card bg-white p-10 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">No records found.</p>
          </div>
        )}
        {!loading && paginatedData.map((item) => (
          <div key={item._id} className="google-card bg-white p-4 space-y-3">

            {activeTab === "remotes" && (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-[#333333] text-sm">{item.serialNumber}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{item.manufacture}</p>
                  </div>
                  <StatusBadge state={item.state} />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-50 pt-2">
                  <span>{item.buttons?.length || 0} Pins</span>
                  <span>{formatDate(item.createdAt)}</span>
                </div>
                <button
                  onClick={() => setSelectedRemote(item)}
                  className="w-full py-2 rounded-xl bg-[#F5F5F5] text-[10px] font-black uppercase text-[#195C51] hover:bg-[#195C51] hover:text-white transition-all"
                >
                  Manage
                </button>
              </>
            )}

            {/* ── Users mobile — masked ── */}
            {activeTab === "users" && (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#195C51]/10 flex items-center justify-center text-[10px] font-black text-[#195C51] uppercase flex-shrink-0">
                    {combineInitials(item.firstName, item.lastName)}
                  </div>
                  <div>
                    {/* Masked name */}
                    <p className="font-bold text-[#333333] text-sm">
                      {maskName(item.firstName, item.lastName)}
                    </p>
                    {/* Masked email */}
                    <p className="text-xs text-gray-400 font-mono">
                      {maskEmail(item.email)}
                    </p>
                    {/* Masked phone */}
                    {(item.phone || item.phoneNumber) && (
                      <p className="text-xs text-gray-400 font-mono">
                        {maskPhone(item.phone || item.phoneNumber)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-50 pt-2">
                  <span>{(item.extensions?.length || 0) + (item.buttons?.length || 0)} units</span>
                  <span>{formatDate(item.createdAt)}</span>
                </div>
                <button
                  onClick={() => setSelectedUser(item)}
                  className="w-full py-2 rounded-xl bg-[#F5F5F5] text-[10px] font-black uppercase text-[#195C51] hover:bg-[#195C51] hover:text-white transition-all"
                >
                  View Profile
                </button>
              </>
            )}

            {activeTab === "extensions" && (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-[#333333] text-sm">{item.labelName || "Digital Twin"}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{item.serialNumber}</p>
                  </div>
                  <StatusBadge state={item.status} />
                </div>
                <div className="text-xs text-gray-500 border-t border-gray-50 pt-2">
                  Owner: {typeof item.owner === "object" ? getOwnerLabel(item.owner) : item.owner || "Unassigned"}
                </div>
                <button
                  onClick={() => setSelectedExtension(item)}
                  className="w-full py-2 rounded-xl bg-[#F5F5F5] text-[10px] font-black uppercase text-[#195C51] hover:bg-[#195C51] hover:text-white transition-all"
                >
                  Config
                </button>
              </>
            )}
          </div>
        ))}

        {/* Mobile Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between py-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              {currentPage} / {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="p-2 rounded-xl bg-white border border-gray-100 text-gray-500 disabled:opacity-30"
              >
                <MdChevronLeft size={18} />
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-2 rounded-xl bg-white border border-gray-100 text-gray-500 disabled:opacity-30"
              >
                <MdChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      <AddRemoteModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onCreated={load} />
      {selectedUser && (
        <UserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          copyToClipboard={copyToClipboard}
        />
      )}
      {selectedRemote && (
        <RemoteDetailsModal
          remote={selectedRemote}
          onClose={() => setSelectedRemote(null)}
          onUpdate={load}
          onAddHardware={handleAddingHardware}
          onTestHardware={handleTestingHardware}
          onToggleStatus={handleRemoteStatus}
        />
      )}
      {selectedExtension && (
        <ExtensionModal
          extension={selectedExtension}
          onClose={() => setSelectedExtension(null)}
          onUpdate={load}
        />
      )}
    </div>
  );
}
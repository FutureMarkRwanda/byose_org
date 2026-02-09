import React, { useEffect, useMemo, useState } from "react";
import {
    combineInitials,
    copyToClipboard,
    fetchData,
    formatDate,
    getOwnerLabel,
    returnToken
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
    MdChevronRight 
} from "react-icons/md";

const API = {
    USERS_WITH_DEVICES: presence_server + "/users/more",
    EXTENSIONS: presence_server + "/extensions/extensions",
    REMOTES: presence_server + "/buttons/remotes",
};

const StatusBadge = ({ state }) => {
    const styles = {
        instore: "bg-green-50 text-green-700 border-green-100",
        sold: "bg-gray-100 text-gray-600 border-gray-200",
        active: "bg-blue-50 text-blue-700 border-blue-100",
        inactive: "bg-red-50 text-red-700 border-red-100",
        online: "bg-green-50 text-green-700 border-green-100",
        offline: "bg-red-50 text-red-700 border-red-100",
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${styles[state] || styles.sold}`}>
            {state || "N/A"}
        </span>
    );
};

export default function PresenceEyeAdmin() {
    const { showNotification } = useNotification();
    const [activeTab, setActiveTab] = useState("remotes");
    const [isModalOpen, setModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 6;

    const [users, setUsers] = useState([]);
    const [remotes, setRemotes] = useState([]);
    const [extensions, setExtensions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");

    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedRemote, setSelectedRemote] = useState(null);
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
                console.log(data.remotes);
                
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
        if (activeTab === "remotes") return (remotes || []).filter(r => r.serialNumber?.toLowerCase().includes(q));
        if (activeTab === "users") return (users || []).filter(u => `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(q));
        return (extensions || []).filter(e => e.serialNumber?.toLowerCase().includes(q) || e.labelName?.toLowerCase().includes(q));
    }, [activeTab, remotes, users, extensions, search]);

    const totalPages = Math.ceil(allFilteredData.length / rowsPerPage);
    const paginatedData = allFilteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    return (
        <div className="space-y-6 animate-slide-entrance pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-[#333333]">Hardware Grid</h1>
                    <p className="text-sm text-gray-500 font-medium tracking-tight">System managing {allFilteredData.length} active nodes.</p>
                </div>
                <button onClick={() => setModalOpen(true)} className="flex items-center justify-center gap-2 bg-[#195C51] text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-[#0E3A32] shadow-xl transition-all active:scale-95">
                    <MdAdd size={20}/> Provision Remote
                </button>
            </div>

            {/* Segmented Controls & Search */}
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between px-2">
                <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm w-full lg:w-max">
                    {["remotes", "users", "extensions"].map((tab) => (
                        <TabButton key={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)}>
                            {tab}
                        </TabButton>
                    ))}
                </div>

                <div className="relative w-full lg:w-80 group">
                    <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#195C51]" size={20} />
                    <input 
                        type="text" 
                        placeholder={`Search ${activeTab}...`} 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#195C51]/10 shadow-sm"
                    />
                </div>
            </div>

            {/* Table Container */}
            <div className="google-card overflow-hidden bg-white mx-2">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#F5F5F5]/40 border-b border-gray-100">
                            <tr>
                                {activeTab === "remotes" && (
                                    <>
                                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Identity</th>
                                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Pins</th>
                                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Status</th>
                                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Created</th>
                                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Action</th>
                                    </>
                                )}
                                {activeTab === "users" && (
                                    <>
                                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">User Details</th>
                                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Email</th>
                                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Devices</th>
                                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Registered</th>
                                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Action</th>
                                    </>
                                )}
                                {activeTab === "extensions" && (
                                    <>
                                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Device Label</th>
                                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Serial</th>
                                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Current Owner</th>
                                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Status</th>
                                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Action</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {!loading && paginatedData.map((item) => (
                                <tr key={item._id} className="hover:bg-gray-50/40 transition-colors">
                                    {activeTab === "remotes" && (
                                        <>
                                            <td className="px-6 py-5">
                                                <div className="font-bold text-[#333333] text-sm">{item.serialNumber}</div>
                                                <div className="text-[10px] text-gray-400 font-bold uppercase">{item.manufacture}</div>
                                            </td>
                                            <td className="px-6 py-5 text-xs font-medium text-gray-500">{item.buttons?.length || 0} Pins</td>
                                            <td className="px-6 py-5"><StatusBadge state={item.state} /></td>
                                            <td className="px-6 py-5 text-xs font-medium text-gray-400">{formatDate(item.createdAt)}</td>
                                            <td className="px-6 py-5 text-right">
                                                <button onClick={() => setSelectedRemote(item)} className="px-4 py-2 rounded-xl bg-[#F5F5F5] text-[10px] font-black uppercase text-[#195C51] hover:bg-[#195C51] hover:text-white transition-all">Manage</button>
                                            </td>
                                        </>
                                    )}
                                    {activeTab === "users" && (
                                        <>
                                            <td className="px-6 py-5 flex items-center gap-4">
                                                <div className="w-9 h-9 rounded-xl bg-[#195C51]/10 flex items-center justify-center text-[10px] font-black text-[#195C51] uppercase">
                                                    {combineInitials(item.firstName, item.lastName)}
                                                </div>
                                                <div className="font-bold text-sm text-[#333333] tracking-tight">{item.firstName} {item.lastName}</div>
                                            </td>
                                            <td className="px-6 py-5 text-sm text-gray-500 font-medium">{item.email}</td>
                                            <td className="px-6 py-5 text-xs font-medium text-gray-600">{(item.extensions?.length || 0) + (item.buttons?.length || 0)} Units</td>
                                            <td className="px-6 py-5 text-xs text-gray-400">{formatDate(item.createdAt)}</td>
                                            <td className="px-6 py-5 text-right">
                                                <button onClick={() => setSelectedUser(item)} className="px-4 py-2 rounded-xl bg-[#F5F5F5] text-[10px] font-black uppercase text-[#195C51] hover:bg-[#195C51] hover:text-white transition-all">Profile</button>
                                            </td>
                                        </>
                                    )}
                                    {activeTab === "extensions" && (
                                        <>
                                            <td className="px-6 py-5">
                                                <div className="font-bold text-[#333333] text-sm">{item.labelName || "Digital Twin"}</div>
                                                <div className="text-[10px] text-gray-400 font-bold uppercase">{item.modelType}</div>
                                            </td>
                                            <td className="px-6 py-5 text-xs font-mono text-gray-400">{item.serialNumber}</td>
                                            <td className="px-6 py-5">
                                                <div className="text-sm font-medium text-gray-600">
                                                    {typeof item.owner === "object" ? getOwnerLabel(item.owner) : item.owner || "Unassigned"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5"><StatusBadge state={item.status} /></td>
                                            <td className="px-6 py-5 text-right">
                                                <button onClick={() => setSelectedExtension(item)} className="px-4 py-2 rounded-xl bg-[#F5F5F5] text-[10px] font-black uppercase text-[#195C51] hover:bg-[#195C51] hover:text-white transition-all">Config</button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer with Pagination */}
                <div className="px-6 py-4 bg-[#F5F5F5]/30 border-t border-gray-50 flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Page {currentPage} of {totalPages || 1}
                    </p>
                    <div className="flex gap-2">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 rounded-xl bg-white border border-gray-100 text-gray-500 disabled:opacity-30 hover:text-[#195C51] transition-all">
                            <MdChevronLeft size={20} />
                        </button>
                        <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 rounded-xl bg-white border border-gray-100 text-gray-500 disabled:opacity-30 hover:text-[#195C51] transition-all">
                            <MdChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {loading && (
                    <div className="p-20 text-center space-y-4">
                        <div className="w-10 h-10 border-4 border-[#195C51]/10 border-t-[#195C51] rounded-full animate-spin mx-auto"></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Retrieving Cloud Data...</p>
                    </div>
                )}
            </div>

            <AddRemoteModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onCreated={load} />
            {selectedUser && <UserModal user={selectedUser} onClose={() => setSelectedUser(null)} copyToClipboard={copyToClipboard} />}
            {selectedRemote && <RemoteDetailsModal remote={selectedRemote} onClose={() => setSelectedRemote(null)} copyToClipboard={copyToClipboard} />}
            {selectedExtension && <ExtensionModal extension={selectedExtension} onClose={() => setSelectedExtension(null)} copyToClipboard={copyToClipboard} />}
        </div>
    );
}

function TabButton({ children, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                active ? "bg-[#195C51] text-white shadow-lg" : "text-gray-400 hover:text-[#333333]"
            }`}
        >
            {children}
        </button>
    );
}
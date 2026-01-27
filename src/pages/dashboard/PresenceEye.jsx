import React, { useEffect, useMemo, useState } from "react";
import {
    combineInitials,
    copyToClipboard,
    fetchData,
    formatDate,
    getOwnerLabel,
    patchData,
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
    MdFilterList 
} from "react-icons/md";

const API = {
    USERS_WITH_DEVICES: presence_server + "/users/more",
    EXTENSIONS: presence_server + "/extensions/extensions",
    REMOTES: presence_server + "/buttons/remotes",
};

// Sub-component for Status Badges
const StatusBadge = ({ state }) => {
    const styles = {
        instore: "bg-green-50 text-green-700 border-green-100",
        sold: "bg-gray-100 text-gray-600 border-gray-200",
        active: "bg-blue-50 text-blue-700 border-blue-100",
        inactive: "bg-red-50 text-red-700 border-red-100",
    };
    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${styles[state] || styles.sold}`}>
            {state}
        </span>
    );
};

export default function PresenceEyeAdmin() {
    const { showNotification } = useNotification();
    const [activeTab, setActiveTab] = useState("remotes");
    const [isModalOpen, setModalOpen] = useState(false);
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
        try {
            const token = returnToken();
            if (activeTab === "users") {
                const { data } = await fetchData(API.USERS_WITH_DEVICES, token);
                setUsers(Array.isArray(data) ? data : []);
            } else if (activeTab === "remotes") {
                const { data } = await fetchData(API.REMOTES, token);
                setRemotes(data?.remotes || []);
            } else if (activeTab === "extensions") {
                const { data } = await fetchData(API.EXTENSIONS, token);
                setExtensions(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            showNotification("Failed to synchronize data", "error");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, [activeTab]);

    const filteredRemotes = useMemo(() => {
        let list = remotes || [];
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(r => 
                r.serialNumber?.toLowerCase().includes(q) || 
                r.manufacture?.toLowerCase().includes(q)
            );
        }
        return list;
    }, [remotes, search]);

    return (
        <div className="space-y-8 animate-slide-entrance pb-10">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-[#333333]">Hardware Inventory</h1>
                    <p className="text-gray-500 font-medium">Provision and manage digital identities for physical devices.</p>
                </div>
                <button 
                    onClick={() => setModalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-[#195C51] text-white px-8 py-4 rounded-2xl font-bold hover:bg-[#0E3A32] shadow-xl transition-all active:scale-95"
                >
                    <MdAdd size={22}/> Provision Remote
                </button>
            </div>

            {/* Navigation & Filters */}
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm w-full lg:w-max">
                    <TabButton active={activeTab === "remotes"} onClick={() => setActiveTab("remotes")}>
                        <MdOutlineDevices className="mr-2" size={18}/> Remotes
                    </TabButton>
                    <TabButton active={activeTab === "users"} onClick={() => setActiveTab("users")}>
                        <MdPeopleOutline className="mr-2" size={18}/> Users
                    </TabButton>
                    <TabButton active={activeTab === "extensions"} onClick={() => setActiveTab("extensions")}>
                        <MdExtension className="mr-2" size={18}/> Extensions
                    </TabButton>
                </div>

                <div className="flex gap-3 w-full lg:w-max">
                    <div className="relative flex-grow lg:w-72 group">
                        <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#195C51] transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search by serial..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#195C51]/10 shadow-sm"
                        />
                    </div>
                    <button className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-[#195C51] shadow-sm">
                        <MdFilterList size={24} />
                    </button>
                </div>
            </div>

            {/* Main Table Card */}
            <div className="google-card overflow-hidden bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[#F5F5F5]/50 border-b border-gray-50">
                                <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Device Identity</th>
                                <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Model Configuration</th>
                                <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Current State</th>
                                <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Assigned Owner</th>
                                <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {activeTab === "remotes" && filteredRemotes.map((r) => (
                                <tr key={r._id} className="hover:bg-[#F5F5F5]/30 transition-colors">
                                    <td className="p-5">
                                        <div className="font-bold text-[#333333] tracking-tight">{r.serialNumber}</div>
                                        <div className="text-xs text-gray-400 font-medium uppercase">{r.manufacture}</div>
                                    </td>
                                    <td className="p-5">
                                        <div className="text-sm font-bold text-[#195C51] uppercase">{r.modelType}</div>
                                        <div className="text-[10px] text-gray-400 font-bold">{r.buttons?.length || 0} PIN PORTS</div>
                                    </td>
                                    <td className="p-5">
                                        <StatusBadge state={r.state} />
                                    </td>
                                    <td className="p-5">
                                        <div className="text-sm font-medium text-gray-600">
                                            {typeof r.owner === "object" ? getOwnerLabel(r.owner) : r.owner || "—"}
                                        </div>
                                    </td>
                                    <td className="p-5 text-right">
                                        <button 
                                            onClick={() => setSelectedRemote(r)}
                                            className="px-5 py-2 rounded-xl bg-[#F5F5F5] text-[#333333] text-xs font-bold hover:bg-[#195C51] hover:text-white transition-all shadow-sm"
                                        >
                                            View Logs
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {loading && (
                    <div className="p-20 text-center space-y-4">
                        <div className="w-12 h-12 border-4 border-[#195C51]/20 border-t-[#195C51] rounded-full animate-spin mx-auto"></div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Encrypting Connection...</p>
                    </div>
                )}
            </div>

            {/* Modals */}
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
            className={`flex items-center justify-center flex-1 md:flex-none px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                active ? "bg-[#195C51] text-white shadow-lg shadow-[#195C51]/20" : "text-gray-400 hover:text-[#333333]"
            }`}
        >
            {children}
        </button>
    );
}
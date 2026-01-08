import React, {useEffect, useMemo, useState} from "react";
import {combineInitials, fetchData, formatDate, getOwnerLabel, patchData, returnToken} from "../../utils/helper.js";
import {presence_server} from "../../config/server_api.js";
import AddRemoteModal from "../../components/AddRemoteModal.jsx";
import {useNotification} from "../../context/NotificationContext.jsx";
import UserModal from "../../components/UserModal.jsx";
import RemoteDetailsModal from "../../components/RemoteDetailsModal.jsx";
import ExtensionModal from "../../components/ExtensionModal.jsx";

const API = {
    USERS_WITH_DEVICES: presence_server + "/users/more",
    USERS_SUMMARY: presence_server + "/users/no-more",
    EXTENSIONS: presence_server + "/extensions/extensions",
    REMOTES: presence_server + "/buttons/remotes", // Endpoint returns Remotes
};

export default function PresenceEyeAdmin() {
     const {showNotification} = useNotification();
    // changed default active tab to 'remotes' for convenience, or keep 'users'
    const [activeTab, setActiveTab] = useState("remotes");
    const [isModalOpen, setModalOpen] = useState(false);

    const [users, setUsers] = useState([]);
    const [remotes, setRemotes] = useState([]); // Changed from buttons to remotes
    const [extensions, setExtensions] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    // Filters adapted for REMOTES
    const [remoteFilters, setRemoteFilters] = useState({
        state: "all", // all | instore | sold
        hasHardware: "all", // all | yes | no
        modelType: "all",
        owner: "all", // all | assigned | unassigned
        priceMin: "",
        priceMax: "",
        fromDate: "",
        toDate: "",
    });

    const [extensionFilters, setExtensionFilters] = useState({
        modelType: "all",
        state: "all",
        owner: "all",
        minPorts: "",
        maxPorts: "",
        fromDate: "",
        toDate: "",
    });

    const [userFilters, setUserFilters] = useState({
        plan: "all",
        fromDate: "",
        toDate: "",
        minDevices: "",
        maxDevices: "",
    });

    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedRemote, setSelectedRemote] = useState(null); // Viewed Remote
    const [selectedExtension, setSelectedExtension] = useState(null);
    const [toast, setToast] = useState(null);


    async function load() {
        setLoading(true);
        setError("");
        try {
            if (activeTab === "users") {
                const {data, error: fetchErr} = await fetchData(API.USERS_WITH_DEVICES, returnToken());
                if (fetchErr) throw new Error(fetchErr);
                setUsers(Array.isArray(data) ? data : []);

            } else if (activeTab === "remotes") {
                const {data, error: fetchErr} = await fetchData(API.REMOTES, returnToken());
                if (fetchErr) throw new Error(fetchErr);

                // Directly use the remotes array from the response
                const list = data?.remotes || [];
                setRemotes(list);

            } else if (activeTab === "extensions") {
                const {data, error: fetchErr} = await fetchData(API.EXTENSIONS, returnToken());
                if (fetchErr) throw new Error(fetchErr);
                setExtensions(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to load data");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, [activeTab]);

    const handleRemoteCreated = () => {
        load();
    };

    const copyToClipboard = async (text, label = "copied") => {
        try {
            await navigator.clipboard.writeText(String(text));
            showNotification(`${label} copied to clipboard`)
        } catch (err) {
            showNotification('Failed to copy'+err.message);
        }
    };

    /* ---------- Filters & derived lists ---------- */

    const filteredRemotes = useMemo(() => {
        let list = remotes || [];

        // Search by Serial, Manufacture, or Owner Name
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            list = list.filter((r) => {
                const ownerName = typeof r.owner === 'object' && r.owner
                    ? (r.owner.firstName + " " + r.owner.lastName).toLowerCase()
                    : "";

                return (
                    (r.serialNumber || "").toLowerCase().includes(q) ||
                    (r.manufacture || "").toLowerCase().includes(q) ||
                    ownerName.includes(q)
                );
            });
        }

        if (remoteFilters.state !== "all") {
            list = list.filter((r) => r.state === remoteFilters.state);
        }
        if (remoteFilters.hasHardware !== "all") {
            const want = remoteFilters.hasHardware === "yes";
            list = list.filter((r) => Boolean(r.hasHardware) === want);
        }
        if (remoteFilters.modelType !== "all") {
            list = list.filter((r) => r.modelType === remoteFilters.modelType);
        }

        if (remoteFilters.owner !== "all") {
            if (remoteFilters.owner === "assigned") list = list.filter((r) => !!r.owner);
            else list = list.filter((r) => !r.owner);
        }

        const pMin = Number(remoteFilters.priceMin || 0);
        const pMax = remoteFilters.priceMax ? Number(remoteFilters.priceMax) : null;
        if (remoteFilters.priceMin || remoteFilters.priceMax) {
            list = list.filter((r) => {
                const price = Number(r.price || 0);
                if (remoteFilters.priceMin && price < pMin) return false;
                if (remoteFilters.priceMax && pMax !== null && price > pMax) return false;
                return true;
            });
        }

        if (remoteFilters.fromDate || remoteFilters.toDate) {
            list = list.filter((r) => {
                const created = new Date(r.createdAt || 0);
                if (remoteFilters.fromDate) {
                    const from = new Date(remoteFilters.fromDate + "T00:00:00");
                    if (created < from) return false;
                }
                if (remoteFilters.toDate) {
                    const to = new Date(remoteFilters.toDate + "T23:59:59");
                    if (created > to) return false;
                }
                return true;
            });
        }

        return list;
    }, [remotes, remoteFilters, search]);

    const filteredExtensions = useMemo(() => {
        let list = extensions || [];

        if (search.trim()) {
            const q = search.trim().toLowerCase();
            list = list.filter(
                (e) =>
                    (e.labelName || "").toLowerCase().includes(q) ||
                    (e.serialNumber || "").toLowerCase().includes(q) ||
                    (e.manufacture || "").toLowerCase().includes(q)
            );
        }

        if (extensionFilters.modelType !== "all") {
            list = list.filter((e) => e.modelType === extensionFilters.modelType);
        }
        if (extensionFilters.state !== "all") {
            list = list.filter((e) => e.status === extensionFilters.state);
        }
        if (extensionFilters.owner !== "all") {
            if (extensionFilters.owner === "assigned") list = list.filter((e) => !!e.owner);
            else list = list.filter((e) => !e.owner);
        }

        const minP = Number(extensionFilters.minPorts || 0);
        const maxP = extensionFilters.maxPorts ? Number(extensionFilters.maxPorts) : null;
        if (extensionFilters.minPorts || extensionFilters.maxPorts) {
            list = list.filter((e) => {
                const count = (e.ports?.length || 0);
                if (extensionFilters.minPorts && count < minP) return false;
                if (extensionFilters.maxPorts && maxP !== null && count > maxP) return false;
                return true;
            });
        }

        if (extensionFilters.fromDate || extensionFilters.toDate) {
            list = list.filter((e) => {
                const created = new Date(e.createdAt || e.created || 0);
                if (extensionFilters.fromDate) {
                    const from = new Date(extensionFilters.fromDate + "T00:00:00");
                    if (created < from) return false;
                }
                if (extensionFilters.toDate) {
                    const to = new Date(extensionFilters.toDate + "T23:59:59");
                    if (created > to) return false;
                }
                return true;
            });
        }

        return list;
    }, [extensions, extensionFilters, search]);

    const filteredUsers = useMemo(() => {
        let list = users || [];

        if (search.trim()) {
            const q = search.trim().toLowerCase();
            list = list.filter(
                (u) =>
                    ((u.firstName || "") + " " + (u.lastName || "")).toLowerCase().includes(q) ||
                    (u.email || "").toLowerCase().includes(q) ||
                    (u.phone || "").toLowerCase().includes(q)
            );
        }

        if (userFilters.plan && userFilters.plan !== "all") {
            list = list.filter((u) => (u.subscriptionPlan || "free") === userFilters.plan);
        }

        const minDevices = Number(userFilters.minDevices || 0);
        const maxDevices = userFilters.maxDevices ? Number(userFilters.maxDevices) : null;
        if (userFilters.minDevices || userFilters.maxDevices) {
            list = list.filter((u) => {
                const count = (u.extensions?.length || 0) + (u.buttons?.length || 0); // Note: user object might still have 'buttons' array name from backend
                if (userFilters.minDevices && count < minDevices) return false;
                if (userFilters.maxDevices && maxDevices !== null && count > maxDevices) return false;
                return true;
            });
        }

        if (userFilters.fromDate || userFilters.toDate) {
            list = list.filter((u) => {
                const created = new Date(u.createdAt || u.created || 0);
                if (userFilters.fromDate) {
                    const from = new Date(userFilters.fromDate + "T00:00:00");
                    if (created < from) return false;
                }
                if (userFilters.toDate) {
                    const to = new Date(userFilters.toDate + "T23:59:59");
                    if (created > to) return false;
                }
                return true;
            });
        }

        return list;
    }, [users, search, userFilters]);

    const remoteStats = useMemo(() => {
        const total = remotes.length;
        const sold = remotes.filter((r) => r.state === "sold").length;
        const instore = remotes.filter((r) => r.state === "instore").length;
        const withHardware = remotes.filter((r) => r.hasHardware).length;
        const byModel = remotes.reduce((acc, cur) => {
            acc[cur.modelType] = (acc[cur.modelType] || 0) + 1;
            return acc;
        }, {});
        return {total, sold, instore, withHardware, byModel};
    }, [remotes]);

    const resetRemoteFilters = () =>
        setRemoteFilters({
            state: "all",
            hasHardware: "all",
            modelType: "all",
            owner: "all",
            priceMin: "",
            priceMax: "",
            fromDate: "",
            toDate: "",
        });

    const resetExtensionFilters = () =>
        setExtensionFilters({
            modelType: "all",
            state: "all",
            owner: "all",
            minPorts: "",
            maxPorts: "",
            fromDate: "",
            toDate: "",
        });

    const resetUserFilters = () =>
        setUserFilters({plan: "all", fromDate: "", toDate: "", minDevices: "", maxDevices: ""});

    const handleAddingHardware =async (remote_id) =>{
        try {
            const {data, error: fetchErr} = await patchData(API.REMOTES+'/hardware/'+remote_id,{}, returnToken());
            if (fetchErr) throw new Error(fetchErr);
        }catch (error) {
            showNotification(error.message, 'error');
        }
    }

    const handleTestingHardware =async (remote_id) =>{
        try {
            const {data, error: fetchErr} = await fetchData(API.REMOTES+`/${remote_id}/buttons/test`, returnToken());
            if (fetchErr) throw new Error(fetchErr);
        }catch (error) {
            showNotification(error.message, 'error');
        }
    }

    const handleRemoteStatus = async (remote_id,isEnabled) =>{
        try {
            const {data, error: fetchErr} = await patchData(API.REMOTES+`/change-status/${remote_id}`,{isEnabled:!isEnabled} ,returnToken());
            if (fetchErr) throw new Error(fetchErr);
            window.location.reload();
        }catch (error) {
            showNotification(error.message, 'error');
        }
    }

    /* ---------- Render ---------- */
    return (
        <div className="p-6 bg-gray-50 min-h-screen text-gray-800">
            <nav className="mb-6">
                <div className="flex gap-2">
                    <TabButton active={activeTab === "users"} onClick={() => setActiveTab("users")}>
                        Users
                    </TabButton>
                    <TabButton active={activeTab === "remotes"} onClick={() => setActiveTab("remotes")}>
                        Remotes
                    </TabButton>
                    <TabButton active={activeTab === "extensions"} onClick={() => setActiveTab("extensions")}>
                        Extensions
                    </TabButton>
                </div>
            </nav>

            <section className="mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        />
                        <div className="text-sm text-gray-600">
                            Showing: <span className="font-medium capitalize">{activeTab}</span>
                        </div>
                    </div>
                </div>
            </section>

            <main>
                {error && <div className="p-3 mb-4 bg-red-50 text-red-700 border border-red-100 rounded">{error}</div>}

                {loading ? (
                    <div className="grid gap-4">
                        <PlaceholderCard/>
                        <PlaceholderCard/>
                        <PlaceholderCard/>
                    </div>
                ) : (
                    <>
                        {/* USERS */}
                        {activeTab === "users" && (
                            <div className="grid gap-4">
                                <div
                                    className="bg-white p-3 rounded-md border border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <select
                                            value={userFilters.plan}
                                            onChange={(e) => setUserFilters((s) => ({...s, plan: e.target.value}))}
                                            className="px-2 py-1 border border-gray-200 rounded bg-white text-sm"
                                        >
                                            <option value="all">Plan: All</option>
                                            <option value="free">Free</option>
                                            <option value="pro">Pro</option>
                                        </select>

                                        <div className="flex items-center gap-2">
                                            <label className="text-xs text-gray-500">Reg:</label>
                                            <input
                                                type="date"
                                                value={userFilters.fromDate}
                                                onChange={(e) => setUserFilters((s) => ({...s, fromDate: e.target.value}))}
                                                className="px-2 py-1 border border-gray-200 rounded bg-white text-sm"
                                            />
                                            <span className="text-xs text-gray-400">-</span>
                                            <input
                                                type="date"
                                                value={userFilters.toDate}
                                                onChange={(e) => setUserFilters((s) => ({...s, toDate: e.target.value}))}
                                                className="px-2 py-1 border border-gray-200 rounded bg-white text-sm"
                                            />
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <label className="text-xs text-gray-500">Devs:</label>
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="min"
                                                value={userFilters.minDevices}
                                                onChange={(e) => setUserFilters((s) => ({
                                                    ...s,
                                                    minDevices: e.target.value
                                                }))}
                                                className="w-16 px-2 py-1 border border-gray-200 rounded bg-white text-sm"
                                            />
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="max"
                                                value={userFilters.maxDevices}
                                                onChange={(e) => setUserFilters((s) => ({
                                                    ...s,
                                                    maxDevices: e.target.value
                                                }))}
                                                className="w-16 px-2 py-1 border border-gray-200 rounded bg-white text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button onClick={resetUserFilters}
                                                className="px-3 py-1 bg-gray-100 text-sm rounded hover:bg-gray-200">
                                            Reset
                                        </button>
                                        <div className="text-sm text-gray-600">{filteredUsers.length} users</div>
                                    </div>
                                </div>

                                {filteredUsers.length === 0 ? (
                                    <EmptyState message="No users found"/>
                                ) : (
                                    <div className="bg-white rounded border border-gray-100 overflow-hidden">
                                        <div
                                            className="hidden sm:grid grid-cols-7 gap-4 p-3 text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                                            <div className="col-span-2">User</div>
                                            <div>Email</div>
                                            <div>Plan</div>
                                            <div>Devices</div>
                                            <div>Registered</div>
                                            <div className="text-right">Actions</div>
                                        </div>

                                        <div>
                                            {filteredUsers.map((u) => {
                                                const devicesCount = (u.extensions?.length || 0) + (u.buttons?.length || 0);
                                                return (
                                                    <div key={u._id}
                                                         className="grid grid-cols-1 sm:grid-cols-7 gap-4 p-3 items-center border-b last:border-b-0">
                                                        <div className="flex items-center gap-3 col-span-2">
                                                            <div
                                                                className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">
                                                                {combineInitials(u.firstName, u.lastName)}
                                                            </div>
                                                            <div>
                                                                <div
                                                                    className="font-medium">{u.firstName} {u.lastName}</div>
                                                                <div
                                                                    className="text-xs text-gray-500">{u.phone || "—"}</div>
                                                            </div>
                                                        </div>

                                                        <div
                                                            className="text-sm text-gray-700 break-words">{u.email}</div>

                                                        <div className="text-sm text-gray-700">
                                                            <div
                                                                className="capitalize">{u.subscriptionPlan || "free"}</div>
                                                            <div
                                                                className="text-xs text-gray-400">{u.isVerified ? "Verified" : "Unverified"}</div>
                                                        </div>

                                                        <div className="text-sm text-gray-700">
                                                            <div>{devicesCount} device{devicesCount !== 1 ? "s" : ""}</div>
                                                            <div
                                                                className="text-xs text-gray-400">{(u.extensions?.length || 0)} ext
                                                                • {(u.buttons?.length || 0)} remotes
                                                            </div>
                                                        </div>

                                                        <div
                                                            className="text-sm text-gray-500">{formatDate(u.createdAt)}</div>

                                                        <div className="flex items-center justify-end gap-2">
                                                            <button onClick={() => copyToClipboard(u._id, "User ID")}
                                                                    className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200">
                                                                Copy ID
                                                            </button>
                                                            <button onClick={() => setSelectedUser(u)}
                                                                    className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700">
                                                                View
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* REMOTES (Previously Buttons) */}
                        {activeTab === "remotes" && (
                            <div className="grid gap-4">
                                <div className="bg-white p-3 rounded-md border border-gray-100 flex flex-col gap-3">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <select
                                            value={remoteFilters.state}
                                            onChange={(e) => setRemoteFilters((s) => ({...s, state: e.target.value}))}
                                            className="px-2 py-1 border border-gray-200 rounded bg-white text-sm"
                                        >
                                            <option value="all">Any state</option>
                                            <option value="instore">In store</option>
                                            <option value="sold">Sold</option>
                                        </select>

                                        <select
                                            value={remoteFilters.hasHardware}
                                            onChange={(e) => setRemoteFilters((s) => ({
                                                ...s,
                                                hasHardware: e.target.value
                                            }))}
                                            className="px-2 py-1 border border-gray-200 rounded bg-white text-sm"
                                        >
                                            <option value="all">Hardware: Any</option>
                                            <option value="yes">Has hardware</option>
                                            <option value="no">No hardware</option>
                                        </select>

                                        <select
                                            value={remoteFilters.modelType}
                                            onChange={(e) => setRemoteFilters((s) => ({
                                                ...s,
                                                modelType: e.target.value
                                            }))}
                                            className="px-2 py-1 border border-gray-200 rounded bg-white text-sm"
                                        >
                                            <option value="all">Any model</option>
                                            <option value="lite">lite</option>
                                            <option value="max">max</option>
                                            <option value="pro">pro</option>
                                        </select>

                                        <select
                                            value={remoteFilters.owner}
                                            onChange={(e) => setRemoteFilters((s) => ({...s, owner: e.target.value}))}
                                            className="px-2 py-1 border border-gray-200 rounded bg-white text-sm"
                                        >
                                            <option value="all">Any owner</option>
                                            <option value="assigned">Assigned</option>
                                            <option value="unassigned">Unassigned</option>
                                        </select>

                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                placeholder="min $"
                                                value={remoteFilters.priceMin}
                                                onChange={(e) => setRemoteFilters((s) => ({
                                                    ...s,
                                                    priceMin: e.target.value
                                                }))}
                                                className="w-20 px-2 py-1 border border-gray-200 rounded bg-white text-sm"
                                            />
                                            <input
                                                type="number"
                                                placeholder="max $"
                                                value={remoteFilters.priceMax}
                                                onChange={(e) => setRemoteFilters((s) => ({
                                                    ...s,
                                                    priceMax: e.target.value
                                                }))}
                                                className="w-20 px-2 py-1 border border-gray-200 rounded bg-white text-sm"
                                            />
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <label className="text-xs text-gray-500">Date:</label>
                                            <input
                                                type="date"
                                                value={remoteFilters.fromDate}
                                                onChange={(e) => setRemoteFilters((s) => ({
                                                    ...s,
                                                    fromDate: e.target.value
                                                }))}
                                                className="px-2 py-1 border border-gray-200 rounded bg-white text-sm"
                                            />
                                            <input
                                                type="date"
                                                value={remoteFilters.toDate}
                                                onChange={(e) => setRemoteFilters((s) => ({
                                                    ...s,
                                                    toDate: e.target.value
                                                }))}
                                                className="px-2 py-1 border border-gray-200 rounded bg-white text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-600 hidden sm:block">
                                            {remoteStats.total} remotes • {remoteStats.sold} sold
                                            • {remoteStats.instore} in store • {remoteStats.withHardware} w/ hardware
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setModalOpen(true)}
                                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                            >
                                                Add Remote
                                            </button>
                                            <button onClick={resetRemoteFilters}
                                                    className="px-3 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200">Reset
                                            </button>
                                            <div className="text-sm text-gray-600">{filteredRemotes.length} found
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <AddRemoteModal
                                    isOpen={isModalOpen}
                                    onClose={() => setModalOpen(false)}
                                    onCreated={handleRemoteCreated}
                                />

                                {filteredRemotes.length === 0 ? (
                                    <EmptyState message="No remotes found"/>
                                ) : (
                                    <div className="bg-white rounded border border-gray-100 overflow-hidden">
                                        <div
                                            className="hidden sm:grid grid-cols-11 gap-4 p-3 text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                                            <div className="col-span-3">Serial Number / Manufacture</div>
                                            <div>Model</div>
                                            <div>Buttons</div>
                                            <div>State</div>
                                            <div>Hardware</div>
                                            <div className="col-span-2">Owner</div>
                                            <div>Created</div>
                                            <div className="text-right">Actions</div>
                                        </div>

                                        <div>
                                            {filteredRemotes.map((r) => (
                                                <div key={r._id}
                                                     className="grid grid-cols-1 sm:grid-cols-11 gap-4 p-3 items-center border-b last:border-b-0">
                                                    <div className="col-span-3">
                                                        <div className="font-medium text-sm">{r.serialNumber}</div>
                                                        <div className="text-xs text-gray-500">{r.manufacture}</div>
                                                    </div>

                                                    <div className="text-sm text-gray-700 capitalize">{r.modelType}</div>

                                                    {/* Display Count of buttons instead of specific button details */}
                                                    <div className="text-sm text-gray-700">
                                                        {r.buttons?.length || 0} buttons
                                                    </div>

                                                    <div className="text-sm text-gray-700 capitalize">{r.state}</div>

                                                    <div className="text-sm text-gray-700">{r.hasHardware ? "Yes" : "No"}</div>

                                                    <div className="text-sm text-gray-700 col-span-2">
                                                        {typeof r.owner === "object" ? getOwnerLabel(r.owner) : r.owner || "—"}
                                                    </div>

                                                    <div
                                                        className="text-sm text-gray-500">{formatDate(r.createdAt)}</div>

                                                    <div className="flex items-center justify-end gap-2">
                                                        <button onClick={() => copyToClipboard(r._id, "Remote ID")}
                                                                className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200">Copy
                                                            ID
                                                        </button>
                                                        <button onClick={() => setSelectedRemote(r)}
                                                                className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700">View
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* EXTENSIONS */}
                        {activeTab === "extensions" && (
                            <div className="grid gap-4">
                                <div className="bg-white p-3 rounded-md border border-gray-100 flex flex-col gap-3">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <select
                                            value={extensionFilters.modelType}
                                            onChange={(e) => setExtensionFilters((s) => ({
                                                ...s,
                                                modelType: e.target.value
                                            }))}
                                            className="px-2 py-1 border border-gray-200 rounded bg-white text-sm"
                                        >
                                            <option value="all">Any model</option>
                                            <option value="lite">lite</option>
                                            <option value="sense">sense</option>
                                            <option value="dual">dual</option>
                                            <option value="pro">pro</option>
                                        </select>

                                        <select
                                            value={extensionFilters.state}
                                            onChange={(e) => setExtensionFilters((s) => ({
                                                ...s,
                                                state: e.target.value
                                            }))}
                                            className="px-2 py-1 border border-gray-200 rounded bg-white text-sm"
                                        >
                                            <option value="all">Any status</option>
                                            <option value="active">active</option>
                                            <option value="inactive">inactive</option>
                                        </select>

                                        <select
                                            value={extensionFilters.owner}
                                            onChange={(e) => setExtensionFilters((s) => ({
                                                ...s,
                                                owner: e.target.value
                                            }))}
                                            className="px-2 py-1 border border-gray-200 rounded bg-white text-sm"
                                        >
                                            <option value="all">Any owner</option>
                                            <option value="assigned">Assigned</option>
                                            <option value="unassigned">Unassigned</option>
                                        </select>

                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                placeholder="min ports"
                                                value={extensionFilters.minPorts}
                                                onChange={(e) => setExtensionFilters((s) => ({
                                                    ...s,
                                                    minPorts: e.target.value
                                                }))}
                                                className="w-20 px-2 py-1 border border-gray-200 rounded bg-white text-sm"
                                            />
                                            <input
                                                type="number"
                                                placeholder="max ports"
                                                value={extensionFilters.maxPorts}
                                                onChange={(e) => setExtensionFilters((s) => ({
                                                    ...s,
                                                    maxPorts: e.target.value
                                                }))}
                                                className="w-20 px-2 py-1 border border-gray-200 rounded bg-white text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-600">Extensions: {extensions.length}</div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={resetExtensionFilters}
                                                    className="px-3 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200">Reset
                                            </button>
                                            <div className="text-sm text-gray-600">{filteredExtensions.length} shown
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {filteredExtensions.length === 0 ? (
                                    <EmptyState message="No extensions found"/>
                                ) : (
                                    <div className="bg-white rounded border border-gray-100 overflow-hidden">
                                        <div
                                            className="hidden sm:grid grid-cols-9 gap-4 p-3 text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                                            <div className="col-span-2">Label - Ports</div>
                                            <div>Model</div>
                                            <div>State</div>
                                            <div className="col-span-2">Owner</div>
                                            <div className="text-right">Actions</div>
                                        </div>

                                        <div>
                                            {filteredExtensions.map((ext) => (
                                                <div key={ext._id}
                                                     className="grid grid-cols-1 sm:grid-cols-9 gap-4 p-3 items-center border-b last:border-b-0">
                                                    <div className="col-span-2">
                                                        <div
                                                            className="font-medium text-sm">{ext.labelName} - {(ext.ports?.length || 0)}</div>
                                                        <div className="text-xs text-gray-500">{ext.serialNumber}</div>
                                                    </div>

                                                    <div
                                                        className="text-sm text-gray-700 capitalize">{ext.modelType}</div>

                                                    <div className="text-sm text-gray-700 capitalize">{ext.status}</div>

                                                    <div className="text-sm text-gray-700 col-span-2">
                                                        {typeof ext.owner === "object" ? getOwnerLabel(ext.owner) : ext.owner || "—"}
                                                    </div>

                                                    <div
                                                        className="text-sm text-gray-500">{formatDate(ext.createdAt)}</div>

                                                    <div className="flex items-center justify-end gap-2">
                                                        <button onClick={() => copyToClipboard(ext._id, "Extension ID")}
                                                                className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200">Copy
                                                            ID
                                                        </button>
                                                        <button onClick={() => setSelectedExtension(ext)}
                                                                className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700">View
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Modals */}
            {selectedUser && <UserModal user={selectedUser} onClose={() => setSelectedUser(null)}
                                        copyToClipboard={copyToClipboard}/>}

            {/* Switched ButtonModal to RemoteDetailsModal */}
            {selectedRemote && <RemoteDetailsModal remote={selectedRemote} onClose={() => setSelectedRemote(null)}
                                            copyToClipboard={copyToClipboard} handleAddHadware={handleAddingHardware} handleTestingHardware={handleTestingHardware} handleRemoteStatus={handleRemoteStatus}/> }

            {selectedExtension &&
                <ExtensionModal extension={selectedExtension} onClose={() => setSelectedExtension(null)}
                                copyToClipboard={copyToClipboard}/>}

        </div>
    );
}

/* ---------- Small helpers & components ---------- */

function TabButton({children, active, onClick}) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-md text-sm font-medium ${active ? "bg-white border border-gray-200 shadow-sm" : "bg-transparent text-gray-600 hover:bg-white hover:border"}`}
        >
            {children}
        </button>
    );
}


function PlaceholderCard() {
    return (
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-2/5 mb-3"></div>
            <div className="h-3 bg-gray-200 rounded w-3/5 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
    );
}

function EmptyState({message}) {
    return (
        <div className="bg-white p-6 rounded-lg border border-gray-100 text-center text-gray-500">
            {message}
        </div>
    );
}


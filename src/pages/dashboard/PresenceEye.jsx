import React, { useEffect, useMemo, useState } from "react";
import { fetchData, returnToken } from "../../utils/helper.js";
import { presence_server } from "../../config/server_api.js";

const API = {
  USERS_WITH_DEVICES: presence_server + "/users/more",
  USERS_SUMMARY: presence_server + "/users/no-more",
  EXTENSIONS: presence_server + "/extensions/extensions",
  BUTTONS: presence_server + "/buttons",
};

export default function PresenceEyeAdmin() {
  const [activeTab, setActiveTab] = useState("users"); // users | buttons | extensions

  const [users, setUsers] = useState([]);
  const [buttons, setButtons] = useState([]);
  const [extensions, setExtensions] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [buttonFilters, setButtonFilters] = useState({
    state: "all", // all | instore | sold
    hasHardware: "all", // all | yes | no
    modelType: "all",
    buttonType: "all", // all | rocker | push  <-- NEW
    owner: "all", // all | assigned | unassigned
    priceMin: "",
    priceMax: "",
    fromDate: "",
    toDate: "",
  });

  const [extensionFilters, setExtensionFilters] = useState({
    modelType: "all",
    state: "all", // all | active | inactive
    owner: "all", // all | assigned | unassigned
    minPorts: "",
    maxPorts: "",
    fromDate: "",
    toDate: "",
  });

  // user filters unchanged
  const [userFilters, setUserFilters] = useState({
    plan: "all", // all | free | pro
    fromDate: "",
    toDate: "",
    minDevices: "",
    maxDevices: "",
  });

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedButton, setSelectedButton] = useState(null);
  const [selectedExtension, setSelectedExtension] = useState(null);
  const [toast, setToast] = useState(null);

  const token = useMemo(() => returnToken(), []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        if (activeTab === "users") {
          const { data, error: fetchErr } = await fetchData(API.USERS_WITH_DEVICES, token);
          if (fetchErr) throw new Error(fetchErr);
          setUsers(Array.isArray(data) ? data : []);
        } else if (activeTab === "buttons") {
          const { data, error: fetchErr } = await fetchData(API.BUTTONS, token);
          if (fetchErr) throw new Error(fetchErr);
          setButtons(Array.isArray(data) ? data : []);
        } else if (activeTab === "extensions") {
          const { data, error: fetchErr } = await fetchData(API.EXTENSIONS, token);
          if (fetchErr) throw new Error(fetchErr);
          setExtensions(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [activeTab, token]);

  const copyToClipboard = async (text, label = "copied") => {
    try {
      await navigator.clipboard.writeText(String(text));
      setToast(`${label} copied to clipboard`);
      setTimeout(() => setToast(null), 2000);
    } catch (err) {
      setToast("Failed to copy");
      setTimeout(() => setToast(null), 2000);
    }
  };

  /* ---------- Filters & derived lists ---------- */

  const filteredButtons = useMemo(() => {
    let list = buttons || [];

    // search across some common fields
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (b) =>
          (b.labelName || "").toLowerCase().includes(q) ||
          (b.serialNumber || "").toLowerCase().includes(q) ||
          (b.manufacture || "").toLowerCase().includes(q)
      );
    }

    if (buttonFilters.state !== "all") {
      list = list.filter((b) => b.state === buttonFilters.state);
    }
    if (buttonFilters.hasHardware !== "all") {
      const want = buttonFilters.hasHardware === "yes";
      list = list.filter((b) => Boolean(b.hasHardware) === want);
    }
    if (buttonFilters.modelType !== "all") {
      list = list.filter((b) => b.modelType === buttonFilters.modelType);
    }

    // NEW: filter by buttonType
    if (buttonFilters.buttonType !== "all") {
      list = list.filter((b) => b.buttonType === buttonFilters.buttonType);
    }

    if (buttonFilters.owner !== "all") {
      if (buttonFilters.owner === "assigned") list = list.filter((b) => !!b.owner);
      else list = list.filter((b) => !b.owner);
    }

    const pMin = Number(buttonFilters.priceMin || 0);
    const pMax = buttonFilters.priceMax ? Number(buttonFilters.priceMax) : null;
    if (buttonFilters.priceMin || buttonFilters.priceMax) {
      list = list.filter((b) => {
        const price = Number(b.price || 0);
        if (buttonFilters.priceMin && price < pMin) return false;
        if (buttonFilters.priceMax && pMax !== null && price > pMax) return false;
        return true;
      });
    }

    if (buttonFilters.fromDate || buttonFilters.toDate) {
      list = list.filter((b) => {
        const created = new Date(b.createdAt || b.created || 0);
        if (buttonFilters.fromDate) {
          const from = new Date(buttonFilters.fromDate + "T00:00:00");
          if (created < from) return false;
        }
        if (buttonFilters.toDate) {
          const to = new Date(buttonFilters.toDate + "T23:59:59");
          if (created > to) return false;
        }
        return true;
      });
    }

    return list;
  }, [buttons, buttonFilters, search]);

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
        const count = (u.extensions?.length || 0) + (u.buttons?.length || 0);
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

  const buttonStats = useMemo(() => {
    const total = buttons.length;
    const sold = buttons.filter((b) => b.state === "sold").length;
    const instore = buttons.filter((b) => b.state === "instore").length;
    const withHardware = buttons.filter((b) => b.hasHardware).length;
    const byModel = buttons.reduce((acc, cur) => {
      acc[cur.modelType] = (acc[cur.modelType] || 0) + 1;
      return acc;
    }, {});
    return { total, sold, instore, withHardware, byModel };
  }, [buttons]);

  const resetButtonFilters = () =>
    setButtonFilters({
      state: "all",
      hasHardware: "all",
      modelType: "all",
      buttonType: "all",
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
    setUserFilters({ plan: "all", fromDate: "", toDate: "", minDevices: "", maxDevices: "" });

  /* ---------- Render ---------- */
  return (
    <div className="p-6 bg-gray-50 min-h-screen text-gray-800">
      <nav className="mb-6">
        <div className="flex gap-2">
          <TabButton active={activeTab === "users"} onClick={() => setActiveTab("users")}>
            Users
          </TabButton>
          <TabButton active={activeTab === "buttons"} onClick={() => setActiveTab("buttons")}>
            Buttons
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
              placeholder="Search users, buttons or extensions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <div className="text-sm text-gray-600">
              Showing: <span className="font-medium">{activeTab}</span>
            </div>
          </div>

          {activeTab === "buttons" && (
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={buttonFilters.state}
                onChange={(e) => setButtonFilters((s) => ({ ...s, state: e.target.value }))}
                className="px-3 py-2 border border-gray-200 rounded-md bg-white text-sm"
              >
                <option value="all">Any state</option>
                <option value="instore">In store</option>
                <option value="sold">Sold</option>
              </select>

              <select
                value={buttonFilters.hasHardware}
                onChange={(e) => setButtonFilters((s) => ({ ...s, hasHardware: e.target.value }))}
                className="px-3 py-2 border border-gray-200 rounded-md bg-white text-sm"
              >
                <option value="all">Hardware: Any</option>
                <option value="yes">Has hardware</option>
                <option value="no">No hardware</option>
              </select>

              <select
                value={buttonFilters.modelType}
                onChange={(e) => setButtonFilters((s) => ({ ...s, modelType: e.target.value }))}
                className="px-3 py-2 border border-gray-200 rounded-md bg-white text-sm"
              >
                <option value="all">Any model</option>
                <option value="lite">lite</option>
                <option value="max">max</option>
                <option value="pro">pro</option>
              </select>

              {/* NEW: buttonType filter */}
              <select
                value={buttonFilters.buttonType}
                onChange={(e) => setButtonFilters((s) => ({ ...s, buttonType: e.target.value }))}
                className="px-3 py-2 border border-gray-200 rounded-md bg-white text-sm"
              >
                <option value="all">Any type</option>
                <option value="rocker">rocker</option>
                <option value="push">push</option>
              </select>
            </div>
          )}
        </div>
      </section>

      <main>
        {error && <div className="p-3 mb-4 bg-red-50 text-red-700 border border-red-100 rounded">{error}</div>}

        {loading ? (
          <div className="grid gap-4">
            <PlaceholderCard />
            <PlaceholderCard />
            <PlaceholderCard />
          </div>
        ) : (
          <>
            {/* USERS (unchanged row layout from previous) */}
            {activeTab === "users" && (
              <div className="grid gap-4">
                <div className="bg-white p-3 rounded-md border border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <label className="text-xs text-gray-500">Plan</label>
                    <select
                      value={userFilters.plan}
                      onChange={(e) => setUserFilters((s) => ({ ...s, plan: e.target.value }))}
                      className="px-2 py-1 border border-gray-200 rounded bg-white text-sm"
                    >
                      <option value="all">All</option>
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                    </select>

                    <label className="text-xs text-gray-500">Registered from</label>
                    <input
                      type="date"
                      value={userFilters.fromDate}
                      onChange={(e) => setUserFilters((s) => ({ ...s, fromDate: e.target.value }))}
                      className="px-2 py-1 border border-gray-200 rounded bg-white text-sm"
                    />

                    <label className="text-xs text-gray-500">to</label>
                    <input
                      type="date"
                      value={userFilters.toDate}
                      onChange={(e) => setUserFilters((s) => ({ ...s, toDate: e.target.value }))}
                      className="px-2 py-1 border border-gray-200 rounded bg-white text-sm"
                    />

                    <label className="text-xs text-gray-500">Devices between</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="min"
                      value={userFilters.minDevices}
                      onChange={(e) => setUserFilters((s) => ({ ...s, minDevices: e.target.value }))}
                      className="w-20 px-2 py-1 border border-gray-200 rounded bg-white text-sm"
                    />
                    <input
                      type="number"
                      min="0"
                      placeholder="max"
                      value={userFilters.maxDevices}
                      onChange={(e) => setUserFilters((s) => ({ ...s, maxDevices: e.target.value }))}
                      className="w-20 px-2 py-1 border border-gray-200 rounded bg-white text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={resetUserFilters} className="px-3 py-1 bg-gray-100 text-sm rounded hover:bg-gray-200">
                      Reset
                    </button>
                    <div className="text-sm text-gray-600">{filteredUsers.length} users</div>
                  </div>
                </div>

                {filteredUsers.length === 0 ? (
                  <EmptyState message="No users found" />
                ) : (
                  <div className="bg-white rounded border border-gray-100 overflow-hidden">
                    <div className="hidden sm:grid grid-cols-7 gap-4 p-3 text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
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
                          <div key={u._id} className="grid grid-cols-1 sm:grid-cols-7 gap-4 p-3 items-center border-b last:border-b-0">
                            <div className="flex items-center gap-3 col-span-2">
                              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">
                                {getInitials(u.firstName, u.lastName)}
                              </div>
                              <div>
                                <div className="font-medium">{u.firstName} {u.lastName}</div>
                                <div className="text-xs text-gray-500">{u.phone || "—"}</div>
                              </div>
                            </div>

                            <div className="text-sm text-gray-700 break-words">{u.email}</div>

                            <div className="text-sm text-gray-700">
                              <div className="capitalize">{u.subscriptionPlan || "free"}</div>
                              <div className="text-xs text-gray-400">{u.isVerified ? "Verified" : "Unverified"}</div>
                            </div>

                            <div className="text-sm text-gray-700">
                              <div>{devicesCount} device{devicesCount !== 1 ? "s" : ""}</div>
                              <div className="text-xs text-gray-400">{(u.extensions?.length || 0)} ext • {(u.buttons?.length || 0)} btns</div>
                            </div>

                            <div className="text-sm text-gray-500">{formatDate(u.createdAt)}</div>

                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => copyToClipboard(u._id, "User ID")} className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200">
                                Copy ID
                              </button>
                              <button onClick={() => setSelectedUser(u)} className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700">
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

            {/* BUTTONS - row layout + filters */}
            {activeTab === "buttons" && (
              <div className="grid gap-4">
                <div className="bg-white p-3 rounded-md border border-gray-100 flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <select
                      value={buttonFilters.state}
                      onChange={(e) => setButtonFilters((s) => ({ ...s, state: e.target.value }))}
                      className="px-2 py-1 border border-gray-200 rounded bg-white text-sm"
                    >
                      <option value="all">Any state</option>
                      <option value="instore">In store</option>
                      <option value="sold">Sold</option>
                    </select>

                    <select
                      value={buttonFilters.hasHardware}
                      onChange={(e) => setButtonFilters((s) => ({ ...s, hasHardware: e.target.value }))}
                      className="px-2 py-1 border border-gray-200 rounded bg-white text-sm"
                    >
                      <option value="all">Hardware: Any</option>
                      <option value="yes">Has hardware</option>
                      <option value="no">No hardware</option>
                    </select>

                    <select
                      value={buttonFilters.modelType}
                      onChange={(e) => setButtonFilters((s) => ({ ...s, modelType: e.target.value }))}
                      className="px-2 py-1 border border-gray-200 rounded bg-white text-sm"
                    >
                      <option value="all">Any model</option>
                      <option value="lite">lite</option>
                      <option value="max">max</option>
                      <option value="pro">pro</option>
                    </select>

                    <select
                      value={buttonFilters.buttonType}
                      onChange={(e) => setButtonFilters((s) => ({ ...s, buttonType: e.target.value }))}
                      className="px-2 py-1 border border-gray-200 rounded bg-white text-sm"
                    >
                      <option value="all">Any type</option>
                      <option value="rocker">rocker</option>
                      <option value="push">push</option>
                    </select>

                    <select
                      value={buttonFilters.owner}
                      onChange={(e) => setButtonFilters((s) => ({ ...s, owner: e.target.value }))}
                      className="px-2 py-1 border border-gray-200 rounded bg-white text-sm"
                    >
                      <option value="all">Any owner</option>
                      <option value="assigned">Assigned</option>
                      <option value="unassigned">Unassigned</option>
                    </select>

                    <input
                      type="number"
                      placeholder="min $"
                      value={buttonFilters.priceMin}
                      onChange={(e) => setButtonFilters((s) => ({ ...s, priceMin: e.target.value }))}
                      className="w-24 px-2 py-1 border border-gray-200 rounded bg-white text-sm"
                    />
                    <input
                      type="number"
                      placeholder="max $"
                      value={buttonFilters.priceMax}
                      onChange={(e) => setButtonFilters((s) => ({ ...s, priceMax: e.target.value }))}
                      className="w-24 px-2 py-1 border border-gray-200 rounded bg-white text-sm"
                    />

                    <label className="text-xs text-gray-500">Registered</label>
                    <input
                      type="date"
                      value={buttonFilters.fromDate}
                      onChange={(e) => setButtonFilters((s) => ({ ...s, fromDate: e.target.value }))}
                      className="px-2 py-1 border border-gray-200 rounded bg-white text-sm"
                    />
                    <input
                      type="date"
                      value={buttonFilters.toDate}
                      onChange={(e) => setButtonFilters((s) => ({ ...s, toDate: e.target.value }))}
                      className="px-2 py-1 border border-gray-200 rounded bg-white text-sm"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {buttonStats.total} total • {buttonStats.sold} sold • {buttonStats.instore} in store • {buttonStats.withHardware} with hardware
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={resetButtonFilters} className="px-3 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200">Reset</button>
                      <div className="text-sm text-gray-600">{filteredButtons.length} buttons</div>
                    </div>
                  </div>
                </div>

                {filteredButtons.length === 0 ? (
                  <EmptyState message="No buttons found" />
                ) : (
                  <div className="bg-white rounded border border-gray-100 overflow-hidden">
                    <div className="hidden sm:grid grid-cols-11 gap-4 p-3 text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                      <div className="col-span-2">Label</div>
                      <div>Model</div>
                      <div>Type</div>
                      <div>State</div>
                      <div>Hardware</div>
                      <div className="col-span-2">Owner</div>
                      <div>Created</div>
                      <div className="text-right">Actions</div>
                    </div>

                    <div>
                      {filteredButtons.map((b) => (
                        <div key={b._id} className="grid grid-cols-1 sm:grid-cols-11 gap-4 p-3 items-center border-b last:border-b-0">
                          <div className="col-span-2">
                            <div className="font-medium text-sm">{b.labelName}</div>
                            <div className="text-xs text-gray-500">{b.serialNumber}</div>
                          </div>

                          <div className="text-sm text-gray-700 capitalize">{b.modelType}</div>

                          <div className="text-sm text-gray-700 capitalize">{b.buttonType || "—"}</div>

                          <div className="text-sm text-gray-700 capitalize">{b.state}</div>

                          <div className="text-sm text-gray-700">{b.hasHardware ? "Yes" : "No"}</div>

                          <div className="text-sm text-gray-700 col-span-2">
                            {typeof b.owner === "object" ? getOwnerLabel(b.owner) : b.owner || "—"}
                          </div>

                          <div className="text-sm text-gray-500">{formatDate(b.createdAt)}</div>

                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => copyToClipboard(b._id, "Button ID")} className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200">Copy ID</button>
                            <button onClick={() => setSelectedButton(b)} className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700">View</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* EXTENSIONS - row layout + filters */}
            {activeTab === "extensions" && (
              <div className="grid gap-4">
                <div className="bg-white p-3 rounded-md border border-gray-100 flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <select
                      value={extensionFilters.modelType}
                      onChange={(e) => setExtensionFilters((s) => ({ ...s, modelType: e.target.value }))}
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
                      onChange={(e) => setExtensionFilters((s) => ({ ...s, state: e.target.value }))}
                      className="px-2 py-1 border border-gray-200 rounded bg-white text-sm"
                    >
                      <option value="all">Any status</option>
                      <option value="active">active</option>
                      <option value="inactive">inactive</option>
                    </select>

                    <select
                      value={extensionFilters.owner}
                      onChange={(e) => setExtensionFilters((s) => ({ ...s, owner: e.target.value }))}
                      className="px-2 py-1 border border-gray-200 rounded bg-white text-sm"
                    >
                      <option value="all">Any owner</option>
                      <option value="assigned">Assigned</option>
                      <option value="unassigned">Unassigned</option>
                    </select>

                    <input
                      type="number"
                      placeholder="min ports"
                      value={extensionFilters.minPorts}
                      onChange={(e) => setExtensionFilters((s) => ({ ...s, minPorts: e.target.value }))}
                      className="w-24 px-2 py-1 border border-gray-200 rounded bg-white text-sm"
                    />
                    <input
                      type="number"
                      placeholder="max ports"
                      value={extensionFilters.maxPorts}
                      onChange={(e) => setExtensionFilters((s) => ({ ...s, maxPorts: e.target.value }))}
                      className="w-24 px-2 py-1 border border-gray-200 rounded bg-white text-sm"
                    />

                    <label className="text-xs text-gray-500">Registered</label>
                    <input
                      type="date"
                      value={extensionFilters.fromDate}
                      onChange={(e) => setExtensionFilters((s) => ({ ...s, fromDate: e.target.value }))}
                      className="px-2 py-1 border border-gray-200 rounded bg-white text-sm"
                    />
                    <input
                      type="date"
                      value={extensionFilters.toDate}
                      onChange={(e) => setExtensionFilters((s) => ({ ...s, toDate: e.target.value }))}
                      className="px-2 py-1 border border-gray-200 rounded bg-white text-sm"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">Extensions: {extensions.length}</div>
                    <div className="flex items-center gap-2">
                      <button onClick={resetExtensionFilters} className="px-3 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200">Reset</button>
                      <div className="text-sm text-gray-600">{filteredExtensions.length} shown</div>
                    </div>
                  </div>
                </div>

                {filteredExtensions.length === 0 ? (
                  <EmptyState message="No extensions found" />
                ) : (
                  <div className="bg-white rounded border border-gray-100 overflow-hidden">
                    <div className="hidden sm:grid grid-cols-9 gap-4 p-3 text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                      <div className="col-span-2">Label - Ports</div>
                      <div>Model</div>
                      <div>State</div>
                      <div className="col-span-2">Owner</div>
                      <div className="text-right">Actions</div>
                    </div>

                    <div>
                      {filteredExtensions.map((ext) => (
                        <div key={ext._id} className="grid grid-cols-1 sm:grid-cols-9 gap-4 p-3 items-center border-b last:border-b-0">
                          <div className="col-span-2">
                            <div className="font-medium text-sm">{ext.labelName} - {(ext.ports?.length || 0)}</div>
                            <div className="text-xs text-gray-500">{ext.serialNumber}</div>
                          </div>

                          <div className="text-sm text-gray-700 capitalize">{ext.modelType}</div>

                          <div className="text-sm text-gray-700 capitalize">{ext.status}</div>

                          <div className="text-sm text-gray-700 col-span-2">
                            {typeof ext.owner === "object" ? getOwnerLabel(ext.owner) : ext.owner || "—"}
                          </div>

                          <div className="text-sm text-gray-500">{formatDate(ext.createdAt)}</div>

                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => copyToClipboard(ext._id, "Extension ID")} className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200">Copy ID</button>
                            <button onClick={() => setSelectedExtension(ext)} className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700">View</button>
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
      {selectedUser && <UserModal user={selectedUser} onClose={() => setSelectedUser(null)} copyToClipboard={copyToClipboard} />}
      {selectedButton && <ButtonModal button={selectedButton} onClose={() => setSelectedButton(null)} copyToClipboard={copyToClipboard} />}
      {selectedExtension && <ExtensionModal extension={selectedExtension} onClose={() => setSelectedExtension(null)} copyToClipboard={copyToClipboard} />}

      {toast && <div className="fixed right-4 bottom-4 bg-black/80 text-white px-4 py-2 rounded-md text-sm">{toast}</div>}
    </div>
  );
}

/* ---------- Small helpers & components ---------- */

function TabButton({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md text-sm font-medium ${active ? "bg-white border border-gray-200 shadow-sm" : "bg-transparent text-gray-600 hover:bg-white hover:border"}`}
    >
      {children}
    </button>
  );
}

function Stat({ label, value }) {
  return (
    <div className="text-sm">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
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

function EmptyState({ message }) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-100 text-center text-gray-500">
      {message}
    </div>
  );
}

function getInitials(first, last) {
  const f = (first || "").charAt(0).toUpperCase() || "";
  const l = (last || "").charAt(0).toUpperCase() || "";
  return (f + l) || "?";
}

function formatDate(d) {
  if (!d) return "—";
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString();
  } catch {
    return d;
  }
}

function getOwnerLabel(owner) {
  if (!owner) return "—";
  if (typeof owner === "string") return owner;
  if (owner.email) return owner.email;
  if (owner.firstName || owner.lastName) return `${owner.firstName || ""} ${owner.lastName || ""}`.trim();
  return owner._id || "owner";
}

/* ---------- Modals ---------- */

function UserModal({ user, onClose, copyToClipboard }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="relative z-50 w-full max-w-3xl bg-white rounded-lg shadow-lg overflow-auto max-h-[90vh]">
        <div className="flex items-start justify-between p-4 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-semibold">{user.firstName} {user.lastName}</h3>
            <div className="text-sm text-gray-500">{user.email} • {user.phone || "No phone"}</div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-500">Status: <span className="font-medium ml-1">{user.status}</span></div>
            <button onClick={onClose} className="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200">Close</button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <section>
            <h4 className="text-sm font-medium mb-2">Profile</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="text-sm text-gray-700"><span className="text-gray-500">Email:</span> {user.email}</div>
              <div className="text-sm text-gray-700"><span className="text-gray-500">Phone:</span> {user.phone || "—"}</div>
              <div className="text-sm text-gray-700"><span className="text-gray-500">Plan:</span> {user.subscriptionPlan}</div>
              <div className="text-sm text-gray-700"><span className="text-gray-500">Verified:</span> {user.isVerified ? "Yes" : "No"}</div>
            </div>
          </section>

          <section>
            <h4 className="text-sm font-medium mb-2">Buttons</h4>
            <div className="grid gap-2">
              {(user.buttons || []).length === 0 ? (
                <div className="text-sm text-gray-400">No buttons</div>
              ) : (
                (user.buttons || []).map((b) => (
                  <div key={b._id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <div>
                      <div className="text-sm font-medium">{b.labelName}</div>
                      <div className="text-xs text-gray-500">{b.serialNumber}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-gray-500">{b.modelType}</div>
                      <button onClick={() => copyToClipboard(b._id, "Button ID")} className="px-2 py-1 text-xs rounded bg-white border border-gray-200 hover:bg-gray-100">Copy ID</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section>
            <h4 className="text-sm font-medium mb-2">Extensions</h4>
            <div className="grid gap-3">
              {(user.extensions || []).length === 0 ? (
                <div className="text-sm text-gray-400">No extensions</div>
              ) : (
                (user.extensions || []).map((ext) => (
                  <div key={ext._id} className="bg-gray-50 p-3 rounded">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">{ext.labelName}</div>
                        <div className="text-xs text-gray-500">{ext.serialNumber}</div>
                        <div className="text-xs text-gray-500">Model: {ext.modelType} • Price: ${ext.price}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button onClick={() => copyToClipboard(ext._id, "Extension ID")} className="px-2 py-1 text-xs rounded bg-white border border-gray-200 hover:bg-gray-100">Copy ID</button>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="text-xs text-gray-500 mb-2">Ports</div>
                      <div className="grid gap-2">
                        {(ext.ports || []).length === 0 ? (
                          <div className="text-sm text-gray-400">No ports</div>
                        ) : (
                          (ext.ports || []).map((p) => (
                            <div key={p._id} className="flex items-center justify-between bg-white p-2 rounded border border-gray-100">
                              <div>
                                <div className="text-sm">{p.labelName}</div>
                                <div className="text-xs text-gray-500">Pin: {p.pinNumber} • {p.configuration}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-xs text-gray-500">{p.status ? "Active" : "Inactive"}</div>
                                <button onClick={() => copyToClipboard(p._id, "Port ID")} className="px-2 py-1 text-xs rounded bg-white border border-gray-200 hover:bg-gray-100">Copy</button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
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

function ButtonModal({ button, onClose, copyToClipboard }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="relative z-50 w-full max-w-2xl bg-white rounded-lg shadow-lg overflow-auto max-h-[90vh]">
        <div className="flex items-start justify-between p-4 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-semibold">{button.labelName}</h3>
            <div className="text-sm text-gray-500">{button.serialNumber}</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-500">State: <span className="font-medium ml-1">{button.state}</span></div>
            <button onClick={onClose} className="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200">Close</button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="text-sm text-gray-700"><span className="text-gray-500">Model:</span> {button.modelType}</div>
            <div className="text-sm text-gray-700"><span className="text-gray-500">Price:</span> ${button.price ?? "—"}</div>
            <div className="text-sm text-gray-700"><span className="text-gray-500">Has hardware:</span> {button.hasHardware ? "Yes" : "No"}</div>
            <div className="text-sm text-gray-700"><span className="text-gray-500">Owner:</span> {typeof button.owner === "object" ? getOwnerLabel(button.owner) : button.owner || "—"}</div>
            <div className="text-sm text-gray-700"><span className="text-gray-500">Button Type:</span> {button.buttonType || "—"}</div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Metadata</h4>
            <div className="text-sm text-gray-600">Manufacture: {button.manufacture}</div>
            <div className="text-sm text-gray-600">Version: {button.version}</div>
            <div className="text-sm text-gray-600">Created: {formatDate(button.createdAt)}</div>
            <div className="mt-2">
              <button onClick={() => copyToClipboard(button._id, "Button ID")} className="px-3 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200">Copy Button ID</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExtensionModal({ extension, onClose, copyToClipboard }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="relative z-50 w-full max-w-3xl bg-white rounded-lg shadow-lg overflow-auto max-h-[90vh]">
        <div className="flex items-start justify-between p-4 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-semibold">{extension.labelName}</h3>
            <div className="text-sm text-gray-500">{extension.serialNumber}</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-500">Status: <span className="font-medium ml-1">{extension.status}</span></div>
            <button onClick={onClose} className="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200">Close</button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="text-sm text-gray-700"><span className="text-gray-500">Model:</span> {extension.modelType}</div>
            <div className="text-sm text-gray-700"><span className="text-gray-500">Price:</span> ${extension.price ?? "—"}</div>
            <div className="text-sm text-gray-700"><span className="text-gray-500">Owner:</span> {typeof extension.owner === "object" ? getOwnerLabel(extension.owner) : extension.owner || "—"}</div>
            <div className="text-sm text-gray-700"><span className="text-gray-500">Ports:</span> {(extension.ports?.length || 0)}</div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Ports</h4>
            <div className="grid gap-2">
              {(extension.ports || []).length === 0 ? (
                <div className="text-sm text-gray-400">No ports</div>
              ) : (
                (extension.ports || []).map((p) => (
                  <div key={p._id} className="flex items-center justify-between bg-white p-2 rounded border border-gray-100">
                    <div>
                      <div className="text-sm">{p.labelName}</div>
                      <div className="text-xs text-gray-500">Pin: {p.pinNumber} • {p.configuration}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-gray-500">{p.status ? "Active" : "Inactive"}</div>
                      <button onClick={() => copyToClipboard(p._id, "Port ID")} className="px-2 py-1 text-xs rounded bg-white border border-gray-200 hover:bg-gray-100">Copy</button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-3">
              <button onClick={() => copyToClipboard(extension._id, "Extension ID")} className="px-3 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200">Copy Extension ID</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
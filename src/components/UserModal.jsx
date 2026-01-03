import React from "react";

export default function UserModal({user, onClose, copyToClipboard}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/80" onClick={onClose}></div>
            <div className="relative z-50 w-full max-w-3xl bg-white rounded-lg shadow-lg overflow-auto max-h-[90vh]">
                <div className="flex items-start justify-between p-4 border-b border-gray-100">
                    <div>
                        <h3 className="text-lg font-semibold">{user.firstName} {user.lastName}</h3>
                        <div className="text-sm text-gray-500">{user.email} • {user.phone || "No phone"}</div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="text-sm text-gray-500">Status: <span
                            className="font-medium ml-1">{user.status}</span></div>
                        <button onClick={onClose}
                                className="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200">Close
                        </button>
                    </div>
                </div>

                <div className="p-4 space-y-4">
                    <section>
                        <h4 className="text-sm font-medium mb-2">Profile</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="text-sm text-gray-700"><span
                                className="text-gray-500">Email:</span> {user.email}</div>
                            <div className="text-sm text-gray-700"><span
                                className="text-gray-500">Phone:</span> {user.phone || "—"}</div>
                            <div className="text-sm text-gray-700"><span
                                className="text-gray-500">Plan:</span> {user.subscriptionPlan}</div>
                            <div className="text-sm text-gray-700"><span
                                className="text-gray-500">Verified:</span> {user.isVerified ? "Yes" : "No"}</div>
                        </div>
                    </section>

                    <section>
                        <h4 className="text-sm font-medium mb-2">Remotes / Buttons</h4>
                        <div className="grid gap-2">
                            {(user.buttons || []).length === 0 ? (
                                <div className="text-sm text-gray-400">No remotes assigned</div>
                            ) : (
                                (user.buttons || []).map((b) => (
                                    <div key={b._id}
                                         className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                        <div>
                                            <div className="text-sm font-medium">{b.labelName || "Remote"}</div>
                                            <div className="text-xs text-gray-500">{b.serialNumber}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-xs text-gray-500">{b.modelType}</div>
                                            <button onClick={() => copyToClipboard(b._id, "Remote ID")}
                                                    className="px-2 py-1 text-xs rounded bg-white border border-gray-200 hover:bg-gray-100">Copy
                                                ID
                                            </button>
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
                                                <div className="text-xs text-gray-500">Model: {ext.modelType} • Price:
                                                    ${ext.price}</div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button onClick={() => copyToClipboard(ext._id, "Extension ID")}
                                                        className="px-2 py-1 text-xs rounded bg-white border border-gray-200 hover:bg-gray-100">Copy
                                                    ID
                                                </button>
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

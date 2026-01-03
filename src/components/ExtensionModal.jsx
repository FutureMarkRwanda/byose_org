import React from "react";


export default function ExtensionModal({extension, onClose, copyToClipboard}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/80" onClick={onClose}></div>
            <div className="relative z-50 w-full max-w-3xl bg-white rounded-lg shadow-lg overflow-auto max-h-[90vh]">
                <div className="flex items-start justify-between p-4 border-b border-gray-100">
                    <div>
                        <h3 className="text-lg font-semibold">{extension.labelName}</h3>
                        <div className="text-sm text-gray-500">{extension.serialNumber}</div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="text-sm text-gray-500">Status: <span
                            className="font-medium ml-1">{extension.status}</span></div>
                        <button onClick={onClose}
                                className="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200">Close
                        </button>
                    </div>
                </div>

                <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="text-sm text-gray-700"><span
                            className="text-gray-500">Model:</span> {extension.modelType}</div>
                        <div className="text-sm text-gray-700"><span
                            className="text-gray-500">Price:</span> ${extension.price ?? "—"}</div>
                        <div className="text-sm text-gray-700"><span
                            className="text-gray-500">Owner:</span> {typeof extension.owner === "object" ? getOwnerLabel(extension.owner) : extension.owner || "—"}
                        </div>
                        <div className="text-sm text-gray-700"><span
                            className="text-gray-500">Ports:</span> {(extension.ports?.length || 0)}</div>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium mb-2">Ports</h4>
                        <div className="grid gap-2">
                            {(extension.ports || []).length === 0 ? (
                                <div className="text-sm text-gray-400">No ports</div>
                            ) : (
                                (extension.ports || []).map((p) => (
                                    <div key={p._id}
                                         className="flex items-center justify-between bg-white p-2 rounded border border-gray-100">
                                        <div>
                                            <div className="text-sm">{p.labelName}</div>
                                            <div
                                                className="text-xs text-gray-500">Pin: {p.pinNumber} • {p.configuration}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="text-xs text-gray-500">{p.status ? "Active" : "Inactive"}</div>
                                            <button onClick={() => copyToClipboard(p._id, "Port ID")}
                                                    className="px-2 py-1 text-xs rounded bg-white border border-gray-200 hover:bg-gray-100">Copy
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="mt-3">
                            <button onClick={() => copyToClipboard(extension._id, "Extension ID")}
                                    className="px-3 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200">Copy Extension
                                ID
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
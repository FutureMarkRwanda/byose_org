// Renamed and updated to show Remote Details + nested buttons
import React from "react";
import {getOwnerLabel, lastNChars} from "../utils/helper.js";

export default function RemoteDetailsModal({remote, onClose, copyToClipboard,handleAddHadware,handleTestingHardware}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/80" onClick={onClose}></div>
            <div className="relative z-50 w-full max-w-3xl bg-white rounded-lg shadow-lg overflow-auto max-h-[90vh]">
                <div className="flex items-start justify-between p-4 border-b border-gray-100">
                    <div>
                        <h3 className="text-lg font-semibold">{remote.serialNumber}</h3>
                        <div className="text-sm text-gray-500">{remote.manufacture}</div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="text-sm text-gray-500">State: <span
                            className="font-medium ml-1 capitalize">{remote.state}</span></div>
                        <button onClick={onClose}
                                className="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200">Close
                        </button>
                    </div>
                </div>

                <div className="p-4 space-y-4">
                    <section>
                        <h4 className="text-sm font-medium mb-2">Device Info</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="text-sm text-gray-700"><span
                                className="text-gray-500">Model:</span> {remote.modelType}</div>
                            <div className="text-sm text-gray-700"><span
                                className="text-gray-500">Price:</span> {remote.price ?? "—"} FRW</div>
                            <div className="text-sm text-gray-700"><span
                                className="text-gray-500">Hardware:</span> {remote.hasHardware ? "Yes" : "No"}</div>
                            <div className="text-sm text-gray-700"><span
                                className="text-gray-500">Powered By:</span> {remote.powered}</div>
                            <div className="text-sm text-gray-700"><span
                                className="text-gray-500">Version:</span> {remote.version}</div>
                            <div className="text-sm text-gray-700"><span
                                className="text-gray-500">Owner:</span> {typeof remote.owner === "object" ? getOwnerLabel(remote.owner) : remote.owner || "—"}
                            </div>
                        </div>
                        <div className="mt-2 flex gap-1">
                             <button onClick={() => copyToClipboard(remote._id, "Remote ID")}
                                    className="px-3 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200">Copy Remote ID
                            </button>
                            {!remote.hasHardware&&<button onClick={() => handleAddHadware(remote._id)}
                                    className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-400">Added Hardware
                            </button>}
                            {!remote.owner&&<button onClick={() => handleTestingHardware(remote._id)}
                                    className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-400">Test
                            </button>}
                        </div>
                    </section>

                    <section className="border-t border-gray-100 pt-4">
                        <h4 className="text-sm font-medium mb-2">Buttons Configuration</h4>
                        <div className="grid gap-2">
                            {!remote.buttons || remote.buttons.length === 0 ? (
                                <div className="text-sm text-gray-400">No buttons configured</div>
                            ) : (
                                remote.buttons.map((b) => (
                                    <div key={b._id} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                                        <div>
                                            <div className="text-md font-medium">{b.labelName} <b className={`text-xs`}>{lastNChars(b._id,5)}</b></div>
                                            <div className="text-xs text-gray-500 capitalize">{b.buttonType}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`text-xs px-2 py-0.5 rounded ${b.status ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                                {b.status ? 'ON' : 'OFF'}
                                            </div>
                                            <button onClick={() => copyToClipboard(b._id, "Button ID")}
                                                    className="px-2 py-1 text-xs rounded bg-white border border-gray-200 hover:bg-gray-100">
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


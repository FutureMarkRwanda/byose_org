// eslint-disable-next-line
import React, {useEffect, useRef, useState} from "react";
import {getImageData, getOwnerLabel, lastNChars} from "../utils/helper.js";
import {presence_server} from "../config/server_api.js";
import {useNotification} from "../context/NotificationContext.jsx";

export default function RemoteDetailsModal({
                                               remote,
                                               onClose,
                                               copyToClipboard,
                                               handleAddHadware,
                                               handleTestingHardware,
                                               handleRemoteStatus
                                           }) {
    const {showNotification} = useNotification();
    const [gradientColor1, setGradientColor1] = useState("#2563eb");
    const [gradientColor2, setGradientColor2] = useState("#0277bd");
    const [qrPreview, setQrPreview] = useState(null);
    const debounceRef = useRef(null);

    const postConfig = async () => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(async () => {
            const payload = {
                data: remote.buttons[0]._id,
                config: {
                    bgColor: "#FFFFFF",
                    body: "rounded-pointed",
                    bodyColor: "#000000",

                    eye: "frame5",
                    eyeBall: "ball11",

                    eye1Color: "#000000",
                    eye2Color: "#000000",
                    eye3Color: "#000000",

                    eyeBall1Color: "#000000",
                    eyeBall2Color: "#000000",
                    eyeBall3Color: "#000000",

                    brf1: ["fh"],
                    brf2: [],
                    brf3: ["fh", "fv"],

                    erf1: ["fh"],
                    erf2: [],
                    erf3: ["fh", "fv"],

                    gradientType: "linear",
                    gradientColor1,
                    gradientColor2,
                    gradientOnEyes: true,

                    logo: "https://www.byose.info/assets/icons/blueLogo.svg",
                    logoMode: "default",

                    file: "svg",
                    size: 1000,
                    download: "imageUrl"
                }
            };

            const url = presence_server + "/get-qrCode";

            const res = await getImageData(url, payload, "");
            if (res.data) {
                setQrPreview(res.data);
            }

            if (res?.error) {
                showNotification("Debounced request failed:" + res.error, "error");
            }
        }, 600); // ⏱️ debounce delay (ms)

        return () => clearTimeout(debounceRef.current);
    };

    useEffect(() => {
        // eslint-disable-next-line react/prop-types
        if (!remote?.buttons?.length) return;
        postConfig();
    }, [remote, gradientColor1, gradientColor2]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/80" onClick={onClose}></div>
            <div className="relative z-50 w-full max-w-3xl bg-white rounded-lg shadow-lg overflow-auto max-h-[90vh]">
                <div className={`flex items-start justify-between p-4 border-b border-gray-100 ${remote.state==='instore'&&'bg-green-500 text-white'}`}>
                    <div>
                        {/* eslint-disable-next-line react/prop-types */}
                        <h3 className="text-lg font-semibold">{remote.serialNumber}</h3>
                        {/* eslint-disable-next-line react/prop-types */}
                        <div className="text-sm ">{remote.manufacture}</div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="text-sm ">State: <span
                            className="font-medium ml-1 capitalize">{remote.state}</span></div>
                        <button onClick={onClose}
                                className="px-3 py-1 text-black text-sm rounded bg-gray-100 hover:bg-gray-200">Close
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
                                className="text-gray-500">Price:</span> {remote.price ?? "—"} FRW
                            </div>
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
                            {/* eslint-disable-next-line react/prop-types */}
                            <button onClick={() => copyToClipboard(remote._id, "Remote ID")}
                                    className="px-3 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200">Copy Remote ID
                            </button>
                            {/* eslint-disable-next-line react/prop-types */}
                            {!remote.hasHardware && <button onClick={() => handleAddHadware(remote._id)}
                                                            className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-400">Added
                                Hardware
                            </button>}
                            {/* eslint-disable-next-line react/prop-types */}
                            {!remote.owner && <button onClick={() => handleTestingHardware(remote._id)}
                                                      className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-400">Test
                            </button>}
                            {/* eslint-disable-next-line*/}
                            {!remote.owner && <button onClick={() => handleRemoteStatus(remote._id, remote.isEnabled)}
                                                      className="px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-400">
                                {/* eslint-disable-next-line react/prop-types */}
                                {remote.isEnabled ? "DISABLE" : "ENABLED"}
                            </button>}
                        </div>
                    </section>

                    <section className="border-t border-gray-100 pt-4">
                        <h4 className="text-sm font-medium mb-2">Buttons Configuration</h4>
                        <div className="grid gap-2">
                            {/* eslint-disable-next-line react/prop-types */}
                            {!remote.buttons || remote.buttons.length === 0 ? (
                                <div className="text-sm text-gray-400">No buttons configured</div>
                            ) : (
                                // eslint-disable-next-line react/prop-types
                                remote.buttons.map((b) => (
                                    <div key={b._id}
                                         className="flex items-center justify-between bg-gray-100 p-2 rounded">
                                        <div>
                                            <div className="text-md font-medium">{b.labelName} <b
                                                className={`text-xs`}>{lastNChars(b._id, 5)}</b></div>
                                            <div className="text-xs text-gray-500 capitalize">{b.buttonType}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`text-xs px-2 py-0.5 rounded ${b.status ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                                {b.status ? 'ON' : 'OFF'}
                                            </div>
                                            {/* eslint-disable-next-line react/prop-types */}
                                            <button disabled={remote?.owner}
                                                    onClick={() => copyToClipboard(b._id, "Button ID")}
                                                    className="px-2 py-1 text-xs rounded bg-white border border-gray-200 hover:bg-gray-100">
                                                Copy ID
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                    <section className="border-t border-gray-100 pt-4">
                        <div className={`p-2`}>
                            {qrPreview ? (
                                <img
                                    src={qrPreview}
                                    alt="QR Code"
                                    className="w-64 h-64 border rounded cursor-pointer hover:opacity-80  mx-auto"
                                    title="Click to download QR code"
                                    onClick={() => {
                                        const a = document.createElement("a");
                                        a.href = qrPreview;
                                        a.download = `${remote.serialNumber}.png`;
                                        document.body.appendChild(a);
                                        a.click();
                                        document.body.removeChild(a);
                                    }}
                                />
                            ) : <div className="flex items-center justify-center h-64">
                                <div
                                    className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                            }
                        </div>
                        <h4 className="text-sm font-medium mb-2">Gradient Settings</h4>

                        <div className="flex items-center gap-4">
                            <div>
                                <label className="text-xs text-gray-500">Gradient Color 1</label>
                                <input
                                    type="color"
                                    value={gradientColor1}
                                    onChange={(e) => setGradientColor1(e.target.value)}
                                    className="w-10 h-10 border rounded cursor-pointer"
                                />
                            </div>

                            <div>
                                <label className="text-xs text-gray-500">Gradient Color 2</label>
                                <input
                                    type="color"
                                    value={gradientColor2}
                                    onChange={(e) => setGradientColor2(e.target.value)}
                                    className="w-10 h-10 border rounded cursor-pointer"
                                />
                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}


import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function DeviceDialog({ device, close, submit, notify }) {
    const emptyDevice = {
        id: null,
        stationId: "",
        fingerprintHash: "",
        browserUserAgent: "",
        screenResolution: "",
        timezone: "",
        language: "",
        canvasFingerprint: "",
        webglFingerprint: "",
        department: "",
        location: "",
        isActive: true,
        accessCount: 1,
    };

    const [local, setLocal] = useState(emptyDevice);

    // Pre-fill fields if editing
    useEffect(() => {
        setLocal(device ?? emptyDevice);
    }, [device]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setLocal((prev) => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? checked
                    : type === "number"
                    ? Number(value)
                    : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!local.stationId) {
            notify("error", "Station ID is required");
            return;
        }

        if (!local.fingerprintHash) {
            notify("error", "Fingerprint hash is required");
            return;
        }

        if (!local.department) {
            notify("error", "Department is required");
            return;
        }

        submit(local);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">

                {/* HEADER */}
                <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {local.id ? "Edit Device" : "Register New Device"}
                    </h2>
                    <button
                        onClick={close}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* Station + Fingerprint */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Station ID *
                            </label>
                            <input
                                type="number"
                                name="stationId"
                                value={local.stationId}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Fingerprint Hash *
                            </label>
                            <input
                                type="text"
                                name="fingerprintHash"
                                value={local.fingerprintHash}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg break-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Browser + Resolution */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Browser User Agent
                            </label>
                            <textarea
                                name="browserUserAgent"
                                value={local.browserUserAgent || ""}
                                onChange={handleChange}
                                rows={2}
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Screen Resolution
                            </label>
                            <input
                                type="text"
                                name="screenResolution"
                                value={local.screenResolution || ""}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </div>
                    </div>

                    {/* Timezone + Language */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Timezone
                            </label>
                            <input
                                type="text"
                                name="timezone"
                                value={local.timezone || ""}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Language
                            </label>
                            <input
                                type="text"
                                name="language"
                                value={local.language || ""}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </div>
                    </div>

                    {/* Canvas + WebGL */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Canvas Fingerprint
                            </label>
                            <textarea
                                name="canvasFingerprint"
                                rows={2}
                                value={local.canvasFingerprint || ""}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                WebGL Fingerprint
                            </label>
                            <textarea
                                name="webglFingerprint"
                                rows={2}
                                value={local.webglFingerprint || ""}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </div>
                    </div>

                    {/* Department + Location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Department *
                            </label>
                            <input
                                type="text"
                                name="department"
                                value={local.department}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Location
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={local.location || ""}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </div>
                    </div>

                    {/* Active + Access Count */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div className="flex items-center gap-3 pt-2">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={local.isActive}
                                onChange={handleChange}
                                className="w-4 h-4"
                            />
                            <span className="font-medium">Active Device</span>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Access Count
                            </label>
                            <input
                                type="number"
                                name="accessCount"
                                value={local.accessCount}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </div>
                    </div>

                    {/* FOOTER BUTTONS */}
                    <div className="flex justify-end gap-4 pt-6 border-t">
                        <button
                            type="button"
                            onClick={close}
                            className="px-6 py-2 border border-gray-300 rounded-lg"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            {local.id ? "Update Device" : "Register Device"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

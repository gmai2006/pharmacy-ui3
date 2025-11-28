import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "../../context/UserContext";
import init from "../../init";
import DeviceFingerprintService from "../../utils/fingerprinting";

export default function DeviceFingerprintManagement() {
    const { appUser } = useUser();

    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);

    const [editingDevice, setEditingDevice] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        fingerprintHash: "",
        stationId: "",
        department: "",
        location: "",
        browserUserAgent: "",
        screenResolution: "",
        timezone: "",
        language: "",
        canvasFingerprint: "",
        webglFingerprint: "",
        // metadata: {},
    });

    // ----------------------------------------------------------
    // Fetch Devices (paged API returns content/page/size/etc)
    // ----------------------------------------------------------
    const fetchDevices = () => {
        setLoading(true);

        axios
            .get(`/${init.appName}/api/device-fingerprints?page=0&size=100`, {
                headers: {
                    "Content-Type": "application/json",
                    "X-User-Email": appUser.email,
                },
            })
            .then((res) => {
                const data = res.data;
                setDevices(data.content || []);
            })
            .catch((err) => {
                console.error("Failed to fetch devices:", err);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (appUser?.email) {
            fetchDevices();
        }
    }, [appUser]);

    // ----------------------------------------------------------
    // Form Handlers
    // ----------------------------------------------------------
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const resetForm = async () => {
        setEditingDevice(null);
        const deviceInfo = await DeviceFingerprintService.generateFingerprint();
        const hash = await DeviceFingerprintService.createFingerprintHash(deviceInfo);
        setFormData({
            fingerprintHash: hash,
            stationId: "",
            department: "",
            location: "",
            browserUserAgent: deviceInfo.vendorPrefix,
            screenResolution: deviceInfo.screenResolution,
            timezone: deviceInfo.timezone,
            language: navigator.language,
            canvasFingerprint: deviceInfo.canvasFingerprint,
            webglFingerprint: deviceInfo.webglFingerprint,
        });
    };

    const openNewForm = async () => {
        await resetForm();
        setShowForm(true);
    };

    const openEditForm = (device) => {
        setEditingDevice(device);
        setFormData({
            fingerprintHash: device.fingerprintHash,
            stationId: device.stationId,
            department: device.department,
            location: device.location,
            browserUserAgent: device.browserUserAgent,
            screenResolution: device.screenResolution,
            timezone: device.timezone,
            language: device.language,
            canvasFingerprint: device.canvasFingerprint,
            webglFingerprint: device.webglFingerprint,
        });
        setShowForm(true);
    };

    const updateDeviceInfo = (formData) => {
        const localStationName = `RX00-${formData.stationId}`;
        localStorage.setItem('stationId', formData.stationId);
        localStorage.setItem('stationName', localStationName);
        localStorage.setItem('stationTimestamp', new Date().toISOString());
        localStorage.setItem('fingerprintHash', JSON.stringify(formData.fingerprintHash));
    }

    const deleteDeviceInfo = () => {
        localStorage.setItem('stationId', '');
        localStorage.setItem('stationName', '');
        localStorage.setItem('stationTimestamp', undefined);
        localStorage.setItem('fingerprintHash', 'Not Found');
    }

    // ----------------------------------------------------------
    // Save = Create or Update
    // ----------------------------------------------------------
    const handleSave = () => {
        const payload = { ...formData };
        payload.stationId = Number(payload.stationId);

        if (!payload.fingerprintHash || !payload.stationId) {
            alert("Fingerprint hash and station ID are required.");
            return;
        }
        const request = axios.post(`/${init.appName}/api/device-fingerprints/auto-register`, payload, {
            headers: {
                "Content-Type": "application/json",
                "X-User-Email": appUser.email,
            },
        });

        request
            .then(() => {
                fetchDevices();
                setShowForm(false);
            })
            .catch((err) => {
                console.error("Failed to save device:", err);
                alert("Save failed: " + err.response?.data || err.message);
            });

        updateDeviceInfo(formData);
        
    };

    // ----------------------------------------------------------
    // Delete Device
    // ----------------------------------------------------------
    const deleteDevice = (id) => {
        if (!window.confirm("Delete this device?")) return;

        axios
            .delete(`/${init.appName}/api/device-fingerprints/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                    "X-User-Email": appUser.email,
                },
            })
            .then(() => fetchDevices())
            .catch((err) => {
                console.error("Delete failed:", err);
                alert("Delete failed.");
            });

            deleteDeviceInfo();
    };

    // ----------------------------------------------------------
    // Rendering UI
    // ----------------------------------------------------------
    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Device Fingerprints</h1>

            <button
                className="px-4 py-2 bg-blue-600 text-white rounded mb-4"
                onClick={openNewForm}
            >
                + Add Device
            </button>

            {loading ? (
                <p className="text-gray-500">Loading...</p>
            ) : devices.length === 0 ? (
                <p>No devices found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded shadow">
                        <thead className="bg-gray-100">
                            <tr className="text-left">
                                <th className="p-3">Station</th>
                                <th className="p-3">Fingerprint Hash</th>
                                <th className="p-3">Department</th>
                                <th className="p-3">Location</th>
                                <th className="p-3">Last Seen</th>
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {devices.map((d) => (
                                <tr key={d.id} className="border-t">
                                    <td className="p-3">{d.stationId}</td>
                                    <td className="p-3 text-xs">{d.fingerprintHash}</td>
                                    <td className="p-3">{d.department}</td>
                                    <td className="p-3">{d.location}</td>
                                    <td className="p-3">
                                        {d.lastSeen ? new Date(d.lastSeen).toLocaleString() : "-"}
                                    </td>
                                    <td className="p-3 space-x-2">
                                        <button
                                            onClick={() => openEditForm(d)}
                                            className="px-3 py-1 bg-green-600 text-white rounded"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deleteDevice(d.id)}
                                            className="px-3 py-1 bg-red-600 text-white rounded"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ------------------------------------------
          Edit/Create Modal
      ------------------------------------------- */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-xl">

                        <h2 className="text-xl font-semibold mb-4">
                            {editingDevice ? "Edit Device" : "Add Device"}
                        </h2>

                        <div className="space-y-3">

                            <input
                                name="fingerprintHash"
                                placeholder="Fingerprint Hash"
                                value={formData.fingerprintHash}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />

                            <input
                                name="stationId"
                                placeholder="Station ID"
                                value={formData.stationId}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />

                            <input
                                name="department"
                                placeholder="Department"
                                value={formData.department}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />

                            <input
                                name="location"
                                placeholder="Location"
                                value={formData.location}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />

                            <input
                                name="browserUserAgent"
                                placeholder="Browser User Agent"
                                value={formData.browserUserAgent}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />

                            <input
                                name="screenResolution"
                                placeholder="Screen Resolution (e.g. 1920x1080)"
                                value={formData.screenResolution}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />

                            <input
                                name="timezone"
                                placeholder="Timezone"
                                value={formData.timezone}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />

                            <input
                                name="language"
                                placeholder="Language"
                                value={formData.language}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />

                            <textarea
                                name="canvasFingerprint"
                                placeholder="Canvas Fingerprint"
                                value={formData.canvasFingerprint}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />

                            <textarea
                                name="webglFingerprint"
                                placeholder="WebGL Fingerprint"
                                value={formData.webglFingerprint}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />

                            {/* Metadata as JSON text */}
                            {/* <textarea
                name="metadata"
                placeholder="Metadata JSON (optional)"
                value={JSON.stringify(formData.metadata, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setFormData((prev) => ({ ...prev, metadata: parsed }));
                  } catch {
                    // Ignore parse errors until valid JSON is entered
                  }
                }}
                className="w-full p-2 border rounded font-mono text-sm"
                rows={4}
              /> */}

                            <div className="flex justify-end space-x-2 mt-4">
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-2 bg-gray-300 rounded"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 bg-blue-600 text-white rounded"
                                >
                                    Save
                                </button>
                            </div>

                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}

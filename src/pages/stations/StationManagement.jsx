import React, { useEffect, useState } from "react";
import axios from "axios";
import init from "../../init";
import { useUser } from "../../context/UserContext";

export default function StationManagement() {
    const { appUser } = useUser();

    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingStation, setEditingStation] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        stationPrefix: "",
        department: "",
        location: "",
        startingNumber: 1,
        currentNumber: 1,
        maxStations: null,
    });

    // -----------------------------
    // Fetch all stations
    // -----------------------------
    const fetchStations = () => {
        setLoading(true);

        axios
            .get(`/${init.appName}/api/stations?page=0&size=50`, {
                headers: {
                    "Content-Type": "application/json",
                    "X-User-Email": appUser.email,
                },
            })
            .then((res) => {
                // The backend returns an object, not an array
                const data = res.data;

                // Extract paginated content
                setStations(data.content || []);

                // You may want to store paging data too:
                // setPage(data.page);
                // setTotalElements(data.totalElements);
                // setSize(data.size);
            })
            .catch((err) => {
                console.error("Error fetching stations:", err);
            })
            .finally(() => setLoading(false));
    };


    useEffect(() => {
        if (appUser?.email) {
            fetchStations();
        }
    }, [appUser]);

    // --------------------------------
    // Form handlers
    // --------------------------------
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const resetForm = () => {
        setEditingStation(null);
        setFormData({
            stationPrefix: "",
            department: "",
            location: "",
            startingNumber: 1,
            currentNumber: 1,
            maxStations: null,
        });
    };

    const openNewForm = () => {
        resetForm();
        setShowForm(true);
    };

    const openEditForm = (station) => {
        setEditingStation(station);
        setFormData({
            stationPrefix: station.stationPrefix,
            department: station.department,
            location: station.location,
            startingNumber: station.startingNumber,
            currentNumber: station.currentNumber,
            maxStations: station.maxStations,
        });
        setShowForm(true);
    };

    // --------------------------------
    // Save (Create/Update)
    // --------------------------------
    const handleSave = () => {
        const payload = { ...formData };

        if (!payload.stationPrefix || !payload.department) {
            alert("Prefix and department are required");
            return;
        }

        const isEdit = editingStation != null;

        const request = isEdit
            ? axios.put(
                `/${init.appName}/api/stations/${editingStation.id}`,
                payload,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "X-User-Email": appUser.email,
                    },
                }
            )
            : axios.post(`/${init.appName}/api/stations`, payload, {
                headers: {
                    "Content-Type": "application/json",
                    "X-User-Email": appUser.email,
                },
            });

        request
            .then(() => {
                fetchStations();
                setShowForm(false);
            })
            .catch((err) => {
                console.error("Save failed:", err);
                alert("Failed to save station");
            });
    };

    // --------------------------------
    // Delete station
    // --------------------------------
    const deleteStation = (id) => {
        if (!window.confirm("Are you sure you want to delete this station?")) return;

        axios
            .delete(`/${init.appName}/api/stations/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                    "X-User-Email": appUser.email,
                },
            })
            .then(() => fetchStations())
            .catch((err) => {
                console.error("Delete failed:", err);
                alert("Failed to delete station");
            });
    };

    // ================================
    // RENDER UI
    // ================================
    return (
        <div className="p-8 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Pharmacy Station Management</h1>

            {/* Add Station Button */}
            <button
                onClick={openNewForm}
                className="px-4 py-2 bg-blue-600 text-white rounded mb-4"
            >
                + Add Station
            </button>

            {/* Station Table */}
            {loading ? (
                <p className="text-gray-600">Loading...</p>
            ) : stations.length === 0 ? (
                <p>No stations found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white shadow rounded-lg">
                        <thead>
                            <tr className="bg-gray-100 text-left">
                                <th className="p-3">Prefix</th>
                                <th className="p-3">Department</th>
                                <th className="p-3">Location</th>
                                <th className="p-3">Current</th>
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stations.map((st) => (
                                <tr key={st.id} className="border-t">
                                    <td className="p-3">{st.stationPrefix}</td>
                                    <td className="p-3">{st.department}</td>
                                    <td className="p-3">{st.location || "-"}</td>
                                    <td className="p-3">{st.currentNumber}</td>
                                    <td className="p-3 space-x-2">
                                        <button
                                            onClick={() => openEditForm(st)}
                                            className="px-3 py-1 bg-green-600 text-white rounded"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deleteStation(st.id)}
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

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4">
                            {editingStation ? "Edit Station" : "Add New Station"}
                        </h2>

                        <div className="space-y-3">

                            <input
                                type="text"
                                name="stationPrefix"
                                placeholder="Station Prefix"
                                value={formData.stationPrefix}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />

                            <input
                                type="text"
                                name="department"
                                placeholder="Department"
                                value={formData.department}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />

                            <input
                                type="text"
                                name="location"
                                placeholder="Location"
                                value={formData.location}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />

                            <input
                                type="number"
                                name="startingNumber"
                                placeholder="Starting Number"
                                value={formData.startingNumber}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />

                            <input
                                type="number"
                                name="currentNumber"
                                placeholder="Current Number"
                                value={formData.currentNumber}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />

                            <input
                                type="number"
                                name="maxStations"
                                placeholder="Max Stations (optional)"
                                value={formData.maxStations || ""}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />

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

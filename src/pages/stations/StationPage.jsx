import React, { useEffect, useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";

import init from "../../init";
import { useUser } from "../../context/UserContext";
import Notification from "../../components/Notification";

import StationDialog from "./StationDialog";
import DeleteDialog from "./DeleteDialog";
import axios from "axios";
const baseUrl = `/${init.appName}/api/stations`;

export default function StationPage() {
    const { appUser } = useUser();
    const [loading, setLoading] = useState(true);
    const [stations, setStations] = useState([]);
    const [selectedStation, setSelectedStation] = useState(null);
    const [showDialog, setShowDialog] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [notification, setNotification] = useState(null);

    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const notify = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

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

    // CREATE station
    const createStation = async (station) => {
        try {
            const res = await fetch(baseUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-User-Email": appUser.email,
                },
                body: JSON.stringify(station),
            });

            if (!res.ok) throw new Error("Failed to create station");

            const created = await res.json();
            setStations([created, ...stations]);
            notify("success", "Station created successfully");
        } catch (err) {
            notify("error", err.message);
        }
    };

    // UPDATE station
    const updateStation = async (station) => {
        try {
            const res = await fetch(`${baseUrl}/${station.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-User-Email": appUser.email,
                },
                body: JSON.stringify(station),
            });

            if (!res.ok) throw new Error("Failed to update station");

            const updated = await res.json();
            setStations(
                stations.map((s) => (s.id === updated.id ? updated : s))
            );
            notify("success", "Station updated successfully");
        } catch (err) {
            notify("error", err.message);
        }
    };

    // DELETE station
    const deleteStation = async (id) => {
        try {
            const res = await fetch(`${baseUrl}/${id}`, {
                method: "DELETE",
                headers: {
                    "X-User-Email": appUser.email,
                },
            });

            if (!res.ok) throw new Error("Failed to delete station");

            setStations(stations.filter((s) => s.id !== id));
            notify("success", "Station deleted successfully");
        } catch (err) {
            notify("error", err.message);
        }
    };

    // Submit handler for StationDialog
    const handleSubmit = (station) => {
        if (station.id) updateStation(station);
        else createStation(station);

        setShowDialog(false);
        setSelectedStation(null);
    };

    // Search filter
    const filtered = stations.filter((s) =>
        s.stationPrefix.toLowerCase().includes(search.toLowerCase()) ||
        s.department.toLowerCase().includes(search.toLowerCase())
    );

    // Pagination
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const currentItems = filtered.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="min-h-screen p-8 bg-gradient-to-br from-indigo-50 to-purple-100">

            {notification && <Notification notification={notification} />}

            <div className="max-w-6xl mx-auto">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Stations</h1>
                        <p className="text-gray-600">Configure pharmacy workflow stations</p>
                    </div>

                    <button
                        onClick={() => {
                            setSelectedStation(null);
                            setShowDialog(true);
                        }}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
                    >
                        <Plus size={20} />
                        Add Station
                    </button>
                </div>

                {/* SEARCH */}
                <input
                    type="text"
                    placeholder="Search station prefix or department..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="w-full px-4 py-3 mb-6 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />

                {/* TABLE */}
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    {filtered.length === 0 ? (
                        <p className="p-6 text-center text-gray-500">No stations found.</p>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left font-semibold">ID</th>
                                    <th className="px-6 py-3 text-left font-semibold">Prefix</th>
                                    <th className="px-6 py-3 text-left font-semibold">Department</th>
                                    <th className="px-6 py-3 text-left font-semibold">Location</th>
                                    <th className="px-6 py-3 text-left font-semibold">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {currentItems.map((st) => (
                                    <tr key={st.id} className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-4">{st.id}</td>
                                        <td className="px-6 py-4">{st.stationPrefix}</td>
                                        <td className="px-6 py-4">{st.department}</td>
                                        <td className="px-6 py-4">{st.location || "-"}</td>

                                        <td className="px-6 py-4">
                                            <div className="flex gap-3">
                                                <button
                                                    className="text-indigo-600 hover:text-indigo-800"
                                                    onClick={() => {
                                                        setSelectedStation(st);
                                                        setShowDialog(true);
                                                    }}
                                                >
                                                    <Edit2 size={18} />
                                                </button>

                                                <button
                                                    className="text-red-600 hover:text-red-800"
                                                    onClick={() => setDeleteId(st.id)}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* PAGINATION */}
                {filtered.length > 0 && (
                    <div className="flex justify-between items-center mt-6 p-4 bg-white shadow rounded-lg">
                        <span>
                            Page {currentPage} of {totalPages}
                        </span>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                                className="px-3 py-2 border rounded disabled:opacity-50"
                            >
                                First
                            </button>

                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-2 border rounded disabled:opacity-50"
                            >
                                Prev
                            </button>

                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-2 border rounded disabled:opacity-50"
                            >
                                Next
                            </button>

                            <button
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-2 border rounded disabled:opacity-50"
                            >
                                Last
                            </button>
                        </div>
                    </div>
                )}

                {/* DIALOGS */}
                {showDialog && (
                    <StationDialog
                        station={selectedStation}
                        close={() => setShowDialog(false)}
                        submit={handleSubmit}
                        setNotification={setNotification}
                    />
                )}

                {deleteId && (
                    <DeleteDialog
                        deleteConfirmId={deleteId}
                        setDeleteConfirmId={setDeleteId}
                        confirmDelete={() => {
                            deleteStation(deleteId);
                            setDeleteId(null);
                            setNotification={setNotification}
                        }}
                    />
                )}
            </div>
        </div>
    );
}

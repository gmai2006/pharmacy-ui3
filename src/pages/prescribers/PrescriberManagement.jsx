import React, { useEffect, useState } from "react";
import axios from "axios";
import Notification from "../../components/Notification";
import { useUser } from "../../context/UserContext";
import init from "../../init";
import { Pen, Trash2 } from "lucide-react";

export default function PrescriberManagement() {
  const { appUser } = useUser();

  const [prescribers, setPrescribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const [search, setSearch] = useState("");

  // Dialog (modal)
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState(null);

  const [formData, setFormData] = useState({
    npi: "",
    firstName: "",
    lastName: "",
    middleName: "",
    suffix: "",
    deaNumber: "",
    stateLicenseNumber: "",
    taxonomyCode: "",
    clinicName: "",
    contact: {},
    clinicContact: {},
    epcsEnabled: false,
    active: true,
  });

  // --------------------------------------------------------------
  // Notification helper
  // --------------------------------------------------------------
  const notify = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // --------------------------------------------------------------
  // Fetch Prescribers
  // --------------------------------------------------------------
  const fetchPrescribers = () => {
    setLoading(true);

    axios
      .get(`/${init.appName}/api/prescribers?page=0&size=200`, {
        headers: {
          "Content-Type": "application/json",
          "X-User-Email": appUser.email,
        },
      })
      .then((res) => {
        setPrescribers(res.data.content || []);
      })
      .catch((err) => {
        notify("error", "Failed to fetch prescribers.");
        console.error(err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (appUser?.email) {
      fetchPrescribers();
    }
  }, [appUser]);

  // --------------------------------------------------------------
  // Search Filter
  // --------------------------------------------------------------
  const filtered = prescribers.filter((p) => {
    const s = search.toLowerCase();
    return (
      p.npi?.toLowerCase().includes(s) ||
      p.firstName?.toLowerCase().includes(s) ||
      p.lastName?.toLowerCase().includes(s)
    );
  });

  // --------------------------------------------------------------
  // Dialog Helpers
  // --------------------------------------------------------------
  const openNew = () => {
    setEditing(null);
    setFormData({
      npi: "",
      firstName: "",
      lastName: "",
      middleName: "",
      suffix: "",
      deaNumber: "",
      stateLicenseNumber: "",
      taxonomyCode: "",
      clinicName: "",
      contact: {},
      clinicContact: {},
      epcsEnabled: false,
      active: true,
    });
    setShowDialog(true);
  };

  const openEdit = (prescriber) => {
    setEditing(prescriber);
    setFormData({
      npi: prescriber.npi,
      firstName: prescriber.firstName,
      lastName: prescriber.lastName,
      middleName: prescriber.middleName,
      suffix: prescriber.suffix,
      deaNumber: prescriber.deaNumber,
      stateLicenseNumber: prescriber.stateLicenseNumber,
      taxonomyCode: prescriber.taxonomyCode,
      clinicName: prescriber.clinicName,
      contact: prescriber.contact || {},
      clinicContact: prescriber.clinicContact || {},
      epcsEnabled: prescriber.epcsEnabled,
      active: prescriber.active,
    });
    setShowDialog(true);
  };

  const handleField = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  // --------------------------------------------------------------
  // Create or Update
  // --------------------------------------------------------------
  const savePrescriber = () => {
    const payload = { ...formData };

    let req;

    if (editing) {
      req = axios.put(
        `/${init.appName}/api/prescribers/${editing.id}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            "X-User-Email": appUser.email,
          },
        }
      );
    } else {
      req = axios.post(`/${init.appName}/api/prescribers`, payload, {
        headers: {
          "Content-Type": "application/json",
          "X-User-Email": appUser.email,
        },
      });
    }

    req
      .then(() => {
        notify(
          "success",
          editing ? "Prescriber updated." : "Prescriber created."
        );
        setShowDialog(false);
        fetchPrescribers();
      })
      .catch((err) => {
        notify("error", "Failed to save prescriber.");
        console.error(err);
      });
  };

  // --------------------------------------------------------------
  // Delete Prescriber
  // --------------------------------------------------------------
  const deletePrescriber = (id) => {
    axios
      .delete(`/${init.appName}/api/prescribers/${id}`, {
        headers: {
          "Content-Type": "application/json",
          "X-User-Email": appUser.email,
        },
      })
      .then(() => {
        notify("success", "Prescriber deleted.");
        fetchPrescribers();
      })
      .catch((err) => {
        notify("error", "Failed to delete prescriber.");
        console.error(err);
      });
  };

  // --------------------------------------------------------------
  // Toggle active state (inline)
  // --------------------------------------------------------------
  const toggleActive = (prescriber) => {
    const payload = { ...prescriber, active: !prescriber.active };

    axios
      .put(`/${init.appName}/api/prescribers/${prescriber.id}`, payload, {
        headers: {
          "Content-Type": "application/json",
          "X-User-Email": appUser.email,
        },
      })
      .then(() => {
        notify("success", "Status updated.");
        fetchPrescribers();
      })
      .catch(() => notify("error", "Failed to update status."));
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Prescriber Management</h1>

      {/* Search + Add Button */}
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or NPI..."
          className="px-4 py-2 border rounded w-1/2"
        />

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={openNew}
        >
          + Add Prescriber
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : filtered.length === 0 ? (
        <p>No prescribers found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead className="bg-gray-100">
              <tr className="text-left">
                <th className="p-3">NPI</th>
                <th className="p-3">Name</th>
                <th className="p-3">Clinic</th>
                <th className="p-3">Active</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3">{p.npi}</td>
                  <td className="p-3">
                    {p.lastName}, {p.firstName}
                  </td>
                  <td className="p-3">{p.clinicName}</td>
                  <td className="p-3">
                    <button
                      onClick={() => toggleActive(p)}
                      className={`px-3 py-1 rounded ${
                        p.active ? "bg-green-500 text-white" : "bg-gray-400 text-white"
                      }`}
                    >
                      {p.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => openEdit(p)}
                      className="text-indigo-600 hover:text-indigo-800 transition" 
                      >
                      <Pen size={18} />
                    </button>
                    <button
                      onClick={() => deletePrescriber(p.id)}
                      className="text-red-600 hover:text-red-800 transition" title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Popup Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-xl shadow-xl">
            <h2 className="text-xl font-semibold mb-4">
              {editing ? "Edit Prescriber" : "Add Prescriber"}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <input
                name="npi"
                className="border p-2 rounded"
                placeholder="NPI"
                value={formData.npi}
                onChange={handleField}
              />

              <input
                name="deaNumber"
                className="border p-2 rounded"
                placeholder="DEA Number"
                value={formData.deaNumber}
                onChange={handleField}
              />

              <input
                name="firstName"
                className="border p-2 rounded"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleField}
              />

              <input
                name="lastName"
                className="border p-2 rounded"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleField}
              />

              <input
                name="clinicName"
                className="border p-2 rounded col-span-2"
                placeholder="Clinic Name"
                value={formData.clinicName}
                onChange={handleField}
              />
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setShowDialog(false)}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={savePrescriber}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && <Notification notification={notification} />}
    </div>
  );
}

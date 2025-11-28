import { useEffect, useState } from "react";
import {
  Plus,
  Download,
  Pen,
  Trash2,
} from "lucide-react";
import init from "../../init";
import { useUser } from "../../context/UserContext";
import Notification from "../../components/Notification";

export default function UserList() {
  const { appUser } = useUser();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const [notification, setNotification] = useState(null);

  const notify = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Dialogs
  const [showDialog, setShowDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
    displayName: "",
    username: "",
    email: "",
    active: true,
  });

  // Pagination
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // ============================================================
  // FETCH USERS
  // ============================================================
  const fetchUsers = () => {
    if (!appUser?.email) return;

    fetch(`/${init.appName}/api/users-with-roles`, {
      headers: {
        "Content-Type": "application/json",
        "X-User-Email": appUser.email,
      },
    })
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch users");
        return r.json();
      })
      .then(setUsers)
      .catch(() => notify("error", "Failed to load users."));
  };

  useEffect(() => {
    fetchUsers();
  }, [appUser]);

  // ============================================================
  // HANDLE ADD / EDIT
  // ============================================================
  const openNewDialog = () => {
    setEditingUser(null);
    setFormData({
      displayName: "",
      username: "",
      email: "",
      active: true,
    });
    setShowDialog(true);
  };

  const openEditDialog = (user) => {
    setEditingUser(user);
    setFormData({
      displayName: user.displayName || "",
      username: user.username || "",
      email: user.email || "",
      active: user.active,
    });
    setShowDialog(true);
  };

  const handleField = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ============================================================
  // SAVE USER
  // ============================================================
  const saveUser = () => {
    const payload = { ...formData };
    let request;

    if (editingUser) {
      request = fetch(`/${init.appName}/api/users/${editingUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-User-Email": appUser.email,
        },
        body: JSON.stringify(payload),
      });
    } else {
      request = fetch(`/${init.appName}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Email": appUser.email,
        },
        body: JSON.stringify(payload),
      });
    }

    request
      .then((r) => {
        if (!r.ok) throw new Error("Save failed");
        return r.json();
      })
      .then(() => {
        notify("success", editingUser ? "User updated." : "User created.");
        setShowDialog(false);
        fetchUsers();
      })
      .catch(() => notify("error", "Unable to save user."));
  };

  // ============================================================
  // DELETE USER
  // ============================================================
  const deleteUser = (user) => {
    if (!window.confirm(`Delete user ${user.username}?`)) return;

    fetch(`/${init.appName}/api/users/${user.id}`, {
      method: "DELETE",
      headers: {
        "X-User-Email": appUser.email,
      },
    })
      .then((r) => {
        if (!r.ok) throw new Error("Delete failed");
        notify("success", "User deleted.");
        fetchUsers();
      })
      .catch(() => notify("error", "Failed to delete user."));
  };

  // ============================================================
  // SEARCH + PAGINATION
  // ============================================================
  const filtered = users.filter((u) =>
    [u.username, u.email, u.displayName]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(search.toLowerCase()))
  );

  const totalUsers = filtered.length;
  const paginated = filtered.slice(0, itemsPerPage);

  const totalPages = Math.ceil(paginated.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = paginated.slice(startIndex, endIndex);

  // ============================================================
  // EXPORT CSV
  // ============================================================
  const exportCSV = () => {
    const header = ["Display Name", "Username", "Email", "Status"].join(",");
    const rows = users
      .map((u) =>
        [
          u.displayName,
          u.username,
          u.email,
          u.active ? "Active" : "Inactive",
        ].join(",")
      )
      .join("\n");

    const blob = new Blob([header + "\n" + rows], { type: "text/csv" });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "users.csv";
    a.click();
  };

  // ============================================================
  // UI
  // ============================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-8">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            User Management
          </h1>
          <p className="text-gray-600">
            Manage application users and their roles.
          </p>
        </div>

        {/* ACTION BAR */}
        <div className="flex gap-4 mb-8 flex-wrap items-center">

          <button
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
            onClick={openNewDialog}
          >
            <Plus size={20} /> Add User
          </button>

          <input
            placeholder="Search by username, name, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />

          <div className="flex items-center gap-4">
            <div className="text-lg font-semibold text-gray-700">
              Total Users: <span className="text-indigo-600">{totalUsers}</span>
            </div>

            <button
              onClick={exportCSV}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium"
              title="Export users to CSV"
            >
              <Download size={20} /> Export CSV
            </button>
          </div>
        </div>

        {/* USER TABLE */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Display Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Username</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Roles</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Created</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>

              <tbody>
                {currentUsers.map((u) => (
                  <tr key={u.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{u.displayName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{u.username}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>

                    {/* Roles */}
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-wrap gap-2">
                        {u.roles?.map((r) => (
                          <span
                            key={r.role_id}
                            className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800"
                          >
                            {r.role_name}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 text-sm">
                      {u.active ? (
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {u.created_at || ""}
                    </td>

                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          className="text-indigo-600 hover:text-indigo-800 transition"
                          title="Edit"
                          onClick={() => openEditDialog(u)}
                        >
                          <Pen size={18} />
                        </button>

                        <button
                          className="text-red-600 hover:text-red-800 transition"
                          title="Delete"
                          onClick={() => deleteUser(u)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500 text-sm">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGINATION */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Rows per page:</label>

              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
              >
                {[5, 10, 15, 20].map((val) => (
                  <option key={val} value={val}>
                    {val}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-sm text-gray-600 font-medium">
              Showing {paginated.length} of {totalUsers}
            </div>

            <div className="flex items-center gap-2 text-sm">
              <button className="px-3 py-2 border border-gray-300 rounded-lg opacity-50" disabled>
                Prev
              </button>
              <button className="px-3 py-2 rounded-lg bg-indigo-600 text-white">
                1
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Notification */}
      {notification && <Notification notification={notification} />}
    </div>
  );
}

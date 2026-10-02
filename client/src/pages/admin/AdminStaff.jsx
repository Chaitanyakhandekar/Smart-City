import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import MobileNavBottom from "../../components/MobileNavBottom";
import { adminApi } from "../../api/client";
import {
  Users,
  UserPlus,
  Briefcase,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  Loader2,
  Check,
  X,
  Lock,
  Tag
} from "lucide-react";
import toast from "react-hot-toast";

const DEPARTMENTS = [
  "Waste Management",
  "Roads",
  "Drainage",
  "Water Supply",
  "Street Infrastructure",
  "Public Property",
  "Other"
];

export const AdminStaff = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState([]);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    employeeId: "",
    department: "Waste Management",
    designation: "Field Officer"
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getStaffList();
      if (res.data?.data) {
        setStaffList(res.data.data.staff || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load staff directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleToggleStatus = async (staffId) => {
    try {
      const res = await adminApi.toggleStaffStatus(staffId);
      toast.success(res.data?.message || "Status updated.");
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update staff status.");
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.department) {
      toast.error("Please fill all required fields.");
      return;
    }

    try {
      setActionLoading(true);
      await adminApi.createStaff(formData);
      toast.success(`Staff account for ${formData.name} created successfully!`);
      setShowAddModal(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        employeeId: "",
        department: "Waste Management",
        designation: "Field Officer"
      });
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create staff account.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16 md:pb-0">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 min-w-0 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900">
                Staff Management & Directory
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Configure municipal department teams, monitor workloads, and provision field credentials
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm hover:shadow flex items-center gap-2 transition-all whitespace-nowrap"
            >
              <UserPlus className="w-4 h-4" /> Add Field Officer
            </button>
          </div>

          {/* STAFF TABLE */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-20 flex justify-center text-blue-600">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : staffList.length === 0 ? (
              <div className="py-16 text-center text-slate-500">
                <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-base font-semibold">No field staff found</p>
                <p className="text-xs text-slate-400 mt-1">Click "Add Field Officer" to create staff accounts.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                      <th className="py-3.5 px-4 font-semibold">Staff Member</th>
                      <th className="py-3.5 px-4 font-semibold">Department</th>
                      <th className="py-3.5 px-4 font-semibold">Employee ID</th>
                      <th className="py-3.5 px-4 font-semibold">Contact</th>
                      <th className="py-3.5 px-4 font-semibold text-center">Active Tasks</th>
                      <th className="py-3.5 px-4 font-semibold text-center">Resolved Tasks</th>
                      <th className="py-3.5 px-4 font-semibold">Status</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {staffList.map((staff) => (
                      <tr key={staff._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={staff.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"}
                              alt={staff.name}
                              className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                            />
                            <div>
                              <p className="font-bold text-slate-900 text-xs sm:text-sm">{staff.name}</p>
                              <p className="text-xs text-slate-400">{staff.designation || "Field Officer"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-xs font-semibold text-slate-700">
                          <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            {staff.department}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-mono text-xs text-slate-600">
                          {staff.employeeId || "N/A"}
                        </td>
                        <td className="py-4 px-4 text-xs text-slate-500">
                          <p>{staff.email}</p>
                          <p className="text-[11px] text-slate-400">{staff.phone || "No phone"}</p>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="font-bold text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                            {staff.assignedCount || 0}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="font-bold text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                            {staff.resolvedCount || 0}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              staff.isActive
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {staff.isActive ? "ACTIVE" : "INACTIVE"}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => handleToggleStatus(staff._id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                              staff.isActive
                                ? "bg-rose-50 text-rose-700 hover:bg-rose-100"
                                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            }`}
                          >
                            {staff.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ADD STAFF MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add Field Staff Member</h3>
                  <p className="text-xs text-slate-500">Provision credentials for departmental field officers</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Rajesh Shinde"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Official Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="staff@smartcity.local"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Login Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Department *
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-600"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g., Senior Inspector"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    placeholder="e.g., WM-102"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98220 12345"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Staff Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MobileNavBottom />
    </div>
  );
};

export default AdminStaff;

import React from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import MobileNavBottom from "../../components/MobileNavBottom";
import { useAuth } from "../../context/authContex";
import { Shield, Mail, Phone, Lock, Award } from "lucide-react";

export const AdminProfile = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16 md:pb-0">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 min-w-0 space-y-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 mb-6">
            Administrator Profile & Access
          </h1>

          <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-4">
              <img
                src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"}
                alt={user?.name}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-purple-600 shadow-sm"
              />
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">{user?.name}</h3>
                <p className="text-xs text-slate-500">{user?.designation || "Municipal System Administrator"}</p>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-200">
                  FULL ADMIN PRIVILEGES
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-4 border-t border-slate-100 text-sm">
              <div className="p-3.5 sm:p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                <Mail className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-slate-400">Email Address</p>
                  <p className="font-semibold text-slate-800 truncate">{user?.email}</p>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                <Phone className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-slate-400">Phone</p>
                  <p className="font-semibold text-slate-800 truncate">{user?.phone || "+91 98765 43210"}</p>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                <Award className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-slate-400">Employee ID</p>
                  <p className="font-semibold text-slate-800 truncate">{user?.employeeId || "ADM-001"}</p>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                <Shield className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-slate-400">Authority</p>
                  <p className="font-semibold text-slate-800 truncate">Dispatch, Override, & Manage</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <MobileNavBottom />
    </div>
  );
};

export default AdminProfile;

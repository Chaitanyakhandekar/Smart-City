import React from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../context/authContex";
import { Briefcase, Mail, Phone, Shield, BadgeCheck } from "lucide-react";

export const StaffProfile = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 min-w-0 space-y-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-6">
            Staff Profile & Credentials
          </h1>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-4">
              <img
                src={user?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"}
                alt={user?.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500 shadow-sm"
              />
              <div>
                <h3 className="text-xl font-bold text-slate-900">{user?.name}</h3>
                <p className="text-xs text-slate-500">{user?.designation || "Municipal Field Officer"}</p>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                  {user?.department || "Field Operations"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-sm">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                <BadgeCheck className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="text-xs text-slate-400">Employee ID</p>
                  <p className="font-semibold text-slate-800">{user?.employeeId || "EMP-001"}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                <Mail className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="text-xs text-slate-400">Official Email</p>
                  <p className="font-semibold text-slate-800">{user?.email}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                <Phone className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="text-xs text-slate-400">Phone</p>
                  <p className="font-semibold text-slate-800">{user?.phone || "+91 98220 12345"}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                <Shield className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="text-xs text-slate-400">System Role</p>
                  <p className="font-semibold text-slate-800">FIELD STAFF</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StaffProfile;

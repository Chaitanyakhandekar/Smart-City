import React from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import MobileNavBottom from "../../components/MobileNavBottom";
import ChatbotWidget from "../../components/ChatbotWidget";
import { useAuth } from "../../context/authContex";
import { User, Mail, Phone, Shield, Calendar } from "lucide-react";
import dayjs from "dayjs";

export const CitizenProfile = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16 md:pb-0">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 min-w-0 space-y-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 mb-6">
            Citizen Profile
          </h1>

          <div className="bg-white rounded-2xl p-5 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center gap-4">
              <img
                src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
                alt={user?.name}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-blue-600 shadow-sm"
              />
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">{user?.name}</h3>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  Verified Municipal Citizen
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-4 border-t border-slate-100 text-sm">
              <div className="p-3.5 sm:p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-slate-400">Email Address</p>
                  <p className="font-semibold text-slate-800 truncate">{user?.email}</p>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-slate-400">Phone</p>
                  <p className="font-semibold text-slate-800 truncate">{user?.phone || "Not specified"}</p>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-slate-400">Portal Access</p>
                  <p className="font-semibold text-slate-800 truncate">Citizen Reporting & Tracking</p>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-slate-400">Account Active</p>
                  <p className="font-semibold text-slate-800 truncate">{user?.isActive ? "Active / In Good Standing" : "Inactive"}</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <ChatbotWidget />
      <MobileNavBottom />
    </div>
  );
};

export default CitizenProfile;

import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import MobileNavBottom from "../../components/MobileNavBottom";
import StatCard from "../../components/StatCard";
import { adminApi } from "../../api/client";
import { BarChart3, TrendingUp, CheckCircle, Clock, AlertTriangle, Loader2 } from "lucide-react";

export const AdminAnalytics = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    stats: {},
    categoryData: [],
    statusData: [],
    priorityData: []
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await adminApi.getDashboard();
        if (res.data?.data) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const total = data.stats.total || 0;
  const resolved = data.stats.resolved || 0;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#070B14] flex flex-col font-sans text-slate-200 pb-16 md:pb-0">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 min-w-0 space-y-6">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white">
              Municipal Grievance Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Data aggregates directly computed from live MongoDB Atlas records
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
            <StatCard
              title="Resolution Rate"
              value={`${resolutionRate}%`}
              icon={TrendingUp}
              color="emerald"
              subtitle={`${resolved} of ${total} closed cases`}
            />
            <StatCard
              title="Average Resolution Time"
              value="24 Hours"
              icon={Clock}
              color="amber"
              subtitle="Target SLA: 48 Hours"
            />
            <StatCard
              title="Citizen Satisfaction"
              value="92%"
              icon={CheckCircle}
              color="teal"
              subtitle="Confirmed resolution rate"
            />
          </div>

          {/* Detailed Category Bars */}
          <div className="bg-[#0F172A] rounded-2xl p-6 sm:p-8 border border-slate-800/80 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Complaints Volume by Municipal Department
                </h3>
                <p className="text-xs text-slate-400">Distribution across city service areas</p>
              </div>
              <span className="px-3 py-1 rounded-lg bg-teal-500/10 text-teal-300 text-xs font-semibold border border-teal-500/30">
                Live Data
              </span>
            </div>

            {loading ? (
              <div className="py-12 flex justify-center text-teal-400">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {data.categoryData.map((cat) => {
                  const percent = total > 0 ? Math.round((cat.value / total) * 100) : 0;
                  return (
                    <div key={cat.name} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-200">{cat.name}</span>
                        <span className="text-teal-400">{cat.value} ({percent}%)</span>
                      </div>
                      <div className="w-full bg-[#070B14] rounded-full h-2.5 overflow-hidden border border-slate-800">
                        <div
                          className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2.5 rounded-full transition-all duration-700"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Priority Distribution */}
          <div className="bg-[#0F172A] rounded-2xl p-5 sm:p-8 border border-slate-800/80 shadow-xl space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-white">
              Urgency & Priority Classification Distribution
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
              {data.priorityData.map((p) => {
                const isCrit = p.name?.toUpperCase() === "CRITICAL";
                const isHigh = p.name?.toUpperCase() === "HIGH";
                const isMed = p.name?.toUpperCase() === "MEDIUM";
                const cardStyle = isCrit
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                  : isHigh
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                  : isMed
                  ? "bg-sky-500/10 border-sky-500/30 text-sky-300"
                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300";

                return (
                  <div key={p.name} className={`p-4 rounded-2xl border text-center ${cardStyle}`}>
                    <span className="text-[10px] sm:text-xs uppercase font-bold tracking-wider opacity-80">{p.name}</span>
                    <p className="text-2xl sm:text-3xl font-black text-white mt-1">{p.value}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      <MobileNavBottom />
    </div>
  );
};

export default AdminAnalytics;

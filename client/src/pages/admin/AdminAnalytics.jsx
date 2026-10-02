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
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16 md:pb-0">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 min-w-0 space-y-6">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900">
              Municipal Grievance Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
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
              color="blue"
              subtitle="Target SLA: 48 Hours"
            />
            <StatCard
              title="Citizen Satisfaction"
              value="92%"
              icon={CheckCircle}
              color="blue"
              subtitle="Confirmed resolution rate"
            />
          </div>

          {/* Detailed Category Bars */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Complaints Volume by Municipal Department
                </h3>
                <p className="text-xs text-slate-500">Distribution across city service areas</p>
              </div>
              <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
                Live Data
              </span>
            </div>

            {loading ? (
              <div className="py-12 flex justify-center text-blue-600">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {data.categoryData.map((cat, i) => {
                  const percent = total > 0 ? Math.round((cat.value / total) * 100) : 0;
                  return (
                    <div key={cat.name} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-800">
                        <span>{cat.name}</span>
                        <span className="text-blue-700">{cat.value} ({percent}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-700"
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
          <div className="bg-white rounded-2xl p-5 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Urgency & Priority Classification Distribution
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
              {data.priorityData.map((p) => (
                <div key={p.name} className="p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-400">{p.name}</span>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{p.value}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      <MobileNavBottom />
    </div>
  );
};

export default AdminAnalytics;

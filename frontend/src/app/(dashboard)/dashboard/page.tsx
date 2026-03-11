"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import { Loader2, TrendingUp, Package, Users, XCircle, CheckCircle2, Clock } from "lucide-react";
import { PremiumCard } from "@/components/ui/PremiumComponents";

export default function Dashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get("/dashboard/stats");
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-[60vh] space-y-4">
                <Loader2 className="animate-spin w-10 h-10 text-indigo-600" />
                <p className="text-slate-500 font-medium animate-pulse">Gathering insights...</p>
            </div>
        );
    }

    const chartData = [
        { name: "Confirmed", count: stats?.confirmedOrders || 0, fill: "#6366F1" },
        { name: "Pending", count: stats?.pendingOrders || 0, fill: "#F59E0B" },
        { name: "Cancelled", count: stats?.cancelledOrders || 0, fill: "#EF4444" },
    ];

    const StatBox = ({ title, value, icon: Icon, colorClass, delay }: any) => (
        <PremiumCard delay={delay} className="group overflow-hidden relative">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-slate-50 rounded-full group-hover:bg-slate-100 transition-colors duration-500" />
            <div className="flex items-center justify-between relative z-10">
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
                    <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
                </div>
                <div className={`p-3 rounded-2xl ${colorClass} bg-opacity-10 shadow-sm`}>
                    <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
                </div>
            </div>
        </PremiumCard>
    );

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard Overview</h1>
                    <p className="text-slate-500 font-medium mt-1">Welcome back! Here's what's happening with your orders.</p>
                </div>
                <div className="flex items-center space-x-2 bg-indigo-50 px-4 py-2 rounded-2xl text-indigo-700 text-sm font-bold border border-indigo-100/50">
                    <TrendingUp className="w-4 h-4" />
                    <span>Real-time Sync Active</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatBox
                    title="Total Orders"
                    value={stats?.totalOrders}
                    icon={Package}
                    colorClass="bg-blue-500"
                    delay={0.1}
                />
                <StatBox
                    title="Confirmed"
                    value={stats?.confirmedOrders}
                    icon={CheckCircle2}
                    colorClass="bg-emerald-500"
                    delay={0.15}
                />
                <StatBox
                    title="Pending"
                    value={stats?.pendingOrders}
                    icon={Clock}
                    colorClass="bg-amber-500"
                    delay={0.2}
                />
                <StatBox
                    title="Cancelled"
                    value={stats?.cancelledOrders}
                    icon={XCircle}
                    colorClass="bg-rose-500"
                    delay={0.25}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <PremiumCard delay={0.4} className="lg:col-span-1 flex flex-col items-center justify-center text-center py-10">
                    <h3 className="text-lg font-bold text-slate-800 mb-8 w-full text-left px-2">Performance</h3>
                    <div className="relative w-48 h-48 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="96"
                                cy="96"
                                r="80"
                                stroke="currentColor"
                                strokeWidth="12"
                                fill="transparent"
                                className="text-slate-100"
                            />
                            <circle
                                cx="96"
                                cy="96"
                                r="80"
                                stroke="currentColor"
                                strokeWidth="12"
                                fill="transparent"
                                strokeDasharray={2 * Math.PI * 80}
                                strokeDashoffset={2 * Math.PI * 80 * (1 - (stats?.confirmationRate || 0) / 100)}
                                className="text-indigo-600 transition-all duration-1000 ease-out"
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-black text-slate-900">{stats?.confirmationRate}%</span>
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Confirmed</span>
                        </div>
                    </div>
                    <p className="text-sm text-slate-500 mt-8 font-medium">Your confirmation rate is healthy. Keep it up!</p>
                </PremiumCard>

                <PremiumCard delay={0.5} className="lg:col-span-2">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Volume Analysis</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#F8FAFC' }}
                                    contentStyle={{
                                        borderRadius: '16px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                        background: '#fff',
                                        padding: '12px'
                                    }}
                                />
                                <Bar dataKey="count" radius={[8, 8, 8, 8]} barSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </PremiumCard>
            </div>
        </div>
    );
}


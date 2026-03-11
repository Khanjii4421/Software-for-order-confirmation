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
import {
    Loader2, TrendingUp, Package, XCircle,
    CheckCircle2, Clock, ArrowUpRight, Zap
} from "lucide-react";
import { PremiumCard } from "@/components/ui/PremiumComponents";
import { motion } from "framer-motion";

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
                <p className="text-slate-500 font-semibold animate-pulse">Gathering insights...</p>
            </div>
        );
    }

    const chartData = [
        { name: "Confirmed", count: stats?.confirmedOrders || 0 },
        { name: "Pending", count: stats?.pendingOrders || 0 },
        { name: "Cancelled", count: stats?.cancelledOrders || 0 },
    ];

    const statCards = [
        {
            title: "Total Orders",
            value: stats?.totalOrders ?? 0,
            icon: Package,
            gradient: "from-blue-500 to-blue-600",
            bg: "bg-blue-50",
            textColor: "text-blue-600",
            change: "+12%"
        },
        {
            title: "Confirmed",
            value: stats?.confirmedOrders ?? 0,
            icon: CheckCircle2,
            gradient: "from-emerald-500 to-green-600",
            bg: "bg-emerald-50",
            textColor: "text-emerald-600",
            change: "+8%"
        },
        {
            title: "Pending",
            value: stats?.pendingOrders ?? 0,
            icon: Clock,
            gradient: "from-amber-500 to-orange-500",
            bg: "bg-amber-50",
            textColor: "text-amber-600",
            change: "-3%"
        },
        {
            title: "Cancelled",
            value: stats?.cancelledOrders ?? 0,
            icon: XCircle,
            gradient: "from-rose-500 to-red-600",
            bg: "bg-rose-50",
            textColor: "text-rose-600",
            change: "-1%"
        },
    ];

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="md:block">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard</h1>
                <div className="flex items-center gap-2 mt-1">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-slate-500 text-sm font-medium">Real-time sync active</p>
                </div>
            </div>

            {/* ── Mobile: Hero confirmation rate pill ── */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 }}
                className="md:hidden relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 p-6 text-white shadow-xl shadow-indigo-200"
            >
                {/* decorative circles */}
                <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full" />
                <div className="absolute -right-2 top-16 w-24 h-24 bg-white/5 rounded-full" />

                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest">Confirmation Rate</p>
                        <p className="text-5xl font-black mt-1">{stats?.confirmationRate ?? 0}<span className="text-2xl font-bold text-indigo-200">%</span></p>
                        <div className="flex items-center gap-1.5 mt-2">
                            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-300" />
                            <span className="text-emerald-300 text-xs font-bold">Healthy rate — keep it up!</span>
                        </div>
                    </div>
                    <div className="w-20 h-20 relative">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                            <circle cx="40" cy="40" r="32" stroke="rgba(255,255,255,0.15)" strokeWidth="8" fill="none" />
                            <circle
                                cx="40" cy="40" r="32"
                                stroke="white" strokeWidth="8" fill="none"
                                strokeDasharray={2 * Math.PI * 32}
                                strokeDashoffset={2 * Math.PI * 32 * (1 - (stats?.confirmationRate || 0) / 100)}
                                strokeLinecap="round"
                                className="transition-all duration-1000"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ── Stat Cards Grid ── */}
            {/* Mobile: 2-column grid  |  Desktop: 4-column grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                {statCards.map((card, idx) => (
                    <motion.div
                        key={card.title}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + idx * 0.06, duration: 0.35 }}
                        className="mobile-card bg-white rounded-2xl p-4 md:p-5"
                    >
                        <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                            <card.icon className={`w-4.5 h-4.5 ${card.textColor}`} style={{ width: 18, height: 18 }} />
                        </div>
                        <p className="text-2xl md:text-3xl font-black text-slate-900">{card.value}</p>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">{card.title}</p>
                    </motion.div>
                ))}
            </div>

            {/* ── Charts Row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">

                {/* Donut chart — desktop only */}
                <PremiumCard delay={0.4} className="hidden md:flex lg:col-span-1 flex-col items-center justify-center text-center py-10">
                    <h3 className="text-lg font-bold text-slate-800 mb-8 w-full text-left px-2">Performance</h3>
                    <div className="relative w-48 h-48 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                            <circle
                                cx="96" cy="96" r="80"
                                stroke="currentColor" strokeWidth="12" fill="transparent"
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

                {/* Bar chart */}
                <PremiumCard delay={0.5} className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-base font-bold text-slate-800">Volume Analysis</h3>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 rounded-xl">
                            <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                            <span className="text-xs font-bold text-indigo-600">Live</span>
                        </div>
                    </div>
                    <div className="h-56 md:h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#F8FAFC', radius: 8 }}
                                    contentStyle={{
                                        borderRadius: '16px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                        background: '#fff',
                                        padding: '12px'
                                    }}
                                />
                                <Bar
                                    dataKey="count"
                                    radius={[10, 10, 10, 10]}
                                    barSize={40}
                                    fill="url(#barGradient)"
                                />
                                <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#6366f1" />
                                        <stop offset="100%" stopColor="#8b5cf6" />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </PremiumCard>
            </div>

            {/* ── Mobile Quick Actions ── */}
            <div className="md:hidden">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Quick Actions</p>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { label: "View Orders", href: "/orders", icon: Package, color: "from-blue-500 to-indigo-600" },
                        { label: "Bot Setup", href: "/bot-setup", icon: Zap, color: "from-purple-500 to-indigo-600" },
                    ].map((action) => (
                        <a
                            key={action.label}
                            href={action.href}
                            className={`flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br ${action.color} text-white shadow-lg tap-active`}
                        >
                            <action.icon className="w-5 h-5" />
                            <span className="font-bold text-sm">{action.label}</span>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}

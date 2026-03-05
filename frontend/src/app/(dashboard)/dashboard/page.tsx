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
import { Loader2 } from "lucide-react";

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
        return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin w-8 h-8 text-indigo-600" /></div>;
    }

    const chartData = [
        { name: "Confirmed", count: stats?.confirmedOrders || 0, fill: "#10B981" },
        { name: "Pending", count: stats?.pendingOrders || 0, fill: "#F59E0B" },
        { name: "Cancelled", count: stats?.cancelledOrders || 0, fill: "#EF4444" },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Insights</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500">Total Orders</p>
                    <p className="mt-2 text-3xl font-semibold text-gray-900">{stats?.totalOrders}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-green-600">Confirmed</p>
                    <p className="mt-2 text-3xl font-semibold text-gray-900">{stats?.confirmedOrders}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-yellow-600">Pending</p>
                    <p className="mt-2 text-3xl font-semibold text-gray-900">{stats?.pendingOrders}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-red-600">Cancelled</p>
                    <p className="mt-2 text-3xl font-semibold text-gray-900">{stats?.cancelledOrders}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmation Rate</h3>
                    <div className="flex items-center justify-center h-48">
                        <div className="text-center">
                            <span className="text-5xl font-bold text-indigo-600">{stats?.confirmationRate}%</span>
                            <p className="text-sm text-gray-500 mt-2">Overall Confirmation Rate</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Orders Overview</h3>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

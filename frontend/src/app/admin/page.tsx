"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { Loader2 } from "lucide-react";

export default function AdminDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchAdminStats = async () => {
            try {
                const { data } = await api.get("/brands/admin");
                setStats(data);
            } catch (err: any) {
                if (err.response?.status === 403) {
                    setError("You do not have permission to view the admin dashboard.");
                } else {
                    setError("Failed to fetch admin statistics.");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchAdminStats();
    }, [user]);

    if (loading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin w-8 h-8 text-indigo-600" /></div>;
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center px-4">
                <div className="bg-red-50 p-6 rounded-xl border border-red-200 mt-8">
                    <h2 className="text-xl font-bold text-red-700 mb-2">Access Denied</h2>
                    <p className="text-red-600">{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Admin Panel (Hidden)</h1>
                    <p className="text-gray-500 mt-2">Platform-wide overview of operations and metrics.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <p className="text-sm font-medium text-gray-500">Total Brands</p>
                        <p className="mt-2 text-4xl font-semibold text-gray-900">{stats?.totalBrands}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <p className="text-sm font-medium text-gray-500">Total System Orders</p>
                        <p className="mt-2 text-4xl font-semibold text-gray-900">{stats?.totalOrders}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <p className="text-sm font-medium text-gray-500">Global Confirmation Rate</p>
                        <p className="mt-2 text-4xl font-semibold text-indigo-600">{stats?.globalConfirmationRate}%</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                        <h3 className="text-lg font-semibold text-gray-800">Platform Tenants (Brands List)</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-white">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders Generated</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Confirmation Rate</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {stats?.brandList?.map((brand: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{brand.brand_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{brand.total_orders}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-medium">{brand.confirmation_rate}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    )
}

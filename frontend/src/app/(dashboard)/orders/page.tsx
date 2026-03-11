"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { format } from "date-fns";
import { Loader2, Search, Filter, Download, MoreHorizontal } from "lucide-react";
import { PremiumCard } from "@/components/ui/PremiumComponents";

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await api.get("/orders");
                setOrders(data);
            } catch (err) {
                console.error("Failed to fetch orders", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending":
                return "bg-amber-50 text-amber-700 border-amber-100";
            case "confirmed":
                return "bg-emerald-50 text-emerald-700 border-emerald-100";
            case "cancelled":
                return "bg-rose-50 text-rose-700 border-rose-100";
            default:
                return "bg-slate-50 text-slate-700 border-slate-100";
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-[60vh] space-y-4">
                <Loader2 className="animate-spin w-10 h-10 text-indigo-600" />
                <p className="text-slate-500 font-medium">Fetching orders...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Recent Orders</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage and track your customer orders in real-time.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                        <Download className="w-5 h-5" />
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                        <Filter className="w-4 h-4" />
                        <span>Filter</span>
                    </button>
                </div>
            </div>

            <PremiumCard className="p-0 overflow-hidden border-none" delay={0.1}>
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by order ID or customer..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none text-slate-600 font-medium"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Order ID</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Customer</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Product</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-4 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {orders.map((order: any, idx) => (
                                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <span className="text-sm font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-lg">#{order.order_number}</span>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-900">{order.customer_name}</span>
                                            <span className="text-xs text-slate-500 font-medium">{order.phone}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-600">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-700">{order.product_name}</span>
                                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">{order.product_color || "Standard"}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <span className="text-sm font-black text-slate-900">{order.price}</span>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <span className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg border shadow-sm ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <span className="text-sm text-slate-500 font-medium">{format(new Date(order.created_at), 'MMM d, yyyy')}</span>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap text-right">
                                        <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {orders.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Search className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">No orders found</h3>
                        <p className="text-slate-500 max-w-xs mt-2">Try adjusting your filters or search terms to find what you're looking for.</p>
                    </div>
                )}
            </PremiumCard>
        </div>
    );
}


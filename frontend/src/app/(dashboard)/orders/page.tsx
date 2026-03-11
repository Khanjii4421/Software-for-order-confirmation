"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { format } from "date-fns";
import { Loader2, Search, Package, Phone, Calendar, ChevronRight, Download, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");

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

    const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string }> = {
        pending: { label: "Pending", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
        confirmed: { label: "Confirmed", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400" },
        cancelled: { label: "Cancelled", bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-400" },
    };

    const filtered = orders.filter((o: any) => {
        const matchSearch =
            !search ||
            o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
            o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
            o.phone?.includes(search);
        const matchStatus = filterStatus === "all" || o.status === filterStatus;
        return matchSearch && matchStatus;
    });

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-[60vh] space-y-4">
                <Loader2 className="animate-spin w-10 h-10 text-indigo-600" />
                <p className="text-slate-500 font-semibold">Fetching orders...</p>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Orders</h1>
                    <p className="text-slate-400 text-sm font-medium mt-0.5">{orders.length} total orders</p>
                </div>
                <button className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 shadow-sm tap-active">
                    <Download className="w-4 h-4" />
                </button>
            </div>

            {/* Search bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search order, customer, phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200/60 rounded-2xl text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 shadow-sm"
                />
            </div>

            {/* Filter chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {["all", "pending", "confirmed", "cancelled"].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all tap-active ${
                            filterStatus === status
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                                : "bg-white text-slate-500 border border-slate-200"
                        }`}
                    >
                        {status === "all" ? "All" : status}
                    </button>
                ))}
            </div>

            {/* ── Desktop Table ── */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Order ID</th>
                            <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Customer</th>
                            <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Product</th>
                            <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                            <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filtered.map((order: any) => {
                            const sc = statusConfig[order.status] || { label: order.status, bg: "bg-slate-50", text: "text-slate-600", dot: "bg-slate-400" };
                            return (
                                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-lg">#{order.order_number}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-slate-900">{order.customer_name}</p>
                                        <p className="text-xs text-slate-500">{order.phone}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-semibold text-slate-700">{order.product_name}</p>
                                        <p className="text-xs text-slate-400 uppercase font-bold">{order.product_color || "Standard"}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-black text-slate-900">{order.price}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${sc.bg} ${sc.text}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                                            {sc.label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-slate-500">{format(new Date(order.created_at), 'MMM d, yyyy')}</span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filtered.length === 0 && (
                    <div className="py-20 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Search className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">No orders found</h3>
                        <p className="text-slate-500 max-w-xs mt-2 text-sm">Try adjusting your filters.</p>
                    </div>
                )}
            </div>

            {/* ── Mobile Cards List ── */}
            <div className="md:hidden space-y-3">
                {filtered.length === 0 ? (
                    <div className="py-20 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <Package className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">No orders found</h3>
                        <p className="text-sm text-slate-400 mt-1">Try a different search or filter.</p>
                    </div>
                ) : (
                    filtered.map((order: any, idx: number) => {
                        const sc = statusConfig[order.status] || { label: order.status, bg: "bg-slate-50", text: "text-slate-600", dot: "bg-slate-400" };
                        return (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.04 }}
                                className="mobile-card bg-white rounded-2xl p-4 tap-active"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                                            <Package className="w-4 h-4 text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900">#{order.order_number}</p>
                                            <p className="text-xs text-slate-400 font-medium">
                                                {format(new Date(order.created_at), 'MMM d, yyyy')}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${sc.bg} ${sc.text}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                                        {sc.label}
                                    </span>
                                </div>

                                <div className="border-t border-slate-50 pt-3 space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                                            <Phone className="w-3 h-3 text-slate-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-800 truncate">{order.customer_name}</p>
                                            <p className="text-xs text-slate-400">{order.phone}</p>
                                        </div>
                                        <p className="text-sm font-black text-indigo-600 flex-shrink-0">{order.price}</p>
                                    </div>

                                    <div className="flex items-center gap-2 pl-8">
                                        <p className="text-xs text-slate-500 font-semibold">{order.product_name}</p>
                                        {order.product_color && (
                                            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg font-bold uppercase">
                                                {order.product_color}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

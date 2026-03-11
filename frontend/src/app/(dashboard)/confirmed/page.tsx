"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { format } from "date-fns";
import { Loader2, CheckCircle, Search, Download, ExternalLink } from "lucide-react";
import { PremiumCard } from "@/components/ui/PremiumComponents";

export default function ConfirmedOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await api.get("/orders/confirmed");
                setOrders(data);
            } catch (err) {
                console.error("Failed to fetch confirmed orders", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-[60vh] space-y-4">
                <Loader2 className="animate-spin w-10 h-10 text-indigo-600" />
                <p className="text-slate-500 font-medium">Loading confirmed database...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Confirmed Orders
                        <div className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-lg text-xs font-black uppercase tracking-widest">Verified</div>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Export your confirmed orders for fulfillment and shipping.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button className="flex items-center space-x-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">
                        <Download className="w-4 h-4" />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            <PremiumCard className="p-0 overflow-hidden border-none" delay={0.1}>
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search confirmed orders..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none text-slate-600 font-medium"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                <th className="px-6 py-4 text-left">Customer</th>
                                <th className="px-6 py-4 text-left">Contact</th>
                                <th className="px-6 py-4 text-left">Delivery Address</th>
                                <th className="px-6 py-4 text-left">Order Details</th>
                                <th className="px-6 py-4 text-left">Amount</th>
                                <th className="px-6 py-4 text-left">Confirmed At</th>
                                <th className="px-6 py-4 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {orders.map((order: any) => (
                                <tr key={order.id} className="hover:bg-emerald-50/30 transition-colors group">
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs uppercase">
                                                {order.customer_name.charAt(0)}
                                            </div>
                                            <span className="text-sm font-bold text-slate-900">{order.customer_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-600 font-medium">
                                        {order.phone}
                                    </td>
                                    <td className="px-6 py-5 text-sm text-slate-500 max-w-[200px]">
                                        <p className="truncate font-medium" title={order.address}>{order.address}</p>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-800">{order.product_name}</span>
                                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-tight">{order.product_color || "Standard"}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <span className="text-sm font-black text-slate-900">{order.price}</span>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-emerald-600">
                                                {order.confirmed_at ? format(new Date(order.confirmed_at), 'MMM d, yyyy') : 'N/A'}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-medium tracking-tight">
                                                {order.confirmed_at ? format(new Date(order.confirmed_at), 'hh:mm a') : ''}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap text-right">
                                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-slate-100">
                                            <ExternalLink className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {orders.length === 0 && (
                    <div className="py-24 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle className="w-10 h-10 text-emerald-200" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">No confirmed orders yet</h3>
                        <p className="text-slate-500 max-w-sm mt-2 font-medium">Orders will appear here once customers confirm them via the WhatsApp automated message.</p>
                    </div>
                )}
            </PremiumCard>
        </div>
    );
}


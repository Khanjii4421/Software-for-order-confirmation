"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    MessageSquare, Phone, MapPin, Package, DollarSign,
    Calendar, Eye, X, Search, Filter, RefreshCw,
    ChevronDown, UserCircle, CheckCircle2, Clock,
    Download, ArrowUpRight, Bot, Image as ImageIcon,
    Loader2, AlertCircle, TrendingUp, ShoppingBag
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { format } from "date-fns";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type AIOrder = {
    id: string;
    customer_name: string;
    customer_phone: string;
    city: string | null;
    address: string | null;
    product_name: string | null;
    product_image_url: string | null;
    final_price: number | null;
    status: string;
    confirmation_sent: boolean;
    created_at: string;
    conversation_id: string | null;
    conversation?: {
        messages: string;
        stage: string;
    };
};

type ChatMessage = { role: string; content: string; timestamp: string };

export default function WhatsAppOrdersPage() {
    const { user } = useAuth();
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const [orders, setOrders] = useState<AIOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedOrder, setSelectedOrder] = useState<AIOrder | null>(null);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatLoading, setChatLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/ai-bot/orders`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setOrders(Array.isArray(data) ? data : []);
        } catch {
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchOrders, 30000);
        return () => clearInterval(interval);
    }, []);

    const openChat = async (order: AIOrder) => {
        setSelectedOrder(order);
        setChatMessages([]);
        if (!order.conversation_id) return;
        setChatLoading(true);
        try {
            const res = await fetch(`${API}/api/ai-bot/orders/${order.id}/chat`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.messages) setChatMessages(data.messages);
        } catch {
            setChatMessages([]);
        } finally {
            setChatLoading(false);
        }
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages]);

    const filtered = orders.filter(o => {
        const q = search.toLowerCase();
        return (
            o.customer_name?.toLowerCase().includes(q) ||
            o.customer_phone?.includes(q) ||
            o.city?.toLowerCase().includes(q) ||
            o.product_name?.toLowerCase().includes(q)
        );
    });

    const stats = {
        total: orders.length,
        today: orders.filter(o => {
            const d = new Date(o.created_at);
            const now = new Date();
            return d.toDateString() === now.toDateString();
        }).length,
        confirmed: orders.filter(o => o.status === "confirmed").length,
        revenue: orders.reduce((sum, o) => sum + (o.final_price || 0), 0),
    };

    const StatCard = ({ icon: Icon, label, value, color }: any) => (
        <div className={`bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4 flex items-center gap-4`}>
            <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
                <p className="text-2xl font-black text-slate-900">{value}</p>
                <p className="text-xs text-slate-500 font-medium">{label}</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                            <MessageSquare className="w-6 h-6 text-white" />
                        </div>
                        WhatsApp AI Orders
                    </h1>
                    <p className="text-slate-500 mt-1.5 text-sm">Orders confirmed by your AI Sales Agent in real time</p>
                </div>
                <button onClick={fetchOrders} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition shadow-sm">
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard icon={ShoppingBag} label="Total AI Orders" value={stats.total} color="bg-indigo-500" />
                <StatCard icon={TrendingUp} label="Orders Today" value={stats.today} color="bg-blue-500" />
                <StatCard icon={CheckCircle2} label="Confirmed" value={stats.confirmed} color="bg-emerald-500" />
                <StatCard icon={DollarSign} label="Total Revenue" value={`${stats.revenue.toLocaleString()}`} color="bg-purple-500" />
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name, phone, city, or product..."
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                />
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                            <Bot className="w-8 h-8 text-slate-400" />
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-slate-700">No AI orders yet</p>
                            <p className="text-sm text-slate-400 mt-1">Orders confirmed by your AI bot will appear here</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                                        <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Phone</th>
                                        <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">City</th>
                                        <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                                        <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Price</th>
                                        <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                        <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Chat</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filtered.map(order => (
                                        <motion.tr
                                            key={order.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="hover:bg-slate-50 transition-colors"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    {order.product_image_url ? (
                                                        <img src={`${API}${order.product_image_url}`} alt="" className="w-9 h-9 rounded-xl object-cover border border-slate-200" />
                                                    ) : (
                                                        <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
                                                            <UserCircle className="w-5 h-5 text-indigo-500" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-bold text-slate-800">{order.customer_name}</p>
                                                        <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[120px]">{order.address || "—"}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="font-mono text-slate-600 text-xs">{order.customer_phone}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1 text-slate-600">
                                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                    {order.city || "—"}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="text-slate-700 font-medium">{order.product_name || "—"}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="font-bold text-emerald-700">
                                                    {order.final_price ? `PKR ${order.final_price.toLocaleString()}` : "—"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${order.status === "confirmed"
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : "bg-slate-100 text-slate-600"
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${order.status === "confirmed" ? "bg-emerald-500" : "bg-slate-400"}`} />
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1 text-slate-500 text-xs">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {format(new Date(order.created_at), "MMM d, HH:mm")}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <button
                                                    onClick={() => openChat(order)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition border border-indigo-200"
                                                >
                                                    <MessageSquare className="w-3.5 h-3.5" />
                                                    View
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="md:hidden divide-y divide-slate-100">
                            {filtered.map(order => (
                                <div key={order.id} className="p-4 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center">
                                                <UserCircle className="w-4 h-4 text-indigo-500" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">{order.customer_name}</p>
                                                <p className="text-xs text-slate-500 font-mono">{order.customer_phone}</p>
                                            </div>
                                        </div>
                                        <span className="font-black text-emerald-600 text-sm">
                                            {order.final_price ? `PKR ${order.final_price.toLocaleString()}` : "—"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-slate-500">
                                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{order.city || "—"}</span>
                                        <span className="flex items-center gap-1"><Package className="w-3 h-3" />{order.product_name || "—"}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${order.status === "confirmed" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                                            {order.status}
                                        </span>
                                        <button onClick={() => openChat(order)} className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                                            View Chat <ArrowUpRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Chat Drawer */}
            <AnimatePresence>
                {selectedOrder && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                            onClick={() => setSelectedOrder(null)}
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
                        >
                            {/* Drawer Header */}
                            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600">
                                <div className="flex items-center gap-3 text-white">
                                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                                        <Bot className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">{selectedOrder.customer_name}</p>
                                        <p className="text-xs opacity-75 font-mono">{selectedOrder.customer_phone}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-full hover:bg-white/20 text-white transition">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Order Summary */}
                            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    {[
                                        { icon: MapPin, label: "City", val: selectedOrder.city || "—" },
                                        { icon: Package, label: "Product", val: selectedOrder.product_name || "—" },
                                        { icon: DollarSign, label: "Final Price", val: selectedOrder.final_price ? `PKR ${selectedOrder.final_price.toLocaleString()}` : "—" },
                                        { icon: Clock, label: "Ordered", val: format(new Date(selectedOrder.created_at), "MMM d, HH:mm") },
                                    ].map(({ icon: Icon, label, val }) => (
                                        <div key={label} className="flex items-center gap-1.5 text-slate-600">
                                            <Icon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                            <span className="font-medium">{label}:</span>
                                            <span className="font-bold truncate">{val}</span>
                                        </div>
                                    ))}
                                </div>
                                {selectedOrder.address && (
                                    <div className="mt-2 text-xs text-slate-600 flex items-start gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                                        <span><span className="font-medium">Address: </span>{selectedOrder.address}</span>
                                    </div>
                                )}
                                {selectedOrder.confirmation_sent && (
                                    <div className="mt-2">
                                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-xs font-bold">
                                            <CheckCircle2 className="w-3 h-3" /> Confirmation Sent
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Chat Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[url('data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23e2e8f0\' fill-opacity=\'0.4\'%3E%3Ccircle cx=\'1\' cy=\'1\' r=\'1\'/%3E%3C/g%3E%3C/svg%3E')]">
                                {chatLoading ? (
                                    <div className="flex items-center justify-center h-32">
                                        <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                                    </div>
                                ) : chatMessages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-32 text-slate-400 text-sm">
                                        <MessageSquare className="w-8 h-8 mb-2" />
                                        No conversation recorded
                                    </div>
                                ) : (
                                    chatMessages.map((msg, i) => (
                                        <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${msg.role === "user"
                                                ? "bg-indigo-600 text-white rounded-br-sm"
                                                : "bg-white text-slate-700 rounded-bl-sm border border-slate-100"
                                                }`}>
                                                {msg.role === "assistant" && (
                                                    <div className="flex items-center gap-1.5 mb-1.5">
                                                        <Bot className="w-3.5 h-3.5 text-indigo-500" />
                                                        <span className="text-[10px] font-bold text-indigo-600">AI Agent</span>
                                                    </div>
                                                )}
                                                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                                {msg.timestamp && (
                                                    <p className={`text-[10px] mt-1 ${msg.role === "user" ? "text-indigo-200" : "text-slate-400"}`}>
                                                        {format(new Date(msg.timestamp), "HH:mm")}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={chatEndRef} />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

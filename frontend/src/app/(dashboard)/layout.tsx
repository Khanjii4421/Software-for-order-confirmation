"use client";

import { useAuth } from "@/lib/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
    LayoutDashboard,
    ShoppingCart,
    CheckCircle,
    Settings,
    MessageCircle,
    LogOut,
    Menu,
    X,
    BookOpen,
    User,
    Bot,
    MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full"
                />
                <p className="mt-4 text-slate-600 font-medium">Loading Dashboard...</p>
            </div>
        );
    }

    const navigation = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Orders", href: "/orders", icon: ShoppingCart },
        { name: "Confirmed Orders", href: "/confirmed", icon: CheckCircle },
        { name: "Bot Setup", href: "/bot-setup", icon: Bot, highlight: false },
        { name: "WhatsApp Orders", href: "/whatsapp-orders", icon: MessageSquare, highlight: false },
        { name: "Integrations", href: "/integrations", icon: Settings },
        { name: "Instructions", href: "/instructions", icon: BookOpen, highlight: true },
    ];


    return (
        <div className="min-h-screen bg-[#F8FAFC] flex selection:bg-indigo-100 selection:text-indigo-900">
            {/* Sidebar for desktop */}
            <aside className="hidden md:flex flex-col w-72 bg-white/70 backdrop-blur-xl border-r border-slate-200/50 fixed h-full z-30">
                <div className="flex items-center px-8 h-20">
                    <Link href="/dashboard" className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                            <CheckCircle className="text-white w-6 h-6" />
                        </div>
                        <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-600">
                            OrderConfirm
                        </span>
                    </Link>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
                    <nav className="space-y-1.5">
                        <p className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Main Menu</p>
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`group flex items-center px-4 py-3 text-sm font-semibold rounded-2xl transition-all duration-200 ${isActive
                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 ring-1 ring-indigo-600"
                                        : "text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm border border-transparent hover:border-slate-100"
                                        } ${item.highlight && !isActive ? "bg-indigo-50/50 text-indigo-600 border-indigo-100" : ""}`}
                                >
                                    <item.icon
                                        className={`mr-3.5 h-5 w-5 transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-600"
                                            }`}
                                    />
                                    {item.name}
                                    {item.highlight && (
                                        <span className="ml-auto flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="pt-2">
                        <p className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Account</p>
                        <button
                            onClick={logout}
                            className="w-full group flex items-center px-4 py-3 text-sm font-semibold rounded-2xl text-slate-600 hover:bg-white hover:text-red-600 hover:shadow-sm border border-transparent hover:border-red-100 transition-all duration-200"
                        >
                            <LogOut className="mr-3.5 h-5 w-5 text-slate-400 group-hover:text-red-600 transition-colors" />
                            Sign Out
                        </button>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                    <div className="flex items-center space-x-3 p-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                            {user?.brand_name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{user?.brand_name}</p>
                            <p className="text-[10px] text-slate-500 truncate font-medium uppercase tracking-wider">Business Plan</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="flex-1 md:ml-72 flex flex-col min-w-0">
                <header className="md:hidden sticky top-0 z-40 flex items-center justify-between bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 h-16">
                    <Link href="/dashboard" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <CheckCircle className="text-white w-5 h-5" />
                        </div>
                        <span className="text-xl font-bold text-slate-900">OrderConfirm</span>
                    </Link>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 rounded-xl bg-slate-50 text-slate-600"
                    >
                        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </header>

                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="md:hidden fixed inset-x-0 top-16 bg-white border-b border-slate-200 z-30 shadow-2xl p-4 overflow-y-auto max-h-[calc(100vh-4rem)]"
                        >
                            <nav className="space-y-1">
                                {navigation.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`flex items-center px-4 py-3 rounded-xl text-base font-bold transition-all ${isActive
                                                ? "bg-indigo-50 text-indigo-600"
                                                : "text-slate-600 hover:bg-slate-50"
                                                }`}
                                        >
                                            <item.icon className="mr-3 h-5 w-5" />
                                            {item.name}
                                        </Link>
                                    )
                                })}
                                <button
                                    onClick={logout}
                                    className="flex items-center w-full px-4 py-3 rounded-xl text-base font-bold text-red-600 hover:bg-red-50 transition-all"
                                >
                                    <LogOut className="mr-3 h-5 w-5" />
                                    Logout
                                </button>
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>

                <main className="flex-1 p-6 md:p-10">
                    <div className="max-w-6xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4 }}
                        >
                            {children}
                        </motion.div>
                    </div>
                </main>

                <footer className="py-6 px-10 border-t border-slate-200/40 text-center">
                    <p className="text-slate-400 text-xs font-medium">
                        © {new Date().getFullYear()} OrderConfirm - Premium WhatsApp Automation.
                    </p>
                </footer>
            </div>
        </div>
    );
}


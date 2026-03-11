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
    Bot,
    MessageSquare,
    ChevronRight,
    Bell,
    Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, mobileLabel: "Home" },
    { name: "Orders", href: "/orders", icon: ShoppingCart, mobileLabel: "Orders" },
    { name: "Confirmed", href: "/confirmed", icon: CheckCircle, mobileLabel: "Done" },
    { name: "Bot Setup", href: "/bot-setup", icon: Bot, mobileLabel: "Bot" },
    { name: "More", href: "#more", icon: Menu, mobileLabel: "More" },
];

const allNavigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Orders", href: "/orders", icon: ShoppingCart },
    { name: "Confirmed Orders", href: "/confirmed", icon: CheckCircle },
    { name: "Bot Setup", href: "/bot-setup", icon: Bot, highlight: false },
    { name: "WhatsApp Orders", href: "/whatsapp-orders", icon: MessageSquare, highlight: false },
    { name: "Integrations", href: "/integrations", icon: Settings },
    { name: "Instructions", href: "/instructions", icon: BookOpen, highlight: true },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    // Close drawer on route change
    useEffect(() => {
        setIsMoreOpen(false);
        setIsMobileMenuOpen(false);
    }, [pathname]);

    if (loading || !user) {
        return (
            <div className="min-h-dvh flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
                <motion.div
                    className="relative"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-300 mb-6 mx-auto">
                        <CheckCircle className="text-white w-8 h-8" />
                    </div>
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto"
                    />
                </motion.div>
                <p className="mt-4 text-slate-500 font-semibold text-sm">Loading your workspace...</p>
            </div>
        );
    }

    const isActive = (href: string) => pathname === href;

    return (
        <div className="min-h-dvh bg-[#F8FAFC] flex selection:bg-indigo-100 selection:text-indigo-900">

            {/* ──────────────────────────────────────────────────
                DESKTOP SIDEBAR
            ────────────────────────────────────────────────── */}
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
                        {allNavigation.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`group flex items-center px-4 py-3 text-sm font-semibold rounded-2xl transition-all duration-200 ${
                                        active
                                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 ring-1 ring-indigo-600"
                                            : "text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm border border-transparent hover:border-slate-100"
                                    } ${item.highlight && !active ? "bg-indigo-50/50 text-indigo-600 border-indigo-100" : ""}`}
                                >
                                    <item.icon className={`mr-3.5 h-5 w-5 transition-colors ${active ? "text-white" : "text-slate-400 group-hover:text-indigo-600"}`} />
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
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-200">
                            {user?.brand_name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{user?.brand_name}</p>
                            <p className="text-[10px] text-slate-500 truncate font-medium uppercase tracking-wider">Business Plan</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ──────────────────────────────────────────────────
                MAIN CONTENT AREA
            ────────────────────────────────────────────────── */}
            <div className="flex-1 md:ml-72 flex flex-col min-w-0">

                {/* ── Desktop top bar ── */}
                <div className="hidden md:flex items-center justify-between px-10 py-6">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Welcome back</p>
                        <h2 className="text-2xl font-black text-slate-900 mt-0.5">{user?.brand_name}</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <span className="absolute top-0 right-0 w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                            <button className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-indigo-600 shadow-sm transition-all">
                                <Bell className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-200 text-sm">
                            {user?.brand_name?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </div>

                {/* ── Mobile top header ── */}
                <header className="md:hidden mobile-header px-5 py-4 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center space-x-2">
                        <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200">
                            <CheckCircle className="text-white w-5 h-5" />
                        </div>
                        <span className="text-lg font-black text-slate-900">OrderConfirm</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                            <button className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500">
                                <Bell className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-200 text-sm">
                            {user?.brand_name?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* ── Page content ── */}
                <main className="flex-1 px-4 py-4 md:px-10 md:py-2 pb-24 md:pb-10">
                    <div className="max-w-6xl mx-auto">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, ease: [0.34, 1.1, 0.64, 1] }}
                            className="page-enter"
                        >
                            {children}
                        </motion.div>
                    </div>
                </main>

                {/* ── Desktop footer ── */}
                <footer className="hidden md:block py-6 px-10 border-t border-slate-200/40 text-center">
                    <p className="text-slate-400 text-xs font-medium">
                        © {new Date().getFullYear()} OrderConfirm — Premium WhatsApp Automation
                    </p>
                </footer>
            </div>

            {/* ──────────────────────────────────────────────────
                MOBILE BOTTOM NAVIGATION (Flutter-style)
            ────────────────────────────────────────────────── */}
            <nav className="bottom-nav md:hidden">
                <div className="flex items-center justify-around px-2 py-2">
                    {navigation.map((item) => {
                        const active = item.href !== "#more" ? isActive(item.href) : isMoreOpen;
                        return (
                            <button
                                key={item.name}
                                onClick={() => {
                                    if (item.href === "#more") {
                                        setIsMoreOpen(!isMoreOpen);
                                    } else {
                                        router.push(item.href);
                                    }
                                }}
                                className="flex flex-col items-center justify-center flex-1 py-1 gap-1 group tap-active"
                            >
                                <motion.div
                                    animate={{
                                        scale: active ? 1 : 0.9,
                                        backgroundColor: active ? "rgb(238 240 255)" : "transparent"
                                    }}
                                    transition={{ duration: 0.2 }}
                                    className="relative w-12 h-7 rounded-full flex items-center justify-center"
                                >
                                    <item.icon
                                        className={`w-5 h-5 transition-colors duration-200 ${
                                            active ? "text-indigo-600" : "text-slate-400"
                                        }`}
                                    />
                                </motion.div>
                                <span className={`text-[10px] font-bold transition-colors duration-200 ${
                                    active ? "text-indigo-600" : "text-slate-400"
                                }`}>
                                    {item.mobileLabel}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </nav>

            {/* ──────────────────────────────────────────────────
                MOBILE "MORE" DRAWER
            ────────────────────────────────────────────────── */}
            <AnimatePresence>
                {isMoreOpen && (
                    <>
                        <motion.div
                            key="backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                            onClick={() => setIsMoreOpen(false)}
                        />
                        <motion.div
                            key="drawer"
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 28, stiffness: 300 }}
                            className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-3xl shadow-2xl overflow-hidden"
                            style={{ paddingBottom: "calc(80px + env(safe-area-inset-bottom, 8px))" }}
                        >
                            {/* Drawer handle */}
                            <div className="flex justify-center pt-3 pb-1">
                                <div className="w-10 h-1 bg-slate-200 rounded-full" />
                            </div>

                            {/* User info */}
                            <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 mx-4 rounded-2xl mt-2">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-200">
                                    {user?.brand_name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-black text-slate-900">{user?.brand_name}</p>
                                    <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">Business Plan</p>
                                </div>
                            </div>

                            {/* Extra nav items */}
                            <div className="px-4 pt-4 space-y-1">
                                {[
                                    { name: "WhatsApp Orders", href: "/whatsapp-orders", icon: MessageSquare },
                                    { name: "Integrations", href: "/integrations", icon: Settings },
                                    { name: "Instructions", href: "/instructions", icon: BookOpen },
                                ].map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setIsMoreOpen(false)}
                                        className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all ${
                                            isActive(item.href)
                                                ? "bg-indigo-600 text-white"
                                                : "text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                                                isActive(item.href) ? "bg-white/20" : "bg-slate-100"
                                            }`}>
                                                <item.icon className={`w-4 h-4 ${isActive(item.href) ? "text-white" : "text-slate-500"}`} />
                                            </div>
                                            <span className="font-bold text-[15px]">{item.name}</span>
                                        </div>
                                        <ChevronRight className={`w-4 h-4 ${isActive(item.href) ? "text-white/70" : "text-slate-300"}`} />
                                    </Link>
                                ))}

                                <div className="border-t border-slate-100 mt-3 pt-3">
                                    <button
                                        onClick={() => { setIsMoreOpen(false); logout(); }}
                                        className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-rose-600 hover:bg-rose-50 active:bg-rose-100 transition-all"
                                    >
                                        <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center">
                                            <LogOut className="w-4 h-4 text-rose-500" />
                                        </div>
                                        <span className="font-bold text-[15px]">Sign Out</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

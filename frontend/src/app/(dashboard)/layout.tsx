"use client";

import { useAuth } from "@/lib/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import {
    LayoutDashboard,
    ShoppingCart,
    CheckCircle,
    Settings,
    MessageCircle,
    LogOut,
    Menu,
    X
} from "lucide-react";
import { useState } from "react";

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
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    const navigation = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Orders", href: "/orders", icon: ShoppingCart },
        { name: "Confirmed Orders", href: "/confirmed", icon: CheckCircle },
        { name: "Integrations", href: "/integrations", icon: Settings },
        { name: "WhatsApp", href: "/whatsapp", icon: MessageCircle },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar for desktop */}
            <div className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 fixed h-full z-10">
                <div className="flex items-center justify-center h-16 border-b border-gray-200">
                    <span className="text-xl font-bold text-indigo-600">OrderConfirm</span>
                </div>
                <div className="flex-1 overflow-y-auto py-4">
                    <nav className="space-y-1 px-2">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive
                                            ? "bg-indigo-50 text-indigo-600"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                        }`}
                                >
                                    <item.icon
                                        className={`mr-3 flex-shrink-0 h-5 w-5 ${isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-500"
                                            }`}
                                    />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                    <button
                        onClick={logout}
                        className="flex-shrink-0 w-full group block text-left"
                    >
                        <div className="flex items-center">
                            <div>
                                <LogOut className="inline-block h-5 w-5 rounded-full text-gray-400 group-hover:text-gray-500" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Logout</p>
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Mobile Header & Content */}
            <div className="flex-1 md:ml-64 flex flex-col min-w-0">
                <div className="md:hidden flex items-center justify-between bg-white border-b border-gray-200 px-4 py-2">
                    <span className="text-xl font-bold text-indigo-600">OrderConfirm</span>
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white border-b border-gray-200">
                        <nav className="px-2 pt-2 pb-4 space-y-1">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`block px-3 py-2 rounded-md text-base font-medium ${isActive ? "bg-indigo-50 text-indigo-600" : "text-gray-700 hover:bg-gray-50"
                                            }`}
                                    >
                                        {item.name}
                                    </Link>
                                )
                            })}
                            <button
                                onClick={logout}
                                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Logout
                            </button>
                        </nav>
                    </div>
                )}

                <div className="flex-1 p-4 md:p-8 overflow-y-auto">
                    {/* Top Navbar items */}
                    <div className="hidden md:flex justify-end mb-8 items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                {user?.brand_name?.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-gray-700">{user?.brand_name}</span>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}

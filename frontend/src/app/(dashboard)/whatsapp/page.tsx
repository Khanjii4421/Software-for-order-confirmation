"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { Loader2, Smartphone, CheckCircle, RefreshCw, LogOut, Zap, ShieldCheck, HelpCircle, MessageSquare } from "lucide-react";
import io from "socket.io-client";
import QRCode from "react-qr-code";
import Link from "next/link";
import { PremiumCard, PremiumButton } from "@/components/ui/PremiumComponents";

export default function WhatsAppPage() {
    const { user } = useAuth();
    const [status, setStatus] = useState<"disconnected" | "initializing" | "connected">("disconnected");
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingInfo, setLoadingInfo] = useState<{ percent: number, message: string } | null>(null);


    useEffect(() => {
        if (!user) return;

        const checkStatus = async () => {
            try {
                const { data } = await api.get("/whatsapp/status");
                setStatus(data.status);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        checkStatus();

        const socketUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000';
        const socket = io(socketUrl);

        socket.on(`qr-${user.id}`, (data) => {
            setQrCode(data.qr);
            setStatus("initializing");
            setLoadingInfo(null);
        });

        socket.on(`loading-${user.id}`, (data) => {
            setLoadingInfo(data);
            setStatus("initializing");
        });

        socket.on(`ready-${user.id}`, () => {
            setStatus("connected");
            setQrCode(null);
            setLoadingInfo(null);
        });

        return () => {
            socket.disconnect();
        };
    }, [user]);


    const connectWhatsApp = async () => {
        setStatus("initializing");
        setQrCode(null);
        try {
            await api.post("/whatsapp/init");
        } catch (err) {
            console.error(err);
            setStatus("disconnected");
        }
    };

    const logoutWhatsApp = async () => {
        try {
            await api.post("/whatsapp/logout");
            setStatus("disconnected");
            setQrCode(null);
        } catch (err) {
            console.error(err);
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-[60vh] space-y-4">
                <Loader2 className="animate-spin w-10 h-10 text-indigo-600" />
                <p className="text-slate-500 font-medium tracking-tight">Checking connection status...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl space-y-10 pb-20">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">WhatsApp Engine</h1>
                <p className="text-slate-500 font-medium">Link your device to start sending automated order confirmations via WhatsApp Web.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <PremiumCard className="lg:col-span-2 p-8" delay={0.1}>
                    <div className="flex flex-col md:flex-row gap-10 items-start">
                        <div className="flex-1 space-y-6">
                            <div className="flex items-center space-x-4">
                                <div className={`p-4 rounded-2xl shadow-sm transition-all duration-500 ${status === 'connected'
                                    ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200'
                                    : 'bg-slate-50 text-slate-600 ring-1 ring-slate-200'
                                    }`}>
                                    <Smartphone className="w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 leading-tight">
                                        {status === "connected" ? "Successfully Linked" : "Link New Device"}
                                    </h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                                        <span className={`text-xs font-black uppercase tracking-widest ${status === 'connected' ? 'text-emerald-600' : 'text-slate-400'}`}>
                                            {status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-slate-600 font-medium leading-relaxed max-w-md">
                                {status === "connected"
                                    ? "Your WhatsApp session is currently active. All new orders will be automatically processed and sent to your customers for confirmation."
                                    : "Link your WhatsApp by scanning the QR code. This allows OrderConfirm to send messages on your behalf using Web Automation."}
                            </p>

                            <div className="pt-4 flex flex-wrap gap-4">
                                {status === "disconnected" && (
                                    <PremiumButton onClick={connectWhatsApp} className="px-8 py-4">
                                        Initialize Engine
                                    </PremiumButton>
                                )}

                                {status === "initializing" && !qrCode && (
                                    <div className="flex flex-col space-y-4 w-full">
                                        <div className="flex items-center space-x-3 bg-indigo-50 px-6 py-5 rounded-2xl text-indigo-700 font-bold border border-indigo-100 ring-4 ring-indigo-50 animate-pulse">
                                            <Loader2 className="animate-spin w-5 h-5 text-indigo-600" />
                                            <div className="flex flex-col">
                                                <span className="text-sm">{loadingInfo?.message || "Booting WhatsApp Web Instances..."}</span>
                                                <span className="text-[10px] font-medium opacity-70">
                                                    {loadingInfo ? `Progress: ${loadingInfo.percent}%` : "Creating secure sandbox container..."}
                                                </span>
                                            </div>

                                        </div>
                                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3 items-start">
                                            <HelpCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                            <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                                                <strong>Please Wait:</strong> Loading web automation can take 30-60 seconds. <br />
                                                <Link href="/meta-setup" className="font-black underline flex items-center gap-1 mt-1">
                                                    <Zap className="w-3 h-3 fill-amber-500" /> Tired of waiting? Switch to Official Meta API (Instant)
                                                </Link>
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {status === "connected" && (
                                    <button
                                        onClick={logoutWhatsApp}
                                        className="inline-flex items-center px-6 py-3.5 bg-rose-50 text-rose-600 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-rose-100 transition-all border border-rose-200 shadow-sm"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Disconnect Device
                                    </button>
                                )}
                            </div>
                        </div>

                        {status === "initializing" && qrCode && (
                            <div className="flex-shrink-0 flex flex-col items-center space-y-4 p-6 bg-white rounded-3xl shadow-2xl shadow-indigo-100 border border-slate-100 ring-8 ring-slate-50 relative group">
                                <div className="absolute -top-3 -right-3 bg-indigo-600 text-white text-[9px] font-black px-3 py-1 rounded-full shadow-lg z-10 animate-bounce uppercase">Scan Now</div>
                                <div className="bg-white p-2 rounded-xl">
                                    <QRCode value={qrCode} size={220} fgColor="#1E293B" />
                                </div>
                                <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest">
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                    <span>Waiting for scan...</span>
                                </div>
                            </div>
                        )}

                        {status === "connected" && (
                            <div className="flex-shrink-0 flex flex-col items-center justify-center p-8 bg-emerald-50 rounded-3xl border border-emerald-100 shadow-inner">
                                <CheckCircle className="w-20 h-20 text-emerald-500 opacity-20 mb-4" />
                                <div className="text-center">
                                    <span className="text-[10px] font-black uppercase text-emerald-600 tracking-[0.2em]">Fulfillment Status</span>
                                    <p className="text-3xl font-black text-emerald-700 mt-1">Ready</p>
                                </div>
                            </div>
                        )}
                    </div>
                </PremiumCard>

                <PremiumCard className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white border-none shadow-xl flex flex-col justify-between p-8" delay={0.2}>
                    <div>
                        <div className="p-3 bg-white/10 rounded-2xl w-fit mb-6">
                            <Zap className="w-6 h-6 text-indigo-400" />
                        </div>
                        <h3 className="text-2xl font-black mb-3">Meta API Upgrade 🚀</h3>
                        <p className="text-indigo-200/60 text-sm font-medium leading-relaxed mb-6">
                            Manual WhatsApp Web is great, but Official Meta API is <strong>Permanent</strong> and never disconnects.
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-[11px] font-black text-emerald-400 uppercase tracking-wider">
                                <div className="w-5 h-5 bg-emerald-500/10 rounded-full flex items-center justify-center"><ShieldCheck className="w-3 h-3" /></div>
                                Anti-Ban Protocol
                            </div>
                            <div className="flex items-center gap-3 text-[11px] font-black text-indigo-400 uppercase tracking-wider">
                                <div className="w-5 h-5 bg-indigo-500/10 rounded-full flex items-center justify-center"><Zap className="w-3 h-3" /></div>
                                No Battery Required
                            </div>
                            <div className="flex items-center gap-3 text-[11px] font-black text-blue-400 uppercase tracking-wider">
                                <div className="w-5 h-5 bg-blue-500/10 rounded-full flex items-center justify-center"><MessageSquare className="w-3 h-3" /></div>
                                Button Replies
                            </div>
                        </div>
                    </div>

                    <Link
                        href="/meta-setup"
                        className="mt-10 w-full py-4 bg-white/10 hover:bg-white text hover:text-indigo-900 rounded-2xl font-black transition-all border border-white/10 shadow-lg flex items-center justify-center gap-2 group"
                    >
                        Switch to Official API <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </PremiumCard>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { title: "Privacy First", desc: "Your session is isolated in a secure container." },
                    { title: "Auto-Reconnect", desc: "System attempts to restore connection if phone drops." },
                    { title: "Real-time", desc: "Process orders instantly without manual refreshing." }
                ].map((feature, i) => (
                    <div key={i} className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-indigo-100 transition-colors">
                        <h4 className="font-black text-slate-800 text-sm mb-1 uppercase tracking-tight">{feature.title}</h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ChevronRight({ className }: { className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6" /></svg>;
}

"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { Loader2, Smartphone, CheckCircle, RefreshCw } from "lucide-react";
import io from "socket.io-client";
import QRCode from "react-qr-code";

export default function WhatsAppPage() {
    const { user } = useAuth();
    const [status, setStatus] = useState<"disconnected" | "initializing" | "connected">("disconnected");
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

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

        const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
        const socket = io(socketUrl);

        socket.on(`qr-${user.id}`, (data) => {
            setQrCode(data.qr);
            setStatus("initializing");
        });

        socket.on(`ready-${user.id}`, () => {
            setStatus("connected");
            setQrCode(null);
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
        return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin w-8 h-8 text-indigo-600" /></div>;
    }

    return (
        <div className="max-w-4xl space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">WhatsApp Connection</h1>
                <p className="mt-1 text-sm text-gray-500">Connect your WhatsApp number to start confirming orders automatically.</p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 items-center justify-between">
                <div className="flex-1 space-y-4">
                    <div className="flex items-center space-x-3">
                        <div className={`p-3 rounded-full ${status === 'connected' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                            <Smartphone className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                {status === "connected" ? "WhatsApp is Connected" : "Connect WhatsApp Web"}
                            </h2>
                            <p className="text-sm text-gray-500">
                                {status === "connected"
                                    ? "Your number is actively handling order confirmations."
                                    : "Scan the QR code below via WhatsApp Settings > Linked Devices."}
                            </p>
                        </div>
                    </div>

                    <div className="pt-4">
                        {status === "disconnected" && (
                            <button
                                onClick={connectWhatsApp}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 shadow-sm transition-colors"
                            >
                                Generate QR Code
                            </button>
                        )}

                        {status === "initializing" && !qrCode && (
                            <div className="flex items-center space-x-3 text-indigo-600">
                                <Loader2 className="animate-spin w-5 h-5" />
                                <span className="font-medium">Initializing WhatsApp Web...</span>
                            </div>
                        )}

                        {status === "initializing" && qrCode && (
                            <div className="space-y-4">
                                <div className="bg-white p-4 border-2 border-dashed border-gray-300 rounded-xl inline-block">
                                    <QRCode value={qrCode} size={256} />
                                </div>
                                <p className="text-sm text-gray-500 flex items-center">
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin text-indigo-500" /> Waiting for you to scan...
                                </p>
                            </div>
                        )}

                        {status === "connected" && (
                            <div className="space-y-4">
                                <div className="inline-flex items-center px-4 py-2 border border-green-200 bg-green-50 rounded-lg">
                                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                                    <span className="text-green-800 font-medium">Active and sending messages</span>
                                </div>
                                <div>
                                    <button
                                        onClick={logoutWhatsApp}
                                        className="px-4 py-2 bg-red-100 text-red-700 rounded-md text-sm font-medium hover:bg-red-200 transition-colors"
                                    >
                                        Disconnect
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-100 outline outline-1 outline-emerald-200 outline-offset-[-4px]">
                <h3 className="text-lg font-semibold text-emerald-900 mb-2">WhatsApp Cloud API (Official) 🚀</h3>
                <p className="text-sm text-emerald-700 leading-relaxed mb-4">
                    Connect via the official Meta Cloud API for greater reliability, green-tick verified sender options, and fully backed Meta compliance.
                </p>
                <div className="flex gap-4 items-center">
                    <button
                        onClick={() => window.location.href = '/meta-setup'}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                        Configure Meta App
                    </button>
                    <div className="inline-block px-3 py-1 bg-white text-emerald-600 text-xs font-bold rounded-full border border-emerald-200">
                        Live Beta
                    </div>
                </div>
            </div>

        </div>
    );
}

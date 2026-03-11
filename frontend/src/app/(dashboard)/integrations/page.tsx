"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import {
    Loader2,
    Copy,
    CheckCircle2,
    Globe,
    ShoppingBag,
    Terminal,
    ExternalLink,
    MessageSquare,
    ShieldCheck,
    Link2,
    Zap,
    AlertCircle,
    Facebook
} from "lucide-react";
import Link from "next/link";
import { PremiumCard, PremiumButton } from "@/components/ui/PremiumComponents";

export default function IntegrationsPage() {
    const { user } = useAuth();
    const [integrations, setIntegrations] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState({ shopify: false, wordpress: false, custom: false });
    const [copied, setCopied] = useState<string | null>(null);

    const [shopifyKey, setShopifyKey] = useState("");
    const [wordpressWebhook, setWordpressWebhook] = useState("");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const displayApiUrl = typeof window !== 'undefined' ? (apiUrl.startsWith('/') ? window.location.origin + apiUrl : apiUrl) : 'http://localhost:8080/api';

    useEffect(() => {
        const fetchIntegrations = async () => {
            try {
                const { data } = await api.get("/integrations");
                setIntegrations(data || {});
                setShopifyKey(data?.shopify_api_key || "");
                setWordpressWebhook(data?.wordpress_webhook || "");
            } catch (err) {
                console.error("Failed to fetch integrations", err);
            } finally {
                setLoading(false);
            }
        };
        fetchIntegrations();
    }, []);

    const handleSaveShopify = async () => {
        setSaving({ ...saving, shopify: true });
        try {
            await api.put("/integrations/shopify", { shopify_api_key: shopifyKey });
            setIntegrations({ ...integrations, shopify_api_key: shopifyKey });
        } catch (err) {
            console.error(err);
        } finally {
            setSaving({ ...saving, shopify: false });
        }
    };

    const handleSaveWordpress = async () => {
        setSaving({ ...saving, wordpress: true });
        try {
            await api.put("/integrations/wordpress", { wordpress_webhook: wordpressWebhook });
            setIntegrations({ ...integrations, wordpress_webhook: wordpressWebhook });
        } catch (err) {
            console.error(err);
        } finally {
            setSaving({ ...saving, wordpress: false });
        }
    };

    const handleGenerateCustomKey = async () => {
        setSaving({ ...saving, custom: true });
        try {
            const { data } = await api.post("/integrations/custom-key");
            setIntegrations({ ...integrations, custom_api_key: data.custom_api_key });
        } catch (err) {
            console.error(err);
        } finally {
            setSaving({ ...saving, custom: false });
        }
    };

    const copyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-[60vh] space-y-4">
                <Loader2 className="animate-spin w-10 h-10 text-indigo-600" />
                <p className="text-slate-500 font-medium tracking-tight">Syncing connections...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 max-w-6xl pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">External Integrations</h1>
                    <p className="text-slate-500 font-medium">Connect your storefront to automate order confirmations instantly.</p>
                </div>
                <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-xl text-[10px] font-black uppercase text-indigo-600 tracking-wider">
                    <ShieldCheck className="w-4 h-4" /> Secure SSL Connection
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Shopify */}
                <PremiumCard className="flex flex-col space-y-6 relative overflow-hidden" delay={0.1}>
                    {integrations.shopify_api_key && (
                        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-emerald-200">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> Connected
                        </div>
                    )}

                    <div className="flex items-center space-x-4 mb-2">
                        <div className="p-3 bg-emerald-100 rounded-2xl">
                            <ShoppingBag className="w-6 h-6 text-emerald-600" />
                        </div>
                        <h2 className="text-xl font-black text-slate-900">Shopify Store</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center justify-between">
                                Admin Access Token
                                <span className="text-[10px] lowercase font-normal italic">Find in Shopify Settings &rarr; Apps &rarr; Custom Apps</span>
                            </label>
                            <input
                                type="password"
                                value={shopifyKey}
                                onChange={(e) => setShopifyKey(e.target.value)}
                                placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxx"
                                className="block w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-700 font-medium transition-all"
                            />
                        </div>
                        <PremiumButton
                            onClick={handleSaveShopify}
                            loading={saving.shopify}
                            className="w-full h-12 shadow-emerald-100/50"
                        >
                            {integrations.shopify_api_key ? "Update Credentials" : "Connect Shopify"}
                        </PremiumButton>
                    </div>

                    <div className="pt-6 border-t border-slate-100 bg-slate-50/50 -mx-8 px-8 pb-4">
                        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
                            <span className="flex items-center gap-2">Webhook URL <Link2 className="w-3 h-3 text-slate-400" /></span>
                            <button
                                onClick={() => copyToClipboard(`${displayApiUrl}/integrations/shopify/orders/${user?.id}`, 'shopify webhook')}
                                className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider"
                            >
                                {copied === 'shopify webhook' ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                Copy URL
                            </button>
                        </h3>
                        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm mb-4">
                            <code className="text-[11px] font-mono text-indigo-600 break-all leading-relaxed block pr-2">
                                {displayApiUrl}/integrations/shopify/orders/{user?.id}
                            </code>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] text-slate-500 font-bold flex items-start gap-2 leading-relaxed uppercase tracking-tighter">
                                <AlertCircle className="w-3 h-3 mt-0.5 text-indigo-500" />
                                Must paste this in Shopify &rarr; Notifications &rarr; Create Webhook (Order Creation) to receive orders.
                            </p>
                        </div>
                    </div>
                </PremiumCard>

                {/* WooCommerce */}
                <PremiumCard className="flex flex-col space-y-6 relative overflow-hidden" delay={0.2}>
                    {integrations.wordpress_webhook && (
                        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-blue-200">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> Webhook Set
                        </div>
                    )}

                    <div className="flex items-center space-x-4 mb-2">
                        <div className="p-3 bg-blue-100 rounded-2xl">
                            <Globe className="w-6 h-6 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-black text-slate-900">WooCommerce</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Site Domain (Optional)</label>
                            <input
                                type="text"
                                value={wordpressWebhook}
                                onChange={(e) => setWordpressWebhook(e.target.value)}
                                placeholder="https://yourstore.com"
                                className="block w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-700 font-medium transition-all"
                            />
                        </div>
                        <PremiumButton
                            onClick={handleSaveWordpress}
                            loading={saving.wordpress}
                            className="w-full h-12 from-blue-600 to-indigo-600 shadow-blue-100"
                        >
                            {integrations.wordpress_webhook ? "Update Settings" : "Enable WooCommerce"}
                        </PremiumButton>
                    </div>

                    <div className="pt-6 border-t border-slate-100 bg-slate-50/50 -mx-8 px-8 pb-4">
                        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
                            <span className="flex items-center gap-2">Webhook URL <Link2 className="w-3 h-3 text-slate-400" /></span>
                            <button
                                onClick={() => copyToClipboard(`${displayApiUrl}/integrations/wordpress/orders/${user?.id}`, 'wp webhook')}
                                className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider"
                            >
                                {copied === 'wp webhook' ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                Copy URL
                            </button>
                        </h3>
                        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm mb-4">
                            <code className="text-[11px] font-mono text-blue-600 break-all leading-relaxed block">
                                {displayApiUrl}/integrations/wordpress/orders/{user?.id}
                            </code>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] text-slate-500 font-bold flex items-start gap-2 leading-relaxed uppercase tracking-tighter">
                                <AlertCircle className="w-3 h-3 mt-0.5 text-blue-500" />
                                Paste in WordPress: WooCommerce &rarr; Settings &rarr; Advanced &rarr; Webhooks (Status: Order Created).
                            </p>
                        </div>
                    </div>
                </PremiumCard>

                {/* Meta Cloud API Banner */}
                <PremiumCard className="lg:col-span-2 bg-gradient-to-br from-indigo-900 to-slate-900 border-none shadow-2xl relative overflow-hidden group" delay={0.25}>
                    <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                        <MessageSquare className="w-40 h-40 text-white" />
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-10 p-6 relative z-10">
                        <div className="flex-1 space-y-5">
                            <div className="flex items-center space-x-4">
                                <div className="p-4 bg-white/10 rounded-3xl shadow-lg ring-1 ring-white/20 backdrop-blur-md">
                                    <Facebook className="w-8 h-8 text-blue-400" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-2xl font-black text-white">Meta Cloud API</h2>
                                        <span className="px-3 py-1 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full animate-pulse shadow-lg shadow-emerald-500/30">Official</span>
                                    </div>
                                    <p className="text-xs font-bold text-indigo-300 uppercase tracking-[0.2em] mt-1">Enterprise Grade Automation</p>
                                </div>
                            </div>
                            <p className="text-indigo-100 text-sm font-medium leading-relaxed max-w-2xl opacity-80">
                                Tired of QR scanning and phone battery issues? Upgrade to the Official Meta API for 100% Reliability, Green-Tick verification, and interactive Confirmation Buttons.
                            </p>
                            <div className="flex flex-wrap gap-4 pt-2">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-400">
                                    <Zap className="w-4 h-4 fill-emerald-400" /> No QR Code Required
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-300">
                                    <ShieldCheck className="w-4 h-4" /> Anti-Ban Protected
                                </div>
                            </div>
                        </div>
                        <div className="w-full md:w-auto flex flex-col gap-4">
                            <Link href="/meta-setup" className="w-full md:w-fit inline-flex items-center justify-center px-10 py-5 bg-white text-indigo-900 rounded-2xl font-black transition-all shadow-xl hover:bg-indigo-50 gap-3 group">
                                Configuration & Setup
                                <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <button className="text-indigo-300 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors block text-center">
                                View Documentation
                            </button>
                        </div>
                    </div>
                </PremiumCard>
            </div>

            {/* Developer API Section */}
            <div className="space-y-6 pt-10">
                <div className="flex items-center gap-4 px-2">
                    <Terminal className="w-6 h-6 text-slate-400" />
                    <h3 className="text-xl font-black text-slate-800">Advanced Developer API</h3>
                </div>

                <PremiumCard delay={0.3} className="bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                                    If you have a custom-built website, use this API to push orders manually to our automation engine.
                                </p>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Authentication Header</label>
                                    {integrations?.custom_api_key ? (
                                        <div className="flex items-center space-x-3 bg-black/40 p-5 rounded-2xl border border-white/5 group transition-all hover:border-indigo-500/30">
                                            <code className="text-indigo-400 font-mono text-sm break-all flex-1">
                                                x-api-key: {integrations.custom_api_key}
                                            </code>
                                            <button
                                                onClick={() => copyToClipboard(integrations.custom_api_key, 'api key')}
                                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                            >
                                                {copied === 'api key' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-500" />}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="p-5 bg-black/20 rounded-2xl border border-dashed border-white/10 text-slate-500 text-center text-sm italic">
                                            Click below to generate your production-ready API key.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={handleGenerateCustomKey}
                                disabled={saving.custom}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-600/20"
                            >
                                {saving.custom ? <Loader2 className="animate-spin w-5 h-5" /> : <Zap className="w-5 h-5 fill-white" />}
                                {integrations?.custom_api_key ? "Regenerate My Key" : "Generate Production API Key"}
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">CURL Implementation</label>
                                <span className="text-[9px] font-black text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded-full border border-indigo-400/20">ENDPOINT: /orders/create</span>
                            </div>
                            <div className="bg-black p-6 rounded-3xl border border-white/5 overflow-x-auto shadow-inner relative">
                                <div className="absolute top-4 right-4 text-[10px] text-slate-700 font-mono italic">JSON Request</div>
                                <pre className="text-[11px] leading-relaxed"><code className="text-indigo-300">
                                    {`curl -X POST "${displayApiUrl}/orders/create" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${integrations?.custom_api_key || 'YOUR_KEY'}" \\
  -d '{
    "name": "Jane Doe",
    "phone": "923001234567",
    "product": "Airpods Pro",
    "price": "249.99"
  }'`}
                                </code></pre>
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium italic">All parameters are required for confirmation message processing.</p>
                        </div>
                    </div>
                </PremiumCard>
            </div>
        </div>
    );
}

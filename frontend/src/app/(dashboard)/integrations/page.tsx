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
    Zap,
    Facebook
} from "lucide-react";
import Link from "next/link";
import { PremiumCard, PremiumButton } from "@/components/ui/PremiumComponents";

export default function IntegrationsPage() {
    useAuth(); // ensures auth context is loaded
    const [integrations, setIntegrations] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState({ shopify: false, wordpress: false, custom: false });
    const [copied, setCopied] = useState<string | null>(null);

    const [shopifyDomain, setShopifyDomain] = useState("");
    const [wordpressUrl, setWordpressUrl] = useState("");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const displayApiUrl = typeof window !== 'undefined' ? (apiUrl.startsWith('/') ? window.location.origin + apiUrl : apiUrl) : 'http://localhost:8080/api';

    // ── Popup OAuth Helper ──────────────────────────────────────────────────
    const openOAuthPopup = (url: string, onSuccess: () => void) => {
        const width = 560;
        const height = 680;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        const popup = window.open(
            url,
            'oauth_popup',
            `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
        );

        if (!popup) {
            alert("Popup was blocked! Please allow popups for this site.");
            return;
        }

        // Poll until popup closes
        const timer = setInterval(() => {
            if (popup.closed) {
                clearInterval(timer);
                onSuccess();
            }
        }, 500);
    };

    const fetchIntegrationsData = async () => {
        try {
            const { data } = await api.get("/integrations");
            setIntegrations(data || {});
            setShopifyDomain(data?.shopify_shop || "");
            setWordpressUrl(data?.wordpress_site_url || "");
        } catch (err) {
            console.error("Failed to fetch integrations", err);
        }
    };

    useEffect(() => {
        const initialFetch = async () => {
            try {
                const { data } = await api.get("/integrations");
                setIntegrations(data || {});
                setShopifyDomain(data?.shopify_shop || "");
                setWordpressUrl(data?.wordpress_site_url || "");
            } catch (err) {
                console.error("Failed to fetch integrations", err);
            } finally {
                setLoading(false);
            }
        };
        initialFetch();

        // Listen for signals from OAuth popup windows
        const handleMessage = (event: MessageEvent) => {
            if (
                event.data === 'shopify_connected' ||
                event.data === 'wordpress_connected'
            ) {
                // Popup has closed after successful auth — refresh data
                fetchIntegrationsData();
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const handleConnectShopify = async () => {
        if (!shopifyDomain) return alert("Please enter your Shopify shop domain (e.g. mystore.myshopify.com)");
        setSaving({ ...saving, shopify: true });
        try {
            const { data } = await api.get(`/integrations/shopify/authorize?shop=${shopifyDomain}`);
            if (data.url) {
                openOAuthPopup(data.url, () => {
                    // Popup closed — re-fetch to reflect new connection status
                    fetchIntegrationsData();
                    setSaving(s => ({ ...s, shopify: false }));
                });
            }
        } catch (err) {
            console.error(err);
            alert("Failed to start Shopify connection.");
        } finally {
            setSaving(s => ({ ...s, shopify: false }));
        }
    };

    const handleConnectWordpress = async () => {
        if (!wordpressUrl) return alert("Please enter your WordPress site URL (e.g. https://mystore.com)");
        setSaving({ ...saving, wordpress: true });
        try {
            const { data } = await api.get(`/integrations/wordpress/authorize?site=${wordpressUrl}`);
            if (data.url) {
                openOAuthPopup(data.url, () => {
                    // Popup closed — re-fetch to reflect new connection status
                    fetchIntegrationsData();
                    setSaving(s => ({ ...s, wordpress: false }));
                });
            }
        } catch (err) {
            console.error(err);
            alert("Failed to start WordPress connection.");
        } finally {
            setSaving(s => ({ ...s, wordpress: false }));
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
                <PremiumCard className="flex flex-col space-y-6 relative overflow-hidden group border-emerald-100/30" delay={0.1}>
                    {integrations.shopify_api_key && (
                        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-emerald-200">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> Live & Connected
                        </div>
                    )}

                    <div className="flex items-center space-x-4 mb-2">
                        <div className={`p-4 rounded-2xl transition-all duration-300 ${integrations.shopify_api_key ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-600'}`}>
                            <ShoppingBag className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900">Shopify Store</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Official Integration</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                            {integrations.shopify_api_key 
                                ? `Your store (${integrations.shopify_shop || 'Connected'}) is currently syncing orders automatically.` 
                                : "Connect your Shopify store in seconds. We'll automatically handle webhooks and order fulfillment syncing."}
                        </p>

                        {!integrations.shopify_api_key ? (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={shopifyDomain}
                                        onChange={(e) => setShopifyDomain(e.target.value)}
                                        placeholder="your-store-name.myshopify.com"
                                        className="block w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/30 outline-none text-slate-700 font-bold transition-all"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-emerald-500 uppercase">Input Required</div>
                                </div>
                                <PremiumButton
                                    onClick={handleConnectShopify}
                                    loading={saving.shopify}
                                    className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 shadow-xl shadow-emerald-200/50 text-base"
                                >
                                    <Zap className="w-4 h-4 fill-white mr-2" /> Connect My Store
                                </PremiumButton>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                                        <span className="text-sm font-bold text-emerald-700">Auto-Sync Active</span>
                                    </div>
                                    <button 
                                        onClick={() => setIntegrations({...integrations, shopify_api_key: null})}
                                        className="text-[10px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-wider transition-colors"
                                    >
                                        Disconnect
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </PremiumCard>

                {/* WooCommerce */}
                <PremiumCard className="flex flex-col space-y-6 relative overflow-hidden group border-blue-100/30" delay={0.2}>
                    {integrations.wordpress_api_key && (
                        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-blue-200">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> Service Active
                        </div>
                    )}

                    <div className="flex items-center space-x-4 mb-2">
                        <div className={`p-4 rounded-2xl transition-all duration-300 ${integrations.wordpress_api_key ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600'}`}>
                            <Globe className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900">WooCommerce</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">WP Automation</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                            {integrations.wordpress_api_key 
                                ? `Successfully connected to ${integrations.wordpress_site_url}. No further configuration needed.`
                                : "Link your WordPress site using our secure application bridge. One-click authorization, no complex setup."}
                        </p>

                        {!integrations.wordpress_api_key ? (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={wordpressUrl}
                                        onChange={(e) => setWordpressUrl(e.target.value)}
                                        placeholder="https://your-website.com"
                                        className="block w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 outline-none text-slate-700 font-bold transition-all"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-500 uppercase">Site URL</div>
                                </div>
                                <PremiumButton
                                    onClick={handleConnectWordpress}
                                    loading={saving.wordpress}
                                    className="w-full h-14 bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-200/50 text-base"
                                >
                                    <ShieldCheck className="w-4 h-4 mr-2" /> Authorize with WordPress
                                </PremiumButton>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                                        <span className="text-sm font-bold text-blue-700">WP Bridge Online</span>
                                    </div>
                                    <button 
                                        onClick={() => setIntegrations({...integrations, wordpress_api_key: null})}
                                        className="text-[10px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-wider transition-colors"
                                    >
                                        Revoke Access
                                    </button>
                                </div>
                            </div>
                        )}
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

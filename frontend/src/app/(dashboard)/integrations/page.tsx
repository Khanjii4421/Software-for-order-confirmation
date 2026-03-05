"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { Loader2, Copy, CheckCircle2 } from "lucide-react";

export default function IntegrationsPage() {
    const { user } = useAuth();
    const [integrations, setIntegrations] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState({ shopify: false, wordpress: false, custom: false });
    const [copied, setCopied] = useState<string | null>(null);

    const [shopifyKey, setShopifyKey] = useState("");
    const [wordpressWebhook, setWordpressWebhook] = useState("");

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
        return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin w-8 h-8 text-indigo-600" /></div>;
    }

    return (
        <div className="space-y-8 max-w-5xl">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
                <p className="mt-1 text-sm text-gray-500">Connect your source platforms to start receiving orders.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Shopify */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900">Shopify Integration</h2>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Shopify API Key / Access Token</label>
                        <input
                            type="text"
                            value={shopifyKey}
                            onChange={(e) => setShopifyKey(e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        <button
                            onClick={handleSaveShopify}
                            disabled={saving.shopify}
                            className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {saving.shopify ? "Saving..." : "Save Settings"}
                        </button>
                    </div>

                    <div className="mt-auto pt-6 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Webhook Endpoint (Order Created event)</h3>
                        <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md border border-gray-200">
                            <code className="text-xs text-indigo-600 break-all flex-1">
                                {apiUrl}/integrations/shopify/orders/{user?.id}
                            </code>
                            <button onClick={() => copyToClipboard(`${apiUrl}/integrations/shopify/orders/${user?.id}`, 'shopify webhook')} className="text-gray-500 hover:text-gray-700">
                                {copied === 'shopify webhook' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">1. Go to Shopify Admin &rarr; Settings &rarr; Notifications.</p>
                        <p className="text-xs text-gray-500">2. Create a webhook for 'Order creation' using the above URL.</p>
                    </div>
                </div>

                {/* WordPress */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900">WordPress / WooCommerce</h2>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">WordPress Webhook Details (Optional)</label>
                        <input
                            type="text"
                            value={wordpressWebhook}
                            onChange={(e) => setWordpressWebhook(e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        <button
                            onClick={handleSaveWordpress}
                            disabled={saving.wordpress}
                            className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {saving.wordpress ? "Saving..." : "Save Settings"}
                        </button>
                    </div>

                    <div className="mt-auto pt-6 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Webhook Endpoint (Order Created)</h3>
                        <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md border border-gray-200">
                            <code className="text-xs text-indigo-600 break-all flex-1">
                                {apiUrl}/integrations/wordpress/orders/{user?.id}
                            </code>
                            <button onClick={() => copyToClipboard(`${apiUrl}/integrations/wordpress/orders/${user?.id}`, 'wp webhook')} className="text-gray-500 hover:text-gray-700">
                                {copied === 'wp webhook' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Add this Webhook URL inside WooCommerce Settings &rarr; Advanced &rarr; Webhooks.</p>
                    </div>
                </div>
            </div>

            {/* Custom API */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Custom API (Developer)</h2>
                <p className="text-sm text-gray-600 mb-6">Use this API to push orders from a custom-built frontend, PHP site, or any other platform.</p>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Secret API Key</label>
                    {integrations?.custom_api_key ? (
                        <div className="flex items-center space-x-2 bg-indigo-50 p-3 rounded-md border border-indigo-100 mb-4 max-w-lg">
                            <code className="text-sm text-indigo-800 break-all flex-1 font-mono">
                                {integrations.custom_api_key}
                            </code>
                            <button onClick={() => copyToClipboard(integrations.custom_api_key, 'api key')} className="text-indigo-600 hover:text-indigo-800 bg-white p-1.5 rounded border border-indigo-200 shadow-sm">
                                {copied === 'api key' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 italic mb-4">No API key generated yet.</p>
                    )}
                    <button
                        onClick={handleGenerateCustomKey}
                        disabled={saving.custom}
                        className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm hover:bg-gray-800 disabled:opacity-50"
                    >
                        {saving.custom ? "Generating..." : integrations?.custom_api_key ? "Regenerate API Key" : "Generate API Key"}
                    </button>
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-700">Endpoint Usage</h3>
                    </div>
                    <div className="p-4 bg-gray-900 text-gray-300 overflow-x-auto text-sm">
                        <pre><code>
                            POST {apiUrl}/orders/create
                            Headers:
                            Content-Type: application/json
                            x-api-key: {integrations?.custom_api_key || 'YOUR_API_KEY'}

                            Body:
                            {`{
  "name": "Jane Doe",
  "phone": "923001234567",
  "product": "Airpods Pro",
  "color": "White",
  "price": "249.99",
  "address": "Defence Ph 6, Karachi"
}`}
                        </code></pre>
                    </div>
                </div>
            </div>

        </div>
    );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bot, Key, Phone, Zap, Upload, Trash2, Save, TestTube,
    ToggleLeft, ToggleRight, ChevronDown, ChevronUp, Image as ImageIcon,
    Package, DollarSign, MessageSquare, Sparkles, CheckCircle2,
    AlertCircle, Loader2, X, Eye, EyeOff, Info, Settings2
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const personalities = [
    { id: "friendly", label: "Friendly & Warm 😊", desc: "Casual, warm tone. Great for lifestyle products." },
    { id: "professional", label: "Professional 💼", desc: "Formal and polished. Best for high-value items." },
    { id: "enthusiastic", label: "Enthusiastic 🔥", desc: "High energy. Perfect for trending products." },
    { id: "consultative", label: "Consultative 🤝", desc: "Advisory tone. Ideal for complex products." },
];

const models = [
    { id: "gpt-4o-mini", label: "GPT-4o Mini (Fast & Cheap)" },
    { id: "gpt-4o", label: "GPT-4o (Smartest)" },
    { id: "gpt-3.5-turbo", label: "GPT-3.5 Turbo (Legacy)" },
];

export default function BotSetupPage() {
    const { user } = useAuth();
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const fileRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

    const [showApiKey, setShowApiKey] = useState(false);
    const [showToken, setShowToken] = useState(false);
    const [openSection, setOpenSection] = useState<string>("openai");

    const [config, setConfig] = useState({
        openai_api_key: "",
        ai_model: "gpt-4o-mini",
        wa_phone_number_id: "",
        wa_access_token: "",
        wa_verify_token: "ai_bot_secret",
        bot_enabled: false,
        ai_personality: "friendly",
        custom_prompt: "",
        product_name: "",
        product_description: "",
        product_price: "",
        product_min_price: "",
        currency: "PKR",
    });

    const [images, setImages] = useState<any[]>([]);

    const showToast = (type: "success" | "error", msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchConfig = async () => {
        try {
            const res = await fetch(`${API}/api/ai-bot/config`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.id) {
                setConfig({
                    openai_api_key: data.openai_api_key || "",
                    ai_model: data.ai_model || "gpt-4o-mini",
                    wa_phone_number_id: data.wa_phone_number_id || "",
                    wa_access_token: data.wa_access_token || "",
                    wa_verify_token: data.wa_verify_token || "ai_bot_secret",
                    bot_enabled: data.bot_enabled || false,
                    ai_personality: data.ai_personality || "friendly",
                    custom_prompt: data.custom_prompt || "",
                    product_name: data.product_name || "",
                    product_description: data.product_description || "",
                    product_price: data.product_price?.toString() || "",
                    product_min_price: data.product_min_price?.toString() || "",
                    currency: data.currency || "PKR",
                });
                setImages(data.productImages || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`${API}/api/ai-bot/config`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(config),
            });
            const data = await res.json();
            if (data.success) showToast("success", "Configuration saved successfully! ✅");
            else showToast("error", data.message || "Failed to save");
        } catch {
            showToast("error", "Network error. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async () => {
        const newState = !config.bot_enabled;
        setConfig(c => ({ ...c, bot_enabled: newState }));
        try {
            await fetch(`${API}/api/ai-bot/toggle`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ enabled: newState }),
            });
            showToast("success", newState ? "AI Bot is now ACTIVE 🤖" : "AI Bot has been paused ⏸️");
        } catch {
            setConfig(c => ({ ...c, bot_enabled: !newState }));
            showToast("error", "Failed to toggle bot");
        }
    };

    const handleTestOpenAI = async () => {
        if (!config.openai_api_key) return showToast("error", "Please enter an OpenAI API key first");
        setTesting(true);
        try {
            const res = await fetch(`${API}/api/ai-bot/test-openai`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ api_key: config.openai_api_key }),
            });
            const data = await res.json();
            if (data.success) showToast("success", data.message);
            else showToast("error", data.message);
        } catch {
            showToast("error", "Connection error");
        } finally {
            setTesting(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append("image", file);
        try {
            const res = await fetch(`${API}/api/ai-bot/upload-image`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                setImages(prev => [...prev, data.image]);
                showToast("success", "Product image uploaded! 🖼️");
            } else {
                showToast("error", data.message || "Upload failed");
            }
        } catch {
            showToast("error", "Upload failed");
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = "";
        }
    };

    const handleDeleteImage = async (imageId: string) => {
        try {
            const res = await fetch(`${API}/api/ai-bot/image/${imageId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setImages(prev => prev.filter(img => img.id !== imageId));
                showToast("success", "Image deleted");
            }
        } catch {
            showToast("error", "Failed to delete image");
        }
    };

    const Section = ({ id, title, icon: Icon, children }: any) => {
        const isOpen = openSection === id;
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden"
            >
                <button
                    onClick={() => setOpenSection(isOpen ? "" : id)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-slate-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-indigo-600" />
                        </div>
                        <span className="font-bold text-slate-800 text-base">{title}</span>
                    </div>
                    {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="px-6 pb-6 border-t border-slate-100 pt-5">
                                {children}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        );
    };

    const Field = ({ label, hint, children }: any) => (
        <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">{label}</label>
            {hint && <p className="text-xs text-slate-400">{hint}</p>}
            {children}
        </div>
    );

    const inputCls = "w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all";

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    const webhookUrl = typeof window !== "undefined"
        ? `${window.location.protocol}//${window.location.hostname}:5000/api/webhooks/ai-agent`
        : "https://your-server.com/api/webhooks/ai-agent";

    return (
        <div className="space-y-6">
            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-white text-sm font-semibold ${toast.type === "success" ? "bg-emerald-600" : "bg-red-500"}`}
                    >
                        {toast.type === "success" ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                        {toast.msg}
                        <button onClick={() => setToast(null)}><X className="w-4 h-4 ml-2 opacity-70 hover:opacity-100" /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        AI Bot Setup
                    </h1>
                    <p className="text-slate-500 mt-1.5 text-sm">Configure your WhatsApp AI Sales Agent powered by ChatGPT</p>
                </div>

                {/* Master toggle */}
                <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border-2 transition-all cursor-pointer ${config.bot_enabled ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"}`}
                    onClick={handleToggle}
                >
                    {config.bot_enabled
                        ? <ToggleRight className="w-8 h-8 text-emerald-500" />
                        : <ToggleLeft className="w-8 h-8 text-slate-400" />
                    }
                    <div>
                        <p className={`font-bold text-sm ${config.bot_enabled ? "text-emerald-700" : "text-slate-500"}`}>
                            AI Bot {config.bot_enabled ? "ACTIVE" : "DISABLED"}
                        </p>
                        <p className="text-xs text-slate-400">Click to {config.bot_enabled ? "pause" : "activate"}</p>
                    </div>
                </div>
            </div>

            {/* Webhook info banner */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-4 flex gap-3">
                <Info className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-semibold text-indigo-800">WhatsApp Webhook URL (set in Meta Developer Portal)</p>
                    <code className="text-xs text-indigo-700 bg-white/70 px-3 py-1 rounded-lg mt-1.5 inline-block border border-indigo-200 break-all font-mono">
                        {webhookUrl}
                    </code>
                </div>
            </div>

            {/* Sections */}
            <div className="space-y-3">

                {/* 1. OpenAI */}
                <Section id="openai" title="OpenAI ChatGPT API" icon={Key}>
                    <div className="space-y-4">
                        <Field label="OpenAI API Key *" hint="Get yours at platform.openai.com — starts with sk-...">
                            <div className="relative">
                                <input
                                    type={showApiKey ? "text" : "password"}
                                    value={config.openai_api_key}
                                    onChange={e => setConfig(c => ({ ...c, openai_api_key: e.target.value }))}
                                    placeholder="sk-..."
                                    className={inputCls + " pr-24"}
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                    <button onClick={() => setShowApiKey(s => !s)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={handleTestOpenAI}
                                        disabled={testing}
                                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition disabled:opacity-60"
                                    >
                                        {testing ? <Loader2 className="w-3 h-3 animate-spin" /> : <TestTube className="w-3 h-3" />}
                                        Test
                                    </button>
                                </div>
                            </div>
                        </Field>

                        <Field label="AI Model">
                            <select
                                value={config.ai_model}
                                onChange={e => setConfig(c => ({ ...c, ai_model: e.target.value }))}
                                className={inputCls}
                            >
                                {models.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                            </select>
                        </Field>
                    </div>
                </Section>

                {/* 2. WhatsApp API */}
                <Section id="whatsapp" title="WhatsApp API Connection (Meta Cloud)" icon={Phone}>
                    <div className="space-y-4">
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 font-medium">
                            💡 Use the same WhatsApp Business phone number as your Meta Developer App. Set webhook URL above in your Meta app settings.
                        </div>
                        <Field label="Phone Number ID" hint="Found in WhatsApp → API Setup in Meta Developer dashboard">
                            <input type="text" value={config.wa_phone_number_id}
                                onChange={e => setConfig(c => ({ ...c, wa_phone_number_id: e.target.value }))}
                                placeholder="1234567890123456"
                                className={inputCls}
                            />
                        </Field>
                        <Field label="Access Token (Permanent)" hint="Use a permanent System User token from Meta Business Suite">
                            <div className="relative">
                                <input
                                    type={showToken ? "text" : "password"}
                                    value={config.wa_access_token}
                                    onChange={e => setConfig(c => ({ ...c, wa_access_token: e.target.value }))}
                                    placeholder="EAAxxxx..."
                                    className={inputCls + " pr-10"}
                                />
                                <button onClick={() => setShowToken(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </Field>
                        <Field label="Webhook Verify Token" hint="Enter this same token in your Meta webhook settings">
                            <input type="text" value={config.wa_verify_token}
                                onChange={e => setConfig(c => ({ ...c, wa_verify_token: e.target.value }))}
                                placeholder="my_secret_token"
                                className={inputCls}
                            />
                        </Field>
                    </div>
                </Section>

                {/* 3. AI Personality */}
                <Section id="personality" title="AI Personality & Training" icon={Sparkles}>
                    <div className="space-y-4">
                        <Field label="Choose Personality">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {personalities.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => setConfig(c => ({ ...c, ai_personality: p.id }))}
                                        className={`text-left p-3 rounded-xl border-2 transition-all ${config.ai_personality === p.id
                                            ? "border-indigo-500 bg-indigo-50"
                                            : "border-slate-200 hover:border-indigo-200 hover:bg-slate-50"
                                            }`}
                                    >
                                        <p className="font-bold text-sm text-slate-800">{p.label}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{p.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </Field>

                        <Field label="Custom Training Prompt" hint="Tell the AI extra instructions. E.g., 'Always offer free delivery above PKR 3000. Always mention the 7-day return policy.'">
                            <textarea
                                value={config.custom_prompt}
                                onChange={e => setConfig(c => ({ ...c, custom_prompt: e.target.value }))}
                                rows={4}
                                placeholder="Add extra instructions for your AI agent..."
                                className={inputCls + " resize-none"}
                            />
                        </Field>
                    </div>
                </Section>

                {/* 4. Product Info */}
                <Section id="product" title="Product Configuration" icon={Package}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Product Name *">
                                <input type="text" value={config.product_name}
                                    onChange={e => setConfig(c => ({ ...c, product_name: e.target.value }))}
                                    placeholder="e.g., Premium Slim Fit Hoodie"
                                    className={inputCls}
                                />
                            </Field>
                            <Field label="Currency">
                                <select value={config.currency}
                                    onChange={e => setConfig(c => ({ ...c, currency: e.target.value }))}
                                    className={inputCls}
                                >
                                    <option value="PKR">PKR (Pakistani Rupee)</option>
                                    <option value="USD">USD (US Dollar)</option>
                                    <option value="AED">AED (UAE Dirham)</option>
                                    <option value="SAR">SAR (Saudi Riyal)</option>
                                    <option value="GBP">GBP (British Pound)</option>
                                    <option value="EUR">EUR (Euro)</option>
                                </select>
                            </Field>
                        </div>

                        <Field label="Product Description" hint="What the AI will say to describe the product to customers">
                            <textarea
                                value={config.product_description}
                                onChange={e => setConfig(c => ({ ...c, product_description: e.target.value }))}
                                rows={3}
                                placeholder="Premium quality hoodie made from 100% cotton. Available in 5 colors with a comfortable slim fit..."
                                className={inputCls + " resize-none"}
                            />
                        </Field>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Selling Price *" hint="The price the AI will quote">
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type="number" value={config.product_price}
                                        onChange={e => setConfig(c => ({ ...c, product_price: e.target.value }))}
                                        placeholder="1500"
                                        className={inputCls + " pl-9"}
                                    />
                                </div>
                            </Field>
                            <Field label="Minimum Price (for negotiation)" hint="AI will never go below this">
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type="number" value={config.product_min_price}
                                        onChange={e => setConfig(c => ({ ...c, product_min_price: e.target.value }))}
                                        placeholder="1200"
                                        className={inputCls + " pl-9"}
                                    />
                                </div>
                            </Field>
                        </div>
                    </div>
                </Section>

                {/* 5. Product Images */}
                <Section id="images" title={`Product Images (${images.length} uploaded)`} icon={ImageIcon}>
                    <div className="space-y-4">
                        <p className="text-sm text-slate-500">Upload product images. The AI agent will automatically send these when customers ask for photos or product details.</p>

                        {/* Upload area */}
                        <div
                            onClick={() => fileRef.current?.click()}
                            className="border-2 border-dashed border-indigo-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all"
                        >
                            <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} hidden />
                            {uploading
                                ? <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                                : <Upload className="w-8 h-8 text-indigo-400" />
                            }
                            <div className="text-center">
                                <p className="font-bold text-slate-700 text-sm">{uploading ? "Uploading..." : "Click to upload product image"}</p>
                                <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP up to 10MB</p>
                            </div>
                        </div>

                        {/* Image grid */}
                        {images.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {images.map((img, i) => (
                                    <div key={img.id} className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                                        <img
                                            src={`${API}${img.image_url}`}
                                            alt={img.image_name || `Product ${i + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <button
                                                onClick={() => handleDeleteImage(img.id)}
                                                className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        {i === 0 && (
                                            <span className="absolute top-2 left-2 bg-indigo-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">MAIN</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Section>

                {/* 6. Facebook/Instagram Ads */}
                <Section id="ads" title="Facebook & Instagram Ads Integration" icon={Zap}>
                    <div className="space-y-3">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
                            <p className="font-bold mb-2">🎯 How to connect Facebook/Instagram Ads:</p>
                            <ol className="list-decimal list-inside space-y-1.5 text-xs leading-relaxed">
                                <li>In Meta Ads Manager, set your <strong>Click-to-WhatsApp</strong> CTA to your WhatsApp business number.</li>
                                <li>When a user clicks the ad, WhatsApp opens directly with your business number.</li>
                                <li>Your AI bot will <strong>automatically respond</strong> to that message.</li>
                                <li>The AI converts the ad traffic into confirmed orders automatically.</li>
                            </ol>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                            <p className="text-xs font-semibold text-emerald-700">
                                No extra setup needed! As long as your WhatsApp phone number is connected above, all ad traffic will be handled by the AI.
                            </p>
                        </div>
                    </div>
                </Section>
            </div>

            {/* Save button */}
            <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleSave}
                disabled={saving}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-base rounded-2xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-3 disabled:opacity-60"
            >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {saving ? "Saving Configuration..." : "Save Bot Configuration"}
            </motion.button>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import {
    Loader2,
    Save,
    ArrowLeft,
    CheckCircle2,
    Facebook,
    Key,
    Smartphone,
    Info,
    ExternalLink,
    MessageSquare,
    Zap,
    HelpCircle,
    Copy,
    ChevronRight,
    Building2,
    AlertCircle,
    ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { PremiumCard, PremiumButton } from "@/components/ui/PremiumComponents";

export default function MetaSetupPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [formData, setFormData] = useState({
        meta_app_id: "",
        meta_phone_number_id: "",
        meta_access_token: "",
        meta_business_account_id: "",
        meta_template_name: "order_confirmation",
    });

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchIntegrations = async () => {
            try {
                const { data } = await api.get("/integrations");
                if (data) {
                    setFormData({
                        meta_app_id: data.meta_app_id || "",
                        meta_phone_number_id: data.meta_phone_number_id || "",
                        meta_access_token: data.meta_access_token || "",
                        meta_business_account_id: data.meta_business_account_id || "",
                        meta_template_name: data.meta_template_name || "order_confirmation",
                    });
                }
            } catch (err) {
                console.error("Failed to fetch meta credentials", err);
            } finally {
                setLoading(false);
            }
        };
        fetchIntegrations();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setSaved(false);
        setError(null);
    };

    const handleSave = async () => {
        // Validation check
        const { meta_app_id, meta_phone_number_id, meta_access_token, meta_business_account_id, meta_template_name } = formData;

        if (!meta_app_id || !meta_phone_number_id || !meta_access_token || !meta_business_account_id || !meta_template_name) {
            setError("Please fill in ALL fields to establish a secure connection.");
            return;
        }

        setSaving(true);
        setError(null);
        try {
            await api.put("/integrations/meta", formData);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error(err);
            setError("Failed to save. Please check your credentials and try again.");
        } finally {
            setSaving(false);
        }
    };


    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('ring-4', 'ring-indigo-200', 'transition-all', 'duration-700');
            setTimeout(() => element.classList.remove('ring-4', 'ring-indigo-200'), 2000);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-[60vh] space-y-4">
                <Loader2 className="animate-spin w-10 h-10 text-indigo-600" />
                <p className="text-slate-500 font-medium tracking-tight">Loading Meta secure vault...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl space-y-10 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center space-x-5">
                    <Link href="/whatsapp" className="group p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
                        <ArrowLeft className="w-6 h-6 text-slate-600 group-hover:-translate-x-1 transition-transform" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            Meta Cloud API Setup
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-md">Official Integration</span>
                        </h1>
                        <p className="text-slate-500 font-medium">Enterprise connection for 100% reliable automated messaging.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <a href="https://developers.facebook.com" target="_blank" className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                        <ExternalLink className="w-4 h-4" />
                        Meta Developer Portal
                    </a>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-8">
                    <PremiumCard className="p-8 space-y-8" delay={0.1}>
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                    <Key className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-black text-slate-900">API Credentials</h2>
                            </div>
                            <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">Step 1: Authorization</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Meta App ID</label>
                                    <button onClick={() => scrollToSection('step-1')} className="text-indigo-400 hover:text-indigo-600 transition-colors">
                                        <HelpCircle className="w-4 h-4" />
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    name="meta_app_id"
                                    value={formData.meta_app_id}
                                    onChange={handleChange}
                                    placeholder="e.g. 101234567890"
                                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-700 font-medium transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Phone Number ID</label>
                                    <button onClick={() => scrollToSection('step-3')} className="text-indigo-400 hover:text-indigo-600 transition-colors">
                                        <HelpCircle className="w-4 h-4" />
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    name="meta_phone_number_id"
                                    value={formData.meta_phone_number_id}
                                    onChange={handleChange}
                                    placeholder="e.g. 108765432109"
                                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-700 font-medium transition-all"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">WABA (Business Account ID)</label>
                                    <button onClick={() => scrollToSection('step-3')} className="text-indigo-400 hover:text-indigo-600 transition-colors">
                                        <HelpCircle className="w-4 h-4" />
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    name="meta_business_account_id"
                                    value={formData.meta_business_account_id}
                                    onChange={handleChange}
                                    placeholder="e.g. 107384950672"
                                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-700 font-medium transition-all"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest font-black text-rose-500">Permanent Access Token</label>
                                    <button onClick={() => scrollToSection('step-4')} className="text-indigo-400 hover:text-indigo-600 transition-colors flex items-center gap-1 text-[10px] font-black underline uppercase">
                                        <Info className="w-3 h-3" /> System User Guide
                                    </button>
                                </div>
                                <input
                                    type="password"
                                    name="meta_access_token"
                                    value={formData.meta_access_token}
                                    onChange={handleChange}
                                    placeholder="EAAG... (Must be from System User for permanent access)"
                                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-700 font-medium transition-all"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2 pt-4 border-t border-slate-100">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Approved Template Name</label>
                                    <button onClick={() => scrollToSection('template-guide')} className="text-indigo-400 hover:text-indigo-600 transition-colors flex items-center gap-1 text-[10px] font-black underline uppercase">
                                        <MessageSquare className="w-3 h-3" /> Approval Rules
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    name="meta_template_name"
                                    value={formData.meta_template_name}
                                    onChange={handleChange}
                                    placeholder="e.g. order_confirmation"
                                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-700 font-medium transition-all ring-1 ring-slate-200"
                                />
                                <p className="text-[10px] text-slate-400 px-1 font-medium">This name must EXACTLY match the name in your Meta Message Templates dashboard.</p>
                            </div>
                        </div>

                        <div className="pt-4 flex flex-col items-start gap-4">
                            {error && (
                                <div className="w-full p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                                    <AlertCircle className="w-5 h-5" />
                                    {error}
                                </div>
                            )}
                            <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
                                <PremiumButton
                                    onClick={handleSave}
                                    loading={saving}
                                    className="w-full md:w-fit px-12 py-4 shadow-xl shadow-indigo-100"
                                >
                                    {saving ? "Validating Connection..." : "Activate Meta Connection"}
                                </PremiumButton>
                                {saved && (
                                    <div className="flex items-center text-emerald-600 font-black text-sm bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 animate-in fade-in zoom-in slide-in-from-left-4 duration-500">
                                        <CheckCircle2 className="w-5 h-5 mr-3" />
                                        API Connection Established!
                                    </div>
                                )}
                            </div>
                        </div>

                    </PremiumCard>
                </div>

                {/* Sidebar Preview */}
                <div className="lg:col-span-4 space-y-6">
                    <PremiumCard className="p-6 bg-[#f0f2f5] border-none shadow-xl relative overflow-hidden group" delay={0.2}>
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Smartphone className="w-32 h-32 -mr-10 -mt-10" />
                        </div>

                        <div className="mb-6 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Customer Phone UI</span>
                        </div>

                        <div className="w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 ring-4 ring-slate-100">
                            <div className="bg-[#075e54] p-4 text-white flex items-center space-x-3">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-sm ring-2 ring-white/10">
                                    {user?.brand_name?.charAt(0).toUpperCase() || "S"}
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold opacity-80 leading-none">Official Business Account</p>
                                    <p className="text-[14px] font-black leading-none mt-1">{user?.brand_name || "Your Store"}</p>
                                </div>
                            </div>
                            <div className="p-4 bg-[#e5ddd5] min-h-[200px] flex flex-col space-y-4">
                                <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-md text-[13px] max-w-[95%] border-b-2 border-slate-100">
                                    <p className="font-bold text-slate-900">Salams, Khalil!</p>
                                    <p className="text-slate-700 mt-2 leading-relaxed italic">
                                        "Apka Order <span className="font-black">#OC-2938</span> confirm karne ke liye neechay button dabayen."
                                    </p>
                                    <p className="text-[11px] font-bold text-indigo-600 mt-3 pt-3 border-t border-slate-50 flex items-center gap-1">
                                        <Building2 className="w-3 h-3" /> {user?.brand_name || "Company Name"}
                                    </p>
                                    <p className="text-[9px] text-slate-400 mt-2 text-right">09:12 PM • Delivered</p>
                                </div>
                                <div className="space-y-2 mt-auto">
                                    <button className="w-full py-3 bg-white text-emerald-600 font-black text-xs rounded-xl shadow-lg border border-slate-200 flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
                                        ✅ Confirm Order
                                    </button>
                                    <button className="w-full py-3 bg-white text-rose-500 font-black text-xs rounded-xl shadow-lg border border-slate-200 flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
                                        ❌ Cancel Order
                                    </button>
                                </div>
                            </div>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-6 font-medium text-center bg-white/40 p-3 rounded-xl border border-white/60">This template includes: <br /><strong>Customer Name</strong>, <strong>Order ID</strong>, and <br /><strong>{user?.brand_name || "Company Name"}</strong>.</p>
                    </PremiumCard>

                    <PremiumCard className="p-6 bg-gradient-to-br from-indigo-600 to-slate-900 border-none text-white shadow-xl" delay={0.3}>
                        <h4 className="font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400" /> Webhook Setup
                        </h4>
                        <p className="text-xs text-indigo-100/80 leading-relaxed mb-4">
                            To receive button clicks (Confirm/Cancel), you must set this Webhook in your Meta App:
                        </p>
                        <div className="bg-black/20 p-3 rounded-xl border border-white/10 mb-4 group relative">
                            <code className="text-[10px] font-mono text-emerald-300 break-all select-all">
                                {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/webhooks/meta
                            </code>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] text-indigo-200 flex items-center gap-2 font-bold">
                                <ChevronRight className="w-3 h-3" /> Verify Token: <span className="text-white">orderconfirm_secret</span>
                            </p>
                        </div>
                    </PremiumCard>
                </div>

                {/* Overhauled Guide Section */}
                <div className="lg:col-span-12 pt-10 border-t border-slate-200">
                    <div className="mb-8 text-center">
                        <h3 className="text-2xl font-black text-slate-900">Step-by-Step Configuration Guide</h3>
                        <p className="text-slate-500 font-medium">Follow these steps in your <a href="https://developers.facebook.com" target="_blank" className="text-indigo-600 underline">Meta Dashboard</a> to get your keys.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div id="step-1" className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-all">
                            <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black">1</div>
                            <h4 className="font-black text-slate-900">Create App</h4>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">Create a new app on Meta. Select <strong>"Other"</strong> then <strong>"Business"</strong> type. This gives you your <strong>App ID</strong>.</p>
                        </div>
                        <div id="step-2" className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-all">
                            <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black">2</div>
                            <h4 className="font-black text-slate-900">Add WhatsApp</h4>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">Inside your App, scroll to <strong>"Add Products"</strong> and click Set up on <strong>WhatsApp</strong>.</p>
                        </div>
                        <div id="step-3" className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-all">
                            <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black">3</div>
                            <h4 className="font-black text-slate-900">API Setup</h4>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">In sidebar, click <strong>"API Setup"</strong>. Here you will find your <strong>Phone Number ID</strong> and <strong>Business Account ID</strong>.</p>
                        </div>
                        <div id="step-4" className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100 shadow-sm space-y-4 hover:shadow-md transition-all">
                            <div className="w-10 h-10 bg-rose-600 text-white rounded-xl flex items-center justify-center font-black">4</div>
                            <h4 className="font-black text-slate-900">System User (Token)</h4>
                            <p className="text-xs text-slate-600 font-bold leading-relaxed italic">Go to Business Settings &rarr; Users &rarr; System Users. Add a user and "Generate Token" with 'whatsapp_send_messages' permission. This is your <strong>Permanent Token</strong>.</p>
                        </div>
                    </div>

                    <div id="template-guide" className="mt-10 p-8 bg-slate-900 rounded-3xl text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                        <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center">
                            <div className="flex-1 space-y-4">
                                <div className="p-3 bg-white/10 rounded-2xl w-fit">
                                    <Facebook className="w-8 h-8 text-blue-400" />
                                </div>
                                <h3 className="text-2xl font-black italic">Required Template Structure</h3>
                                <p className="text-slate-400 font-medium leading-relaxed max-w-xl">
                                    Meta requires a specific design for automated message approval. Create a "Marketing" or "Utility" template with <strong>Buttons</strong> and this body:
                                </p>
                                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl mt-4 space-y-4">
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-indigo-400">
                                        <span>Body Message</span>
                                        <Copy className="w-4 h-4 cursor-pointer hover:text-white" />
                                    </div>
                                    <p className="text-lg font-medium font-serif italic text-indigo-50 leading-relaxed">
                                        "Hello <span className="text-emerald-400 font-black">{`{{1}}`}</span>, apka order <span className="text-emerald-400 font-black">{`{{2}}`}</span> confirm karne ke liye reply karein. Regard, <span className="text-emerald-400 font-black">{`{{3}}`}</span>"
                                    </p>
                                    <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/5">
                                        <div className="text-[10px] font-bold text-slate-500 line-clamp-1 truncate">{`{{1}}`} = Cust Name</div>
                                        <div className="text-[10px] font-bold text-slate-500 line-clamp-1 truncate">{`{{2}}`} = Order ID</div>
                                        <div className="text-[10px] font-bold text-slate-500 line-clamp-1 truncate">{`{{3}}`} = Brand Name</div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-shrink-0 bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm self-stretch flex flex-col justify-center text-center">
                                <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-2">Approval Time</p>
                                <p className="text-5xl font-black mb-2">~2</p>
                                <p className="text-xl font-bold italic">Minutes</p>
                                <p className="text-[10px] text-slate-400 mt-4 leading-none">Automatically approved <br />by Meta AI</p>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                        {/* Token Guide */}
                        <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-xl space-y-6 relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                            <div className="relative">
                                <div className="p-3 bg-indigo-600 text-white rounded-2xl w-fit mb-4 shadow-lg shadow-indigo-100">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900">Permanent Access Token</h3>
                                <p className="text-slate-500 text-sm font-medium mt-2 leading-relaxed">
                                    Normal tokens expire in 24 hours. Follow these steps for a <strong>Permanent Connection</strong>:
                                </p>
                            </div>
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <span className="flex-shrink-0 w-6 h-6 bg-slate-100 text-slate-800 rounded-lg flex items-center justify-center text-xs font-black">A</span>
                                    <p className="text-xs text-slate-600 font-medium leading-relaxed">Go to <strong>Business Settings</strong> &rarr; Users &rarr; System Users.</p>
                                </div>
                                <div className="flex gap-4">
                                    <span className="flex-shrink-0 w-6 h-6 bg-slate-100 text-slate-800 rounded-lg flex items-center justify-center text-xs font-black">B</span>
                                    <p className="text-xs text-slate-600 font-medium leading-relaxed">Add a new System User (choose <strong>Admin</strong> role).</p>
                                </div>
                                <div className="flex gap-4">
                                    <span className="flex-shrink-0 w-6 h-6 bg-slate-100 text-slate-800 rounded-lg flex items-center justify-center text-xs font-black">C</span>
                                    <p className="text-xs text-slate-600 font-medium leading-relaxed">Click <strong>"Add Assets"</strong> and select your App. Give full control.</p>
                                </div>
                                <div className="flex gap-4">
                                    <span className="flex-shrink-0 w-6 h-6 bg-rose-600 text-white rounded-lg flex items-center justify-center text-xs font-black">D</span>
                                    <p className="text-xs text-slate-600 font-bold leading-relaxed">
                                        Click <strong>"Generate New Token"</strong>. Select your App and check <strong>whatsapp_business_messaging</strong> & <strong>whatsapp_business_management</strong>.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Number Verification Guide */}
                        <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-xl space-y-6 relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                            <div className="relative">
                                <div className="p-3 bg-emerald-600 text-white rounded-2xl w-fit mb-4 shadow-lg shadow-emerald-100">
                                    <Smartphone className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900">Phone Number Verification</h3>
                                <p className="text-slate-500 text-sm font-medium mt-2 leading-relaxed">
                                    Your number must be verified on Meta to go live.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <span className="flex-shrink-0 w-6 h-6 bg-slate-100 text-slate-800 rounded-lg flex items-center justify-center text-xs font-black">1</span>
                                    <p className="text-xs text-slate-600 font-medium leading-relaxed">In your App, go to <strong>WhatsApp &rarr; API Setup</strong>.</p>
                                </div>
                                <div className="flex gap-4">
                                    <span className="flex-shrink-0 w-6 h-6 bg-slate-100 text-slate-800 rounded-lg flex items-center justify-center text-xs font-black">2</span>
                                    <p className="text-xs text-slate-600 font-medium leading-relaxed">Scroll to <strong>"Step 5: Add a phone number"</strong> and click "Add".</p>
                                </div>
                                <div className="flex gap-4">
                                    <span className="flex-shrink-0 w-6 h-6 bg-slate-100 text-slate-800 rounded-lg flex items-center justify-center text-xs font-black">3</span>
                                    <p className="text-xs text-slate-600 font-medium leading-relaxed">Enter your <strong>Business Display Name</strong> (this is what customers will see).</p>
                                </div>
                                <div className="flex gap-4">
                                    <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-xs font-black">4</span>
                                    <p className="text-xs text-slate-600 font-bold leading-relaxed">
                                        Verify your number via <strong>SMS or Phone call</strong>. Once verified, you can send unlimited messages.
                                    </p>
                                </div>
                            </div>
                            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> Important
                                </p>
                                <p className="text-[10px] text-amber-600 font-medium leading-tight">
                                    Make sure the number is NOT active on a regular WhatsApp/Business app. If it is, delete that account first.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

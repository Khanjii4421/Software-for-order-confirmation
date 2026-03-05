"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { Loader2, Save, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

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
    });

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
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put("/integrations/meta", formData);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin w-8 h-8 text-emerald-600" /></div>;
    }

    return (
        <div className="max-w-3xl space-y-8">
            <div className="flex items-center space-x-4 mb-6">
                <Link href="/whatsapp" className="p-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Meta Cloud API Setup</h1>
                    <p className="mt-1 text-sm text-gray-500">Configure your official robust Meta WhatsApp connection.</p>
                </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="mb-6 pb-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">API Credentials</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        You can find these configurations in your Meta Developer Portal under the WhatsApp section. This establishes a fully official integration where WhatsApp approves templates beforehand.
                    </p>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Meta App ID</label>
                        <input
                            type="text"
                            name="meta_app_id"
                            value={formData.meta_app_id}
                            onChange={handleChange}
                            placeholder="e.g. 101234567890123"
                            className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number ID</label>
                        <input
                            type="text"
                            name="meta_phone_number_id"
                            value={formData.meta_phone_number_id}
                            onChange={handleChange}
                            placeholder="e.g. 101234567890123"
                            className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Business Account ID</label>
                        <input
                            type="text"
                            name="meta_business_account_id"
                            value={formData.meta_business_account_id}
                            onChange={handleChange}
                            placeholder="e.g. 101234567890123"
                            className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Permanent Access Token</label>
                        <input
                            type="password"
                            name="meta_access_token"
                            value={formData.meta_access_token}
                            onChange={handleChange}
                            placeholder="EAAG... (Requires system user token with whatsapp_business_messaging permission)"
                            className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                        />
                    </div>

                    <div className="pt-4 flex items-center justify-between">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-3 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center shadow-sm"
                        >
                            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            {saving ? "Saving..." : "Save Credentials"}
                        </button>

                        {saved && (
                            <span className="flex items-center text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-2 rounded-md border border-emerald-100">
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Saved Successfully
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/lib/AuthContext";
import api from "@/lib/api";
import Link from "next/link";
import { Loader2, Eye, EyeOff, Mail, Lock, User, Phone, Briefcase, Hash } from "lucide-react";
import { useGoogleLogin } from '@react-oauth/google';

export default function Signup() {
    const { register, handleSubmit, getValues, formState: { errors } } = useForm();
    const { login } = useAuth();

    const [step, setStep] = useState(1);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const onGoogleSuccess = async (tokenResponse: any) => {
        try {
            setError("");
            setIsLoading(true);
            const res = await api.post("/auth/google", { accessToken: tokenResponse.access_token, isSignUp: true });
            login(res.data.token, res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || "Google Signup failed");
        } finally {
            setIsLoading(false);
        }
    };

    const googleSignup = useGoogleLogin({
        onSuccess: onGoogleSuccess,
        onError: () => setError("Google Signup failed or was cancelled")
    });

    const onSendOtp = async () => {
        const data = getValues();
        if (!data.email || !data.password || !data.brand_name || !data.owner_name) {
            setError("Please fill in all required fields first.");
            return;
        }

        try {
            setError("");
            setSuccessMsg("");
            setIsLoading(true);
            const res = await api.post("/auth/send-otp", { email: data.email });
            setSuccessMsg(res.data.message || "OTP Sent!");
            setStep(2);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to send OTP");
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = async (data: any) => {
        try {
            setError("");
            setIsLoading(true);
            const res = await api.post("/auth/signup", data);
            login(res.data.token, res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || "Signup failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-8 space-y-6">

            {step === 1 && (
                <>
                    <button
                        type="button"
                        onClick={() => googleSignup()}
                        disabled={isLoading}
                        className="w-full relative overflow-hidden flex items-center justify-center space-x-2 py-3 px-4 rounded-xl shadow-lg text-sm font-bold text-slate-800 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900 disabled:opacity-70 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span>Sign up with Google</span>
                    </button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-slate-900/50 backdrop-blur-md text-slate-400">Or sign up with email</span>
                        </div>
                    </div>
                </>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                {step === 1 && (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-slate-300">Brand Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Briefcase className="h-4 w-4 text-slate-400" />
                                    </div>
                                    <input
                                        {...register("brand_name", { required: "Required" })}
                                        type="text"
                                        className="block w-full pl-9 px-3 py-2 bg-white/5 border border-white/10 rounded-xl shadow-sm placeholder-slate-400 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all backdrop-blur-sm text-sm"
                                        placeholder="My Brand"
                                    />
                                </div>
                                {errors.brand_name && <p className="mt-1 text-xs text-red-400">{errors.brand_name.message as string}</p>}
                            </div>

                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-slate-300">Owner Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-4 w-4 text-slate-400" />
                                    </div>
                                    <input
                                        {...register("owner_name", { required: "Required" })}
                                        type="text"
                                        className="block w-full pl-9 px-3 py-2 bg-white/5 border border-white/10 rounded-xl shadow-sm placeholder-slate-400 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all backdrop-blur-sm text-sm"
                                        placeholder="John Doe"
                                    />
                                </div>
                                {errors.owner_name && <p className="mt-1 text-xs text-red-400">{errors.owner_name.message as string}</p>}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-slate-300">Email address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-4 w-4 text-slate-400" />
                                </div>
                                <input
                                    {...register("email", { required: "Email is required" })}
                                    type="email"
                                    className="block w-full pl-9 px-3 py-2 bg-white/5 border border-white/10 rounded-xl shadow-sm placeholder-slate-400 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all backdrop-blur-sm text-sm"
                                    placeholder="you@brand.com"
                                />
                            </div>
                            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message as string}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-slate-300">Phone</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Phone className="h-4 w-4 text-slate-400" />
                                    </div>
                                    <input
                                        {...register("phone", { required: "Required" })}
                                        type="text"
                                        placeholder="+12345678"
                                        className="block w-full pl-9 px-3 py-2 bg-white/5 border border-white/10 rounded-xl shadow-sm placeholder-slate-400 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all backdrop-blur-sm text-sm"
                                    />
                                </div>
                                {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone.message as string}</p>}
                            </div>

                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-slate-300">Orders/Day</label>
                                <select
                                    {...register("orders_per_day")}
                                    className="block w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-xl shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                                >
                                    <option value="1-50">1 - 50</option>
                                    <option value="50-200">50 - 200</option>
                                    <option value="200-500">200 - 500</option>
                                    <option value="500+">500+</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-slate-300">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-slate-400" />
                                </div>
                                <input
                                    {...register("password", { required: "Password is required", minLength: { value: 6, message: "Min 6 chars" } })}
                                    type={showPassword ? "text" : "password"}
                                    className="block w-full pl-9 pr-10 px-3 py-2 bg-white/5 border border-white/10 rounded-xl shadow-sm placeholder-slate-400 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all backdrop-blur-sm text-sm"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message as string}</p>}
                        </div>

                        {error && <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">{error}</div>}

                        <button
                            type="button"
                            onClick={onSendOtp}
                            disabled={isLoading}
                            className="w-full relative overflow-hidden flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-indigo-500 hover:from-emerald-400 hover:to-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900 disabled:opacity-70 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Send Verification Code"}
                        </button>
                    </>
                )}

                {step === 2 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {successMsg && <div className="p-3 shadow-sm bg-emerald-500/10 border border-emerald-500/50 rounded-lg text-emerald-400 text-sm text-center">{successMsg}</div>}

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-slate-300 text-center">Enter 6-digit Code sent to Email</label>
                            <div className="relative mt-2">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Hash className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    {...register("otp", { required: "OTP is required" })}
                                    type="text"
                                    maxLength={6}
                                    className="block w-full text-center tracking-widest text-2xl pl-10 px-3 py-4 bg-white/5 border border-white/10 rounded-xl shadow-sm placeholder-slate-400 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all backdrop-blur-sm"
                                    placeholder="000000"
                                />
                            </div>
                        </div>

                        {error && <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">{error}</div>}

                        <div className="flex space-x-3">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-1/3 flex justify-center py-3 px-4 border border-white/10 rounded-xl shadow-sm text-sm font-bold text-slate-300 bg-white/5 hover:bg-white/10 transition-all duration-300"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-2/3 relative overflow-hidden flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-indigo-500 hover:from-emerald-400 hover:to-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900 disabled:opacity-70 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Verify & Create Account"}
                            </button>
                        </div>
                    </div>
                )}
            </form>

            <div className="text-sm text-center text-slate-300 pt-4 border-t border-white/10">
                Already have an account?{" "}
                <Link href="/login" className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
                    Sign in
                </Link>
            </div>
        </div>
    );
}

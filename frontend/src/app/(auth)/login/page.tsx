"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/lib/AuthContext";
import api from "@/lib/api";
import Link from "next/link";
import { Loader2, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useGoogleLogin } from '@react-oauth/google';

export default function Login() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { login } = useAuth();
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const onGoogleSuccess = async (tokenResponse: any) => {
        try {
            setError("");
            setIsLoading(true);
            const res = await api.post("/auth/google", { accessToken: tokenResponse.access_token });
            login(res.data.token, res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || "Google Login failed");
        } finally {
            setIsLoading(false);
        }
    };

    const googleLogin = useGoogleLogin({
        onSuccess: onGoogleSuccess,
        onError: () => setError("Google Login failed or was cancelled")
    });

    const onSubmit = async (data: any) => {
        try {
            setError("");
            setIsLoading(true);
            const res = await api.post("/auth/login", data);
            login(res.data.token, res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || "Login failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-8 space-y-6">
            <button
                type="button"
                onClick={() => googleLogin()}
                disabled={isLoading}
                className="w-full relative overflow-hidden flex items-center justify-center space-x-2 py-3 px-4 rounded-xl shadow-lg text-sm font-bold text-slate-800 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900 disabled:opacity-70 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Continue with Google</span>
            </button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-slate-900/50 backdrop-blur-md text-slate-400">Or continue with email</span>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-300">Email address</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            {...register("email", { required: "Email is required" })}
                            type="email"
                            className="block w-full pl-10 px-3 py-3 bg-white/5 border border-white/10 rounded-xl shadow-sm placeholder-slate-400 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all backdrop-blur-sm"
                            placeholder="you@brand.com"
                        />
                    </div>
                    {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email.message as string}</p>}
                </div>

                <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-300">Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            {...register("password", { required: "Password is required" })}
                            type={showPassword ? "text" : "password"}
                            className="block w-full pl-10 pr-10 px-3 py-3 bg-white/5 border border-white/10 rounded-xl shadow-sm placeholder-slate-400 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all backdrop-blur-sm"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                    {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password.message as string}</p>}
                </div>

                {error && <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">{error}</div>}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full relative overflow-hidden flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-indigo-500 hover:from-emerald-400 hover:to-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900 disabled:opacity-70 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                    {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Sign In to Dashboard"}
                </button>
            </form>

            <div className="text-sm text-center text-slate-300 pt-4 border-t border-white/10">
                Don't have an account?{" "}
                <Link href="/signup" className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
                    Create App
                </Link>
            </div>
        </div>
    );
}

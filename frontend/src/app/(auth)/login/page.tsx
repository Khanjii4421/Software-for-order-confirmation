"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/lib/AuthContext";
import api from "@/lib/api";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function Login() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { login } = useAuth();
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email address</label>
                    <input
                        {...register("email", { required: "Email is required" })}
                        type="email"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message as string}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                        {...register("password", { required: "Password is required" })}
                        type="password"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message as string}</p>}
                </div>

                {error && <div className="text-red-500 text-sm">{error}</div>}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Sign In"}
                </button>
            </form>

            <div className="text-sm text-center">
                Don't have an account?{" "}
                <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Sign up
                </Link>
            </div>
        </div>
    );
}

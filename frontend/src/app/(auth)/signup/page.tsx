"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/lib/AuthContext";
import api from "@/lib/api";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function Signup() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { login } = useAuth();
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Brand Name</label>
                    <input
                        {...register("brand_name", { required: "Brand Name is required" })}
                        type="text"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors.brand_name && <p className="mt-1 text-sm text-red-600">{errors.brand_name.message as string}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Owner Name</label>
                    <input
                        {...register("owner_name", { required: "Owner Name is required" })}
                        type="text"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors.owner_name && <p className="mt-1 text-sm text-red-600">{errors.owner_name.message as string}</p>}
                </div>

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
                    <label className="block text-sm font-medium text-gray-700">Phone Number (with country code)</label>
                    <input
                        {...register("phone", { required: "Phone is required" })}
                        type="text"
                        placeholder="+1234567890"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message as string}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Estimated Orders Per Day</label>
                    <select
                        {...register("orders_per_day")}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="1-50">1 - 50</option>
                        <option value="50-200">50 - 200</option>
                        <option value="200-500">200 - 500</option>
                        <option value="500+">500+</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                        {...register("password", { required: "Password is required", minLength: { value: 6, message: "Min 6 characters" } })}
                        type="password"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message as string}</p>}
                </div>

                {error && <div className="text-red-500 text-sm">{error}</div>}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Sign Up"}
                </button>
            </form>

            <div className="text-sm text-center">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Sign in
                </Link>
            </div>
        </div>
    );
}

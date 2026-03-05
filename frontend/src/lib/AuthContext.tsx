"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "./api";

type User = {
    id: string;
    brand_name: string;
    email: string;
};

type AuthContextType = {
    user: User | null;
    loading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkLogin = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const { data } = await api.get("/auth/me");
                    setUser(data);
                } catch (error) {
                    localStorage.removeItem("token");
                }
            }
            setLoading(false);
        };

        checkLogin();
    }, []);

    const login = (token: string, userData: User) => {
        localStorage.setItem("token", token);
        setUser(userData);
        router.push("/dashboard");
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

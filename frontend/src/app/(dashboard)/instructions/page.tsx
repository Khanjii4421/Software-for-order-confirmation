"use client";

import { PremiumCard } from "@/components/ui/PremiumComponents";
import {
    BookOpen,
    Settings,
    MessageCircle,
    CheckCircle,
    Zap,
    ShieldCheck,
    Smartphone,
    Rocket
} from "lucide-react";
import { motion } from "framer-motion";

export default function InstructionsPage() {
    const steps = [
        {
            title: "1. Setup Your Store",
            description: "Go to the Integrations tab and connect your Shopify store or use our API. Make sure your products are synced.",
            icon: Settings,
            color: "text-blue-500",
            bgColor: "bg-blue-50"
        },
        {
            title: "2. Setup Meta Cloud API",
            description: "Go to Integrations > Meta Setup to configure your official WhatsApp API. This ensures a permanent connection without phone dependencies.",
            icon: MessageCircle,
            color: "text-green-500",
            bgColor: "bg-green-50"
        },
        {
            title: "3. Automated Message Flow",
            description: "When a new order arrives, OrderConfirm automatically sends an Official Button Template to your customer via Meta Cloud API.",
            icon: Zap,
            color: "text-purple-500",
            bgColor: "bg-purple-50"
        },
        {
            title: "4. Verification & Status",
            description: "Customer clicks 'Confirm' or 'Cancel' on WhatsApp, and your dashboard updates instantly. No manual refreshing needed.",
            icon: CheckCircle,
            color: "text-indigo-500",
            bgColor: "bg-indigo-50"
        }
    ];

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    How it Works? <span className="text-indigo-600">(Meta Cloud API)</span>
                </h1>
                <p className="text-slate-500 text-lg">
                    Follow these simple steps to automate your order verification process using Official Meta API.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {steps.map((step, index) => (
                    <PremiumCard key={index} delay={index * 0.1}>
                        <div className="flex items-start space-x-4">
                            <div className={`p-3 rounded-2xl ${step.bgColor} ${step.color}`}>
                                <step.icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-slate-800 mb-2">{step.title}</h3>
                                <p className="text-slate-600 leading-relaxed font-medium">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    </PremiumCard>
                ))}
            </div>

            <PremiumCard delay={0.5} className="bg-gradient-to-tr from-indigo-700 to-slate-900 text-white border-none shadow-indigo-200">
                <div className="flex items-center space-x-6 p-4">
                    <div className="hidden sm:flex p-5 bg-white/10 rounded-full backdrop-blur-md">
                        <Rocket className="w-10 h-10 text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black mb-3 italic">Pro Tips for Success</h2>
                        <ul className="space-y-3 opacity-90">
                            <li className="flex items-center space-x-2">
                                <ShieldCheck className="w-5 h-5 flex-shrink-0 text-emerald-400" />
                                <span className="font-medium text-sm">Always use a 'Permanent Token' from System User to avoid connection drops.</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <Smartphone className="w-5 h-5 flex-shrink-0 text-indigo-400" />
                                <span className="font-medium text-sm">Ensure your Meta Template includes three parameters: Customer Name, Order ID, and Brand.</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <BookOpen className="w-5 h-5 flex-shrink-0 text-blue-400" />
                                <span className="font-medium text-sm">Export confirmed orders directly for your delivery partner to speed up fulfillment.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </PremiumCard>


            <div className="text-center mt-8">
                <p className="text-slate-400 text-sm">
                    Still have questions? Contact our support team for a demo or assistance.
                </p>
            </div>
        </div>
    );
}

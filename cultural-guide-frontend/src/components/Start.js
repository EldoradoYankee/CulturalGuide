import React from "react";
import { User, MessageSquare, Settings, MapPin, ArrowRight } from "lucide-react";

export function Start({ onNavigate }) {
    const menuItems = [
        {
            id: "profile",
            title: "Profil",
            description: "Verwalten Sie Ihre persönlichen Informationen",
            icon: User,
            gradient: "from-blue-500 to-indigo-600",
        },
        {
            id: "chatbot",
            title: "Chatbot",
            description: "Chatten Sie mit unserem KI-Assistenten",
            icon: MessageSquare,
            gradient: "from-purple-500 to-pink-600",
        },
        {
            id: "preferences",
            title: "Kategorie-Einstellungen",
            description: "Passen Sie Ihre Präferenzen an",
            icon: Settings,
            gradient: "from-green-500 to-teal-600",
        },
        {
            id: "recommendations",
            title: "Stadt-Empfehlungen",
            description: "Entdecken Sie Ihre nächste Destination",
            icon: MapPin,
            gradient: "from-orange-500 to-red-600",
        },
    ];

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-6xl mx-auto">

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {menuItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <button
                                key={item.id}
                                onClick={() => onNavigate(item.id)}
                                className="group bg-white rounded-2xl shadow-xl p-8 text-left hover:shadow-2xl transition-all hover:scale-105"
                            >
                                {/* Icon */}
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-6`}>
                                    <Icon className="w-8 h-8 text-white" />
                                </div>

                                {/* Title + Arrow */}
                                <div className="flex items-start justify-between mb-3">
                                    <h2 className="text-gray-900">{item.title}</h2>
                                    <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                                </div>

                                {/* Description */}
                                <p className="text-gray-600">{item.description}</p>
                            </button>
                        );
                    })}
                </div>

            </div>
        </div>
    );
}

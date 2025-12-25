import React, {useState, useEffect} from "react";
import defaultImage from '../images/ImageWithFallback.jpg';
import {useTranslation} from "react-i18next";
import {LoadingSpinner} from "./ui_components/Loading";
import {ChevronLeft} from "lucide-react";


//New code for translating the buttons
export function InterestSelection({user, municipality, onContinue, onBack}) {
    const {t, i18n} = useTranslation();

    const [interests, setInterests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    useEffect(() => {
        if (!municipality) return;
        console.log("InterestSelection municipality:", municipality);

        const fetchCategories = async () => {
            setLoading(true);
            setError("");

            try {
                const res = await fetch(
                    `https://apispm.eppoi.io/api/categories?municipality=${encodeURIComponent(
                        municipality
                    )}&language=${i18n.language}`
                );

                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }

                const data = await res.json();

                setInterests(prev => {
                    const selectedIds = prev
                        .filter(i => i.selected)
                        .map(i => i.id);

                    return data.map(cat => ({
                        id: cat.category.toLowerCase(),
                        title: cat.label,
                        // Proxy the image through your backend
                        image: cat.imagePath
                            ? `http://localhost:5203/api/eppoiapi/proxy-image?imageUrl=${encodeURIComponent(cat.imagePath)}`
                            : defaultImage,
                        selected: selectedIds.includes(cat.category.toLowerCase())
                    }));
                });
            } catch (err) {
                console.error("Failed to load categories", err);
                setError("Failed to load interests");
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, [municipality, i18n.language]);
    const toggleInterest = (id) => {
        setInterests((prev) =>
            prev.map((interest) =>
                interest.id === id ? {...interest, selected: !interest.selected} : interest
            )
        );
    };

    const handleContinue = () => {
        const selectedIds = interests.filter(i => i.selected).map(i => i.id);
        onContinue(selectedIds); // App.js will decide what happens next
    };

    const selectedCount = interests.filter(i => i.selected).length;

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                <div className="w-full max-w-4xl">
                    <div >
                        {/* Back Button */}
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="mb-6 flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
                            >
                                <ChevronLeft className="w-5 h-5"/>
                                {t('interestSelection_goBack')}
                            </button>
                        )}
                        <style>
                            {`
                                  .slick-slider {
                                    margin: 0 -80px;
                                  }
                                  .slick-dots li button:before {
                                    font-size: 10px;
                                    color: #6366f1;
                                  }
                                  .slick-dots li.slick-active button:before {
                                    color: #6366f1;
                                    opacity: 1;
                                  }
                                  .slick-slide {
                                    padding: 0 10px;
                                  }
                                  .slick-list {
                                    overflow: visible;
                                  }
                                `}‡
                        </style>

                    </div>
                    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">

                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                                {t("interestSelection_greetings")}, {user.name}!
                            </h1>
                            <p className="text-gray-600 mb-4 text-lg">
                                {t("interestSelection_subtitle")}
                            </p>
                            <div
                                className="inline-flex items-center bg-indigo-50 px-3 py-1 rounded-full text-indigo-700 font-medium text-sm mb-6">
                                {t("interestSelection_destination")} {municipality || "Massignano"}
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                                {t("interestSelection_selectionQuestion")}
                            </h2>
                        </div>
                        
                        {/* Interests Grid */}
                        <div className="p-6 grid place-items-center">
                            {loading ? (
                                <LoadingSpinner size="lg"/>
                            ) : null}
                        </div>

                        {error && <p className="text-red-500">{error}</p>}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {interests.map(interest => (
                                <div
                                    key={interest.id}
                                    onClick={() => toggleInterest(interest.id)}
                                    className={`cursor-pointer rounded-xl border-2 p-4 transition
                                ${interest.selected
                                        ? "border-indigo-600 bg-indigo-50"
                                        : "border-gray-200 bg-white"
                                    }`}
                                >
                                    <img
                                        src={interest.image}
                                        alt={interest.title}
                                        className="h-32 w-full object-contain mb-3"
                                    />
                                    <h3 className="text-lg font-semibold text-center">
                                        {interest.title}
                                    </h3>
                                </div>
                            ))}
                        </div>

                        
                        {/* Footer */}
                        <div
                            className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
                            <p className={`font-medium ${selectedCount > 0 ? 'text-indigo-600' : 'text-gray-400'}`}>
                                {selectedCount > 0
                                    ? `${selectedCount} ${t("interestSelection_selected")}`
                                    : t("interestSelection_selectAtLeastOne")}
                            </p>
                            <button
                                onClick={handleContinue}
                                disabled={selectedCount === 0}
                                className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed active:scale-95"
                            >
                                {t("interestSelection_continue")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { useState, useEffect } from "react";
import { Landmark, Music, Palette, ShoppingBag, Sparkles, TreePine, Utensils, Waves } from "lucide-react";
import { InterestCard } from "./InterestCard";
import { useTranslation } from "react-i18next";

//New code for translating the buttons
export function InterestSelection({ user, city = 'Barcelona', onContinue }) {

    const { t, i18n } = useTranslation();

    const getInterests = () => [
        { id: 'history', title: t("interestSelection_history"), icon: Landmark, selected: false },
        { id: 'nature', title: t("interestSelection_nature"), icon: TreePine, selected: false },
        { id: 'food', title: t("interestSelection_food"), icon: Utensils, selected: false },
        { id: 'art', title: t("interestSelection_art"), icon: Palette, selected: false },
        { id: 'nightlife', title: t("interestSelection_nightlife"), icon: Music, selected: false },
        { id: 'wellness', title: t("interestSelection_wellness"), icon: Sparkles, selected: false },
        { id: 'shopping', title: t("interestSelection_shopping"), icon: ShoppingBag, selected: false },
        { id: 'beach', title: t("interestSelection_beach"), icon: Waves, selected: false },
    ];

    const [interests, setInterests] = useState(getInterests());

    useEffect(() => {
        const currentSelected = interests.map(i => i.id).filter(id =>
            interests.find(interest => interest.id === id && interest.selected)
        );

        const updatedInterests = getInterests();
        setInterests(updatedInterests.map(interest => ({
            ...interest,
            selected: currentSelected.includes(interest.id)
        })));
    }, [i18n.language]);


    //Old code in case something breaks
/* export function InterestSelection({ user, city = 'Barcelona', onContinue }) {

    const { t } = useTranslation();

    // Added into an array to make the translation work
    const getInterests = () => [
        { id: 'history', title: t("interestSelection_history"), icon: Landmark, selected: false },
        { id: 'nature', title: t("interestSelection_nature"), icon: TreePine, selected: false },
        { id: 'food', title: t("interestSelection_food"), icon: Utensils, selected: false },
        { id: 'art', title: t("interestSelection_art"), icon: Palette, selected: false },
        { id: 'nightlife', title: t("interestSelection_nightlife"), icon: Music, selected: false },
        { id: 'wellness', title: t("interestSelection_wellness"), icon: Sparkles, selected: false },
        { id: 'shopping', title: t("interestSelection_shopping"), icon: ShoppingBag, selected: false },
        { id: 'beach', title: t("interestSelection_beach"), icon: Waves, selected: false },
    ];

    const [interests, setInterests] = useState(getInterests()); */

    const toggleInterest = (id) => {
        setInterests((prev) =>
            prev.map((interest) =>
                interest.id === id ? { ...interest, selected: !interest.selected } : interest
            )
        );
    };

    const handleContinue = () => {
        const selectedIds = interests.filter(i => i.selected).map(i => i.id);
        onContinue(selectedIds); // App.js will decide what happens next
    };

    const selectedCount = interests.filter(i => i.selected).length;

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex items-center justify-center">
            <div className="w-full max-w-4xl">
                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                            {t("interestSelection_greetings")}, {user.name}!
                        </h1>
                        <p className="text-gray-600 mb-4 text-lg">
                            {t("interestSelection_subtitle")}
                        </p>
                        <div className="inline-flex items-center bg-indigo-50 px-3 py-1 rounded-full text-indigo-700 font-medium text-sm mb-6">
                            {t("interestSelection_destination")} {city}
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                            {t("interestSelection_selectionQuestion")}
                        </h2>
                    </div>

                    {/* Interests Grid */}
                    <div className="max-h-[500px] overflow-y-auto pr-2 mb-8 custom-scrollbar">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {interests.map(interest => (
                                <InterestCard
                                    key={interest.id}
                                    interest={interest}
                                    onToggle={toggleInterest}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
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
    );
}

import { useState } from 'react';
import {
    Landmark, TreePine, Utensils, Palette, Music,
    Sparkles, ShoppingBag, Waves, Check
} from 'lucide-react';

// --- Constants ---
const AVAILABLE_INTERESTS = [
    { id: 'history', title: 'History & Culture', icon: Landmark, selected: false },
    { id: 'nature', title: 'Nature & Adventure', icon: TreePine, selected: false },
    { id: 'food', title: 'Food & Wine', icon: Utensils, selected: false },
    { id: 'art', title: 'Art & Museums', icon: Palette, selected: false },
    { id: 'nightlife', title: 'Night Life', icon: Music, selected: false },
    { id: 'wellness', title: 'Wellness & Relaxation', icon: Sparkles, selected: false },
    { id: 'shopping', title: 'Shopping', icon: ShoppingBag, selected: false },
    { id: 'beach', title: 'Beach & Sea', icon: Waves, selected: false },
];

// --- Sub-Components ---

function InterestCard({ interest, onToggle }) {
    const Icon = interest.icon;
    const isSelected = interest.selected;

    return (
        <button
            onClick={() => onToggle(interest.id)}
            aria-pressed={isSelected}
            className={`
        p-6 rounded-xl border-2 transition-all text-left w-full
        ${isSelected
                ? 'border-indigo-600 bg-indigo-50 shadow-sm'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            }
      `}
        >
            <div className="flex items-center gap-4">

                {/* Icon */}
                <div className={`
          w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors
          ${isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}
        `}>
                    <Icon className="w-7 h-7" />
                </div>

                {/* Title */}
                <div className="flex-1">
                    <h3 className={`font-medium ${isSelected ? 'text-indigo-900' : 'text-gray-900'}`}>
                        {interest.title}
                    </h3>
                </div>

                {/* Checkbox */}
                <div className={`
          w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
          ${isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'}
        `}>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>
            </div>
        </button>
    );
}

// --- Main Component ---

export function InterestsSelection({ user, city = 'Barcelona', onContinue }) {
    const [interests, setInterests] = useState(AVAILABLE_INTERESTS);

    const toggleInterest = (id) => {
        setInterests((prev) =>
            prev.map((interest) =>
                interest.id === id ? { ...interest, selected: !interest.selected } : interest
            )
        );
    };

    const handleContinue = () => {
        const selectedIds = interests.filter((i) => i.selected).map((i) => i.id);
        onContinue(selectedIds);
    };

    const selectedCount = interests.filter((i) => i.selected).length;

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex items-center justify-center">
            <div className="w-full max-w-4xl">
                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                            Hello, {user.name}!
                        </h1>
                        <p className="text-gray-600 mb-4 text-lg">
                            Customize your tourist experience by answering a few questions.
                        </p>
                        <div className="inline-flex items-center bg-indigo-50 px-3 py-1 rounded-full text-indigo-700 font-medium text-sm mb-6">
                            📍 Destination: {city}
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                            What are your interests?
                        </h2>
                    </div>

                    {/* Grid */}
                    <div className="max-h-[500px] overflow-y-auto pr-2 mb-8 custom-scrollbar">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {interests.map((interest) => (
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
                                ? `${selectedCount} interest${selectedCount !== 1 ? 's' : ''} selected`
                                : 'Select at least one interest to continue'}
                        </p>
                        <button
                            onClick={handleContinue}
                            disabled={selectedCount === 0}
                            className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed active:scale-95"
                        >
                            Continue
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

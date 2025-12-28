import React from 'react';
import { X, MapPin, Clock, Phone, Globe, Mail, Calendar, Info, Euro } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import defaultImage from '../images/ImageWithFallback.jpg';
import {toast} from "sonner";

export function SwipeCarouselDetail({ item, onClose }) {
    const { t } = useTranslation();
    if (!item) return null;

    //it gives back info only if value exists
    const InfoRow = ({ icon: Icon, label, value, isLink, linkType }) => {
        if (!value) return null;
    return (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="p-2 bg-white rounded-full shadow-sm text-indigo-600">
                <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 overflow-hidden">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">{label}</p>
                {isLink ? (
                    <a
                        href={linkType === 'email' ? `mailto:${value}` : linkType === 'tel' ? `tel:${value}` : value}
                        target={linkType === 'url' ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        className="text-indigo-600 font-medium hover:underline truncate block"
                    >
                        {value}
                    </a>
                ) : (
                    <p className="text-gray-900 font-medium text-sm md:text-base break-words">{value}</p>
                )}
            </div>
        </div>
    );
    };
return (
    // Blurred overlay (Backdrop)
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity"
            onClick={onClose}
            aria-hidden="true"
        />

        {/* Modal Card */}
        <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-200">

            {/* Close Button (Mobile: top-right absolute, Desktop: top-right absolute) */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 p-2 bg-white/80 backdrop-blur text-gray-700 rounded-full hover:bg-white hover:text-red-600 transition-all shadow-lg"
            >
                <X className="w-6 h-6" />
            </button>

            {/* Left Side: Image */}
            <div className="w-full md:w-5/12 h-64 md:h-auto relative bg-gray-100">
                <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = defaultImage;
                    }}
                />
                <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-indigo-600/90 backdrop-blur text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
                            {item.type}
                        </span>
                </div>
            </div>

            {/* Right Side: Content */}
            <div className="w-full md:w-7/12 p-6 md:p-8 lg:p-10 flex flex-col">

                {/* Header */}
                <div className="mb-6 border-b border-gray-100 pb-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight">
                        {item.title}
                    </h2>
                    {/* Additional info here */}
                </div>

                {/* Description */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Info className="w-5 h-5 text-indigo-500" />
                        {t('details_about') || "About"}
                    </h3>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm md:text-base">
                        {item.description || t('details_noDescription') || "No description available for this place."}
                    </p>
                </div>

                {/* Info Grid - Generic */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoRow
                        icon={MapPin}
                        label={t('details_address') || "Address"}
                        value={item.location}
                    />

                    <InfoRow
                        icon={Clock}
                        label={t('details_hours') || "Opening Hours"}
                        value={item.openingHours !== "N/A" ? item.openingHours : null}
                    />

                    {/* Future attributes retrived from the backend here */}
                    <InfoRow
                        icon={Phone}
                        label={t('details_phone') || "Phone"}
                        value={item.phone}
                        isLink linkType="tel"
                    />

                    <InfoRow
                        icon={Mail}
                        label={t('details_email') || "Email"}
                        value={item.email}
                        isLink linkType="email"
                    />

                    <InfoRow
                        icon={Globe}
                        label={t('details_website') || "Website"}
                        value={item.website}
                        isLink linkType="url"
                    />

                    <InfoRow
                        icon={Euro}
                        label={t('details_price') || "Price"}
                        value={item.price}
                    />
                </div>

                {/* Footer Actions (Optional) */}
                <div className="mt-8 pt-6 border-t border-gray-100 flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        {t('close') || "Close"}
                    </button>
                    <button
                        className="flex-1 py-3 px-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                        onClick={() => toast.info("Feature coming soon: Navigate")}
                    >
                        {t('navigate') || "Navigate"}
                    </button>
                </div>
            </div>
        </div>
    </div>
);
}
import React, { useState } from 'react';
import {ArrowRight, ChevronLeft} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export function TimeAvailability({ onContinue, onBack }) {
    const { t } = useTranslation();

    const [startSelection, setStartSelection] = useState({ date: null, hour: null })
    const [endSelection, setEndSelection] = useState({ date: null, hour: null });
    const [activeCalendar, setActiveCalendar] = useState('start');
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const hours = Array.from({ length: 24 }, (_, i) => i);

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();

        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let i = 1; i <= lastDate; i++) days.push(new Date(year, month, i));
        return days;
    };

    // -----------
    // Time Selection Handlers
    // -----------
    const selectDate = (date) => {
        activeCalendar === 'start'
            ? setStartSelection({ ...startSelection, date })
            : setEndSelection({ ...endSelection, date });
    };

    const selectHour = (hour) => {
        activeCalendar === 'start'
            ? setStartSelection({ ...startSelection, hour })
            : setEndSelection({ ...endSelection, hour });
    };

    // -----------
    // onContinue Handler
    // -----------
    const handleContinue = () => {
        if (!startSelection.date || startSelection.hour === null ||
            !endSelection.date || endSelection.hour === null) {
            toast.error(t('timeAvailability_errorSelectBoth'));
            return;
        }

        const start = new Date(startSelection.date);
        start.setHours(startSelection.hour, 0, 0, 0);

        const end = new Date(endSelection.date);
        end.setHours(endSelection.hour, 0, 0, 0);

        if (end <= start) {
            toast.error(t('timeAvailability_errorEndBeforeStart'));
            return;
        }

        onContinue(start, end);
    };

    const days = getDaysInMonth(currentMonth);
    const currentSelection = activeCalendar === 'start' ? startSelection : endSelection;
    const isComplete = startSelection.date && startSelection.hour !== null &&
        endSelection.date && endSelection.hour !== null;

    return (
        <div className="w-full py-8 px-4 overflow-hidden">
            <div className="max-w-2xl mx-auto">
                <div className="w-full max-w-4xl">
            {/* Back Button */}
            {onBack && (
                <button
                    onClick={onBack}
                    className="mb-6 flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
                >
                    <ChevronLeft className="w-5 h-5"/>
                    {t('timeAvailability_goBack')}
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
                        `}
            </style>
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-5xl">

                <h1 className="text-2xl font-bold mb-2">{t('timeAvailability_title')}</h1>
                <p className="text-gray-600 mb-6">{t('timeAvailability_subtitle')}</p>

                
                
                {/* Start / End Selector */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    {['start', 'end'].map(type => (
                        <button
                            key={type}
                            onClick={() => setActiveCalendar(type)}
                            className={`p-4 rounded-xl border-2 ${
                                activeCalendar === type
                                    ? 'border-indigo-600 bg-indigo-50'
                                    : 'border-gray-200'
                            }`}
                        >
                            <p className="font-medium">
                                {type === 'start'
                                    ? t('timeAvailability_from')
                                    : t('timeAvailability_to')}
                            </p>
                        </button>
                    ))}
                </div>

                {/* Calendar */}
                <div className="grid grid-cols-7 gap-2 mb-6">
                    {t('timeAvailability_days', { returnObjects: true }).map(day => (
                        <div key={day} className="text-center text-sm text-gray-500">{day}</div>
                    ))}
                    {days.map((day, i) =>
                        day ? (
                            <button
                                key={i}
                                onClick={() => selectDate(day)}
                                className={`p-2 rounded-lg ${
                                    currentSelection.date?.toDateString() === day.toDateString()
                                        ? 'bg-indigo-600 text-white'
                                        : 'hover:bg-gray-200'
                                }`}
                            >
                                {day.getDate()}
                            </button>
                        ) : <div key={i} />
                    )}
                </div>

                {/* Hours */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {hours.map(hour => (
                        <button
                            key={hour}
                            onClick={() => selectHour(hour)}
                            disabled={!currentSelection.date}
                            className={`p-3 rounded-xl border ${
                                currentSelection.hour === hour
                                    ? 'border-indigo-600 bg-indigo-50'
                                    : 'border-gray-200'
                            }`}
                        >
                            {hour.toString().padStart(2, '0')}:00
                        </button>
                    ))}
                </div>
                
                {/* Footer */}
                <button
                    onClick={handleContinue}
                    disabled={!isComplete}
                    className="w-full bg-indigo-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {t('timeAvailability_continue')}
                    <ArrowRight />
                </button>
            </div>
        </div>
        </div>
        </div>
    );
}

import React, {useEffect, useState} from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ChevronLeft, ChevronRight, MapPin, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import defaultImage from '../images/ImageWithFallback.jpg';
import {fetchEatAndDrinks} from "../services/EatAndDrinksService";

// -----------------------------
// Arrows
// -----------------------------
const NextArrow = ({ onClick }) => (
    <button
        onClick={onClick}
        className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-xl hover:shadow-2xl flex items-center justify-center transition-all hover:scale-110 border-2 border-gray-200 hover:border-indigo-600"
    >
        <ChevronRight className="w-6 h-6 text-gray-700" />
    </button>
);

const PrevArrow = ({ onClick }) => (
    <button
        onClick={onClick}
        className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-xl hover:shadow-2xl flex items-center justify-center transition-all hover:scale-110 border-2 border-gray-200 hover:border-indigo-600"
    >
        <ChevronLeft className="w-6 h-6 text-gray-700" />
    </button>
);

// -----------------------------
// SwipeCarousel Component
// -----------------------------
export function SwipeCarousel({  onViewDetails, onBack, municipality }) {
    // GET EatAndDrinks data from API
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [currentSlide, setCurrentSlide] = useState(0);
    const { t, i18n } = useTranslation();
    // Use EatAndDrinksService to fetch data
    const [eatAndDrinks, setEatAndDrinks] = useState([]);
    // Use AnyOtherService to fetch data
    // const [eatAndDrinks, setEatAndDrinks] = useState([]);
    // currently selected municipality from citySelection
    

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        centerMode: true,
        centerPadding: '80px',
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
        beforeChange: (_current, next) => setCurrentSlide(next),
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    centerPadding: '40px',
                    arrows: false,
                },
            },
        ],
    };
    
    // -----------------------------
    // Fetch EatAndDrinks data when municipality or language changes and set EatAndDrinks into carousel
    // -----------------------------
    useEffect(() => {
        if (!municipality) return;

        const loadEatAndDrinks = async () => {  // Renamed to avoid conflict
            setLoading(true);
            setError("");

            try {
                const language = i18n.language;

                console.log('municipality in carousel: ', municipality);

                // Call the imported service function
                const data = await fetchEatAndDrinks(municipality, language);

                console.log('The transformed data: ', data);

                setEatAndDrinks(data);

            } catch (err) {
                console.error(err);
                setError(err.message || "Network error while fetching eatAndDrinks");
                toast.error(t('error_loading_data') || "Failed to load data");
            } finally {
                setLoading(false);
            }
        };

        loadEatAndDrinks();
    }, [municipality, i18n.language]);



    const handleViewDetails = (poi) => {
        if (onViewDetails) {
            onViewDetails(poi);
        } else {
            toast.success(`${t('swipeCarousel_detailsClicked')} ${poi.title}`);
        }
    };

    return (
        <div className="w-full py-8 px-4 overflow-hidden">
            {/* Bottone Indietro */}
            {onBack && (
                <button
                    onClick={onBack}
                    className="mb-6 flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
                >
                    <ChevronLeft className="w-5 h-5" />
                    {t('swipeCarousel_back')}
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

            {/* Carousel max width container */}
            <div className="max-w-2xl mx-auto">

            <Slider {...settings}>
                {eatAndDrinks.map((eatAndDrink) => (
                    <div key={eatAndDrink.id} className="px-2">
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all hover:shadow-2xl border-2 border-transparent hover:border-indigo-600">
                            {/* Image */}
                            <div className="relative h-64 md:h-80 overflow-hidden">
                                <img
                                    alt={eatAndDrink.title}
                                    src={eatAndDrink.image}
                                    className="w-full h-full object-cover"

                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = defaultImage;
                                    }}
                                />
                                <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-xl">
                                    <span className="text-indigo-600 capitalize">{eatAndDrink.type}</span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <h2 className="text-gray-900 mb-4">{eatAndDrink.title}</h2>

                                <p className="text-gray-600 mb-4 line-clamp-3">
                                    {eatAndDrink.description[i18n.language]}
                                </p>

                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <MapPin className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                                        <span>{eatAndDrink.location}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Clock className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                                        <span>{eatAndDrink.openingHours}</span>
                                    </div>
                                </div>

                                <button
                                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-xl hover:bg-indigo-700 transition"
                                    onClick={() => handleViewDetails(eatAndDrink)}
                                >
                                    {t('swipeCarousel_viewDetails')}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </Slider>
        </div>
        </div>
    );
}

export default SwipeCarousel;
import React, {useEffect, useState} from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ChevronLeft, ChevronRight, MapPin, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import defaultImage from '../images/ImageWithFallback.jpg';





// -----------------------------
// Arrows
// -----------------------------
const NextArrow = ({ onClick }) => (
    <button
        onClick={onClick}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-xl hover:shadow-2xl flex items-center justify-center transition-all hover:scale-110 border-2 border-gray-200 hover:border-indigo-600"
    >
        <ChevronRight className="w-6 h-6 text-gray-700" />
    </button>
);

const PrevArrow = ({ onClick }) => (
    <button
        onClick={onClick}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-xl hover:shadow-2xl flex items-center justify-center transition-all hover:scale-110 border-2 border-gray-200 hover:border-indigo-600"
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
    const [eatAndDrinks, setEatAndDrinks] = useState([]);
    const selectedCity = municipality;

    // DEBUG municipality name
    //console.log('municipality in carousel: ', municipality);
    const localImages = [
        "http://localhost:5203/images/img1Cossignani.jpg",
        "http://localhost:5203/images/img2MassignanoCaffe.jpg",
        "http://localhost:5203/images/img3.jpg",
        "http://localhost:5203/images/img4.jpg",
        "http://localhost:5203/images/img5.jpg"
    ];

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
    
    // Fetch EatAndDrinks data when municipality or language changes and set EatAndDrinks into carousell
    useEffect(() => {
        if (!municipality) return; // nothing to fetch yet
        
        // DEBUG municipality name
        //console.log('municipality in carousel: ', municipality);
        const fetchEatAndDrinks = async () => {
            setLoading(true);
            setError("");

            try {
                const municipality = selectedCity;
                const language = i18n.language;

                // DEBUG municipality name
                //console.log('municipality in carousel: ', municipality);
                
                const response = await fetch(
                    `http://localhost:5203/api/eppoiapi/eat-and-drinks?municipality=${encodeURIComponent(municipality)}&language=${encodeURIComponent(language)}`,
                    {
                        method: "GET",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                    }
                );
                
                // DEBUG response status
                //console.log("response from fetch with massignano: " + response.status);

                if (!response.ok) {
                    setError(`Error fetching eatAndDrinks: ${response.status}`);
                    return;
                }

                // await response and parse JSON to array
                const data = await response.json().catch(() => []);

                // Transform backend data to the expected template
                const transformed = data.map((eatAndDrinks,index) => ({
                    id: eatAndDrinks.entityId,
                    type: eatAndDrinks.badgeText, // or map your types properly
                    /*
                    image: eatAndDrinks.imagePath
                        ? `http://localhost:5203${eatAndDrinks.imagePath}`
                        : defaultImage,
                        */
                    image: localImages[index % localImages.length],
                    title: eatAndDrinks.entityName,             // plain string without translations
                    description: eatAndDrinks.badgeText || "",  // plain string without translations
                    location: eatAndDrinks.address || "Unknown address",
                    openingHours: "N/A", // you can extend backend to provide this if available
                }));
                
                // DEBUG transformed data
                console.log(transformed);

                setEatAndDrinks(transformed);

            } catch (err) {
                console.error(err);
                setError("Network error while fetching eatAndDrinks");
            } finally {
                setLoading(false);
            }
        };

        fetchEatAndDrinks();
    }, [selectedCity, i18n.language]);


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
            <div className="max-w-4xl mx-auto">

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
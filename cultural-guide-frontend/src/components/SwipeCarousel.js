import React, {useState} from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ChevronLeft, ChevronRight, MapPin, Clock } from 'lucide-react';
import { toast } from 'sonner';
 
// -----------------------------
// Mock Data.
// -----------------------------
const mockPointsOfInterest = [
    {
        id: '1',
        type: 'restaurant',
        image:
            'https://images.unsplash.com/photo-1657593088889-5105c637f2a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwaW50ZXJpb3IlMjBkaW5pbmd8ZW58MXx8fHwxNzY0NjkxMzg4fDA&ixlib=rb-4.1.0&q=80&w=1080',
        title: {
            de: 'La Terrazza',
            en: 'La Terrazza',
            es: 'La Terrazza',
            fr: 'La Terrazza',
        },
        description: {
            de: 'Exquisite mediterrane Küche...',
            en: 'Exquisite Mediterranean cuisine...',
            es: 'Exquisita cocina mediterránea...',
            fr: 'Cuisine méditerranéenne exquise...',
        },
        location: 'Passeig de Gràcia 43',
        openingHours: '12:00 - 23:00',
    },
    // ... (rest of the POIs stay exactly the same)
];

// -----------------------------
// Arrows
// -----------------------------
const NextArrow = ({ onClick }) => (
    <button
        onClick={onClick}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-xl hover:shadow-2xl flex items-center justify-center transition-all hover:scale-110"
    >
        <ChevronRight className="w-6 h-6 text-gray-700" />
    </button>
);

const PrevArrow = ({ onClick }) => (
    <button
        onClick={onClick}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-xl hover:shadow-2xl flex items-center justify-center transition-all hover:scale-110"
    >
        <ChevronLeft className="w-6 h-6 text-gray-700" />
    </button>
);

// -----------------------------
// SwipeCarousel Component
// -----------------------------
export function SwipeCarousel({ language = 'de', onViewDetails }) {
    const [setCurrentSlide] = useState(0);

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        centerMode: true,
        centerPadding: '60px',
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
        beforeChange: (_current, next) => setCurrentSlide(next),
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    centerPadding: '20px',
                    arrows: false,
                },
            },
        ],
    };

    const translations = {
        viewDetails: {
            de: 'Details ansehen',
            en: 'View Details',
            es: 'Ver Detalles',
            fr: 'Voir Détails',
        },
        location: {
            de: 'Standort',
            en: 'Location',
            es: 'Ubicación',
            fr: 'Emplacement',
        },
        hours: {
            de: 'Öffnungszeiten',
            en: 'Opening Hours',
            es: 'Horario',
            fr: 'Horaires',
        },
        detailsClicked: {
            de: 'Details für',
            en: 'Details for',
            es: 'Detalles de',
            fr: 'Détails pour',
        },
    };

    const handleViewDetails = (poi) => {
        if (onViewDetails) {
            onViewDetails(poi);
        } else {
            toast.success(`${translations.detailsClicked[language]} ${poi.title[language]}`);
        }
    };

    return (
        <div className="w-full py-8 px-4">
            <style>
                {`
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

            <Slider {...settings}>
                {mockPointsOfInterest.map((poi) => (
                    <div key={poi.id} className="px-2">
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-transform hover:shadow-2xl">
                            {/* Image */}
                            <div className="relative h-64 md:h-80 overflow-hidden">
                                <img
                                    alt={"alt text sample of a cultural activity"}
                                    src={"../images/ImageWithFallback.jpg"}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-xl">
                                    <span className="text-indigo-600 capitalize">{poi.type}</span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <h2 className="text-gray-900 mb-4">{poi.title[language]}</h2>

                                <p className="text-gray-600 mb-4 line-clamp-3">
                                    {poi.description[language]}
                                </p>

                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <MapPin className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                                        <span>{poi.location}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Clock className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                                        <span>{poi.openingHours}</span>
                                    </div>
                                </div>

                                <button
                                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-xl hover:bg-indigo-700 transition"
                                    onClick={() => handleViewDetails(poi)}
                                >
                                    {translations.viewDetails[language]}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </Slider>
        </div>
    );
}

export default SwipeCarousel;
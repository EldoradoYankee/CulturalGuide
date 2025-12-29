import React, { useEffect, useState } from "react";
import { SwipeCarouselDetail } from "./SwipeCarouselDetail";
import { MapView } from "./ui_components/MapView";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ChevronLeft, ChevronRight, MapPin, Clock, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import defaultImage from '../images/ImageWithFallback.jpg';
import { fetchEatAndDrinks } from "../services/EatAndDrinksService";
import { fetchArtAndCulture } from "../services/ArtAndCultureService";
import { fetchArticlesAndMagazines } from "../services/ArticlesAndMagazinesService";
import { fetchEconomicOperators } from "../services/EconomicOperatorsService";
import { fetchEvents } from "../services/EventsService";
import { fetchItineraries } from "../services/ItinerariesService";
import { fetchNature } from "../services/NatureService";
import { fetchPointsOfSale } from "../services/PointsOfSaleService";
import { fetchRecreationAndFun } from "../services/RecreationAndFunService";
import { fetchServices } from "../services/ServicesService";
import { fetchSleep } from "../services/SleepService";
import { fetchTypicalProducts } from "../services/TypicalProductsService";
import { LoadingSpinner } from "./ui_components/Loading";
import { formatDate } from "../utils/formatDate";
import { mapCategoriesToEndpoints, mapPoiToEndpoint} from "../services/PoiToEnpointMapper";
import {fetchEntertainmentLeisure} from "../services/EntertainmentLeisureService";
import {fetchOrganizations} from "../services/OrganizationService";
import {fetchRoutes} from "../services/RoutesService";
import {fetchShopping} from "../services/ShoppingService";
import { fetchMap } from "../services/MapService";

// ... (NextArrow and PrevArrow components stay the same)
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


export function SwipeCarousel({ onViewDetails, onBack, municipality, user, onNavigateToPreferences }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [currentSlide, setCurrentSlide] = useState(0);
    const { t, i18n } = useTranslation();

    // Detail view state
    const [selectedItem, setSelectedItem] = useState(null);

    // City selection state
    const [municipalities, setMunicipalities] = useState([]);
    const [selectedCity, setSelectedCity] = useState("");

    // Time availability state
    const [startSelection, setStartSelection] = useState({ date: null, hour: null });
    const [endSelection, setEndSelection] = useState({ date: null, hour: null });

    // Preference state
    const [hasProfileVector, setHasProfileVector] = useState(null);
    const [profileVector, setProfileVector] = useState(null);

    // Locations for MapView
    const [centerLatitude, setCenterLatitude] = useState();
    const [centerLongitude, setCenterLongitude] = useState();
    
    const [markers, setMarkers] = useState([]);
    
    // Data states
    const [eatAndDrinks, setEatAndDrinks] = useState([]);
    const [artAndCulture, setArtAndCulture] = useState([]);
    const [articles, setArticles] = useState([]);
    const [organizations, setOrganizations] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [shopping, setShopping] = useState([]);
    const [economicOperators, setEconomicOperators] = useState([]);
    const [entertainmentLeisure, setEntertainmentLeisure] = useState([]);
    const [events, setEvents] = useState([]);
    const [itineraries, setItineraries] = useState([]);
    const [natureItems, setNatureItems] = useState([]);
    const [pointsOfSale, setPointsOfSale] = useState([]);
    const [recreationItems, setRecreationItems] = useState([]);
    const [publicServices, setPublicServices] = useState([]);
    const [sleepItems, setSleepItems] = useState([]);
    const [typicalProducts, setTypicalProducts] = useState([]);

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
                    centerPadding: '20px',
                    arrows: false,
                },
            },
            {
                breakpoint: 480,
                settings: {
                    centerPadding: '10px',
                    arrows: false,
                },
            },
        ],
    };

    // -----------------------------
    // Check if user has preferences
    // -----------------------------
    useEffect(() => {
        if (!user) {
            setHasProfileVector(false);
            return;
        }

        const checkUserProfileVector = async () => {
            setLoading(true);
            setError("");

            try {
                const userId = user.id || user.email;

                const response = await fetch(
                    `http://localhost:5203/api/eppoiapi/profile-vector/${encodeURIComponent(userId)}`,
                    {
                        method: "GET",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                    }
                );

                if (response.ok) {
                    const profileVector = await response.json();
                    setProfileVector(profileVector);
                    setHasProfileVector(true);

                    console.log("User preferences found:", profileVector);
                } else if (response.status === 404) {
                    // No preferences found
                    setHasProfileVector(false);
                    toast.error("No preferences found for user");
                } else {
                    throw new Error(`HTTP ${response.status}`);
                }
            } catch (err) {
                toast.error("Error checking preferences:", err);
                setError("Failed to check user profile vector.");
                setHasProfileVector(false);
            } finally {
                setLoading(false);
            }
        };

        checkUserProfileVector();
    }, [user]);

    // -----------------------------
    // Fetch data according to profile vector
    // -----------------------------
    useEffect(() => {
        // Don't fetch if we haven't checked profileVector yet or if user has no profileVector
        if (hasProfileVector === null || !hasProfileVector || !profileVector) return;

        const loadAllData = async () => {
            setLoading(true);
            setError("");

            try {
                const language = i18n.language;
                // Fallback if frontEnd municipality differs from profile vector municipality
                const municipalityToUse = profileVector.municipality.substring(10, selectedCity.length) || municipality.substring(10, selectedCity.length);

                // Extract selected categories from profile vector as poi
                const pois = profileVector.selectedCategories;
                // Call service to identify which endpoints to call based on poi
                const filteredEndpoints = mapCategoriesToEndpoints(profileVector.selectedCategories);
                const filteredEndpointNames = filteredEndpoints.map(fn => fn.name);
                
                // functionlist with setters for all possible services -> to be filtered depending on pois
                const servicesConfig = [
                    { fn: fetchEatAndDrinks, setter: setEatAndDrinks },
                    { fn: fetchEntertainmentLeisure, setter: setEntertainmentLeisure },
                    { fn: fetchArtAndCulture, setter: setArtAndCulture },
                    { fn: fetchArticlesAndMagazines, setter: setArticles },
                    { fn: fetchOrganizations, setter: setOrganizations },
                    { fn: fetchRoutes, setter: setRoutes },
                    { fn: fetchShopping, setter: setShopping },
                    { fn: fetchEconomicOperators, setter: setEconomicOperators },
                    { fn: fetchEvents, setter: setEvents },
                    { fn: fetchItineraries, setter: setItineraries },
                    { fn: fetchNature, setter: setNatureItems },
                    { fn: fetchPointsOfSale, setter: setPointsOfSale },
                    { fn: fetchRecreationAndFun, setter: setRecreationItems },
                    { fn: fetchServices, setter: setPublicServices },
                    { fn: fetchSleep, setter: setSleepItems },
                    { fn: fetchTypicalProducts, setter: setTypicalProducts },
                ];
                
                // fetch all selected endpoints in parallel, return per-endpoint {ep, data}
                const rawResults = await Promise.all(
                    servicesConfig.map(async (serviceEntry) => {
                        // support either a function directly or an object { fn, setter }
                        const fn = typeof serviceEntry === 'function' ? serviceEntry : serviceEntry?.fn;
                        const serviceName = fn?.name ?? (serviceEntry?.setter ? 'unnamed_service' : 'unknown');
                        
                        try {
                            // check fn from servicesConfig exists 
                            if (!fn) throw new Error('No fetch function provided');
                            
                            // check if this service is in filteredEndpoints
                            if (filteredEndpointNames.includes(serviceName)) {
                                // If the function declares two or more parameters, pass language as second arg, otherwise call with municipality only.
                                const data = fn.length >= 2
                                    ? await fn(municipalityToUse, language) 
                                    : await fn(municipalityToUse);
    
                                //console.log("Filtered Endpoints to call: " + profileVector.selectedCategories);
                                
                                return { service: serviceName, data };
                            } else {
                                toast.error(`Skipping service ${serviceName} as it's not in user's selected categories.`);
                                return {service: '', undefined};
                            }
                        } catch (err) {
                            toast.error(`Error loading ${serviceName}: ${err?.message ?? err}`);
                            return { service: serviceName, data: [] };
                        }
                    })
                );

                // helper to normalize a single raw item into the carousel shape
                const normalizeItem = (item, source, index) => {
                    return {
                        id: item.id ?? item._id ?? item.uuid ?? `${source}_${index}`,
                        title: item.title ?? item.name ?? item.nome ?? item.label ?? "N/A",
                        description: item.description ?? item.descr ?? item.summary ?? null,
                        location: item.location ?? item.address ?? item.vicinity ?? item.place ?? null,
                        image: item.image ?? item.imageUrl ?? item.thumbnail ?? null,
                        type: item.type ?? item.category ?? source,
                        openingHours: item.openingHours ?? item.opening_hours ?? item.hours ?? null,
                        // keep raw payload if needed later
                        _raw: item,
                    };
                };
                
                // flatten + normalize
                const combined = rawResults.flatMap(({ service: service, data }) => {
                    const arr = Array.isArray(data) ? data : (data?.items ?? data?.locations ?? []);
                    if (!Array.isArray(arr)) return [];
                    return arr.map((item, index) => normalizeItem(item, service, index));
                });
                
                // set into the state the carousel uses. (You can use a separate state if preferred)
                setEatAndDrinks(combined);
            } catch (err) {
                setError(err.message);
                toast.error(t('swipeCarousel_errorLoadingData'));
            } finally {
                setLoading(false);
            }
        };

        loadAllData();
    }, [hasProfileVector, profileVector, municipality, i18n.language, t]);

    // -----------------
    // Extract city and time availability from profile vector
    // -----------------
    useEffect(() => {
        if (!profileVector) {
            return;
        }

        // City
        if (profileVector.municipality) {
            setSelectedCity(profileVector.municipality);
        }

        // Time Availability - Parse ISO strings to { date, hour } format
        if (profileVector.startTime) {
            const startDate = new Date(profileVector.startTime);
            setStartSelection({
                date: startDate,
                hour: startDate.getHours()
            });
        }

        if (profileVector.endTime) {
            const endDate = new Date(profileVector.endTime);
            setEndSelection({
                date: endDate,
                hour: endDate.getHours()
            });
        }

    }, [profileVector]); // Add profileVector as dependency

    // -----------------------------
    // Prepare locations for MapView
    // -----------------------------
    useEffect(() => {
        if (!selectedCity) return;

        const loadMarkersOnMap = async () => {
            try {
                setLoading(true);
                const data = await fetchMap(selectedCity);
                setMarkers(data.locations);
                if (data.length > 0) {
                    setCenterLatitude(data.center.latitude);
                    setCenterLongitude(data.center.longitude);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        loadMarkersOnMap();
    }, [selectedCity]);
    
    // -----------------------------
    // wait for timeAvailability from ProfileVector Database fetch is ready
    // -----------------------------
    const isTimeAvailabilityReady =
        startSelection?.date &&
        startSelection?.hour !== null &&
        startSelection?.hour !== undefined &&
        endSelection?.date &&
        endSelection?.hour !== null &&
        endSelection?.hour !== undefined;

    const handleViewDetails = (poi) => {
        if (onViewDetails) {
            onViewDetails(poi);
        } else {
            setSelectedItem(poi);
            toast.success(`${t('swipeCarousel_detailsClicked')} ${poi.title}`);
        }
    };

    // -----------------------------
    // Show loading while checking preferences
    // -----------------------------
    if (hasProfileVector === null) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-gray-600">{t('swipeCarousel_checkingPreferences')}</p>
                </div>
            </div>
        );
    }

    // -----------------------------
    // Show "Set Preferences" page if no preferences found
    // -----------------------------
    if (hasProfileVector === false) {
        return (
            <div className="min-h-screen p-4 md:p-8">
                <div className="max-w-2xl mx-auto">
                    {/* Back Button */}
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="mb-6 flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            {t('swipeCarousel_goBack')}
                        </button>
                    )}

                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full mb-6">
                            <Settings className="w-10 h-10 text-indigo-600" />
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            {t('swipeCarousel_setPreferences')}
                        </h1>

                        <p className="text-gray-600 mb-8 text-lg">
                            {t('swipeCarousel_setPreferencesSubtitle')}
                        </p>

                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-8">
                            <h3 className="font-semibold text-indigo-900 mb-2">
                                {t('swipeCarousel_preferencesInclude')}
                            </h3>
                            <ul className="text-left text-gray-700 space-y-2">
                                <li className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                                    {t('swipeCarousel_timeAvailability')}
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                                    {t('swipeCarousel_destination')}
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                                    {t('swipeCarousel_interests')}
                                </li>
                            </ul>
                        </div>

                        <button
                            onClick={onNavigateToPreferences}
                            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95"
                        >
                            {t('swipeCarousel_setPreferencesButton')}
                        </button>

                        {error && (
                            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // -----------------------------
    // Show carousel if preferences exist
    // -----------------------------
    return (
        //added relative to contain arrows
        <div className="w-full py-8 px-4 overflow-hidden relative">
            {selectedItem && (
                <SwipeCarouselDetail
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                />
            )}
            <div className={`max-w-2xl mx-auto transition-all duration-500 ${selectedItem ? 'blur-sm grayscale opacity-50 pointer-events-none' : ''}`}>                
                <div className="w-full max-w-4xl">
                    {/* Back Button */}
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="mb-6 flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            {t('swipeCarousel_goBack')}
                        </button>
                    )}

                    {/* Preferences Info Banner */}
                    {profileVector && (
                        <div className="bg-white mb-6 p-4 shadow-xl rounded-3xl">
                            <div className="flex items-center justify-between ">
                                <div className="container m-2">
                                    {!isTimeAvailabilityReady && <LoadingSpinner size="sm"/>}
                                    <div className="row inline-flex items-center bg-indigo-50 px-3 py-1 rounded-full text-indigo-700 font-medium text-sm mb-6">{isTimeAvailabilityReady && (
                                        <div>{
                                            t("interestSelection_timeAvailability", {
                                                startDate: formatDate(startSelection.date, formatDate.locale),
                                                startHour: `${startSelection.hour.toString().padStart(2, '0')}:00 → `,
                                                endDate: formatDate(endSelection, formatDate.locale),
                                                endHour: `${endSelection.hour.toString().padStart(2, '0')}:00`
                                            })
                                        }</div>
                                    )}
                                    </div>
                                    <div className="row inline-flex items-center bg-indigo-50 px-3 py-1 rounded-full text-indigo-700 font-medium text-sm mb-6">
                                        {t("interestSelection_destination")} {selectedCity}
                                    </div>
                                    <div className="flex flex-row items-center bg-indigo-50 px-3 py-1 rounded-full text-indigo-700 font-medium text-sm w-full md:w-5/12">
                                        <p>🖊️ &nbsp;
                                            <button onClick={onNavigateToPreferences}
                                                    className="text-sm text-indigo-600 hover:text-indigo-700 underline">
                                                {t('swipeCarousel_editPreferences')}
                                            </button>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="flex justify-center py-20">
                            <LoadingSpinner size="lg" />
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                            <p className="text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Carousel */}
                    {!loading && !error && eatAndDrinks.length > 0 && (
                        <>
                            <style>
                                {`
              /* Desktop styles */
              @media (min-width: 768px) {
                .slick-slider {
                  margin: 0 -80px;
                }
              }
              
              /* Mobile styles */
              @media (max-width: 767px) {
                .slick-slider {
                  margin: 0 -20px;
                }
                .slick-slide > div {
                  padding: 0 10px;
                }
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

                            <div className="max-w-2xl mx-auto">
                                <Slider {...settings}>
                                    {eatAndDrinks.map((eatAndDrink) => (
                                        <div key={eatAndDrink.id} className="px-2">
                                            <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all border-2 border-transparent hover:border-indigo-600 max-w-sm md:max-w-none mx-auto">                                                
                                                <div className="relative h-48 sm:h-56 md:h-64 lg:h-80 overflow-hidden">
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
                                                        <span className="text-indigo-600 capitalize text-xs md:text-sm">{eatAndDrink.type}</span>
                                                    </div>
                                                </div>

                                                <div className="p-4 md:p-6">
                                                    <h2 className="text-lg md:text-xl text-gray-900 mb-3 md:mb-4">{eatAndDrink.title}</h2>
                                                    <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4 line-clamp-3">
                                                        {eatAndDrink.description}
                                                    </p>

                                                    <div className="space-y-2 mb-4 md:mb-6">
                                                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                                                            <MapPin className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                                                            <span className="truncate">{eatAndDrink.location}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                                                            <Clock className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                                                            <span>{eatAndDrink.openingHours}</span>
                                                        </div>
                                                    </div>

                                                    <button
                                                        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-xl hover:bg-indigo-700 transition text-sm md:text-base"
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
                        </>
                    )}

                    {/* MapView for interactions on OSM map */}
                    <div className="bg-white mt-10 mb-6 p-4 shadow-xl rounded-3xl">
                        <MapView
                            locations={markers}
                            center={{ latitude: centerLatitude, longitude: centerLongitude }}
                            zoom={13}
                            height="700px"
                            onLocationClick={() => {
                                console.log("Location clicked: " + markers);
                            }}
                        />
                    </div>
                
                    {/* Empty State */}
                    {!loading && !error && eatAndDrinks.length === 0 && (
                        <div className="text-center py-20 text-gray-600">
                            <p>{t('no_results') || 'No results found for your preferences'}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SwipeCarousel;
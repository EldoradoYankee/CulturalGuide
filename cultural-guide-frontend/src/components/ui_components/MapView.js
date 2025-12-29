import { useState, useEffect } from 'react';
import { X, MapPin, Clock, Navigation, ZoomIn, ZoomOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function MapView({
                            locations = [],
                            center,
                            zoom = 13,
                            height = '600px',
                            onLocationClick
                        }) {
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [currentZoom, setCurrentZoom] = useState(zoom);
    const [mapCenter, setMapCenter] = useState(null);
    // i18n
    const { t } = useTranslation();

    // initialize / react to prop changes
    useEffect(() => {
        setCurrentZoom(zoom);
    }, [zoom]);

    useEffect(() => {
        if (center && center.latitude != null && center.longitude != null) {
            setMapCenter({ lat: center.latitude, lng: center.longitude });
            return;
        }
        if (Array.isArray(locations) && locations.length > 0) {
            const first = locations[0];
            if (first && first.latitude != null && first.longitude != null) {
                setMapCenter({ lat: first.latitude, lng: first.longitude });
                return;
            }
        }
        // keep null until valid data available
        setMapCenter(null);
    }, [center, locations]);

    const handleMarkerClick = (location) => {
        if (!location) return;
        setSelectedLocation(location);
        if (location.latitude != null && location.longitude != null) {
            setMapCenter({ lat: location.latitude, lng: location.longitude });
        }
        if (onLocationClick) {
            onLocationClick(location);
        }
    };

    const closeBanner = () => {
        setSelectedLocation(null);
    };
    
    // Calculate marker positions relative to map center
    const getMarkerPosition = (location) => {
        if (!mapCenter || currentZoom == null || !location) {
            return { x: -999, y: -999 };
        }

        const latDiff = (location.latitude - mapCenter.lat) * 100000;
        const lngDiff = (location.longitude - mapCenter.lng) * 100000;
        const scale = Math.pow(2, currentZoom - 13);

        return {
            x: 50 + (lngDiff * scale * 0.015),
            y: 50 - (latDiff * scale * 0.015),
        };
    };

    // Generate OpenStreetMap static image URL (guarded)
    const getStaticMapUrl = () => {
        if (!mapCenter || currentZoom == null) return '';
        const bbox = {
            minLat: mapCenter.lat - 0.02 / Math.pow(2, currentZoom - 13),
            maxLat: mapCenter.lat + 0.02 / Math.pow(2, currentZoom - 13),
            minLng: mapCenter.lng - 0.03 / Math.pow(2, currentZoom - 13),
            maxLng: mapCenter.lng + 0.03 / Math.pow(2, currentZoom - 13),
        };

        return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox.minLng}%2C${bbox.minLat}%2C${bbox.maxLng}%2C${bbox.maxLat}&layer=mapnik&marker=${mapCenter.lat}%2C${mapCenter.lng}`;
    };

    const mapUrl = getStaticMapUrl();

    return (
        <div className="relative w-full" style={{ height }}>
            {/* Map Container */}
            <div className="relative w-full h-full rounded-xl overflow-hidden bg-gray-100">
                {/* If center/zoom not ready, show placeholder to avoid map errors */}
                {!mapUrl ? (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                        {t('swipeCarousel_loadingMap')}
                    </div>
                ) : (
                    <iframe
                        src={mapUrl}
                        className="w-full h-full border-0"
                        style={{ filter: 'grayscale(0%)' }}
                        title="OpenStreetMap"
                    />
                )}

                {/* Custom Markers Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                    {Array.isArray(locations) &&
                        locations.map((location) => {
                            const pos = getMarkerPosition(location);
                            // Skip markers when center/zoom missing or out of bounds
                            if (pos.x < -10 || pos.x > 110 || pos.y < -10 || pos.y > 110) {
                                return null;
                            }

                            const isSelected = selectedLocation?.id === location.id;

                            return (
                                <button
                                    key={location.id}
                                    onClick={() => handleMarkerClick(location)}
                                    className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-full transition-all hover:scale-110"
                                    style={{
                                        left: `${pos.x}%`,
                                        top: `${pos.y}%`,
                                    }}
                                >
                                    <div className={`relative ${isSelected ? 'animate-bounce' : ''}`}>
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all ${
                                                isSelected
                                                    ? 'bg-indigo-600 ring-4 ring-indigo-200'
                                                    : 'bg-indigo-600 hover:bg-indigo-700'
                                            }`}
                                        >
                                            <MapPin className="w-5 h-5 text-white" fill="white" />
                                        </div>
                                        <div className="absolute left-1/2 top-full w-0 h-0 -translate-x-1/2 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-indigo-600" />
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 whitespace-nowrap">
                                            <div className="bg-white px-2 py-1 rounded-lg shadow-md text-xs text-gray-900">
                                                {location.title || location.type}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                </div>
            </div>

            {/* Information Banner */}
            {selectedLocation && (
                <div className="absolute bottom-4 left-4 right-4 z-[1000] animate-slide-up">
                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-2xl mx-auto">
                        {selectedLocation.image && (
                            <div className="relative h-48 bg-gray-200">
                                <img
                                    src={selectedLocation.image}
                                    alt={selectedLocation.title || selectedLocation.type}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                                <button
                                    onClick={closeBanner}
                                    className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                        )}

                        <div className="p-6">
                            {!selectedLocation.image && (
                                <button
                                    onClick={closeBanner}
                                    className="absolute top-3 right-3 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-600" />
                                </button>
                            )}

                            <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm mb-3">
                                {selectedLocation.type}
                            </div>

                            <h2 className="text-gray-900 mb-3">
                                {selectedLocation.title || selectedLocation.type}
                            </h2>

                            {selectedLocation.description && (
                                <p className="text-gray-600 mb-4">{selectedLocation.description}</p>
                            )}

                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-gray-900 text-sm">{t('swipeCarousel_location')}</p>
                                        <p className="text-gray-600 text-sm">{selectedLocation.location}</p>
                                    </div>
                                </div>

                                {selectedLocation.openingHours && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                                            <Clock className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-gray-900 text-sm">{t('swipeCarousel_hours')}</p>
                                            <p className="text-gray-600 text-sm">{selectedLocation.openingHours}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-6">
                                <button className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                                    <Navigation className="w-4 h-4" />
                                    Directions
                                </button>
                                <button className="px-4 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors">
                                    More Info
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

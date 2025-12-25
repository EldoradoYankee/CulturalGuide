import React, {useState, useEffect} from 'react';
import {ChevronLeft, MapPin, Search} from 'lucide-react';
import {useTranslation} from "react-i18next";

export function CitySelection({onCitySelect, onBack}) {

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // i18n translations
    const {t} = useTranslation();

    // Municipality selection
    const [searchTerm, setSearchTerm] = useState("");
    const [municipalities, setMunicipalities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    // State
    const [selectedCity, setSelectedCity] = useState("");


    const filteredCities = municipalities.filter((m) =>
        (m.legalName ?? "").toLowerCase().includes((searchTerm ?? "").toLowerCase())
    );

    const handleContinue = () => {
        if (selectedCity) {
            onCitySelect(selectedCity);
        }
    };

    // IGNORE error - dont change JS language to Flow
    // When user types
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setIsDropdownOpen(true);
    };

    // When user clicks on a city in search results
    const handleMunicipalityClick = (municipalityName) => {
        setSelectedCity(municipalityName);  // update dropdown value
        setSearchTerm(municipalityName);    // update text input
        setIsDropdownOpen(false);
    };

    // When user selects from <select> dropdown
    const handleSelectChange = (e) => {
        setSelectedCity(e.target.value);  // update dropdown
        setSearchTerm(e.target.value);    // update text input
    };
    
    // example GET
    useEffect(() => {
        const fetchMunicipalities = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await fetch("http://localhost:5203/api/eppoiapi/municipalities", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                });

                if (!response.ok) {
                    setError(`Error fetching municipalities: ${response.status}`);
                    return;
                }

                const data = await response.json().catch(() => []);
                setMunicipalities(data);

            } catch (err) {
                console.error(err);
                setError("Network error while fetching municipalities");
            } finally {
                setLoading(false);
            }
        };
        fetchMunicipalities().then(r => {
        });
    }, []);

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                {/* Back Button */}
                {onBack && (
                    <button
                        onClick={onBack}
                        className="mb-6 flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
                    >
                        <ChevronLeft className="w-5 h-5"/>
                        {t('citySelection_goBack')}
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

                <div className="w-full max-w-2xl">
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div
                                className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                                <MapPin className="w-8 h-8 text-indigo-600"/>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("citySelection_chooseCity")}</h1>
                            <p className="text-gray-600">{t("citySelection_searchACitySubtitle")}</p>
                        </div>

                        {/* Search Bar */}
                        <div className="mb-6">
                            <label htmlFor="city-search" className="block text-gray-700 mb-2 font-medium">
                                {t("citySelection_searchACityTitle")}
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                                <input
                                    id="city-search"
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setIsDropdownOpen(true);
                                        handleSearchChange(e);
                                    }}
                                    onFocus={() => setIsDropdownOpen(true)}
                                    placeholder={t("citySelection_Lens")}
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>

                            {/* Dropdown Results */}
                            {isDropdownOpen && searchTerm && (
                                <div
                                    className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {filteredCities.length > 0 ? (
                                        filteredCities.map((municipality) => (
                                            <button
                                                key={municipality.legalName}
                                                onClick={() => handleMunicipalityClick(municipality.legalName)}
                                                className="w-full text-left px-4 py-3 hover:bg-indigo-50 transition-colors flex items-center gap-3"
                                            >
                                                <MapPin className="w-5 h-5 text-indigo-600"/>
                                                <span className="text-gray-900">{municipality.legalName}</span>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-4 py-3 text-gray-500">
                                            {t("citySelection_noCitiesFound")}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Dropdown Menu */}
                        <div className="mb-8">
                            <label htmlFor="city-dropdown" className="block text-gray-700 mb-2 font-medium">
                                {t("citySelection_selectFromList")}
                            </label>
                            <div className="relative">
                                <MapPin
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10"/>
                                <select
                                    id="city-dropdown"
                                    value={selectedCity}
                                    onChange={(e) => setSelectedCity(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white cursor-pointer text-gray-900"
                                >
                                    <option value="" disabled hidden
                                            className="text-gray-400">{t("citySelection_dropDownMenu")}</option>
                                    {municipalities.map((m) => (
                                        <option key={m.legalName} value={m.legalName}>
                                            {m.legalName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Selected City Display */}
                        {selectedCity && (
                            <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-6 h-6 text-indigo-600"/>
                                    <div>
                                        <p className="text-gray-600">{t("citySelection_selectCity")}</p>
                                        <p className="font-semibold text-indigo-900">{selectedCity}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={handleContinue}
                                disabled={!selectedCity}
                                className="w-full sm:flex-1 px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                            >
                                {t("citySelection_Continue")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

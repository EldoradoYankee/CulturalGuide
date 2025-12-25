import { useState, useEffect, Suspense } from "react";
import { LoginForm } from "./components/LoginForm";
import { Start } from "./components/Start";
import { RegisterForm } from "./components/RegisterForm";
import { PasswordRecovery } from "./components/PasswordRecovery";
import { Dashboard } from "./components/Dashboard";
import { InterestSelection } from "./components/InterestSelection";
import { SwipeCarousel }  from "./components/SwipeCarousel";
import { useTranslation } from "react-i18next";
import { Header } from "./components/Header";
import { CitySelection } from "./components/CitySelection";
import { TimeAvailability } from "./components/TimeAvailability";

const AuthView = {
    LOGIN: "login",
    REGISTER: "register",
    START: "start",
    RECOVERY: "recovery",
    DASHBOARD: "dashboard",
    INTERESTS: "interests",
    SWIPECAROUSEL: "swipecarousel",
    CITYSELECTION: "cityselection",
    TIMEAVAILABILITY: "timeavailability"
};

function App() {
    const [currentView, setCurrentView] = useState(AuthView.LOGIN);
    const [user, setUser] = useState(null);
    const [selectedCity, setSelectedCity] = useState('');
    const { i18n } = useTranslation();

    // Restore saved language from localStorage
    useEffect(() => {
        const savedLang = localStorage.getItem("lang");
        if (savedLang && i18n.language !== savedLang) {
            i18n.changeLanguage(savedLang).catch(() => {});
        }
    }, [i18n]);

    const handleLogin = (email) => {
        const mockUser = {
            email,
            name: email.split("@")[0],
            emailVerified: true,
        };
        setUser(mockUser);
        setCurrentView(AuthView.START);
    };

    const handleRegister = (email, name) => {
        const mockUser = {
            email,
            name,
            emailVerified: false,
        };
        setUser(mockUser);
        setCurrentView(AuthView.START);
    };

    const handleLogout = () => {
        setUser(null);
        setCurrentView(AuthView.LOGIN);
    };

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Header
                navigateToStart={() => setCurrentView(AuthView.START)}
                navigateToLogin={() => setCurrentView(AuthView.LOGIN)}
            />
            <div style={{ paddingTop: 64 }} className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">

                {/* Views */}
                {currentView === AuthView.LOGIN && (
                    <LoginForm
                        onLogin={handleLogin}
                        onSwitchToRegister={() => setCurrentView(AuthView.REGISTER)}
                        onSwitchToRecovery={() => setCurrentView(AuthView.RECOVERY)}
                    />
                )}

                {currentView === AuthView.REGISTER && (
                    <RegisterForm
                        onRegister={handleRegister}
                        onSwitchToLogin={() => setCurrentView(AuthView.LOGIN)}
                    />
                )}

                {currentView === AuthView.START && user && (
                    <Start onNavigate={(view) => setCurrentView(view)} />
                )}

                {currentView === AuthView.RECOVERY && (
                    <PasswordRecovery
                        onBackToLogin={() => setCurrentView(AuthView.LOGIN)}
                    />
                )}

                {currentView === AuthView.DASHBOARD && user && (
                    <Dashboard user={user} onLogout={handleLogout} />
                )}

                {/* City Selection - First step for recommendations */}
                {currentView === AuthView.CITYSELECTION && user && (
                    <CitySelection
                        onCitySelect={(city) => {
                            const municipalityName = city.trim().split(" ").pop();
                            setSelectedCity(municipalityName);
                            setCurrentView(AuthView.INTERESTS); // Go to interests after city selection
                        }}
                        onBack={() => setCurrentView(AuthView.START)}
                    />
                )}

                {/* Interest Selection - Second step for recommendations */}
                {currentView === AuthView.INTERESTS && user && (
                    <InterestSelection
                        user={user}
                        municipality={selectedCity}
                        onBack={() => setCurrentView(AuthView.CITYSELECTION)}
                        onContinue={(selectedInterests) => {
                            console.log("Selected interests:", selectedInterests);
                            setCurrentView(AuthView.SWIPECAROUSEL); // Go to carousel after interests
                        }}
                    />
                )}

                {/* Swipe Carousel - Final step showing recommendations */}
                {currentView === AuthView.SWIPECAROUSEL && user && (
                    <SwipeCarousel
                        municipality={selectedCity}
                        onBack={() => setCurrentView(AuthView.INTERESTS)}
                    />
                )}

                {/* Time Availability - Standalone preference setting */}
                {currentView === AuthView.TIMEAVAILABILITY && user && (
                    <TimeAvailability
                        user={user}
                        language={i18n.language}
                        onBack={() => setCurrentView(AuthView.START)}
                        onContinue={(start, end) => {
                            console.log("Time availability set:", start, end);
                            setCurrentView(AuthView.START);
                        }}
                    />
                )}
            </div>
        </Suspense>
    );
}

export default App;
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


// You can keep the AuthView as a plain object/constant if needed
const AuthView = {
    LOGIN: "login",
    REGISTER: "register",
    START: "start",
    RECOVERY: "recovery",
    DASHBOARD: "dashboard",
    INTERESTS: "interests",
    SWIPECAROUSEL: "swipecarousel",
    CITYSELECTION: "cityselection",
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
        // Simulate user login
        const mockUser = {
            email,
            name: email.split("@")[0],
            emailVerified: true,
        };
        setUser(mockUser);
        setCurrentView(AuthView.START);
    };

    const handleRegister = (email, name) => {
        // Simulate user registration
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

    const handleInterestContinue = (selectedInterests) => {
        console.log("Selected Interests:", selectedInterests);
        setCurrentView(AuthView.SWIPECAROUSEL);
    };

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Header
                navigateToStart={() => setCurrentView("start")}
                navigateToLogin={() => setCurrentView("login")} 
            />
        <div style={{ paddingTop: 64 }} className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {currentView === "login" && (
                <LoginForm
                    onLogin={handleLogin}
                    onSwitchToRegister={() => setCurrentView("register")}
                    onSwitchToRecovery={() => setCurrentView("recovery")}
                />
            )}
            {currentView === "register" && (
                <RegisterForm
                    onRegister={handleRegister}
                    onSwitchToLogin={() => setCurrentView("login")}
                />
            )}
            {currentView === AuthView.START && user && (
                <Start onNavigate={(view) => setCurrentView(view)} />
            )}
            {currentView === "recovery" && (
                <PasswordRecovery
                    onBackToLogin={() => setCurrentView("login")}
                />
            )}
            {currentView === "dashboard" && user && (
                <Dashboard user={user} onLogout={handleLogout} />
            )}

            {currentView === AuthView.INTERESTS && user && (
                <InterestSelection
                    user={user}
                    city={selectedCity}
                    onContinue={(selectedInterests) => {
                        if (selectedInterests.includes("history")) {
                            setCurrentView(AuthView.SWIPECAROUSEL);
                        } else {
                            setCurrentView(AuthView.START);
                        }
                    }}
                />
            )}

            {currentView === AuthView.SWIPECAROUSEL && (
                <SwipeCarousel />
            )}

            {currentView === AuthView.CITYSELECTION && user && (
                <CitySelection
                    onCitySelect={(city) => {
                        setSelectedCity(city);
                        setCurrentView(AuthView.INTERESTS);
                    }}
                    onBack={() => setCurrentView(AuthView.START)}
                />
            )}

        </div>
        </Suspense>

    );
}

export default App;

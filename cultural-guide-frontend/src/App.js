import { useState, useEffect, Suspense } from "react";
import { LoginForm } from "./components/LoginForm";
import { RegisterForm } from "./components/RegisterForm";
import { PasswordRecovery } from "./components/PasswordRecovery";
import { Dashboard } from "./components/Dashboard";
import { useTranslation } from "react-i18next";
import {Header} from "./components/Header";


// You can keep the AuthView as a plain object/constant if needed
const AuthView = {
    LOGIN: "login",
    REGISTER: "register",
    RECOVERY: "recovery",
    DASHBOARD: "dashboard",
};

function App() {
    const [currentView, setCurrentView] = useState(AuthView.LOGIN);
    const [user, setUser] = useState(null);
    const { i18n, t } = useTranslation();
    

    // Restore saved language from localStorage
    useEffect(() => {
        const savedLang = localStorage.getItem("lang");
        if (savedLang && i18n.language !== savedLang) {
            i18n.changeLanguage(savedLang).catch(() => {});
        }
    }, [i18n]);

    const handleLanguageChange = (e) => {
        const lang = e.target.value;
        i18n.changeLanguage(lang);
        localStorage.setItem("lang", lang);
    };


    const handleLogin = (email) => {
        // Simulate user login
        const mockUser = {
            email,
            name: email.split("@")[0],
            emailVerified: true,
        };
        setUser(mockUser);
        setCurrentView("dashboard");
    };

    const handleRegister = (email, name) => {
        // Simulate user registration
        const mockUser = {
            email,
            name,
            emailVerified: false,
        };
        setUser(mockUser);
        setCurrentView("dashboard");
    };

    const handleLogout = () => {
        setUser(null);
        setCurrentView("login");
    };

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Header/>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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
            {currentView === "recovery" && (
                <PasswordRecovery
                    onBackToLogin={() => setCurrentView("login")}
                />
            )}
            {currentView === "dashboard" && user && (
                <Dashboard user={user} onLogout={handleLogout} />
            )}
        </div>
        </Suspense>

    );
}

export default App;

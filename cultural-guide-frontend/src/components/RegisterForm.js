import { useState } from 'react';
import { Mail, Lock, User, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from "react-i18next";


export function RegisterForm({ onRegister, onSwitchToLogin }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const {t } = useTranslation();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name || !email || !password || !confirmPassword) {
            toast.error('please fill in all fields');
            return;
        }

        if (!email.includes('@')) {
            toast.error('please enter a valid email address');
            return;
        }

        if (password.length < 8) {
            toast.error('the password must be at least 8 characters long');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('the passwords do not match');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("http://localhost:5203/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password, name })
            });

            const body = await response.json().catch(() => null);

            if (!response.ok) {
                toast.error(body?.message || "error while registering");
                return;
            }

            // SUCCESS
            toast.success("registration successful");

            // store jwt
            if (body?.token) {
                localStorage.setItem("jwt", body.token);
            }

            // notify app
            onRegister(email, name);

        } catch (error) {
            console.error(error);
            toast.error("Network error. Please try again.");
        } finally {
            setIsLoading(false);
        }
        
        // Simulate API call
        setTimeout(() => {
            toast.success('Registration successful! Please check your email to verify your account.');
            onRegister(email, name);
            setIsLoading(false);
        }, 1000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                            <UserPlus className="w-8 h-8 text-indigo-600" />
                        </div>
                        <h1 className="text-gray-900 mb-2">
                            {t("register_submit")}
                        </h1>
                        <p className="text-gray-600">
                            {t("register_title")}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="name" className="block text-gray-700 mb-2">
                                {t("register_name")}
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Max Mustermann"
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-gray-700 mb-2">
                                {t("register_email")}
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@beispiel.de"
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-gray-700 mb-2">
                                {t("register_password")}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Mindestens 8 Zeichen"
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-gray-700 mb-2">
                                {t("register_confirmPassword")}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Passwort wiederholen"
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex items-start">
                            <input
                                type="checkbox"
                                id="terms"
                                required
                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-1"
                            />
                            <label htmlFor="terms" className="ml-2 text-gray-600">
                                {t("register_agreeTerms")}                            
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? t("register_getsCreated") : t("register_submit")}                        
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            {t("register_alreadyHaveAccount")}{' '}
                            <button
                                onClick={onSwitchToLogin}
                                className="text-indigo-600 hover:text-indigo-700 transition-colors"
                            >
                                {t("register_loginNow")}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

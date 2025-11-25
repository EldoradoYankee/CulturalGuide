import { useState } from 'react';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react';
import { toast } from 'sonner';


export function PasswordRecovery({ onBackToLogin }) {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!email) {
            toast.error('Bitte geben Sie Ihre E-Mail-Adresse ein');
            return;
        }

        if (!email.includes('@')) {
            toast.error('Bitte geben Sie eine gültige E-Mail-Adresse ein');
            return;
        }

        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            setEmailSent(true);
            toast.success('Wiederherstellungs-E-Mail wurde gesendet!');
            setIsLoading(false);
        }, 1000);
    };

    if (emailSent) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                                <Mail className="w-8 h-8 text-green-600" />
                            </div>
                            <h1 className="text-gray-900 mb-2">E-Mail gesendet!</h1>
                            <p className="text-gray-600 mb-6">
                                Wir haben Ihnen eine E-Mail mit Anweisungen zum Zurücksetzen Ihres Passworts an{' '}
                                <span className="text-gray-900">{email}</span> gesendet.
                            </p>
                            <p className="text-gray-600 mb-8">
                                Bitte überprüfen Sie auch Ihren Spam-Ordner, falls Sie die E-Mail nicht finden.
                            </p>
                            <button
                                onClick={onBackToLogin}
                                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Zurück zur Anmeldung
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <button
                        onClick={onBackToLogin}
                        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-6"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Zurück zur Anmeldung
                    </button>

                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                            <KeyRound className="w-8 h-8 text-indigo-600" />
                        </div>
                        <h1 className="text-gray-900 mb-2">Passwort vergessen?</h1>
                        <p className="text-gray-600">
                            Kein Problem! Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen Anweisungen zum Zurücksetzen.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-gray-700 mb-2">
                                E-Mail-Adresse
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

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Wird gesendet...' : 'Wiederherstellungs-E-Mail senden'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

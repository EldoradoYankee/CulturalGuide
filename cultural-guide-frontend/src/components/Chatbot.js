import { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, MapPin, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from "react-i18next";



export function Chatbot({ user, language, municipality = 'Massignano', onBack }) {
    const { t, i18n } = useTranslation();
    const [messages, setMessages] = useState([
        {
            id: '1',
            text: `Hello ${user.name}! How can I help you today?`,
            sender: 'bot',
            timestamp: new Date(),
        },
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const sendMessage = async () => {
        if (!inputText.trim()) {
            toast.error(t('chatbot.errorEmpty'));
            return;
        }

        // Add user message
        const userMessage = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputText('');
        setIsTyping(true);

        try {
            // Send POST request to backend
            const response = await fetch('http://localhost:5203/api/eppoiapi/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    municipality: municipality,
                    message: inputText,
                    userName: user.name,
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            // Simulate typing delay
            setTimeout(() => {
                const botMessage = {
                    id: (Date.now() + 1).toString(),
                    text: data.response || data.message || 'I received your message!',
                    sender: 'bot',
                    timestamp: new Date(),
                };

                setMessages((prev) => [...prev, botMessage]);
                setIsTyping(false);
            }, 500);
        } catch (error) {
            console.error('Error sending message:', error);

            // Fallback response if API fails
            setTimeout(() => {
                const botMessage = {
                    id: (Date.now() + 1).toString(),
                    text: `I'm currently unable to connect to the server. This is a demo response to your message: "${inputText}"`,
                    sender: 'bot',
                    timestamp: new Date(),
                };

                setMessages((prev) => [...prev, botMessage]);
                setIsTyping(false);
                toast.error(t('chatbot.errorSending'));
            }, 1000);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
            <div className="w-full max-w-4xl h-[calc(100vh-8rem)] flex flex-col">
                {/* Header */}
                <div className="bg-white rounded-t-2xl shadow-xl p-6">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>{t('chatbot.back')}</span>
                    </button>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-gray-900 mb-2">{t('chatbot.title')}</h1>
                            <p className="text-gray-600">{t('chatbot.subtitle')}</p>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-lg">
                            <MapPin className="w-4 h-4 text-indigo-600" />
                            <span className="text-indigo-900 text-sm">{municipality}</span>
                        </div>
                    </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 bg-gray-50 overflow-y-auto p-6 space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex gap-3 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                {/* Avatar */}
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                        message.sender === 'user'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-300 text-gray-700'
                                    }`}
                                >
                                    {message.sender === 'user' ? (
                                        <UserIcon className="w-5 h-5" />
                                    ) : (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                                        </svg>
                                    )}
                                </div>

                                {/* Message Bubble */}
                                <div>
                                    <div
                                        className={`rounded-2xl px-4 py-3 ${
                                            message.sender === 'user'
                                                ? 'bg-indigo-600 text-white rounded-tr-none'
                                                : 'bg-white text-gray-900 rounded-tl-none shadow-md'
                                        }`}
                                    >
                                        <p className="break-words">{message.text}</p>
                                    </div>
                                    <p className={`text-xs text-gray-500 mt-1 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Typing Indicator */}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="flex gap-3 max-w-[80%]">
                                {/* Bot Avatar */}
                                <div className="w-10 h-10 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                                    </svg>
                                </div>

                                {/* Typing Bubble */}
                                <div className="bg-white rounded-2xl rounded-tl-none shadow-md px-5 py-4">
                                    <div className="flex gap-1.5">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Container */}
                <div className="bg-white rounded-b-2xl shadow-xl p-4">
                    <div className="flex gap-3 items-end">
                        <div className="flex-1 relative">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={t('chatbot.typePlaceholder')}
                                disabled={isTyping}
                                className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-indigo-600 focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>

                        <button
                            onClick={sendMessage}
                            disabled={isTyping || !inputText.trim()}
                            className="w-12 h-12 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 hover:scale-105 active:scale-95"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
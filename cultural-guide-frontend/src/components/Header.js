import { LanguageSelector } from "./LanguageSelector";
import { useTranslation } from "react-i18next";

export function Header() {
    const { t, i18n } = useTranslation();

    const handleLanguageChange = (lang) => {
        i18n.changeLanguage(lang);
        localStorage.setItem("lang", lang);
    };

    return (
        <header className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
            <div className="max-w-6xl mx-auto px-4 py-3 grid grid-cols-3 items-center">

                {/* LEFT COLUMN */}
                <div className="text-left font-semibold text-gray-700">
                    {t("header_title")}
                </div>

                {/* CENTER COLUMN */}
                <div className="text-center font-medium text-gray-500">
                    {t("header_welcome")}
                </div>

                {/* RIGHT COLUMN */}
                <div className="flex justify-end">
                    <LanguageSelector
                        currentLanguage={i18n.language}
                        onLanguageChange={handleLanguageChange}
                    />
                </div>
            </div>
        </header>
    );
}

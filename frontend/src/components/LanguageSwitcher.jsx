import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'es', name: 'Español', flag: '🇪🇸' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' }
    ];

    return (
        <div className="flex gap-4">
            {languages.map((lang) => (
                <button
                    key={lang.code}
                    onClick={() => i18n.changeLanguage(lang.code)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all
                        ${i18n.language === lang.code
                            ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-lg scale-105'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }
                    `}
                >
                    <span className="text-2xl">{lang.flag}</span>
                    <span className="font-medium">{lang.name}</span>
                </button>
            ))}
        </div>
    );
}

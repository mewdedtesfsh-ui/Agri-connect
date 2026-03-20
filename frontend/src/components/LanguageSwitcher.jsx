import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'am' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-green-600 transition-colors"
      title={i18n.language === 'en' ? t('lang.switchToAmharic') : t('lang.switchToEnglish')}
    >
      <Globe className="w-5 h-5" />
      <span className="font-medium">
        {i18n.language === 'en' ? 'አማ' : 'EN'}
      </span>
    </button>
  );
};

export default LanguageSwitcher;

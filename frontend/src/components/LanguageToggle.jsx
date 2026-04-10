import React from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';

export default function LanguageToggle() {
  const { lang, toggleLang, tSync } = useTranslation();

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <button 
        onClick={toggleLang}
        className="bg-white border text-gray-600 border-gray-200 px-5 py-3 rounded-full shadow-lg flex items-center gap-2 hover:border-[#275df5] hover:text-[#275df5] transition-all font-semibold active:scale-95"
      >
        <Globe className="w-5 h-5 text-[#275df5]" />
        {lang === 'en' ? tSync('Switch to বাংলা') : tSync('Switch to English')}
      </button>
    </div>
  );
}

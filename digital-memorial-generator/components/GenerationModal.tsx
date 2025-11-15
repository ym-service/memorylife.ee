
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LANGUAGES } from '../constants';
import { Button } from './Button';
import { Spinner } from './Spinner';
import { XMarkIcon } from './Icons';
import { ModalBackdrop, ModalContainer } from './ModalUtils';

interface GenerationModalProps {
  onClose: () => void;
  onGenerate: (facts: string, language: string) => void;
  isLoading: boolean;
}

export const GenerationModal: React.FC<GenerationModalProps> = ({ onClose, onGenerate, isLoading }) => {
  const [facts, setFacts] = useState('');
  const [language, setLanguage] = useState('Russian');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (facts) {
      onGenerate(facts, language);
    }
  };

  return (
    <ModalBackdrop onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-brand-accent/20">
          <h2 className="text-xl font-serif text-brand-accent">Сгенерировать биографию</h2>
          <button onClick={onClose} className="text-brand-muted hover:text-white transition-colors">
            <XMarkIcon className="w-6 h-6"/>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 grid gap-6">
          <div>
            <label htmlFor="facts" className="block text-sm text-brand-text-dim mb-2">Ключевые факты, воспоминания, черты характера</label>
            <textarea
              id="facts"
              value={facts}
              onChange={(e) => setFacts(e.target.value)}
              rows={5}
              className="w-full bg-[#15100d] text-brand-text border border-brand-accent/25 rounded-lg p-2.5 font-sans resize-y focus:outline-none focus:ring-1 focus:ring-brand-accent/50"
              required
            />
          </div>
          <div>
            <label htmlFor="language" className="block text-sm text-brand-text-dim mb-2">Язык</label>
            <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-[#15100d] text-brand-text border border-brand-accent/25 rounded-lg px-3 py-2.5 font-sans focus:outline-none focus:ring-1 focus:ring-brand-accent/50 appearance-none"
                 style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23a0a0a0' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem',
                }}
            >
                {LANGUAGES.map(lang => (
                    <option key={lang} value={lang} className="bg-brand-bg-elev text-brand-text">{lang}</option>
                ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>Отмена</Button>
            <Button type="submit" variant="primary" disabled={isLoading || !facts}>
              {isLoading ? <Spinner /> : 'Сгенерировать'}
            </Button>
          </div>
        </form>
      </ModalContainer>
    </ModalBackdrop>
  );
};

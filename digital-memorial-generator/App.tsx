
import React, { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { Memorial, Condolence } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { generateBiography } from './services/geminiService';
import { MOCK_MEMORIAL } from './constants';

import { Header } from './components/Header';
import { Obituary } from './components/Obituary';
import { Particles } from './components/Particles';
import { GenerationModal } from './components/GenerationModal';
import { PreviewModal } from './components/PreviewModal';
import { DrawingBoard } from './components/DrawingBoard';

const App: React.FC = () => {
  const [memorial, setMemorial] = useLocalStorage<Memorial | null>('obituary-prototype-v1', MOCK_MEMORIAL);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isCandleOn, setIsCandleOn] = useState<boolean>(true);
  const [isGenModalOpen, setIsGenModalOpen] = useState<boolean>(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);
  const [isDrawBoardOpen, setIsDrawBoardOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const [activeCondolenceAttachment, setActiveCondolenceAttachment] = useState<((dataUrl: string) => void) | null>(null);

  const updateField = (key: keyof Memorial, value: any) => {
    setMemorial(prev => prev ? { ...prev, [key]: value } : null);
  };
  
  const addCondolence = (condolence: Omit<Condolence, 'id' | 'timestamp'>) => {
    const newCondolence: Condolence = {
        ...condolence,
        id: Date.now(),
        timestamp: new Date().toISOString(),
    };
    updateField('condolences', [newCondolence, ...(memorial?.condolences || [])]);
  }

  const clearCondolences = () => {
    updateField('condolences', []);
  }

  const handleGenerate = async (facts: string, language: string) => {
    if (!memorial) return;
    setIsLoading(true);
    try {
      const biography = await generateBiography(memorial.name, memorial.dates, facts, language);
      updateField('epitaph', biography);
    } catch (err)
      {
      console.error(err);
      // You could add a user-facing error message here
    } finally {
      setIsLoading(false);
      setIsGenModalOpen(false);
    }
  };
  
  const handleOpenDrawBoard = (onApply: (dataUrl: string) => void) => {
    setActiveCondolenceAttachment(() => onApply);
    setIsDrawBoardOpen(true);
  };

  const saveMemorial = () => {
    if (memorial) {
        localStorage.setItem('obituary-prototype-v1', JSON.stringify(memorial));
    }
  }

  if (!memorial) return <div>Loading...</div>;

  return (
    <>
      <Particles isOn={isCandleOn} />
      <div className="max-w-5xl mx-auto p-6">
        <Header 
          isEditing={isEditing}
          onToggleEditing={() => setIsEditing(p => !p)}
          onSave={saveMemorial}
          onOpenModal={() => setIsPreviewModalOpen(true)}
          isCandleOn={isCandleOn}
          onToggleCandle={() => setIsCandleOn(p => !p)}
        />
        <main>
          <Obituary 
            memorial={memorial} 
            isEditing={isEditing} 
            updateField={updateField}
            onGenerateClick={() => setIsGenModalOpen(true)}
            addCondolence={addCondolence}
            clearCondolences={clearCondolences}
            onOpenDrawBoard={handleOpenDrawBoard}
          />
        </main>
        <footer className="text-center text-xs text-brand-muted mt-6 no-print">
            Этот прототип работает полностью офлайн, данные сохраняются в браузере. Для совместного использования распечатайте в PDF или сохраните страницу целиком.
        </footer>
      </div>

      <AnimatePresence>
        {isGenModalOpen && (
          <GenerationModal
            onClose={() => setIsGenModalOpen(false)}
            onGenerate={handleGenerate}
            isLoading={isLoading}
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isPreviewModalOpen && (
          <PreviewModal
            memorial={memorial}
            onClose={() => setIsPreviewModalOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDrawBoardOpen && (
          <DrawingBoard
            onClose={() => setIsDrawBoardOpen(false)}
            onApply={(dataUrl) => {
              if (activeCondolenceAttachment) {
                activeCondolenceAttachment(dataUrl);
              }
              setIsDrawBoardOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default App;

import React from 'react';
import type { Memorial } from '../types';
import { Button } from './Button';
import { XMarkIcon } from './Icons';
import { ModalBackdrop } from './ModalUtils';
import { Obituary } from './Obituary';

interface PreviewModalProps {
  memorial: Memorial;
  onClose: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ memorial, onClose }) => {
  return (
    <ModalBackdrop onClick={onClose}>
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 no-print">
            <div className="font-semibold">Предпросмотр некролога</div>
            <Button variant="ghost" onClick={onClose}>Закрыть</Button>
        </div>
        <div className="bg-brand-bg w-full h-full overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="max-w-5xl mx-auto p-6">
                 <Obituary 
                    memorial={memorial}
                    isEditing={false}
                    updateField={() => {}}
                    onGenerateClick={() => {}}
                    addCondolence={() => {}}
                    clearCondolences={() => {}}
                    onOpenDrawBoard={() => {}}
                 />
            </div>
        </div>
    </ModalBackdrop>
  );
};


import React, { useRef } from 'react';
import { Button } from './Button';
import { fileToOptimizedDataURL, DEFAULT_PORTRAIT_SVG } from '../utils';

interface PortraitProps {
  photoUrl: string | null;
  onPhotoChange: (dataUrl: string | null) => void;
}

export const Portrait: React.FC<PortraitProps> = ({ photoUrl, onPhotoChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const dataUrl = await fileToOptimizedDataURL(file, 800, 0.9);
      onPhotoChange(dataUrl);
    }
  };

  const handleClear = () => {
    onPhotoChange(null);
    if(fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div className="relative aspect-[4/5] rounded-main overflow-hidden bg-brand-bg border border-brand-accent/25 shadow-[inset_0_0_0_1px_rgba(0,0,0,.4),_0_12px_40px_rgba(0,0,0,.6)] group transition-shadow duration-500 ease-in-out hover:shadow-[inset_0_0_0_1px_rgba(0,0,0,.4),_0_12px_40px_rgba(0,0,0,.6),_0_0_25px_rgba(212,163,115,0.4)]">
      <img
        src={photoUrl || DEFAULT_PORTRAIT_SVG}
        alt="Portrait"
        className="w-full h-full object-cover object-center block filter contrast-[1.05] saturate-[1.05] transition-transform duration-500 ease-in-out group-hover:scale-105"
      />
      <div className="absolute inset-x-2 bottom-2 flex justify-between gap-2 no-print">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          aria-hidden="true"
        />
        <Button onClick={() => fileInputRef.current?.click()}>Добавить фото</Button>
        <Button variant="ghost" onClick={handleClear}>Очистить</Button>
      </div>
    </div>
  );
};

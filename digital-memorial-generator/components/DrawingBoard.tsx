
import React from 'react';
import { useDrawingCanvas } from '../hooks/useDrawingCanvas';
import { Button } from './Button';
import { ModalBackdrop, ModalContainer } from './ModalUtils';

interface DrawingBoardProps {
  onClose: () => void;
  onApply: (dataUrl: string) => void;
}

const PALETTE_COLORS = ["#ffffff", "#ffd08a", "#d4a373", "#b88339", "#a67a44", "#6c3e16", "#2a2019"];

export const DrawingBoard: React.FC<DrawingBoardProps> = ({ onClose, onApply }) => {
  const {
    canvasRef,
    brushColor,
    setBrushColor,
    brushSize,
    setBrushSize,
    undo,
    clear,
    getCanvasDataURL,
  } = useDrawingCanvas();

  const handleApply = () => {
    const dataUrl = getCanvasDataURL();
    if (dataUrl) {
      onApply(dataUrl);
    }
  };

  return (
    <ModalBackdrop onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()} className="w-full max-w-4xl">
        <div className="p-3.5 border-b border-brand-accent/20 flex flex-wrap items-center justify-between gap-4">
          <div className="font-semibold">Доска рисования</div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex gap-2 items-center">
              {PALETTE_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setBrushColor(color)}
                  className={`w-5 h-5 rounded-full border border-white/25 shadow-inner shadow-black/40 ${brushColor === color ? 'outline outline-2 outline-offset-1 outline-white/50' : ''}`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm text-brand-text-dim">
              <label htmlFor="brushSize">Толщина</label>
              <input type="range" id="brushSize" min="2" max="24" value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} className="w-40" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={undo}>Отменить</Button>
            <Button variant="ghost" onClick={clear}>Очистить</Button>
          </div>
        </div>
        <div className="p-3.5">
          <canvas
            ref={canvasRef}
            className="w-full h-[420px] bg-[#0e0a08] border border-brand-accent/25 rounded-xl shadow-inner shadow-black/50 block touch-none"
            aria-label="Область рисования"
          />
        </div>
        <div className="p-3.5 border-t border-brand-accent/20 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Отмена</Button>
          <Button onClick={handleApply}>Прикрепить</Button>
        </div>
      </ModalContainer>
    </ModalBackdrop>
  );
};

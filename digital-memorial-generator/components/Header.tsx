
import React from 'react';
import { Button } from './Button';
import { EditIcon, SaveIcon, PrintIcon, ModalIcon } from './Icons';
import { Candle } from './Candle';

interface HeaderProps {
    isEditing: boolean;
    onToggleEditing: () => void;
    onSave: () => void;
    onOpenModal: () => void;
    isCandleOn: boolean;
    onToggleCandle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isEditing, onToggleEditing, onSave, onOpenModal, isCandleOn, onToggleCandle }) => {
    return (
        <header className="flex items-center justify-between gap-4 py-4 px-0 no-print">
            <a className="brand inline-flex items-center gap-3 text-decoration-none text-brand-text" href="#">
                <span className="brand-mark w-[34px] h-[34px] rounded-full bg-[radial-gradient(circle_at_30%_30%,#e7c999,#c6944d_40%,#6a4b2b_70%,#2a2019_100%)] shadow-[0_0_8px_rgba(212,163,115,.6),inset_0_0_14px_rgba(0,0,0,.75)] relative">
                    <span className="absolute inset-1.5 rounded-full border border-white/30"></span>
                </span>
                <span className="brand-name font-semibold tracking-wide">In Memoriam - прототип</span>
            </a>
            <div className="toolbar flex flex-wrap gap-2">
                <Button onClick={onToggleEditing}>
                    <EditIcon className="w-4 h-4" />
                    {isEditing ? 'Завершить' : 'Редактировать'}
                </Button>
                <Button variant="primary" onClick={onSave} title="Сохранить локально">
                    <SaveIcon className="w-4 h-4" />
                    Сохранить
                </Button>
                <Button onClick={onOpenModal}>
                    <ModalIcon className="w-4 h-4" />
                </Button>
                <Button onClick={() => window.print()}>
                    <PrintIcon className="w-4 h-4" />
                </Button>
                <Button variant="ghost" onClick={onToggleCandle}>
                    <Candle isOn={isCandleOn} />
                    Свет свечи
                </Button>
            </div>
        </header>
    );
};

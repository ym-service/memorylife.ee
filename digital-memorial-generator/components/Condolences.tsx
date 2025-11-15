
import React, { useState, useRef } from 'react';
import type { Condolence } from '../types';
import { Button } from './Button';
import { fileToOptimizedDataURL } from '../utils';

interface CondolencesProps {
    condolences: Condolence[];
    addCondolence: (condolence: Omit<Condolence, 'id' | 'timestamp'>) => void;
    clearCondolences: () => void;
    onOpenDrawBoard: (onApply: (dataUrl: string) => void) => void;
}

const CondolenceItem: React.FC<{ condolence: Condolence }> = ({ condolence }) => {
    const formattedDate = new Date(condolence.timestamp).toLocaleString();
    return (
         <div className="bg-gradient-to-b from-[#1c1511] to-[#14100d] border border-brand-accent/20 rounded-xl p-3">
            <div className="text-brand-muted text-xs print-black-text">
                {condolence.name || 'Аноним'}
                {condolence.relation && ` · ${condolence.relation}`}
                {' · '}<span>{formattedDate}</span>
            </div>
             <p className="text-brand-text-dim whitespace-pre-wrap my-1 print-black-text">{condolence.text}</p>
             {condolence.attachmentUrl && (
                <figure className="mt-2">
                    <a href={condolence.attachmentUrl} target="_blank" rel="noopener noreferrer">
                        <img 
                            src={condolence.attachmentUrl} 
                            alt="Вложение"
                            className="max-w-full max-h-60 block rounded-lg border border-brand-accent/25 shadow-main cursor-zoom-in"
                        />
                    </a>
                </figure>
             )}
         </div>
    )
};

export const Condolences: React.FC<CondolencesProps> = ({ condolences, addCondolence, clearCondolences, onOpenDrawBoard }) => {
    const [name, setName] = useState('');
    const [relation, setRelation] = useState('');
    const [text, setText] = useState('');
    const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
    const photoInputRef = useRef<HTMLInputElement>(null);

    const handlePhotoAttach = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if(file) {
            const dataUrl = await fileToOptimizedDataURL(file, 1400, 0.88);
            setAttachmentUrl(dataUrl);
        }
    };
    
    const clearAttachment = () => {
        setAttachmentUrl(null);
        if (photoInputRef.current) photoInputRef.current.value = '';
    }
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!text.trim() && !attachmentUrl) return;
        addCondolence({ name, relation, text, attachmentUrl });
        setName('');
        setRelation('');
        setText('');
        clearAttachment();
    }
    
    return (
        <section className="mt-4">
             <h2 className="text-lg font-semibold font-serif text-brand-text mb-3 print-black-text">Слова памяти</h2>
             <div className="grid gap-3">
                 <form onSubmit={handleSubmit} className="grid gap-3 no-print">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input id="cName" value={name} onChange={e => setName(e.target.value)} placeholder="Ваше имя" aria-label="Ваше имя" className="bg-[#15100d] text-brand-text border border-brand-accent/25 rounded-lg px-3 py-2.5 font-sans focus:outline-none focus:ring-1 focus:ring-brand-accent/50"/>
                        <input id="cRel" value={relation} onChange={e => setRelation(e.target.value)} placeholder="Кем приходились" aria-label="Кем приходились" className="bg-[#15100d] text-brand-text border border-brand-accent/25 rounded-lg px-3 py-2.5 font-sans focus:outline-none focus:ring-1 focus:ring-brand-accent/50"/>
                     </div>
                     <textarea id="cText" value={text} onChange={e => setText(e.target.value)} placeholder="Тёплые слова..." aria-label="Текст пожелания" className="bg-[#15100d] text-brand-text border border-brand-accent/25 rounded-lg px-3 py-2.5 font-sans min-h-20 resize-y focus:outline-none focus:ring-1 focus:ring-brand-accent/50"></textarea>

                    <div className="grid gap-2">
                        <input id="cPhoto" ref={photoInputRef} onChange={handlePhotoAttach} type="file" accept="image/*" className="hidden"/>
                        <div className="flex flex-wrap gap-2">
                            <Button type="button" onClick={() => photoInputRef.current?.click()}>Прикрепить фото</Button>
                            <Button type="button" variant="ghost" onClick={() => onOpenDrawBoard(setAttachmentUrl)}>Доска рисования</Button>
                             {attachmentUrl && <Button type="button" variant="ghost" onClick={clearAttachment}>Убрать вложение</Button>}
                        </div>
                        {attachmentUrl && (
                             <div className="grid place-items-center border border-dashed border-brand-accent/30 rounded-xl p-2 bg-gradient-to-b from-[#1c1511] to-[#14100d]">
                                <img src={attachmentUrl} alt="Предпросмотр вложения" className="max-w-full max-h-52 block rounded-lg border border-brand-accent/25 shadow-main"/>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-1">
                        <Button type="submit">Оставить</Button>
                        <Button type="button" variant="ghost" onClick={clearCondolences}>Очистить</Button>
                    </div>
                 </form>

                 <div className="grid gap-2">
                    {condolences.map(c => <CondolenceItem key={c.id} condolence={c} />)}
                 </div>
             </div>
        </section>
    );
};

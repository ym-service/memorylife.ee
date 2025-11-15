
import React from 'react';
import type { Memorial } from '../types';
import { EditableField } from './EditableField';
import { Button } from './Button';

interface InfoProps {
    name: string;
    dates: string;
    epitaph: string;
    tags: string[];
    isEditing: boolean;
    updateField: (key: keyof Memorial, value: any) => void;
    onGenerateClick: () => void;
}

export const Info: React.FC<InfoProps> = (props) => {
    return (
        <div className="grid gap-2.5 content-start print-black-text">
            <EditableField 
                as="h1"
                isEditing={props.isEditing}
                value={props.name}
                onSave={(val) => props.updateField('name', val)}
                className="text-3xl md:text-4xl font-bold font-serif tracking-wide leading-tight"
            />
             <EditableField 
                as="div"
                isEditing={props.isEditing}
                value={props.dates}
                onSave={(val) => props.updateField('dates', val)}
                className="text-brand-muted text-sm tracking-widest uppercase"
            />
            <EditableField 
                as="p"
                isEditing={props.isEditing}
                value={props.epitaph}
                onSave={(val) => props.updateField('epitaph', val)}
                className="text-base md:text-lg text-brand-text-dim max-w-prose"
            />
             <div className="flex flex-wrap gap-1.5 mt-1">
                {props.tags.map((tag, index) => (
                    <span key={index} className="text-xs px-2.5 py-1.5 rounded-full bg-gradient-to-b from-[#2b221b] to-[#1a140f] border border-brand-accent/25 text-brand-text-dim">
                        {tag}
                    </span>
                ))}
            </div>
             <div className="flex flex-wrap gap-2 mt-1.5 no-print">
                <Button variant="primary" onClick={props.onGenerateClick}>Сгенерировать биографию</Button>
            </div>
        </div>
    )
}
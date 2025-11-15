import React from 'react';
import type { Memorial, Condolence } from '../types';
import { Portrait } from './Portrait';
import { Info } from './Info';
import { Timeline } from './Timeline';
import { Condolences } from './Condolences';

interface ObituaryProps {
    memorial: Memorial;
    isEditing: boolean;
    updateField: (key: keyof Memorial, value: any) => void;
    onGenerateClick: () => void;
    addCondolence: (condolence: Omit<Condolence, 'id' | 'timestamp'>) => void;
    clearCondolences: () => void;
    onOpenDrawBoard: (onApply: (dataUrl: string) => void) => void;
}

const HeroFrame: React.FC<{children: React.ReactNode}> = ({ children }) => (
     <div className="relative isolate my-4 sm:my-6 rounded-3xl bg-gradient-to-b from-white/5 to-white/[.01] p-px border border-brand-accent/25 shadow-2xl 
     before:content-[''] before:absolute before:-inset-px before:rounded-[26px] before:pointer-events-none 
     before:[mask:radial-gradient(800px_160px_at_50%_-5%,rgba(0,0,0,.9),transparent_60%)_top,radial-gradient(800px_160px_at_50%_105%,rgba(0,0,0,.9),transparent_60%)_bottom]
     before:[mask-composite:exclude] before:opacity-25 before:animate-frameGlow
     before:[background:conic-gradient(from_0deg,rgba(212,163,115,.15),rgba(255,205,143,.1),rgba(212,163,115,.15),rgba(184,131,57,.1),rgba(212,163,115,.15))]
     after:content-[''] after:absolute after:inset-3 after:border after:border-brand-accent/20 after:rounded-2xl after:bg-gradient-to-b after:from-brand-accent/[.08] after:to-transparent after:shadow-inner after:shadow-brand-accent/5 after:opacity-60
     ">
        {children}
    </div>
);

export const Obituary: React.FC<ObituaryProps> = (props) => {
    return (
        <HeroFrame>
            <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 p-4 sm:p-6">
                <Portrait 
                    photoUrl={props.memorial.photoUrl} 
                    onPhotoChange={(url) => props.updateField('photoUrl', url)} 
                />
                <div className="flex flex-col gap-4">
                    <Info
                        name={props.memorial.name}
                        dates={props.memorial.dates}
                        epitaph={props.memorial.epitaph}
                        tags={props.memorial.tags}
                        isEditing={props.isEditing}
                        updateField={props.updateField}
                        onGenerateClick={props.onGenerateClick}
                    />
                     <Timeline
                        events={props.memorial.timeline}
                        isEditing={props.isEditing}
                        onEventsChange={(events) => props.updateField('timeline', events)}
                    />
                    <Condolences 
                        condolences={props.memorial.condolences}
                        addCondolence={props.addCondolence}
                        clearCondolences={props.clearCondolences}
                        onOpenDrawBoard={props.onOpenDrawBoard}
                    />
                </div>
            </div>
        </HeroFrame>
    );
}
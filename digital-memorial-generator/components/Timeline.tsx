
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { TimelineEvent } from '../types';
import { EditableField } from './EditableField';
import { Button } from './Button';

interface TimelineProps {
  events: TimelineEvent[];
  isEditing: boolean;
  onEventsChange: (events: TimelineEvent[]) => void;
}

const TimelineEventCard: React.FC<{ event: TimelineEvent, isEditing: boolean, onEventChange: (updatedEvent: TimelineEvent) => void }> = ({ event, isEditing, onEventChange }) => {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-4 items-start">
      <EditableField
        isEditing={isEditing}
        value={event.year}
        onSave={(val) => onEventChange({ ...event, year: val })}
        className="text-brand-accent font-semibold"
      />
      <div className="bg-gradient-to-b from-[#1c1511] to-[#14100d] border border-brand-accent/20 rounded-xl p-3 shadow-main transition-transform duration-200 hover:-translate-y-0.5 hover:border-brand-accent/35">
        <EditableField
          isEditing={isEditing}
          value={event.title}
          onSave={(val) => onEventChange({ ...event, title: val })}
          className="font-semibold mb-1"
        />
        <EditableField
          isEditing={isEditing}
          value={event.description}
          onSave={(val) => onEventChange({ ...event, description: val })}
          className="text-brand-text-dim text-sm"
        />
      </div>
    </div>
  );
};

export const Timeline: React.FC<TimelineProps> = ({ events, isEditing, onEventsChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleEventChange = (updatedEvent: TimelineEvent) => {
    onEventsChange(events.map(e => e.id === updatedEvent.id ? updatedEvent : e));
  };
  
  if (!events || events.length === 0) return null;

  return (
    <section className="mt-2">
       <div className="flex flex-wrap gap-2 mt-1.5 no-print">
            <AnimatePresence initial={false}>
                {!isExpanded ? (
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Button onClick={() => setIsExpanded(true)}>Показать историю жизни</Button>
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Button variant="ghost" onClick={() => setIsExpanded(false)}>Свернуть</Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mt-4">
              <h2 className="text-lg font-semibold font-serif text-brand-text mb-3 print-black-text">История жизни</h2>
              <div className="relative grid gap-4 pl-1.5">
                <div className="absolute left-[9px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-accent/0 via-brand-accent/35 to-brand-accent/0" />
                {events.map(event => (
                  <TimelineEventCard key={event.id} event={event} isEditing={isEditing} onEventChange={handleEventChange} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

import React, { useRef, useEffect } from 'react';

interface EditableFieldProps {
  isEditing: boolean;
  value: string;
  onSave: (newValue: string) => void;
  className?: string;
  as?: 'div' | 'p' | 'h1' | 'span';
}

export const EditableField: React.FC<EditableFieldProps> = ({ isEditing, value, onSave, className, as = 'div' }) => {
  // FIX: The ref's type has been changed from HTMLElement to HTMLDivElement.
  // This resolves the type mismatch for the default case where the component renders a 'div'.
  // The original error was because RefObject<HTMLElement> is not assignable to the more specific RefObject<HTMLDivElement> required by the div's ref prop.
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (elementRef.current) {
      elementRef.current.textContent = value;
    }
  }, [value]);

  const handleBlur = () => {
    if (elementRef.current) {
      onSave(elementRef.current.textContent || '');
    }
  };

  const Component = as;

  return (
    <Component
      ref={elementRef as any}
      contentEditable={isEditing}
      onBlur={handleBlur}
      className={`${className} ${isEditing ? 'outline-none ring-1 ring-brand-accent/50 focus:ring-brand-accent rounded-sm' : ''}`}
      suppressContentEditableWarning={true}
    />
  );
};

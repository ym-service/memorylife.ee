
import React from 'react';
// FIX: Import the `Variants` type from `framer-motion` to explicitly type animation variants.
import { motion, Variants } from 'framer-motion';

// FIX: Explicitly type `backdropVariants` with `Variants` for type safety and consistency.
const backdropVariants: Variants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};

// FIX: Explicitly type `modalVariants` with `Variants`. This resolves the error by ensuring
// that properties like `transition.type` are correctly interpreted as specific literal
// types (e.g., "spring") rather than a generic `string`.
const modalVariants: Variants = {
  hidden: { y: "-50px", opacity: 0, scale: 0.95 },
  visible: { 
    y: "0", 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.3, type: "spring", damping: 25, stiffness: 300 }
  },
  exit: { y: "50px", opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

export const ModalBackdrop: React.FC<{children: React.ReactNode, onClick: () => void}> = ({ children, onClick }) => (
    <motion.div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 no-print"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      onClick={onClick}
    >
        {children}
    </motion.div>
);

export const ModalContainer: React.FC<{children: React.ReactNode, onClick: (e: React.MouseEvent) => void, className?: string}> = ({ children, onClick, className = ''}) => (
    <motion.div
        className={`bg-gradient-to-b from-brand-bg-elev-2 to-brand-bg-elev rounded-main shadow-main border border-brand-accent/25 max-h-[90vh] flex flex-col overflow-hidden ${className}`}
        variants={modalVariants}
        onClick={onClick}
      >
        {children}
    </motion.div>
);

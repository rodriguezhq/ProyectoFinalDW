import React, { createContext, useContext, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

const DialogContext = createContext(null);

export default function Dialog({ 
    isOpen, 
    onClose, 
    children, 
    className = '', 
    size = 'md', 
    closeOnOverlayClick = true 
}) {
    // Cerrar con tecla Escape
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl',
        full: 'max-w-none w-screen h-screen rounded-none p-0'
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <DialogContext.Provider value={{ onClose }}>
                    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 overflow-y-auto">
                        
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => closeOnOverlayClick && onClose()}
                        />
                        
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            transition={{ duration: 0.18, ease: 'easeOut' }}
                            className={twMerge(
                                'relative bg-bg-base w-full rounded-lg shadow-xl overflow-hidden flex flex-col z-[9991] border border-border',
                                sizeClasses[size] || sizeClasses.md,
                                className
                            )}
                        >
                            {children}
                        </motion.div>
                    </div>
                </DialogContext.Provider>
            )}
        </AnimatePresence>
    );
}

function DialogHeader({ children, className = '', showCloseButton = true }) {
    const context = useContext(DialogContext);
    const onClose = context?.onClose;

    return (
        <div className={twMerge('flex items-center justify-between p-4 border-b border-border bg-bg-base', className)}>
            <div className="text-base font-bold text-text-heading font-heading">
                {children}
            </div>
            {showCloseButton && onClose && (
                <button
                    type="button"
                    onClick={onClose}
                    className="p-1 hover:bg-bg-alt rounded-full text-text-muted hover:text-text-heading cursor-pointer focus:outline-none transition-colors"
                    aria-label="Cerrar modal"
                >
                    <X size={18} />
                </button>
            )}
        </div>
    );
}

function DialogContent({ children, className = '' }) {
    return (
        <div className={twMerge('p-4 overflow-y-auto text-sm text-text-main grow', className)}>
            {children}
        </div>
    );
}

function DialogFooter({ children, className = '' }) {
    return (
        <div className={twMerge('flex items-center justify-end gap-2 p-3 border-t border-border bg-bg-alt/50', className)}>
            {children}
        </div>
    );
}

// Asignar sub-componentes para el patrón Compound Component
Dialog.Header = DialogHeader;
Dialog.Content = DialogContent;
Dialog.Footer = DialogFooter;

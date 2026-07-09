import React, { createContext, useContext, useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import { cva } from 'class-variance-authority';
import { v4 as uuidv4 } from 'uuid';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const MAX_TOASTS = 5;

const toastVariants = cva(
  'relative border min-h-10 rounded p-3 w-96 text-neutral-800 dark:text-neutral-200 shadow-md flex items-center justify-between gap-3 bg-white dark:bg-neutral-800',
  {
    variants: {
      type: {
        success: 'border-green-600 dark:border-green-700 bg-green-50 dark:bg-green-950/30 text-green-900 dark:text-green-100',
        danger: 'border-red-600 dark:border-red-700 bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-100',
        warning: 'border-yellow-600 dark:border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30 text-yellow-900 dark:text-yellow-100',
        neutral: 'border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100',
        brand: 'border-blue-600 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-100',
      },
      showIcon: {
        true: 'pl-3',
        false: 'pl-3'
      }
    },
    defaultVariants: {
      type: 'neutral',
      showIcon: true
    },
  }
);

const iconVariants = cva('', {
  variants: {
    type: {
      success: 'text-green-500',
      danger: 'text-red-500',
      warning: 'text-yellow-600',
      neutral: 'text-neutral-500',
      brand: 'text-blue-500 dark:text-blue-400',
    },
  },
});

const renderIcon = (type) => {
  const icons = {
    success: <CheckCircle2 className={iconVariants({ type })} size={20} />,
    danger: <XCircle className={iconVariants({ type })} size={20} />,
    warning: <AlertTriangle className={iconVariants({ type })} size={20} />,
    neutral: <Info className={iconVariants({ type })} size={20} />,
    brand: <Info className={iconVariants({ type })} size={20} />,
  };
  return icons[type] || icons.neutral;
};

const positionStyles = {
  top: 'top-4 left-1/2 -translate-x-1/2 flex-col-reverse',
  bottom: 'bottom-4 left-1/2 -translate-x-1/2 flex-col',
  left: 'top-1/2 left-4 -translate-y-1/2 flex-col',
  right: 'top-1/2 right-4 -translate-y-1/2 flex-col',
  'left-start': 'top-4 left-4 flex-col-reverse',
  'left-end': 'bottom-4 left-4 flex-col',
  'right-start': 'top-4 right-4 flex-col-reverse',
  'right-end': 'bottom-4 right-4 flex-col',
};

const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 640);
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isDesktop;
};

const ToastContext = createContext(null);

export const useNotification = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useNotification must be used within a ToastProvider');
  return context;
};

export const ToastProvider = ({ children }) => {
  const isDesktop = useIsDesktop();
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const close = useCallback((id) => {
    setToasts((prevToasts) => {
      const toastToRemove = prevToasts.find((toast) => toast.id === id);
      if (toastToRemove?.onClose) {
        toastToRemove.onClose();
      }
      return prevToasts.filter((toast) => toast.id !== id);
    });

    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const notify = useCallback(
    (options) => {
      let {
        time = 3000,
        isClosable = true,
        position = 'top',
        showIcon = true,
        ...rest
      } = options;

      const id = uuidv4();
      const newToast = { id, time, isClosable, position, showIcon, ...rest };

      setToasts((prevToasts) => {
        const toastsInPosition = prevToasts.filter((t) => t.position === position);
        if (toastsInPosition.length >= MAX_TOASTS) {
          const oldestToastId = toastsInPosition[0].id;
          const timer = timersRef.current.get(oldestToastId);
          if (timer) clearTimeout(timer);
          timersRef.current.delete(oldestToastId);
          return [...prevToasts.filter((t) => t.id !== oldestToastId), newToast];
        }
        return [...prevToasts, newToast];
      });

      if (typeof time === 'number') {
        const timer = setTimeout(() => close(id), time);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [close]
  );

  const showSuccess = useCallback((message, options) => {
    return notify({
      type: 'success',
      component: <p>{message}</p>,
      isClosable: options?.isClosable ?? true,
      time: options?.time ?? 5000,
      position: options?.position ?? 'top',
      showIcon: options?.showIcon ?? true,
      onClose: options?.onClose,
    });
  }, [notify]);

  const showDanger = useCallback((message, options) => {
    return notify({
      type: 'danger',
      component: <p>{message}</p>,
      isClosable: options?.isClosable ?? true,
      time: options?.time ?? 5000,
      position: options?.position ?? 'top',
      showIcon: options?.showIcon ?? true,
      onClose: options?.onClose,
    });
  }, [notify]);

  const showWarning = useCallback((message, options) => {
    return notify({
      type: 'warning',
      component: <p>{message}</p>,
      isClosable: options?.isClosable ?? true,
      time: options?.time ?? 5000,
      position: options?.position ?? 'top',
      showIcon: options?.showIcon ?? true,
      onClose: options?.onClose,
    });
  }, [notify]);

  const showNeutral = useCallback((message, options) => {
    return notify({
      type: 'neutral',
      component: <p>{message}</p>,
      isClosable: options?.isClosable ?? true,
      time: options?.time ?? 5000,
      position: options?.position ?? 'top',
      showIcon: options?.showIcon ?? true,
      onClose: options?.onClose,
    });
  }, [notify]);

  const showBrand = useCallback((message, options) => {
    return notify({
      type: 'brand',
      component: <p>{message}</p>,
      isClosable: options?.isClosable ?? true,
      time: options?.time ?? 5000,
      position: options?.position ?? 'top',
      showIcon: options?.showIcon ?? true,
      onClose: options?.onClose,
    });
  }, [notify]);

  const contextValue = useMemo(() => (
    {
      notify,
      close,
      showSuccess,
      showDanger,
      showWarning,
      showNeutral,
      showBrand,
    }
  ), [notify, close, showSuccess, showDanger, showWarning, showNeutral, showBrand]);

  const groupedToasts = useMemo(() => {
    return toasts.reduce((acc, toast) => {
      acc[toast.position] = acc[toast.position] || [];
      acc[toast.position].push(toast);
      return acc;
    }, {});
  }, [toasts]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {Object.keys(positionStyles).map((position) => {
        const items = groupedToasts[position] || [];

        const getPositionClasses = () => {
          if (isDesktop) {
            return positionStyles[position];
          }
          const isTopAligned = position.endsWith('-start') || position === 'top';
          if (isTopAligned) {
            return 'top-4 left-1/2 -translate-x-1/2 flex-col-reverse';
          }
          return 'bottom-4 left-1/2 -translate-x-1/2 flex-col';
        };

        return (
          <div
            key={position}
            className={twMerge(
              'fixed z-[9999] flex gap-2 items-center pointer-events-none',
              getPositionClasses()
            )}
          >
            <AnimatePresence initial={false}>
              {items.map(({ id, component, type, isClosable, showIcon }) => (
                <motion.div
                  key={id}
                  layout
                  variants={{
                    initial: { opacity: 0, scale: 0.9, y: 10 },
                    animate: { opacity: 1, scale: 1, y: 0 },
                    exit: { opacity: 0, scale: 0.9, y: 10 },
                  }}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.2, ease: 'anticipate' }}
                  className={twMerge('pointer-events-auto flex items-center gap-3', toastVariants({ type, showIcon }))}
                >
                  {showIcon && renderIcon(type)}
                  <div className="flex-1 text-sm font-medium">{component}</div>
                  {isClosable && (
                    <button
                      type="button"
                      className="p-1 hover:bg-black/10 rounded dark:hover:bg-white/10 cursor-pointer focus:outline-none transition-colors"
                      onClick={() => close(id)}
                    >
                      <X size={16} />
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        );
      })}
    </ToastContext.Provider>
  );
};

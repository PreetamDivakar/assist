import { X, Loader2, CheckCircle2 } from 'lucide-react';

export function Modal({ isOpen, onClose, title, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={onClose} />
          <motion.div
            className="relative flex flex-col w-full md:max-w-md max-h-[90vh] rounded-t-[2.5rem] md:rounded-[2.5rem] bg-surface-card p-6 md:p-8 shadow-2xl dark:bg-surface-card-dark border-t border-x md:border border-white/20"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-6 flex items-center justify-between shrink-0">
              <h3 className="text-xl font-bold tracking-tight">{title}</h3>
              <button
                onClick={onClose}
                className="rounded-full p-2 transition-colors bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto pr-1 custom-scrollbar pb-6">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title || 'Confirm'}>
      <p className="mb-6 text-text-muted dark:text-text-muted-dark">{message}</p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          className="rounded-xl px-4 py-2 text-sm font-medium transition-colors hover:bg-primary/10"
        >
          Cancel
        </button>
        <button
          onClick={() => { onConfirm(); onClose(); }}
          className="rounded-xl bg-danger px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-danger/80"
        >
          Delete
        </button>
      </div>
    </Modal>
  );
}

export function EmptyState({ icon: Icon, title, description }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {Icon && <Icon size={48} className="mb-4 text-primary-light opacity-50" />}
      <h3 className="mb-2 text-lg font-semibold opacity-70">{title}</h3>
      <p className="text-sm text-text-muted dark:text-text-muted-dark">{description}</p>
    </motion.div>
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`skeleton h-24 w-full rounded-2xl ${className}`} />
  );
}

export function SkeletonList({ count = 3 }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function FloatingActionButton({ onClick, icon: Icon }) {
  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-8 right-8 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white premium-shadow"
      transition={{ duration: 0.2 }}
    >
      <Icon size={28} />
    </motion.button>
  );
}

export function PageHeader({ title, onBack, children }) {
  return (
    <div className="mb-4 md:mb-6 flex items-center gap-3 md:gap-4 shrink-0">
      {onBack && (
        <motion.button
          onClick={onBack}
          className="rounded-full p-1.5 md:p-2 transition-colors hover:bg-primary/10"
        >
          <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </motion.button>
      )}
      <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent truncate">
        {title}
      </h1>
      <div className="ml-auto flex gap-2 shrink-0">{children}</div>
    </div>
  );
}

export function Badge({ children, variant = 'default' }) {
  const colors = {
    default: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light border-primary/10',
    success: 'bg-success/10 text-success dark:bg-success/20 dark:text-success border-success/10',
    warning: 'bg-warning/10 text-warning dark:bg-warning/20 dark:text-warning border-warning/10',
    danger: 'bg-danger/10 text-danger dark:bg-danger/20 dark:text-danger border-danger/10',
    accent: 'bg-accent/10 text-accent dark:bg-accent/20 dark:text-accent border-accent/10',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] md:text-xs font-bold uppercase tracking-wider border ${colors[variant]}`}>
      {children}
    </span>
  );
}

export function Input({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-bold uppercase tracking-widest text-text-muted dark:text-text-muted-dark px-1">{label}</label>}
      <input
        {...props}
        className={`rounded-2xl border border-border bg-black/5 dark:bg-white/5 px-4 py-3 text-base outline-none transition-all focus:bg-white dark:focus:bg-black focus:ring-4 focus:ring-primary/10 dark:text-text-dark ${props.className || ''}`}
      />
    </div>
  );
}

export function TextArea({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-bold uppercase tracking-widest text-text-muted dark:text-text-muted-dark px-1">{label}</label>}
      <textarea
        {...props}
        className={`rounded-2xl border border-border bg-black/5 dark:bg-white/5 px-4 py-3 text-base outline-none transition-all focus:bg-white dark:focus:bg-black focus:ring-4 focus:ring-primary/10 dark:text-text-dark resize-none ${props.className || ''}`}
      />
    </div>
  );
}

export function Button({ children, variant = 'primary', isLoading, isSuccess, ...props }) {
  const styles = {
    primary: 'bg-primary text-white premium-shadow',
    secondary: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light hover:bg-primary/20 dark:hover:bg-primary/30',
    ghost: 'hover:bg-black/5 dark:hover:bg-white/5',
    danger: 'bg-danger/10 text-danger hover:bg-danger/20',
  };
  return (
    <motion.button
      disabled={isLoading || props.disabled}
      className={`rounded-2xl px-6 py-3.5 text-sm font-bold tracking-tight transition-all flex items-center justify-center gap-2 ${styles[variant]} ${props.className || ''} ${isLoading ? 'opacity-80 cursor-wait' : ''}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          <span>Processing...</span>
        </>
      ) : isSuccess ? (
        <>
          <CheckCircle2 size={18} className="text-white" />
          <span>Success!</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}

export function LoadingOverlay({ isActive, isSuccess, message = 'Saving...' }) {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="flex flex-col items-center gap-4 rounded-[2.5rem] bg-surface-card p-10 shadow-2xl dark:bg-surface-card-dark border border-white/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {isSuccess ? (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <CheckCircle2 size={48} className="text-success" />
                </motion.div>
                <span className="text-lg font-bold">Success!</span>
              </>
            ) : (
              <>
                <Loader2 size={48} className="animate-spin text-primary" />
                <span className="text-lg font-bold">{message}</span>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-6 flex items-center justify-center gap-3">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center justify-center rounded-xl bg-surface-card p-2 text-text-muted transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-50 disabled:hover:bg-surface-card disabled:hover:text-text-muted dark:bg-surface-card-dark dark:text-text-muted-dark"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <span className="text-sm font-medium text-text-muted dark:text-text-muted-dark">
        Page <span className="text-text dark:text-white">{currentPage}</span> of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center rounded-xl bg-surface-card p-2 text-text-muted transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-50 disabled:hover:bg-surface-card disabled:hover:text-text-muted dark:bg-surface-card-dark dark:text-text-muted-dark"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18l6-6-6-6"/></svg>
      </button>
    </div>
  );
}

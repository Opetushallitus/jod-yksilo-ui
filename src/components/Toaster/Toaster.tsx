import { Toast, useNoteStack } from '@jod/design-system';
import { Toast as ReactHotToast, useToaster } from 'react-hot-toast/headless';
import './toaster.css';

type SafeToast = Omit<ReactHotToast, 'message'> & { message: string };

export const Toaster = () => {
  const { toasts, handlers } = useToaster({ duration: 4000 });
  const { startPause, endPause } = handlers;
  const safeToasts = toasts.filter((toast): toast is SafeToast => typeof toast.message === 'string');
  const { permanentNotesHeight } = useNoteStack();
  // Margin to edges is 32px according to design
  // navbar + service bar (closed) + permanent notes + 32px
  const top = `${64 + 4 + permanentNotesHeight + 32}px`;

  return (
    <div
      role="alert"
      className={`fixed right-7 z-60 flex flex-col gap-4 print:hidden`}
      style={{
        top,
      }}
      onMouseEnter={startPause}
      onMouseLeave={endPause}
    >
      {safeToasts
        .filter((toast) => toast.visible)
        .map((toast) => (
          <div key={toast.id} className="toast-in">
            <Toast text={toast.message} variant={toast.type === 'error' ? 'error' : 'success'} />
          </div>
        ))}
    </div>
  );
};

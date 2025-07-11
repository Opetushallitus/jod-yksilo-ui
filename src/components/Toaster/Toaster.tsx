import { Toast } from '@jod/design-system';
import { Toast as ReactHotToast, useToaster } from 'react-hot-toast/headless';

type SafeToast = Omit<ReactHotToast, 'message'> & { message: string };

export const Toaster = () => {
  const { toasts, handlers } = useToaster();
  const { startPause, endPause } = handlers;
  const safeToasts = toasts.filter((toast): toast is SafeToast => typeof toast.message === 'string');

  return (
    <div
      role="alert"
      className="fixed top-[80px] right-4 z-60 flex flex-col gap-4"
      onMouseEnter={startPause}
      onMouseLeave={endPause}
    >
      {safeToasts
        .filter((toast) => toast.visible)
        .map((toast) => (
          <Toast key={toast.id} text={toast.message} variant={toast.type === 'error' ? 'error' : 'success'} />
        ))}
    </div>
  );
};

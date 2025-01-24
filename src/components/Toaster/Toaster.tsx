import { Toast } from '@jod/design-system';
import { useToaster } from 'react-hot-toast/headless';
import { MdCheck, MdDangerous } from 'react-icons/md';

export const Toaster = () => {
  const { toasts, handlers } = useToaster();
  const { startPause, endPause } = handlers;

  return (
    <div
      className="fixed top-[80px] right-4 z-50 flex flex-col gap-4"
      onMouseEnter={startPause}
      onMouseLeave={endPause}
    >
      {toasts
        .filter((toast) => toast.visible)
        .map((toast) => (
          <Toast
            key={toast.id}
            icon={toast.type === 'error' ? <MdDangerous size={24} /> : <MdCheck size={24} />}
            text={toast.message}
            variant={toast.type === 'error' ? 'error' : 'success'}
          />
        ))}
    </div>
  );
};

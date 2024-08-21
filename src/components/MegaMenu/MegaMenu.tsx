import { useMediaQueries } from '@jod/design-system';
import React from 'react';

interface MegaMenuProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
  onClose: () => void;
}

export const MegaMenu = ({ children, footer, onClose }: MegaMenuProps) => {
  const { sm } = useMediaQueries();

  return (
    <div className="fixed top-[56px] left-0 right-0 m-auto max-w-[1092px] bg-white shadow-border rounded-b-lg overflow-hidden">
      {sm && (
        <button className="absolute top-5 right-7" onClick={onClose}>
          <span
            aria-hidden
            className={`text-secondary-gray material-symbols-outlined size-32 flex size-[32px] select-none items-center justify-center self-center rounded-full`}
          >
            cancel
          </span>
        </button>
      )}

      <div className="overflow-y-auto max-h-[calc(100vh-172px)] sm:max-h-[calc(100vh-56px)] overscroll-contain">
        <div className="pt-9 sm:pt-10 px-5 sm:px-10 pb-7 sm:grid-cols-3 grid-cols-1 sm:gap-8 grid">{children}</div>
        {sm && footer && (
          <div className="sticky bottom-0 bg-[#F5F5F5] h-[100px] px-9 py-6 text-secondary-gray text-body-sm font-arial">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

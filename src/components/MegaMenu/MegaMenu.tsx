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
    <div className="max-w-[1092px] bg-white shadow-border rounded-b-lg overflow-hidden">
      {sm && (
        <button className="absolute top-5 right-7" onClick={onClose}>
          <span
            aria-hidden
            className={`text-secondary-gray material-symbols-outlined size-32 group- flex size-[32px] select-none items-center justify-center self-center rounded-full`}
          >
            cancel
          </span>
        </button>
      )}

      <div className="pt-9 sm:pt-11 px-5 sm:px-10 pb-7 sm:grid-cols-3 grid-cols-1 sm:gap-8 grid">{children}</div>

      {sm && footer && (
        <div className="bg-[#F5F5F5] h-[100px] px-9 py-6 text-secondary-gray text-body-sm">{footer}</div>
      )}
    </div>
  );
};

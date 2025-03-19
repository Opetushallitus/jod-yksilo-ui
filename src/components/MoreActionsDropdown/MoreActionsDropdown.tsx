import { ActionButton } from '@/components/ActionButton/ActionButton';
import { useMenuClickHandler } from '@/hooks/useMenuClickHandler';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdMoreVert } from 'react-icons/md';

const MoreActionsDropdown = ({ menuId, menuContent }: { menuId: string; menuContent: React.ReactNode }) => {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const actionButtonRef = React.useRef<HTMLDivElement>(null);
  const actionMenuRef = useMenuClickHandler(() => setOpen(false), actionButtonRef);

  return (
    <div className="relative" ref={actionMenuRef}>
      <div ref={actionButtonRef}>
        <ActionButton
          label={t('more-actions')}
          icon={<MdMoreVert size={24} className="text-accent" />}
          aria-controls={menuId}
          aria-expanded={open}
          aria-haspopup="listbox"
          className={open ? 'text-accent' : ''}
          onClick={() => setOpen(!open)}
        />
      </div>
      {open && (
        /* Preventing the click through of the wrapper <div> if not able to click exactly at the list items */
        /* eslint-disable jsx-a11y/click-events-have-key-events */
        /* eslint-disable-next-line jsx-a11y/no-static-element-interactions */
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="absolute -right-2 translate-y-[10px] cursor-auto z-50"
        >
          {menuContent}
        </div>
      )}
    </div>
  );
};

export default MoreActionsDropdown;

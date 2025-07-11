import { ActionButton } from '@/components/ActionButton/ActionButton';
import { useInteractionMethod } from '@/hooks/useInteractionMethod';
import { useMenuClickHandler } from '@/hooks/useMenuClickHandler';
import { JodMore } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';

const MoreActionsDropdown = ({ menuId, menuContent }: { menuId: string; menuContent: React.ReactNode }) => {
  const { t } = useTranslation();
  const isMouseInteraction = useInteractionMethod();
  const [open, setOpen] = React.useState(false);
  const actionButtonRef = React.useRef<HTMLDivElement>(null);
  const actionMenuRef = useMenuClickHandler(() => setOpen(false), actionButtonRef);
  const menuContentRef = React.useRef<HTMLDivElement>(null);

  // Move focus to menu content when opened
  React.useEffect(() => {
    if (open && !isMouseInteraction && menuContentRef.current) {
      const firstChild = menuContentRef.current.querySelector('a, button:not([disabled])');
      if (firstChild) {
        (firstChild as HTMLElement).focus();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    const relatedTarget = event.relatedTarget as HTMLElement;

    // Related target is the element that is focused after the menu loses focus.
    // Do not close the menu if the related target is part of the dialog portal root.
    if (relatedTarget?.closest('#headlessui-portal-root')) {
      return;
    }

    if (menuContentRef.current && !menuContentRef.current.contains(relatedTarget)) {
      setOpen(false);
    }
  };

  return (
    <div className="relative" ref={actionMenuRef}>
      <div ref={actionButtonRef}>
        <ActionButton
          label={t('more-actions')}
          icon={<JodMore className="text-accent" />}
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
          ref={menuContentRef}
          onBlur={handleBlur}
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

import React from 'react';
import toast from 'react-hot-toast/headless';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router';

import { Accordion, Button, EmptyState, useMediaQueries } from '@jod/design-system';
import { JodOpenInNew } from '@jod/design-system/icons';

import { client } from '@/api/client';
import { useModal } from '@/hooks/useModal';
import { useSessionGuardedAction } from '@/hooks/useSessionGuardedAction';
import { formatDate } from '@/utils';
import { getLinkTo } from '@/utils/routeUtils';

import type { PreferencesLoaderData } from '../loader';
import { NewShareLinkModal } from './NewShareLinkModal';

interface ShareLinkSectionProps {
  className?: string;
}
const SESSION_STORAGE_KEY = 'openShareLinkAccordions';
const ShareLinkSection = ({ className }: ShareLinkSectionProps) => {
  const { t, i18n } = useTranslation();
  const { showModal, showDialog } = useModal();
  const guardedAction = useSessionGuardedAction();
  const { sm } = useMediaQueries();
  const { jakolinkit } = useLoaderData<PreferencesLoaderData>();
  const [jakolinkitState, setJakolinkitState] = React.useState(jakolinkit);

  // Stores IDs of explicitly closed accordions; new links default to open
  const [closedAccordions, setClosedAccordions] = React.useState<Set<string>>(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
      return stored ? new Set<string>(JSON.parse(stored) as string[]) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

  const toggleAccordion = (id: string) => (isOpen: boolean) => {
    setClosedAccordions((prev) => {
      const next = new Set(prev);
      if (isOpen) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify([...next]));
      } catch {
        // ignore
      }
      return next;
    });
  };

  React.useEffect(() => {
    setJakolinkitState(jakolinkit);
  }, [jakolinkit]);

  const deleteLocalJakolinkki = (id: string) => {
    setJakolinkitState((prev) => prev.filter((j) => j.id !== id));
    toggleAccordion(id)(true);
  };

  return (
    <section className={className} data-testid="share-link-section">
      <h2 className="mb-3 text-heading-2-mobile sm:text-heading-2">{t('preferences.share.title')}</h2>
      <p className="mb-5 font-arial text-body-md whitespace-pre-wrap">{t('preferences.share.description')}</p>
      <div className="my-8">
        {jakolinkitState.length === 0 ? (
          <EmptyState text={t('preferences.share.no-links')} testId="share-link-section-empty-state" />
        ) : (
          <ul className="flex flex-col gap-7" data-testid="share-link-section-list">
            {jakolinkitState.map((linkki) => {
              const url = new URL(`${location.origin}/yksilo/${i18n.language}/cv`);
              url.searchParams.set('token', linkki.ulkoinenId!);
              const date = linkki.voimassaAsti ? new Date(linkki.voimassaAsti) : null;
              const expired = date ? date < new Date() : false;
              const dateStr = date ? formatDate(date, 'medium') : null;
              const expirationText = expired ? (
                <div className="text-button-sm text-alert-2" data-testid="share-link-section-expiration-text">
                  {t('preferences.share.link-has-expired')}
                </div>
              ) : (
                <div className="text-button-sm" data-testid="share-link-section-expiration-text">
                  {t('preferences.share.valid-until', { date: dateStr })}
                </div>
              );

              const copyButton = (
                <Button
                  size="sm"
                  variant="white"
                  className="w-fit"
                  label={t('preferences.share.copy-link')}
                  disabled={expired}
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(url.href);
                      toast.success(t('preferences.share.copy-success'));
                    } catch (err) {
                      console.error('Failed to copy to clipboard: ', err);
                      toast.error(t('preferences.share.copy-failure'));
                    }
                  }}
                  testId="share-link-section-copy-button"
                />
              );

              const deleteDialogProps = {
                testId: 'share-link-section-delete-dialog',
                title: t('preferences.share.delete-confirm-title'),
                description: t('preferences.share.delete-confirm-description'),
                confirmText: t('common:delete'),
                onConfirm: async () => {
                  await client.DELETE('/api/profiili/jakolinkki/{id}', {
                    params: { path: { id: linkki.id! } },
                  });
                  deleteLocalJakolinkki(linkki.id!);
                },
              };

              const deleteButton = (
                <Button
                  size="sm"
                  variant="white-delete"
                  ariaHaspopup="dialog"
                  className={`w-fit ${sm && !expired ? 'ml-auto' : ''}`}
                  label={t('preferences.share.delete-link')}
                  onClick={guardedAction(showDialog, deleteDialogProps)}
                  testId="share-link-section-delete-button"
                />
              );

              return (
                <li key={linkki.id} className={`border-l-2 border-border-gray py-3 pl-4 ${sm ? '' : '-ml-3'}`}>
                  <Accordion
                    title={linkki.nimi || url.href}
                    isOpen={!closedAccordions.has(linkki.id!)}
                    setIsOpen={toggleAccordion(linkki.id!)}
                    collapsedContent={
                      <div className="flex flex-col gap-4">
                        {expirationText}
                        {expired ? deleteButton : copyButton}
                      </div>
                    }
                    testId={`share-link-section-accordion-${linkki.nimi || url.href}`}
                  >
                    <div
                      className="-mt-2 font-arial text-body-sm text-secondary-gray"
                      data-testid="share-link-section-url"
                    >
                      {url.href}
                    </div>

                    <div className="mt-4 flex flex-col gap-4">
                      {linkki.muistiinpano && (
                        <div className="font-arial" data-testid="share-link-section-note">
                          {linkki.muistiinpano}
                        </div>
                      )}
                      {expirationText}

                      <div className={`flex gap-4 ${sm ? 'flex-row' : 'flex-wrap'}`}>
                        {copyButton}
                        <Button
                          size="sm"
                          ariaHaspopup="dialog"
                          variant="white"
                          className="w-fit"
                          label={t('preferences.share.edit-link')}
                          onClick={guardedAction(showModal, NewShareLinkModal, {
                            id: linkki.id,
                          })}
                          testId="share-link-section-edit-button"
                        />
                        <Button
                          size="sm"
                          variant="white"
                          className="w-fit"
                          label={t('preferences.share.preview')}
                          iconSide="right"
                          linkComponent={getLinkTo(url.href, { useAnchor: true, target: '_blank' })}
                          icon={<JodOpenInNew ariaLabel={t('common:external-link')} />}
                          disabled={expired}
                          testId="share-link-section-preview-button"
                        />
                        {deleteButton}
                      </div>
                    </div>
                  </Accordion>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <Button
        label={t('preferences.share.create-new-link')}
        ariaHaspopup="dialog"
        variant="accent"
        onClick={guardedAction(showModal, NewShareLinkModal)}
        testId="share-link-section-create-button"
      />
    </section>
  );
};

export default ShareLinkSection;

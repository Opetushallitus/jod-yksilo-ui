import { client } from '@/api/client';
import { useModal } from '@/hooks/useModal';
import { formatDate } from '@/utils';
import { getLinkTo } from '@/utils/routeUtils';
import { Accordion, Button, EmptyState, useMediaQueries } from '@jod/design-system';
import { JodOpenInNew } from '@jod/design-system/icons';
import React from 'react';
import toast from 'react-hot-toast/headless';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router';
import type { PreferencesLoaderData } from '../loader';
import { NewShareLinkModal } from './NewShareLinkModal';

interface ShareLinkSectionProps {
  className?: string;
}
const SESSION_STORAGE_KEY = 'openShareLinkAccordions';
const ShareLinkSection = ({ className }: ShareLinkSectionProps) => {
  const { t, i18n } = useTranslation();
  const { showModal, showDialog } = useModal();
  const { sm } = useMediaQueries();
  const { jakolinkit } = useLoaderData<PreferencesLoaderData>();
  const previousJakolinkkiIds = React.useRef<string[]>(jakolinkit.map((j) => j.id!).filter(Boolean));

  // Effect to open accordions for new jakolinkki after revalidation.
  // Without this the newly created link's accordion would be closed.
  React.useEffect(() => {
    const currentIds = jakolinkit.map((j) => j.id!).filter(Boolean);
    const prevIds = previousJakolinkkiIds.current;
    // Find new IDs (created jakolinkki)
    const newIds = currentIds.filter((id) => !prevIds.includes(id));
    if (newIds.length > 0) {
      // eslint-disable-next-line react-hooks/immutability
      setOpenAccordions((prev) => {
        const updated = Array.from(new Set([...prev, ...newIds]));
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    }
    previousJakolinkkiIds.current = currentIds;
  }, [jakolinkit]);

  const deleteLocalJakolinkki = (id: string) => {
    const index = jakolinkit.findIndex((j) => j.id === id);
    if (index > -1) {
      jakolinkit.splice(index, 1);
    }
  };

  const getInitialAccordionStatus = () => {
    const stored = sessionStorage.getItem('openShareLinkAccordions');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed as string[];
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to parse openShareLinkAccordions from sessionStorage', e);
      }
    }

    // If no stored value, open all non-expired links by default
    const defaultValues = jakolinkit
      .filter((link) => !link.voimassaAsti || new Date(link.voimassaAsti) >= new Date())
      .map((linkki) => linkki.id!);

    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(defaultValues));
    return defaultValues;
  };

  const [openAccordions, setOpenAccordions] = React.useState<string[]>(getInitialAccordionStatus());

  const toggleAccordion = React.useCallback((id: string) => {
    setOpenAccordions((prevOpenAccordions) => {
      const newOpenAccordions = prevOpenAccordions.includes(id)
        ? prevOpenAccordions.filter((accordionId) => accordionId !== id)
        : [...prevOpenAccordions, id];
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newOpenAccordions));
      return newOpenAccordions;
    });
  }, []);

  const isAccordionOpen = React.useCallback((id: string) => openAccordions.includes(id), [openAccordions]);

  return (
    <section className={className} data-testid="share-link-section">
      <h2 className="text-heading-2-mobile sm:text-heading-2 mb-3">{t('preferences.share.title')}</h2>
      <p className="font-arial text-body-md mb-5 whitespace-pre-wrap">{t('preferences.share.description')}</p>
      <div className="my-8">
        {jakolinkit.length === 0 ? (
          <EmptyState text={t('preferences.share.no-links')} />
        ) : (
          <ul className="flex flex-col gap-7">
            {jakolinkit.map((linkki) => {
              const url = new URL(`${location.origin}/yksilo/${i18n.language}/cv/${linkki.ulkoinenId}`);
              const date = linkki.voimassaAsti ? new Date(linkki.voimassaAsti) : null;
              const expired = date ? date < new Date() : false;
              const dateStr = date ? formatDate(date, 'medium') : null;
              const expirationText = expired ? (
                <div className="text-button-sm text-alert-text-2">{t('preferences.share.link-has-expired')}</div>
              ) : (
                <div className="text-button-sm">{t('preferences.share.valid-until', { date: dateStr })}</div>
              );

              const copyButton = (
                <Button
                  size="sm"
                  variant="white"
                  className="whitespace-nowrap w-fit"
                  label={t('preferences.share.copy-link')}
                  disabled={expired}
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(url.href);
                      toast.success(t('preferences.share.copy-success'));
                    } catch (err) {
                      // eslint-disable-next-line no-console
                      console.error('Failed to copy to clipboard: ', err);
                      toast.error(t('preferences.share.copy-failure'));
                    }
                  }}
                />
              );

              const deleteButton = (
                <Button
                  size="sm"
                  variant="white-delete"
                  className={`whitespace-nowrap w-fit ${sm && !expired ? 'ml-auto' : ''}`}
                  label={t('preferences.share.delete-link')}
                  onClick={() => {
                    showDialog({
                      title: t('preferences.share.delete-confirm-title'),
                      description: t('preferences.share.delete-confirm-description'),
                      confirmText: t('delete'),
                      onConfirm: async () => {
                        await client.DELETE('/api/profiili/jakolinkki/{id}', {
                          params: { path: { id: linkki.id! } },
                        });
                        deleteLocalJakolinkki(linkki.id!);
                      },
                    });
                  }}
                />
              );

              return (
                <li key={linkki.id} className={`border-l-2 border-border-gray pl-4 py-3 ${sm ? '' : '-ml-3'}`}>
                  <Accordion
                    title={linkki.nimi || url.href}
                    isOpen={isAccordionOpen(linkki.id!)}
                    setIsOpen={() => toggleAccordion(linkki.id!)}
                    collapsedContent={
                      <div className="flex flex-col gap-4">
                        {expirationText}
                        {expired ? deleteButton : copyButton}
                      </div>
                    }
                  >
                    <div className="text-secondary-gray text-body-sm -mt-2 font-arial">{url.href}</div>

                    <div className="flex flex-col gap-4 mt-4">
                      {linkki.muistiinpano && <div className="font-arial">{linkki.muistiinpano}</div>}
                      {expirationText}

                      <div className={`flex gap-4 ${sm ? 'flex-row' : 'flex-wrap'}`}>
                        {copyButton}
                        <Button
                          size="sm"
                          variant="white"
                          className="whitespace-nowrap w-fit"
                          label={t('preferences.share.edit-link')}
                          onClick={() =>
                            showModal(NewShareLinkModal, {
                              id: linkki.id,
                            })
                          }
                        />
                        <Button
                          size="sm"
                          variant="white"
                          className="whitespace-nowrap w-fit"
                          label={t('preferences.share.preview')}
                          iconSide="right"
                          linkComponent={getLinkTo(url, { useAnchor: true, target: '_blank' })}
                          icon={<JodOpenInNew ariaLabel={t('external-link')} />}
                          disabled={expired}
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
        variant="accent"
        onClick={() => showModal(NewShareLinkModal)}
      />
    </section>
  );
};

export default ShareLinkSection;

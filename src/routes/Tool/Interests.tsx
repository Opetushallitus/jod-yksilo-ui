import { client } from '@/api/client';
import { osaamiset as osaamisetService } from '@/api/osaamiset';
import { components } from '@/api/schema';
import {
  HelpingToolLinkItem,
  HelpingToolProfileLinkItem,
  HelpingToolsContent,
  OsaamisSuosittelija,
} from '@/components';
import { OsaaminenLahdeTyyppi } from '@/components/OsaamisSuosittelija/OsaamisSuosittelija';
import { useEnvironment } from '@/hooks/useEnvironment';
import { useToolStore } from '@/stores/useToolStore';
import { removeDuplicates } from '@/utils';
import { Accordion, Button, ConfirmDialog } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdOutlineInterests, MdOutlineQuiz } from 'react-icons/md';
import { useOutletContext, useRouteLoaderData } from 'react-router';
import { generateProfileLink } from '../Profile/utils';
import { ToolLoaderData } from './loader';

const kiinnostuksetOsaamisetApiPath = '/api/profiili/kiinnostukset/osaamiset';

const Interests = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { isDev } = useEnvironment();
  const toolStore = useToolStore();
  const { isLoggedIn } = useOutletContext<ToolLoaderData>();
  const data = useRouteLoaderData('root') as components['schemas']['YksiloCsrfDto'] | null;

  const interestsLink = React.useMemo(
    () => generateProfileLink(['slugs.profile.interests'], data, language, t),
    [data, language, t],
  );

  const importFromProfile = React.useCallback(async () => {
    const { data } = await client.GET(kiinnostuksetOsaamisetApiPath);
    const kiinnostukset = [
      ...(await osaamisetService.find(data)).map((k) => ({
        id: k.uri,
        nimi: k.nimi,
        kuvaus: k.kuvaus,
        tyyppi: 'KIINNOSTUS' as OsaaminenLahdeTyyppi,
      })),
      ...toolStore.kiinnostukset.filter((o) => o.tyyppi === 'KARTOITETTU'),
    ];
    toolStore.setKiinnostukset(removeDuplicates(kiinnostukset, 'id'));
  }, [toolStore]);

  const exportToProfile = React.useCallback(async () => {
    await client.PUT(kiinnostuksetOsaamisetApiPath, {
      body: [
        ...new Set([
          ...((await client.GET(kiinnostuksetOsaamisetApiPath)).data ?? []),
          ...toolStore.kiinnostukset.map((k) => k.id),
        ]),
      ],
    });
    const kiinnostukset = toolStore.kiinnostukset.map((k) => ({
      ...k,
      tyyppi: k.tyyppi === 'KARTOITETTU' ? 'KIINNOSTUS' : k.tyyppi,
    }));
    toolStore.setKiinnostukset(removeDuplicates(kiinnostukset, 'id'));
  }, [toolStore]);

  return (
    <>
      <h2 className="text-heading-2-mobile sm:text-heading-2 mb-3 sm:mb-5">{t('tool.my-own-data.interests.title')}</h2>
      <p className="text-body-md-mobile sm:text-body-md whitespace-pre-wrap mb-6">
        {t('tool.my-own-data.interests.description')}
      </p>
      <div className="mb-6">
        <OsaamisSuosittelija
          onChange={toolStore.setKiinnostukset}
          value={toolStore.kiinnostukset}
          categorized
          mode="kiinnostukset"
          className="!bg-[#F7F7F9]"
        />
      </div>
      <div className="flex flex-wrap gap-5 mb-7">
        <Button
          label={t('tool.my-own-data.interests.import')}
          onClick={() => void importFromProfile()}
          disabled={!isLoggedIn}
        />
        <Button
          label={t('tool.my-own-data.interests.export')}
          onClick={() => void exportToProfile()}
          disabled={!isLoggedIn}
        />
        <ConfirmDialog
          title={t('tool.my-own-data.interests.delete-all.title')}
          onConfirm={() => toolStore.setKiinnostukset([])}
          confirmText={t('delete')}
          cancelText={t('cancel')}
          variant="destructive"
          description={t('tool.my-own-data.interests.delete-all.description')}
        >
          {(showDialog: () => void) => (
            <Button
              variant="gray-delete"
              label={t('tool.my-own-data.interests.delete-all.title')}
              onClick={showDialog}
              disabled={toolStore.kiinnostukset.length === 0}
            />
          )}
        </ConfirmDialog>
      </div>
      <Accordion title={t('tool.tools')} lang={language}>
        <HelpingToolsContent text={t('tool.my-own-data.interests.help-text')}>
          <HelpingToolProfileLinkItem
            profileLink={interestsLink}
            icon={<MdOutlineInterests size={24} color="#006DB3" />}
            title={t('profile.interests.title')}
          />
          {isDev && (
            <HelpingToolLinkItem
              icon={<MdOutlineQuiz size={24} color="#006DB3" />}
              title={t('tool.my-own-data.interests.riasec-test')}
              /* eslint-disable-next-line react/no-unstable-nested-components */
              component={({ children }) => <div className="bg-todo">{children}</div>}
            />
          )}
          {isDev && (
            <HelpingToolLinkItem
              icon={<MdOutlineInterests size={24} color="#AD4298" />}
              title={t('tool.my-own-data.interests.interest-barometer')}
              /* eslint-disable-next-line react/no-unstable-nested-components */
              component={({ children }) => <div className="bg-todo">{children}</div>}
            />
          )}
        </HelpingToolsContent>
      </Accordion>
    </>
  );
};

export default Interests;

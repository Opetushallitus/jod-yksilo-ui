import { client } from '@/api/client';
import { osaamiset as osaamisetService } from '@/api/osaamiset';
import { OsaamisSuosittelija } from '@/components';
import type { OsaaminenLahdeTyyppi } from '@/routes/types';
import { useToolStore } from '@/stores/useToolStore';
import { removeDuplicates } from '@/utils';
import { Button } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router';
import { useShallow } from 'zustand/shallow';
import { ToolLoaderData } from './loader';

const Interests = () => {
  const { t } = useTranslation();
  const { setKiinnostukset, kiinnostukset, setVirtualAssistantOpen } = useToolStore(
    useShallow((state) => ({
      setKiinnostukset: state.setKiinnostukset,
      kiinnostukset: state.kiinnostukset,
      setVirtualAssistantOpen: state.setVirtualAssistantOpen,
    })),
  );
  const { isLoggedIn } = useOutletContext<ToolLoaderData>();

  const importFromProfile = React.useCallback(async () => {
    const { data } = await client.GET('/api/profiili/kiinnostukset/osaamiset');
    const newKiinnostukset = [
      ...(await osaamisetService.find(data?.kiinnostukset)).map((k) => ({
        id: k.uri,
        nimi: k.nimi,
        kuvaus: k.kuvaus,
        tyyppi: 'KIINNOSTUS' as OsaaminenLahdeTyyppi,
      })),
      ...kiinnostukset.filter((o) => o.tyyppi === 'KARTOITETTU'),
    ];
    setKiinnostukset(removeDuplicates(newKiinnostukset, 'id'));
  }, [kiinnostukset, setKiinnostukset]);

  return (
    <div className="pt-6 sm:pt-7 px-5 sm:px-6">
      <div className="mb-6">
        <OsaamisSuosittelija
          onChange={setKiinnostukset}
          value={kiinnostukset}
          mode="kiinnostukset"
          hideSelected
          hideTextAreaLabel
          className="bg-[#F7F7F9]!"
        />
      </div>
      <div className="p-6 -mx-6 bg-bg-gray-2 flex flex-col items-start gap-5 rounded-b">
        <Button
          label={t('tool.my-own-data.interests.conversational-virtual-assistant')}
          variant="white"
          onClick={() => {
            setVirtualAssistantOpen(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => document.getElementById('kiinnostuksetTitle')?.focus(), 0);
          }}
        />
        <Button
          label={t('tool.my-own-data.interests.import')}
          onClick={() => void importFromProfile()}
          disabled={!isLoggedIn}
          variant="white"
        />
      </div>
    </div>
  );
};

export default Interests;

import { client } from '@/api/client';
import { osaamiset as osaamisetService } from '@/api/osaamiset';
import { components } from '@/api/schema';
import { LoaderFunction } from 'react-router-dom';

const loader = (async ({ request, params }) => {
  if (!params.id) {
    throw new Response('Bad request', { status: 400 });
  }

  const { data, error } = await client.GET('/api/koulutusmahdollisuudet/{id}', {
    signal: request.signal,
    params: { path: { id: params.id } },
  });

  // For now, if there is an error or data is undefined, use a mock koulutusmahdollisuus
  const koulutusmahdollisuus: components['schemas']['KoulutusmahdollisuusFullDto'] =
    !error && data
      ? data
      : {
          id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          tyyppi: 'TUTKINTO',
          otsikko: {
            fi: 'Testitutkinto',
          },
          tiivistelma: {
            fi: 'Testitutkinnon tiivistelmä',
          },
          kuvaus: {
            fi: 'Testitutkinnon kuvaus',
          },
          kesto: {
            minimi: 2.0,
            mediaani: 3.0,
            maksimi: 5.0,
          },
          koulutukset: [
            {
              oid: 'string',
              nimi: {
                fi: 'Testikoulutus',
              },
            },
          ],
          jakaumat: {
            osaaminen: {
              maara: 18,
              tyhjia: 0,
              arvot: [
                {
                  arvo: 'http://data.europa.eu/esco/skill/023faef3-0633-436d-8b91-389c45c1421c',
                  osuus: 5.555555555555555,
                },
                {
                  arvo: 'http://data.europa.eu/esco/skill/109ae188-b621-49dd-9c77-cb3f5a3553fe',
                  osuus: 5.555555555555555,
                },
                {
                  arvo: 'http://data.europa.eu/esco/skill/12d7ea6f-ec1f-4f9a-a50b-8e2e9693f068',
                  osuus: 5.555555555555555,
                },
                {
                  arvo: 'http://data.europa.eu/esco/skill/21b298f3-370d-4d9a-8601-ccfa7446446e',
                  osuus: 5.555555555555555,
                },
                {
                  arvo: 'http://data.europa.eu/esco/skill/2dbdd054-896a-4167-8f11-e9b9ebcf199d',
                  osuus: 22.22222222222222,
                },
                {
                  arvo: 'http://data.europa.eu/esco/skill/3727f0d3-da1b-4ce3-a9cb-efe6130fe41f',
                  osuus: 5.555555555555555,
                },
                {
                  arvo: 'http://data.europa.eu/esco/skill/389bd8c7-32c4-4a77-b07c-572fc210d247',
                  osuus: 83.33333333333334,
                },
                {
                  arvo: 'http://data.europa.eu/esco/skill/40fa39b5-0f69-432a-b5ea-b01b5d98649a',
                  osuus: 100,
                },
                {
                  arvo: 'http://data.europa.eu/esco/skill/51754b8a-3e2c-4cc1-86e6-cf510d9c6fe4',
                  osuus: 44.44444444444444,
                },
                {
                  arvo: 'http://data.europa.eu/esco/skill/5483c363-e942-4787-8686-0f29c593357f',
                  osuus: 5.555555555555555,
                },
                {
                  arvo: 'http://data.europa.eu/esco/skill/6ed2fb8d-3580-497f-8a21-30a0ada5caae',
                  osuus: 94.44444444444444,
                },
                {
                  arvo: 'http://data.europa.eu/esco/skill/91c8697e-bb9a-4244-a143-fdabebf53b78',
                  osuus: 50,
                },
                {
                  arvo: 'http://data.europa.eu/esco/skill/b554b1fd-cb47-4a59-8d22-85f9d074a473',
                  osuus: 50,
                },
                {
                  arvo: 'http://data.europa.eu/esco/skill/bbd3ca1b-d283-436b-abba-a4b1a0bc1032',
                  osuus: 44.44444444444444,
                },
                {
                  arvo: 'http://data.europa.eu/esco/skill/bdee730b-9409-4947-ad7a-b67c6da9966e',
                  osuus: 44.44444444444444,
                },
                {
                  arvo: 'http://data.europa.eu/esco/skill/c76375af-5a54-4d21-aac5-fdaa9177a890',
                  osuus: 55.55555555555556,
                },
                {
                  arvo: 'http://data.europa.eu/esco/skill/ccfbdaad-b91d-4bfe-bd0e-d30b33587f19',
                  osuus: 5.555555555555555,
                },
                {
                  arvo: 'http://data.europa.eu/esco/skill/d13f1685-9848-4c9e-a40a-686ddb407858',
                  osuus: 100,
                },
                {
                  arvo: 'http://data.europa.eu/esco/skill/e4698f9f-bb23-486e-a74a-c8f3a19c3132',
                  osuus: 72.22222222222221,
                },
                {
                  arvo: 'http://data.europa.eu/esco/skill/ed8dbdd1-5b40-4eaf-adaf-3b1f6d16a37b',
                  osuus: 66.66666666666666,
                },
                {
                  arvo: 'http://data.europa.eu/esco/skill/f75b740c-b36c-495e-bc67-efe347bbc6b5',
                  osuus: 5.555555555555555,
                },
                {
                  arvo: 'http://data.europa.eu/esco/skill/fafbb75f-ec35-4cc2-996a-20c85ef6c266',
                  osuus: 94.44444444444444,
                },
              ],
            },
          },
        };

  const osaamiset = await osaamisetService.combine(
    koulutusmahdollisuus?.jakaumat?.osaaminen?.arvot,
    (value) => value.arvo,
    (_, osaaminen) => osaaminen,
    request.signal,
  );
  return { koulutusmahdollisuus, osaamiset };
}) satisfies LoaderFunction;

export type LoaderData = Awaited<ReturnType<typeof loader>>;
export default loader;

/* eslint-disable sonarjs/no-clear-text-protocols */

export const userProfile = {
  csrf: {
    token: 'mock-csrf-token',
    headerName: 'X-CSRF-TOKEN',
  },
  etunimi: 'Test',
  sukunimi: 'User',
  tervetuloapolku: true,
  lupaLuovuttaaTiedotUlkopuoliselle: false,
  lupaArkistoida: false,
  lupaKayttaaTekoalynKoulutukseen: false,
};

export const workHistory = [
  {
    id: '726c7a39-f8ec-442a-8701-e88e63b2ac43',
    nimi: {
      fi: 'Testi Oy',
    },
    toimenkuvat: [
      {
        id: '53cde341-7c94-473f-9766-b6bc609fd2b6',
        nimi: {
          fi: 'Testaaja',
        },
        alkuPvm: '2001-01-01',
        osaamiset: [
          'http://data.europa.eu/esco/skill/e286eddc-75e5-4ae3-966b-ec89c1c046ba',
          'http://data.europa.eu/esco/skill/d33b9bd2-6dcb-4abc-b3c2-96b8983d5c97',
          'http://data.europa.eu/esco/skill/41730268-d97a-42dd-b6e0-b117d9432eb5',
        ],
      },
    ],
  },
];

export const workHistoryItem = {
  nimi: {
    fi: 'Testi Oy',
  },
  toimenkuvat: [
    {
      nimi: {
        fi: 'Testaaja',
      },
      alkuPvm: '2001-01-01',
      loppuPvm: '',
      osaamiset: [
        'http://data.europa.eu/esco/skill/d33b9bd2-6dcb-4abc-b3c2-96b8983d5c97',
        'http://data.europa.eu/esco/skill/e286eddc-75e5-4ae3-966b-ec89c1c046ba',
        'http://data.europa.eu/esco/skill/41730268-d97a-42dd-b6e0-b117d9432eb5',
      ],
    },
  ],
};

export const suggestedCompetences = [
  {
    uri: 'http://data.europa.eu/esco/skill/d33b9bd2-6dcb-4abc-b3c2-96b8983d5c97',
    osuvuus: 222.5042600745072,
  },
  {
    uri: 'http://data.europa.eu/esco/skill/e286eddc-75e5-4ae3-966b-ec89c1c046ba',
    osuvuus: 222.5042600745072,
  },
  {
    uri: 'http://data.europa.eu/esco/skill/41730268-d97a-42dd-b6e0-b117d9432eb5',
    osuvuus: 222.5042600745072,
  },
];

export const competences = {
  sisalto: [
    {
      uri: 'http://data.europa.eu/esco/skill/d33b9bd2-6dcb-4abc-b3c2-96b8983d5c97',
      nimi: {
        en: 'assess animal behaviour',
        sv: 'bedöma djurs beteende',
        fi: 'arvioida eläinten käyttäytymistä',
      },
      kuvaus: {
        en: "Observe and evaluate the behaviour of animals in order to work with them safely and recognise deviations from normal behaviour that signal compromised health and welfare.'",
        sv: 'Observera och utvärdera djurens beteende för att arbeta med dem på ett säkert sätt och upptäcka avvikelser från normala beteenden som visar att hälsa och välbefinnande riskeras.',
        fi: 'Tarkkailla ja arvioida eläinten käyttäytymistä, jotta niiden kanssa voidaan työskennellä turvallisesti ja tunnistaa poikkeamat normaalista käyttäytymisestä, joka viittaa terveyden ja hyvinvoinnin heikkenemiseen.',
      },
    },
    {
      uri: 'http://data.europa.eu/esco/skill/e286eddc-75e5-4ae3-966b-ec89c1c046ba',
      nimi: {
        en: 'anatomy of animals',
        sv: 'djurs anatomi',
        fi: 'eläinten anatomia',
      },
      kuvaus: {
        en: 'The study of animal body parts, their structure and dynamic relationships, on a level as demanded by the specific occupation.',
        sv: 'Studien av djurens kroppsdelar, deras struktur och dynamiska förhållanden, på en nivå som krävs för den specifika placeringen.',
        fi: 'Eläinten ruumiinosien, niiden rakenteen ja dynaamisten suhteiden tutkiminen sillä tasolla, jota kukin ammatti vaatii.',
      },
    },
    {
      uri: 'http://data.europa.eu/esco/skill/41730268-d97a-42dd-b6e0-b117d9432eb5',
      nimi: {
        en: 'provide an enriching environment for animals',
        sv: 'tillhandahålla en berikande miljö för djur',
        fi: 'tarjota eläimille virikkeellinen ympäristö',
      },
      kuvaus: {
        en: "Provide an enriching environment for animals to allow the expression of natural behaviour, and including adjusting environmental conditions, delivering feeding and puzzle exercises, and implementing manipulation, social, and training activities.'",
        sv: 'Tillhandahålla en berikande miljö för djur där de får ge uttryck för sitt naturliga beteende, inbegripet anpassning av miljöförhållanden, tillhandahållande av utfodring och problemlösningsövningar, samt genomförande av skötselaktiviteter, sociala aktiviteter och träningsaktiviteter.',
        fi: 'Tarjota eläimille virikkeellinen ympäristö, jossa ne voivat käyttäytyä luonnollisesti, mukaan lukien ympäristöolojen mukauttaminen, ruokinta, aktivointiharjoitukset, käsittely, sosiaalinen ja muu koulutus.',
      },
    },
  ],
  maara: 3,
  sivuja: 1,
};

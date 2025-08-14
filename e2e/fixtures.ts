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

export const freetimeActivities = [
  {
    id: 'afb867d5-f0f1-451b-bc21-b6729eb534ea',
    nimi: {
      fi: 'Testaaminen',
    },
    patevyydet: [
      {
        id: 'f873c947-9531-4249-9c4c-fd57faec6d92',
        nimi: {
          fi: 'Uima-altaan testaus',
        },
        alkuPvm: '2025-07-01',
        loppuPvm: '2025-07-31',
        osaamiset: [
          'http://data.europa.eu/esco/skill/9926889a-7074-4e37-acce-1271fe6c5a6f',
          'http://data.europa.eu/esco/skill/eb0d83b2-3aa4-4a36-a60a-99b6746429e2',
          'http://data.europa.eu/esco/skill/e93acbe5-535a-4927-9e7c-3b2e06ddfee8',
        ],
      },
    ],
  },
];

export const freetimeActivityItem = {
  nimi: { fi: 'Testaaminen' },
  patevyydet: [
    {
      nimi: { fi: 'Uima-altaan testaus' },
      alkuPvm: '2001-07-01',
      loppuPvm: '2001-07-30',
      osaamiset: [
        'http://data.europa.eu/esco/skill/eb0d83b2-3aa4-4a36-a60a-99b6746429e2',
        'http://data.europa.eu/esco/skill/9926889a-7074-4e37-acce-1271fe6c5a6f',
        'http://data.europa.eu/esco/skill/e93acbe5-535a-4927-9e7c-3b2e06ddfee8',
      ],
    },
  ],
};

export const suggestedFreetimeCompetences = [
  {
    uri: 'http://data.europa.eu/esco/skill/eb0d83b2-3aa4-4a36-a60a-99b6746429e2',
    osuvuus: 222.5042600745072,
  },
  {
    uri: 'http://data.europa.eu/esco/skill/9926889a-7074-4e37-acce-1271fe6c5a6f',
    osuvuus: 222.5042600745072,
  },
  {
    uri: 'http://data.europa.eu/esco/skill/e93acbe5-535a-4927-9e7c-3b2e06ddfee8',
    osuvuus: 222.5042600745072,
  },
];

export const freetimeCompetences = {
  sisalto: [
    {
      uri: 'http://data.europa.eu/esco/skill/eb0d83b2-3aa4-4a36-a60a-99b6746429e2',
      nimi: {
        sv: 'simma',
        en: 'swim',
        fi: 'uida',
      },
      kuvaus: {
        sv: 'Förflytta sig genom vatten med hjälp av armar och ben.',
        en: 'Move through water by means of the limbs.',
        fi: 'Liikkua vedessä raajojen avulla.',
      },
    },
    {
      uri: 'http://data.europa.eu/esco/skill/9926889a-7074-4e37-acce-1271fe6c5a6f',
      nimi: {
        sv: 'överleva på havet om fartyget överges',
        en: 'survive at sea in the event of ship abandonment',
        fi: 'selviytyä merellä tilanteessa, jossa laiva joudutaan jättämään',
      },
      kuvaus: {
        sv: 'Identifiera samlingssignaler och vilka nödsituationer de signalerar. Följa fastställda förfaranden. Ta på och använd en flytväst eller en räddningsdräkt. Hoppa säkert i vattnet från en höjd. Simma och ställ i ordning en livflotte medan du bär flytväst. Håll dig flytande utan flytväst. Ta dig ombord på en livflotte från fartyget, eller från vattnet när du använder flytväst. Vidta inledande åtgärder för att gå ombord på livflotte för att öka möjligheten för överlevnad. Släpp ut en boj eller ett drivankare. Hantera livräddningsutrustning. Använd lokaliseringsutrustning, inklusive radioutrustning.',
        en: 'Identify muster signals and what emergencies they signal. Comply with established procedures. Don and use a lifejacket or an immersion suit. Safely jump into the water from a height. Swim and right an inverted liferaft while wearing a swim while wearing a lifejacket. Keep afloat without a lifejacket. Board a survival craft from the ship, or from the water while wearing a lifejacket. Take initial actions on boarding survival craft to enhance chance of survival. Stream a drogue or sea-anchor. Operate survival craft equipment. Operate location devices, including radio equipment.',
        fi: 'Tunnistaa hälytysmerkit ja minkälaisesta hädästä ne kertovat. Noudattaa menettelyjä. Käyttää pelastusliiviä tai pelastuspukua. Hypätä veteen turvallisesti myös korkealta. Suoristaa ylösalaisin oleva pelastuslautta pelastusliiveissä ja uida pelastusliivi päällä. Pysyä veden pinnalla ilman pelastusliiviä. Nousta pelastusveneeseen aluksella tai vedestä pelastusliiveissä. Ryhtyä nopeasti toimiin pelastusveneisiin ja -lauttoihin siirtymisessä pelastumismahdollisuuksien parantamiseksi. Käyttää pelastusvarjoa tai laahusankkuria. Käyttää pelastusveneiden laitteita. Käyttää paikannus- ja radiolaitteita.',
      },
    },
    {
      uri: 'http://data.europa.eu/esco/skill/e93acbe5-535a-4927-9e7c-3b2e06ddfee8',
      nimi: {
        sv: 'globala nödsignals- och säkerhetssystemet till sjöss',
        en: 'Global Maritime Distress and Safety System',
        fi: 'maailmanlaajuinen merihätä- ja turvallisuusjärjestelmä',
      },
      kuvaus: {
        sv: 'Den internationellt överenskomna uppsättningen säkerhetsförfaranden, typer av utrustning och kommunikationsprotokoll som används för att öka säkerheten och göra det lättare att rädda nödställda fartyg, båtar och flygplan.',
        en: 'The internationally agreed-upon set of safety procedures, types of equipment and communication protocols used to increase safety and make it easier to rescue distressed ships, boats and aircraft.',
        fi: 'Kansainvälisesti sovitut turvallisuusmenettelyt, laitetyypit ja viestintäprotokollat, joilla parannetaan turvallisuutta ja helpotetaan merihädässä olevien alusten, veneiden ja ilma-alusten pelastamista.',
      },
    },
  ],
  maara: 3,
  sivuja: 1,
};

export const suggestedEducationCompetences = [
  {
    uri: 'http://data.europa.eu/esco/skill/edff6d20-660d-4d33-b412-9a5b664a14be',
    osuvuus: 4630.724841015558,
  },
  {
    uri: 'http://data.europa.eu/esco/skill/31b67516-af16-4b97-8430-a8a8e0f84190',
    osuvuus: 4524.559580893479,
  },
  {
    uri: 'http://data.europa.eu/esco/skill/7ee872de-db39-4ae3-8e19-75d1a2cdf697',
    osuvuus: 4461.145169957676,
  },
];

export const educationCompetences = {
  sisalto: [
    {
      uri: 'http://data.europa.eu/esco/skill/edff6d20-660d-4d33-b412-9a5b664a14be',
      nimi: {
        en: 'curriculum objectives',
        sv: 'mål i läroplanen',
        fi: 'opetussuunnitelman tavoitteet',
      },
      kuvaus: {
        en: 'The goals identified in curricula and defined learning outcomes.',
        sv: 'De mål som fastställs i läroplanerna och de fastställda läranderesultaten.',
        fi: 'Opetussuunnitelmissa ja oppimistavoitteissa määritetyt tavoitteet.',
      },
    },
    {
      uri: 'http://data.europa.eu/esco/skill/31b67516-af16-4b97-8430-a8a8e0f84190',
      nimi: {
        en: 'assessment processes',
        sv: 'bedömningsprocesser',
        fi: 'arviointiprosessit',
      },
      kuvaus: {
        en: 'Various evaluation techniques, theories, and tools applicable in the assessment of students, participants in a programme, and employees. Different assessment strategies such as initial, formative, summative and self- assessment are used for varying purposes.',
        sv: 'Olika utvärderingstekniker, teorier och verktyg för bedömning av elever, deltagare i ett program och anställda. Olika bedömningsstrategier som inledande, formativa och sammanfattande bedömningar samt självutvärderingar används för olika ändamål.',
        fi: 'Erilaiset arviointitekniikat, -teoriat ja -välineet opiskelijoiden, ohjelmaan osallistujien ja työntekijöiden arvioinnissa. Eri tarkoituksiin käytetään erilaisia arviointistrategioita, kuten alustavaa, muovaavaa ja yhteenvedonomaista arviointia sekä itsearviointia.',
      },
    },
    {
      uri: 'http://data.europa.eu/esco/skill/7ee872de-db39-4ae3-8e19-75d1a2cdf697',
      nimi: {
        en: 'develop learning curriculum',
        sv: 'utveckla läroplaner',
        fi: 'kehittää opetusohjelma',
      },
      kuvaus: {
        en: 'Develop and plan the learning goals and outcomes for education institutions, as well as the required teaching methods and potential education resources. Organise content, form, methods and technologies for delivery of study experiences.',
        sv: 'Utveckla och planera inlärningsmål och läranderesultat för utbildningsanstalter samt de undervisningsmetoder och potentiella utbildningsresurser som krävs. Organisera innehåll, form, metoder och teknik för att tillhandahålla studier.\n\t',
        fi: 'Kehittää ja suunnitella oppilaitosten opetustavoitteita ja -tuloksia sekä tarvittavia opetusmenetelmiä ja -resursseja. Järjestää sisältö, muoto, menetelmät ja tekniikat opintokokemusten tarjoamiseksi.\n\t',
      },
    },
  ],
  maara: 31,
  sivuja: 1,
};

export const educationHistoryItem = {
  nimi: { fi: 'Iso Opisto' },
  koulutukset: [
    {
      nimi: { fi: 'Oppilas' },
      alkuPvm: '2001-01-01',
      loppuPvm: '',
      osaamiset: [
        'http://data.europa.eu/esco/skill/edff6d20-660d-4d33-b412-9a5b664a14be',
        'http://data.europa.eu/esco/skill/31b67516-af16-4b97-8430-a8a8e0f84190',
        'http://data.europa.eu/esco/skill/7ee872de-db39-4ae3-8e19-75d1a2cdf697',
      ],
    },
  ],
};

export const educationHistory = [
  {
    id: '4c2c9aed-2125-4e17-8612-0c325c131954',
    nimi: {
      fi: 'Iso Opisto',
    },
    koulutukset: [
      {
        id: 'dc6d5886-6326-4b80-84d1-a135491136fc',
        nimi: {
          fi: 'Oppilas',
        },
        alkuPvm: '2001-01-01',
        osaamiset: [
          'http://data.europa.eu/esco/skill/31b67516-af16-4b97-8430-a8a8e0f84190',
          'http://data.europa.eu/esco/skill/7ee872de-db39-4ae3-8e19-75d1a2cdf697',
          'http://data.europa.eu/esco/skill/edff6d20-660d-4d33-b412-9a5b664a14be',
        ],
      },
    ],
  },
];

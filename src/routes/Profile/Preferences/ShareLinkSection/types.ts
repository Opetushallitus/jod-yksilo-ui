export interface ShareLinkForm {
  id?: string;
  nimi?: string;
  muistiinpano?: string;
  voimassaAsti: string;

  nimiJaettu?: boolean;
  emailJaettu?: boolean;
  kotikuntaJaettu?: boolean;
  syntymavuosiJaettu?: boolean;

  jaetutTyopaikat: { itemId: string }[]; // ItemId = Tyopaikka ID
  jaetutKoulutukset: { itemId: string }[]; // ItemId = Koulutus ID
  jaetutToiminnot: { itemId: string }[]; // ItemId = Toiminto ID
  jaetutSuosikit: { itemId: string }[]; // ItemId = MahdollisuusTyyppi
  jaetutTavoitteet: { itemId: string }[]; // ItemId = Tavoite ID

  muuOsaaminenJaettu?: boolean;
  kiinnostuksetJaettu?: boolean;
}

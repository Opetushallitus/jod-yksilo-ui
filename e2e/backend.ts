import type { Page, Request, Route } from '@playwright/test';

import type { components } from '../src/api/schema';
import type { OpintopolkuKoulutusResponse } from '../src/utils/opintopolku';
import {
  ammatit,
  ammattiryhmat,
  hakusanat,
  type Koulutusmahdollisuus,
  koulutusmahdollisuudet,
  opintopolkuKoulutukset,
  osaamiset,
  type Tyomahdollisuus,
  tyomahdollisuudet,
} from './catalog';

type Schemas = components['schemas'];

const EMPTY_IMAGE = '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>';

export const testUser = { etunimi: 'Testi', sukunimi: 'Yksilö' };

export const defaultFeatures: Record<string, boolean> = {
  VIRTUAALIOHJAAJA: true,
  VIRTUAALIOHJAAJA_OSAAMISET: true,
  TMT_INTEGRATION: true,
  KOSKI: true,
  JAKOLINKKI: true,
  MAHDOLLISUUDET_HAKU: true,
  CV_IMPORT: true,
  MPASSID: true,
  SAMANKALTAISET_MAHDOLLISUUDET: true,
  TOIMIALA_TOL2025: false,
};

const json = (route: Route, body: unknown, status = 200) =>
  route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

interface Reply {
  status: number;
  body?: unknown;
}

const ok = (body: unknown, status = 200): Reply => ({ status, body });

const sivu = <T>(items: T[]) => ({ sisalto: items, maara: items.length, sivuja: items.length > 0 ? 1 : 0 });

/** The fake recognition of competences and interests in a text: the competences of the search words it contains. */
const recognize = (teksti: Schemas['LokalisoituTeksti']) => {
  const text = Object.values(teksti).join(' ').toLowerCase();
  return [...new Set(Object.entries(hakusanat).flatMap(([sana, uris]) => (text.includes(sana) ? uris : [])))];
};

let idCounter = 0;
const nextId = () => `00000000-0000-4000-8000-${String(++idCounter).padStart(12, '0')}`;

/** A work place, an education or a free time theme. */
type Kokonaisuus = Schemas['TyopaikkaDto'] & Partial<Schemas['KoulutusKokonaisuusDto'] & Schemas['TeemaDto']>;
/** A job, a degree or an activity within a `Kokonaisuus`. */
type Kohde = Schemas['ToimenkuvaDto'] | Schemas['KoulutusDto'] | Schemas['ToimintoDto'];

interface Collection {
  path: string;
  key: 'tyopaikat' | 'koulutuskokonaisuudet' | 'teemat';
  child: 'toimenkuvat' | 'koulutukset' | 'toiminnot';
  lahde: Schemas['OsaamisenLahdeDto']['tyyppi'];
}

const collections: Collection[] = [
  { path: 'tyopaikat', key: 'tyopaikat', child: 'toimenkuvat', lahde: 'TOIMENKUVA' },
  { path: 'koulutuskokonaisuudet', key: 'koulutuskokonaisuudet', child: 'koulutukset', lahde: 'KOULUTUS' },
  { path: 'vapaa-ajan-teemat', key: 'teemat', child: 'toiminnot', lahde: 'TOIMINTO' },
];

/**
 * In-memory stand-in for the Yksilö backend.
 *
 * Every request to the backend is answered from this state, so the tests never reach a real service. Requests that
 * are not implemented here fail with 501 and are collected in `unhandledRequests`; the test fixture fails the test if
 * any were made, so that new API calls are noticed instead of silently hitting the network.
 */
export class FakeBackend {
  /** The signed-in user, or null for an anonymous session. */
  user: Schemas['YksiloCsrfDto'] | null = null;
  /** Personal details and consents of the signed-in user (`/api/profiili/yksilo/tiedot-ja-luvat`). */
  tiedot: Schemas['YksiloDto'] = {};
  features: Record<string, boolean> = { ...defaultFeatures };
  tyopaikat: Schemas['TyopaikkaDto'][] = [];
  koulutuskokonaisuudet: Schemas['KoulutusKokonaisuusDto'][] = [];
  teemat: Schemas['TeemaDto'][] = [];
  muuOsaaminen: Schemas['MuuOsaaminenDto'] = { muuOsaaminen: [] };
  kiinnostukset: Schemas['KiinnostuksetDto'] = { kiinnostukset: [] };
  suosikit: Schemas['SuosikkiDto'][] = [];
  tavoitteet: Schemas['TavoiteDto'][] = [];
  jakolinkit: Schemas['JakolinkkiUpdateDto'][] = [];
  /** Number of profile downloads (`GET /api/profiili/yksilo/vienti`). */
  exportCount = 0;
  /** ESCO competences known to the backend. */
  osaamiset: Schemas['OsaaminenDto'][] = structuredClone(osaamiset);
  /** ESCO occupations known to the backend. */
  ammatit: Schemas['AmmattiDto'][] = structuredClone([...ammatit, ...ammattiryhmat]);
  tyomahdollisuudet: Tyomahdollisuus[] = structuredClone(tyomahdollisuudet);
  koulutusmahdollisuudet: Koulutusmahdollisuus[] = structuredClone(koulutusmahdollisuudet);
  /** Education offers in Opintopolku (`/konfo-backend/external/koulutus/{oid}`). */
  opintopolkuKoulutukset: OpintopolkuKoulutusResponse[] = structuredClone(opintopolkuKoulutukset);
  /** Conversations with the virtual assistant (`/api/keskustelut`), the user's messages in order. */
  readonly keskustelut: { id: string; tila: Schemas['UusiKeskustelu']['tila']; viestit: string[] }[] = [];
  /** Bodies of the opportunity suggestion requests (`POST /api/ehdotus/mahdollisuudet`). */
  readonly ehdotusRequests: Schemas['LuoEhdotusDto'][] = [];
  /** Login redirects (`/yksilo/login`) made by the browser. */
  readonly loginRequests: URL[] = [];
  /** Form fields of logout submissions (`POST /yksilo/logout`). */
  readonly logoutRequests: Record<string, string>[] = [];
  readonly unhandledRequests: string[] = [];

  /** Deletes the profile like the backend does when the user deletes it; the next login is a first login. */
  deleteProfile() {
    this.tiedot = { tervetuloapolku: false };
    this.tyopaikat = [];
    this.koulutuskokonaisuudet = [];
    this.teemat = [];
    this.muuOsaaminen = { muuOsaaminen: [] };
    this.kiinnostukset = { kiinnostukset: [] };
    this.suosikit = [];
    this.tavoitteet = [];
    this.jakolinkit = [];
  }

  /** Signs in a user who has already gone through the welcome path, unless `tervetuloapolku: false` is given. */
  signIn(user: Partial<Schemas['YksiloCsrfDto']> = {}) {
    this.user = {
      ...testUser,
      tervetuloapolku: true,
      toiminnot: ['PROFILE'],
      csrf: { token: 'test-csrf-token', headerName: 'X-CSRF-TOKEN', parameterName: '_csrf' },
      ...user,
    };
    this.tiedot = { tervetuloapolku: this.user.tervetuloapolku, ...this.tiedot };
  }

  async install(page: Page) {
    // Keep the tests hermetic: nothing outside the UI's own origin is loaded.
    await page.route(
      (url) => url.hostname !== 'localhost',
      (route) => route.abort('blockedbyclient'),
    );
    // Everything else on the UI's origin that is not part of the UI itself is answered here or rejected, also the
    // paths that the Vite server would proxy to other services.
    await page.route(
      (url) =>
        url.hostname === 'localhost' &&
        (!url.pathname.startsWith('/yksilo/') || url.pathname.startsWith('/yksilo/api/')),
      (route) => this.handle(route),
    );
    await page.route(
      (url) => url.pathname === '/yksilo/login' || url.pathname === '/yksilo/logout',
      (route) => this.handleAuth(route),
    );
    await page.route('**/yksilo/config/features.json', (route) => json(route, this.features));
    await page.route('**/yksilo/config/notifications.json', (route) => json(route, []));
  }

  private unhandled(route: Route, request: Request) {
    this.unhandledRequests.push(`${request.method()} ${request.url()}`);
    return route.fulfill({ status: 501, body: 'Not mocked in e2e/backend.ts' });
  }

  /** Stands in for the Suomi.fi login and the logout of the backend: both end in a redirect back to the UI. */
  private async handleAuth(route: Route) {
    const request = route.request();
    const url = new URL(request.url());
    // A 302 cannot be fulfilled in WebKit, so the redirect is done with an HTML page instead.
    const redirect = (location: string) =>
      route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `<!doctype html><meta http-equiv="refresh" content="0;url=${location}">`,
      });

    if (url.pathname === '/yksilo/login') {
      this.loginRequests.push(url);
      this.signIn({ tervetuloapolku: this.tiedot.tervetuloapolku ?? true });
      const callback = url.searchParams.get('callback');
      return redirect(callback?.startsWith('/') ? `/yksilo${callback}` : '/yksilo/fi');
    }
    const form = Object.fromEntries(new URLSearchParams(request.postData() ?? ''));
    this.logoutRequests.push(form);
    this.user = null;
    if (form.deletion === 'true') {
      this.deleteProfile();
    }
    return redirect(`/yksilo/${form.lang ?? 'fi'}`);
  }

  private async handle(route: Route) {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace(/^\/yksilo/, '');
    const method = request.method();

    // Translations are bundled; a missing translation origin makes the app use them.
    if (path.startsWith('/i18n/')) {
      return route.fulfill({ status: 404 });
    }
    if (/^\/(favicon[^/]*|apple-touch-icon\.png|safari-pinned-tab\.svg)$/.test(path)) {
      return route.fulfill({ status: 200, contentType: 'image/svg+xml', body: EMPTY_IMAGE });
    }
    if (/^\/manifest-\w+\.json$/.test(path)) {
      return json(route, {});
    }
    if (path === '/api/profiili/yksilo' && method === 'GET') {
      return this.user ? json(route, this.user) : route.fulfill({ status: 401 });
    }

    const reply = path.startsWith('/api/profiili/')
      ? this.user
        ? this.handleProfile(method, path.slice('/api/profiili/'.length).split('/'), url.searchParams, request)
        : { status: 403 }
      : this.handlePublic(method, path, url.searchParams, request);
    if (!reply) {
      return this.unhandled(route, request);
    }
    return reply.body === undefined ? route.fulfill({ status: reply.status }) : json(route, reply.body, reply.status);
  }

  /** The public API, which is available also without a session. */
  private handlePublic(method: string, path: string, query: URLSearchParams, request: Request): Reply | undefined {
    if (method === 'POST' && path === '/api/ehdotus/osaamiset') {
      const uris = recognize(request.postDataJSON() as Schemas['LokalisoituTeksti']);
      return ok(uris.map((uri, i) => ({ uri, osuvuus: 1 - i / 100 })) satisfies Schemas['Ehdotus'][]);
    }
    // The virtual assistant suggests the competences or interests that its fake recognition finds in a message.
    if (method === 'POST' && path === '/api/keskustelut') {
      const { tila, viesti } = request.postDataJSON() as Schemas['UusiKeskustelu'];
      const keskustelu = { id: nextId(), tila, viestit: Object.values(viesti) };
      this.keskustelut.push(keskustelu);
      return ok({
        id: keskustelu.id,
        vastaus: 'Kerro lisää.',
        ehdotukset: recognize(viesti),
      } satisfies Schemas['Keskustelu']);
    }
    const keskusteluId = /^\/api\/keskustelut\/([^/]+)$/.exec(path)?.[1];
    const keskustelu = this.keskustelut.find((k) => k.id === keskusteluId);
    if (method === 'POST' && keskustelu) {
      const viesti = request.postDataJSON() as Schemas['LokalisoituTeksti'];
      keskustelu.viestit.push(...Object.values(viesti));
      return ok({ vastaus: 'Kerro lisää.', ehdotukset: recognize(viesti) } satisfies Schemas['Vastaus']);
    }
    if (method === 'POST' && path === '/api/ehdotus/mahdollisuudet') {
      const ehdotus = request.postDataJSON() as Schemas['LuoEhdotusDto'];
      this.ehdotusRequests.push(ehdotus);
      return ok(this.mahdollisuusEhdotukset(ehdotus));
    }
    if (method === 'GET' && path === '/api/mahdollisuudet/haku') {
      const teksti = (query.get('teksti') ?? '').toLowerCase();
      const kieli = (query.get('kieli') ?? 'fi') as keyof Schemas['LokalisoituTeksti'];
      return ok(
        [...this.tyomahdollisuudet, ...this.koulutusmahdollisuudet]
          .filter((m) => m.dto.otsikko[kieli]?.toLowerCase().includes(teksti))
          .map((m): Schemas['MahdollisuusDto'] => ({
            id: m.dto.id,
            tyyppi: m.meta.tyyppi,
            ammattiryhma: m.meta.ammattiryhma,
            aineisto: m.meta.aineisto,
            koulutusTyyppi: m.meta.koulutusmahdollisuusTyyppi,
            maakunnat: m.meta.maakunnat,
            kesto: m.meta.kesto,
            kestoMinimi: m.meta.kestoMinimi,
            kestoMaksimi: m.meta.kestoMaksimi,
          })),
      );
    }
    const samankaltaiset = /^\/api\/(?:tyomahdollisuudet|koulutusmahdollisuudet)\/([^/]+)\/samankaltaiset$/.exec(path);
    if (method === 'GET' && samankaltaiset) {
      const tyyppi = query.get('tyyppi') ?? 'TYOMAHDOLLISUUS';
      const items = tyyppi === 'TYOMAHDOLLISUUS' ? this.tyomahdollisuudet : this.koulutusmahdollisuudet;
      return ok(
        items
          .filter((m) => m.dto.id !== samankaltaiset[1])
          .map((m) => ({ id: m.dto.id, otsikko: m.dto.otsikko }) satisfies Schemas['SamankaltainenMahdollisuusDto']),
      );
    }
    // Opintopolku's public API, which the Vite server proxies; used for the open education offers.
    const konfoOid = /^\/konfo-backend\/external\/koulutus\/([^/]+)$/.exec(path)?.[1];
    if (method === 'GET' && konfoOid) {
      const koulutus = this.opintopolkuKoulutukset.find((k) => k.oid === konfoOid);
      return koulutus ? ok(koulutus) : { status: 404 };
    }
    // Education that gives the missing competences of a goal.
    if (method === 'POST' && path === '/api/ehdotus/mahdollisuudet/polku') {
      const missing = request.postDataJSON() as string[];
      return ok(
        this.koulutusmahdollisuudet
          .filter((m) => m.osaamiset.some((uri) => missing.includes(uri)))
          .map((m, i) => ({
            mahdollisuusId: m.dto.id,
            ehdotusMetadata: { ...m.meta, aakkosIndeksi: i, pisteet: 1 },
          })),
      );
    }
    const mahdollisuus = /^\/api\/(tyomahdollisuudet|koulutusmahdollisuudet)(?:\/([^/]+))?$/.exec(path);
    if (method === 'GET' && mahdollisuus) {
      const [, tyyppi, id] = mahdollisuus;
      const items = (tyyppi === 'tyomahdollisuudet' ? this.tyomahdollisuudet : this.koulutusmahdollisuudet).map(
        (m) => m.dto,
      );
      if (id === undefined || id === 'full') {
        const ids = query.getAll('id');
        // The list endpoint returns the basic fields, which are a subset of the full ones. The catalog fits in a page.
        return ok(sivu(ids.length > 0 ? ids.flatMap((i) => items.filter((m) => m.id === i)) : items));
      }
      const item = items.find((m) => m.id === id);
      return item ? ok(item) : { status: 404 };
    }
    const cvToken = /^\/api\/cv\/([^/]+)$/.exec(path)?.[1];
    if (method === 'GET' && cvToken) {
      const jakolinkki = this.jakolinkit.find((j) => j.ulkoinenId === cvToken);
      return jakolinkki && new Date(jakolinkki.voimassaAsti) > new Date()
        ? ok(this.jaettuSisalto(jakolinkki))
        : { status: 404 };
    }
    if (method === 'GET' && path === '/api/osaamiset') {
      return ok(sivu(this.osaamiset.filter((o) => query.getAll('uri').includes(o.uri))));
    }
    if (method === 'GET' && path === '/api/ammatit') {
      return ok(sivu(this.ammatit.filter((a) => query.getAll('uri').includes(a.uri))));
    }
    return undefined;
  }

  /** The signed-in user's profile under /api/profiili, `segments` being the path after it. */
  private handleProfile(
    method: string,
    segments: string[],
    query: URLSearchParams,
    request: Request,
  ): Reply | undefined {
    const user = this.user!;
    const body = request.postDataJSON() as unknown;
    const [resource, id, childResource, childId] = segments;
    const route = `${method} ${
      segments.length > 1
        ? `${resource}/${segments
            .slice(1)
            .map((s, i) => (i % 2 === 0 ? ':id' : s))
            .join('/')}`
        : resource
    }`;

    const collection = collections.find((c) => c.path === resource);
    if (collection && (!childResource || childResource === collection.child)) {
      return this.handleCollection(collection, method, id, childId, body, childResource !== undefined);
    }

    switch (route) {
      case 'GET yksilo/:id':
        if (id === 'tiedot-ja-luvat') {
          return ok(this.tiedot);
        }
        if (id === 'vienti') {
          this.exportCount++;
          return ok({
            ...this.tiedot,
            tyopaikat: this.tyopaikat,
            koulutusKokonaisuudet: this.koulutuskokonaisuudet,
            teemat: this.teemat,
            muuOsaaminen: this.muuOsaaminen,
            kiinnostukset: this.kiinnostukset,
          } as Schemas['YksiloExportDto']);
        }
        break;
      case 'PUT yksilo/:id':
        if (id === 'tiedot-ja-luvat') {
          this.tiedot = body as Schemas['YksiloDto'];
          user.tervetuloapolku = this.tiedot.tervetuloapolku;
          return { status: 200 };
        }
        break;
      case 'GET osaamiset':
        return ok(this.yksilonOsaamiset(query.get('tyyppi'), query.get('lahdeId')));
      case 'DELETE osaamiset':
        this.deleteOsaamiset(query.getAll('ids'));
        return { status: 204 };
      case 'DELETE osaamiset/:id':
        this.deleteOsaamiset([id]);
        return { status: 204 };
      case 'GET muu-osaaminen':
        return ok(this.muuOsaaminen);
      case 'PUT muu-osaaminen':
        this.muuOsaaminen.muuOsaaminen = body as string[];
        return { status: 204 };
      case 'PUT muu-osaaminen/:id':
        if (id === 'vapaateksti') {
          this.muuOsaaminen.vapaateksti = body as Schemas['LokalisoituTeksti'];
          return { status: 204 };
        }
        break;
      case 'GET kiinnostukset/:id':
        if (id === 'osaamiset') {
          return ok(this.kiinnostukset);
        }
        break;
      case 'PUT kiinnostukset/:id':
        if (id === 'osaamiset') {
          this.kiinnostukset.kiinnostukset = body as string[];
          return { status: 204 };
        }
        if (id === 'vapaateksti') {
          this.kiinnostukset.vapaateksti = body as Schemas['LokalisoituTeksti'];
          return { status: 204 };
        }
        break;
      case 'GET suosikit': {
        const tyyppi = query.get('tyyppi');
        return ok(this.suosikit.filter((s) => !tyyppi || s.tyyppi === tyyppi));
      }
      case 'POST suosikit': {
        const suosikki = body as Schemas['SuosikkiDto'];
        const existing = this.suosikit.find((s) => s.kohdeId === suosikki.kohdeId && s.tyyppi === suosikki.tyyppi);
        if (existing) {
          return ok(existing.id);
        }
        const added = { ...suosikki, id: nextId(), luotu: new Date().toISOString() };
        this.suosikit.push(added);
        return ok(added.id);
      }
      case 'DELETE suosikit':
        this.suosikit = this.suosikit.filter((s) => s.id !== query.get('id'));
        return { status: 204 };
      case 'GET tavoitteet':
        return ok(this.tavoitteet);
      case 'POST tavoitteet': {
        const tavoite = {
          ...(body as Schemas['TavoiteDto']),
          id: nextId(),
          luotu: new Date().toISOString(),
          suunnitelmat: [],
        };
        this.tavoitteet.push(tavoite);
        return ok(tavoite.id, 201);
      }
      case 'PUT tavoitteet/:id':
      case 'DELETE tavoitteet/:id':
      case 'POST tavoitteet/:id/suunnitelmat':
      case 'GET tavoitteet/:id/suunnitelmat/:id':
      case 'PUT tavoitteet/:id/suunnitelmat/:id':
      case 'DELETE tavoitteet/:id/suunnitelmat/:id':
        return this.handleTavoite(method, id, childResource ? childId : undefined, body);
      case 'GET jakolinkki':
        return ok(this.jakolinkit);
      case 'POST jakolinkki':
        this.jakolinkit.push({ ...(body as Schemas['JakolinkkiUpdateDto']), id: nextId(), ulkoinenId: nextId() });
        return { status: 200 };
      case 'PATCH jakolinkki': {
        const update = body as Schemas['JakolinkkiUpdateDto'];
        const index = this.jakolinkit.findIndex((j) => j.id === update.id);
        if (index === -1) {
          return { status: 404 };
        }
        this.jakolinkit[index] = { ...update, ulkoinenId: this.jakolinkit[index].ulkoinenId };
        return { status: 200 };
      }
      case 'GET jakolinkki/:id': {
        const jakolinkki = this.jakolinkit.find((j) => j.id === id);
        return jakolinkki ? ok(jakolinkki) : { status: 404 };
      }
      case 'DELETE jakolinkki/:id':
        this.jakolinkit = this.jakolinkit.filter((j) => j.id !== id);
        return { status: 200 };
    }
    return undefined;
  }

  private handleTavoite(method: string, id: string, suunnitelmaId: string | undefined, body: unknown): Reply {
    const tavoite = this.tavoitteet.find((t) => t.id === id);
    if (!tavoite) {
      return { status: 404 };
    }
    // `suunnitelmat` is read-only in the API, so the fake keeps the plans in it directly.
    const suunnitelmat = tavoite.suunnitelmat as Schemas['PolunSuunnitelmaYhteenvetoDto'][];
    if (method === 'PUT' && suunnitelmaId === undefined) {
      Object.assign(tavoite, body as Schemas['TavoiteDto'], { id, suunnitelmat });
      return { status: 204 };
    }
    if (method === 'DELETE' && suunnitelmaId === undefined) {
      this.tavoitteet.splice(this.tavoitteet.indexOf(tavoite), 1);
      return { status: 204 };
    }
    if (method === 'POST') {
      const suunnitelma = {
        ...(body as Schemas['PolunSuunnitelmaYhteenvetoDto']),
        id: nextId(),
        luotu: new Date().toISOString(),
      };
      suunnitelmat.push(suunnitelma);
      return ok(suunnitelma.id, 201);
    }
    const suunnitelma = suunnitelmat.find((s) => s.id === suunnitelmaId);
    if (!suunnitelma) {
      return { status: 404 };
    }
    if (method === 'GET') {
      return ok(suunnitelma);
    }
    if (method === 'PUT') {
      Object.assign(suunnitelma, body as Schemas['PolunSuunnitelmaDto'], { id: suunnitelma.id });
      return { status: 204 };
    }
    suunnitelmat.splice(suunnitelmat.indexOf(suunnitelma), 1);
    return { status: 204 };
  }

  private handleCollection(
    collection: Collection,
    method: string,
    id: string | undefined,
    childId: string | undefined,
    body: unknown,
    isChildPath: boolean,
  ): Reply | undefined {
    const items = this[collection.key] as Kokonaisuus[];
    const item = id === undefined ? undefined : items.find((i) => i.id === id);
    if (id !== undefined && !item) {
      return { status: 404 };
    }
    const children = () => (item![collection.child] ??= []) as Kohde[];
    const child = childId === undefined ? undefined : children().find((c) => c.id === childId);
    if (childId !== undefined && !child) {
      return { status: 404 };
    }

    if (!item) {
      if (method === 'GET') {
        return ok(items);
      }
      if (method === 'POST') {
        const added = body as Kokonaisuus;
        added.id = nextId();
        delete added.tuontiLahde;
        for (const c of (added[collection.child] ?? []) as Kohde[]) {
          c.id = nextId();
        }
        items.push(added);
        return ok({ id: added.id }, 201);
      }
      return undefined;
    }

    if (!isChildPath) {
      switch (method) {
        case 'GET':
          return ok(item);
        case 'PUT':
          item.nimi = (body as Kokonaisuus).nimi;
          delete item.tuontiLahde;
          return { status: 204 };
        case 'DELETE':
          items.splice(items.indexOf(item), 1);
          return { status: 204 };
      }
      return undefined;
    }

    if (!child) {
      if (method === 'GET') {
        return ok(children());
      }
      if (method === 'POST') {
        const added = { ...(body as Kohde), id: nextId() };
        children().push(added);
        return ok({ id: added.id }, 201);
      }
      return undefined;
    }

    switch (method) {
      case 'GET':
        return ok(child);
      case 'PUT':
        Object.assign(child, body as Kohde, { id: child.id });
        return { status: 204 };
      case 'DELETE':
        children().splice(children().indexOf(child), 1);
        // Like the backend, a work place, an education or a theme without entries is removed too.
        if (children().length === 0) {
          items.splice(items.indexOf(item), 1);
        }
        return { status: 204 };
    }
    return undefined;
  }

  /**
   * Suggests every opportunity, scored by how many of the selected competences and interests it matches. The real
   * scoring is done by a model in the backend; this one only needs to be predictable for the tests.
   */
  private mahdollisuusEhdotukset(ehdotus: Schemas['LuoEhdotusDto']): Schemas['EhdotusDto'][] {
    const all = [...this.tyomahdollisuudet, ...this.koulutusmahdollisuudet];
    const aakkoset = all.map((m) => m.dto.otsikko.fi ?? '').sort((a, b) => a.localeCompare(b, 'fi'));
    const share = (uris: string[], selected: string[] = []) =>
      selected.length === 0 ? 0 : selected.filter((uri) => uris.includes(uri)).length / selected.length;
    const hasInput = (ehdotus.osaamiset?.length ?? 0) + (ehdotus.kiinnostukset?.length ?? 0) > 0;
    return all.map((m) => ({
      mahdollisuusId: m.dto.id,
      ehdotusMetadata: {
        ...m.meta,
        aakkosIndeksi: aakkoset.indexOf(m.dto.otsikko.fi ?? ''),
        ...(hasInput && {
          pisteet:
            (ehdotus.osaamisPainotus ?? 0.5) * share(m.osaamiset, ehdotus.osaamiset) +
            (ehdotus.kiinnostusPainotus ?? 0.5) * share(m.osaamiset, ehdotus.kiinnostukset),
        }),
      },
    }));
  }

  /** The profile content that a share link shows, filtered by its selections like the backend does. */
  private jaettuSisalto(j: Schemas['JakolinkkiUpdateDto']): Schemas['JakolinkkiContentDto'] {
    const shared = <T extends { id?: string }>(items: T[], ids: string[] = []) =>
      items.filter((i) => ids.includes(i.id!));
    return {
      voimassaAsti: j.voimassaAsti,
      ...(j.nimiJaettu && {
        etunimi: this.user?.etunimi ?? testUser.etunimi,
        sukunimi: this.user?.sukunimi ?? testUser.sukunimi,
      }),
      ...(j.emailJaettu && { email: this.tiedot.email }),
      ...(j.kotikuntaJaettu && { kotikunta: this.tiedot.kotikunta }),
      ...(j.syntymavuosiJaettu && { syntymavuosi: this.tiedot.syntymavuosi }),
      tyopaikat: shared(this.tyopaikat, j.jaetutTyopaikat),
      koulutusKokonaisuudet: shared(this.koulutuskokonaisuudet, j.jaetutKoulutukset),
      teemat: shared(this.teemat, j.jaetutTeemat),
      ...(j.muuOsaaminenJaettu && { muuOsaaminen: this.muuOsaaminen }),
      ...(j.kiinnostuksetJaettu && { kiinnostukset: this.kiinnostukset }),
      suosikit: this.suosikit.filter((s) => j.jaetutSuosikit?.includes(s.tyyppi)),
      tavoitteet: shared(this.tavoitteet, j.jaetutTavoitteet),
    };
  }

  /** Competences of the profile, collected from their sources like the backend does. */
  private yksilonOsaamiset(tyyppi: string | null, lahdeId: string | null): Schemas['YksilonOsaaminenDto'][] {
    const sources: { lahde: Schemas['OsaamisenLahdeDto']; uris: string[] }[] = [
      ...collections.flatMap((collection) =>
        (this[collection.key] as Kokonaisuus[]).flatMap((item) =>
          ((item[collection.child] ?? []) as Kohde[]).map((kohde) => ({
            lahde: { tyyppi: collection.lahde, id: kohde.id },
            uris: kohde.osaamiset ?? [],
          })),
        ),
      ),
      { lahde: { tyyppi: 'MUU_OSAAMINEN' }, uris: this.muuOsaaminen.muuOsaaminen ?? [] },
    ];
    return sources
      .filter(({ lahde }) => (!tyyppi || lahde.tyyppi === tyyppi) && (!lahdeId || lahde.id === lahdeId))
      .flatMap(({ lahde, uris }) =>
        uris.map((uri) => ({
          id: this.osaaminenId(lahde, uri),
          osaaminen: this.osaaminen(uri),
          lahde,
        })),
      );
  }

  private deleteOsaamiset(ids: string[]) {
    for (const collection of collections) {
      for (const item of this[collection.key] as Kokonaisuus[]) {
        for (const kohde of (item[collection.child] ?? []) as Kohde[]) {
          const lahde = { tyyppi: collection.lahde, id: kohde.id };
          kohde.osaamiset = kohde.osaamiset?.filter((uri) => !ids.includes(this.osaaminenId(lahde, uri)));
        }
      }
    }
    this.muuOsaaminen.muuOsaaminen = this.muuOsaaminen.muuOsaaminen?.filter(
      (uri) => !ids.includes(this.osaaminenId({ tyyppi: 'MUU_OSAAMINEN' }, uri)),
    );
  }

  private readonly osaaminenIds = new Map<string, string>();

  private osaaminenId(lahde: Schemas['OsaamisenLahdeDto'], uri: string) {
    const key = `${lahde.tyyppi}/${lahde.id}/${uri}`;
    let id = this.osaaminenIds.get(key);
    if (!id) {
      id = nextId();
      this.osaaminenIds.set(key, id);
    }
    return id;
  }

  /** Looks up a competence from the catalog; an unknown URI is a mistake in the test data. */
  osaaminen(uri: string) {
    const osaaminen = this.osaamiset.find((o) => o.uri === uri);
    if (!osaaminen) {
      throw new Error(`Competence ${uri} is not in the catalog of e2e/backend.ts`);
    }
    return osaaminen;
  }
}

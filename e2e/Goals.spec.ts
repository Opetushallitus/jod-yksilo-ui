import { confirmDeletion, expect, test } from './fixtures';

const HUVIPUISTONJOHTAJA = 'a0000000-0000-4000-8000-000000000002';
const LIIKETALOUS = 'b0000000-0000-4000-8000-000000000002';

test.beforeEach(({ backend }) => {
  backend.signIn();
  backend.suosikit = [{ id: 'f1', kohdeId: HUVIPUISTONJOHTAJA, tyyppi: 'TYOMAHDOLLISUUS' }];
});

test.describe('without goals', () => {
  test('user sets a favorite as a goal', async ({ page, open, backend }) => {
    await open('osaamisprofiili/tavoitteet');
    const main = page.getByRole('main');
    await expect(main.getByText('Et ole vielä lisännyt tavoitteita.')).toBeVisible();

    await main.getByRole('button', { name: 'Lisää uusi tavoite' }).click();
    // The title of the dialog changes on each step.
    const dialog = page.getByRole('dialog');
    const name = dialog.getByRole('textbox', { name: 'Tavoitteen nimi (pakollinen)' });
    await name.fill('Huvipuiston johtoon');
    await name.blur();
    await dialog.getByRole('button', { name: 'Seuraava' }).click();
    await expect(dialog).toHaveAccessibleName('Valitse tavoite suosikeista');
    await dialog.getByRole('button', { name: 'Aseta tavoitteeksi' }).click();
    await dialog.getByRole('button', { name: 'Tallenna' }).click();

    await expect(dialog).toBeHidden();
    await expect(main.getByRole('heading', { level: 2, name: 'Huvipuiston johtoon' })).toBeVisible();
    await expect(main.getByRole('link', { name: 'Huvipuistonjohtaja' })).toBeVisible();
    expect(backend.tavoitteet).toEqual([
      expect.objectContaining({
        tavoite: expect.objectContaining({ fi: 'Huvipuiston johtoon' }),
        mahdollisuusId: HUVIPUISTONJOHTAJA,
        mahdollisuusTyyppi: 'TYOMAHDOLLISUUS',
      }),
    ]);
  });
});

test.describe('with a goal', () => {
  test.beforeEach(({ backend }) => {
    backend.tavoitteet = [
      {
        id: 'c0000000-0000-4000-8000-000000000001',
        mahdollisuusId: HUVIPUISTONJOHTAJA,
        mahdollisuusTyyppi: 'TYOMAHDOLLISUUS',
        tavoite: { fi: 'Huvipuiston johtoon' },
        kuvaus: { fi: '' },
        suunnitelmat: [],
      },
    ];
  });

  test('user adds a suggested education as a plan and removes it', async ({ page, open, backend }) => {
    await open('osaamisprofiili/tavoitteet');
    const main = page.getByRole('main');

    await main.getByRole('button', { name: 'Lisää suunnitelma' }).click();
    const dialog = page.getByRole('dialog');
    // The education that gives most of the missing competences is suggested first.
    const suggestions = dialog.getByRole('list').first();
    await expect(suggestions).toContainText('2/3Osaamista');
    await suggestions.getByRole('button', { name: 'Valitse suunnitelmaksi' }).first().click();
    await dialog.getByRole('button', { name: 'Tallenna' }).click();

    await expect(dialog).toBeHidden();
    // Plans are labelled with letters, and link to their education.
    await expect(main.getByRole('link', { name: 'A', exact: true })).toHaveAttribute(
      'href',
      `/yksilo/fi/koulutusmahdollisuus/${LIIKETALOUS}`,
    );
    expect(backend.tavoitteet[0].suunnitelmat).toEqual([
      expect.objectContaining({ koulutusmahdollisuusId: LIIKETALOUS }),
    ]);

    await main.getByRole('button', { name: 'Poista', exact: true }).click();
    await page
      .getByRole('dialog', { name: 'Poista suunnitelma' })
      .getByRole('button', { name: 'Poista suunnitelma' })
      .click();

    await expect(main.getByText('Et ole vielä lisännyt suunnitelmia')).toBeVisible();
    expect(backend.tavoitteet[0].suunnitelmat).toEqual([]);
  });

  test('user creates an own plan and edits it', async ({ page, open, backend }) => {
    await open('osaamisprofiili/tavoitteet');
    const main = page.getByRole('main');

    await main.getByRole('button', { name: 'Lisää suunnitelma' }).click();
    // The title of the dialog changes on each step.
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Luo oma' }).click();
    await expect(dialog.getByRole('heading', { name: 'Luo oma suunnitelma' })).toBeVisible();
    const name = dialog.getByRole('textbox', { name: /^Oman suunnitelman nimi/ });
    await name.fill('Rahoituskurssi');
    await dialog.getByRole('textbox', { name: /^Oman suunnitelman kuvaus/ }).fill('Iltakurssi kansalaisopistossa');
    await name.blur();
    await dialog.getByRole('button', { name: 'Seuraava' }).click();
    // The competences that the goal requires can be chosen for the plan.
    await dialog.getByRole('button', { name: 'hallinnoida rahoitusta' }).click();
    await dialog.getByRole('button', { name: 'Tallenna' }).click();

    await expect(dialog).toBeHidden();
    // Own plans have no education to link to.
    await expect(main.getByText('Rahoituskurssi')).toBeVisible();
    await expect(main.getByText('Iltakurssi kansalaisopistossa')).toBeVisible();
    expect(backend.tavoitteet[0].suunnitelmat).toEqual([
      expect.objectContaining({
        nimi: { fi: 'Rahoituskurssi' },
        kuvaus: { fi: 'Iltakurssi kansalaisopistossa' },
        osaamiset: ['http://data.europa.eu/esco/skill/e2e-rahoitus'],
      }),
    ]);

    // On narrow screens the goal's edit button is also labelled "Muokkaa".
    await main.getByTestId('edit-plan-button').click();
    await expect(name).toHaveValue('Rahoituskurssi');
    await name.fill('Rahoituksen jatkokurssi');
    await name.blur();
    await dialog.getByRole('button', { name: 'Seuraava' }).click();
    await dialog.getByRole('button', { name: 'Tallenna' }).click();

    await expect(dialog).toBeHidden();
    await expect(main.getByText('Rahoituksen jatkokurssi')).toBeVisible();
    expect(backend.tavoitteet[0].suunnitelmat).toEqual([
      expect.objectContaining({
        nimi: { fi: 'Rahoituksen jatkokurssi' },
        osaamiset: ['http://data.europa.eu/esco/skill/e2e-rahoitus'],
      }),
    ]);
  });

  test('user edits and deletes the goal', async ({ page, open, backend }) => {
    await open('osaamisprofiili/tavoitteet');
    const main = page.getByRole('main');

    // On narrow screens the button is labelled just "Muokkaa".
    await main.getByRole('button', { name: /^Muokkaa( tavoitetta)?$/ }).click();
    const dialog = page.getByRole('dialog');
    const name = dialog.getByRole('textbox', { name: 'Tavoitteen nimi (pakollinen)' });
    await name.fill('Huvipuiston toimitusjohtajaksi');
    await name.blur();
    // The second step would change the favorite that the goal is about.
    await dialog.getByRole('button', { name: 'Seuraava' }).click();
    await dialog.getByRole('button', { name: 'Tallenna' }).click();
    await expect(dialog).toBeHidden();
    await expect(main.getByRole('heading', { level: 2, name: 'Huvipuiston toimitusjohtajaksi' })).toBeVisible();
    expect(backend.tavoitteet[0].tavoite).toMatchObject({ fi: 'Huvipuiston toimitusjohtajaksi' });

    await main.getByRole('button', { name: 'Poista tavoite' }).click();
    await confirmDeletion(page).click();

    await expect(main.getByText('Et ole vielä lisännyt tavoitteita.')).toBeVisible();
    expect(backend.tavoitteet).toEqual([]);
  });
});

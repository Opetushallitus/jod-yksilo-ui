import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { useLoaderData } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { EducationJakaumaList, JobJakaumaList } from './JakaumaList';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('react-router', () => ({
  useLoaderData: vi.fn(),
}));

describe('JobJakaumaList component', () => {
  it('renders tyonJatkuvuus correctly', () => {
    const mockJobData = {
      jakaumat: {
        tyonJatkuvuus: {
          maara: 11,
          tyhjia: 0,
          arvot: [
            {
              arvo: 'PERMANENT',
              osuus: 90.9090909090909,
            },
            {
              arvo: 'TEMPORARY',
              osuus: 9.090909090909092,
            },
          ],
        },
      },
      codesetValues: {},
    };

    vi.mocked(useLoaderData).mockReturnValue(mockJobData);

    const name = 'tyonJatkuvuus';
    const { getByTestId } = render(<JobJakaumaList name={name} />);

    // Test PERMANENT distribution
    const permanentPercentage = getByTestId(`${name}-distribution-PERMANENT-percentage`);
    const permanentLabel = getByTestId(`${name}-distribution-PERMANENT-label`);
    expect(permanentPercentage).toHaveTextContent('91%');
    expect(permanentLabel).toHaveTextContent('jakauma-values.tyonJatkuvuus.PERMANENT');

    // Test TEMPORARY distribution
    const temporaryPercentage = getByTestId(`${name}-distribution-TEMPORARY-percentage`);
    const temporaryLabel = getByTestId(`${name}-distribution-TEMPORARY-label`);
    expect(temporaryPercentage).toHaveTextContent('9%');
    expect(temporaryLabel).toHaveTextContent('jakauma-values.tyonJatkuvuus.TEMPORARY');

    // Test total label
    const totalLabel = getByTestId(`${name}-distribution-total-label`);
    expect(totalLabel).toHaveTextContent('job-opportunity.of-job-ads');
  });

  it('renders kielitaito correctly', () => {
    const mockJobData = {
      jakaumat: {
        kielitaito: {
          maara: 11,
          tyhjia: 7,
          arvot: [
            {
              arvo: 'Fi',
              osuus: 100,
            },
          ],
        },
      },
      codesetValues: {},
    };

    vi.mocked(useLoaderData).mockReturnValue(mockJobData);

    const name = 'kielitaito';

    const { getByTestId } = render(<JobJakaumaList name={name} />);
    const percentage = getByTestId(`${name}-distribution-Fi-percentage`);
    const label = getByTestId(`${name}-distribution-Fi-label`);
    expect(percentage.textContent).toBe('100%');
    expect(label.textContent).toBe('Fi');
    const totalLabel = getByTestId(`${name}-distribution-total-label`);
    expect(totalLabel).toHaveTextContent('job-opportunity.of-job-ads');
  });

  it('renders koulutusala empty values correctly', () => {
    const mockJobData = {
      jakaumat: {},
      codesetValues: {},
    };
    vi.mocked(useLoaderData).mockReturnValue(mockJobData);

    const name = 'koulutusala';

    const { getByTestId } = render(<JobJakaumaList name={name} />);

    const emptyLabel = getByTestId(`${name}-distribution-empty-label`);
    expect(emptyLabel.textContent).toBe('---');
    const totalLabel = getByTestId(`${name}-distribution-total-label`);
    expect(totalLabel.textContent).toBe('job-opportunity.of-job-ads');
  });

  it('renders ajokortti correctly', () => {
    const mockJobData = {
      jakaumat: {
        ajokortti: {
          maara: 15,
          tyhjia: 3,
          arvot: [
            {
              arvo: 'B',
              osuus: 60,
            },
            {
              arvo: 'C',
              osuus: 40,
            },
          ],
        },
      },
      codesetValues: {},
    };

    vi.mocked(useLoaderData).mockReturnValue(mockJobData);

    const name = 'ajokortti';
    const { getByTestId } = render(<JobJakaumaList name={name} />);

    const bPercentage = getByTestId(`${name}-distribution-B-percentage`);
    expect(bPercentage.textContent).toBe('60%');

    const bLabel = getByTestId(`${name}-distribution-B-label`);
    expect(bLabel.textContent).toBe('B');

    const cPercentage = getByTestId(`${name}-distribution-C-percentage`);
    expect(cPercentage.textContent).toBe('40%');

    const cLabel = getByTestId(`${name}-distribution-C-label`);
    expect(cLabel.textContent).toBe('C');

    const totalLabel = getByTestId(`${name}-distribution-total-label`);
    expect(totalLabel.textContent).toBe('job-opportunity.of-job-ads');
  });

  it('renders rikosrekisteriote correctly', () => {
    const mockJobData = {
      jakaumat: {
        rikosrekisteriote: {
          maara: 10,
          tyhjia: 0,
          arvot: [
            {
              arvo: '0',
              osuus: 70,
            },
            {
              arvo: '1',
              osuus: 30,
            },
          ],
        },
      },
      codesetValues: {},
    };

    vi.mocked(useLoaderData).mockReturnValue(mockJobData);

    const name = 'rikosrekisteriote';
    const { getByTestId } = render(<JobJakaumaList name={name} />);

    const zeroPercentage = getByTestId(`${name}-distribution-0-percentage`);
    expect(zeroPercentage.textContent).toBe('70%');

    const zeroLabel = getByTestId(`${name}-distribution-0-label`);
    expect(zeroLabel.textContent).toBe('is-not-required');

    const onePercentage = getByTestId(`${name}-distribution-1-percentage`);
    expect(onePercentage.textContent).toBe('30%');

    const oneLabel = getByTestId(`${name}-distribution-1-label`);
    expect(oneLabel.textContent).toBe('is-required');

    const totalLabel = getByTestId(`${name}-distribution-total-label`);
    expect(totalLabel.textContent).toBe('job-opportunity.of-job-ads');
  });

  it('renders maa codesetvalues values correctly', () => {
    const mockJobData = {
      jakaumat: {
        maa: {
          maara: 8,
          tyhjia: 1,
          arvot: [
            {
              arvo: 'FI',
              osuus: 87.5,
            },
            {
              arvo: 'SE',
              osuus: 12.5,
            },
          ],
        },
      },
      codesetValues: {
        maa: [
          { code: 'FI', value: 'Finland' },
          { code: 'SE', value: 'Sweden' },
        ],
      },
    };

    vi.mocked(useLoaderData).mockReturnValue(mockJobData);

    const name = 'maa';
    const { getByTestId } = render(<JobJakaumaList name={name} />);

    const fiPercentage = getByTestId(`${name}-distribution-FI-percentage`);
    expect(fiPercentage.textContent).toBe('88%');

    const fiLabel = getByTestId(`${name}-distribution-FI-label`);
    expect(fiLabel.textContent).toBe('Finland');

    const sePercentage = getByTestId(`${name}-distribution-SE-percentage`);
    expect(sePercentage.textContent).toBe('13%');

    const seLabel = getByTestId(`${name}-distribution-SE-label`);
    expect(seLabel.textContent).toBe('Sweden');

    const totalLabel = getByTestId(`${name}-distribution-total-label`);
    expect(totalLabel.textContent).toBe('job-opportunity.of-job-ads');
  });

  it('renders palkanPeruste correctly', () => {
    const mockJobData = {
      jakaumat: {
        palkanPeruste: {
          maara: 12,
          tyhjia: 2,
          arvot: [
            {
              arvo: 'OTHER',
              osuus: 5,
            },
            {
              arvo: 'PIECE_WORK',
              osuus: 5,
            },
            {
              arvo: 'PROVISION',
              osuus: 10,
            },
            {
              arvo: 'SALARY',
              osuus: 10,
            },
            {
              arvo: 'SALARY_PROVISION',
              osuus: 20,
            },
            {
              arvo: 'TIME_RATE',
              osuus: 20,
            },
            {
              arvo: 'TIME_RATE_PROVISION',
              osuus: 30,
            },
          ],
        },
      },
      codesetValues: {},
    };

    vi.mocked(useLoaderData).mockReturnValue(mockJobData);

    const name = 'palkanPeruste';
    const { getByTestId } = render(<JobJakaumaList name={name} />);

    const otherPercentage = getByTestId(`${name}-distribution-OTHER-percentage`);
    expect(otherPercentage.textContent).toBe('5%');

    const otherLabel = getByTestId(`${name}-distribution-OTHER-label`);
    expect(otherLabel.textContent).toBe('jakauma-values.palkanPeruste.OTHER');

    const pieceworkPercentage = getByTestId(`${name}-distribution-PIECE_WORK-percentage`);
    expect(pieceworkPercentage.textContent).toBe('5%');

    const pieceworkLabel = getByTestId(`${name}-distribution-PIECE_WORK-label`);
    expect(pieceworkLabel.textContent).toBe('jakauma-values.palkanPeruste.PIECE_WORK');

    const provisionPercentage = getByTestId(`${name}-distribution-PROVISION-percentage`);
    expect(provisionPercentage.textContent).toBe('10%');

    const provisionLabel = getByTestId(`${name}-distribution-PROVISION-label`);
    expect(provisionLabel.textContent).toBe('jakauma-values.palkanPeruste.PROVISION');

    const salaryPercentage = getByTestId(`${name}-distribution-SALARY-percentage`);
    expect(salaryPercentage.textContent).toBe('10%');

    const salaryLabel = getByTestId(`${name}-distribution-SALARY-label`);
    expect(salaryLabel.textContent).toBe('jakauma-values.palkanPeruste.SALARY');

    const salaryProvisionPercentage = getByTestId(`${name}-distribution-SALARY_PROVISION-percentage`);
    expect(salaryProvisionPercentage.textContent).toBe('20%');

    const salaryProvisionLabel = getByTestId(`${name}-distribution-SALARY_PROVISION-label`);
    expect(salaryProvisionLabel.textContent).toBe('jakauma-values.palkanPeruste.SALARY_PROVISION');

    const timeRatePercentage = getByTestId(`${name}-distribution-TIME_RATE-percentage`);
    expect(timeRatePercentage.textContent).toBe('20%');

    const timeRateLabel = getByTestId(`${name}-distribution-TIME_RATE-label`);
    expect(timeRateLabel.textContent).toBe('jakauma-values.palkanPeruste.TIME_RATE');

    const timeRateProvisionPercentage = getByTestId(`${name}-distribution-TIME_RATE_PROVISION-percentage`);
    expect(timeRateProvisionPercentage.textContent).toBe('30%');

    const timeRateProvisionLabel = getByTestId(`${name}-distribution-TIME_RATE_PROVISION-label`);
    expect(timeRateProvisionLabel.textContent).toBe('jakauma-values.palkanPeruste.TIME_RATE_PROVISION');

    const totalLabel = getByTestId(`${name}-distribution-total-label`);
    expect(totalLabel.textContent).toBe('job-opportunity.of-job-ads');
  });

  it('renders palvelussuhde correctly', () => {
    const mockJobData = {
      jakaumat: {
        palvelussuhde: {
          maara: 9,
          tyhjia: 0,
          arvot: [
            {
              arvo: 'COMMISSION',
              osuus: 20,
            },
            {
              arvo: 'EMPLOYMENT',
              osuus: 20,
            },
            {
              arvo: 'ENTREPRENEURSHIP',
              osuus: 20,
            },
            {
              arvo: 'SERVICE_IN_PUBLIC_ADMINISTRATION',
              osuus: 40,
            },
          ],
        },
      },
      codesetValues: {},
    };
    vi.mocked(useLoaderData).mockReturnValue(mockJobData);

    const name = 'palvelussuhde';
    const { getByTestId } = render(<JobJakaumaList name={name} />);

    const commissionPercentage = getByTestId(`${name}-distribution-COMMISSION-percentage`);
    expect(commissionPercentage.textContent).toBe('20%');

    const commissionLabel = getByTestId(`${name}-distribution-COMMISSION-label`);
    expect(commissionLabel.textContent).toBe('jakauma-values.palvelussuhde.COMMISSION');
    const employmentPercentage = getByTestId(`${name}-distribution-EMPLOYMENT-percentage`);
    expect(employmentPercentage.textContent).toBe('20%');

    const employmentLabel = getByTestId(`${name}-distribution-EMPLOYMENT-label`);
    expect(employmentLabel.textContent).toBe('jakauma-values.palvelussuhde.EMPLOYMENT');

    const entrepreneurshipPercentage = getByTestId(`${name}-distribution-ENTREPRENEURSHIP-percentage`);
    expect(entrepreneurshipPercentage.textContent).toBe('20%');

    const entrepreneurshipLabel = getByTestId(`${name}-distribution-ENTREPRENEURSHIP-label`);
    expect(entrepreneurshipLabel.textContent).toBe('jakauma-values.palvelussuhde.ENTREPRENEURSHIP');

    const publicAdministrationPercentage = getByTestId(
      `${name}-distribution-SERVICE_IN_PUBLIC_ADMINISTRATION-percentage`,
    );
    expect(publicAdministrationPercentage.textContent).toBe('40%');

    const publicAdministrationLabel = getByTestId(`${name}-distribution-SERVICE_IN_PUBLIC_ADMINISTRATION-label`);
    expect(publicAdministrationLabel.textContent).toBe('jakauma-values.palvelussuhde.SERVICE_IN_PUBLIC_ADMINISTRATION');

    const totalLabel = getByTestId(`${name}-distribution-total-label`);
    expect(totalLabel.textContent).toBe('job-opportunity.of-job-ads');
  });

  it('renders tyoaika correctly', () => {
    const mockJobData = {
      jakaumat: {
        tyoaika: {
          maara: 14,
          tyhjia: 1,
          arvot: [
            {
              arvo: 'FULLTIME',
              osuus: 85.71428571428571,
            },
            {
              arvo: 'PARTTIME',
              osuus: 14.285714285714286,
            },
          ],
        },
      },
      codesetValues: {},
    };
    vi.mocked(useLoaderData).mockReturnValue(mockJobData);

    const name = 'tyoaika';
    const { getByTestId } = render(<JobJakaumaList name={name} />);

    const fullTimePercentage = getByTestId(`${name}-distribution-FULLTIME-percentage`);
    expect(fullTimePercentage.textContent).toBe('86%');

    const fullTimeLabel = getByTestId(`${name}-distribution-FULLTIME-label`);
    expect(fullTimeLabel.textContent).toBe('jakauma-values.tyoaika.FULLTIME');

    const partTimePercentage = getByTestId(`${name}-distribution-PARTTIME-percentage`);
    expect(partTimePercentage.textContent).toBe('14%');

    const partTimeLabel = getByTestId(`${name}-distribution-PARTTIME-label`);
    expect(partTimeLabel.textContent).toBe('jakauma-values.tyoaika.PARTTIME');

    const totalLabel = getByTestId(`${name}-distribution-total-label`);
    expect(totalLabel.textContent).toBe('job-opportunity.of-job-ads');
  });

  it('renders fallback when data is missing', () => {
    const mockJobData = {
      jakaumat: {
        maa: {
          maara: 8,
          tyhjia: 1,
          arvot: [
            {
              arvo: 'FI',
              osuus: 100,
            },
          ],
        },
      },
      codesetValues: {},
    };

    vi.mocked(useLoaderData).mockReturnValue(mockJobData);

    const name = 'maa';
    const { getByTestId } = render(<JobJakaumaList name={name} />);

    const fiPercentage = getByTestId(`${name}-distribution-FI-percentage`);
    expect(fiPercentage.textContent).toBe('100%');

    const fiLabel = getByTestId(`${name}-distribution-FI-label`);
    expect(fiLabel.textContent).toBe('FI');

    const totalLabel = getByTestId(`${name}-distribution-total-label`);
    expect(totalLabel.textContent).toBe('job-opportunity.of-job-ads');
  });
});

describe('EducationJakaumaList component', () => {
  it('renders koulutusala correctly', () => {
    const mockEducationData = {
      jakaumat: {
        koulutusala: {
          maara: 2,
          tyhjia: 0,
          arvot: [
            {
              arvo: 'kansallinenkoulutusluokitus2016koulutusalataso2_031#1',
              osuus: 100,
            },
          ],
        },
      },
      codesetValues: {
        koulutusala: [{ code: 'kansallinenkoulutusluokitus2016koulutusalataso2_031', value: 'Yhteiskuntatieteet' }],
      },
    };
    vi.mocked(useLoaderData).mockReturnValue(mockEducationData);

    const name = 'koulutusala';
    const { getByTestId } = render(<EducationJakaumaList name={name} />);

    const percentage = getByTestId(
      `${name}-distribution-kansallinenkoulutusluokitus2016koulutusalataso2_031#1-percentage`,
    );
    expect(percentage.textContent).toBe('100%');
    const label = getByTestId(`${name}-distribution-kansallinenkoulutusluokitus2016koulutusalataso2_031#1-label`);
    expect(label.textContent).toBe('Yhteiskuntatieteet');
    const totalLabel = getByTestId(`${name}-distribution-total-label`);
    expect(totalLabel.textContent).toBe('education-opportunity.of-educations');
  });

  it('renders kunta correctly', () => {
    const mockEducationData = {
      jakaumat: {
        kunta: {
          maara: 2,
          tyhjia: 0,
          arvot: [
            {
              arvo: 'Helsinki',
              osuus: 100,
            },
          ],
        },
      },
      codesetValues: {},
    };
    vi.mocked(useLoaderData).mockReturnValue(mockEducationData);

    const name = 'kunta';
    const { getByTestId } = render(<EducationJakaumaList name={name} />);
    const percentage = getByTestId(`${name}-distribution-Helsinki-percentage`);
    expect(percentage.textContent).toBe('100%');
    const label = getByTestId(`${name}-distribution-Helsinki-label`);
    expect(label.textContent).toBe('Helsinki');
    const totalLabel = getByTestId(`${name}-distribution-total-label`);
    expect(totalLabel.textContent).toBe('education-opportunity.of-educations');
  });

  it('renders opetustapa correctly', () => {
    const mockEducationData = {
      jakaumat: {
        opetustapa: {
          maara: 2,
          tyhjia: 0,
          arvot: [
            {
              arvo: 'opetuspaikkakk_2#1',
              osuus: 50,
            },
            {
              arvo: 'opetuspaikkakk_3#1',
              osuus: 50,
            },
          ],
        },
      },
      codesetValues: {
        opetustapa: [
          { code: 'opetuspaikkakk_2', value: 'Lähiopetus' },
          { code: 'opetuspaikkakk_3', value: 'Verkko-opetus' },
        ],
      },
    };
    vi.mocked(useLoaderData).mockReturnValue(mockEducationData);

    const name = 'opetustapa';
    const { getByTestId } = render(<EducationJakaumaList name={name} />);

    const firstPercentage = getByTestId(`${name}-distribution-opetuspaikkakk_2#1-percentage`);
    expect(firstPercentage.textContent).toBe('50%');

    const firstLabel = getByTestId(`${name}-distribution-opetuspaikkakk_2#1-label`);
    expect(firstLabel.textContent).toBe('Lähiopetus');

    const secondPercentage = getByTestId(`${name}-distribution-opetuspaikkakk_3#1-percentage`);
    expect(secondPercentage.textContent).toBe('50%');

    const secondLabel = getByTestId(`${name}-distribution-opetuspaikkakk_3#1-label`);
    expect(secondLabel.textContent).toBe('Verkko-opetus');

    const totalLabel = getByTestId(`${name}-distribution-total-label`);
    expect(totalLabel.textContent).toBe('education-opportunity.of-educations');
  });

  it('renders aika correctly', () => {
    const mockEducationData = {
      jakaumat: {
        aika: {
          maara: 2,
          tyhjia: 0,
          arvot: [
            {
              arvo: 'opetusaikakk_5#1',
              osuus: 100,
            },
          ],
        },
      },
      codesetValues: {
        aika: [{ code: 'opetusaikakk_5', value: 'Koko päivä' }],
      },
    };
    vi.mocked(useLoaderData).mockReturnValue(mockEducationData);

    const name = 'aika';
    const { getByTestId } = render(<EducationJakaumaList name={name} />);

    const percentage = getByTestId(`${name}-distribution-opetusaikakk_5#1-percentage`);
    expect(percentage.textContent).toBe('100%');

    const label = getByTestId(`${name}-distribution-opetusaikakk_5#1-label`);
    expect(label.textContent).toBe('Koko päivä');

    const totalLabel = getByTestId(`${name}-distribution-total-label`);
    expect(totalLabel.textContent).toBe('education-opportunity.of-educations');
  });

  it('renders maksullisuus correctly', () => {
    const mockEducationData = {
      jakaumat: {
        maksullisuus: {
          maara: 2,
          tyhjia: 0,
          arvot: [
            {
              arvo: 'maksullinen',
              osuus: 20,
            },
            {
              arvo: 'maksuton',
              osuus: 70,
            },
            {
              arvo: 'lukuvuosimaksu',
              osuus: 10,
            },
          ],
        },
      },
      codesetValues: {},
    };
    vi.mocked(useLoaderData).mockReturnValue(mockEducationData);
    const name = 'maksullisuus';
    const { getByTestId } = render(<EducationJakaumaList name={name} />);

    const paidPercentage = getByTestId(`${name}-distribution-maksullinen-percentage`);
    expect(paidPercentage.textContent).toBe('20%');
    const paidLabel = getByTestId(`${name}-distribution-maksullinen-label`);
    expect(paidLabel.textContent).toBe('jakauma-values.maksullisuus.maksullinen');

    const freePercentage = getByTestId(`${name}-distribution-maksuton-percentage`);
    expect(freePercentage.textContent).toBe('70%');
    const freeLabel = getByTestId(`${name}-distribution-maksuton-label`);
    expect(freeLabel.textContent).toBe('jakauma-values.maksullisuus.maksuton');
    const feePercentage = getByTestId(`${name}-distribution-lukuvuosimaksu-percentage`);
    expect(feePercentage.textContent).toBe('10%');
    const feeLabel = getByTestId(`${name}-distribution-lukuvuosimaksu-label`);
    expect(feeLabel.textContent).toBe('jakauma-values.maksullisuus.lukuvuosimaksu');

    const totalLabel = getByTestId(`${name}-distribution-total-label`);
    expect(totalLabel.textContent).toBe('education-opportunity.of-educations');
  });

  it('renders fallback when data is missing', () => {
    const mockEducationData = {
      jakaumat: {
        aika: {
          maara: 2,
          tyhjia: 0,
          arvot: [
            {
              arvo: 'opetusaikakk_5#1',
              osuus: 100,
            },
          ],
        },
      },
      codesetValues: {
        // Missing aika codeset values to test fallback
      },
    };
    vi.mocked(useLoaderData).mockReturnValue(mockEducationData);

    const name = 'aika';
    const { getByTestId } = render(<EducationJakaumaList name={name} />);

    const percentage = getByTestId(`${name}-distribution-opetusaikakk_5#1-percentage`);
    expect(percentage.textContent).toBe('100%');

    const label = getByTestId(`${name}-distribution-opetusaikakk_5#1-label`);
    expect(label.textContent).toBe('opetusaikakk_5');

    const totalLabel = getByTestId(`${name}-distribution-total-label`);
    expect(totalLabel.textContent).toBe('education-opportunity.of-educations');
  });
});

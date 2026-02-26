import { ExperienceTableRowData } from '@/components/ExperienceTable/ExperienceTableRow';
import { formatDate, getLocalizedText } from '@/utils';
import { Checkbox, useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const EducationImportTable = ({ rows }: { rows: ExperienceTableRowData[] }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { sm } = useMediaQueries();

  const areSomeSubrowsChecked = (row: ExperienceTableRowData) =>
    (row.subrows ?? []).some((subrow) => subrow.checked ?? false);
  const areAllSubrowsChecked = (row: ExperienceTableRowData) =>
    (row.subrows ?? []).every((subrow) => subrow.checked ?? false);

  const someChecked = rows.some((row) => areSomeSubrowsChecked(row));
  const allChecked = rows.every((row) => areAllSubrowsChecked(row));
  const allUnchecked = !someChecked && !allChecked;

  // A hack to force re-rendering the component when checkbox states change
  const [, setForceRerender] = React.useState<boolean>(false);
  const rerender = () => setForceRerender((prev) => !prev);

  return (
    <table className="w-full border-collapse font-arial">
      <thead>
        <tr>
          <th
            className="text-left border-b-2 border-border-gray sm:text-heading-5 text-heading-5-mobile pb-4 sm:pl-5 pl-3"
            colSpan={sm ? 3 : 1}
          >
            <div className="flex items-center sm:gap-x-5 gap-x-3">
              <Checkbox
                name="checkbox-toggle-all"
                value="toggle-all"
                checked={allChecked}
                indeterminate={!allChecked && someChecked}
                onChange={() => {
                  if ((someChecked && !allChecked) || allUnchecked) {
                    // If some are checked but not all, check all
                    rows.forEach((row) => {
                      row.checked = true;
                      (row.subrows ?? []).forEach((subrow) => {
                        subrow.checked = true;
                      });
                    });
                  } else {
                    rows.forEach((row) => {
                      row.checked = false;
                      (row.subrows ?? []).forEach((subrow) => {
                        subrow.checked = false;
                      });
                    });
                  }
                  rerender();
                }}
                ariaLabel={t('choose')}
                testId={`education-import-table-checkbox-toggle-all`}
              />
              {t('education-history.education-provider-or-education')}
            </div>
          </th>
          {sm && (
            <>
              <th className="text-left border-b-2 border-border-gray sm:text-heading-5 text-heading-5-mobile pb-4 sm:px-6">
                {t('started')}
              </th>
              <th className="text-left border-b-2 border-border-gray sm:text-heading-5 text-heading-5-mobile pb-4 sm:pr-2">
                {t('ended')}
              </th>
            </>
          )}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <React.Fragment key={row.key}>
            <tr>
              <td
                className="py-3 sm:pl-5 pl-3 sm:text-heading-4 text-heading-4-mobile bg-white font-poppins"
                colSpan={sm ? 3 : 1}
              >
                <div className={`flex ${sm ? 'flex-row' : 'flex-col'}`}>
                  <div className="flex items-center sm:gap-5 gap-3">
                    <Checkbox
                      name={`checkbox-${row.key}`}
                      value={row.key}
                      checked={areAllSubrowsChecked(row)}
                      indeterminate={areSomeSubrowsChecked(row) && !areAllSubrowsChecked(row)}
                      onChange={(e) => {
                        row.checked = e.target.checked;
                        if (areSomeSubrowsChecked(row) && !areAllSubrowsChecked(row)) {
                          // If some subrows are checked but not all, check all
                          (row.subrows ?? []).forEach((subrow) => {
                            subrow.checked = true;
                          });
                        } else {
                          (row.subrows ?? []).forEach((subrow) => {
                            subrow.checked = e.target.checked;
                          });
                        }
                        rerender();
                      }}
                      ariaLabel={`${t('choose')} ${row.nimi[language]}`}
                      testId={`experience-row-checkbox-${row.key}`}
                    />
                    {getLocalizedText(row.nimi)}
                  </div>
                  {!sm && (
                    <div className="flex gap-2 text-secondary-gray text-body-md font-arial sm:ml-7 ml-6">
                      <span>{row.alkuPvm ? formatDate(row.alkuPvm) : ''}</span>
                      <span>-</span>
                      <span>{row.loppuPvm ? formatDate(row.loppuPvm) : ''}</span>
                    </div>
                  )}
                </div>
              </td>
              {sm && (
                <>
                  <td className="py-3 sm:text-heading-5 text-heading-5-mobile bg-white text-secondary-gray sm:px-6">
                    {row.alkuPvm ? formatDate(row.alkuPvm) : ''}
                  </td>
                  <td className="py-3 sm:text-heading-5 text-heading-5-mobile bg-white text-secondary-gray sm:pr-2">
                    {row.loppuPvm ? formatDate(row.loppuPvm) : ''}
                  </td>
                </>
              )}
            </tr>
            {(row.subrows ?? []).map((subrow, i) => (
              <tr key={subrow.key} className={i % 2 === 0 ? '' : 'bg-bg-gray-2'}>
                <td className="py-3 sm:text-heading-5 text-heading-5-mobile sm:pl-9 pl-6" colSpan={sm ? 3 : 1}>
                  <div className={`flex ${sm ? 'flex-row' : 'flex-col'}`}>
                    <div className="flex items-center sm:gap-5 gap-3">
                      <Checkbox
                        name={`checkbox-${subrow.key}`}
                        value={subrow.key}
                        checked={subrow?.checked ?? false}
                        onChange={(e) => {
                          subrow.checked = e.target.checked;
                          rerender();
                        }}
                        ariaLabel={`${t('choose')} ${subrow.nimi[language]}`}
                        testId={`experience-row-checkbox-${subrow.key}`}
                      />
                      {getLocalizedText(subrow.nimi)}
                    </div>
                    {!sm && (
                      <div className="flex gap-2 sm:ml-7 ml-6">
                        <span>{subrow.alkuPvm ? formatDate(subrow.alkuPvm) : ''}</span>
                        <span>-</span>
                        <span>{subrow.loppuPvm ? formatDate(subrow.loppuPvm) : ''}</span>
                      </div>
                    )}
                  </div>
                </td>
                {sm && (
                  <>
                    <td className="py-3 sm:text-heading-5 text-heading-5-mobile sm:px-6">
                      {subrow.alkuPvm ? formatDate(subrow.alkuPvm) : ''}
                    </td>
                    <td className="py-3 sm:text-heading-5 text-heading-5-mobile sm:pr-2">
                      {subrow.loppuPvm ? formatDate(subrow.loppuPvm) : ''}
                    </td>
                  </>
                )}
              </tr>
            ))}
            <tr>
              <td colSpan={3} className="pb-6" />
            </tr>
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
};

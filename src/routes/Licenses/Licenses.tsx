import React from 'react';
import { useTranslation } from 'react-i18next';
import deps from '../../../LICENSE.json';

const Licenses = () => {
  const { t } = useTranslation();
  const [sorted, setSorted] = React.useState(deps ?? []);

  React.useEffect(() => {
    setSorted([...deps].sort((a, b) => a.name.localeCompare(b.name)));
  }, []);

  return (
    <div className="container mx-auto">
      <h1 className="text-heading-1 text-black">{t('licenses.title')}</h1>
      <div className="text-body-md text-black">{t('licenses.description')}</div>
      <div className="my-7">
        <table>
          <tr className="text-heading-3 text-black text-left border-b border-border-gray">
            <th>{t('licenses.name')}</th>
            <th>{t('licenses.license-type')}</th>
          </tr>
          {sorted.map((dep) => (
            <tr key={dep.name} className="text-body-md odd:bg-white">
              <td className="pr-5">{dep.name}</td>
              <td>{dep.licenseType}</td>
            </tr>
          ))}
        </table>
      </div>
    </div>
  );
};

export default Licenses;

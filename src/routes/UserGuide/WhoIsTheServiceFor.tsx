import { useTranslation } from 'react-i18next';

const WhoIsTheServiceFor = () => {
  const { t } = useTranslation();
  const title = t('who-is-the-service-for');

  return (
    <>
      <title>{title}</title>
      <h1 className="mb-5 text-heading-2 sm:text-heading-1">{title}</h1>
      <p className="mb-8 text-body-md font-arial text-todo">
        Feugiat in fermentum posuere urna nec tincidunt praesent. Nunc mi ipsum faucibus vitae aliquet nec ullamcorper.
        Porttitor rhoncus dolor purus non enim praesent. Mattis pellentesque id nibh tortor id aliquet lectus proin
        nibh. Ac tincidunt vitae semper quis. Molestie nunc non blandit massa enim nec dui. Ridiculus mus mauris vitae
        ultricies leo integer malesuada nunc. Amet consectetur adipiscing elit duis tristique sollicitudin. Semper quis
        lectus nulla at volutpat. Neque convallis a cras semper auctor neque vitae tempus. Non diam phasellus vestibulum
        lorem sed risus.
      </p>
    </>
  );
};

export default WhoIsTheServiceFor;

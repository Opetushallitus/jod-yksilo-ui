import { useTranslation } from 'react-i18next';

const WhereCanIGetMoreHelp = () => {
  const { t } = useTranslation();
  const title = t('where-can-i-get-more-help');

  return (
    <>
      <title>{title}</title>
      <h1 className="mb-5 text-heading-2 sm:text-heading-1">{title}</h1>
      <p className="mb-8 text-body-md font-arial text-todo">
        Laoreet suspendisse interdum consectetur libero id faucibus. Quisque egestas diam in arcu. A cras semper auctor
        neque vitae tempus quam. Nulla facilisi nullam vehicula ipsum a arcu cursus vitae congue. Ac feugiat sed lectus
        vestibulum mattis ullamcorper velit sed ullamcorper. Fringilla est ullamcorper eget nulla facilisi etiam
        dignissim diam. Neque gravida in fermentum et sollicitudin ac orci phasellus egestas. Tristique senectus et
        netus et. Magnis dis parturient montes nascetur ridiculus. Commodo viverra maecenas accumsan lacus. Sed arcu non
        odio euismod lacinia at quis risus sed.
      </p>
    </>
  );
};

export default WhereCanIGetMoreHelp;

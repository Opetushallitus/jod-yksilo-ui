import { Button } from '@jod/design-system';
import { useTranslation } from 'react-i18next';

const TermsOfService = () => {
  const { t } = useTranslation();
  const title = t('terms-of-service');

  return (
    <>
      <title>{title}</title>
      <h1 className="mb-5 text-heading-2 sm:text-heading-1">{title}</h1>
      <p className="mb-8 text-body-md font-arial text-todo">
        Vitae tempus quam pellentesque nec nam aliquam. Turpis cursus in hac habitasse platea dictumst quisque sagittis.
        Et odio pellentesque diam volutpat. Magna ac placerat vestibulum lectus mauris ultrices eros in cursus. Sed
        vulputate mi sit amet mauris commodo quis imperdiet massa. Et netus et malesuada fames ac turpis. Vel fringilla
        est ullamcorper eget. Venenatis tellus in metus vulputate eu. Faucibus nisl tincidunt eget nullam non nisi est
        sit amet. Sed augue lacus viverra vitae congue eu consequat ac. Fermentum dui faucibus in ornare. Cursus in hac
        habitasse platea dictumst quisque sagittis purus sit. Ipsum dolor sit amet consectetur adipiscing elit ut.
        Fermentum dui faucibus in ornare quam. Varius quam quisque id diam vel.
      </p>
      <div className="flex flex-wrap gap-4">
        <Button variant="white" label={`TODO: ${t('accept')}`} />
        <Button variant="white-delete" label={`TODO: ${t('remove-approval')}`} />
      </div>
    </>
  );
};

export default TermsOfService;

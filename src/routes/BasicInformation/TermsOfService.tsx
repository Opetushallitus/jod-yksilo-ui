import { Title } from '@/components';
import { useActionBar } from '@/hooks/useActionBar';
import { Button } from '@jod/design-system';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

const TermsOfService = () => {
  const { t } = useTranslation();
  const actionBar = useActionBar();
  const title = t('terms-of-service');

  return (
    <>
      <Title value={title} />
      <h1 className="mb-5 text-heading-2 sm:text-heading-1 font-poppins">{title}</h1>
      <p className="mb-8 text-body-md">
        Vitae tempus quam pellentesque nec nam aliquam. Turpis cursus in hac habitasse platea dictumst quisque sagittis.
        Et odio pellentesque diam volutpat. Magna ac placerat vestibulum lectus mauris ultrices eros in cursus. Sed
        vulputate mi sit amet mauris commodo quis imperdiet massa. Et netus et malesuada fames ac turpis. Vel fringilla
        est ullamcorper eget. Venenatis tellus in metus vulputate eu. Faucibus nisl tincidunt eget nullam non nisi est
        sit amet. Sed augue lacus viverra vitae congue eu consequat ac. Fermentum dui faucibus in ornare. Cursus in hac
        habitasse platea dictumst quisque sagittis purus sit. Ipsum dolor sit amet consectetur adipiscing elit ut.
        Fermentum dui faucibus in ornare quam. Varius quam quisque id diam vel.
      </p>
      {actionBar &&
        createPortal(
          <div className="mx-auto flex max-w-[1140px] flex-wrap gap-4 px-5 py-4 sm:gap-5 sm:px-6 sm:py-5">
            <Button
              variant="white"
              label={t('accept')}
              onClick={() => {
                alert(t('accept'));
              }}
            />
            <Button
              variant="white-delete"
              label={t('remove-approval')}
              onClick={() => {
                alert(t('remove-approval'));
              }}
            />
          </div>,
          actionBar,
        )}
    </>
  );
};

export default TermsOfService;

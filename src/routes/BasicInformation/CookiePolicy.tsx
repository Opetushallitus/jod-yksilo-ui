import { Title } from '@/components';
import { useActionBar } from '@/hooks/useActionBar';
import { Button } from '@jod/design-system';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

const CookiePolicy = () => {
  const { t, i18n } = useTranslation();
  const actionBar = useActionBar();
  const title = t('cookie-policy');
  const updated = new Intl.DateTimeFormat(i18n.language).format(new Date('2024-03-27'));

  return (
    <>
      <Title value={title} />
      <h1 className="mb-5 text-heading-2 sm:text-heading-1">{title}</h1>
      <p className="mb-5 text-body-sm font-arial text-secondary-gray text-todo">
        {t('updated')}: {updated}
      </p>
      <p className="mb-8 text-body-lg text-todo">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
        magna aliqua. Vulputate mi sit amet mauris commodo quis. Amet mauris commodo quis imperdiet massa tincidunt nunc
        pulvinar sapien. Maecenas volutpat blandit aliquam etiam erat velit scelerisque. Lorem mollis aliquam ut
        porttitor. Massa massa ultricies mi quis hendrerit. Quis ipsum suspendisse ultrices gravida dictum fusce ut
        placerat orci. Gravida in fermentum et sollicitudin ac. Sapien nec sagittis aliquam malesuada bibendum. Quis
        viverra nibh cras pulvinar mattis. At urna condimentum mattis pellentesque id nibh tortor id aliquet. Dictum at
        tempor commodo ullamcorper. Pellentesque massa placerat duis ultricies lacus sed. Quis imperdiet massa tincidunt
        nunc pulvinar sapien.
      </p>
      <h2 className="mb-5 text-heading-4 text-todo">Eu mi bibendum neque egestas?</h2>
      <p className="mb-8 text-body-md font-arial text-todo">
        Eu mi bibendum neque egestas congue quisque egestas. Turpis egestas sed tempus urna et. Eleifend donec pretium
        vulputate sapien. Faucibus ornare suspendisse sed nisi lacus. Vel quam elementum pulvinar etiam non quam lacus
        suspendisse. Nunc id cursus metus aliquam. Turpis egestas maecenas pharetra convallis posuere morbi. Diam quis
        enim lobortis scelerisque. Sed faucibus turpis in eu mi bibendum neque. Egestas diam in arcu cursus. Adipiscing
        elit pellentesque habitant morbi tristique senectus et netus et. Dui nunc mattis enim ut tellus elementum
        sagittis vitae. Justo eget magna fermentum iaculis eu non.
      </p>
      <h2 className="mb-5 text-heading-4 text-todo">Volutpat ac tincidunt vitae semper?</h2>
      <p className="mb-8 text-body-md font-arial text-todo">
        Volutpat ac tincidunt vitae semper quis lectus nulla. Neque gravida in fermentum et sollicitudin ac orci
        phasellus egestas. Facilisi nullam vehicula ipsum a arcu cursus. Vestibulum mattis ullamcorper velit sed
        ullamcorper morbi. Nunc faucibus a pellentesque sit amet porttitor eget. Eleifend quam adipiscing vitae proin.
        Pellentesque pulvinar pellentesque habitant morbi. Justo laoreet sit amet cursus. Nunc non blandit massa enim.
        Risus quis varius quam quisque. Ut morbi tincidunt augue interdum velit euismod in pellentesque massa. Nunc
        aliquet bibendum enim facilisis gravida neque. Nulla malesuada pellentesque elit eget gravida cum sociis natoque
        penatibus. Sodales ut eu sem integer vitae justo.
      </p>
      <h2 className="mb-5 text-heading-4 text-todo">Odio facilisis mauris sit amet</h2>
      <p className="mb-8 text-body-md font-arial text-todo">
        Odio facilisis mauris sit amet. Eu tincidunt tortor aliquam nulla. Amet consectetur adipiscing elit ut aliquam
        purus sit. Diam quam nulla porttitor massa. Interdum posuere lorem ipsum dolor. Id leo in vitae turpis. Et
        magnis dis parturient montes nascetur ridiculus mus mauris vitae. Turpis massa tincidunt dui ut ornare lectus
        sit. Tortor dignissim convallis aenean et tortor at risus. At imperdiet dui accumsan sit amet nulla facilisi.
        Odio eu feugiat pretium nibh ipsum. Massa massa ultricies mi quis hendrerit. At augue eget arcu dictum varius
        duis at consectetur. Velit ut tortor pretium viverra. At lectus urna duis convallis. Nibh sit amet commodo nulla
        facilisi nullam vehicula ipsum. Non enim praesent elementum facilisis. Amet mattis vulputate enim nulla aliquet.
        Condimentum vitae sapien pellentesque habitant morbi tristique.
      </p>
      <h2 className="mb-5 text-heading-4 text-todo">Nisl suscipit adipiscing bibendum</h2>
      <p className="mb-8 text-body-md font-arial text-todo">
        Nisl suscipit adipiscing bibendum est ultricies integer. Ac turpis egestas maecenas pharetra. Lorem ipsum dolor
        sit amet consectetur adipiscing elit. In ante metus dictum at tempor commodo ullamcorper a lacus. Tincidunt
        tortor aliquam nulla facilisi. Convallis tellus id interdum velit laoreet. In nulla posuere sollicitudin aliquam
        ultrices sagittis orci a. Pellentesque id nibh tortor id aliquet. Nullam ac tortor vitae purus faucibus ornare.
        Lectus sit amet est placerat in egestas erat imperdiet. Commodo viverra maecenas accumsan lacus vel facilisis
        volutpat est. Ac auctor augue mauris augue neque gravida in fermentum. Faucibus a pellentesque sit amet.
      </p>
      {actionBar &&
        createPortal(
          <div className="mx-auto flex max-w-[1140px] flex-wrap gap-4 px-5 py-4 sm:gap-5 sm:px-6 sm:py-5">
            <Button variant="white" label={`TODO: ${t('accept-preferences')}`} />
            <Button variant="white" label={`TODO: ${t('edit')}`} />
            <Button variant="white-delete" label={`TODO: ${t('remove-approval')}`} />
          </div>,
          actionBar,
        )}
    </>
  );
};

export default CookiePolicy;

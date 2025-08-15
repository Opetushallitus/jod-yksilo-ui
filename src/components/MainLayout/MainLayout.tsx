import { useMediaQueries } from '@jod/design-system';
import { Breadcrumb } from '../Breadcrumb/Breadcrumb';

interface MainLayoutProps {
  children: React.ReactNode;
  navChildren?: React.ReactNode;
}

export const MainLayout = ({ children, navChildren }: MainLayoutProps) => {
  const { lg } = useMediaQueries();

  return (
    <div className="mx-auto grid w-full max-w-[1140px] grow grid-cols-3 gap-6 px-5 pb-6 pt-8 sm:px-6 print:p-0">
      <Breadcrumb />

      {lg && navChildren && (
        <aside className="order-last col-span-1 print:hidden">
          <nav role="navigation">{navChildren}</nav>
        </aside>
      )}
      <main role="main" className="col-span-3 lg:col-span-2 print:col-span-3" id="jod-main">
        {children}
      </main>
    </div>
  );
};

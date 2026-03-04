import { useMediaQueries } from '@jod/design-system';
import { Breadcrumb } from '../Breadcrumb/Breadcrumb';

interface MainLayoutProps {
  children: React.ReactNode;
  navChildren?: React.ReactNode;
  hideBreadcrumb?: boolean;
}

export const MainLayout = ({ children, navChildren, hideBreadcrumb = false }: MainLayoutProps) => {
  const { lg } = useMediaQueries();

  return (
    <div
      className="mx-auto grid w-full max-w-[1140px] grow grid-cols-3 gap-6 pb-6 pt-11 print:flex print:p-0"
      data-testid="main-layout"
    >
      {!hideBreadcrumb && (
        <div className="col-span-3 px-5 sm:px-6">
          <Breadcrumb />
        </div>
      )}

      {lg && navChildren && (
        <aside className="order-last col-span-1 print:hidden mr-5 sm:mr-6" data-testid="sidebar">
          <nav role="navigation" data-testid="sidebar-nav">
            {navChildren}
          </nav>
        </aside>
      )}
      <main role="main" className="col-span-3 lg:col-span-2 print:col-span-3" id="jod-main" data-testid="main-content">
        {children}
      </main>
    </div>
  );
};

import { useMediaQueries } from '@jod/design-system';
import { Breadcrumb } from '../Breadcrumb/Breadcrumb';

interface MainLayoutProps {
  children: React.ReactNode;
  navChildren?: React.ReactNode;
}

export const MainLayout = ({ children, navChildren }: MainLayoutProps) => {
  const { lg } = useMediaQueries();

  return (
    <div
      className="mx-auto grid w-full max-w-[1140px] grow grid-cols-3 gap-6 px-5 pb-6 pt-11 sm:px-6 print:p-0"
      data-testid="main-layout"
    >
      <Breadcrumb />

      {lg && navChildren && (
        <aside className="order-last col-span-1 print:hidden" data-testid="sidebar">
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

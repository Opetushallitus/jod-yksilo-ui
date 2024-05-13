import { useMediaQueries } from '@jod/design-system';

interface MainLayoutProps {
  children: React.ReactNode;
  navChildren: React.ReactNode;
}

export const MainLayout = ({ children, navChildren }: MainLayoutProps) => {
  const { sm } = useMediaQueries();

  return (
    <div className="mx-auto grid max-w-[1140px] grow grid-cols-6 gap-6 px-5 pb-6 pt-8 sm:px-6 print:p-0">
      {sm && (
        <aside className="order-last col-span-2 print:hidden">
          <nav role="navigation" className="sticky top-0 pt-[96px]">
            {navChildren}
          </nav>
        </aside>
      )}
      <main role="main" className="col-span-6 sm:col-span-4 print:col-span-6" id="jod-main">
        {children}
      </main>
    </div>
  );
};

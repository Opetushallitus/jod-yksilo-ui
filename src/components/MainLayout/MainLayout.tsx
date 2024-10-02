import { useMediaQueries } from '@jod/design-system';

interface MainLayoutProps {
  children: React.ReactNode;
  navChildren: React.ReactNode;
}

export const MainLayout = ({ children, navChildren }: MainLayoutProps) => {
  const { sm } = useMediaQueries();

  return (
    <div className="mx-auto grid w-full max-w-[1140px] grow grid-cols-3 gap-6 px-5 pb-6 pt-8 sm:px-6 print:p-0">
      {sm && (
        <aside className="order-last col-span-1 print:hidden">
          <nav
            role="navigation"
            className="sticky top-[96px] max-h-[calc(100vh-196px)] overflow-y-auto scrollbar-hidden"
          >
            {navChildren}
          </nav>
        </aside>
      )}
      <main role="main" className="col-span-3 sm:col-span-2 print:col-span-3" id="jod-main">
        {children}
      </main>
    </div>
  );
};

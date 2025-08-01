import i18n from '@/i18n/config';
import { cx } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, UIMatch, useMatches, useSearchParams } from 'react-router';

type BreadcrumbTo =
  | {
      current: true;
      to?: never;
    }
  | {
      current?: false;
      to: string;
    };

export type BreadcrumbLinkProps = {
  children: React.ReactNode;
} & BreadcrumbTo;

export const BreadcrumbLink = ({ to, children, current }: BreadcrumbLinkProps) => {
  return (
    <li>
      {current ? (
        <span className="text-black" aria-current="location">
          {children}
        </span>
      ) : (
        <>
          <NavLink
            to={to}
            className={cx('todo', {
              'text-black': current,
            })}
          >
            {children}
          </NavLink>
          <span className="text-secondary-5 w-[8px] mx-2" aria-hidden={true}>
            /
          </span>
        </>
      )}
    </li>
  );
};

interface YksiloHandle {
  title?: string;
  type?: string;
}

const useTypedMatches = () => useMatches() as UIMatch<unknown, YksiloHandle>[];

export const Breadcrumb = () => {
  const matches = useTypedMatches();
  const [searchParams] = useSearchParams();

  const {
    t,
    i18n: { language },
  } = useTranslation();

  const crumbLinks = React.useCallback(() => {
    const validMatches = matches.filter((m) => m.handle?.title || m.id === 'root');

    const isToolPage = validMatches.some((item) => item.handle?.title === i18n.t('tool.title'));
    if (isToolPage) {
      validMatches.push({
        data: {},
        handle: { title: '' },
        id: '',
        params: {},
        pathname: '',
      });
    }

    const breadcrumbParts = validMatches.map((match: UIMatch<unknown, YksiloHandle>, index: number) => {
      let pathname = match.pathname;
      let title = match.handle?.title;

      if (match.handle?.title === i18n.t('tool.title')) {
        if (searchParams.get('origin') === 'favorites') {
          title = i18n.t('profile.favorites.title');
          pathname = `/${language}/${t('slugs.profile.index')}/${i18n.t('slugs.profile.favorites')}`;
        } else {
          title = i18n.t('tool.title');
          pathname = `/${language}/${t('slugs.tool.index')}`;
        }
      }
      const isLast = index === validMatches.length - 1;
      const isRoot = match.id === 'root';

      if (isLast && !title) {
        return;
      }
      return isLast ? (
        <BreadcrumbLink key={match.id} current>
          {title}
        </BreadcrumbLink>
      ) : (
        <BreadcrumbLink key={match.id} to={pathname}>
          {isRoot ? t('front-page') : title}
        </BreadcrumbLink>
      );
    });
    return breadcrumbParts;
  }, [language, matches, searchParams, t]);

  return (
    <nav aria-label={t('current-location')} className="text-accent text-body-sm font-bold col-span-3 mb-3 print:hidden">
      <ol className="flex flex-row flex-wrap gap-y-2">{crumbLinks()}</ol>
    </nav>
  );
};

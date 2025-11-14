import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
  // Get locale from cookie or default to 'en'
  const cookieStore = cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE');
  const locale = localeCookie?.value || 'en';

  // Load all message namespaces
  const [common, auth, tasks, wallet, dashboard, admin, profile, legal, homepage] = await Promise.all([
    import(`../locales/${locale}/common.json`),
    import(`../locales/${locale}/auth.json`),
    import(`../locales/${locale}/tasks.json`),
    import(`../locales/${locale}/wallet.json`),
    import(`../locales/${locale}/dashboard.json`),
    import(`../locales/${locale}/admin.json`),
    import(`../locales/${locale}/profile.json`),
    import(`../locales/${locale}/legal.json`),
    import(`../locales/${locale}/homepage.json`),
  ]);

  return {
    locale,
    messages: {
      ...common.default,
      auth: auth.default,
      tasks: tasks.default,
      wallet: wallet.default,
      dashboard: dashboard.default,
      admin: admin.default,
      profile: profile.default,
      legal: legal.default,
      homepage: homepage.default,
    },
  };
});

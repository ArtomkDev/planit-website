import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

const locales = ['uk', 'en'];

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;
  
  if (!locale || !locales.includes(locale)) notFound();
  
  return {
    locale,
    messages: (await import(`./locales/${locale}.json`)).default
  };
});
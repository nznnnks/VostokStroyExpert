export function getConfiguredOrigin(site?: URL): string {
  const siteOrigin = site?.origin ? String(site.origin) : "";
  if (siteOrigin) return siteOrigin;

  const envOrigin = import.meta.env.PUBLIC_SITE_URL ? String(import.meta.env.PUBLIC_SITE_URL) : "";
  if (envOrigin) return envOrigin;

  const astroSite = import.meta.env.SITE ? String(import.meta.env.SITE) : "";
  if (astroSite) return astroSite;

  return "https://www.climatrade.store";
}


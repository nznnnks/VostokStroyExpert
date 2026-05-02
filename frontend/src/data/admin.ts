export type AdminNavItem = {
  key: string;
  label: string;
  href: string;
  icon: string;
  badge?: string;
};

export const adminNav: AdminNavItem[] = [
  { key: "dashboard", label: "Дашборд", href: "/admin", icon: "/admin/dashboard.svg" },
  { key: "requests", label: "Заявки", href: "/admin/requests", icon: "/admin/requests-projects.svg" },
  { key: "orders", label: "Заказы", href: "/admin/orders", icon: "/admin/orders.svg" },
  { key: "clients", label: "Клиенты", href: "/admin/clients", icon: "/admin/client-news-catalog.svg" },
  { key: "news", label: "Новости", href: "/admin/news", icon: "/admin/client-news-catalog.svg" },
  { key: "catalog", label: "Каталог", href: "/admin/catalog", icon: "/admin/client-news-catalog.svg" },
  { key: "seo", label: "SEO", href: "/admin/seo", icon: "/admin/settings.svg" },
  { key: "settings", label: "Настройки", href: "/admin/settings", icon: "/admin/settings.svg" },
];

export const adminUser = {
  name: "Александр В.",
  avatar: "/admin/profile.png",
};

export const adminRequests = [
  {
    id: "REQ-1023",
    client: "Nordic Museum",
    service: "РђРєСѓСЃС‚РёС‡РµСЃРєР°СЏ РЅР°СЃС‚СЂРѕР№РєР°",
    budget: "1 250 000 в‚Ѕ",
    status: "РќРѕРІР°СЏ",
    date: "07.04.2026",
  },
  {
    id: "REQ-1021",
    client: "Skyline Residences",
    service: "РўРµРїР»РѕРІРѕР№ РєРѕРЅС‚СЂРѕР»СЊ",
    budget: "980 000 в‚Ѕ",
    status: "Р’ СЂР°Р±РѕС‚Рµ",
    date: "05.04.2026",
  },
  {
    id: "REQ-1018",
    client: "Central House",
    service: "РћС‡РёСЃС‚РєР° РІРѕР·РґСѓС…Р°",
    budget: "640 000 в‚Ѕ",
    status: "РљРѕРјРјРµСЂС‡РµСЃРєРѕРµ",
    date: "02.04.2026",
  },
];
export const adminOrders = [
  {
    id: "AE-7729-01",
    client: "РђСЂС…РёС‚РµРєС‚СѓСЂРЅРѕРµ Р±СЋСЂРѕ A1",
    items: "Monolith V2, 2 РїРѕР·РёС†РёРё",
    amount: "284 500 в‚Ѕ",
    status: "РћРїР»Р°С‚Р° РѕР¶РёРґР°РµС‚СЃСЏ",
    date: "06.04.2026",
  },
  {
    id: "AE-8114-04",
    client: "Green Valley Office",
    items: "AerС–s Glass Control",
    amount: "18 900 в‚Ѕ",
    status: "РЎР±РѕСЂРєР°",
    date: "03.04.2026",
  },
  {
    id: "AE-9002-12",
    client: "Industrial Park Beta",
    items: "Omni-Flow X1",
    amount: "245 900 в‚Ѕ",
    status: "Р”РѕСЃС‚Р°РІРєР°",
    date: "31.03.2026",
  },
];

export const adminClients = [
  {
    name: "Nordic Heavy",
    segment: "РљРѕРјРјРµСЂС‡РµСЃРєРёРµ РѕР±СЉРµРєС‚С‹",
    manager: "РљРёСЂРёР»Р» Рњ.",
    orders: "12",
    status: "РђРєС‚РёРІРµРЅ",
  },
  {
    name: "Aeris Pro",
    segment: "Р§Р°СЃС‚РЅС‹Рµ СЂРµР·РёРґРµРЅС†РёРё",
    manager: "РђР»РёРЅР° Рљ.",
    orders: "7",
    status: "РђРєС‚РёРІРµРЅ",
  },
  {
    name: "Regent",
    segment: "HoReCa",
    manager: "РћР»РµРі РЎ.",
    orders: "4",
    status: "РќР° РїР°СѓР·Рµ",
  },
];

export const adminNews = [
  {
    title: "РРЅР¶РµРЅРµСЂРёСЏ РєР°Рє С‡Р°СЃС‚СЊ С‚РёС€РёРЅС‹",
    category: "РРЅС‚РµРіСЂР°С†РёСЏ",
    date: "01.04.2026",
    status: "РћРїСѓР±Р»РёРєРѕРІР°РЅРѕ",
  },
  {
    title: "РЎРµСЂРІРёСЃ РїРѕСЃР»Рµ Р·Р°РїСѓСЃРєР°",
    category: "Р­РєСЃРїР»СѓР°С‚Р°С†РёСЏ",
    date: "26.03.2026",
    status: "Р§РµСЂРЅРѕРІРёРє",
  },
  {
    title: "РќР°РґС‘Р¶РЅРѕСЃС‚СЊ РїСЂРµРјРёР°Р»СЊРЅРѕР№ РёРЅР¶РµРЅРµСЂРёРё",
    category: "РџРѕРґС…РѕРґ",
    date: "18.03.2026",
    status: "РћРїСѓР±Р»РёРєРѕРІР°РЅРѕ",
  },
];

export const adminCatalog = [
  {
    title: "Omni-Flow X1",
    brand: "Aeris Industrial",
    price: "245 900 в‚Ѕ",
    stock: "Р’ РЅР°Р»РёС‡РёРё",
  },
  {
    title: "Titan Core V3",
    brand: "Nordic Heavy",
    price: "412 000 в‚Ѕ",
    stock: "РџРѕРґ Р·Р°РєР°Р·",
  },
  {
    title: "Matrix 7",
    brand: "Aeris Pro",
    price: "118 500 в‚Ѕ",
    stock: "Р’ РЅР°Р»РёС‡РёРё",
  },
];

export type ProductFilter = {
  parameterId: string;
  parameterName: string;
  parameterSlug: string;
  parameterType: "TEXT" | "NUMBER";
  groupId: string;
  groupName: string;
  groupSlug: string;
  unit?: string;
  value: string;
  numericValue?: number | null;
};

export type Product = {
  slug: string;
  image: string;
  gallery?: string[];
  brand: string;
  brandLabel: string;
  title: string;
  article: string;
  category: string;
  categorySlug?: string;
  country: string;
  type: string;
  power: number;
  volume: number;
  price: number;
  rating: string;
  efficiency: string;
  efficiencyClass?: string;
  coverage?: string;
  acoustics?: string;
  filtration?: string;
  filters?: ProductFilter[];
  description?: string[];
  relatedSlugs?: string[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
};

export const products: Product[] = [
  {
    slug: "vertex-roof-chiller",
    image: "/catalog/product-4.png",
    brand: "Zenith Industrial",
    brandLabel: "ZENITH IND.",
    title: "Крышный чиллер Vertex",
    article: "AER-310-VRTX",
    category: "Системы климат-контроля",
    country: "Германия",
    type: "Котлы",
    power: 45,
    volume: 32,
    price: 890000,
    rating: "Рейтинг: 45.0 кВт",
    efficiency: "Эффективность: SEER 16",
    efficiencyClass: "A+++ Industrial",
    coverage: "До 220 м²",
    acoustics: "31 дБ",
    filtration: "Industrial HEPA",
    description: [
      "Vertex рассчитан на коммерческие и производственные площадки с высокой пиковой нагрузкой.",
      "Решение подходит для объектов, где приоритетом являются надёжность, сервисопригодность и ровный температурный режим в течение суток.",
    ],
    relatedSlugs: ["arctic-flow-geothermal-4", "aura-wall-series"],
  },
  {
    slug: "aura-wall-series",
    image: "/catalog/product-5.png",
    brand: "Aeris Pro",
    brandLabel: "AERIS PURE",
    title: "Настенная серия Aura",
    article: "AER-118-AURA",
    category: "Системы климат-контроля",
    country: "Япония",
    type: "Устройства климат контроля",
    power: 5.5,
    volume: 5,
    price: 94200,
    rating: "Рейтинг: 5.5 кВт",
    efficiency: "Эффективность: SEER 26",
    efficiencyClass: "A Residential",
    coverage: "До 35 м²",
    acoustics: "16 дБ",
    filtration: "HEPA 11",
    description: [
      "Aura — настенная серия для тихих приватных помещений, кабинетов и комнат отдыха.",
      "Она хорошо работает там, где нужна спокойная визуальная интеграция и минимальный уровень шума ночью.",
    ],
    relatedSlugs: ["arctic-flow-geothermal-4", "vertex-roof-chiller"],
  },
  {
    slug: "arctic-flow-geothermal-4",
    image: "/catalog/product-6.png",
    brand: "Nordic Heavy",
    brandLabel: "NORDIC HEAVY",
    title: "Arctic Flow Geothermal 4",
    article: "AER-401-AFG4",
    category: "Системы климат-контроля",
    country: "Швейцария",
    type: "Другое",
    power: 22,
    volume: 20,
    price: 560000,
    rating: "Рейтинг: 22.0 кВт",
    efficiency: "Эффективность: SEER 20",
    efficiencyClass: "A++ Geo",
    coverage: "До 150 м²",
    acoustics: "24 дБ",
    filtration: "HEPA 14 Industrial",
    description: [
      "Geothermal 4 проектировался для энергоэффективных объектов с опорой на геотермальный контур и долгий срок эксплуатации.",
      "Подходит для частных домов и небольших общественных зданий, где важна экономичность и устойчивость системы круглый год.",
    ],
    relatedSlugs: ["vertex-roof-chiller", "aura-wall-series"],
  },
];

export const featuredProduct: Product = {
  slug: "aura-wall-series",
  image: "/catalog/product-5.png",
  gallery: ["/catalog/product-5.png"],
  brand: "Aeris Pro",
  brandLabel: "AERIS PURE",
  title: "Настенная серия Aura",
  article: "AER-118-AURA",
  category: "Системы климат-контроля",
  country: "Япония",
  type: "Устройства климат контроля",
  power: 5.5,
  volume: 5,
  price: 94200,
  rating: "Рейтинг: 5.5 кВт",
  efficiency: "Эффективность: SEER 26",
  efficiencyClass: "A Residential",
  coverage: "До 35 м²",
  acoustics: "16 дБ",
  filtration: "HEPA 11",
  description: [
    "Aura — настенная серия для тихих приватных помещений, кабинетов и комнат отдыха.",
    "Она хорошо работает там, где нужна спокойная визуальная интеграция и минимальный уровень шума ночью.",
  ],
  relatedSlugs: ["vertex-roof-chiller", "arctic-flow-geothermal-4"],
};

export function formatPrice(price: number) {
  return new Intl.NumberFormat("ru-RU").format(price) + "\u00A0₽";
}

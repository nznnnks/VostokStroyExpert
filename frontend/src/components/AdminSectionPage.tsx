import { useEffect, useMemo, useState } from "react";

import { adminNav } from "../data/admin";
import { ApiError } from "../lib/api-client";
import { getStoredAuthSession } from "../lib/auth";
import {
  createAdminNews,
  createAdminProduct,
  createAdminCategory,
  createAdminClientProfile,
  createAdminService,
  createAdminDiscount,
  createAdminUser,
  createAdminPayment,
  createUser,
  deleteAdminCategory,
  deleteAdminClientProfile,
  deleteAdminNews,
  deleteAdminOrder,
  deleteAdminProduct,
  deleteAdminService,
  deleteAdminDiscount,
  deleteAdminUser,
  deleteAdminPayment,
  deleteUser,
  fallbackAdminSectionData,
  loadAdminSectionData,
  loadAdminCategories,
  loadAdminServices,
  loadAdminDiscounts,
  loadAdminUsers,
  loadUsers,
  loadAdminPayments,
  loadAdminNewsById,
  loadAdminProductById,
  type AdminCategoryView,
  type AdminCatalogView,
  type AdminClientView,
  type AdminNewsView,
  type AdminOrderView,
  updateAdminNews,
  updateAdminOrderStatus,
  updateAdminProduct,
  updateAdminClientProfile,
  updateAdminCategory,
  updateAdminService,
  updateAdminDiscount,
  updateAdminUser,
  updateAdminPayment,
  updateUser,
} from "../lib/backend-api";

type AdminSectionPageProps = {
  activeKey: string;
  title: string;
  subtitle?: string;
};

function AdminTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: Array<Array<string | JSX.Element>>;
}) {
  return (
    <div className="overflow-hidden border border-[#e8e3db] bg-white">
      <div className="grid border-b border-[#ece8e1] px-8 py-5 text-[12px] uppercase tracking-[3px] text-[#b1ada6] [font-family:Jaldi,'JetBrains_Mono',monospace]" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
        {columns.map((col) => (
          <span key={col}>{col}</span>
        ))}
      </div>
      <div className="divide-y divide-[#ece8e1]">
        {rows.map((row, index) => (
          <div key={`${index}-${String(row[0])}`} className="grid items-center gap-4 px-8 py-6 text-[16px] text-[#2b2a27]" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
            {row.map((cell, cellIndex) => (
              <div key={`${index}-${cellIndex}`} className="min-w-0">
                {cell}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ tone, label }: { tone: "green" | "gold" | "gray" | "amber"; label: string }) {
  const toneClasses: Record<typeof tone, string> = {
    green: "bg-[#e7f6ee] text-[#2a7b4a]",
    gold: "bg-[#f8f0db] text-[#8a6a2a]",
    gray: "bg-[#f0efec] text-[#7f7a73]",
    amber: "bg-[#f5e9e2] text-[#8a4d2c]",
  };

  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-[13px] ${toneClasses[tone]}`}>{label}</span>;
}

function SectionMessage({ title, description }: { title: string; description: string }) {
  return (
    <div className="mt-10 border border-[#e8e3db] bg-white p-8">
      <h2 className="text-[28px] [font-family:'Cormorant_Garamond',serif]">{title}</h2>
      <p className="mt-4 max-w-[760px] text-[18px] leading-8 text-[#7a7a75]">{description}</p>
    </div>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-");
}

export function AdminSectionPage({ activeKey, title, subtitle }: AdminSectionPageProps) {
  const session = getStoredAuthSession();
  const adminName =
    [session?.admin?.firstName, session?.admin?.lastName].filter(Boolean).join(" ").trim() ||
    session?.admin?.email ||
    "Администратор";

  const [clients, setClients] = useState<AdminClientView[]>(fallbackAdminSectionData.clients);
  const [orders, setOrders] = useState<AdminOrderView[]>(fallbackAdminSectionData.orders);
  const [news, setNews] = useState<AdminNewsView[]>(fallbackAdminSectionData.news);
  const [catalog, setCatalog] = useState<AdminCatalogView[]>(fallbackAdminSectionData.catalog);
  const [categories, setCategories] = useState<AdminCategoryView[]>([]);
  const [services, setServices] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [discounts, setDiscounts] = useState<Array<{ id: string; name: string; value: string }>>([]);
  const [adminUsers, setAdminUsers] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string; role: string }>>([]);
  const [payments, setPayments] = useState<Array<{ id: string; orderId: string; amount: string }>>([]);
  const [loading, setLoading] = useState(activeKey === "clients" || activeKey === "orders" || activeKey === "news" || activeKey === "catalog");
  const [error, setError] = useState<Error | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [secondaryFilter, setSecondaryFilter] = useState("all");
  const [newsForm, setNewsForm] = useState({
    id: "",
    title: "",
    slug: "",
    category: "",
    excerpt: "",
    status: "DRAFT",
  });
  const [catalogForm, setCatalogForm] = useState({
    id: "",
    name: "",
    slug: "",
    sku: "",
    price: "",
    oldPrice: "",
    brandLabel: "",
    brand: "",
    country: "",
    type: "",
    shortDescription: "",
    description: "",
    efficiency: "",
    efficiencyClass: "",
    coverage: "",
    acoustics: "",
    filtration: "",
    power: "",
    volume: "",
    images: "",
    stock: "",
    status: "DRAFT",
    categoryId: "",
  });
  const [categoryForm, setCategoryForm] = useState({
    id: "",
    name: "",
    slug: "",
    description: "",
    parentId: "",
  });
  const [clientForm, setClientForm] = useState({
    id: "",
    userId: "",
    firstName: "",
    lastName: "",
    companyName: "",
    inn: "",
    contactPhone: "",
    addressLine1: "",
    city: "",
    postalCode: "",
    comment: "",
    personalDiscountPercent: "",
  });
  const [orderForm, setOrderForm] = useState({
    id: "",
    status: "NEW",
  });
  const [serviceForm, setServiceForm] = useState({
    id: "",
    name: "",
    slug: "",
    shortDescription: "",
    description: "",
    heroTitle: "",
    lead: "",
    bullets: "",
    imageUrl: "",
    basePrice: "",
    durationHours: "",
    isActive: true,
  });
  const [discountForm, setDiscountForm] = useState({
    id: "",
    name: "",
    code: "",
    description: "",
    type: "PERCENT",
    scope: "ORDER",
    value: "",
    isActive: true,
    startsAt: "",
    endsAt: "",
    productId: "",
    categoryId: "",
    clientProfileId: "",
  });
  const [adminUserForm, setAdminUserForm] = useState({
    id: "",
    email: "",
    passwordHash: "",
    firstName: "",
    lastName: "",
    role: "MANAGER",
    isActive: true,
  });
  const [userForm, setUserForm] = useState({
    id: "",
    email: "",
    phone: "",
    passwordHash: "",
    firstName: "",
    lastName: "",
    role: "CLIENT",
    status: "ACTIVE",
  });
  const [paymentForm, setPaymentForm] = useState({
    id: "",
    orderId: "",
    method: "CARD",
    status: "PENDING",
    amount: "",
    provider: "",
    transactionId: "",
    currency: "RUB",
    paidAt: "",
  });

  async function refreshAdminData() {
    const data = await loadAdminSectionData();
    setClients(data.clients);
    setOrders(data.orders);
    setNews(data.news);
    setCatalog(data.catalog);

    if (activeKey === "catalog") {
      const nextCategories = await loadAdminCategories();
      setCategories(nextCategories);
      setCatalogForm((prev) => ({ ...prev, categoryId: prev.categoryId || nextCategories[0]?.id || "" }));
    }

    if (activeKey === "projects") {
      const nextServices = await loadAdminServices();
      setServices(nextServices.map((item) => ({ id: item.id, name: item.name, slug: item.slug })));
    }

    if (activeKey === "requests") {
      const nextPayments = await loadAdminPayments();
      setPayments(
        nextPayments.map((item) => ({
          id: item.id,
          orderId: item.orderId,
          amount: `${item.amount} ${item.currency ?? "RUB"}`,
        })),
      );
    }

    if (activeKey === "settings") {
      const [nextDiscounts, nextAdmins, nextUsers] = await Promise.all([
        loadAdminDiscounts(),
        loadAdminUsers(),
        loadUsers(),
      ]);
      setDiscounts(
        nextDiscounts
          .filter((item): item is NonNullable<typeof item> => Boolean(item))
          .map((item) => ({ id: item.id, name: item.name, value: String(item.value) })),
      );
      setAdminUsers(
        nextAdmins.map((item) => ({
          id: item.id,
          name: [item.firstName, item.lastName].filter(Boolean).join(" ") || item.email,
          email: item.email,
        })),
      );
      setUsers(
        nextUsers.map((item) => ({
          id: item.id,
          name: [item.clientProfile?.firstName, item.clientProfile?.lastName].filter(Boolean).join(" ") || item.email,
          email: item.email,
          role: item.role,
        })),
      );
    }
  }

  async function handleNewsSubmit() {
    const titleValue = newsForm.title.trim();
    const resolvedSlug = newsForm.slug.trim() || slugify(titleValue);

    if (!titleValue || !resolvedSlug) {
      setActionError("Заполните название и slug для новости.");
      return;
    }

    setActionLoading(true);
    setActionError(null);

    try {
      if (newsForm.id) {
        await updateAdminNews(newsForm.id, {
          title: titleValue,
          slug: resolvedSlug,
          excerpt: newsForm.excerpt.trim() || undefined,
          category: newsForm.category.trim() || undefined,
          status: newsForm.status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
        });
      } else {
        await createAdminNews({
          title: titleValue,
          slug: resolvedSlug,
          excerpt: newsForm.excerpt.trim() || undefined,
          category: newsForm.category.trim() || undefined,
          status: newsForm.status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
        });
      }

      await refreshAdminData();
      setNewsForm({ id: "", title: "", slug: "", category: "", excerpt: "", status: "DRAFT" });
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : "Не удалось сохранить новость.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleNewsDelete() {
    if (!newsForm.id) {
      return;
    }

    setActionLoading(true);
    setActionError(null);

    try {
      await deleteAdminNews(newsForm.id);
      await refreshAdminData();
      setNewsForm({ id: "", title: "", slug: "", category: "", excerpt: "", status: "DRAFT" });
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : "Не удалось удалить новость.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCatalogSubmit() {
    const nameValue = catalogForm.name.trim();
    const resolvedSlug = catalogForm.slug.trim() || slugify(nameValue);
    const priceValue = Number(catalogForm.price);
    const oldPriceValue = catalogForm.oldPrice ? Number(catalogForm.oldPrice) : undefined;
    const stockValue = catalogForm.stock ? Number(catalogForm.stock) : undefined;
    const powerValue = catalogForm.power ? Number(catalogForm.power) : undefined;
    const volumeValue = catalogForm.volume ? Number(catalogForm.volume) : undefined;
    const imagesValue = catalogForm.images
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (!nameValue || !resolvedSlug || !catalogForm.sku.trim() || !catalogForm.categoryId || Number.isNaN(priceValue)) {
      setActionError("Заполните обязательные поля товара: название, slug, артикул, цена, категория.");
      return;
    }

    setActionLoading(true);
    setActionError(null);

    try {
      const payload = {
        categoryId: catalogForm.categoryId,
        slug: resolvedSlug,
        sku: catalogForm.sku.trim(),
        name: nameValue,
        price: priceValue,
        oldPrice: Number.isNaN(oldPriceValue ?? 0) ? undefined : oldPriceValue,
        brandLabel: catalogForm.brandLabel.trim() || undefined,
        brand: catalogForm.brand.trim() || undefined,
        country: catalogForm.country.trim() || undefined,
        type: catalogForm.type.trim() || undefined,
        shortDescription: catalogForm.shortDescription.trim() || undefined,
        description: catalogForm.description.trim() || undefined,
    efficiency: catalogForm.efficiency.trim() || undefined,
        efficiencyClass: catalogForm.efficiencyClass.trim() || undefined,
        coverage: catalogForm.coverage.trim() || undefined,
        acoustics: catalogForm.acoustics.trim() || undefined,
        filtration: catalogForm.filtration.trim() || undefined,
        power: Number.isNaN(powerValue ?? 0) ? undefined : powerValue,
        volume: Number.isNaN(volumeValue ?? 0) ? undefined : volumeValue,
        images: imagesValue.length ? imagesValue : undefined,
        stock: Number.isNaN(stockValue ?? 0) ? undefined : stockValue,
        status: catalogForm.status as "ACTIVE" | "DRAFT" | "ARCHIVED",
      };

      if (catalogForm.id) {
        await updateAdminProduct(catalogForm.id, payload);
      } else {
        await createAdminProduct(payload);
      }

      await refreshAdminData();
      setCatalogForm({
        id: "",
        name: "",
        slug: "",
        sku: "",
        price: "",
        oldPrice: "",
        brandLabel: "",
        brand: "",
        country: "",
        type: "",
        shortDescription: "",
        description: "",
        efficiency: "",
        efficiencyClass: "",
        coverage: "",
        acoustics: "",
        filtration: "",
        power: "",
        volume: "",
        images: "",
        stock: "",
        status: "DRAFT",
        categoryId: categories[0]?.id || "",
      });
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : "Не удалось сохранить товар.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCatalogDelete() {
    if (!catalogForm.id) {
      return;
    }

    setActionLoading(true);
    setActionError(null);

    try {
      await deleteAdminProduct(catalogForm.id);
      await refreshAdminData();
      setCatalogForm({
        id: "",
        name: "",
        slug: "",
        sku: "",
        price: "",
        oldPrice: "",
        brandLabel: "",
        brand: "",
        country: "",
        type: "",
        shortDescription: "",
        description: "",
        efficiency: "",
        efficiencyClass: "",
        coverage: "",
        acoustics: "",
        filtration: "",
        power: "",
        volume: "",
        images: "",
        stock: "",
        status: "DRAFT",
        categoryId: categories[0]?.id || "",
      });
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : "Не удалось удалить товар.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSelectNews(id: string) {
    setActionLoading(true);
    setActionError(null);

    try {
      const item = await loadAdminNewsById(id);
      setNewsForm({
        id: item.id,
        title: item.title,
        slug: item.slug,
        category: item.category ?? "",
        excerpt: item.excerpt ?? "",
        status: item.status ?? "DRAFT",
      });
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : "Не удалось загрузить новость.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSelectProduct(id: string) {
    setActionLoading(true);
    setActionError(null);

    try {
      const item = await loadAdminProductById(id);
      setCatalogForm({
        id: item.id,
        name: item.name,
        slug: item.slug,
        sku: item.sku,
        price: String(item.price),
        oldPrice: item.oldPrice ? String(item.oldPrice) : "",
        brandLabel: item.brandLabel ?? item.brand ?? "",
        brand: item.brand ?? "",
        country: item.country ?? "",
        type: item.type ?? "",
        shortDescription: item.shortDescription ?? "",
        description: item.description ?? "",
        efficiency: item.efficiency ?? "",
        efficiencyClass: item.efficiencyClass ?? "",
        coverage: item.coverage ?? "",
        acoustics: item.acoustics ?? "",
        filtration: item.filtration ?? "",
        power: item.power ? String(item.power) : "",
        volume: item.volume ? String(item.volume) : "",
        images: item.images?.join(", ") ?? "",
        stock: item.stock !== undefined && item.stock !== null ? String(item.stock) : "",
        status: item.status ?? "DRAFT",
        categoryId: item.category?.id ?? item.categoryId ?? categories[0]?.id ?? "",
      });
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : "Не удалось загрузить товар.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCategorySubmit() {
    const nameValue = categoryForm.name.trim();
    const resolvedSlug = categoryForm.slug.trim() || slugify(nameValue);

    if (!nameValue || !resolvedSlug) {
      setActionError("Заполните название и slug категории.");
      return;
    }

    setActionLoading(true);
    setActionError(null);

    try {
      if (categoryForm.id) {
        await updateAdminCategory(categoryForm.id, {
          name: nameValue,
          slug: resolvedSlug,
          description: categoryForm.description.trim() || undefined,
          parentId: categoryForm.parentId || undefined,
        });
      } else {
        await createAdminCategory({
          name: nameValue,
          slug: resolvedSlug,
          description: categoryForm.description.trim() || undefined,
          parentId: categoryForm.parentId || undefined,
        });
      }

      const nextCategories = await loadAdminCategories();
      setCategories(nextCategories);
      setCatalogForm((prev) => ({ ...prev, categoryId: prev.categoryId || nextCategories[0]?.id || "" }));
      setCategoryForm({ id: "", name: "", slug: "", description: "", parentId: "" });
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : "Не удалось сохранить категорию.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCategoryDelete() {
    if (!categoryForm.id) {
      return;
    }

    setActionLoading(true);
    setActionError(null);

    try {
      await deleteAdminCategory(categoryForm.id);
      const nextCategories = await loadAdminCategories();
      setCategories(nextCategories);
      setCatalogForm((prev) => ({ ...prev, categoryId: nextCategories[0]?.id || "" }));
      setCategoryForm({ id: "", name: "", slug: "", description: "", parentId: "" });
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : "Не удалось удалить категорию.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleClientSubmit() {
    const firstName = clientForm.firstName.trim();
    const userId = clientForm.userId.trim();

    if (!firstName || !userId) {
      setActionError("Для клиента обязателен userId и имя.");
      return;
    }

    setActionLoading(true);
    setActionError(null);

    try {
      const payload = {
        userId,
        firstName,
        lastName: clientForm.lastName.trim() || undefined,
        companyName: clientForm.companyName.trim() || undefined,
        inn: clientForm.inn.trim() || undefined,
        contactPhone: clientForm.contactPhone.trim() || undefined,
        addressLine1: clientForm.addressLine1.trim() || undefined,
        city: clientForm.city.trim() || undefined,
        postalCode: clientForm.postalCode.trim() || undefined,
        comment: clientForm.comment.trim() || undefined,
        personalDiscountPercent: clientForm.personalDiscountPercent
          ? Number(clientForm.personalDiscountPercent)
          : undefined,
      };

      if (clientForm.id) {
        await updateAdminClientProfile(clientForm.id, payload);
      } else {
        await createAdminClientProfile(payload);
      }

      await refreshAdminData();
      setClientForm({
        id: "",
        userId: "",
        firstName: "",
        lastName: "",
        companyName: "",
        inn: "",
        contactPhone: "",
        addressLine1: "",
        city: "",
        postalCode: "",
        comment: "",
        personalDiscountPercent: "",
      });
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : "Не удалось сохранить клиента.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleClientDelete() {
    if (!clientForm.id) {
      return;
    }

    setActionLoading(true);
    setActionError(null);

    try {
      await deleteAdminClientProfile(clientForm.id);
      await refreshAdminData();
      setClientForm({
        id: "",
        userId: "",
        firstName: "",
        lastName: "",
        companyName: "",
        inn: "",
        contactPhone: "",
        addressLine1: "",
        city: "",
        postalCode: "",
        comment: "",
        personalDiscountPercent: "",
      });
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : "Не удалось удалить клиента.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleOrderStatusSave() {
    if (!orderForm.id) {
      setActionError("Выберите заказ для изменения статуса.");
      return;
    }

    setActionLoading(true);
    setActionError(null);

    try {
      await updateAdminOrderStatus(orderForm.id, orderForm.status as "NEW" | "PENDING_PAYMENT" | "PAID" | "ASSEMBLY" | "SHIPPING" | "DELIVERED" | "CANCELLED");
      await refreshAdminData();
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : "Не удалось обновить статус.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleOrderDelete() {
    if (!orderForm.id) {
      return;
    }

    setActionLoading(true);
    setActionError(null);

    try {
      await deleteAdminOrder(orderForm.id);
      await refreshAdminData();
      setOrderForm({ id: "", status: "NEW" });
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : "Не удалось удалить заказ.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleServiceSubmit() {
    const nameValue = serviceForm.name.trim();
    const resolvedSlug = serviceForm.slug.trim() || slugify(nameValue);
    const basePriceValue = serviceForm.basePrice ? Number(serviceForm.basePrice) : undefined;
    const durationValue = serviceForm.durationHours ? Number(serviceForm.durationHours) : undefined;
    const bulletsValue = serviceForm.bullets
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (!nameValue || !resolvedSlug) {
      setActionError("Название и slug услуги обязательны.");
      return;
    }

    setActionLoading(true);
    setActionError(null);

    try {
      const payload = {
        name: nameValue,
        slug: resolvedSlug,
        shortDescription: serviceForm.shortDescription.trim() || undefined,
        description: serviceForm.description.trim() || undefined,
        heroTitle: serviceForm.heroTitle.trim() || undefined,
        lead: serviceForm.lead.trim() || undefined,
        bullets: bulletsValue.length ? bulletsValue : undefined,
        imageUrl: serviceForm.imageUrl.trim() || undefined,
        basePrice: Number.isNaN(basePriceValue ?? 0) ? undefined : basePriceValue,
        durationHours: Number.isNaN(durationValue ?? 0) ? undefined : durationValue,
        isActive: serviceForm.isActive,
      };

      if (serviceForm.id) {
        await updateAdminService(serviceForm.id, payload);
      } else {
        await createAdminService(payload);
      }

      await refreshAdminData();
      setServiceForm({
        id: "",
        name: "",
        slug: "",
        shortDescription: "",
        description: "",
        heroTitle: "",
        lead: "",
        bullets: "",
        imageUrl: "",
        basePrice: "",
        durationHours: "",
        isActive: true,
      });
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : "Не удалось сохранить услугу.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleServiceDelete() {
    if (!serviceForm.id) {
      return;
    }

    setActionLoading(true);
    setActionError(null);

    try {
      await deleteAdminService(serviceForm.id);
      await refreshAdminData();
      setServiceForm({
        id: "",
        name: "",
        slug: "",
        shortDescription: "",
        description: "",
        heroTitle: "",
        lead: "",
        bullets: "",
        imageUrl: "",
        basePrice: "",
        durationHours: "",
        isActive: true,
      });
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : "Не удалось удалить услугу.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDiscountSubmit() {
    const nameValue = discountForm.name.trim();
    const valueNumber = Number(discountForm.value);

    if (!nameValue || Number.isNaN(valueNumber)) {
      setActionError("Название и значение скидки обязательны.");
      return;
    }

    setActionLoading(true);
    setActionError(null);

    try {
      const payload = {
        name: nameValue,
        code: discountForm.code.trim() || undefined,
        description: discountForm.description.trim() || undefined,
        type: discountForm.type as "PERCENT" | "FIXED",
        scope: discountForm.scope as "ORDER" | "PRODUCT" | "CATEGORY" | "CLIENT",
        value: valueNumber,
        isActive: discountForm.isActive,
        startsAt: discountForm.startsAt || undefined,
        endsAt: discountForm.endsAt || undefined,
        productId: discountForm.productId.trim() || undefined,
        categoryId: discountForm.categoryId.trim() || undefined,
        clientProfileId: discountForm.clientProfileId.trim() || undefined,
      };

      if (discountForm.id) {
        await updateAdminDiscount(discountForm.id, payload);
      } else {
        await createAdminDiscount(payload);
      }

      await refreshAdminData();
      setDiscountForm({
        id: "",
        name: "",
        code: "",
        description: "",
        type: "PERCENT",
        scope: "ORDER",
        value: "",
        isActive: true,
        startsAt: "",
        endsAt: "",
        productId: "",
        categoryId: "",
        clientProfileId: "",
      });
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : "Не удалось сохранить скидку.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDiscountDelete() {
    if (!discountForm.id) {
      return;
    }

    setActionLoading(true);
    setActionError(null);

    try {
      await deleteAdminDiscount(discountForm.id);
      await refreshAdminData();
      setDiscountForm({
        id: "",
        name: "",
        code: "",
        description: "",
        type: "PERCENT",
        scope: "ORDER",
        value: "",
        isActive: true,
        startsAt: "",
        endsAt: "",
        productId: "",
        categoryId: "",
        clientProfileId: "",
      });
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : "Не удалось удалить скидку.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAdminUserSubmit() {
    const emailValue = adminUserForm.email.trim();
    const firstNameValue = adminUserForm.firstName.trim();

    if (!emailValue || !firstNameValue) {
      setActionError("Email и имя администратора обязательны.");
      return;
    }

    if (!adminUserForm.id && !adminUserForm.passwordHash.trim()) {
      setActionError("Для нового администратора нужен хэш пароля.");
      return;
    }

    setActionLoading(true);
    setActionError(null);

    try {
      const payload = {
        email: emailValue,
        passwordHash: adminUserForm.passwordHash.trim() || undefined,
        firstName: firstNameValue,
        lastName: adminUserForm.lastName.trim() || undefined,
        role: adminUserForm.role as "SUPERADMIN" | "MANAGER" | "EDITOR",
        isActive: adminUserForm.isActive,
      };

      if (adminUserForm.id) {
        await updateAdminUser(adminUserForm.id, payload);
      } else {
        await createAdminUser(payload as { email: string; passwordHash: string; firstName: string; lastName?: string; role?: "SUPERADMIN" | "MANAGER" | "EDITOR"; isActive?: boolean });
      }

      await refreshAdminData();
      setAdminUserForm({
        id: "",
        email: "",
        passwordHash: "",
        firstName: "",
        lastName: "",
        role: "MANAGER",
        isActive: true,
      });
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : "Не удалось сохранить администратора.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAdminUserDelete() {
    if (!adminUserForm.id) {
      return;
    }

    setActionLoading(true);
    setActionError(null);

    try {
      await deleteAdminUser(adminUserForm.id);
      await refreshAdminData();
      setAdminUserForm({
        id: "",
        email: "",
        passwordHash: "",
        firstName: "",
        lastName: "",
        role: "MANAGER",
        isActive: true,
      });
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : "Не удалось удалить администратора.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handlePaymentSubmit() {
    const orderIdValue = paymentForm.orderId.trim();
    const amountValue = Number(paymentForm.amount);

    if (!orderIdValue || Number.isNaN(amountValue)) {
      setActionError("Order ID и сумма обязательны.");
      return;
    }

    setActionLoading(true);
    setActionError(null);

    try {
      const payload = {
        orderId: orderIdValue,
        method: paymentForm.method as "CARD" | "SBP" | "INVOICE" | "CASH",
        status: paymentForm.status as "PENDING" | "PAID" | "FAILED" | "REFUNDED",
        amount: amountValue,
        provider: paymentForm.provider.trim() || undefined,
        transactionId: paymentForm.transactionId.trim() || undefined,
        currency: paymentForm.currency.trim() || undefined,
        paidAt: paymentForm.paidAt || undefined,
      };

      if (paymentForm.id) {
        await updateAdminPayment(paymentForm.id, payload);
      } else {
        await createAdminPayment(payload);
      }

      await refreshAdminData();
      setPaymentForm({
        id: "",
        orderId: "",
        method: "CARD",
        status: "PENDING",
        amount: "",
        provider: "",
        transactionId: "",
        currency: "RUB",
        paidAt: "",
      });
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : "Не удалось сохранить платеж.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handlePaymentDelete() {
    if (!paymentForm.id) {
      return;
    }

    setActionLoading(true);
    setActionError(null);

    try {
      await deleteAdminPayment(paymentForm.id);
      await refreshAdminData();
      setPaymentForm({
        id: "",
        orderId: "",
        method: "CARD",
        status: "PENDING",
        amount: "",
        provider: "",
        transactionId: "",
        currency: "RUB",
        paidAt: "",
      });
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : "Не удалось удалить платеж.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleUserSubmit() {
    const emailValue = userForm.email.trim();

    if (!emailValue) {
      setActionError("Email пользователя обязателен.");
      return;
    }

    if (!userForm.id && !userForm.passwordHash.trim()) {
      setActionError("Для нового пользователя нужен хэш пароля.");
      return;
    }

    setActionLoading(true);
    setActionError(null);

    try {
      const payload = {
        email: emailValue,
        phone: userForm.phone.trim() || undefined,
        passwordHash: userForm.passwordHash.trim() || undefined,
        role: userForm.role as "CLIENT" | "MANAGER",
        status: userForm.status as "ACTIVE" | "BLOCKED",
        clientProfile: {
          firstName: userForm.firstName.trim() || "Клиент",
          lastName: userForm.lastName.trim() || undefined,
        },
      };

      if (userForm.id) {
        await updateUser(userForm.id, payload);
      } else {
        await createUser(payload as { email: string; passwordHash: string; phone?: string; role?: "CLIENT" | "MANAGER"; status?: "ACTIVE" | "BLOCKED"; clientProfile?: { firstName: string; lastName?: string } });
      }

      await refreshAdminData();
      setUserForm({
        id: "",
        email: "",
        phone: "",
        passwordHash: "",
        firstName: "",
        lastName: "",
        role: "CLIENT",
        status: "ACTIVE",
      });
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : "Не удалось сохранить пользователя.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleUserDelete() {
    if (!userForm.id) {
      return;
    }

    setActionLoading(true);
    setActionError(null);

    try {
      await deleteUser(userForm.id);
      await refreshAdminData();
      setUserForm({
        id: "",
        email: "",
        phone: "",
        passwordHash: "",
        firstName: "",
        lastName: "",
        role: "CLIENT",
        status: "ACTIVE",
      });
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : "Не удалось удалить пользователя.");
    } finally {
      setActionLoading(false);
    }
  }

  useEffect(() => {
    if (!["clients", "orders", "news", "catalog", "projects", "requests", "settings"].includes(activeKey)) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);

    async function run() {
      try {
        const data = await loadAdminSectionData();
        const nextCategories = activeKey === "catalog" ? await loadAdminCategories() : [];
        const nextServices = activeKey === "projects" ? await loadAdminServices() : [];
        const nextPayments = activeKey === "requests" ? await loadAdminPayments() : [];
        const nextDiscounts = activeKey === "settings" ? await loadAdminDiscounts() : [];
        const nextAdmins = activeKey === "settings" ? await loadAdminUsers() : [];
        const nextUsers = activeKey === "settings" ? await loadUsers() : [];

        if (!active) {
          return;
        }

        setClients(data.clients);
        setOrders(data.orders);
        setNews(data.news);
        setCatalog(data.catalog);
        setCategories(nextCategories);
        setServices(nextServices.map((item) => ({ id: item.id, name: item.name, slug: item.slug })));
        setPayments(
          nextPayments.map((item) => ({
            id: item.id,
            orderId: item.orderId,
            amount: `${item.amount} ${item.currency ?? "RUB"}`,
          })),
        );
        setDiscounts(
          nextDiscounts
            .filter((item): item is NonNullable<typeof item> => Boolean(item))
            .map((item) => ({
              id: item.id,
              name: item.name,
              value: String(item.value),
            })),
        );
        setAdminUsers(
          nextAdmins.map((item) => ({
            id: item.id,
            name: [item.firstName, item.lastName].filter(Boolean).join(" ") || item.email,
            email: item.email,
          })),
        );
        setUsers(
          nextUsers.map((item) => ({
            id: item.id,
            name: [item.clientProfile?.firstName, item.clientProfile?.lastName].filter(Boolean).join(" ") || item.email,
            email: item.email,
            role: item.role,
          })),
        );
        setCatalogForm((prev) => ({ ...prev, categoryId: prev.categoryId || nextCategories[0]?.id || "" }));
        setError(null);
      } catch (nextError) {
        if (!active) {
          return;
        }

        setError(nextError instanceof Error ? nextError : new Error("Не удалось загрузить раздел админки."));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    run();

    return () => {
      active = false;
    };
  }, [activeKey]);


  const filteredClients = useMemo(() => {
    return clients.filter((item) => {
      const haystack = `${item.name} ${item.segment} ${item.manager}`.toLowerCase();
      return !query || haystack.includes(query.toLowerCase());
    });
  }, [clients, query]);

  const filteredOrders = useMemo(() => {
    return orders.filter((item) => {
      const haystack = `${item.orderNumber} ${item.client} ${item.items} ${item.status}`.toLowerCase();
      return !query || haystack.includes(query.toLowerCase());
    });
  }, [orders, query]);

  const filteredNews = useMemo(() => {
    return news.filter((item) => {
      const haystack = `${item.title} ${item.category}`.toLowerCase();
      const matchesQuery = !query || haystack.includes(query.toLowerCase());
      const matchesStatus = secondaryFilter === "all" || item.status === secondaryFilter;
      return matchesQuery && matchesStatus;
    });
  }, [news, query, secondaryFilter]);

  const filteredCatalog = useMemo(() => {
    return catalog.filter((item) => {
      const haystack = `${item.title} ${item.brand}`.toLowerCase();
      const matchesQuery = !query || haystack.includes(query.toLowerCase());
      const matchesStock = secondaryFilter === "all" || item.stock === secondaryFilter;
      return matchesQuery && matchesStock;
    });
  }, [catalog, query, secondaryFilter]);

  const authRequired = error instanceof ApiError && error.status === 401;

  return (
    <main className="min-h-screen bg-[#faf8f4] text-[#111] [font-family:DM_Sans,Manrope,'Liberation_Sans',sans-serif]">
      <div className="grid min-h-screen xl:grid-cols-[360px_1fr] 2xl:grid-cols-[400px_1fr]">
        <aside className="hidden min-h-screen flex-col bg-[#211d1a] text-white xl:flex">
          <div className="border-b border-white/10 px-8 py-12">
            <p className="max-w-full text-[26px] italic uppercase leading-none tracking-[-0.04em] text-white 2xl:text-[30px] [font-family:'Cormorant_Garamond',serif]">
              ВОСТОКСТРОЙЭКСПЕРТ
            </p>
            <p className="mt-6 text-[14px] uppercase tracking-[4px] text-white/50 2xl:text-[15px] [font-family:Jaldi,'JetBrains_Mono',monospace]">
              панель администратора
            </p>
          </div>

          <nav className="pt-6">
            {adminNav.map((item) => {
              const active = item.key === activeKey;
              return (
                <a key={item.key} href={item.href} className={`flex min-h-[68px] items-center gap-5 px-6 text-[18px] ${active ? "border-l-4 border-white bg-white/4" : "text-white/70"}`}>
                  <img src={item.icon} alt="" aria-hidden="true" width="22" height="22" loading="lazy" decoding="async" className="h-5 w-5 object-contain" />
                  <span className={active ? "text-white" : ""}>{item.label}</span>
                  {item.badge ? (
                    <span className="ml-auto inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-white px-2 text-[16px] font-semibold text-[#111]">
                      {item.badge}
                    </span>
                  ) : null}
                </a>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0">
          <header className="border-b border-[#e8e3db] bg-white px-6 py-5 md:px-10">
            <div className="flex items-center justify-end gap-6">
              <img src="/админка/уведомление.svg" alt="" aria-hidden="true" width="18" height="18" loading="lazy" decoding="async" className="h-[18px] w-[18px] object-contain" />
              <div className="h-10 w-px bg-[#ece8e1]" />
              <span className="text-[18px]">{adminName}</span>
            </div>
          </header>

          <section className="px-6 py-10 md:px-10 md:py-14">
            <div className="mx-auto max-w-[1280px]">
              <h1 className="text-[46px] leading-none md:text-[64px] [font-family:'Cormorant_Garamond',serif]">{title}</h1>
              {subtitle ? <p className="mt-4 text-[18px] text-[#7a7a75] md:text-[20px]">{subtitle}</p> : null}

              {["clients", "orders", "news", "catalog"].includes(activeKey) ? (
                <div className="mt-10 flex flex-col gap-4 rounded-[8px] border border-[#e8e3db] bg-white p-5 md:flex-row md:items-end">
                  <label className="flex-1 text-[14px] text-[#7a7a75]">
                    Поиск
                    <input value={query} onChange={(event) => setQuery(event.target.value)} className="admin-input mt-2 w-full" placeholder="Поиск по разделу" />
                  </label>
                  {activeKey === "news" ? (
                    <div className="flex gap-2">
                      {["all", "Опубликовано", "Черновик", "Архив"].map((item) => (
                        <button key={item} type="button" className={`admin-filter-pill ${secondaryFilter === item ? "admin-filter-pill--active" : ""}`} onClick={() => setSecondaryFilter(item)}>
                          {item === "all" ? "Все" : item}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {activeKey === "catalog" ? (
                    <div className="flex gap-2">
                      {["all", "В наличии", "Под заказ"].map((item) => (
                        <button key={item} type="button" className={`admin-filter-pill ${secondaryFilter === item ? "admin-filter-pill--active" : ""}`} onClick={() => setSecondaryFilter(item)}>
                          {item === "all" ? "Все" : item}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {loading ? <SectionMessage title="Загрузка" description="Получаю данные раздела из backend API." /> : null}
              {!loading && authRequired ? <SectionMessage title="Нужен вход" description="Для доступа к административным разделам выполните вход под администратором." /> : null}
              {!loading && error && !authRequired ? <SectionMessage title="Ошибка загрузки" description={error.message || "Не удалось получить данные раздела."} /> : null}

              {!loading && !error && activeKey === "clients" ? (
                <div className="mt-10">
                  <div className="admin-form-card">
                    <div className="admin-form-grid admin-form-grid--catalog">
                      <label className="admin-toolbar__label">
                        User ID
                        <input
                          className="admin-input mt-2"
                          value={clientForm.userId}
                          onChange={(event) => setClientForm((prev) => ({ ...prev, userId: event.target.value }))}
                          placeholder="UUID пользователя"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Имя
                        <input
                          className="admin-input mt-2"
                          value={clientForm.firstName}
                          onChange={(event) => setClientForm((prev) => ({ ...prev, firstName: event.target.value }))}
                          placeholder="Алексей"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Фамилия
                        <input
                          className="admin-input mt-2"
                          value={clientForm.lastName}
                          onChange={(event) => setClientForm((prev) => ({ ...prev, lastName: event.target.value }))}
                          placeholder="Иванов"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Компания
                        <input
                          className="admin-input mt-2"
                          value={clientForm.companyName}
                          onChange={(event) => setClientForm((prev) => ({ ...prev, companyName: event.target.value }))}
                          placeholder="ООО Восход"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        ИНН
                        <input
                          className="admin-input mt-2"
                          value={clientForm.inn}
                          onChange={(event) => setClientForm((prev) => ({ ...prev, inn: event.target.value }))}
                          placeholder="7700000000"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Телефон
                        <input
                          className="admin-input mt-2"
                          value={clientForm.contactPhone}
                          onChange={(event) => setClientForm((prev) => ({ ...prev, contactPhone: event.target.value }))}
                          placeholder="+7 999 123 45 67"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Адрес
                        <input
                          className="admin-input mt-2"
                          value={clientForm.addressLine1}
                          onChange={(event) => setClientForm((prev) => ({ ...prev, addressLine1: event.target.value }))}
                          placeholder="Москва, Калужская, 12"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Город
                        <input
                          className="admin-input mt-2"
                          value={clientForm.city}
                          onChange={(event) => setClientForm((prev) => ({ ...prev, city: event.target.value }))}
                          placeholder="Москва"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Индекс
                        <input
                          className="admin-input mt-2"
                          value={clientForm.postalCode}
                          onChange={(event) => setClientForm((prev) => ({ ...prev, postalCode: event.target.value }))}
                          placeholder="101000"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Скидка, %
                        <input
                          className="admin-input mt-2"
                          value={clientForm.personalDiscountPercent}
                          onChange={(event) => setClientForm((prev) => ({ ...prev, personalDiscountPercent: event.target.value }))}
                          placeholder="7"
                        />
                      </label>
                    </div>
                    <label className="admin-toolbar__label mt-4">
                      Комментарий
                      <textarea
                        className="admin-input admin-textarea mt-2"
                        value={clientForm.comment}
                        onChange={(event) => setClientForm((prev) => ({ ...prev, comment: event.target.value }))}
                        placeholder="Комментарий менеджера"
                      />
                    </label>
                    {actionError ? <p className="mt-3 text-[14px] text-[#9b3d2f]">{actionError}</p> : null}
                    <div className="admin-form-actions">
                      <button className="admin-action-btn" type="button" onClick={handleClientSubmit} disabled={actionLoading}>
                        {clientForm.id ? "Сохранить" : "Создать"}
                      </button>
                      <button
                        className="admin-action-btn admin-action-btn--ghost"
                        type="button"
                        onClick={() =>
                          setClientForm({
                            id: "",
                            userId: "",
                            firstName: "",
                            lastName: "",
                            companyName: "",
                            inn: "",
                            contactPhone: "",
                            addressLine1: "",
                            city: "",
                            postalCode: "",
                            comment: "",
                            personalDiscountPercent: "",
                          })
                        }
                        disabled={actionLoading}
                      >
                        Очистить
                      </button>
                      {clientForm.id ? (
                        <button className="admin-action-btn admin-action-btn--ghost" type="button" onClick={handleClientDelete} disabled={actionLoading}>
                          Удалить
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-8">
                    <AdminTable
                      columns={["Клиент", "Сегмент", "Менеджер", "Заказы", "Статус"]}
                      rows={filteredClients.map((item) => [
                        <button
                          key={item.id}
                          type="button"
                          className="text-left underline-offset-4 hover:underline"
                          onClick={() =>
                            setClientForm((prev) => ({
                              ...prev,
                              id: item.id,
                              firstName: item.name.split(" ")[0] ?? item.name,
                              lastName: item.name.split(" ").slice(1).join(" "),
                            }))
                          }
                        >
                          {item.name}
                        </button>,
                        item.segment,
                        item.manager,
                        item.orders,
                        <StatusBadge key={item.id} tone={item.status === "Активен" ? "green" : "gray"} label={item.status} />,
                      ])}
                    />
                  </div>
                </div>
              ) : null}

              {!loading && !error && activeKey === "orders" ? (
                <div className="mt-10">
                  <div className="admin-form-card">
                    <div className="admin-form-grid">
                      <label className="admin-toolbar__label">
                        Заказ
                        <select
                          className="admin-input mt-2"
                          value={orderForm.id}
                          onChange={(event) => setOrderForm((prev) => ({ ...prev, id: event.target.value }))}
                        >
                          <option value="">Выберите заказ</option>
                          {orders.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.orderNumber} — {item.client}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="admin-toolbar__label">
                        Статус
                        <select
                          className="admin-input mt-2"
                          value={orderForm.status}
                          onChange={(event) => setOrderForm((prev) => ({ ...prev, status: event.target.value }))}
                        >
                          <option value="NEW">Новый</option>
                          <option value="PENDING_PAYMENT">Ожидает оплату</option>
                          <option value="PAID">Оплачен</option>
                          <option value="ASSEMBLY">Сборка</option>
                          <option value="SHIPPING">Доставка</option>
                          <option value="DELIVERED">Доставлен</option>
                          <option value="CANCELLED">Отменен</option>
                        </select>
                      </label>
                    </div>
                    {actionError ? <p className="mt-3 text-[14px] text-[#9b3d2f]">{actionError}</p> : null}
                    <div className="admin-form-actions">
                      <button className="admin-action-btn" type="button" onClick={handleOrderStatusSave} disabled={actionLoading}>
                        Сохранить статус
                      </button>
                      {orderForm.id ? (
                        <button className="admin-action-btn admin-action-btn--ghost" type="button" onClick={handleOrderDelete} disabled={actionLoading}>
                          Удалить заказ
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-8">
                    <AdminTable
                      columns={["Номер", "Клиент", "Позиции", "Сумма", "Статус", "Дата"]}
                      rows={filteredOrders.map((item) => [
                        <button
                          key={item.id}
                          type="button"
                          className="text-left underline-offset-4 hover:underline"
                          onClick={() => setOrderForm({ id: item.id, status: "PENDING_PAYMENT" })}
                        >
                          {item.orderNumber}
                        </button>,
                        item.client,
                        item.items,
                        item.amount,
                        <StatusBadge key={item.id} tone="gold" label={item.status} />,
                        item.date,
                      ])}
                    />
                  </div>
                </div>
              ) : null}

              {!loading && !error && activeKey === "news" ? (
                <div className="mt-10">
                  <div className="admin-form-card">
                    <div className="admin-form-grid">
                      <label className="admin-toolbar__label">
                        Заголовок
                        <input
                          className="admin-input mt-2"
                          value={newsForm.title}
                          onChange={(event) => setNewsForm((prev) => ({ ...prev, title: event.target.value }))}
                          placeholder="Введите название"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Slug
                        <input
                          className="admin-input mt-2"
                          value={newsForm.slug}
                          onChange={(event) => setNewsForm((prev) => ({ ...prev, slug: event.target.value }))}
                          placeholder="novosti-rynka"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Категория
                        <input
                          className="admin-input mt-2"
                          value={newsForm.category}
                          onChange={(event) => setNewsForm((prev) => ({ ...prev, category: event.target.value }))}
                          placeholder="События"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Статус
                        <select
                          className="admin-input mt-2"
                          value={newsForm.status}
                          onChange={(event) => setNewsForm((prev) => ({ ...prev, status: event.target.value }))}
                        >
                          <option value="DRAFT">Черновик</option>
                          <option value="PUBLISHED">Опубликовано</option>
                          <option value="ARCHIVED">Архив</option>
                        </select>
                      </label>
                    </div>
                    <label className="admin-toolbar__label mt-4">
                      Короткое описание
                      <textarea
                        className="admin-input admin-textarea mt-2"
                        value={newsForm.excerpt}
                        onChange={(event) => setNewsForm((prev) => ({ ...prev, excerpt: event.target.value }))}
                        placeholder="Короткий анонс новости"
                      />
                    </label>
                    {actionError ? <p className="mt-3 text-[14px] text-[#9b3d2f]">{actionError}</p> : null}
                    <div className="admin-form-actions">
                      <button className="admin-action-btn" type="button" onClick={handleNewsSubmit} disabled={actionLoading}>
                        {newsForm.id ? "Сохранить" : "Создать"}
                      </button>
                      <button
                        className="admin-action-btn admin-action-btn--ghost"
                        type="button"
                        onClick={() => setNewsForm({ id: "", title: "", slug: "", category: "", excerpt: "", status: "DRAFT" })}
                        disabled={actionLoading}
                      >
                        Очистить
                      </button>
                      {newsForm.id ? (
                        <button className="admin-action-btn admin-action-btn--ghost" type="button" onClick={handleNewsDelete} disabled={actionLoading}>
                          Удалить
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-8 grid gap-6 md:grid-cols-2">
                    {filteredNews.map((item) => (
                      <article key={item.id} className="border border-[#e8e3db] bg-white p-7">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-[12px] uppercase tracking-[3px] text-[#b1ada6] [font-family:Jaldi,'JetBrains_Mono',monospace]">{item.category}</p>
                            <h3 className="mt-3 text-[22px] [font-family:'Cormorant_Garamond',serif]">{item.title}</h3>
                          </div>
                          <StatusBadge tone={item.status === "Опубликовано" ? "green" : item.status === "Черновик" ? "gray" : "amber"} label={item.status} />
                        </div>
                        <div className="mt-6 flex items-center justify-between text-[14px] text-[#7a7a75]">
                          <span>{item.date}</span>
                          <button
                            className="admin-action-btn"
                            type="button"
                            onClick={() => handleSelectNews(item.id)}
                          >
                            Редактировать
                          </button>
                        </div>
                      </article>
                    ))}
                    {filteredNews.length === 0 ? <SectionMessage title="Пусто" description="Материалы по текущему фильтру не найдены." /> : null}
                  </div>
                </div>
              ) : null}

              {!loading && !error && activeKey === "catalog" ? (
                <div className="mt-10">
                  <div className="admin-form-card">
                    <h2 className="text-[24px] [font-family:'Cormorant_Garamond',serif]">Категории</h2>
                    <div className="mt-6 admin-form-grid">
                      <label className="admin-toolbar__label">
                        Название
                        <input
                          className="admin-input mt-2"
                          value={categoryForm.name}
                          onChange={(event) => setCategoryForm((prev) => ({ ...prev, name: event.target.value }))}
                          placeholder="Модульные системы"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Slug
                        <input
                          className="admin-input mt-2"
                          value={categoryForm.slug}
                          onChange={(event) => setCategoryForm((prev) => ({ ...prev, slug: event.target.value }))}
                          placeholder="modular-systems"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Родительская категория
                        <select
                          className="admin-input mt-2"
                          value={categoryForm.parentId}
                          onChange={(event) => setCategoryForm((prev) => ({ ...prev, parentId: event.target.value }))}
                        >
                          <option value="">Без родителя</option>
                          {categories.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="admin-toolbar__label">
                        Описание
                        <input
                          className="admin-input mt-2"
                          value={categoryForm.description}
                          onChange={(event) => setCategoryForm((prev) => ({ ...prev, description: event.target.value }))}
                          placeholder="Короткое описание"
                        />
                      </label>
                    </div>
                    {actionError ? <p className="mt-3 text-[14px] text-[#9b3d2f]">{actionError}</p> : null}
                    <div className="admin-form-actions">
                      <button className="admin-action-btn" type="button" onClick={handleCategorySubmit} disabled={actionLoading}>
                        {categoryForm.id ? "Сохранить" : "Создать"}
                      </button>
                      <button
                        className="admin-action-btn admin-action-btn--ghost"
                        type="button"
                        onClick={() => setCategoryForm({ id: "", name: "", slug: "", description: "", parentId: "" })}
                        disabled={actionLoading}
                      >
                        Очистить
                      </button>
                      {categoryForm.id ? (
                        <button className="admin-action-btn admin-action-btn--ghost" type="button" onClick={handleCategoryDelete} disabled={actionLoading}>
                          Удалить
                        </button>
                      ) : null}
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2 text-[14px] text-[#7a7a75]">
                      {categories.length === 0 ? (
                        <span>Категории пока не созданы.</span>
                      ) : (
                        categories.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            className="admin-action-btn admin-action-btn--ghost"
                            onClick={() =>
                              setCategoryForm({
                                id: item.id,
                                name: item.name,
                                slug: item.slug,
                                description: "",
                                parentId: "",
                              })
                            }
                          >
                            {item.name}
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="admin-form-card">
                    <div className="admin-form-grid admin-form-grid--catalog">
                      <label className="admin-toolbar__label">
                        Название
                        <input
                          className="admin-input mt-2"
                          value={catalogForm.name}
                          onChange={(event) => setCatalogForm((prev) => ({ ...prev, name: event.target.value }))}
                          placeholder="Монолит V2"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Slug
                        <input
                          className="admin-input mt-2"
                          value={catalogForm.slug}
                          onChange={(event) => setCatalogForm((prev) => ({ ...prev, slug: event.target.value }))}
                          placeholder="monolith-v2"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Артикул
                        <input
                          className="admin-input mt-2"
                          value={catalogForm.sku}
                          onChange={(event) => setCatalogForm((prev) => ({ ...prev, sku: event.target.value }))}
                          placeholder="AER-204-XL"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Цена
                        <input
                          className="admin-input mt-2"
                          value={catalogForm.price}
                          onChange={(event) => setCatalogForm((prev) => ({ ...prev, price: event.target.value }))}
                          placeholder="284500"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Старая цена
                        <input
                          className="admin-input mt-2"
                          value={catalogForm.oldPrice}
                          onChange={(event) => setCatalogForm((prev) => ({ ...prev, oldPrice: event.target.value }))}
                          placeholder="320000"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Бренд
                        <input
                          className="admin-input mt-2"
                          value={catalogForm.brandLabel}
                          onChange={(event) => setCatalogForm((prev) => ({ ...prev, brandLabel: event.target.value }))}
                          placeholder="Aeris Precision"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Бренд (код)
                        <input
                          className="admin-input mt-2"
                          value={catalogForm.brand}
                          onChange={(event) => setCatalogForm((prev) => ({ ...prev, brand: event.target.value }))}
                          placeholder="aeris"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Страна
                        <input
                          className="admin-input mt-2"
                          value={catalogForm.country}
                          onChange={(event) => setCatalogForm((prev) => ({ ...prev, country: event.target.value }))}
                          placeholder="Германия"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Тип
                        <input
                          className="admin-input mt-2"
                          value={catalogForm.type}
                          onChange={(event) => setCatalogForm((prev) => ({ ...prev, type: event.target.value }))}
                          placeholder="Модуль"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Мощность (кВт)
                        <input
                          className="admin-input mt-2"
                          value={catalogForm.power}
                          onChange={(event) => setCatalogForm((prev) => ({ ...prev, power: event.target.value }))}
                          placeholder="5.5"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Объем (кВт)
                        <input
                          className="admin-input mt-2"
                          value={catalogForm.volume}
                          onChange={(event) => setCatalogForm((prev) => ({ ...prev, volume: event.target.value }))}
                          placeholder="32"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Остаток
                        <input
                          className="admin-input mt-2"
                          value={catalogForm.stock}
                          onChange={(event) => setCatalogForm((prev) => ({ ...prev, stock: event.target.value }))}
                          placeholder="12"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Эффективность
                        <input
                          className="admin-input mt-2"
                          value={catalogForm.efficiency}
                          onChange={(event) => setCatalogForm((prev) => ({ ...prev, efficiency: event.target.value }))}
                          placeholder="SEER 22"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Класс эффективности
                        <input
                          className="admin-input mt-2"
                          value={catalogForm.efficiencyClass}
                          onChange={(event) => setCatalogForm((prev) => ({ ...prev, efficiencyClass: event.target.value }))}
                          placeholder="A+++"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Покрытие
                        <input
                          className="admin-input mt-2"
                          value={catalogForm.coverage}
                          onChange={(event) => setCatalogForm((prev) => ({ ...prev, coverage: event.target.value }))}
                          placeholder="до 120 м²"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Акустика
                        <input
                          className="admin-input mt-2"
                          value={catalogForm.acoustics}
                          onChange={(event) => setCatalogForm((prev) => ({ ...prev, acoustics: event.target.value }))}
                          placeholder="19 дБ"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Фильтрация
                        <input
                          className="admin-input mt-2"
                          value={catalogForm.filtration}
                          onChange={(event) => setCatalogForm((prev) => ({ ...prev, filtration: event.target.value }))}
                          placeholder="HEPA 14 Industrial"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Категория
                        <select
                          className="admin-input mt-2"
                          value={catalogForm.categoryId}
                          onChange={(event) => setCatalogForm((prev) => ({ ...prev, categoryId: event.target.value }))}
                        >
                          <option value="">Выберите категорию</option>
                          {categories.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="admin-toolbar__label">
                        Статус
                        <select
                          className="admin-input mt-2"
                          value={catalogForm.status}
                          onChange={(event) => setCatalogForm((prev) => ({ ...prev, status: event.target.value }))}
                        >
                          <option value="DRAFT">Черновик</option>
                          <option value="ACTIVE">Активен</option>
                          <option value="ARCHIVED">Архив</option>
                        </select>
                      </label>
                    </div>
                    <div className="mt-4">
                      <label className="admin-toolbar__label">
                        Короткое описание
                        <textarea
                          className="admin-input admin-textarea mt-2"
                          value={catalogForm.shortDescription}
                          onChange={(event) => setCatalogForm((prev) => ({ ...prev, shortDescription: event.target.value }))}
                          placeholder="Короткий текст для карточки товара."
                        />
                      </label>
                    </div>
                    <div className="mt-4">
                      <label className="admin-toolbar__label">
                        Полное описание
                        <textarea
                          className="admin-input admin-textarea mt-2"
                          value={catalogForm.description}
                          onChange={(event) => setCatalogForm((prev) => ({ ...prev, description: event.target.value }))}
                          placeholder="Основное описание товара."
                        />
                      </label>
                    </div>
                    <div className="mt-4">
                      <label className="admin-toolbar__label">
                        Изображения (URL через запятую)
                        <textarea
                          className="admin-input admin-textarea mt-2"
                          value={catalogForm.images}
                          onChange={(event) => setCatalogForm((prev) => ({ ...prev, images: event.target.value }))}
                          placeholder="https://.../img1.jpg, https://.../img2.jpg"
                        />
                      </label>
                    </div>
                    {actionError ? <p className="mt-3 text-[14px] text-[#9b3d2f]">{actionError}</p> : null}
                    <div className="admin-form-actions">
                      <button className="admin-action-btn" type="button" onClick={handleCatalogSubmit} disabled={actionLoading}>
                        {catalogForm.id ? "Сохранить" : "Создать"}
                      </button>
                      <button
                        className="admin-action-btn admin-action-btn--ghost"
                        type="button"
                        onClick={() =>
                          setCatalogForm({
                            id: "",
                            name: "",
                            slug: "",
                            sku: "",
                            price: "",
                            oldPrice: "",
                            brandLabel: "",
                            brand: "",
                            country: "",
                            type: "",
                            shortDescription: "",
                            description: "",
                            rating: "",
                            efficiency: "",
                            efficiencyClass: "",
                            coverage: "",
                            acoustics: "",
                            filtration: "",
                            power: "",
                            volume: "",
                            images: "",
                            stock: "",
                            status: "DRAFT",
                            categoryId: categories[0]?.id || "",
                          })
                        }
                        disabled={actionLoading}
                      >
                        Очистить
                      </button>
                      {catalogForm.id ? (
                        <button className="admin-action-btn admin-action-btn--ghost" type="button" onClick={handleCatalogDelete} disabled={actionLoading}>
                          Удалить
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {filteredCatalog.map((item) => (
                      <article key={item.id} className="border border-[#e8e3db] bg-white p-7">
                        <p className="text-[12px] uppercase tracking-[3px] text-[#b1ada6] [font-family:Jaldi,'JetBrains_Mono',monospace]">{item.brand}</p>
                        <h3 className="mt-3 text-[22px] [font-family:'Cormorant_Garamond',serif]">{item.title}</h3>
                        <p className="mt-4 text-[20px]">{item.price}</p>
                        <div className="mt-6 flex items-center justify-between text-[14px] text-[#7a7a75]">
                          <span>{item.stock}</span>
                          <button
                            className="admin-action-btn"
                            type="button"
                            onClick={() => handleSelectProduct(item.id)}
                          >
                            Редактировать
                          </button>
                        </div>
                      </article>
                    ))}
                    {filteredCatalog.length === 0 ? <SectionMessage title="Пусто" description="Товары по текущему фильтру не найдены." /> : null}
                  </div>
                </div>
              ) : null}

              {!loading && !error && activeKey === "projects" ? (
                <div className="mt-10">
                  <div className="admin-form-card">
                    <div className="admin-form-grid admin-form-grid--catalog">
                      <label className="admin-toolbar__label">
                        Название услуги
                        <input
                          className="admin-input mt-2"
                          value={serviceForm.name}
                          onChange={(event) => setServiceForm((prev) => ({ ...prev, name: event.target.value }))}
                          placeholder="Тепловой контроль"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Slug
                        <input
                          className="admin-input mt-2"
                          value={serviceForm.slug}
                          onChange={(event) => setServiceForm((prev) => ({ ...prev, slug: event.target.value }))}
                          placeholder="thermal-control"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Заголовок hero
                        <input
                          className="admin-input mt-2"
                          value={serviceForm.heroTitle}
                          onChange={(event) => setServiceForm((prev) => ({ ...prev, heroTitle: event.target.value }))}
                          placeholder="Тепловой контроль"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Лид
                        <input
                          className="admin-input mt-2"
                          value={serviceForm.lead}
                          onChange={(event) => setServiceForm((prev) => ({ ...prev, lead: event.target.value }))}
                          placeholder="Короткий подзаголовок"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Цена
                        <input
                          className="admin-input mt-2"
                          value={serviceForm.basePrice}
                          onChange={(event) => setServiceForm((prev) => ({ ...prev, basePrice: event.target.value }))}
                          placeholder="120000"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Длительность (часы)
                        <input
                          className="admin-input mt-2"
                          value={serviceForm.durationHours}
                          onChange={(event) => setServiceForm((prev) => ({ ...prev, durationHours: event.target.value }))}
                          placeholder="8"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Изображение (URL)
                        <input
                          className="admin-input mt-2"
                          value={serviceForm.imageUrl}
                          onChange={(event) => setServiceForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
                          placeholder="https://..."
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Активна
                        <select
                          className="admin-input mt-2"
                          value={serviceForm.isActive ? "1" : "0"}
                          onChange={(event) => setServiceForm((prev) => ({ ...prev, isActive: event.target.value === "1" }))}
                        >
                          <option value="1">Да</option>
                          <option value="0">Нет</option>
                        </select>
                      </label>
                    </div>
                    <label className="admin-toolbar__label mt-4">
                      Короткое описание
                      <textarea
                        className="admin-input admin-textarea mt-2"
                        value={serviceForm.shortDescription}
                        onChange={(event) => setServiceForm((prev) => ({ ...prev, shortDescription: event.target.value }))}
                        placeholder="Описание для карточки"
                      />
                    </label>
                    <label className="admin-toolbar__label mt-4">
                      Полное описание
                      <textarea
                        className="admin-input admin-textarea mt-2"
                        value={serviceForm.description}
                        onChange={(event) => setServiceForm((prev) => ({ ...prev, description: event.target.value }))}
                        placeholder="Описание услуги"
                      />
                    </label>
                    <label className="admin-toolbar__label mt-4">
                      Буллеты (через запятую)
                      <input
                        className="admin-input mt-2"
                        value={serviceForm.bullets}
                        onChange={(event) => setServiceForm((prev) => ({ ...prev, bullets: event.target.value }))}
                        placeholder="Сроки, гарантия, монтаж"
                      />
                    </label>
                    {actionError ? <p className="mt-3 text-[14px] text-[#9b3d2f]">{actionError}</p> : null}
                    <div className="admin-form-actions">
                      <button className="admin-action-btn" type="button" onClick={handleServiceSubmit} disabled={actionLoading}>
                        {serviceForm.id ? "Сохранить" : "Создать"}
                      </button>
                      <button
                        className="admin-action-btn admin-action-btn--ghost"
                        type="button"
                        onClick={() =>
                          setServiceForm({
                            id: "",
                            name: "",
                            slug: "",
                            shortDescription: "",
                            description: "",
                            heroTitle: "",
                            lead: "",
                            bullets: "",
                            imageUrl: "",
                            basePrice: "",
                            durationHours: "",
                            isActive: true,
                          })
                        }
                        disabled={actionLoading}
                      >
                        Очистить
                      </button>
                      {serviceForm.id ? (
                        <button className="admin-action-btn admin-action-btn--ghost" type="button" onClick={handleServiceDelete} disabled={actionLoading}>
                          Удалить
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {services.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="border border-[#e8e3db] bg-white p-6 text-left"
                        onClick={() =>
                          setServiceForm((prev) => ({
                            ...prev,
                            id: item.id,
                            name: item.name,
                            slug: item.slug,
                          }))
                        }
                      >
                        <p className="text-[12px] uppercase tracking-[3px] text-[#b1ada6] [font-family:Jaldi,'JetBrains_Mono',monospace]">услуга</p>
                        <h3 className="mt-3 text-[22px] [font-family:'Cormorant_Garamond',serif]">{item.name}</h3>
                        <p className="mt-2 text-[14px] text-[#7a7a75]">{item.slug}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {!loading && !error && activeKey === "requests" ? (
                <div className="mt-10">
                  <div className="admin-form-card">
                    <div className="admin-form-grid admin-form-grid--catalog">
                      <label className="admin-toolbar__label">
                        Order ID
                        <input
                          className="admin-input mt-2"
                          value={paymentForm.orderId}
                          onChange={(event) => setPaymentForm((prev) => ({ ...prev, orderId: event.target.value }))}
                          placeholder="UUID заказа"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Сумма
                        <input
                          className="admin-input mt-2"
                          value={paymentForm.amount}
                          onChange={(event) => setPaymentForm((prev) => ({ ...prev, amount: event.target.value }))}
                          placeholder="250000"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Метод
                        <select
                          className="admin-input mt-2"
                          value={paymentForm.method}
                          onChange={(event) => setPaymentForm((prev) => ({ ...prev, method: event.target.value }))}
                        >
                          <option value="CARD">Карта</option>
                          <option value="SBP">СБП</option>
                          <option value="INVOICE">Счет</option>
                          <option value="CASH">Наличные</option>
                        </select>
                      </label>
                      <label className="admin-toolbar__label">
                        Статус
                        <select
                          className="admin-input mt-2"
                          value={paymentForm.status}
                          onChange={(event) => setPaymentForm((prev) => ({ ...prev, status: event.target.value }))}
                        >
                          <option value="PENDING">Ожидает</option>
                          <option value="PAID">Оплачен</option>
                          <option value="FAILED">Ошибка</option>
                          <option value="REFUNDED">Возврат</option>
                        </select>
                      </label>
                      <label className="admin-toolbar__label">
                        Провайдер
                        <input
                          className="admin-input mt-2"
                          value={paymentForm.provider}
                          onChange={(event) => setPaymentForm((prev) => ({ ...prev, provider: event.target.value }))}
                          placeholder="Stripe"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Transaction ID
                        <input
                          className="admin-input mt-2"
                          value={paymentForm.transactionId}
                          onChange={(event) => setPaymentForm((prev) => ({ ...prev, transactionId: event.target.value }))}
                          placeholder="abc-123"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Валюта
                        <input
                          className="admin-input mt-2"
                          value={paymentForm.currency}
                          onChange={(event) => setPaymentForm((prev) => ({ ...prev, currency: event.target.value }))}
                          placeholder="RUB"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Дата оплаты
                        <input
                          className="admin-input mt-2"
                          value={paymentForm.paidAt}
                          onChange={(event) => setPaymentForm((prev) => ({ ...prev, paidAt: event.target.value }))}
                          placeholder="2026-04-11"
                        />
                      </label>
                    </div>
                    {actionError ? <p className="mt-3 text-[14px] text-[#9b3d2f]">{actionError}</p> : null}
                    <div className="admin-form-actions">
                      <button className="admin-action-btn" type="button" onClick={handlePaymentSubmit} disabled={actionLoading}>
                        {paymentForm.id ? "Сохранить" : "Создать"}
                      </button>
                      <button
                        className="admin-action-btn admin-action-btn--ghost"
                        type="button"
                        onClick={() =>
                          setPaymentForm({
                            id: "",
                            orderId: "",
                            method: "CARD",
                            status: "PENDING",
                            amount: "",
                            provider: "",
                            transactionId: "",
                            currency: "RUB",
                            paidAt: "",
                          })
                        }
                        disabled={actionLoading}
                      >
                        Очистить
                      </button>
                      {paymentForm.id ? (
                        <button className="admin-action-btn admin-action-btn--ghost" type="button" onClick={handlePaymentDelete} disabled={actionLoading}>
                          Удалить
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {payments.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="border border-[#e8e3db] bg-white p-6 text-left"
                        onClick={() =>
                          setPaymentForm((prev) => ({
                            ...prev,
                            id: item.id,
                            orderId: item.orderId,
                            amount: item.amount.replace(/\D/g, ""),
                          }))
                        }
                      >
                        <p className="text-[12px] uppercase tracking-[3px] text-[#b1ada6] [font-family:Jaldi,'JetBrains_Mono',monospace]">платеж</p>
                        <h3 className="mt-3 text-[22px] [font-family:'Cormorant_Garamond',serif]">{item.amount}</h3>
                        <p className="mt-2 text-[14px] text-[#7a7a75]">{item.orderId}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {!loading && !error && activeKey === "settings" ? (
                <div className="mt-10 grid gap-10 xl:grid-cols-2">
                  <div className="admin-form-card">
                    <h2 className="text-[24px] [font-family:'Cormorant_Garamond',serif]">Администраторы</h2>
                    <div className="mt-6 admin-form-grid">
                      <label className="admin-toolbar__label">
                        Email
                        <input
                          className="admin-input mt-2"
                          value={adminUserForm.email}
                          onChange={(event) => setAdminUserForm((prev) => ({ ...prev, email: event.target.value }))}
                          placeholder="admin@company.com"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Пароль
                        <input
                          className="admin-input mt-2"
                          value={adminUserForm.passwordHash}
                          onChange={(event) => setAdminUserForm((prev) => ({ ...prev, passwordHash: event.target.value }))}
                          placeholder="Введите пароль"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Имя
                        <input
                          className="admin-input mt-2"
                          value={adminUserForm.firstName}
                          onChange={(event) => setAdminUserForm((prev) => ({ ...prev, firstName: event.target.value }))}
                          placeholder="Анна"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Фамилия
                        <input
                          className="admin-input mt-2"
                          value={adminUserForm.lastName}
                          onChange={(event) => setAdminUserForm((prev) => ({ ...prev, lastName: event.target.value }))}
                          placeholder="Петрова"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Роль
                        <select
                          className="admin-input mt-2"
                          value={adminUserForm.role}
                          onChange={(event) => setAdminUserForm((prev) => ({ ...prev, role: event.target.value }))}
                        >
                          <option value="SUPERADMIN">Superadmin</option>
                          <option value="MANAGER">Manager</option>
                          <option value="EDITOR">Editor</option>
                        </select>
                      </label>
                      <label className="admin-toolbar__label">
                        Активен
                        <select
                          className="admin-input mt-2"
                          value={adminUserForm.isActive ? "1" : "0"}
                          onChange={(event) => setAdminUserForm((prev) => ({ ...prev, isActive: event.target.value === "1" }))}
                        >
                          <option value="1">Да</option>
                          <option value="0">Нет</option>
                        </select>
                      </label>
                    </div>
                    {actionError ? <p className="mt-3 text-[14px] text-[#9b3d2f]">{actionError}</p> : null}
                    <div className="admin-form-actions">
                      <button className="admin-action-btn" type="button" onClick={handleAdminUserSubmit} disabled={actionLoading}>
                        {adminUserForm.id ? "Сохранить" : "Создать"}
                      </button>
                      <button
                        className="admin-action-btn admin-action-btn--ghost"
                        type="button"
                        onClick={() =>
                          setAdminUserForm({
                            id: "",
                            email: "",
                            passwordHash: "",
                            firstName: "",
                            lastName: "",
                            role: "MANAGER",
                            isActive: true,
                          })
                        }
                        disabled={actionLoading}
                      >
                        Очистить
                      </button>
                      {adminUserForm.id ? (
                        <button className="admin-action-btn admin-action-btn--ghost" type="button" onClick={handleAdminUserDelete} disabled={actionLoading}>
                          Удалить
                        </button>
                      ) : null}
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                      {adminUsers.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="admin-action-btn admin-action-btn--ghost"
                          onClick={() =>
                            setAdminUserForm((prev) => ({
                              ...prev,
                              id: item.id,
                              email: item.email,
                              firstName: item.name.split(" ")[0] ?? item.name,
                              lastName: item.name.split(" ").slice(1).join(" "),
                            }))
                          }
                        >
                          {item.email}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="admin-form-card">
                    <h2 className="text-[24px] [font-family:'Cormorant_Garamond',serif]">Скидки</h2>
                    <div className="mt-6 admin-form-grid admin-form-grid--catalog">
                      <label className="admin-toolbar__label">
                        Название
                        <input
                          className="admin-input mt-2"
                          value={discountForm.name}
                          onChange={(event) => setDiscountForm((prev) => ({ ...prev, name: event.target.value }))}
                          placeholder="Весенняя скидка"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Код
                        <input
                          className="admin-input mt-2"
                          value={discountForm.code}
                          onChange={(event) => setDiscountForm((prev) => ({ ...prev, code: event.target.value }))}
                          placeholder="SPRING24"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Тип
                        <select
                          className="admin-input mt-2"
                          value={discountForm.type}
                          onChange={(event) => setDiscountForm((prev) => ({ ...prev, type: event.target.value }))}
                        >
                          <option value="PERCENT">Процент</option>
                          <option value="FIXED">Фикс</option>
                        </select>
                      </label>
                      <label className="admin-toolbar__label">
                        Область
                        <select
                          className="admin-input mt-2"
                          value={discountForm.scope}
                          onChange={(event) => setDiscountForm((prev) => ({ ...prev, scope: event.target.value }))}
                        >
                          <option value="ORDER">Заказ</option>
                          <option value="PRODUCT">Товар</option>
                          <option value="CATEGORY">Категория</option>
                          <option value="CLIENT">Клиент</option>
                        </select>
                      </label>
                      <label className="admin-toolbar__label">
                        Значение
                        <input
                          className="admin-input mt-2"
                          value={discountForm.value}
                          onChange={(event) => setDiscountForm((prev) => ({ ...prev, value: event.target.value }))}
                          placeholder="10"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Активна
                        <select
                          className="admin-input mt-2"
                          value={discountForm.isActive ? "1" : "0"}
                          onChange={(event) => setDiscountForm((prev) => ({ ...prev, isActive: event.target.value === "1" }))}
                        >
                          <option value="1">Да</option>
                          <option value="0">Нет</option>
                        </select>
                      </label>
                      <label className="admin-toolbar__label">
                        Product ID
                        <input
                          className="admin-input mt-2"
                          value={discountForm.productId}
                          onChange={(event) => setDiscountForm((prev) => ({ ...prev, productId: event.target.value }))}
                          placeholder="UUID товара"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Category ID
                        <input
                          className="admin-input mt-2"
                          value={discountForm.categoryId}
                          onChange={(event) => setDiscountForm((prev) => ({ ...prev, categoryId: event.target.value }))}
                          placeholder="UUID категории"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        ClientProfile ID
                        <input
                          className="admin-input mt-2"
                          value={discountForm.clientProfileId}
                          onChange={(event) => setDiscountForm((prev) => ({ ...prev, clientProfileId: event.target.value }))}
                          placeholder="UUID клиента"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Начало
                        <input
                          className="admin-input mt-2"
                          value={discountForm.startsAt}
                          onChange={(event) => setDiscountForm((prev) => ({ ...prev, startsAt: event.target.value }))}
                          placeholder="2026-04-01"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Окончание
                        <input
                          className="admin-input mt-2"
                          value={discountForm.endsAt}
                          onChange={(event) => setDiscountForm((prev) => ({ ...prev, endsAt: event.target.value }))}
                          placeholder="2026-05-01"
                        />
                      </label>
                    </div>
                    <label className="admin-toolbar__label mt-4">
                      Описание
                      <textarea
                        className="admin-input admin-textarea mt-2"
                        value={discountForm.description}
                        onChange={(event) => setDiscountForm((prev) => ({ ...prev, description: event.target.value }))}
                        placeholder="Описание скидки"
                      />
                    </label>
                    {actionError ? <p className="mt-3 text-[14px] text-[#9b3d2f]">{actionError}</p> : null}
                    <div className="admin-form-actions">
                      <button className="admin-action-btn" type="button" onClick={handleDiscountSubmit} disabled={actionLoading}>
                        {discountForm.id ? "Сохранить" : "Создать"}
                      </button>
                      <button
                        className="admin-action-btn admin-action-btn--ghost"
                        type="button"
                        onClick={() =>
                          setDiscountForm({
                            id: "",
                            name: "",
                            code: "",
                            description: "",
                            type: "PERCENT",
                            scope: "ORDER",
                            value: "",
                            isActive: true,
                            startsAt: "",
                            endsAt: "",
                            productId: "",
                            categoryId: "",
                            clientProfileId: "",
                          })
                        }
                        disabled={actionLoading}
                      >
                        Очистить
                      </button>
                      {discountForm.id ? (
                        <button className="admin-action-btn admin-action-btn--ghost" type="button" onClick={handleDiscountDelete} disabled={actionLoading}>
                          Удалить
                        </button>
                      ) : null}
                    </div>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {discounts.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="admin-action-btn admin-action-btn--ghost"
                          onClick={() =>
                            setDiscountForm((prev) => ({
                              ...prev,
                              id: item.id,
                              name: item.name,
                              value: item.value,
                            }))
                          }
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="admin-form-card">
                    <h2 className="text-[24px] [font-family:'Cormorant_Garamond',serif]">Пользователи</h2>
                    <div className="mt-6 admin-form-grid">
                      <label className="admin-toolbar__label">
                        Email
                        <input
                          className="admin-input mt-2"
                          value={userForm.email}
                          onChange={(event) => setUserForm((prev) => ({ ...prev, email: event.target.value }))}
                          placeholder="user@company.com"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Телефон
                        <input
                          className="admin-input mt-2"
                          value={userForm.phone}
                          onChange={(event) => setUserForm((prev) => ({ ...prev, phone: event.target.value }))}
                          placeholder="+7 999 123 45 67"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Пароль
                        <input
                          className="admin-input mt-2"
                          value={userForm.passwordHash}
                          onChange={(event) => setUserForm((prev) => ({ ...prev, passwordHash: event.target.value }))}
                          placeholder="Введите пароль"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Имя
                        <input
                          className="admin-input mt-2"
                          value={userForm.firstName}
                          onChange={(event) => setUserForm((prev) => ({ ...prev, firstName: event.target.value }))}
                          placeholder="Мария"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Фамилия
                        <input
                          className="admin-input mt-2"
                          value={userForm.lastName}
                          onChange={(event) => setUserForm((prev) => ({ ...prev, lastName: event.target.value }))}
                          placeholder="Павлова"
                        />
                      </label>
                      <label className="admin-toolbar__label">
                        Роль
                        <select
                          className="admin-input mt-2"
                          value={userForm.role}
                          onChange={(event) => setUserForm((prev) => ({ ...prev, role: event.target.value }))}
                        >
                          <option value="CLIENT">Client</option>
                          <option value="MANAGER">Manager</option>
                        </select>
                      </label>
                      <label className="admin-toolbar__label">
                        Статус
                        <select
                          className="admin-input mt-2"
                          value={userForm.status}
                          onChange={(event) => setUserForm((prev) => ({ ...prev, status: event.target.value }))}
                        >
                          <option value="ACTIVE">Активен</option>
                          <option value="BLOCKED">Заблокирован</option>
                        </select>
                      </label>
                    </div>
                    {actionError ? <p className="mt-3 text-[14px] text-[#9b3d2f]">{actionError}</p> : null}
                    <div className="admin-form-actions">
                      <button className="admin-action-btn" type="button" onClick={handleUserSubmit} disabled={actionLoading}>
                        {userForm.id ? "Сохранить" : "Создать"}
                      </button>
                      <button
                        className="admin-action-btn admin-action-btn--ghost"
                        type="button"
                        onClick={() =>
                          setUserForm({
                            id: "",
                            email: "",
                            phone: "",
                            passwordHash: "",
                            firstName: "",
                            lastName: "",
                            role: "CLIENT",
                            status: "ACTIVE",
                          })
                        }
                        disabled={actionLoading}
                      >
                        Очистить
                      </button>
                      {userForm.id ? (
                        <button className="admin-action-btn admin-action-btn--ghost" type="button" onClick={handleUserDelete} disabled={actionLoading}>
                          Удалить
                        </button>
                      ) : null}
                    </div>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {users.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="admin-action-btn admin-action-btn--ghost"
                          onClick={() =>
                            setUserForm((prev) => ({
                              ...prev,
                              id: item.id,
                              email: item.email,
                              firstName: item.name.split(" ")[0] ?? item.name,
                              lastName: item.name.split(" ").slice(1).join(" "),
                              role: item.role,
                            }))
                          }
                        >
                          {item.email}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              {!["clients", "orders", "news", "catalog", "projects", "requests", "settings"].includes(activeKey) ? (
                <SectionMessage
                  title="Раздел не подключен"
                  description="Для этого раздела в текущем backend нет подходящего endpoint, либо он не входит в текущий этап интеграции. Экран оставлен без полной API-интеграции."
                />
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default AdminSectionPage;

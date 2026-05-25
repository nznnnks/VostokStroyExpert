import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

type CdekToken = { accessToken: string; expiresAtMs: number };

type CdekTariffListResponse = {
  tariff_codes?: Array<{
    tariff_code?: number;
    tariff_name?: string;
    delivery_sum?: number;
    period_min?: number;
    period_max?: number;
  }>;
  errors?: Array<{ code?: string; message?: string }>;
  message?: string;
};

type CdekTariffResponse = {
  tariff_code?: number;
  tariff_name?: string;
  delivery_sum?: number;
  period_min?: number;
  period_max?: number;
  errors?: Array<{ code?: string; message?: string }>;
  message?: string;
};

type CdekQuoteDebug = {
  usedHeavy: string | boolean;
  type: number;
  tariffCode: number;
  from_location: { code?: number; postal_code?: string };
  to_location: { postal_code?: string; city?: string };
  packages: Array<{ weight: number; length: number; width: number; height: number }>;
  additional_order_types: number[] | null;
  itemsCount: number;
  productsFoundForSpecs: number;
  items: Array<{
    productId?: string;
    quantity: number;
    weightG: number;
    lengthCm: number;
    widthCm: number;
    heightCm: number;
    usedDefaults: boolean;
  }>;
  fallbackReason?: string;
  availableTariffs?: Array<{ tariffCode?: number; tariffName?: string; price?: number }>;
};

type CdekDeliveryPoint = {
  code?: string;
  location?: {
    city_code?: number;
    postal_code?: string;
    city?: string;
    address?: string;
  };
};

@Injectable()
export class CdekService {
  constructor(private readonly prisma: PrismaService) {}

  private token: CdekToken | null = null;
  private fromCityCodeCache: number | null | undefined = undefined;
  private fromDeliveryPointCache: { cityCode: number | null; postalCode: string | null } | null | undefined =
    undefined;

  private get baseUrl() {
    return (process.env.CDEK_BASE_URL ?? 'https://api.cdek.ru').replace(/\/+$/, '');
  }

  private get clientId() {
    return process.env.CDEK_CLIENT_ID ?? '';
  }

  private get clientSecret() {
    return process.env.CDEK_CLIENT_SECRET ?? '';
  }

  private async getToken() {
    const now = Date.now();
    if (this.token && now < this.token.expiresAtMs - 30_000) {
      return this.token.accessToken;
    }

    if (!this.clientId || !this.clientSecret) {
      throw new ServiceUnavailableException('CDEK credentials are not configured (CDEK_CLIENT_ID / CDEK_CLIENT_SECRET).');
    }

    const url = new URL(`${this.baseUrl}/v2/oauth/token`);
    url.searchParams.set('grant_type', 'client_credentials');
    url.searchParams.set('client_id', this.clientId);
    url.searchParams.set('client_secret', this.clientSecret);

    const response = await fetch(url, { method: 'POST' });
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new ServiceUnavailableException(`CDEK auth failed (${response.status}). ${text}`.trim());
    }

    const json = (await response.json()) as { access_token?: string; expires_in?: number };
    if (!json.access_token) {
      throw new ServiceUnavailableException('CDEK auth response is missing access_token.');
    }

    const expiresInSec = Number(json.expires_in ?? 900);
    this.token = { accessToken: json.access_token, expiresAtMs: now + expiresInSec * 1000 };
    return json.access_token;
  }

  private async resolveCityCodeByName(city: string) {
    const normalized = city.trim();
    if (!normalized) return null;

    const token = await this.getToken();
    const url = new URL(`${this.baseUrl}/v2/location/cities`);
    url.searchParams.set('country_codes', 'RU');
    url.searchParams.set('city', normalized);
    url.searchParams.set('size', '1');

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      return null;
    }

    const json = (await response.json()) as Array<{ code?: number }> | { code?: number } | null;
    if (Array.isArray(json)) {
      const code = json[0]?.code;
      return typeof code === 'number' ? code : null;
    }
    if (json && typeof (json as { code?: number }).code === 'number') {
      return (json as { code: number }).code;
    }
    return null;
  }

  private async resolveDeliveryPointLocationByCode(code: string) {
    const normalized = code.trim();
    if (!normalized) return null;

    const token = await this.getToken();
    const url = new URL(`${this.baseUrl}/v2/deliverypoints`);
    url.searchParams.set('code', normalized);
    url.searchParams.set('size', '1');

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      return null;
    }

    const json = (await response.json()) as CdekDeliveryPoint[] | CdekDeliveryPoint | null;
    const first = Array.isArray(json) ? json[0] : json;
    const cityCode = first?.location?.city_code;
    const postalCode = first?.location?.postal_code;

    return {
      cityCode: typeof cityCode === 'number' ? cityCode : null,
      postalCode: typeof postalCode === 'string' && postalCode.trim() ? postalCode.trim() : null,
    };
  }

  private buildDebugPayload(input: {
    usedHeavy: string | boolean;
    type: number;
    tariffCode: number;
    from_location: { code?: number; postal_code?: string };
    to_location: { postal_code?: string; city?: string };
    packages: Array<{ weight: number; length: number; width: number; height: number }>;
    additional_order_types: number[] | null;
    itemsCount: number;
    productsFoundForSpecs: number;
    items: CdekQuoteDebug['items'];
    fallbackReason?: string;
    availableTariffs?: CdekQuoteDebug['availableTariffs'];
  }) {
    if (process.env.CDEK_DEBUG_QUOTE !== '1') {
      return {};
    }

    return {
      debug: {
        usedHeavy: input.usedHeavy,
        type: input.type,
        tariffCode: input.tariffCode,
        from_location: input.from_location,
        to_location: input.to_location,
        packages: input.packages,
        additional_order_types: input.additional_order_types,
        itemsCount: input.itemsCount,
        productsFoundForSpecs: input.productsFoundForSpecs,
        items: input.items,
        ...(input.fallbackReason ? { fallbackReason: input.fallbackReason } : {}),
        ...(input.availableTariffs ? { availableTariffs: input.availableTariffs } : {}),
      } satisfies CdekQuoteDebug,
    };
  }

  private async quoteFromTarifflist(input: {
    token: string;
    request: {
      type: number;
      from_location: { code?: number; postal_code?: string };
      to_location: { postal_code?: string; city?: string };
      packages: Array<{ weight: number; length: number; width: number; height: number }>;
    };
    preferredTariffCodes: number[];
    modeHint?: 'door' | 'cargo';
    strictPreferred?: boolean;
    debugMeta: Omit<CdekQuoteDebug, 'tariffCode' | 'type'> & { type: number };
    fallbackReason: string;
  }) {
    const response = await fetch(`${this.baseUrl}/v2/calculator/tarifflist`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${input.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input.request),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new ServiceUnavailableException(`CDEK tariff calculation failed (${response.status}). ${text}`.trim());
    }

    const json = (await response.json()) as CdekTariffListResponse;
    if (json.errors?.length) {
      const msg = json.errors.map((e) => e.message).filter(Boolean).join('; ') || 'CDEK tariff calculation failed.';
      throw new ServiceUnavailableException(msg);
    }

    const tariffs = (json.tariff_codes ?? []).filter((t) => typeof t.delivery_sum === 'number');
    if (!tariffs.length) {
      throw new ServiceUnavailableException(json.message || 'CDEK returned empty tariff list.');
    }

    const preferred = tariffs.find((t) => t.tariff_code && input.preferredTariffCodes.includes(t.tariff_code));

    const byMode =
      input.modeHint === 'door'
        ? tariffs.filter((t) => (t.tariff_name ?? '').toLowerCase().includes('двер'))
        : input.modeHint === 'cargo'
          ? tariffs.filter((t) => {
              const name = (t.tariff_name ?? '').toLowerCase();
              return name.includes('груз') || name.includes('двер');
            })
          : [];

    const selected =
      preferred ??
      (byMode.length > 0 ? byMode.reduce((min, t) => (t.delivery_sum! < min.delivery_sum! ? t : min), byMode[0]) : null) ??
      (!input.strictPreferred ? tariffs.reduce((min, t) => (t.delivery_sum! < min.delivery_sum! ? t : min), tariffs[0]) : null);

    if (!selected) {
      throw new ServiceUnavailableException(
        input.modeHint === 'door'
          ? 'Для этого направления нет доступного тарифа СДЭК с доставкой до двери.'
          : 'Для этого направления нет доступного сопоставимого тарифа СДЭК.',
      );
    }

    return {
      price: Number(selected.delivery_sum ?? 0),
      currency: 'RUB',
      periodMin: selected.period_min,
      periodMax: selected.period_max,
      tariffCode: selected.tariff_code,
      tariffName: selected.tariff_name,
      ...this.buildDebugPayload({
        ...input.debugMeta,
        type: input.request.type,
        tariffCode: selected.tariff_code ?? 0,
        fallbackReason: input.fallbackReason,
        availableTariffs: tariffs.map((t) => ({
          tariffCode: t.tariff_code,
          tariffName: t.tariff_name,
          price: t.delivery_sum,
        })),
      }),
    };
  }

  async getBestQuote(input: {
    toPostalCode?: string;
    toCity?: string;
    items: Array<{ productId?: string; quantity: number }>;
  }) {
    const itemsCount = input.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    if (itemsCount <= 0) {
      throw new BadRequestException('items must not be empty.');
    }

    // Defaults for local/testing:
    // Prefer explicit env vars; otherwise fall back to a configured CDEK delivery point (PVZ) in Moscow center.
    const fromPostalCodeEnv = (process.env.CDEK_FROM_POSTAL_CODE ?? '').trim();
    const fromCityCodeRaw = (process.env.CDEK_FROM_CITY_CODE ?? '').trim();
    const fromCityCodeEnv = fromCityCodeRaw ? Number(fromCityCodeRaw) : null;

    const fromDeliveryPointCode = (process.env.CDEK_FROM_DELIVERYPOINT_CODE ?? 'MSK2401').trim();
    if (this.fromDeliveryPointCache === undefined) {
      this.fromDeliveryPointCache = await this.resolveDeliveryPointLocationByCode(fromDeliveryPointCode);
    }

    const fromPostalCode =
      fromPostalCodeEnv || this.fromDeliveryPointCache?.postalCode || '101000';

    let fromCityCode =
      fromCityCodeEnv || this.fromDeliveryPointCache?.cityCode || null;

    if (!fromCityCode) {
      // Last resort: resolve by city name.
      if (this.fromCityCodeCache === undefined) {
        this.fromCityCodeCache = await this.resolveCityCodeByName('Москва');
      }
      fromCityCode = this.fromCityCodeCache ?? null;
    }

    const toPostalCode = (input.toPostalCode ?? '').trim();
    const toCity = (input.toCity ?? '').trim();
    if (!toPostalCode && !toCity) {
      throw new BadRequestException('Destination is missing (toPostalCode or toCity).');
    }

    const defaultWeightG = Math.max(Number(process.env.CDEK_DEFAULT_WEIGHT_G ?? 1000), 1);
    const defaultLengthCm = Math.max(Number(process.env.CDEK_DEFAULT_LENGTH_CM ?? 20), 1);
    const defaultWidthCm = Math.max(Number(process.env.CDEK_DEFAULT_WIDTH_CM ?? 20), 1);
    const defaultHeightCm = Math.max(Number(process.env.CDEK_DEFAULT_HEIGHT_CM ?? 10), 1);

    const productIds = input.items.map((item) => item.productId).filter((id): id is string => Boolean(id));
    const productSpecsById = productIds.length
      ? await this.loadProductShippingSpecs(productIds)
      : new Map<string, { weightG: number | null; lengthCm: number | null; widthCm: number | null; heightCm: number | null }>();

    const maxPackageWeightG = Math.max(Number(process.env.CDEK_MAX_PACKAGE_WEIGHT_G ?? 30000), 1);

    // Build packages from actual items. Each unit becomes its own package (closer to real logistics),
    // and we never "split" an overweight single item.
    const packages: Array<{ weight: number; length: number; width: number; height: number }> = [];
    let hasOverweightSingleItem = false;
    const debugItems: Array<{
      productId?: string;
      quantity: number;
      weightG: number;
      lengthCm: number;
      widthCm: number;
      heightCm: number;
      usedDefaults: boolean;
    }> = [];

    let productsFoundForSpecs = 0;
    for (const item of input.items) {
      const qty = Math.max(Number(item.quantity || 0), 0);
      if (qty <= 0) continue;

      const specs = item.productId ? productSpecsById.get(item.productId) : undefined;
      if (specs) productsFoundForSpecs += 1;
      const usedDefaults =
        !specs || specs.weightG === null || specs.lengthCm === null || specs.widthCm === null || specs.heightCm === null;
      const weightG = Math.max(Math.ceil(specs?.weightG ?? defaultWeightG), 1);
      const lengthCm = Math.max(Math.ceil(specs?.lengthCm ?? defaultLengthCm), 1);
      const widthCm = Math.max(Math.ceil(specs?.widthCm ?? defaultWidthCm), 1);
      const heightCm = Math.max(Math.ceil(specs?.heightCm ?? defaultHeightCm), 1);

      if (weightG > maxPackageWeightG) {
        hasOverweightSingleItem = true;
      }

      const perUnit = { weight: weightG, length: lengthCm, width: widthCm, height: heightCm };
      if (process.env.CDEK_DEBUG_QUOTE === '1') {
        debugItems.push({
          productId: item.productId,
          quantity: qty,
          weightG,
          lengthCm,
          widthCm,
          heightCm,
          usedDefaults,
        });
      }
      // Avoid generating ridiculous amount of packages; for quoting it's ok to cap and scale weight.
      // Most real baskets are small; if not, fallback to aggregated approximation.
      if (qty <= 30) {
        for (let i = 0; i < qty; i += 1) packages.push(perUnit);
      } else {
        // Aggregate: keep 30 packages and distribute the rest weight roughly.
        for (let i = 0; i < 30; i += 1) packages.push(perUnit);
        const extra = qty - 30;
        packages.push({
          weight: perUnit.weight * extra,
          length: perUnit.length,
          width: perUnit.width,
          height: perUnit.height,
        });
      }
    }

    if (packages.length === 0) {
      packages.push({
        weight: defaultWeightG,
        length: defaultLengthCm,
        width: defaultWidthCm,
        height: defaultHeightCm,
      });
    }

    const token = await this.getToken();

    const defaultCalcTypeRaw = (process.env.CDEK_CALC_TYPE ?? '1').trim();
    const heavyCalcTypeRaw = (process.env.CDEK_CALC_TYPE_HEAVY ?? '').trim();
    const defaultCalcType = Number(defaultCalcTypeRaw) === 2 ? 2 : 1;
    const heavyCalcType = Number(heavyCalcTypeRaw) === 2 ? 2 : 1;

    const baseRequest = {
      type: defaultCalcType, // 1 - интернет-магазин, 2 - доставка
      // CDEK calculator expects city "code" (internal city_code), not FIAS.
      from_location: fromCityCode ? { code: fromCityCode } : { postal_code: fromPostalCode },
      to_location: toPostalCode ? { postal_code: toPostalCode } : { city: toCity },
      packages: [
        ...packages,
      ],
    };

    // Tarifflist returns multiple delivery modes (warehouse-warehouse can be very cheap).
    // For checkout we default to a configured tariff_code (usually courier to door).
    // If there's a single item heavier than `CDEK_MAX_PACKAGE_WEIGHT_G`, use heavy/cargo tariff code.
    const defaultTariffCodeRaw = (process.env.CDEK_TARIFF_CODE ?? '137').trim();
    const heavyTariffCodeRaw = (process.env.CDEK_TARIFF_CODE_HEAVY ?? '').trim();
    const useHeavy = hasOverweightSingleItem && heavyTariffCodeRaw;
    const tariffCodeRaw = useHeavy ? heavyTariffCodeRaw : defaultTariffCodeRaw;
    const tariffCode = Number(tariffCodeRaw);
    if (Number.isFinite(tariffCode) && tariffCode > 0) {
      const requestPayload = useHeavy
        ? {
            ...baseRequest,
            type: heavyCalcType,
            tariff_code: tariffCode,
            // CDEK expects additional_order_types as an array of numeric codes.
            ...(process.env.CDEK_ADDITIONAL_ORDER_TYPE_HEAVY ?? '').trim()
              ? {
                  additional_order_types: [(Number((process.env.CDEK_ADDITIONAL_ORDER_TYPE_HEAVY ?? '2').trim()) || 2)],
                }
              : {
                  additional_order_types: [2],
                },
          }
        : { ...baseRequest, tariff_code: tariffCode };
      const response = await fetch(`${this.baseUrl}/v2/calculator/tariff`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        if (text.includes('err_result_service_empty')) {
          return this.quoteFromTarifflist({
            token,
            request: baseRequest,
            preferredTariffCodes: [tariffCode],
            modeHint: useHeavy ? 'cargo' : 'door',
            strictPreferred: true,
            debugMeta: {
              usedHeavy: useHeavy,
              from_location: requestPayload.from_location,
              to_location: requestPayload.to_location,
              packages: requestPayload.packages,
              additional_order_types: (requestPayload as any).additional_order_types ?? null,
              itemsCount,
              productsFoundForSpecs,
              items: debugItems,
              type: requestPayload.type,
            },
            fallbackReason: `tariff_${tariffCode}_unavailable`,
          });
        }
        throw new ServiceUnavailableException(`CDEK tariff calculation failed (${response.status}). ${text}`.trim());
      }

      const json = (await response.json()) as CdekTariffResponse;
      if (json.errors?.length) {
        if (json.errors.some((e) => e.code === 'err_result_service_empty')) {
          return this.quoteFromTarifflist({
            token,
            request: baseRequest,
            preferredTariffCodes: [tariffCode],
            modeHint: useHeavy ? 'cargo' : 'door',
            strictPreferred: true,
            debugMeta: {
              usedHeavy: useHeavy,
              from_location: requestPayload.from_location,
              to_location: requestPayload.to_location,
              packages: requestPayload.packages,
              additional_order_types: (requestPayload as any).additional_order_types ?? null,
              itemsCount,
              productsFoundForSpecs,
              items: debugItems,
              type: requestPayload.type,
            },
            fallbackReason: `tariff_${tariffCode}_unavailable`,
          });
        }
        const msg = json.errors.map((e) => e.message).filter(Boolean).join('; ') || 'CDEK tariff calculation failed.';
        throw new ServiceUnavailableException(msg);
      }
      if (typeof json.delivery_sum !== 'number') {
        throw new ServiceUnavailableException(json.message || 'CDEK tariff calculation returned empty delivery_sum.');
      }

      return {
        price: Number(json.delivery_sum ?? 0),
        currency: 'RUB',
        periodMin: json.period_min,
        periodMax: json.period_max,
        tariffCode: json.tariff_code ?? tariffCode,
        tariffName: json.tariff_name,
        ...this.buildDebugPayload({
          usedHeavy: useHeavy,
          type: requestPayload.type,
          tariffCode: requestPayload.tariff_code,
          from_location: requestPayload.from_location,
          to_location: requestPayload.to_location,
          packages: requestPayload.packages,
          additional_order_types: (requestPayload as any).additional_order_types ?? null,
          itemsCount,
          productsFoundForSpecs,
          items: debugItems,
        }),
      };
    }

    return this.quoteFromTarifflist({
      token,
      request: baseRequest,
      preferredTariffCodes: [],
      strictPreferred: false,
      debugMeta: {
        usedHeavy: false,
        from_location: baseRequest.from_location,
        to_location: baseRequest.to_location,
        packages: baseRequest.packages,
        additional_order_types: null,
        itemsCount,
        productsFoundForSpecs,
        items: debugItems,
        type: baseRequest.type,
      },
      fallbackReason: 'explicit_tariff_not_configured',
    });
  }

  private async loadProductShippingSpecs(productIds: string[]) {
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        filterValues: {
          where: {
            parameter: {
              OR: [
                { name: { contains: 'масса', mode: 'insensitive' } },
                { name: { contains: 'вес', mode: 'insensitive' } },
                { name: { contains: 'ширина', mode: 'insensitive' } },
                { name: { contains: 'высота', mode: 'insensitive' } },
                { name: { contains: 'глубина', mode: 'insensitive' } },
                { name: { contains: 'габарит', mode: 'insensitive' } },
                { name: { contains: 'размер', mode: 'insensitive' } },
                { slug: { contains: 'massa', mode: 'insensitive' } },
                { slug: { contains: 'ves', mode: 'insensitive' } },
                { slug: { contains: 'shirina', mode: 'insensitive' } },
                { slug: { contains: 'vysota', mode: 'insensitive' } },
                { slug: { contains: 'glubina', mode: 'insensitive' } },
              ],
            },
          },
          select: {
            value: true,
            numericValue: true,
            parameter: { select: { slug: true, name: true, unit: true } },
          },
        },
      },
    });

    const result = new Map<
      string,
      { weightG: number | null; lengthCm: number | null; widthCm: number | null; heightCm: number | null }
    >();

    for (const product of products) {
      const values: Array<{ slug: string; name: string; numeric: number | null; unit: string | null; raw: string }> = [];
      for (const fv of product.filterValues) {
        const numeric = fv.numericValue ? Number(fv.numericValue) : null;
        values.push({
          slug: fv.parameter.slug,
          name: fv.parameter.name,
          numeric,
          unit: fv.parameter.unit ?? null,
          raw: fv.value ?? '',
        });
      }

      const norm = (s: string) => s.toLowerCase().trim();
      const isPack = (s: string) => /упаковк|брутто|коробк/.test(norm(s));
      const isItem = (s: string) => /товара/.test(norm(s));

      const byKey = (predicate: (v: (typeof values)[number]) => boolean) => values.find(predicate) ?? null;

      const brutto = byKey((v) => /масса|вес/.test(norm(v.name)) && /брутто|упаковк/.test(norm(v.name)));
      const netto = byKey((v) => /масса|вес/.test(norm(v.name)) && /нетто/.test(norm(v.name)));
      const weightAny = byKey((v) => /масса|вес/.test(norm(v.name)));

      const weightG =
        this.toGrams(brutto?.numeric ?? null, brutto?.unit ?? null, brutto?.raw ?? '') ??
        this.toGrams(netto?.numeric ?? null, netto?.unit ?? null, netto?.raw ?? '') ??
        this.toGrams(weightAny?.numeric ?? null, weightAny?.unit ?? null, weightAny?.raw ?? '') ??
        null;

      const wPack = byKey((v) => /ширина/.test(norm(v.name)) && isPack(v.name));
      const hPack = byKey((v) => /высота/.test(norm(v.name)) && isPack(v.name));
      const dPack = byKey((v) => /глубина/.test(norm(v.name)) && isPack(v.name));

      const wItem = byKey((v) => /ширина/.test(norm(v.name)) && isItem(v.name) && !isPack(v.name));
      const hItem = byKey((v) => /высота/.test(norm(v.name)) && isItem(v.name) && !isPack(v.name));
      const dItem = byKey((v) => /глубина/.test(norm(v.name)) && isItem(v.name) && !isPack(v.name));

      const dimsPack = this.pickDimsCm(wPack, hPack, dPack);
      const dimsItem = this.pickDimsCm(wItem, hItem, dItem);

      const dims = dimsPack ?? dimsItem ?? null;

      result.set(product.id, {
        weightG,
        lengthCm: dims?.lengthCm ?? null,
        widthCm: dims?.widthCm ?? null,
        heightCm: dims?.heightCm ?? null,
      });
    }

    return result;
  }

  private pickDimsCm(
    w?: { numeric: number | null; unit: string | null; raw: string } | null,
    h?: { numeric: number | null; unit: string | null; raw: string } | null,
    d?: { numeric: number | null; unit: string | null; raw: string } | null,
  ) {
    let widthCm = this.toCm(w?.numeric ?? null, w?.unit ?? null, w?.raw ?? '');
    let heightCm = this.toCm(h?.numeric ?? null, h?.unit ?? null, h?.raw ?? '');
    let depthCm = this.toCm(d?.numeric ?? null, d?.unit ?? null, d?.raw ?? '');

    // Some catalog values come in packed form like "1000*200 мм" or "1000x200x50".
    // If any dimension is missing, try to parse multi-dimension strings from available raws.
    if (!widthCm || !heightCm || !depthCm) {
      const candidates = [w?.raw ?? '', h?.raw ?? '', d?.raw ?? ''].filter(Boolean);
      for (const raw of candidates) {
        const parsed = this.parsePackedDimsToCm(raw);
        if (!parsed) continue;
        if (parsed.length === 2) {
          widthCm ??= parsed[0];
          heightCm ??= parsed[1];
        } else if (parsed.length >= 3) {
          widthCm ??= parsed[0];
          heightCm ??= parsed[1];
          depthCm ??= parsed[2];
        }
        if (widthCm && heightCm && depthCm) break;
      }
    }

    if (!widthCm || !heightCm || !depthCm) return null;

    // Use the largest dimension as "length" to better match carrier expectations.
    const dims = [widthCm, heightCm, depthCm].sort((a, b) => b - a);
    return { lengthCm: dims[0], widthCm: dims[1], heightCm: dims[2] };
  }

  private toGrams(value: number | null, unit: string | null, raw: string) {
    const numeric = this.fallbackParseNumber(value, raw);
    if (!numeric || !Number.isFinite(numeric) || numeric <= 0) return null;
    const u = (unit ?? raw).toLowerCase();
    if (u.includes('кг') || u.includes('kg')) return Math.ceil(numeric * 1000);
    if (u.includes('г') || u.includes('gr') || u.includes('g')) return Math.ceil(numeric);
    if (u.includes('т')) return Math.ceil(numeric * 1_000_000);
    // No unit: most of the catalog uses kg for mass.
    return Math.ceil(numeric * 1000);
  }

  private toCm(value: number | null, unit: string | null, raw: string) {
    const numeric = this.fallbackParseNumber(value, raw);
    if (!numeric || !Number.isFinite(numeric) || numeric <= 0) return null;
    const u = (unit ?? raw).toLowerCase();
    if (u.includes('мм')) return Math.ceil(numeric / 10);
    if (u.includes('cm') || u.includes('см')) return Math.ceil(numeric);
    if ((u.includes('м') && !u.includes('мм')) || u.includes(' m')) return Math.ceil(numeric * 100);
    // No unit: assume centimeters (most catalog values are "см").
    return Math.ceil(numeric);
  }

  private fallbackParseNumber(value: number | null, raw: string) {
    if (value && Number.isFinite(value)) return value;
    const text = (raw ?? '').toString().replace(',', '.');
    const match = text.match(/(-?\d+(?:\.\d+)?)/);
    if (!match) return null;
    const parsed = Number(match[1]);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private parsePackedDimsToCm(raw: string) {
    const text = (raw ?? '').toString().toLowerCase();
    if (!text) return null;

    // Match 2-3 numbers separated by x/*/×/х (latin or cyrillic).
    const m = text
      .replace(',', '.')
      .match(/(\d+(?:\.\d+)?)\s*([xх\*×])\s*(\d+(?:\.\d+)?)(?:\s*([xх\*×])\s*(\d+(?:\.\d+)?))?/i);
    if (!m) return null;

    const nums = [m[1], m[3], m[5]].filter(Boolean).map((v) => Number(v));
    if (nums.some((n) => !Number.isFinite(n) || n <= 0)) return null;

    // Infer unit from the string.
    const unit = text.includes('мм') ? 'мм' : text.includes('см') ? 'см' : text.match(/(^|[^\w])м([^\w]|$)/) ? 'м' : null;
    const toCm = (n: number) => {
      if (unit === 'мм') return Math.ceil(n / 10);
      if (unit === 'м') return Math.ceil(n * 100);
      // default to cm
      return Math.ceil(n);
    };

    return nums.map(toCm);
  }
}

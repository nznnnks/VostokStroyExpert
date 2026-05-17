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

    let totalWeightG = 0;
    let totalVolumeCm3 = 0;
    let maxDimCm = 0;
    for (const item of input.items) {
      const qty = Math.max(Number(item.quantity || 0), 0);
      if (qty <= 0) continue;

      const specs = item.productId ? productSpecsById.get(item.productId) : undefined;
      const weightG = specs?.weightG ?? defaultWeightG;
      const lengthCm = specs?.lengthCm ?? defaultLengthCm;
      const widthCm = specs?.widthCm ?? defaultWidthCm;
      const heightCm = specs?.heightCm ?? defaultHeightCm;

      totalWeightG += weightG * qty;
      totalVolumeCm3 += lengthCm * widthCm * heightCm * qty;
      maxDimCm = Math.max(maxDimCm, lengthCm, widthCm, heightCm);
    }

    if (totalWeightG <= 0) {
      totalWeightG = defaultWeightG * itemsCount;
    }
    if (totalVolumeCm3 <= 0) {
      totalVolumeCm3 = defaultLengthCm * defaultWidthCm * defaultHeightCm * itemsCount;
      maxDimCm = Math.max(maxDimCm, defaultLengthCm, defaultWidthCm, defaultHeightCm);
    }

    const sideFromVolume = Math.ceil(Math.cbrt(totalVolumeCm3));
    const packageSide = Math.max(sideFromVolume, Math.ceil(maxDimCm), 1);

    const token = await this.getToken();

    const requestBody = {
      type: 1, // 1 - интернет-магазин
      // CDEK calculator expects city "code" (internal city_code), not FIAS.
      from_location: fromCityCode ? { code: fromCityCode } : { postal_code: fromPostalCode },
      to_location: toPostalCode ? { postal_code: toPostalCode } : { city: toCity },
      packages: [
        {
          weight: Math.max(Math.ceil(totalWeightG), 1), // grams
          length: packageSide, // cm
          width: packageSide,
          height: packageSide,
        },
      ],
    };

    const response = await fetch(`${this.baseUrl}/v2/calculator/tarifflist`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
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

    const best = tariffs.reduce((min, t) => (t.delivery_sum! < min.delivery_sum! ? t : min), tariffs[0]);
    return {
      price: Number(best.delivery_sum ?? 0),
      currency: 'RUB',
      periodMin: best.period_min,
      periodMax: best.period_max,
      tariffCode: best.tariff_code,
      tariffName: best.tariff_name,
    };
  }

  private async loadProductShippingSpecs(productIds: string[]) {
    const targetSlugs = new Set([
      'massa-tovara-s-upakovkoy-brutto',
      'massa-tovara-netto',
      'shirina-upakovki-tovara',
      'vysota-upakovki-tovara',
      'glubina-upakovki-tovara',
      'shirina-tovara',
      'vysota-tovara',
      'glubina-tovara',
    ]);

    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        filterValues: {
          where: { parameter: { slug: { in: Array.from(targetSlugs) } } },
          select: {
            value: true,
            numericValue: true,
            parameter: { select: { slug: true, unit: true } },
          },
        },
      },
    });

    const result = new Map<
      string,
      { weightG: number | null; lengthCm: number | null; widthCm: number | null; heightCm: number | null }
    >();

    for (const product of products) {
      const valuesBySlug = new Map<string, { numeric: number | null; unit: string | null; raw: string }>();
      for (const fv of product.filterValues) {
        const numeric = fv.numericValue ? Number(fv.numericValue) : null;
        valuesBySlug.set(fv.parameter.slug, { numeric, unit: fv.parameter.unit ?? null, raw: fv.value ?? '' });
      }

      const brutto = valuesBySlug.get('massa-tovara-s-upakovkoy-brutto');
      const netto = valuesBySlug.get('massa-tovara-netto');
      const weightG = this.toGrams(brutto?.numeric ?? null, brutto?.unit ?? null, brutto?.raw ?? '') ??
        this.toGrams(netto?.numeric ?? null, netto?.unit ?? null, netto?.raw ?? '') ??
        null;

      const wPack = valuesBySlug.get('shirina-upakovki-tovara');
      const hPack = valuesBySlug.get('vysota-upakovki-tovara');
      const dPack = valuesBySlug.get('glubina-upakovki-tovara');

      const wItem = valuesBySlug.get('shirina-tovara');
      const hItem = valuesBySlug.get('vysota-tovara');
      const dItem = valuesBySlug.get('glubina-tovara');

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

import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';

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

@Injectable()
export class CdekService {
  private token: CdekToken | null = null;
  private fromCityCodeCache: number | null | undefined = undefined;

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

  async getBestQuote(input: {
    toPostalCode?: string;
    toCity?: string;
    itemsCount: number;
  }) {
    if (input.itemsCount <= 0) {
      throw new BadRequestException('items must not be empty.');
    }

    // Defaults for local/testing: center of Moscow.
    // Prefer explicit env vars; otherwise fall back to postal code 101000 and try to resolve Moscow city_code.
    const fromPostalCodeEnv = (process.env.CDEK_FROM_POSTAL_CODE ?? '').trim();
    const fromCityCodeRaw = (process.env.CDEK_FROM_CITY_CODE ?? '').trim();
    const fromCityCodeEnv = fromCityCodeRaw ? Number(fromCityCodeRaw) : null;

    const fromPostalCode = fromPostalCodeEnv || '101000';
    let fromCityCode = fromCityCodeEnv;
    if (!fromCityCode) {
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

    const token = await this.getToken();

    const requestBody = {
      type: 1, // 1 - интернет-магазин
      from_location: fromCityCode ? { city_code: fromCityCode } : { postal_code: fromPostalCode },
      to_location: toPostalCode ? { postal_code: toPostalCode } : { city: toCity },
      packages: [
        {
          weight: defaultWeightG * input.itemsCount, // grams
          length: defaultLengthCm, // cm
          width: defaultWidthCm,
          height: defaultHeightCm,
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
}

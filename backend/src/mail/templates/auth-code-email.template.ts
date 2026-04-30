type AuthCodePurpose = 'email_verification' | 'login_code';

export type AuthCodeEmailTemplateParams = {
  purpose: AuthCodePurpose;
  code: string;
  expiresMinutes: number;
  brandName: string;
  publicUrl?: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function buildAuthCodeEmailTemplate(params: AuthCodeEmailTemplateParams) {
  const brandName = params.brandName.trim() || 'Climatrade';
  const code = params.code.trim();
  const expiresMinutes = params.expiresMinutes;
  const publicUrl = params.publicUrl?.trim() || null;

  const purposeText = params.purpose === 'email_verification' ? 'подтверждения email' : 'входа';
  const subject = `Код для ${purposeText}`;

  const textLines = [
    `${brandName}`,
    '',
    `Ваш код для ${purposeText}: ${code}`,
    `Код действует ${expiresMinutes} минут.`,
  ];

  if (publicUrl) {
    textLines.push('', `Сайт: ${publicUrl}`);
  }

  const text = textLines.join('\n');

  const html = `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f6f7fb;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td style="padding:24px 12px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e8e9ef;">
            <tr>
              <td style="padding:20px 22px;border-bottom:1px solid #f0f1f6;">
                <div style="font-size:16px;font-weight:700;color:#111827;">${escapeHtml(brandName)}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:22px;">
                <div style="font-size:14px;color:#111827;margin-bottom:10px;">Ваш код для ${escapeHtml(purposeText)}:</div>
                <div style="font-size:32px;letter-spacing:6px;font-weight:800;color:#111827;background:#f3f4f6;border-radius:10px;padding:14px 16px;display:inline-block;">
                  ${escapeHtml(code)}
                </div>
                <div style="font-size:13px;color:#6b7280;margin-top:12px;">Код действует ${escapeHtml(String(expiresMinutes))} минут.</div>
                ${
                  publicUrl
                    ? `<div style="font-size:13px;color:#6b7280;margin-top:16px;">Сайт: <a href="${escapeHtml(
                        publicUrl,
                      )}" style="color:#2563eb;text-decoration:none;">${escapeHtml(publicUrl)}</a></div>`
                    : ''
                }
              </td>
            </tr>
            <tr>
              <td style="padding:16px 22px;background:#fafafa;border-top:1px solid #f0f1f6;">
                <div style="font-size:12px;color:#9ca3af;">Если вы не запрашивали этот код, просто игнорируйте письмо.</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, text, html };
}


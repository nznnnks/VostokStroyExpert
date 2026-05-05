export type PasswordChangedEmailTemplateParams = {
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

export function buildPasswordChangedEmailTemplate(params: PasswordChangedEmailTemplateParams) {
  const brandName = params.brandName.trim() || 'Climatrade';
  const publicUrl = params.publicUrl?.trim() || null;
  const subject = 'Пароль успешно обновлён';

  const textLines = [
    `${brandName}`,
    '',
    'Ваш пароль был успешно обновлён.',
    'Если вы не выполняли это действие — пожалуйста, срочно смените пароль и обратитесь в поддержку.',
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
                <div style="font-size:16px;font-weight:700;color:#111827;">Пароль успешно обновлён</div>
                <div style="font-size:14px;color:#111827;margin-top:10px;line-height:1.6;">
                  Ваш пароль был успешно обновлён.
                </div>
                <div style="font-size:13px;color:#6b7280;margin-top:12px;line-height:1.6;">
                  Если вы не выполняли это действие — пожалуйста, срочно смените пароль и обратитесь в поддержку.
                </div>
                ${
                  publicUrl
                    ? `<div style="font-size:13px;color:#6b7280;margin-top:16px;">Сайт: <a href="${escapeHtml(
                        publicUrl,
                      )}" style="color:#2563eb;text-decoration:none;">${escapeHtml(publicUrl)}</a></div>`
                    : ''
                }
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


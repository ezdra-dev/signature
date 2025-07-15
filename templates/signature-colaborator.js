function SignatureColaborator({ name, position, email, phone, company = "Group Link", logoUrl }) {
  return `
    <div style="font-family: Arial, sans-serif; color: #222; max-width: 600px;">
      <table cellpadding="0" cellspacing="0" style="width:100%;">
        <tr>
          <td style="vertical-align:top; padding-right:16px;">
            <img src="${logoUrl || "https://your-company-logo-url.com/logo.png"}" alt="Logo" width="90" class="logo" style="border-radius:8px;">
          </td>
          <td style="vertical-align:top;">
            <div style="font-size:18px; font-weight:bold; color:#1a237e;">${name}</div>
            <div style="font-size:14px; color:#3949ab; margin-bottom:8px;">${position}</div>
            <div style="font-size:13px; color:#222;">
              <strong>E-mail:</strong> <a href="mailto:${email}" style="color:#3949ab;">${email}</a><br>
              <strong>Telefone:</strong> <a href="tel:${phone}" style="color:#3949ab;">${phone}</a><br>
              <strong>Empresa:</strong> ${company}
            </div>
            <div style="margin-top:12px; font-size:12px; color:#888;">
              <em>Esta assinatura foi gerada automaticamente pelo sistema Group Link.</em>
            </div>
          </td>
        </tr>
      </table>
    </div>
  `;
}

module.exports = { SignatureColaborator };
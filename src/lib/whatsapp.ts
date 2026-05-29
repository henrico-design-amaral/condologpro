export function normalizeBrazilianPhone(phone: string) {
  return phone.replace(/\D/g, "").replace(/^0+/, "");
}

export function buildWhatsAppUrl(phone: string, message: string) {
  const normalizedPhone = normalizeBrazilianPhone(phone);
  const phoneWithCountryCode = normalizedPhone.startsWith("55")
    ? normalizedPhone
    : `55${normalizedPhone}`;

  return `https://wa.me/${phoneWithCountryCode}?text=${encodeURIComponent(message)}`;
}

export function buildPackageNotificationMessage(input: {
  residentName: string;
  condominiumName: string;
  buildingLabel: string;
  unitLabel: string;
  receivedAt: Date;
}) {
  const date = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(input.receivedAt);

  return [
    `Olá, ${input.residentName}.`,
    "",
    `Sua encomenda chegou na portaria do ${input.condominiumName}.`,
    "",
    `Bloco: ${input.buildingLabel}`,
    `Apartamento: ${input.unitLabel}`,
    `Data/Hora: ${date}`,
    "",
    "Por favor, retire na administração/portaria quando possível."
  ].join("\n");
}

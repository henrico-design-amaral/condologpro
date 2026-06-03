export function formatDateTime(date: Date | null | undefined, fallback = "Não registrado") {
  if (!date) {
    return fallback;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(date);
}

export function formatDate(date: Date | null | undefined, fallback = "Não registrado") {
  if (!date) {
    return fallback;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short"
  }).format(date);
}

export function formatRelativeHours(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const hours = diffMs / (60 * 60 * 1000);

  if (hours < 1) {
    const minutes = Math.max(Math.round(diffMs / (60 * 1000)), 0);
    return `${minutes} min`;
  }

  if (hours < 48) {
    return `${Math.round(hours)} h`;
  }

  const days = Math.round(hours / 24);
  return `${days} dias`;
}

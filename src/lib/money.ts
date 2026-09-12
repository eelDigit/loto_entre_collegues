/**
 * Toutes les valeurs monétaires sont manipulées en centimes (entiers) en interne
 * pour éviter les erreurs d'arrondi liées aux nombres à virgule flottante,
 * puis converties en euros uniquement pour l'affichage.
 */

export function toCents(euros: number): number {
  return Math.round(euros * 100)
}

export function centsToEuros(cents: number): number {
  return cents / 100
}

export function formatEuros(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

export function computePot(participantCount: number, participationAmount: number): number {
  const cents = toCents(participationAmount) * participantCount
  return centsToEuros(cents)
}

export function computeSharePerParticipant(totalGain: number, participantCount: number): number {
  if (participantCount <= 0) return 0
  const cents = Math.round((toCents(totalGain) / participantCount) * 100) / 100
  return centsToEuros(cents)
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

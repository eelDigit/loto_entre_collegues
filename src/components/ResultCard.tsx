import { computeSharePerParticipant, formatEuros } from '../lib/money'

interface ResultCardProps {
  totalGain: number
  participantCount: number
}

export function ResultCard({ totalGain, participantCount }: ResultCardProps) {
  if (totalGain <= 0) {
    return (
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-5 text-center">
        <p className="text-brand-navy font-medium">
          Pas de gain pour ce tirage 🍀 On retente notre chance au prochain !
        </p>
      </div>
    )
  }

  const share = computeSharePerParticipant(totalGain, participantCount)

  return (
    <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-green">Résultat</p>
      <div className="grid grid-cols-2 gap-3 mt-3">
        <div className="rounded-xl bg-gray-50 px-3 py-2">
          <p className="text-xs text-gray-500">Gain total</p>
          <p className="text-lg font-bold text-brand-navy">{formatEuros(totalGain)}</p>
        </div>
        <div className="rounded-xl bg-gray-50 px-3 py-2">
          <p className="text-xs text-gray-500">Participants</p>
          <p className="text-lg font-bold text-brand-navy">{participantCount}</p>
        </div>
      </div>
      <div className="mt-3 rounded-xl bg-brand-green/10 px-3 py-3">
        <p className="text-xs text-gray-600">Part théorique par participant</p>
        <p className="text-xl font-bold text-brand-green-dark">{formatEuros(share)}</p>
      </div>
      <p className="text-xs text-gray-500 mt-3">
        Les gains de l'ensemble des tickets sont partagés à parts égales entre les participants de ce tirage.
      </p>
    </div>
  )
}

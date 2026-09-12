import type { Participant } from '../types'

interface ParticipantListProps {
  participants: Participant[]
  onRemove?: (participant: Participant) => void
  removable?: boolean
}

export function ParticipantList({ participants, onRemove, removable = false }: ParticipantListProps) {
  if (participants.length === 0) {
    return <p className="text-sm text-gray-500">Aucun participant pour le moment.</p>
  }

  return (
    <ul className="divide-y divide-gray-100 rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
      {participants.map((participant) => (
        <li key={participant.id} className="flex items-center justify-between px-4 py-3">
          <span className="text-brand-navy font-medium">✅ {participant.name}</span>
          {removable && onRemove && (
            <button
              type="button"
              onClick={() => onRemove(participant)}
              className="text-red-500 hover:text-red-600 text-lg leading-none"
              aria-label={`Supprimer ${participant.name}`}
            >
              ❌
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}

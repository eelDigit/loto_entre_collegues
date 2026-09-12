import type { DrawWithDetails } from '../types'
import { DrawCard } from './DrawCard'
import { ParticipantList } from './ParticipantList'
import { TicketGallery } from './TicketGallery'
import { ResultCard } from './ResultCard'

interface PublicDrawViewProps {
  draw: DrawWithDetails
}

export function PublicDrawView({ draw }: PublicDrawViewProps) {
  const participantCount = draw.participants.length

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      <DrawCard draw={draw} participantCount={participantCount} ticketCount={draw.tickets.length} />

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-green mb-2">Participants</h2>
        <ParticipantList participants={draw.participants} />
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-green mb-2">🎟️ Nos tickets</h2>
        <TicketGallery tickets={draw.tickets} />
      </section>

      {draw.total_gain !== null && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-green mb-2">Résultat</h2>
          <ResultCard totalGain={draw.total_gain} participantCount={participantCount} />
        </section>
      )}
    </div>
  )
}

import type { Draw } from '../types'
import { computePot, formatDate, formatDateTime, formatEuros } from '../lib/money'

interface DrawCardProps {
  draw: Draw
  participantCount: number
  ticketCount: number
}

export function DrawCard({ draw, participantCount, ticketCount }: DrawCardProps) {
  const pot = computePot(participantCount, draw.participation_amount)

  return (
    <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-green">Prochain tirage</p>
      <h2 className="text-xl font-bold text-brand-navy mt-1 capitalize">{formatDate(draw.draw_date)}</h2>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <Stat label="Participation" value={`${formatEuros(draw.participation_amount)} / pers.`} />
        <Stat label="👥 Participants" value={String(participantCount)} />
        <Stat label="💰 Cagnotte" value={formatEuros(pot)} />
        <Stat label="🎟️ Tickets" value={`${ticketCount} ticket${ticketCount === 1 ? '' : 's'}`} />
      </div>

      {draw.participations_locked && draw.participations_locked_at && (
        <div className="mt-4 rounded-xl bg-brand-navy/5 text-brand-navy text-sm px-3 py-2 flex items-center gap-2">
          <span>🔒</span>
          <span>
            Participations clôturées &mdash; liste définitive depuis le{' '}
            {formatDateTime(draw.participations_locked_at)}.
          </span>
        </div>
      )}

      {draw.tickets_locked && draw.tickets_locked_at && (
        <div className="mt-2 rounded-xl bg-brand-navy/5 text-brand-navy text-sm px-3 py-2 flex items-center gap-2">
          <span>🔒</span>
          <span>Tickets validés le {formatDateTime(draw.tickets_locked_at)}.</span>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 px-3 py-2">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-base font-semibold text-brand-navy">{value}</p>
    </div>
  )
}

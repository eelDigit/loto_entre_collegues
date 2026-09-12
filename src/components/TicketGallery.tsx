import { useState } from 'react'
import type { Ticket } from '../types'
import { formatDateTime } from '../lib/money'

interface TicketGalleryProps {
  tickets: Ticket[]
  onRemove?: (ticket: Ticket) => void
  removable?: boolean
}

export function TicketGallery({ tickets, onRemove, removable = false }: TicketGalleryProps) {
  const [selected, setSelected] = useState<Ticket | null>(null)

  if (tickets.length === 0) {
    return <p className="text-sm text-gray-500">Aucun ticket enregistré pour le moment.</p>
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {tickets.map((ticket, index) => (
          <div key={ticket.id} className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
            <button
              type="button"
              onClick={() => setSelected(ticket)}
              className="block w-full aspect-square bg-gray-50"
            >
              <img
                src={ticket.image_url}
                alt={`Ticket #${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
            <div className="px-3 py-2 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-brand-navy">Ticket #{index + 1}</p>
                <p className="text-xs text-gray-500">Ajouté le {formatDateTime(ticket.created_at)}</p>
              </div>
              {removable && onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(ticket)}
                  className="text-red-500 hover:text-red-600 text-lg leading-none"
                  aria-label={`Supprimer le ticket #${index + 1}`}
                >
                  ❌
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={() => setSelected(null)}
        >
          <img
            src={selected.image_url}
            alt="Ticket en grand"
            className="max-w-full max-h-full rounded-xl"
          />
        </div>
      )}
    </>
  )
}

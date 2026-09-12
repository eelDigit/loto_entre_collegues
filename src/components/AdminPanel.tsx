import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import type { DrawWithDetails, Participant, Ticket } from '../types'
import { ParticipantList } from './ParticipantList'
import { TicketGallery } from './TicketGallery'
import { DrawCard } from './DrawCard'
import { formatDateTime, formatEuros } from '../lib/money'
import {
  addParticipant,
  addTicket,
  lockParticipations,
  lockTickets,
  removeParticipant,
  removeTicket as removeTicketRequest,
  saveResult,
} from '../lib/draws'
import { uploadTicketPhoto } from '../lib/storage'

interface AdminPanelProps {
  draw: DrawWithDetails
  onDrawUpdated: (draw: DrawWithDetails) => void
}

export function AdminPanel({ draw, onDrawUpdated }: AdminPanelProps) {
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [gainInput, setGainInput] = useState(draw.total_gain !== null ? String(draw.total_gain) : '')
  const [uploading, setUploading] = useState(false)

  const publicUrl = `${window.location.origin}/tirage/${draw.id}`

  async function handleAddParticipant(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setBusy(true)
    setError(null)
    try {
      const participant = await addParticipant(draw.id, name.trim())
      onDrawUpdated({ ...draw, participants: [...draw.participants, participant] })
      setName('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setBusy(false)
    }
  }

  async function handleRemoveParticipant(participant: Participant) {
    setBusy(true)
    setError(null)
    try {
      await removeParticipant(participant.id)
      onDrawUpdated({ ...draw, participants: draw.participants.filter((p) => p.id !== participant.id) })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setBusy(false)
    }
  }

  async function handleLockParticipations() {
    const confirmed = window.confirm(
      'Après clôture, la liste des participants ne pourra plus être modifiée. Confirmer ?'
    )
    if (!confirmed) return
    setBusy(true)
    setError(null)
    try {
      const updated = await lockParticipations(draw.id)
      onDrawUpdated({ ...draw, ...updated })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setBusy(false)
    }
  }

  async function handleUploadTicket(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const imageUrl = await uploadTicketPhoto(draw.id, file)
      const ticket = await addTicket(draw.id, imageUrl)
      onDrawUpdated({ ...draw, tickets: [...draw.tickets, ticket] })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  async function handleRemoveTicket(ticket: Ticket) {
    setBusy(true)
    setError(null)
    try {
      await removeTicketRequest(ticket.id)
      onDrawUpdated({ ...draw, tickets: draw.tickets.filter((t) => t.id !== ticket.id) })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setBusy(false)
    }
  }

  async function handleLockTickets() {
    const confirmed = window.confirm(
      'Après validation, les tickets ne pourront plus être supprimés ni remplacés. Confirmer ?'
    )
    if (!confirmed) return
    setBusy(true)
    setError(null)
    try {
      const updated = await lockTickets(draw.id)
      onDrawUpdated({ ...draw, ...updated })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setBusy(false)
    }
  }

  async function handleSaveResult(e: React.FormEvent) {
    e.preventDefault()
    const value = parseFloat(gainInput.replace(',', '.'))
    if (Number.isNaN(value) || value < 0) {
      setError('Merci de saisir un montant valide.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const updated = await saveResult(draw.id, value)
      onDrawUpdated({ ...draw, ...updated })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      <DrawCard draw={draw} participantCount={draw.participants.length} ticketCount={draw.tickets.length} />

      {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-green">Participants</h2>

        {!draw.participations_locked && (
          <form onSubmit={handleAddParticipant} className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom du participant"
              className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
              disabled={busy}
            />
            <button
              type="submit"
              disabled={busy || !name.trim()}
              className="rounded-xl bg-brand-green text-white px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              Ajouter
            </button>
          </form>
        )}

        <ParticipantList
          participants={draw.participants}
          removable={!draw.participations_locked}
          onRemove={handleRemoveParticipant}
        />

        {!draw.participations_locked ? (
          <button
            type="button"
            onClick={handleLockParticipations}
            disabled={busy || draw.participants.length === 0}
            className="w-full rounded-xl bg-brand-navy text-white px-4 py-3 text-sm font-semibold disabled:opacity-50"
          >
            CLÔTURER LES PARTICIPATIONS
          </button>
        ) : (
          <p className="text-xs text-gray-500">
            🔒 Clôturé le {draw.participations_locked_at && formatDateTime(draw.participations_locked_at)}
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-green">Tickets</h2>

        {!draw.tickets_locked && (
          <label className="block">
            <span className="w-full inline-block text-center rounded-xl border-2 border-dashed border-brand-green/40 text-brand-green px-4 py-3 text-sm font-medium cursor-pointer hover:bg-brand-green/5">
              {uploading ? 'Envoi en cours...' : '+ Ajouter une photo'}
            </span>
            <input type="file" accept="image/*" className="hidden" onChange={handleUploadTicket} disabled={uploading} />
          </label>
        )}

        <TicketGallery
          tickets={draw.tickets}
          removable={!draw.tickets_locked}
          onRemove={handleRemoveTicket}
        />

        {!draw.tickets_locked ? (
          <button
            type="button"
            onClick={handleLockTickets}
            disabled={busy || draw.tickets.length === 0}
            className="w-full rounded-xl bg-brand-navy text-white px-4 py-3 text-sm font-semibold disabled:opacity-50"
          >
            VALIDER LES TICKETS
          </button>
        ) : (
          <p className="text-xs text-gray-500">
            🔒 Tickets validés le {draw.tickets_locked_at && formatDateTime(draw.tickets_locked_at)}
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-green">Résultat</h2>
        <form onSubmit={handleSaveResult} className="flex gap-2">
          <input
            type="text"
            inputMode="decimal"
            value={gainInput}
            onChange={(e) => setGainInput(e.target.value)}
            placeholder="Gain total (€)"
            className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
            disabled={busy}
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-xl bg-brand-green text-white px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            Enregistrer
          </button>
        </form>
        {draw.total_gain !== null && (
          <p className="text-xs text-gray-500">Gain enregistré : {formatEuros(draw.total_gain)}</p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-green">Partager le tirage</h2>
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-4 flex flex-col items-center gap-3">
          <QRCodeSVG value={publicUrl} size={160} />
          <p className="text-xs text-gray-500 text-center break-all">{publicUrl}</p>
        </div>
      </section>
    </div>
  )
}

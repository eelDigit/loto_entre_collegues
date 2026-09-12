import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { fetchAllDraws } from '../lib/draws'
import { supabase } from '../lib/supabase'
import { computePot, formatDate, formatEuros } from '../lib/money'
import type { Draw } from '../types'

interface DrawSummary extends Draw {
  participantCount: number
  ticketCount: number
}

export function HistoryPage() {
  const [draws, setDraws] = useState<DrawSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const allDraws = await fetchAllDraws()
        const summaries = await Promise.all(
          allDraws.map(async (draw) => {
            const [{ count: participantCount }, { count: ticketCount }] = await Promise.all([
              supabase.from('participant').select('id', { count: 'exact', head: true }).eq('draw_id', draw.id),
              supabase.from('ticket').select('id', { count: 'exact', head: true }).eq('draw_id', draw.id),
            ])
            return { ...draw, participantCount: participantCount ?? 0, ticketCount: ticketCount ?? 0 }
          })
        )
        setDraws(summaries)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-md mx-auto px-4 py-6 w-full">
        <h2 className="text-lg font-bold text-brand-navy mb-4">Historique des tirages</h2>

        {loading && <p className="text-center text-gray-500 py-10">Chargement...</p>}
        {error && <p className="text-center text-red-500 py-10">Erreur : {error}</p>}
        {!loading && !error && draws.length === 0 && (
          <p className="text-center text-gray-500 py-10">Aucun tirage passé.</p>
        )}

        <ul className="space-y-3">
          {draws.map((draw) => (
            <li key={draw.id}>
              <Link
                to={`/tirage/${draw.id}`}
                className="block rounded-2xl bg-white shadow-sm border border-gray-100 p-4 hover:border-brand-green transition-colors"
              >
                <p className="font-semibold text-brand-navy capitalize">{formatDate(draw.draw_date)}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {draw.participantCount} participants &middot;{' '}
                  {formatEuros(computePot(draw.participantCount, draw.participation_amount))} de cagnotte &middot;{' '}
                  {draw.ticketCount} ticket{draw.ticketCount === 1 ? '' : 's'}
                </p>
                <p className="text-sm mt-1">
                  {draw.total_gain === null ? (
                    <span className="text-gray-400">Résultat non renseigné</span>
                  ) : draw.total_gain > 0 ? (
                    <span className="text-brand-green-dark font-medium">Gain : {formatEuros(draw.total_gain)}</span>
                  ) : (
                    <span className="text-gray-500">Gain : 0 €</span>
                  )}
                </p>
              </Link>
            </li>
          ))}
        </ul>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-brand-green font-medium hover:underline">
            ← Retour au tirage en cours
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}

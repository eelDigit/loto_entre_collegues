import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { PublicDrawView } from '../components/PublicDrawView'
import { fetchDrawDetails } from '../lib/draws'
import type { DrawWithDetails } from '../types'

export function DrawPage() {
  const { id } = useParams<{ id: string }>()
  const [draw, setDraw] = useState<DrawWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    fetchDrawDetails(id)
      .then(setDraw)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {loading && <p className="text-center text-gray-500 py-10">Chargement...</p>}

        {error && <p className="text-center text-red-500 py-10">Erreur : {error}</p>}

        {!loading && !error && !draw && (
          <p className="text-center text-gray-500 py-10">Ce tirage n'existe pas.</p>
        )}

        {draw && <PublicDrawView draw={draw} />}

        <div className="text-center pb-6">
          <Link to="/historique" className="text-sm text-brand-green font-medium hover:underline">
            Voir l'historique des tirages →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}

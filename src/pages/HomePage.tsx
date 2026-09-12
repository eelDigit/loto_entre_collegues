import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { PublicDrawView } from '../components/PublicDrawView'
import { fetchLatestDraw } from '../lib/draws'
import type { DrawWithDetails } from '../types'

export function HomePage() {
  const [draw, setDraw] = useState<DrawWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLatestDraw()
      .then(setDraw)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {loading && <p className="text-center text-gray-500 py-10">Chargement...</p>}

        {error && <p className="text-center text-red-500 py-10">Erreur : {error}</p>}

        {!loading && !error && !draw && (
          <p className="text-center text-gray-500 py-10">Aucun tirage n'est encore disponible.</p>
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

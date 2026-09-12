import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { signIn, signOut } from '../lib/auth'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { AdminPanel } from '../components/AdminPanel'
import { createDraw, fetchLatestDraw } from '../lib/draws'
import type { DrawWithDetails } from '../types'

export function AdminPage() {
  const [session, setSession] = useState<Session | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setCheckingSession(false)
    })
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => subscription.subscription.unsubscribe()
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {checkingSession && <p className="text-center text-gray-500 py-10">Chargement...</p>}
        {!checkingSession && !session && <LoginForm />}
        {!checkingSession && session && <AdminDashboard onSignOut={() => signOut()} />}
      </main>
      <Footer />
    </div>
  )
}

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await signIn(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-10">
      <h2 className="text-lg font-bold text-brand-navy mb-4 text-center">Espace administrateur</h2>
      <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl bg-white shadow-sm border border-gray-100 p-5">
        <div>
          <label className="text-xs text-gray-500">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-brand-navy text-white px-4 py-2 text-sm font-semibold disabled:opacity-50"
        >
          Se connecter
        </button>
      </form>
    </div>
  )
}

function AdminDashboard({ onSignOut }: { onSignOut: () => void }) {
  const [draw, setDraw] = useState<DrawWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLatestDraw()
      .then(setDraw)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erreur inconnue'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-center text-gray-500 py-10">Chargement...</p>
  if (error) return <p className="text-center text-red-500 py-10">Erreur : {error}</p>

  return (
    <div>
      <div className="max-w-md mx-auto px-4 pt-4 flex justify-end">
        <button type="button" onClick={onSignOut} className="text-sm text-gray-500 hover:underline">
          Se déconnecter
        </button>
      </div>

      {draw ? (
        <AdminPanel draw={draw} onDrawUpdated={setDraw} />
      ) : (
        <NewDrawForm onCreated={setDraw} />
      )}
    </div>
  )
}

function NewDrawForm({ onCreated }: { onCreated: (draw: DrawWithDetails) => void }) {
  const [title, setTitle] = useState('')
  const [drawDate, setDrawDate] = useState('')
  const [amount, setAmount] = useState('2.20')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsedAmount = parseFloat(amount.replace(',', '.'))
    if (!title.trim() || !drawDate || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Merci de remplir correctement tous les champs.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const created = await createDraw({
        title: title.trim(),
        draw_date: drawDate,
        participation_amount: parsedAmount,
      })
      onCreated({ ...created, participants: [], tickets: [] })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-10">
      <h2 className="text-lg font-bold text-brand-navy mb-4 text-center">Créer le prochain tirage</h2>
      <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl bg-white shadow-sm border border-gray-100 p-5">
        <div>
          <label className="text-xs text-gray-500">Titre</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Loto du samedi 19 septembre 2026"
            className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">Date du tirage</label>
          <input
            type="date"
            value={drawDate}
            onChange={(e) => setDrawDate(e.target.value)}
            className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">Participation par personne (€)</label>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-brand-green text-white px-4 py-2 text-sm font-semibold disabled:opacity-50"
        >
          Créer le tirage
        </button>
      </form>
    </div>
  )
}

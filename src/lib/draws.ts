import { supabase } from './supabase'
import type { Draw, DrawWithDetails, Participant, Ticket } from '../types'

export async function fetchLatestDraw(): Promise<DrawWithDetails | null> {
  const { data: draw, error } = await supabase
    .from('draw')
    .select('*')
    .order('draw_date', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  if (!draw) return null

  return fetchDrawDetails(draw.id)
}

export async function fetchDrawDetails(drawId: string): Promise<DrawWithDetails | null> {
  const [{ data: draw, error: drawError }, { data: participants, error: pError }, { data: tickets, error: tError }] =
    await Promise.all([
      supabase.from('draw').select('*').eq('id', drawId).maybeSingle(),
      supabase.from('participant').select('*').eq('draw_id', drawId).order('created_at', { ascending: true }),
      supabase.from('ticket').select('*').eq('draw_id', drawId).order('created_at', { ascending: true }),
    ])

  if (drawError) throw drawError
  if (pError) throw pError
  if (tError) throw tError
  if (!draw) return null

  return {
    ...(draw as Draw),
    participants: (participants ?? []) as Participant[],
    tickets: (tickets ?? []) as Ticket[],
  }
}

export async function fetchAllDraws(): Promise<Draw[]> {
  const { data, error } = await supabase.from('draw').select('*').order('draw_date', { ascending: false })
  if (error) throw error
  return (data ?? []) as Draw[]
}

export async function createDraw(input: {
  title: string
  draw_date: string
  participation_amount: number
}): Promise<Draw> {
  const { data, error } = await supabase.from('draw').insert(input).select().single()
  if (error) throw error
  return data as Draw
}

export async function addParticipant(drawId: string, name: string): Promise<Participant> {
  const { data, error } = await supabase
    .from('participant')
    .insert({ draw_id: drawId, name })
    .select()
    .single()
  if (error) throw error
  return data as Participant
}

export async function removeParticipant(participantId: string): Promise<void> {
  const { error } = await supabase.from('participant').delete().eq('id', participantId)
  if (error) throw error
}

export async function lockParticipations(drawId: string): Promise<Draw> {
  const { data, error } = await supabase
    .from('draw')
    .update({ participations_locked: true, participations_locked_at: new Date().toISOString() })
    .eq('id', drawId)
    .select()
    .single()
  if (error) throw error
  return data as Draw
}

export async function addTicket(drawId: string, imageUrl: string): Promise<Ticket> {
  const { data, error } = await supabase
    .from('ticket')
    .insert({ draw_id: drawId, image_url: imageUrl })
    .select()
    .single()
  if (error) throw error
  return data as Ticket
}

export async function removeTicket(ticketId: string): Promise<void> {
  const { error } = await supabase.from('ticket').delete().eq('id', ticketId)
  if (error) throw error
}

export async function lockTickets(drawId: string): Promise<Draw> {
  const { data, error } = await supabase
    .from('draw')
    .update({ tickets_locked: true, tickets_locked_at: new Date().toISOString() })
    .eq('id', drawId)
    .select()
    .single()
  if (error) throw error
  return data as Draw
}

export async function saveResult(drawId: string, totalGain: number): Promise<Draw> {
  const { data, error } = await supabase
    .from('draw')
    .update({ total_gain: totalGain })
    .eq('id', drawId)
    .select()
    .single()
  if (error) throw error
  return data as Draw
}

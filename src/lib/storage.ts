import { supabase, TICKETS_BUCKET } from './supabase'

export async function uploadTicketPhoto(drawId: string, file: File): Promise<string> {
  const extension = file.name.split('.').pop() ?? 'jpg'
  const path = `${drawId}/${crypto.randomUUID()}.${extension}`

  const { error } = await supabase.storage.from(TICKETS_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error

  const { data } = supabase.storage.from(TICKETS_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

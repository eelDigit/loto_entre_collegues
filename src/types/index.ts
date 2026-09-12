export interface Draw {
  id: string
  title: string
  draw_date: string
  participation_amount: number
  participations_locked: boolean
  participations_locked_at: string | null
  tickets_locked: boolean
  tickets_locked_at: string | null
  total_gain: number | null
  created_at: string
}

export interface Participant {
  id: string
  draw_id: string
  name: string
  created_at: string
}

export interface Ticket {
  id: string
  draw_id: string
  image_url: string
  created_at: string
}

export interface DrawWithDetails extends Draw {
  participants: Participant[]
  tickets: Ticket[]
}

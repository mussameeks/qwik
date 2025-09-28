import type { ChatClient, ChatMessage, Unsubscribe } from './chatClient'
import { sb } from './supabase'

function mapRow(r: any): ChatMessage {
  return {
    id: r.id,
    roomId: r.room_id,
    userId: r.user_id,
    username: r.username,
    text: r.text,           // change to r.message if your column is renamed
    createdAt: r.created_at,
  }
}

export const chatSupabase: ChatClient = {
  async join(roomId, onMessage): Promise<Unsubscribe> {
    const channel = sb.channel(`room-${roomId}`)
    channel.on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${roomId}`
    }, (payload: any) => onMessage(mapRow(payload.new)))
    await channel.subscribe()
    return () => { sb.removeChannel(channel) }
  },

  async send(roomId, msg) {
    const { data, error } = await sb
      .from('chat_messages')
      .insert({
        room_id: roomId,
        user_id: msg.userId,
        username: msg.username,
        text: msg.text,     // change to message: msg.text if you renamed the column
      })
      .select('*')
      .single()

    if (error) throw error
    return mapRow(data)
  },

  async list(roomId, limit = 30, beforeId?: string) {
    let q = sb.from('chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (beforeId) {
      const { data: anchor } = await sb.from('chat_messages')
        .select('created_at').eq('id', beforeId).single()
      if (anchor?.created_at) q = q.lt('created_at', anchor.created_at)
    }

    const { data, error } = await q
    if (error) throw error
    return (data ?? []).map(mapRow).reverse()
  }
}

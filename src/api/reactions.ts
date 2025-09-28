// src/api/reactions.ts
import { sb } from './supabase'

export type ReactionCounts = Record<string, Record<string, number>> // messageId -> {emoji: count}
export type MyReactions = Record<string, Set<string>>               // messageId -> Set(emoji)

/**
 * Fetch all reactions for this room and aggregate on the client.
 * Also figures out which reactions were added by the current user.
 */
export async function fetchReactions(roomId: string){
  const [{ data: auth }, { data, error }] = await Promise.all([
    sb.auth.getUser(),
    sb.from('chat_reactions').select('message_id, emoji, user_id').eq('room_id', roomId)
  ])
  if (error) throw error

  const myId = auth.user?.id
  const counts: ReactionCounts = {}
  const mine: MyReactions = {}

  for (const r of (data ?? [])) {
    const mid = r.message_id as string
    const emoji = r.emoji as string
    // counts
    counts[mid] = counts[mid] || {}
    counts[mid][emoji] = (counts[mid][emoji] ?? 0) + 1
    // mine
    if (myId && r.user_id === myId) {
      ;(mine[mid] = mine[mid] || new Set()).add(emoji)
    }
  }

  return { counts, mine }
}

/**
 * Subscribe for live reaction inserts/deletes in this room.
 */
export function subscribeReactions(
  roomId: string,
  onInsert: (mId: string, emoji: string)=>void,
  onDelete: (mId: string, emoji: string)=>void
){
  const ch = sb.channel(`reactions:${roomId}`)

  ch.on('postgres_changes', {
    event: 'INSERT', schema: 'public', table: 'chat_reactions', filter: `room_id=eq.${roomId}`
  }, (p: any) => onInsert(p.new.message_id, p.new.emoji))

  ch.on('postgres_changes', {
    event: 'DELETE', schema: 'public', table: 'chat_reactions', filter: `room_id=eq.${roomId}`
  }, (p: any) => onDelete(p.old.message_id, p.old.emoji))

  ch.subscribe()
  return () => { sb.removeChannel(ch) }
}

export async function toggleReaction(roomId: string, messageId: string, emoji: string, userId: string){
  // Check if I already reacted with this emoji to this message
  const { data: exists } = await sb
    .from('chat_reactions')
    .select('message_id')
    .eq('message_id', messageId)
    .eq('room_id', roomId)
    .eq('user_id', userId)
    .eq('emoji', emoji)
    .limit(1)

  if (exists && exists.length) {
    await sb.from('chat_reactions').delete()
      .eq('message_id', messageId)
      .eq('room_id', roomId)
      .eq('user_id', userId)
      .eq('emoji', emoji)
  } else {
    await sb.from('chat_reactions').insert({ message_id: messageId, room_id: roomId, user_id: userId, emoji })
  }
}

// src/api/bot.ts
import { sb } from './supabase'

export async function postBotMessage(roomId: string, text: string, username = 'MatchBot') {
  const { data, error } = await sb.rpc('post_bot_message', {
    _room: roomId,
    _username: username,
    _text: text
  })
  if (error) throw error
  return data as string // new message uuid
}

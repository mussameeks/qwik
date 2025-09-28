export type Unsubscribe = () => void

export type ChatMessage = {
  id: string
  roomId: string
  userId: string
  username: string
  text: string
  createdAt: string
}

export interface ChatClient {
  join(roomId: string, onMessage: (m: ChatMessage)=>void): Promise<Unsubscribe>
  // return the saved message so the caller can replace optimistic bubble
  send(roomId: string, msg: Omit<ChatMessage,'id'|'createdAt'>): Promise<ChatMessage>
  list(roomId: string, limit?: number, beforeId?: string): Promise<ChatMessage[]>
}

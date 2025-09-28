import { ReactNode } from 'react'
import { useAuth } from '../../auth/AuthProvider'

export default function AuthGate({ children }: {children: ReactNode}){
  const { user, loading } = useAuth()
  if (loading) return <div className="small">Checking authentication…</div>
  if (!user) {
    return (
      <div className="stat" style={{textAlign:'center'}}>
        <div style={{fontWeight:700, marginBottom:8}}>Sign in required</div>
        <div className="small" style={{marginBottom:12}}>Please create an account or sign in to join the chat.</div>
        <a className="chip" href="/login">Go to Login</a>
      </div>
    )
  }
  return <>{children}</>
}

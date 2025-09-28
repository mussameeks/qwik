import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

export default function LoginPage(){
  const nav = useNavigate()
  const { signIn, signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [mode, setMode] = useState<'signin'|'signup'>('signin')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [info, setInfo] = useState<string | null>(null)

  async function submit(e: React.FormEvent){
    e.preventDefault()
    setError(null); setInfo(null); setBusy(true)
    try{
      if (mode==='signin') {
        await signIn(email, password)
        nav(-1)
      } else {
        await signUp(email, password, username.trim() || undefined)
        setInfo('Account created. Please check your inbox and confirm your email to complete sign up.')
        // Do NOT navigate; wait for user to confirm email via the link.
      }
    }catch(err:any){
      setError(err?.message ?? 'Authentication failed')
    }finally{ setBusy(false) }
  }

  return (
    <div className="container" style={{padding:'16px 0', maxWidth:420}}>
      <h2>{mode==='signin' ? 'Sign in' : 'Create account'}</h2>

      <form onSubmit={submit} className="stat" style={{display:'grid', gap:10}}>
        {mode==='signup' && (
          <>
            <label className="small">Username (display name)</label>
            <input
              type="text"
              value={username}
              onChange={e=> setUsername(e.target.value)}
              placeholder="e.g. Kylian_7"
            />
          </>
        )}

        <label className="small">Email</label>
        <input type="email" required value={email} onChange={e=> setEmail(e.target.value)} />

        <label className="small">Password</label>
        <input type="password" required value={password} onChange={e=> setPassword(e.target.value)} />

        {error && <div className="small" style={{color:'#f87171'}}>{error}</div>}
        {info && <div className="small" style={{color:'#22c55e'}}>{info}</div>}

        <button disabled={busy} className="chip">
          {busy ? 'Please wait…' : (mode==='signin' ? 'Sign in' : 'Sign up')}
        </button>
      </form>

      <div className="small" style={{marginTop:8}}>
        {mode==='signin' ? (
          <>No account? <button className="linklike" onClick={()=> setMode('signup')}>Sign up</button></>
        ) : (
          <>Already have an account? <button className="linklike" onClick={()=> setMode('signin')}>Sign in</button></>
        )}
      </div>
    </div>
  )
}

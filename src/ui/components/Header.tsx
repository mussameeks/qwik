import { useAuth } from '../../auth/AuthProvider'

export default function Header(){
  const { user, signOut } = useAuth()
  return (
    <header className="header">
      <div className="header-row">
        <img className="logo" src="/logo.svg" alt="Logo" />
        <div style={{marginLeft:'auto', display:'flex', gap:8, alignItems:'center'}}>
          {user ? (
            <>
              <span className="small" title={user.email ?? ''}>{user.email ?? 'Account'}</span>
              <button className="chip" onClick={signOut}>Sign out</button>
            </>
          ) : (
            <a className="chip" href="/login">Sign in</a>
          )}
        </div>
      </div>
    </header>
  )
}

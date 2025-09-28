import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthProvider'

export default function Header(){
  const { user, signOut } = useAuth()
  return (
    <header className="header">
      <div className="header-row">
        <Link to="/" aria-label="Go home">
          <img className="logo" src="/logo.svg" alt="Logo" />
        </Link>

        <div style={{ marginLeft:'auto', display:'flex', gap:8, alignItems:'center' }}>
          {user ? (
            <>
              <span className="small" title={user.email ?? ''}>{user.email ?? 'Account'}</span>
              <button className="chip" onClick={signOut}>Sign out</button>
            </>
          ) : (
            <Link className="chip" to="/login">Sign in</Link>
          )}
        </div>
      </div>
    </header>
  )
}

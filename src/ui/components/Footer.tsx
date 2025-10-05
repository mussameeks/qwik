import { Link } from 'react-router-dom'

export default function Footer(){
  return (
    <footer className="footer">
      <div className="container">
        <nav className="footer-nav" aria-label="Footer">
          <Link className="footer-link" to="/terms">Terms &amp; Conditions</Link>
          <Link className="footer-link" to="/privacy">Privacy Policy</Link>
          <Link className="footer-link" to="/cookies">Cookie Policy</Link>
        </nav>
      </div>
    </footer>
  )
}

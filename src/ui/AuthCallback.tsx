export default function AuthCallback(){
  return (
    <div className="container" style={{padding:'16px 0'}}>
      <h2>Email confirmed 🎉</h2>
      <p className="small" style={{marginTop:8}}>
        Your email has been confirmed. You can close this tab and return to the app.
      </p>
      <a className="chip" href="/">Go to Home</a>
    </div>
  )
}

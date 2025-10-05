import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './styles.css'
import RootLayout from './ui/RootLayout'
import HomePage from './ui/HomePage'
import MatchDetailsPage from './ui/MatchDetailsPage'
import LoginPage from './ui/LoginPage'
import AuthCallback from './ui/AuthCallback'
import FullscreenChatPage from './ui/FullscreenChatPage'
import ErrorBoundary from './ui/ErrorBoundary'

// NEW: legal pages
import TermsPage from './ui/legal/TermsPage'
import PrivacyPage from './ui/legal/PrivacyPage'
import CookiesPage from './ui/legal/CookiesPage'

const router = createBrowserRouter([
  { path: '/', element: <RootLayout />, children: [
    { index: true, element: <HomePage /> },
    { path: '/match/:matchId', element: <MatchDetailsPage /> },
    { path: '/login', element: <LoginPage /> },
    { path: '/auth/callback', element: <AuthCallback /> },
    { path: '/chat/:fixtureId', element: <FullscreenChatPage /> },

    // legal routes
    { path: '/terms', element: <TermsPage /> },
    { path: '/privacy', element: <PrivacyPage /> },
    { path: '/cookies', element: <CookiesPage /> },
  ]},
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </React.StrictMode>,
)

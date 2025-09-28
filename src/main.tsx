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

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'match/:matchId', element: <MatchDetailsPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'auth/callback', element: <AuthCallback /> },
      { path: 'match/:matchId/chat', element: <FullscreenChatPage /> },

    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)

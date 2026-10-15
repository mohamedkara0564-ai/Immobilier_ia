import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

function lireToken(token) {
  if (!token) return null
  try {
    const payload = token.split('.')[1]
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    const donnees = JSON.parse(json)
    if (donnees.exp && donnees.exp * 1000 < Date.now()) return null
    return donnees
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const stocke = localStorage.getItem('token')
    if (!lireToken(stocke)) {
      localStorage.removeItem('token')
      return null
    }
    return stocke
  })

  const utilisateur = lireToken(token)

  function connecter(nouveauToken) {
    localStorage.setItem('token', nouveauToken)
    setToken(nouveauToken)
  }

  function deconnecter() {
    localStorage.removeItem('token')
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ token, utilisateur, connecter, deconnecter }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
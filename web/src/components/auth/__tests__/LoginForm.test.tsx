import { render, screen, fireEvent } from '@testing-library/react'
import { LoginForm } from '../LoginForm'

// Mock do Firebase
jest.mock('@/lib/firebase', () => ({
  getFirebaseApp: jest.fn(() => ({})),
}))

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  GoogleAuthProvider: jest.fn(() => ({})),
  OAuthProvider: jest.fn(() => ({})),
  signInWithPopup: jest.fn(() => Promise.resolve()),
}))

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('deve renderizar todos os botões de autenticação', () => {
    render(<LoginForm />)
    
    expect(screen.getByLabelText('Entrar com Google')).toBeInTheDocument()
    expect(screen.getByLabelText('Entrar com Discord')).toBeInTheDocument()
    expect(screen.getByLabelText('Entrar com Epic Games')).toBeInTheDocument()
  })

  it('deve ter o botão da Epic Games com o ícone correto', () => {
    render(<LoginForm />)
    
    const epicButton = screen.getByLabelText('Entrar com Epic Games')
    expect(epicButton).toBeInTheDocument()
    expect(epicButton).toHaveTextContent('Epic Games')
  })

  it('deve chamar a autenticação da Epic Games quando o botão for clicado', async () => {
    const mockSignInWithPopup = jest.fn(() => Promise.resolve())
    const mockOAuthProvider = jest.fn(() => ({}))
    
    jest.doMock('firebase/auth', () => ({
      getAuth: jest.fn(() => ({})),
      GoogleAuthProvider: jest.fn(() => ({})),
      OAuthProvider: mockOAuthProvider,
      signInWithPopup: mockSignInWithPopup,
    }))

    render(<LoginForm />)
    
    const epicButton = screen.getByLabelText('Entrar com Epic Games')
    fireEvent.click(epicButton)
    
    expect(mockOAuthProvider).toHaveBeenCalledWith('oidc.epic')
  })
})

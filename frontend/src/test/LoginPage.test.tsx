import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock everything that uses routing or external calls
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  Link: ({ children, to }: { children: React.ReactNode, to: string }) => 
    <a href={to}>{children}</a>
}))

vi.mock('../api/auth', () => ({
  login: vi.fn()
}))

import LoginPage from '../pages/LoginPage'
import * as authApi from '../api/auth'

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login form', () => {
    render(<LoginPage />)
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows error message on failed login', async () => {
    vi.mocked(authApi.login).mockRejectedValueOnce({
      response: { data: { detail: 'Incorrect email or password' } }
    })
    render(<LoginPage />)
    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText('you@example.com'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('Enter your password'), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    expect(await screen.findByText('Incorrect email or password')).toBeInTheDocument()
  })

  it('shows loading state during login', async () => {
    vi.mocked(authApi.login).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(resolve, 1000))
    )
    render(<LoginPage />)
    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText('you@example.com'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('Enter your password'), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()
  })

  it('has link to register page', () => {
    render(<LoginPage />)
    expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument()
  })
})
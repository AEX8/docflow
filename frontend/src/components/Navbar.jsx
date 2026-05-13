import { Link, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
      <Link to="/" className="text-xl font-bold text-blue-400">
        DocFlow
      </Link>
      <div className="flex items-center gap-6">
        <Link to="/documents" className="hover:text-blue-400 transition-colors">
          Documents
        </Link>
        <Link to="/schemas" className="hover:text-blue-400 transition-colors">
          Schemas
        </Link>
        <button
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}
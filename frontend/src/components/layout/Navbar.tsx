import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Menu, X, LogOut, User, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { user, currentTeam, isAuthenticated, logout, setCurrentTeam } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [teamDropdownOpen, setTeamDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleTeamChange = (teamId: string) => {
    setCurrentTeam(teamId);
    setTeamDropdownOpen(false);
  };

  if (!isAuthenticated) return null;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">⚽</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Siuno Futbol</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors">
              Dashboard
            </Link>
            <Link to="/teams" className="text-gray-700 hover:text-blue-600 transition-colors">
              Teams
            </Link>
            <Link to="/matches" className="text-gray-700 hover:text-blue-600 transition-colors">
              Matches
            </Link>
            {currentTeam && (
              <Link to="/finance" className="text-gray-700 hover:text-blue-600 transition-colors">
                Finance
              </Link>
            )}
            {user?.role === 'SuperAdmin' && (
              <Link to="/admin" className="text-gray-700 hover:text-blue-600 transition-colors">
                Admin
              </Link>
            )}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Team Selector */}
            {user?.teams && user.teams.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setTeamDropdownOpen(!teamDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {currentTeam?.teamName || 'Select Team'}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>

                {teamDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {user.teams.map((team) => (
                      <button
                        key={team.teamId}
                        onClick={() => handleTeamChange(team.teamId)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="font-medium text-gray-900">{team.teamName}</div>
                        <div className="text-xs text-gray-500">{team.role}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <Link
                to="/profile"
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <User className="h-5 w-5" />
                <span className="text-sm font-medium">{user?.name}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-700"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3">
              <Link
                to="/"
                className="text-gray-700 hover:text-blue-600 transition-colors px-4 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/teams"
                className="text-gray-700 hover:text-blue-600 transition-colors px-4 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Teams
              </Link>
              <Link
                to="/matches"
                className="text-gray-700 hover:text-blue-600 transition-colors px-4 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Matches
              </Link>
              {currentTeam && (
                <Link
                  to="/finance"
                  className="text-gray-700 hover:text-blue-600 transition-colors px-4 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Finance
                </Link>
              )}
              {user?.role === 'SuperAdmin' && (
                <Link
                  to="/admin"
                  className="text-gray-700 hover:text-blue-600 transition-colors px-4 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin
                </Link>
              )}
              <Link
                to="/profile"
                className="text-gray-700 hover:text-blue-600 transition-colors px-4 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-red-600 transition-colors text-left px-4 py-2"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

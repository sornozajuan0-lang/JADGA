
import { Link, useLocation } from 'react-router-dom';

export default function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Inicio', icon: 'ri-home-heart-fill', gradient: 'from-pink-500 to-rose-500' },
    { path: '/juegos', label: 'Juegos', icon: 'ri-gamepad-fill', gradient: 'from-purple-500 to-pink-500' },
    { path: '/chat-educativo', label: 'Chat', icon: 'ri-chat-smile-3-fill', gradient: 'from-blue-500 to-cyan-500' },
    { path: '/progreso', label: 'Progreso', icon: 'ri-line-chart-fill', gradient: 'from-green-500 to-emerald-500' },
    { path: '/guia-padres', label: 'Guía Padres', icon: 'ri-parent-fill', gradient: 'from-orange-500 to-amber-500' },
  ];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <img 
                src="https://static.readdy.ai/image/1d713b29dbbebb8fe6e5a06a859a6428/3f88b637b577a6365d9555e19cba0e8a.png" 
                alt="JADGA Logo" 
                className="h-16 w-auto transition-transform duration-300 group-hover:scale-110"
              />
            </div>
          </Link>

          {/* Navigation Items */}
          <div className="flex space-x-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 whitespace-nowrap cursor-pointer ${
                  location.pathname === item.path
                    ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg scale-105`
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <i className={`${item.icon} text-lg`}></i>
                  <span>{item.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

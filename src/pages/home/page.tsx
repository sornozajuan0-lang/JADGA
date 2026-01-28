import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../components/feature/Navigation';

export default function HomePage() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [childName, setChildName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisited');
    if (hasVisited) {
      setShowWelcome(false);
    }
  }, []);

  const handleStart = () => {
    if (childName.trim()) {
      // Guardamos que ya visitó y su nombre
      localStorage.setItem('hasVisited', 'true');
      localStorage.setItem('childName', childName.trim());
      setShowWelcome(false);
    }
  };

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Elementos decorativos animados */}
        <div className="absolute top-10 left-10 text-6xl animate-bounce">⭐</div>
        <div className="absolute top-20 right-20 text-5xl animate-pulse">🌟</div>
        <div className="absolute bottom-20 left-20 text-5xl animate-bounce delay-100">✨</div>
        <div className="absolute bottom-10 right-10 text-6xl animate-pulse delay-200">🎈</div>
        
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-12 max-w-md w-full relative z-10 border-4 border-white">
          <div className="text-center mb-8">
            <div className="relative inline-block mb-6">
              <img 
                src="https://static.readdy.ai/image/1d713b29dbbebb8fe6e5a06a859a6428/3f88b637b577a6365d9555e19cba0e8a.png" 
                alt="JADGA Logo" 
                className="h-24 w-auto mx-auto animate-pulse"
              />
            </div>
            <h1 className="text-4xl font-black mb-3 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
              ¡Bienvenido!
            </h1>
            <p className="text-gray-600 text-lg font-semibold">Comencemos tu aventura de aprendizaje</p>
          </div>

          <div className="space-y-6">
            <div className="relative">
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                <span className="text-2xl mr-2">👤</span>
                ¿Cómo te llamas?
              </label>
              <input
                type="text"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleStart()}
                className="w-full px-4 py-3 border-3 border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-500 text-lg font-semibold transition-all duration-300"
                placeholder="Tu nombre"
              />
            </div>

            <button
              onClick={handleStart}
              disabled={!childName.trim()}
              className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white py-4 rounded-xl font-black text-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center">
                ¡Empezar a Aprender! 
                <i className="ri-rocket-fill ml-2 text-2xl"></i>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>

          <div className="mt-8 flex justify-center space-x-3">
            <span className="text-3xl animate-bounce">🎨</span>
            <span className="text-3xl animate-bounce delay-100">📚</span>
            <span className="text-3xl animate-bounce delay-200">🎮</span>
            <span className="text-3xl animate-bounce delay-300">🌈</span>
          </div>
        </div>
      </div>
    );
  }

  // ... (El resto de tu componente de cards se mantiene igual)
  const cards = [
    {
      title: 'Juegos Educativos',
      description: 'Aprende mientras te diviertes',
      icon: 'ri-gamepad-fill',
      path: '/juegos',
      gradient: 'from-purple-500 via-pink-500 to-rose-500',
      emoji: '🎮',
      bgPattern: 'bg-purple-100'
    },
    {
      title: 'Chat Educativo',
      description: 'Pregunta lo que quieras',
      icon: 'ri-chat-smile-3-fill',
      path: '/chat-educativo',
      gradient: 'from-blue-500 via-cyan-500 to-teal-500',
      emoji: '💬',
      bgPattern: 'bg-blue-100'
    },
    {
      title: 'Mi Progreso',
      description: 'Mira cuánto has aprendido',
      icon: 'ri-line-chart-fill',
      path: '/progreso',
      gradient: 'from-green-500 via-emerald-500 to-teal-500',
      emoji: '📊',
      bgPattern: 'bg-green-100'
    },
    {
      title: 'Guía para Padres',
      description: 'Recursos para papás',
      icon: 'ri-parent-fill',
      path: '/guia-padres',
      gradient: 'from-orange-500 via-amber-500 to-yellow-500',
      emoji: '👨‍👩‍👧',
      bgPattern: 'bg-orange-100'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-16 relative">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 animate-spin-slow">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-4xl">⭐</div>
              <div className="absolute top-1/2 -right-8 -translate-y-1/2 text-4xl">✨</div>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-4xl">🌟</div>
              <div className="absolute top-1/2 -left-8 -translate-y-1/2 text-4xl">💫</div>
            </div>
            
            <img 
              src="https://public.readdy.ai/ai/img_res/b6e2081c-a06b-44f2-91e3-56cac68b6311.png" 
              alt="JADGA Logo" 
              className="h-40 w-auto mx-auto animate-float"
            />
          </div>
          
          <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
            ¡Hola, {localStorage.getItem('childName') || 'Amigo'}! 👋
          </h1>
          <p className="text-2xl text-gray-600 font-bold">¿Qué quieres hacer hoy?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {cards.map((card, index) => (
            <div
              key={index}
              onClick={() => navigate(card.path)}
              className="group relative bg-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105 border-4 border-white overflow-hidden"
            >
              <div className={`absolute -top-10 -right-10 w-40 h-40 ${card.bgPattern} rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500`}></div>
              <div className={`absolute -bottom-10 -left-10 w-40 h-40 ${card.bgPattern} rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500`}></div>
              
              <div className="relative z-10">
                <div className={`bg-gradient-to-br ${card.gradient} w-28 h-28 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-2xl`}>
                  <i className={`${card.icon} text-6xl text-white`}></i>
                </div>
                <h2 className="text-4xl font-black text-gray-800 mb-3 group-hover:scale-105 transition-transform duration-300">
                  {card.title}
                </h2>
                <p className="text-xl text-gray-600 font-semibold mb-4">{card.description}</p>
                <div className="text-5xl group-hover:animate-bounce">{card.emoji}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '🎯', title: 'Aprende Jugando', desc: 'Juegos educativos divertidos', color: 'from-pink-400 to-rose-400' },
            { icon: '🏆', title: 'Gana Premios', desc: 'Colecciona logros y medallas', color: 'from-purple-400 to-pink-400' },
            { icon: '📈', title: 'Sigue tu Progreso', desc: 'Mira cómo mejoras cada día', color: 'from-blue-400 to-cyan-400' }
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:scale-105 group"
            >
              <div className={`text-6xl mb-4 group-hover:animate-bounce inline-block`}>{feature.icon}</div>
              <h3 className={`text-2xl font-black mb-2 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}>
                {feature.title}
              </h3>
              <p className="text-gray-600 font-semibold text-lg">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

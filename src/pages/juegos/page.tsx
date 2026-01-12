import { useState, useEffect } from 'react';
import Navigation from '../../components/feature/Navigation';
import { games } from '../../mocks/games';
import MemoryGame from './components/MemoryGame';
import MathSpeedGame from './components/MathSpeedGame';
import WordSearchGame from './components/WordSearchGame';
import PatternGame from './components/PatternGame';
import SequenceGame from './components/SequenceGame';
import TutorAssistant from '../../components/feature/TutorAssistant';

export default function Juegos() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [childName, setChildName] = useState('');

  useEffect(() => {
    const name = localStorage.getItem('childName');
    if (name) setChildName(name);
  }, []);

  const handleGameSelect = (gameId: string) => {
    setSelectedGame(gameId);
  };

  const handleBackToGames = () => {
    setSelectedGame(null);
  };

  const renderGame = () => {
    switch (selectedGame) {
      case 'memory':
        return <MemoryGame onBack={handleBackToGames} />;
      case 'math':
        return <MathSpeedGame onBack={handleBackToGames} />;
      case 'wordsearch':
        return <WordSearchGame onBack={handleBackToGames} />;
      case 'pattern':
        return <PatternGame onBack={handleBackToGames} />;
      case 'sequence':
        return <SequenceGame onBack={handleBackToGames} />;
      default:
        return null;
    }
  };

  if (selectedGame) {
    return (
      <>
        {renderGame()}
        <TutorAssistant />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400">
      <Navigation />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header con diseño mejorado */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-10 mb-10 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"></div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-200 rounded-full opacity-20"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-pink-200 rounded-full opacity-20"></div>
            
            <div className="relative z-10">
              <div className="text-6xl mb-4 animate-bounce">🎮</div>
              <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 mb-4">
                Juegos Cognitivos
              </h1>
              {childName && (
                <p className="text-2xl text-gray-700 font-semibold">
                  ¡{childName}, elige un juego y diviértete aprendiendo! 🌟
                </p>
              )}
            </div>
          </div>

          {/* Grid de juegos mejorado */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {games.map((game) => (
              <button
                key={game.id}
                onClick={() => handleGameSelect(game.id)}
                className="group bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 overflow-hidden cursor-pointer"
              >
                {/* Barra de color superior */}
                <div className={`h-3 bg-gradient-to-r ${game.color}`}></div>
                
                <div className="p-8">
                  {/* Icono con animación */}
                  <div className="relative mb-6">
                    <div className={`absolute inset-0 bg-gradient-to-r ${game.color} opacity-20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300`}></div>
                    <div className={`relative text-7xl w-24 h-24 mx-auto flex items-center justify-center bg-gradient-to-br ${game.color} rounded-2xl shadow-lg group-hover:rotate-6 transition-transform duration-300`}>
                      {game.icon}
                    </div>
                  </div>

                  {/* Contenido */}
                  <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 transition-all duration-300">
                    {game.name}
                  </h3>
                  <p className="text-gray-600 mb-4 text-base leading-relaxed">
                    {game.description}
                  </p>

                  {/* Etiquetas de habilidades */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {game.skills.slice(0, 2).map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Botón de acción */}
                  <div className="flex items-center justify-center text-purple-600 font-bold group-hover:text-pink-600 transition-colors duration-300">
                    <span>¡Jugar ahora!</span>
                    <i className="ri-arrow-right-line ml-2 group-hover:translate-x-2 transition-transform duration-300"></i>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Sección de beneficios */}
          <div className="mt-12 bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-6">
              ¿Por qué jugar? 🌈
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
                <div className="text-4xl mb-3">🧠</div>
                <h3 className="font-bold text-gray-800 mb-2">Desarrolla tu mente</h3>
                <p className="text-gray-600 text-sm">Mejora memoria, atención y razonamiento</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl">
                <div className="text-4xl mb-3">⚡</div>
                <h3 className="font-bold text-gray-800 mb-2">Aprende jugando</h3>
                <p className="text-gray-600 text-sm">Diversión y aprendizaje al mismo tiempo</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-pink-50 to-blue-50 rounded-2xl">
                <div className="text-4xl mb-3">🏆</div>
                <h3 className="font-bold text-gray-800 mb-2">Supera desafíos</h3>
                <p className="text-gray-600 text-sm">Cada juego es una nueva aventura</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <TutorAssistant />
    </div>
  );
}
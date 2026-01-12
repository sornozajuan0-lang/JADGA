import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_PUBLIC_SUPABASE_URL,
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY
);

interface SequenceGameProps {
  onBack: () => void;
}

export default function SequenceGame({ onBack }: SequenceGameProps) {
  const colors = [
    { id: 'red', name: 'Rojo', bg: 'bg-red-500', hover: 'hover:bg-red-600' },
    { id: 'blue', name: 'Azul', bg: 'bg-blue-500', hover: 'hover:bg-blue-600' },
    { id: 'green', name: 'Verde', bg: 'bg-green-500', hover: 'hover:bg-green-600' },
    { id: 'yellow', name: 'Amarillo', bg: 'bg-yellow-400', hover: 'hover:bg-yellow-500' },
  ];

  const [sequence, setSequence] = useState<string[]>([]);
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUserTurn, setIsUserTurn] = useState(false);
  const [level, setLevel] = useState(1);
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const playSequence = async (seq: string[]) => {
    setIsPlaying(true);
    setIsUserTurn(false);
    
    for (let i = 0; i < seq.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setActiveColor(seq[i]);
      await new Promise(resolve => setTimeout(resolve, 600));
      setActiveColor(null);
    }
    
    setIsPlaying(false);
    setIsUserTurn(true);
  };

  const startGame = () => {
    const newSequence = [colors[Math.floor(Math.random() * colors.length)].id];
    setSequence(newSequence);
    setUserSequence([]);
    setLevel(1);
    setGameOver(false);
    playSequence(newSequence);
  };

  const handleColorClick = async (color: string) => {
    if (!isUserTurn || isPlaying) return;

    const newUserSequence = [...userSequence, color];
    setUserSequence(newUserSequence);
    setActiveColor(color);
    setTimeout(() => setActiveColor(null), 300);

    if (newUserSequence[newUserSequence.length - 1] !== sequence[newUserSequence.length - 1]) {
      setGameOver(true);
      setIsUserTurn(false);
      return;
    }

    if (newUserSequence.length === sequence.length) {
      const currentProgress = parseInt(localStorage.getItem('totalScore') || '0');
      localStorage.setItem('totalScore', (currentProgress + 10).toString());
      
      // Guardar progreso en Supabase
      const childName = localStorage.getItem('childName') || 'Estudiante';
      
      await supabase.from('activity_log').insert({
        child_name: childName,
        activity_type: 'game',
        activity_name: 'Juego de Secuencias',
        points_earned: 10,
        details: { level: level + 1 }
      });

      const { data: currentProgressData } = await supabase
        .from('user_progress')
        .select('*')
        .eq('child_name', childName)
        .single();

      if (currentProgressData) {
        const newScore = currentProgressData.total_score + 10;
        const newLevelProgress = Math.floor(newScore / 100) + 1;
        
        await supabase
          .from('user_progress')
          .update({
            total_score: newScore,
            level: newLevelProgress,
            games_completed: currentProgressData.games_completed + 1,
            updated_at: new Date().toISOString()
          })
          .eq('child_name', childName);
      } else {
        await supabase.from('user_progress').insert({
          child_name: childName,
          total_score: 10,
          level: 1,
          games_completed: 1,
          questions_answered: 0
        });
      }

      setTimeout(() => {
        const newSequence = [...sequence, colors[Math.floor(Math.random() * colors.length)].id];
        setSequence(newSequence);
        setUserSequence([]);
        setLevel(level + 1);
        playSequence(newSequence);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-blue-500 p-4 flex items-center justify-center">
      <div className="container mx-auto max-w-2xl">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
            >
              <i className="ri-arrow-left-line text-xl mr-2"></i>
              <span className="font-semibold">Volver</span>
            </button>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              🎨 Secuencia de Colores
            </h2>
          </div>

          <div className="text-center mb-8">
            <div className="bg-purple-100 rounded-xl px-6 py-3 inline-block">
              <p className="text-sm text-gray-600">Nivel</p>
              <p className="text-3xl font-bold text-purple-600">{level}</p>
            </div>
          </div>

          {gameOver && (
            <div className="bg-orange-50 border-2 border-orange-500 rounded-2xl p-6 mb-6 text-center">
              <div className="text-5xl mb-3">💪</div>
              <h3 className="text-2xl font-bold text-orange-800 mb-2">¡Buen intento!</h3>
              <p className="text-orange-700 mb-4">Llegaste al nivel {level}</p>
              <button
                onClick={startGame}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-2 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all cursor-pointer whitespace-nowrap"
              >
                Intentar de nuevo
              </button>
            </div>
          )}

          {!isPlaying && !isUserTurn && !gameOver && (
            <div className="text-center mb-8">
              <button
                onClick={startGame}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xl font-bold py-4 px-8 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all cursor-pointer whitespace-nowrap"
              >
                Comenzar Juego
              </button>
            </div>
          )}

          {(isPlaying || isUserTurn) && (
            <div className="text-center mb-6">
              <p className="text-xl font-semibold text-gray-700">
                {isPlaying ? '👀 Observa la secuencia...' : '✋ ¡Tu turno! Repite la secuencia'}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {colors.map((color) => (
              <button
                key={color.id}
                onClick={() => handleColorClick(color.id)}
                disabled={!isUserTurn || isPlaying}
                className={`aspect-square rounded-2xl ${color.bg} ${
                  activeColor === color.id ? 'scale-95 brightness-150' : ''
                } ${isUserTurn && !isPlaying ? color.hover : ''} transition-all duration-200 cursor-pointer ${
                  !isUserTurn || isPlaying ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                <span className="text-white text-2xl font-bold">{color.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_PUBLIC_SUPABASE_URL,
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY
);

interface PatternGameProps {
  onBack: () => void;
}

export default function PatternGame({ onBack }: PatternGameProps) {
  const shapes = ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠'];
  
  const patterns = [
    { sequence: ['🔴', '🔵', '🔴', '🔵', '?'], answer: '🔴' },
    { sequence: ['🟢', '🟢', '🔵', '🟢', '🟢', '🔵', '?'], answer: '🟢' },
    { sequence: ['🔴', '🔵', '🟢', '🔴', '🔵', '🟢', '?'], answer: '🔴' },
    { sequence: ['🟡', '🟣', '🟡', '🟣', '?'], answer: '🟡' },
    { sequence: ['🔴', '🔴', '🔵', '🔴', '🔴', '🔵', '?'], answer: '🔴' },
    { sequence: ['🟢', '🟡', '🟠', '🟢', '🟡', '🟠', '?'], answer: '🟢' },
    { sequence: ['🔵', '🔵', '🔵', '🟢', '🔵', '🔵', '🔵', '🟢', '?'], answer: '🔵' },
    { sequence: ['🟣', '🟡', '🟣', '🟣', '🟡', '🟣', '🟣', '🟡', '?'], answer: '🟣' },
  ];

  const [currentPattern, setCurrentPattern] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const handleAnswerSelect = (shape: string) => {
    if (showFeedback) return;
    setSelectedAnswer(shape);
  };

  const handleSubmit = () => {
    if (!selectedAnswer) return;
    
    const correct = selectedAnswer === patterns[currentPattern].answer;
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      setScore(score + 1);
      const currentProgress = parseInt(localStorage.getItem('totalScore') || '0');
      localStorage.setItem('totalScore', (currentProgress + 10).toString());
    }
  };

  const handleNext = () => {
    setShowFeedback(false);
    setSelectedAnswer(null);
    
    if (currentPattern < patterns.length - 1) {
      setCurrentPattern(currentPattern + 1);
    } else {
      setIsComplete(true);
    }
  };

  const resetGame = () => {
    setCurrentPattern(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setScore(0);
    setIsComplete(false);
  };

  const checkAnswer = async (answer: string) => {
    if (answer === correctAnswer) {
      setScore(score + 1);
      setFeedback('¡Correcto! 🎉');
      setShowFeedback(true);

      setTimeout(() => {
        if (score + 1 >= 10) {
          setGameWon(true);
          
          // Guardar progreso en Supabase
          const childName = localStorage.getItem('childName') || 'Estudiante';
          
          supabase.from('activity_log').insert({
            child_name: childName,
            activity_type: 'game',
            activity_name: 'Juego de Patrones',
            points_earned: 10,
            details: { score: score + 1 }
          }).then(() => {
            return supabase
              .from('user_progress')
              .select('*')
              .eq('child_name', childName)
              .single();
          }).then(({ data: currentProgress }) => {
            if (currentProgress) {
              const newScore = currentProgress.total_score + 10;
              const newLevel = Math.floor(newScore / 100) + 1;
              
              return supabase
                .from('user_progress')
                .update({
                  total_score: newScore,
                  level: newLevel,
                  games_completed: currentProgress.games_completed + 1,
                  updated_at: new Date().toISOString()
                })
                .eq('child_name', childName);
            } else {
              return supabase.from('user_progress').insert({
                child_name: childName,
                total_score: 10,
                level: 1,
                games_completed: 1,
                questions_answered: 0
              });
            }
          });
        } else {
          generatePattern();
          setShowFeedback(false);
        }
      }, 1500);
    } else {
      setLives(lives - 1);
      setFeedback('Intenta de nuevo 💪');
      setShowFeedback(true);

      setTimeout(() => {
        setShowFeedback(false);
      }, 1500);
    }
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-blue-500 p-4 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl text-center">
          <div className="text-7xl mb-6">🎉</div>
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            ¡Juego Completado!
          </h2>
          <p className="text-2xl text-gray-700 mb-8">
            Obtuviste <span className="font-bold text-purple-600">{score}</span> de {patterns.length} correctas
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={resetGame}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-bold py-3 px-8 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all cursor-pointer whitespace-nowrap"
            >
              Jugar de nuevo
            </button>
            <button
              onClick={onBack}
              className="bg-white border-2 border-purple-500 text-purple-600 text-lg font-bold py-3 px-8 rounded-xl hover:bg-purple-50 transition-all cursor-pointer whitespace-nowrap"
            >
              Volver a Juegos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-blue-500 p-4">
      <div className="container mx-auto max-w-3xl">
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
              🧩 Patrones Lógicos
            </h2>
          </div>

          <div className="flex justify-between items-center mb-8">
            <div className="bg-purple-100 rounded-xl px-6 py-3">
              <p className="text-sm text-gray-600">Patrón</p>
              <p className="text-2xl font-bold text-purple-600">{currentPattern + 1}/{patterns.length}</p>
            </div>
            <div className="bg-blue-100 rounded-xl px-6 py-3">
              <p className="text-sm text-gray-600">Correctas</p>
              <p className="text-2xl font-bold text-blue-600">{score}</p>
            </div>
          </div>

          <div className="mb-8">
            <p className="text-center text-xl text-gray-700 mb-6 font-semibold">
              ¿Qué figura completa el patrón?
            </p>
            <div className="flex justify-center items-center gap-3 mb-8 flex-wrap">
              {patterns[currentPattern].sequence.map((shape, index) => (
                <div
                  key={index}
                  className={`w-16 h-16 rounded-xl flex items-center justify-center text-4xl ${
                    shape === '?' ? 'bg-gray-200 border-4 border-dashed border-purple-400' : 'bg-white border-2 border-gray-300'
                  }`}
                >
                  {shape}
                </div>
              ))}
            </div>
          </div>

          {showFeedback && (
            <div className={`mb-6 p-6 rounded-2xl ${isCorrect ? 'bg-green-50' : 'bg-orange-50'}`}>
              <div className="flex items-center justify-center">
                <div className="text-4xl mr-4">{isCorrect ? '✅' : '💡'}</div>
                <div>
                  <h3 className={`text-xl font-bold ${isCorrect ? 'text-green-800' : 'text-orange-800'}`}>
                    {isCorrect ? '¡Correcto!' : '¡Intenta de nuevo!'}
                  </h3>
                  <p className={`${isCorrect ? 'text-green-700' : 'text-orange-700'}`}>
                    {isCorrect ? 'Identificaste el patrón correctamente' : `La respuesta correcta era ${patterns[currentPattern].answer}`}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6">
            <p className="text-center text-gray-600 mb-4">Selecciona la figura correcta:</p>
            <div className="flex justify-center gap-4 flex-wrap">
              {shapes.map((shape) => (
                <button
                  key={shape}
                  onClick={() => handleAnswerSelect(shape)}
                  disabled={showFeedback}
                  className={`w-20 h-20 rounded-xl text-5xl flex items-center justify-center transition-all cursor-pointer ${
                    selectedAnswer === shape
                      ? 'bg-purple-100 border-4 border-purple-500 scale-110'
                      : 'bg-white border-2 border-gray-300 hover:border-purple-300 hover:scale-105'
                  } ${showFeedback ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {shape}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            {!showFeedback ? (
              <button
                onClick={handleSubmit}
                disabled={!selectedAnswer}
                className={`text-lg font-bold py-3 px-8 rounded-xl transition-all shadow-lg whitespace-nowrap cursor-pointer ${
                  selectedAnswer
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Verificar Respuesta
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-bold py-3 px-8 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg whitespace-nowrap cursor-pointer"
              >
                {currentPattern < patterns.length - 1 ? 'Siguiente Patrón' : 'Ver Resultados'} →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
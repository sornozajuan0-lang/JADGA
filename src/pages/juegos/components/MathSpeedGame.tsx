import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_PUBLIC_SUPABASE_URL,
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY
);

interface MathSpeedGameProps {
  onBack: () => void;
}

interface Question {
  num1: number;
  num2: number;
  operator: string;
  answer: number;
}

export default function MathSpeedGame({ onBack }: MathSpeedGameProps) {
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const gameOverRef = useRef(false);

  // Timer effect
  useEffect(() => {
    if (!isPlaying || timeLeft <= 0) return;

    const timer = setTimeout(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (!gameOverRef.current) {
            gameOverRef.current = true;
            handleGameOver();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, isPlaying]);

  const generateQuestion = (): Question => {
    const operators = ['+', '-', '×'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    let num1: number, num2: number, answer: number;

    switch (operator) {
      case '+':
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 50) + 1;
        answer = num1 + num2;
        break;
      case '-':
        num1 = Math.floor(Math.random() * 50) + 20;
        num2 = Math.floor(Math.random() * (num1 - 1)) + 1;
        answer = num1 - num2;
        break;
      case '×':
        num1 = Math.floor(Math.random() * 12) + 1;
        num2 = Math.floor(Math.random() * 12) + 1;
        answer = num1 * num2;
        break;
      default:
        num1 = 0;
        num2 = 0;
        answer = 0;
    }

    return { num1, num2, operator, answer };
  };

  const startGame = () => {
    gameOverRef.current = false;
    setIsPlaying(true);
    setTimeLeft(60);
    setScore(0);
    setUserAnswer('');
    setIsGameOver(false);
    setCurrentQuestion(generateQuestion());
  };

  const handleGameOver = async () => {
    setIsPlaying(false);
    setIsGameOver(true);
    
    if (score >= 5) {
      const childName = localStorage.getItem('childName') || 'Estudiante';
      
      try {
        await supabase.from('activity_log').insert({
          child_name: childName,
          activity_type: 'game',
          activity_name: 'Matemáticas Rápidas',
          points_earned: 10,
          details: { score: score }
        });

        const { data: currentProgress } = await supabase
          .from('user_progress')
          .select('*')
          .eq('child_name', childName)
          .single();

        if (currentProgress) {
          const newScore = currentProgress.total_score + 10;
          const newLevel = Math.floor(newScore / 100) + 1;
          
          await supabase
            .from('user_progress')
            .update({
              total_score: newScore,
              level: newLevel,
              games_completed: currentProgress.games_completed + 1,
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
      } catch (error) {
        console.error('Error al guardar progreso:', error);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestion || userAnswer === '' || !isPlaying) return;

    const numAnswer = parseInt(userAnswer);
    if (!isNaN(numAnswer) && numAnswer === currentQuestion.answer) {
      setScore(prev => prev + 1);
    }

    setUserAnswer('');
    setCurrentQuestion(generateQuestion());
  };

  if (isGameOver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-blue-500 p-4 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl text-center">
          <div className="text-7xl mb-6">⚡</div>
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            ¡Tiempo Terminado!
          </h2>
          <p className="text-2xl text-gray-700 mb-8">
            Resolviste <span className="font-bold text-purple-600">{score}</span> operaciones correctamente
          </p>
          {score >= 5 && (
            <div className="bg-green-100 border-2 border-green-400 rounded-2xl p-4 mb-6">
              <p className="text-green-700 font-semibold">🎉 ¡Ganaste 10 puntos!</p>
            </div>
          )}
          <div className="flex gap-4 justify-center">
            <button
              onClick={startGame}
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
              ⚡ Matemática Rápida
            </h2>
            <div className="w-20"></div>
          </div>

          {!isPlaying && !isGameOver && (
            <div className="text-center py-12">
              <div className="text-6xl mb-6">🧮</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                ¿Listo para el desafío?
              </h3>
              <p className="text-gray-600 mb-8">
                Resuelve todas las operaciones que puedas en 60 segundos
              </p>
              <button
                onClick={startGame}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xl font-bold py-4 px-8 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all cursor-pointer whitespace-nowrap"
              >
                Comenzar Juego
              </button>
            </div>
          )}

          {isPlaying && currentQuestion && (
            <>
              <div className="flex justify-between items-center mb-8">
                <div className="bg-blue-100 rounded-xl px-6 py-3">
                  <p className="text-sm text-gray-600">Tiempo</p>
                  <p className={`text-3xl font-bold ${timeLeft <= 10 ? 'text-red-600 animate-pulse' : 'text-blue-600'}`}>
                    {timeLeft}s
                  </p>
                </div>
                <div className="bg-purple-100 rounded-xl px-6 py-3">
                  <p className="text-sm text-gray-600">Puntos</p>
                  <p className="text-3xl font-bold text-purple-600">{score}</p>
                </div>
              </div>

              <div className="text-center mb-8">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-12 mb-6">
                  <p className="text-6xl font-bold text-gray-800 mb-4">
                    {currentQuestion.num1} {currentQuestion.operator} {currentQuestion.num2} = ?
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="max-w-xs mx-auto">
                  <input
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="w-full px-6 py-4 text-3xl text-center border-2 border-purple-300 rounded-2xl focus:outline-none focus:border-purple-500 mb-4"
                    placeholder="?"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xl font-bold py-4 px-8 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all cursor-pointer whitespace-nowrap"
                  >
                    Responder
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
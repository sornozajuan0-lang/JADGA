import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_PUBLIC_SUPABASE_URL,
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY
);

interface MemoryGameProps {
  onBack: () => void;
}

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function MemoryGame({ onBack }: MemoryGameProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const gameCards = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(gameCards);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setIsComplete(false);
  };

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2 || cards[id].isFlipped || cards[id].isMatched) return;

    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      const [first, second] = newFlipped;
      
      if (cards[first].emoji === cards[second].emoji) {
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[first].isMatched = true;
          matchedCards[second].isMatched = true;
          setCards(matchedCards);
          setFlippedCards([]);
          setMatches(matches + 1);
          
          if (matches + 1 === emojis.length) {
            setIsComplete(true);
            const currentProgress = parseInt(localStorage.getItem('totalScore') || '0');
            localStorage.setItem('totalScore', (currentProgress + 10).toString());
          }
        }, 500);
      } else {
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[first].isFlipped = false;
          resetCards[second].isFlipped = false;
          setCards(resetCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const checkWin = async (newCards: Card[]) => {
    if (newCards.every((card) => card.isMatched)) {
      setGameWon(true);
      
      // Guardar progreso en Supabase
      const childName = localStorage.getItem('childName') || 'Estudiante';
      
      // Registrar actividad
      await supabase.from('activity_log').insert({
        child_name: childName,
        activity_type: 'game',
        activity_name: 'Juego de Memoria',
        points_earned: 10,
        details: { moves: moves, time: timer }
      });

      // Actualizar progreso
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
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-blue-500 p-4">
      <div className="container mx-auto max-w-4xl">
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
              🃏 Memoria de Parejas
            </h2>
          </div>

          <div className="flex justify-around mb-6">
            <div className="bg-blue-100 rounded-xl px-6 py-3">
              <p className="text-sm text-gray-600">Movimientos</p>
              <p className="text-2xl font-bold text-blue-600">{moves}</p>
            </div>
            <div className="bg-purple-100 rounded-xl px-6 py-3">
              <p className="text-sm text-gray-600">Parejas</p>
              <p className="text-2xl font-bold text-purple-600">{matches}/{emojis.length}</p>
            </div>
          </div>

          {isComplete && (
            <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-6 mb-6 text-center">
              <div className="text-5xl mb-3">🎉</div>
              <h3 className="text-2xl font-bold text-green-800 mb-2">¡Felicitaciones!</h3>
              <p className="text-green-700 mb-4">Completaste el juego en {moves} movimientos</p>
              <button
                onClick={initializeGame}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-2 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all cursor-pointer whitespace-nowrap"
              >
                Jugar de nuevo
              </button>
            </div>
          )}

          <div className="grid grid-cols-4 gap-4">
            {cards.map((card) => (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`aspect-square rounded-xl text-5xl flex items-center justify-center font-bold transition-all duration-300 cursor-pointer ${
                  card.isFlipped || card.isMatched
                    ? 'bg-white border-2 border-purple-500'
                    : 'bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                }`}
              >
                {card.isFlipped || card.isMatched ? card.emoji : '?'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
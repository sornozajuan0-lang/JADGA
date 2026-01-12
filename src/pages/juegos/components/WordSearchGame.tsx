import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_PUBLIC_SUPABASE_URL,
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY
);

interface WordSearchGameProps {
  onBack: () => void;
}

export default function WordSearchGame({ onBack }: WordSearchGameProps) {
  const words = ['GATO', 'PERRO', 'CASA', 'SOL', 'LUNA', 'MAR'];
  
  const grid = [
    ['G', 'A', 'T', 'O', 'X', 'M', 'A', 'R'],
    ['P', 'X', 'C', 'X', 'L', 'X', 'X', 'X'],
    ['E', 'X', 'A', 'X', 'U', 'X', 'S', 'X'],
    ['R', 'X', 'S', 'X', 'N', 'X', 'O', 'X'],
    ['R', 'X', 'A', 'X', 'A', 'X', 'L', 'X'],
    ['O', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
  ];

  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [isComplete, setIsComplete] = useState(false);

  const handleCellClick = (row: number, col: number) => {
    const cellKey = `${row}-${col}`;
    const newSelected = new Set(selectedCells);
    
    if (newSelected.has(cellKey)) {
      newSelected.delete(cellKey);
    } else {
      newSelected.add(cellKey);
    }
    
    setSelectedCells(newSelected);
    checkForWords(newSelected);
  };

  const checkForWords = (selected: Set<string>) => {
    const newFoundWords = new Set(foundWords);
    
    words.forEach(word => {
      if (!foundWords.has(word)) {
        let found = false;
        
        for (let row = 0; row < grid.length; row++) {
          for (let col = 0; col < grid[row].length; col++) {
            if (checkWord(word, row, col, 0, 1, selected)) found = true;
            if (checkWord(word, row, col, 1, 0, selected)) found = true;
          }
        }
        
        if (found) {
          newFoundWords.add(word);
        }
      }
    });
    
    if (newFoundWords.size > foundWords.size) {
      setFoundWords(newFoundWords);
      
      if (newFoundWords.size === words.length) {
        setIsComplete(true);
        const currentProgress = parseInt(localStorage.getItem('totalScore') || '0');
        localStorage.setItem('totalScore', (currentProgress + 10).toString());
      }
    }
  };

  const checkWord = (word: string, startRow: number, startCol: number, rowDir: number, colDir: number, selected: Set<string>): boolean => {
    for (let i = 0; i < word.length; i++) {
      const row = startRow + i * rowDir;
      const col = startCol + i * colDir;
      
      if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) {
        return false;
      }
      
      if (grid[row][col] !== word[i] || !selected.has(`${row}-${col}`)) {
        return false;
      }
    }
    return true;
  };

  const resetGame = () => {
    setSelectedCells(new Set());
    setFoundWords(new Set());
    setIsComplete(false);
  };

  const checkWin = async (newFoundWords: string[]) => {
    if (newFoundWords.length === words.length) {
      setGameWon(true);
      
      // Guardar progreso en Supabase
      const childName = localStorage.getItem('childName') || 'Estudiante';
      
      await supabase.from('activity_log').insert({
        child_name: childName,
        activity_type: 'game',
        activity_name: 'Sopa de Letras',
        points_earned: 10,
        details: { words: words.length, time: timer }
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
              🔤 Sopa de Letras
            </h2>
          </div>

          <div className="mb-6">
            <p className="text-center text-gray-700 mb-4">
              Encuentra las palabras seleccionando las letras en orden
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {words.map(word => (
                <span
                  key={word}
                  className={`px-4 py-2 rounded-xl font-semibold ${
                    foundWords.has(word)
                      ? 'bg-green-100 text-green-700 line-through'
                      : 'bg-purple-100 text-purple-700'
                  }`}
                >
                  {word}
                </span>
              ))}
            </div>
          </div>

          {isComplete && (
            <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-6 mb-6 text-center">
              <div className="text-5xl mb-3">🎉</div>
              <h3 className="text-2xl font-bold text-green-800 mb-2">¡Excelente!</h3>
              <p className="text-green-700 mb-4">Encontraste todas las palabras</p>
              <button
                onClick={resetGame}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-2 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all cursor-pointer whitespace-nowrap"
              >
                Jugar de nuevo
              </button>
            </div>
          )}

          <div className="flex justify-center">
            <div className="inline-grid gap-2" style={{ gridTemplateColumns: `repeat(${grid[0].length}, minmax(0, 1fr))` }}>
              {grid.map((row, rowIndex) =>
                row.map((letter, colIndex) => {
                  const cellKey = `${rowIndex}-${colIndex}`;
                  const isSelected = selectedCells.has(cellKey);
                  
                  return (
                    <button
                      key={cellKey}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      className={`w-12 h-12 rounded-lg font-bold text-xl transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white scale-110'
                          : 'bg-gray-100 text-gray-700 hover:bg-purple-100'
                      }`}
                    >
                      {letter}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={resetGame}
              className="text-purple-600 font-semibold hover:text-purple-700 transition-colors cursor-pointer"
            >
              Reiniciar juego
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
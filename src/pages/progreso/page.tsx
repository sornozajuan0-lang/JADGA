import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Navigation from '../../components/feature/Navigation';
import TutorAssistant from '../../components/feature/TutorAssistant';

const supabase = createClient(
  import.meta.env.VITE_PUBLIC_SUPABASE_URL,
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY
);

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  requirement: number;
}

interface Activity {
  id: string;
  activity_type: string;
  activity_name: string;
  points_earned: number;
  created_at: string;
}

interface UserProgress {
  total_score: number;
  level: number;
  games_completed: number;
  questions_answered: number;
}

export default function Progreso() {
  const [loading, setLoading] = useState(true);
  const [childName, setChildName] = useState('');
  const [progress, setProgress] = useState<UserProgress>({
    total_score: 0,
    level: 1,
    games_completed: 0,
    questions_answered: 0
  });
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: 'first-game', name: 'Primer Juego', description: 'Completa tu primer juego', icon: '🎮', unlocked: false, requirement: 1 },
    { id: 'explorer', name: 'Explorador', description: 'Gana 50 puntos', icon: '🔍', unlocked: false, requirement: 50 },
    { id: 'curious', name: 'Curioso', description: 'Responde 10 preguntas', icon: '❓', unlocked: false, requirement: 10 },
    { id: 'student', name: 'Estudiante Dedicado', description: 'Gana 100 puntos', icon: '📚', unlocked: false, requirement: 100 },
    { id: 'gamer', name: 'Jugador Experto', description: 'Completa 20 juegos', icon: '🎯', unlocked: false, requirement: 20 },
    { id: 'champion', name: 'Campeón', description: 'Gana 200 puntos', icon: '🏆', unlocked: false, requirement: 200 },
    { id: 'genius', name: 'Genio', description: 'Gana 500 puntos', icon: '🧠', unlocked: false, requirement: 500 },
    { id: 'master', name: 'Maestro', description: 'Gana 1000 puntos', icon: '⭐', unlocked: false, requirement: 1000 },
  ]);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      // Forzamos minúsculas para que coincida con lo que guardan los juegos
      const rawName = localStorage.getItem('childName') || 'Estudiante';
      const name = rawName.trim().toLowerCase();
      setChildName(rawName); // Mostramos el nombre original en la UI

      // Buscamos en la tabla 'user_progress'
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('*')
        .eq('child_name', name)
        .single();

      if (progressData) {
        // MAPEAMOS LOS NOMBRES DE LAS COLUMNAS CORRECTAMENTE
        const totalPoints = progressData.total_points || 0;
        const gamesPlayed = progressData.games_played || 0;
        
        // Calculamos nivel (1 nivel cada 100 puntos)
        const calculatedLevel = Math.floor(totalPoints / 100) + 1;

        setProgress({
          total_score: totalPoints,
          level: calculatedLevel,
          games_completed: gamesPlayed,
          questions_answered: progressData.questions_answered || 0
        });

        // Actualizar logros
        setAchievements(prev => prev.map(achievement => {
          let unlocked = false;
          if (achievement.id === 'first-game' || achievement.id === 'gamer') {
            unlocked = gamesPlayed >= achievement.requirement;
          } else if (achievement.id === 'curious') {
            unlocked = (progressData.questions_answered || 0) >= achievement.requirement;
          } else {
            unlocked = totalPoints >= achievement.requirement;
          }
          return { ...achievement, unlocked };
        }));
      }

      // Cargar actividades (Si tienes la tabla activity_log)
      const { data: activitiesData } = await supabase
        .from('activity_log')
        .select('*')
        .eq('child_name', name)
        .order('created_at', { ascending: false })
        .limit(10);

      if (activitiesData) {
        setRecentActivities(activitiesData);
      }
    } catch (error) {
      console.error('Error cargando progreso:', error);
    } finally {
      setLoading(false);
    }
  };

  const progressToNextLevel = (progress.total_score % 100);
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'game': return '🎮';
      case 'chat': return '💬';
      case 'question': return '❓';
      default: return '📚';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-blue-500 flex items-center justify-center">
        <div className="text-white text-2xl font-bold animate-pulse">Cargando tu progreso...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-blue-500">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 text-center">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
              Tu Progreso
            </h1>
            <p className="text-xl text-gray-600">
              ¡Sigue así, <span className="font-bold text-purple-600 capitalize">{childName}</span>! 🚀
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard emoji="⭐" value={progress.total_score} label="Puntos Totales" />
            <StatCard emoji="🎯" value={`Nivel ${progress.level}`} label="Tu Nivel Actual" />
            <StatCard emoji="🎮" value={progress.games_completed} label="Juegos Ganados" />
            <StatCard emoji="💬" value={progress.questions_answered} label="Preguntas Chat" />
          </div>

          {/* Barra de Progreso */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Progreso al Nivel {progress.level + 1}</h2>
            <div className="w-full h-8 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-1000 flex items-center justify-end pr-4"
                style={{ width: `${progressToNextLevel}%` }}
              >
                <span className="text-white font-bold text-sm">{progressToNextLevel}%</span>
              </div>
            </div>
            <p className="text-center text-gray-600 mt-3 font-medium">
              ¡Te faltan {100 - progressToNextLevel} puntos para subir!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Actividades */}
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="mr-3 text-3xl">📊</span> Actividad Reciente
              </h2>
              <div className="space-y-3">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center">
                        <span className="text-3xl mr-4">{getActivityIcon(activity.activity_type)}</span>
                        <div>
                          <p className="font-bold text-gray-800">{activity.activity_name}</p>
                          <p className="text-xs text-gray-500">{formatDate(activity.created_at)}</p>
                        </div>
                      </div>
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">
                        +{activity.points_earned}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-10">¡Juega tu primera partida para ver datos!</p>
                )}
              </div>
            </div>

            {/* Logros */}
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="mr-3 text-3xl">🏆</span> Logros ({unlockedCount}/{achievements.length})
              </h2>
              <div className="grid grid-cols-1 gap-3 overflow-y-auto max-h-96 pr-2">
                {achievements.map((a) => (
                  <div key={a.id} className={`flex items-center p-4 rounded-xl border-2 transition-all ${a.unlocked ? 'border-purple-500 bg-purple-50' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
                    <span className={`text-4xl mr-4 ${!a.unlocked && 'grayscale'}`}>{a.icon}</span>
                    <div>
                      <h3 className="font-bold text-gray-800">{a.name}</h3>
                      <p className="text-sm text-gray-600">{a.description}</p>
                    </div>
                    {a.unlocked && <span className="ml-auto text-green-500 text-2xl">✅</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <TutorAssistant />
    </div>
  );
}

function StatCard({ emoji, value, label }: { emoji: string; value: any; label: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:scale-105 transition-transform border-b-4 border-blue-500">
      <div className="text-5xl mb-3">{emoji}</div>
      <div className="text-3xl font-black text-gray-800 mb-1">{value}</div>
      <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">{label}</p>
    </div>
  );
}

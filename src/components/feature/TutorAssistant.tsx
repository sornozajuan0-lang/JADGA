import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface Message {
  text: string;
  type: 'greeting' | 'suggestion' | 'encouragement' | 'hint';
}

export default function TutorAssistant() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<Message | null>(null);
  const [childName, setChildName] = useState('');
  const [showBubble, setShowBubble] = useState(true);

  useEffect(() => {
    const name = localStorage.getItem('childName');
    if (name) setChildName(name);
  }, []);

  useEffect(() => {
    // Detectar la página actual y mostrar mensaje apropiado
    const messages = getMessagesForPage(location.pathname);
    if (messages.length > 0) {
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      setCurrentMessage(randomMessage);
      setShowBubble(true);
      
      // Auto-ocultar el mensaje después de 8 segundos
      const timer = setTimeout(() => {
        setShowBubble(false);
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  const getMessagesForPage = (path: string): Message[] => {
    const name = childName || 'amigo';
    
    switch (path) {
      case '/':
        return [
          { text: `¡Hola ${name}! 👋 Soy tu tutor virtual. ¿Listo para aprender?`, type: 'greeting' },
          { text: '¿Qué te gustaría hacer hoy? Puedo ayudarte a elegir 😊', type: 'suggestion' },
        ];
      case '/chat-educativo':
        return [
          { text: '¡Excelente elección! 📚 Elige una materia y demuestra lo que sabes', type: 'suggestion' },
          { text: 'Recuerda: ¡No hay prisa! Tómate tu tiempo para pensar 🤔', type: 'hint' },
          { text: '¡Cada pregunta es una oportunidad para aprender algo nuevo! ✨', type: 'encouragement' },
        ];
      case '/juegos':
        return [
          { text: '¡Hora de jugar! 🎮 Todos estos juegos entrenan tu cerebro', type: 'greeting' },
          { text: 'Consejo: Empieza con el juego que más te llame la atención 🌟', type: 'suggestion' },
          { text: '¡Los juegos de memoria son geniales para empezar! 🧠', type: 'hint' },
        ];
      case '/guia-padres':
        return [
          { text: 'Esta sección es especial para papás y mamás 👨‍👩‍👧', type: 'greeting' },
          { text: 'Aquí encontrarás recursos útiles para el aprendizaje 📖', type: 'suggestion' },
        ];
      case '/progreso':
        return [
          { text: `¡Mira todo lo que has logrado, ${name}! 🏆`, type: 'encouragement' },
          { text: '¡Cada punto cuenta! Sigue así y llegarás muy lejos ⭐', type: 'encouragement' },
          { text: '¿Quieres mejorar tu puntuación? ¡Sigue practicando! 💪', type: 'suggestion' },
        ];
      default:
        return [
          { text: '¡Estoy aquí si necesitas ayuda! 😊', type: 'greeting' },
        ];
    }
  };

  const getEncouragementMessage = () => {
    const messages = [
      '¡Muy bien! Sigue así 🌟',
      '¡Excelente trabajo! 👏',
      '¡Eres increíble! 💫',
      '¡Lo estás haciendo genial! 🎉',
      '¡Sigue adelante, campeón! 🏆',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const getHintMessage = () => {
    const messages = [
      'Pista: Lee con calma y piensa bien 🤔',
      'Recuerda: No hay respuestas malas, solo aprendizaje 💡',
      'Consejo: Si no estás seguro, confía en tu instinto ✨',
      'Tip: Tómate tu tiempo, no hay prisa ⏰',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const handleEncouragement = () => {
    setCurrentMessage({ text: getEncouragementMessage(), type: 'encouragement' });
    setShowBubble(true);
    setTimeout(() => setShowBubble(false), 5000);
  };

  const handleHint = () => {
    setCurrentMessage({ text: getHintMessage(), type: 'hint' });
    setShowBubble(true);
    setTimeout(() => setShowBubble(false), 5000);
  };

  const handleNavigateAction = () => {
    if (location.pathname === '/juegos') {
      navigate('/chat-educativo');
    } else {
      navigate('/juegos');
    }
    setIsOpen(false);
  };

  const getNavigateButtonText = () => {
    if (location.pathname === '/juegos') {
      return {
        text: 'Ir al Chat Educativo',
        emoji: '📚'
      };
    }
    return {
      text: 'Explorar juegos',
      emoji: '🎮'
    };
  };

  const buttonConfig = getNavigateButtonText();

  return (
    <>
      {/* Burbuja de mensaje mejorada */}
      {showBubble && currentMessage && !isOpen && (
        <div className="fixed bottom-28 right-6 z-40 animate-float">
          <div className="bg-white rounded-3xl shadow-2xl p-5 max-w-sm relative border-2 border-purple-100">
            <button
              onClick={() => setShowBubble(false)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full flex items-center justify-center text-white text-sm cursor-pointer transition-all duration-300 shadow-lg hover:scale-110"
            >
              ✕
            </button>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 flex-shrink-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full p-0.5 shadow-lg">
                <img 
                  src="https://static.readdy.ai/image/1d713b29dbbebb8fe6e5a06a859a6428/24d79e87e02e87423469069657404644.png" 
                  alt="Mascota" 
                  className="w-full h-full object-cover rounded-full"
                  style={{ imageRendering: 'crisp-edges' }}
                />
              </div>
              <div className="flex-1">
                <p className="text-base text-gray-800 font-semibold leading-relaxed">
                  {currentMessage.text}
                </p>
              </div>
            </div>
            <div className="absolute -bottom-3 right-10 w-6 h-6 bg-white transform rotate-45 border-r-2 border-b-2 border-purple-100"></div>
          </div>
        </div>
      )}

      {/* Panel expandido del tutor mejorado */}
      {isOpen && (
        <div className="fixed bottom-28 right-6 z-40 w-96 bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-in border-2 border-purple-100">
          <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 flex-shrink-0 bg-white/20 backdrop-blur-sm rounded-full p-0.5 shadow-lg">
                  <img 
                    src="https://static.readdy.ai/image/1d713b29dbbebb8fe6e5a06a859a6428/24d79e87e02e87423469069657404644.png" 
                    alt="Mascota" 
                    className="w-full h-full object-cover rounded-full"
                    style={{ imageRendering: 'crisp-edges' }}
                  />
                </div>
                <div>
                  <h3 className="text-white font-black text-2xl">Tu Tutor</h3>
                  <p className="text-white/90 text-sm font-medium">Siempre aquí para ayudarte ✨</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300 cursor-pointer hover:scale-110"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>
          </div>

          <div className="p-6 max-h-96 overflow-y-auto">
            {currentMessage && (
              <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-2xl p-5 mb-6 border-2 border-purple-100 shadow-sm">
                <p className="text-gray-800 font-semibold leading-relaxed text-base">
                  {currentMessage.text}
                </p>
              </div>
            )}

            <div className="space-y-3 mb-6">
              <button
                onClick={handleNavigateAction}
                className="w-full bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold py-4 px-5 rounded-2xl hover:from-green-500 hover:to-emerald-600 transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer shadow-lg hover:shadow-xl hover:scale-105 whitespace-nowrap"
              >
                <span className="text-lg">{buttonConfig.text}</span>
                <span className="text-2xl">{buttonConfig.emoji}</span>
              </button>

              <button
                onClick={handleHint}
                className="w-full bg-gradient-to-r from-blue-400 to-cyan-500 text-white font-bold py-4 px-5 rounded-2xl hover:from-blue-500 hover:to-cyan-600 transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer shadow-lg hover:shadow-xl hover:scale-105 whitespace-nowrap"
              >
                <span className="text-lg">Dame una pista</span>
                <span className="text-2xl">💡</span>
              </button>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border-2 border-amber-100">
              <h4 className="font-black text-gray-800 mb-4 text-base flex items-center gap-2">
                <span className="text-xl">✨</span>
                Consejos rápidos:
              </h4>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-3 bg-white rounded-xl p-3 shadow-sm">
                  <span className="text-purple-500 text-lg flex-shrink-0">✓</span>
                  <span className="font-medium">Tómate tu tiempo para pensar</span>
                </li>
                <li className="flex items-start gap-3 bg-white rounded-xl p-3 shadow-sm">
                  <span className="text-purple-500 text-lg flex-shrink-0">✓</span>
                  <span className="font-medium">No tengas miedo de equivocarte</span>
                </li>
                <li className="flex items-start gap-3 bg-white rounded-xl p-3 shadow-sm">
                  <span className="text-purple-500 text-lg flex-shrink-0">✓</span>
                  <span className="font-medium">Cada error es una oportunidad</span>
                </li>
                <li className="flex items-start gap-3 bg-white rounded-xl p-3 shadow-sm">
                  <span className="text-purple-500 text-lg flex-shrink-0">✓</span>
                  <span className="font-medium">¡Diviértete mientras aprendes!</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Botón flotante del tutor mejorado */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center cursor-pointer group border-4 border-white p-0.5"
      >
        <img 
          src="https://static.readdy.ai/image/1d713b29dbbebb8fe6e5a06a859a6428/24d79e87e02e87423469069657404644.png" 
          alt="Mascota" 
          className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
          style={{ imageRendering: 'crisp-edges' }}
        />
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-3 border-white animate-pulse shadow-lg"></div>
        )}
      </button>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes scale-in {
          0% {
            transform: scale(0.9);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

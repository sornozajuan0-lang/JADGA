import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import Navigation from '../../components/feature/Navigation';
import { subjects } from '../../mocks/subjects';


const supabase = createClient(
  import.meta.env.VITE_PUBLIC_SUPABASE_URL,
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY
);

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatEducativo() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const [childName, setChildName] = useState('');
  const [chatMode, setChatMode] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const name = localStorage.getItem('childName');
    if (name) setChildName(name);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const currentSubject = subjects.find(s => s.id === selectedSubject);
  const questions = currentSubject?.questions || [];

  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubject(subjectId);
    setSelectedQuestion(null);
    setChatMode(false);
  };

  const handleQuestionSelect = (questionIndex: number) => {
    setSelectedQuestion(questionIndex);
  };

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
    setSelectedQuestion(null);
    setChatMode(false);
    setMessages([]);
    setConversationId(null);
  };

  const handleBackToQuestions = () => {
    setSelectedQuestion(null);
    setChatMode(false);
  };

  const handleStartChat = () => {
    setChatMode(true);
    setSelectedQuestion(null);
    setMessages([{
      role: 'assistant',
      content: `¡Hola ${childName}! 👋 Soy tu tutor de ${currentSubject?.name}. Puedes preguntarme lo que quieras sobre esta materia. ¿En qué puedo ayudarte hoy?`,
      timestamp: new Date()
    }]);
  };

const handleSendMessage = async () => {
  if (!inputMessage.trim() || loading) return;

  const userText = inputMessage.trim();

  const userMessage: Message = {
    role: 'user',
    content: userText,
    timestamp: new Date(),
  };

  setMessages(prev => [...prev, userMessage]);
  setInputMessage('');
  setLoading(true);

  try {
    const { data, error } = await supabase.functions.invoke('llama', {
      body: {
        message: userText,
        subject: currentSubject?.name ?? '',
        childName,
      },
    });

    if (error) {
      console.error('Supabase Functions error:', error);
      throw error;
    }

    const aiMessage: Message = {
      role: 'assistant',
      content: data?.reply ?? 'No hubo respuesta',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, aiMessage]);
  } catch (err: any) {
    console.error('❌ Error completo:', err);

    const errorMessage: Message = {
      role: 'assistant',
      content: `❌ No pude responder ahora. (${err?.message ?? 'Error'})`,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, errorMessage]);
  } finally {
    setLoading(false);
  }
};


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Vista de selección de materias
  if (!selectedSubject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <Navigation />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-block bg-white rounded-full px-6 py-2 shadow-md mb-4">
                <span className="text-sm font-bold text-orange-600">🤖 Chat con IA</span>
              </div>
              <h1 className="text-5xl font-black text-gray-800 mb-3">
                Chat Educativo
              </h1>
              {childName && (
                <p className="text-xl text-gray-600">
                  {childName}, ¿qué quieres aprender hoy?
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {subjects.map((subject, index) => {
                const colors = [
                  { bg: 'bg-gradient-to-br from-cyan-400 to-blue-500', border: 'border-cyan-300', text: 'text-cyan-700' },
                  { bg: 'bg-gradient-to-br from-emerald-400 to-teal-500', border: 'border-emerald-300', text: 'text-emerald-700' },
                  { bg: 'bg-gradient-to-br from-amber-400 to-orange-500', border: 'border-amber-300', text: 'text-amber-700' },
                  { bg: 'bg-gradient-to-br from-rose-400 to-pink-500', border: 'border-rose-300', text: 'text-rose-700' }
                ];
                const color = colors[index % colors.length];
                
                return (
                  <button
                    key={subject.id}
                    onClick={() => handleSubjectSelect(subject.id)}
                    className="group bg-white rounded-3xl shadow-md hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden cursor-pointer"
                  >
                    <div className={`${color.bg} p-6 flex items-center justify-between`}>
                      <div className="text-6xl transform group-hover:scale-110 transition-transform duration-300">
                        {subject.icon}
                      </div>
                      <div className="bg-white/30 backdrop-blur-sm rounded-full px-4 py-2">
                        <span className="text-white font-bold text-sm">
                          Chat IA
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-2xl font-black text-gray-800 mb-2">
                        {subject.name}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed mb-4">
                        {subject.description}
                      </p>
                      <div className={`inline-flex items-center gap-2 ${color.text} font-bold text-sm`}>
                        <span>Empezar ahora</span>
                        <i className="ri-arrow-right-line group-hover:translate-x-1 transition-transform"></i>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
</div>
    );
  }

  // Vista de chat con IA
  if (chatMode) {
    const subjectColors: Record<string, { gradient: string; accent: string; light: string; dark: string }> = {
      matematica: { gradient: 'from-cyan-400 to-blue-500', accent: 'bg-cyan-500', light: 'bg-cyan-50', dark: 'bg-cyan-600' },
      lenguaje: { gradient: 'from-rose-400 to-pink-500', accent: 'bg-rose-500', light: 'bg-rose-50', dark: 'bg-rose-600' },
      ciencias: { gradient: 'from-emerald-400 to-teal-500', accent: 'bg-emerald-500', light: 'bg-emerald-50', dark: 'bg-emerald-600' },
      sociales: { gradient: 'from-amber-400 to-orange-500', accent: 'bg-amber-500', light: 'bg-amber-50', dark: 'bg-amber-600' }
    };
    
    const colors = subjectColors[selectedSubject] || subjectColors.matematica;

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <Navigation />
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col">
            <button
              onClick={handleBackToQuestions}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-semibold mb-4 transition-colors cursor-pointer group"
            >
              <i className="ri-arrow-left-line text-xl group-hover:-translate-x-1 transition-transform"></i>
              <span>Volver</span>
            </button>

            {/* Header del chat */}
            <div className={`bg-gradient-to-r ${colors.gradient} rounded-t-3xl p-6 shadow-lg`}>
              <div className="flex items-center gap-4 text-white">
                <div className="text-5xl">{currentSubject?.icon}</div>
                <div className="flex-1">
                  <h1 className="text-3xl font-black mb-1">
                    Chat de {currentSubject?.name}
                  </h1>
                  <p className="text-white/90 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Tutor IA en línea
                  </p>
                </div>
              </div>
            </div>

            {/* Área de mensajes */}
            <div className="flex-1 bg-white p-6 overflow-y-auto space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
                >
                  <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                    <div className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        msg.role === 'user' 
                          ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                          : `bg-gradient-to-r ${colors.gradient}`
                      }`}>
                        {msg.role === 'user' ? (
                          <span className="text-white font-bold text-lg">
                            {childName.charAt(0).toUpperCase()}
                          </span>
                        ) : (
                          <span className="text-2xl">{currentSubject?.icon}</span>
                        )}
                      </div>
                      <div className={`rounded-2xl p-4 ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                          : `${colors.light} border-2 border-gray-100`
                      }`}>
                        <p className={`text-sm leading-relaxed whitespace-pre-wrap ${
                          msg.role === 'user' ? 'text-white' : 'text-gray-800'
                        }`}>
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start animate-slide-up">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r ${colors.gradient}`}>
                      <span className="text-2xl">{currentSubject?.icon}</span>
                    </div>
                    <div className={`${colors.light} border-2 border-gray-100 rounded-2xl p-4`}>
                      <div className="flex gap-2">
                        <div className={`w-2 h-2 ${colors.accent} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
                        <div className={`w-2 h-2 ${colors.accent} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
                        <div className={`w-2 h-2 ${colors.accent} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input de mensaje */}
            <div className="bg-white rounded-b-3xl p-4 shadow-lg border-t-2 border-gray-100">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Escribe tu pregunta aquí..."
                  disabled={loading}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
                <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || loading}
                className={`${colors.accent} hover:${colors.dark} text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap cursor-pointer`}
>
                <span>Enviar</span>
                <i className="ri-send-plane-fill text-lg"></i>
                </button>

              </div>
            </div>
          </div>
        </div>
</div>
    );
  }

  // Vista de lista de preguntas
  if (selectedSubject && selectedQuestion === null) {
    const subjectColors: Record<string, { gradient: string; accent: string; light: string }> = {
      matematica: { gradient: 'from-cyan-400 to-blue-500', accent: 'bg-cyan-500', light: 'bg-cyan-50' },
      lenguaje: { gradient: 'from-rose-400 to-pink-500', accent: 'bg-rose-500', light: 'bg-rose-50' },
      ciencias: { gradient: 'from-emerald-400 to-teal-500', accent: 'bg-emerald-500', light: 'bg-emerald-50' },
      sociales: { gradient: 'from-amber-400 to-orange-500', accent: 'bg-amber-500', light: 'bg-amber-50' }
    };
    
    const colors = subjectColors[selectedSubject] || subjectColors.matematica;

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <Navigation />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={handleBackToSubjects}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-semibold mb-8 transition-colors cursor-pointer group"
            >
              <i className="ri-arrow-left-line text-xl group-hover:-translate-x-1 transition-transform"></i>
              <span>Volver a materias</span>
            </button>

            <div className={`bg-gradient-to-r ${colors.gradient} rounded-3xl p-8 mb-8 shadow-lg`}>
              <div className="flex items-center gap-4 text-white">
                <div className="text-7xl">{currentSubject?.icon}</div>
                <div className="flex-1">
                  <h1 className="text-4xl font-black mb-2">
                    {currentSubject?.name}
                  </h1>
                  <p className="text-white/90 text-lg">
                    {currentSubject?.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Botón para iniciar chat con IA */}
            <button
              onClick={handleStartChat}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-102 transition-all duration-200 p-6 mb-6 cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                    <i className="ri-robot-2-fill text-4xl"></i>
                  </div>
                  <div className="text-left">
                    <h3 className="text-2xl font-black mb-1">Chat con IA</h3>
                    <p className="text-white/90 text-sm">Pregunta lo que quieras a tu tutor virtual</p>
                  </div>
                </div>
                <i className="ri-arrow-right-circle-fill text-5xl opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all"></i>
              </div>
            </button>

            <div className="bg-white rounded-2xl p-6 mb-6 shadow-md">
              <p className="text-gray-700 font-semibold text-lg">
                O selecciona una pregunta frecuente:
              </p>
            </div>

            <div className="space-y-4">
              {questions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuestionSelect(index)}
                  className="w-full bg-white rounded-2xl shadow-md hover:shadow-xl transform hover:scale-102 transition-all duration-200 overflow-hidden cursor-pointer group"
                >
                  <div className="flex items-center gap-4 p-6">
                    <div className={`${colors.accent} text-white font-black text-xl w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-lg font-bold text-gray-800 group-hover:text-gray-900">
                        {question.question}
                      </p>
                    </div>
                    <i className="ri-arrow-right-circle-fill text-4xl text-gray-300 group-hover:text-gray-600 transition-colors"></i>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
</div>
    );
  }

  // Vista de pregunta y respuesta
  const currentQuestion = questions[selectedQuestion!];
  const subjectColors: Record<string, { gradient: string; accent: string; light: string }> = {
    matematica: { gradient: 'from-cyan-400 to-blue-500', accent: 'bg-cyan-500', light: 'bg-cyan-50' },
    lenguaje: { gradient: 'from-rose-400 to-pink-500', accent: 'bg-rose-500', light: 'bg-rose-50' },
    ciencias: { gradient: 'from-emerald-400 to-teal-500', accent: 'bg-emerald-500', light: 'bg-emerald-50' },
    sociales: { gradient: 'from-amber-400 to-orange-500', accent: 'bg-amber-500', light: 'bg-amber-50' }
  };
  
  const colors = subjectColors[selectedSubject] || subjectColors.matematica;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <Navigation />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={handleBackToQuestions}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-semibold mb-8 transition-colors cursor-pointer group"
          >
            <i className="ri-arrow-left-line text-xl group-hover:-translate-x-1 transition-transform"></i>
            <span>Volver a preguntas</span>
          </button>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className={`bg-gradient-to-r ${colors.gradient} p-6`}>
              <div className="flex items-center gap-3 text-white">
                <div className="text-5xl">{currentSubject?.icon}</div>
                <div>
                  <span className="text-sm font-semibold opacity-90">{currentSubject?.name}</span>
                  <h2 className="text-2xl font-black">Pregunta {selectedQuestion! + 1}</h2>
                </div>
              </div>
            </div>

            <div className="p-8">
              {/* Pregunta */}
              <div className={`${colors.light} border-l-4 ${colors.accent} rounded-r-2xl p-6 mb-8`}>
                <div className="flex items-start gap-4">
                  <div className={`${colors.accent} text-white rounded-full w-10 h-10 flex items-center justify-center font-black text-lg flex-shrink-0`}>
                    ?
                  </div>
                  <div className="flex-1">
                    <p className="text-xl font-bold text-gray-800 leading-relaxed">
                      {currentQuestion.question}
                    </p>
                  </div>
                </div>
              </div>

              {/* Respuesta */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 animate-slide-up">
                <div className="flex items-start gap-4">
                  <div className="bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-black text-lg flex-shrink-0">
                    ✓
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-black text-gray-800 mb-3">Respuesta:</h3>
                    <p className="text-gray-700 leading-relaxed text-base">
                      {currentQuestion.answer}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navegación entre preguntas */}
              <div className="flex justify-between items-center pt-8 mt-8 border-t-2 border-gray-100">
                {selectedQuestion! > 0 ? (
                  <button
                    onClick={() => setSelectedQuestion(selectedQuestion! - 1)}
                    className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-bold transition-colors cursor-pointer group"
                  >
                    <i className="ri-arrow-left-s-line text-xl group-hover:-translate-x-1 transition-transform"></i>
                    Anterior
                  </button>
                ) : (
                  <div></div>
                )}

                {selectedQuestion! < questions.length - 1 && (
                  <button
                    onClick={() => setSelectedQuestion(selectedQuestion! + 1)}
                    className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-bold transition-colors cursor-pointer ml-auto group"
                  >
                    Siguiente
                    <i className="ri-arrow-right-s-line text-xl group-hover:translate-x-1 transition-transform"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
<style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
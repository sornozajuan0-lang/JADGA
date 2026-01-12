import { useState } from 'react';
import Navigation from '../../components/feature/Navigation';
import { parentGuides } from '../../mocks/parentGuides';
import TutorAssistant from '../../components/feature/TutorAssistant';

export default function GuiaPadres() {
  const [selectedCategory, setSelectedCategory] = useState<string>('salud');
  const [expandedTip, setExpandedTip] = useState<number | null>(null);

  const currentGuide = parentGuides.find(g => g.id === selectedCategory);

  const toggleTip = (index: number) => {
    setExpandedTip(expandedTip === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-400 via-blue-400 to-purple-400">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4 text-center">
              Guía para Padres
            </h1>
            <p className="text-xl text-gray-600 text-center">
              Estrategias y recursos para apoyar el desarrollo de tu hijo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {parentGuides.map((guide) => (
              <button
                key={guide.id}
                onClick={() => setSelectedCategory(guide.id)}
                className={`rounded-2xl shadow-lg p-6 transition-all duration-200 text-center cursor-pointer ${
                  selectedCategory === guide.id
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white transform scale-105'
                    : 'bg-white text-gray-800 hover:shadow-xl hover:scale-105'
                }`}
              >
                <div className="text-5xl mb-3">{guide.icon}</div>
                <h3 className="text-xl font-bold mb-2">{guide.name}</h3>
                <p className={`text-sm ${selectedCategory === guide.id ? 'text-white/90' : 'text-gray-600'}`}>
                  {guide.description}
                </p>
              </button>
            ))}
          </div>

          {currentGuide && (
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <div className="flex items-center mb-6">
                <div className="text-5xl mr-4">{currentGuide.icon}</div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">{currentGuide.name}</h2>
                  <p className="text-gray-600">{currentGuide.description}</p>
                </div>
              </div>

              <div className="space-y-4">
                {currentGuide.tips.map((tip, index) => (
                  <div
                    key={index}
                    className="border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-purple-300 transition-colors"
                  >
                    <button
                      onClick={() => toggleTip(index)}
                      className="w-full p-6 flex items-center justify-between text-left cursor-pointer hover:bg-purple-50 transition-colors"
                    >
                      <div className="flex items-center flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mr-4 flex-shrink-0">
                          {index + 1}
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">{tip.title}</h3>
                      </div>
                      <i className={`ri-arrow-${expandedTip === index ? 'up' : 'down'}-s-line text-2xl text-purple-600 transition-transform`}></i>
                    </button>
                    
                    {expandedTip === index && (
                      <div className="px-6 pb-6">
                        <div className="pl-16">
                          <p className="text-gray-700 mb-4">{tip.content}</p>
                          {tip.examples && tip.examples.length > 0 && (
                            <div className="bg-purple-50 rounded-xl p-4">
                              <h4 className="font-semibold text-purple-800 mb-2">Ejemplos prácticos:</h4>
                              <ul className="space-y-2">
                                {tip.examples.map((example, exIndex) => (
                                  <li key={exIndex} className="flex items-start">
                                    <span className="text-purple-600 mr-2">•</span>
                                    <span className="text-gray-700">{example}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
                <div className="flex items-start">
                  <div className="text-4xl mr-4">💡</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Recuerda</h3>
                    <p className="text-gray-700">
                      Cada niño es único y puede responder de manera diferente a estas estrategias. 
                      La paciencia, la consistencia y el amor son fundamentales en este proceso. 
                      Si tienes dudas o preocupaciones, consulta con un profesional de la salud.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <TutorAssistant />
    </div>
  );
}
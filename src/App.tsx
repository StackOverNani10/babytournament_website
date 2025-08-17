import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { EventsProvider } from './context/events/EventsContext';
import { ReservationsProvider } from './context/reservations/ReservationsContext';
import { mockEvents } from './data/mockData';
// Layout components
import Layout from './components/layout/Layout';
import Footer from './components/layout/Footer';
import ScrollIndicator from './components/layout/ScrollIndicator';
import SectionIndicator from './components/layout/SectionIndicator';

// Feature components
import EventHeader from './features/event/components/EventHeader';
import CountdownTimer from './features/event/components/CountdownTimer';
import GiftCatalog from './features/gifts/components/GiftCatalog';
import ActivityVoting from './features/activity/components/ActivityVoting';
import GenderSwitcher from './features/activity/components/GenderSwitcher';
import Raffle from './features/raffle/components/Raffle';
import Wishes from './features/wishes/components/Wishes';
import PredictionModal from './features/predictions/components/PredictionModal';

// Auth components
import AdminPanel from './features/auth/components/AdminPanel';
import AdminLogin from './features/auth/components/AdminLogin';

// UI components
import Button from './components/ui/Button';

// Icons
import { Sparkles, Users } from 'lucide-react';

// Mover HomePage fuera del componente App para evitar re-renderizados innecesarios
const HomePageContent: React.FC = () => {
  const { currentEvent, selectedTheme, setSelectedTheme, predictions } = useApp();
  const [showPredictionModal, setShowPredictionModal] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  const handlePredictionClick = () => {
    if (selectedTheme === 'neutral') {
      alert('¡Primero elige si crees que será niño o niña! 😊');
      return;
    }
    setShowPredictionModal(true);
  };

  const handleAdminLogin = () => {
    setIsAdminAuthenticated(true);
    localStorage.setItem('adminAuthenticated', 'true');
  };

  // Función para desplazamiento suave
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Get enabled sections from the current event (excluding countdown from indicator)
  const enabledSections = Object.values(currentEvent.sections || {})
    .filter(section => section.enabled && section.id !== 'countdown')
    .sort((a, b) => a.order - b.order);

  // Map section IDs for the indicator
  const sectionIds = enabledSections.map(section => {
    switch(section.id) {
      case 'predictions': return 'predicciones';
      case 'wishes': return 'deseos';
      case 'activity-voting': return 'votacion-actividades';
      case 'raffle': return 'sorteo';
      case 'gift-catalog': return 'regalos';
      default: return section.id;
    }
  });
  
  // Always include 'inicio' at the beginning
  const sections = ['inicio', ...sectionIds];

  return (
    <>
      <SectionIndicator sections={sections} theme={selectedTheme} />
      <div className="space-y-16">
        {/* Inicio Section - Always visible */}
        <div id="inicio">
          <EventHeader event={currentEvent} theme={selectedTheme} />
          
          <div className="py-2"></div>
          
          {/* Countdown Timer - Only show if countdown section is enabled */}
          {currentEvent.sections?.countdown?.enabled && (
            <CountdownTimer 
              targetDate={new Date(`${currentEvent.date}T${currentEvent.time}`)}
              theme={selectedTheme}
            />
          )}
          <ScrollIndicator theme={selectedTheme} targetId="content" />
        </div>
        
        <div id="content" className="pt-20">
          {/* Render each enabled section */}
          {enabledSections.map((section) => {
            switch(section.id) {
              case 'predictions':
                return (
                  <div key="predicciones" id="predicciones" className="flex flex-col items-center gap-4 mb-16">
                    <GenderSwitcher 
                      selectedGender={selectedTheme} 
                      onGenderChange={setSelectedTheme} 
                    />
                    
                    {selectedTheme !== 'neutral' && (
                      <Button
                        onClick={handlePredictionClick}
                        icon={Sparkles}
                        className={`${
                          selectedTheme === 'girl' 
                            ? 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600' 
                            : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
                        } mt-8 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300`}
                      >
                        ¡Hacer mi Predicción y Sugerir Nombre!
                      </Button>
                    )}
                    
                    {/* Batalla de Predicciones */}
                    {selectedTheme !== 'neutral' && (
                      <div className="w-full max-w-md mx-auto mt-6">
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-gray-100 shadow-sm">
                          <h3 className="text-base font-semibold text-gray-700 mb-3 flex items-center justify-center gap-2">
                            <Users size={18} className="text-indigo-500" />
                            La Batalla de Predicciones
                          </h3>
                          <div className="flex items-center justify-center gap-6">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                {predictions.filter((p: { predictedGender: string }) => p.predictedGender === 'boy').length}
                              </div>
                              <div className="text-sm text-gray-600">👦 Niños</div>
                            </div>
                            <div className="text-2xl">⚔️</div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-pink-600">
                                {predictions.filter((p: { predictedGender: string }) => p.predictedGender === 'girl').length}
                              </div>
                              <div className="text-sm text-gray-600">👧 Niñas</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
                
              case 'gift-catalog':
                return (
                  <div key="regalos" id="regalos" className="py-8">
                    <GiftCatalog theme={selectedTheme} />
                  </div>
                );
                
              case 'wishes':
                return (
                  <div key="deseos" id="deseos" className="py-8">
                    <Wishes />
                  </div>
                );
                
              case 'raffle':
                return (
                  <div key="sorteo" id="sorteo" className="py-8">
                    <Raffle />
                  </div>
                );
                
              case 'activity-voting':
                return (
                  <div key="votacion-actividades" id="votacion-actividades" className="mb-16">
                    <ActivityVoting theme={selectedTheme !== 'neutral' ? selectedTheme : 'neutral'} />
                  </div>
                );
                
              default:
                return null;
            }
          })}
        </div>
      </div>
      
      {/* Footer - Always visible */}
      <div id="informacion">
        <Footer 
          theme={selectedTheme} 
          scrollToSection={scrollToSection} 
          activeSections={sectionIds}
        />
      </div>
      
      <PredictionModal
        isOpen={showPredictionModal}
        onClose={() => setShowPredictionModal(false)}
        selectedGender={selectedTheme as 'boy' | 'girl'}
      />
      
      {!isAdminAuthenticated && <AdminLogin onLogin={handleAdminLogin} />}
    </>
  );
};

// Componente de página de inicio envuelto en Layout
const HomePage = () => (
  <Layout>
    <HomePageContent />
  </Layout>
);

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

// Componente principal de la aplicación
function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <EventsProvider initialEvents={mockEvents}>
                  <ReservationsProvider>
                    <Layout forceTheme="neutral">
                      <AdminPanel onLogout={() => {
                        localStorage.removeItem('adminAuthenticated');
                        window.location.href = '/';
                      }} />
                    </Layout>
                  </ReservationsProvider>
                </EventsProvider>
              </AdminRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
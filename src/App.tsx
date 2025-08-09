import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/layout/Layout';
import EventHeader from './components/EventHeader';
import GiftCatalog from './components/GiftCatalog';
import GenderSwitcher from './components/GenderSwitcher';
import PredictionModal from './components/PredictionModal';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import Button from './components/ui/Button';
import Footer from './components/Footer';
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

  return (
    <>
      <div className="space-y-16">
        <div id="inicio">
          <EventHeader event={currentEvent} theme={selectedTheme} />
        </div>
        
        {/* Gender Switcher */}
        <div className="flex flex-col items-center gap-4">
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
            <div id="predicciones" className="w-full max-w-md mx-auto mt-6">
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
        
        <div id="regalos">
          <GiftCatalog theme={selectedTheme} />
        </div>
      </div>
      
      {/* Footer */}
      <Footer theme={selectedTheme} scrollToSection={scrollToSection} />
      
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
                <Layout forceTheme="neutral">
                  <AdminPanel onLogout={() => {
                    localStorage.removeItem('adminAuthenticated');
                    window.location.href = '/';
                  }} />
                </Layout>
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
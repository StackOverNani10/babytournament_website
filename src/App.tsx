import { Toaster, toast } from 'sonner';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { useDataService } from './hooks/useDataService';
import { EventsProvider } from './context/events/EventsContext';
import { ReservationsProvider } from './context/reservations/ReservationsContext';
import { PredictionsProvider } from './context/predictions/PredictionsContext';
import { AuthProvider } from './context/auth/AuthContext';
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
      toast.info('¡Primero elige si crees que será niño o niña! 😊');
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

  // Add loading state
  if (!currentEvent) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }

  // Get all enabled sections from the current event
  const enabledSections = Object.values(currentEvent.sections || {})
    .filter(section => section.enabled)
    .sort((a, b) => a.order - b.order);

  // Map section IDs for the indicator (excluding countdown from indicator but still showing it)
  const sectionIds = enabledSections.map(section => {
    if (section.id === 'countdown') return null; // Skip countdown in indicator
    
    switch(section.id) {
      case 'predictions': return 'predicciones';
      case 'wishes': return 'deseos';
      case 'activity-voting': return 'votacion-actividades';
      case 'raffle': return 'sorteo';
      case 'gift-catalog': return 'regalos';
      default: return section.id;
    }
  }).filter(Boolean) as string[]; // Remove nulls and ensure string[] type
  
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
                                {predictions.filter((p) => p.prediction === 'boy').length}
                              </div>
                              <div className="text-sm text-gray-600">👦 Niños</div>
                            </div>
                            <div className="text-2xl">⚔️</div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-pink-600">
                                {predictions.filter((p) => p.prediction === 'girl').length}
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

const ProtectedRoute: React.FC<{ children: React.ReactNode, requiredRole?: string }> = ({ children }) => {
  const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Componente principal de la aplicación
function App() {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    // This will redirect to the login page
    navigate('/login');
  };
  return (
    <AuthProvider>
      <AppProvider>
        <Toaster position="top-center" richColors closeButton />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute requiredRole="admin">
                <EventsProvider>
                  <ReservationsProvider>
                    <PredictionsProvider>
                      <AdminPanel onLogout={handleLogout} />
                    </PredictionsProvider>
                  </ReservationsProvider>
                </EventsProvider>
              </ProtectedRoute>
            } 
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppProvider>
    </AuthProvider>
  );
}

// Simple login page that redirects to the admin panel
function LoginPage() {
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin';
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <AdminLogin onLogin={() => window.location.href = from} />
      </div>
    </div>
  );
}

// Unauthorized access page
function UnauthorizedPage() {
  const navigate = useNavigate();
  
  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };
  
  const handleGoHome = () => {
    navigate('/');
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="max-w-md w-full space-y-6 text-center p-8 bg-white rounded-xl shadow-lg">
        <div className="mx-auto w-24 h-24 bg-red-50 rounded-full flex items-center justify-center">
          <svg 
            className="w-12 h-12 text-red-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900">Acceso no autorizado</h1>
        <p className="text-gray-600">
          No tienes permiso para acceder a esta página. Por favor, inicia sesión con una cuenta que tenga los permisos necesarios.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <button
            onClick={handleGoBack}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Volver atrás
          </button>
          <button
            onClick={handleGoHome}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ir al inicio
          </button>
        </div>
        
        <div className="pt-6 border-t border-gray-100 mt-6">
          <p className="text-sm text-gray-500">
            ¿Necesitas ayuda?{' '}
            <a 
              href="mailto:soporte@detallazo.com" 
              className="text-blue-600 hover:underline"
            >
              Contáctanos
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
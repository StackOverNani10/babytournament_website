// Configuración global para las pruebas de Jest
import '@testing-library/jest-dom';

// Mocks globales
// Ejemplo: mock de la API de fetch
global.fetch = jest.fn();

// Configuración de mocks para librerías
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useParams: () => ({}),
}));

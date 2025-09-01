import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EventsProvider } from '../../../context/events/EventsContext';
import { ReservationsProvider } from '../../../context/reservations/ReservationsContext';
import { ThemeProvider } from '../../../context/theme/ThemeContext';
import { AppProvider } from '../../../context/AppContext';
import ReservationModal from '../components/ReservationModal';
import type { Event } from '../../event/types/events';
import { Product } from '../../../types';

// Mock de los datos necesarios
const mockProduct: Product = {
  id: '1',
  name: 'Producto de prueba',
  price: 29.99,
  suggestedQuantity: 1,
  maxQuantity: 5,
  imageUrl: '/test-image.jpg',
  categoryId: 'cat1',
  storeId: 'store1',
  isActive: true,
  description: 'Descripción de prueba'
};

const mockStore = {
  id: 'store1',
  name: 'Tienda de prueba',
  website: 'https://tiendadeprueba.com',
  logoUrl: '/store-logo.jpg'
};

const mockEvent: Event = {
  id: 'event1',
  title: 'Evento de prueba',
  subtitle: 'Subtítulo de prueba',
  date: '2024-12-31',
  time: '18:00',
  location: 'Ubicación de prueba',
  type: 'baby-shower',
  isActive: true,
  createdAt: new Date().toISOString(),
  sections: {},
  //theme: 'neutral',
  description: 'Descripción del evento',
  //endDate: '2025-01-01',
  //isPrivate: false
};

// Mock de las funciones del contexto
jest.mock('../../../context/AppContext', () => ({
  ...jest.requireActual('../../../context/AppContext'),
  useApp: () => ({
    currentEvent: mockEvent,
    stores: [mockStore],
    addReservation: jest.fn().mockResolvedValue({}),
    selectedTheme: 'neutral'
  })
}));

describe('ReservationModal', () => {
  const onClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <ThemeProvider defaultTheme="neutral">
        <AppProvider>
          <EventsProvider initialEvents={[mockEvent]}>
            <ReservationsProvider>
              <ReservationModal
                product={mockProduct}
                onClose={onClose}
                maxQuantity={5}
              />
            </ReservationsProvider>
          </EventsProvider>
        </AppProvider>
      </ThemeProvider>
    );
  };

  it('renders the modal with product information', () => {
    renderComponent();

    expect(screen.getByText('Reservar Regalo')).toBeInTheDocument();
    expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
    expect(screen.getByText(`$${mockProduct.price.toFixed(2)}`)).toBeInTheDocument();
    expect(screen.getByText('Cantidad:')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Tu nombre')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Tu correo electrónico')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Mensaje opcional (ej: dedicatoria)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reservar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
  });

  it('allows changing the quantity', async () => {
    renderComponent();

    // Find and click the quantity button
    const quantityButton = screen.getByTestId('quantity-dropdown-button');
    fireEvent.click(quantityButton);

    // Select quantity 3
    const quantityOption = screen.getByText('3');
    fireEvent.click(quantityOption);

    // Verify the quantity was updated
    expect(quantityButton).toHaveTextContent('3');
  });

  it('validates required fields', async () => {
    renderComponent();

    const submitButton = screen.getByRole('button', { name: /reservar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Por favor ingresa tu nombre')).toBeInTheDocument();
      expect(screen.getByText('Por favor ingresa tu correo electrónico')).toBeInTheDocument();
    });
  });

  it('submits the form with valid data', async () => {
    const mockAddReservation = jest.fn().mockResolvedValue({});

    // Mock the useApp hook with our mock function
    jest.spyOn(require('../../../context/AppContext'), 'useApp').mockImplementation(() => ({
      currentEvent: mockEvent,
      stores: [mockStore],
      addReservation: mockAddReservation,
      selectedTheme: 'neutral'
    }));

    renderComponent();

    // Fill out the form
    fireEvent.change(screen.getByPlaceholderText('Tu nombre'), {
      target: { value: 'Nombre de prueba' }
    });

    fireEvent.change(screen.getByPlaceholderText('Tu correo electrónico'), {
      target: { value: 'test@example.com' }
    });

    fireEvent.change(screen.getByPlaceholderText('Mensaje opcional (ej: dedicatoria)'), {
      target: { value: '¡Gracias por el regalo!' }
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /reservar/i }));

    // Verify the reservation was created with correct data
    await waitFor(() => {
      expect(mockAddReservation).toHaveBeenCalledWith({
        productId: mockProduct.id,
        guestName: 'Nombre de prueba',
        guestEmail: 'test@example.com',
        quantity: 1,
        message: '¡Gracias por el regalo!',
        status: 'reserved',
        eventId: mockEvent.id
      });

      // Verify success message is shown
      expect(screen.getByText('¡Reserva Confirmada!')).toBeInTheDocument();
    });
  });

  it('closes when clicking the close button', () => {
    renderComponent();

    const closeButton = screen.getByRole('button', { name: /cancelar/i });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });
});

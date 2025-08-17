import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EventsProvider } from '../../../context/events/EventsContext';
import { ReservationsProvider } from '../../../context/reservations/ReservationsContext';
import { ThemeProvider } from '../../../context/theme/ThemeContext';
import ReservationModal from '../components/ReservationModal';
import type { Event } from '../../event/types/events';

// Mock de los datos necesarios
const mockProduct = {
  id: '1',
  name: 'Producto de prueba',
  price: 29.99,
  suggestedQuantity: 1,
  maxQuantity: 5,
  imageUrl: '/test-image.jpg',
  categoryId: 'cat1',
  storeId: 'store1',
  isActive: true
};

const mockStore = {
  id: 'store1',
  name: 'Tienda de prueba',
  website: 'https://tiendadeprueba.com'
};

const mockEvent: Event = {
  id: 'event1',
  title: 'Evento de prueba',
  date: '2024-12-31',
  location: 'Ubicación de prueba',
  type: 'baby-shower',
  isActive: true,
  createdAt: new Date().toISOString(),
  sections: {}
};

const mockAddReservation = jest.fn();

describe('ReservationModal', () => {
  const onClose = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <ThemeProvider defaultTheme="neutral">
        <EventsProvider initialEvents={[mockEvent]}>
          <ReservationsProvider>
            <ReservationModal 
              product={mockProduct} 
              onClose={onClose} 
              maxQuantity={5} 
            />
          </ReservationsProvider>
        </EventsProvider>
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
    expect(screen.getByRole('button', { name: /confirmar reserva/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
  });

  it('allows changing the quantity', () => {
    renderComponent();
    
    const quantityButton = screen.getByRole('button', { name: /cantidad/i });
    fireEvent.click(quantityButton);
    
    const quantityOptions = screen.getAllByRole('menuitem');
    expect(quantityOptions).toHaveLength(5); // 1-5
    
    fireEvent.click(quantityOptions[2]); // Selecciona cantidad 3
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    renderComponent();
    
    const submitButton = screen.getByRole('button', { name: /confirmar reserva/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Por favor ingresa tu nombre')).toBeInTheDocument();
      expect(screen.getByText('Por favor ingresa un correo válido')).toBeInTheDocument();
    });
    
    expect(mockAddReservation).not.toHaveBeenCalled();
  });

  it('submits the form with valid data', async () => {
    renderComponent();
    
    // Rellenar el formulario
    fireEvent.change(screen.getByPlaceholderText('Tu nombre'), {
      target: { value: 'Nombre de prueba' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Tu correo electrónico'), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Mensaje opcional (ej: dedicatoria)'), {
      target: { value: '¡Gracias por el regalo!' }
    });
    
    // Enviar el formulario
    fireEvent.click(screen.getByText('Reservar'));
    
    expect(mockAddReservation).toHaveBeenCalledWith({
      productId: mockProduct.id,
      guestName: 'Juan Pérez',
      guestEmail: 'juan@example.com',
      quantity: 1,
      message: '¡Gracias por el regalo!',
      status: 'reserved'
    });
    
    // Verificar que se llamó a onClose después del envío exitoso
    expect(onClose).toHaveBeenCalled();
  });

  it('closes when clicking the close button', () => {
    renderComponent();
    
    const closeButton = screen.getByRole('button', { name: /cancelar/i });
    fireEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalled();
  });
});

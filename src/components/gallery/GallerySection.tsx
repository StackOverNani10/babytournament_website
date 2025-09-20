import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { useGallery } from '@/context/gallery/GalleryContext';
import { toast } from 'sonner';

interface GallerySectionProps {
  theme: 'boy' | 'girl' | 'neutral';
}

export const GallerySection = ({ theme }: GallerySectionProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { photos, uploadPhoto } = useGallery();
  const navigate = useNavigate();
  
  // Efecto para el carrusel automático
  useEffect(() => {
    if (!isAutoPlaying || photos.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % photos.length);
    }, 4000); // Cambia de imagen cada 4 segundos
    
    return () => clearInterval(timer);
  }, [photos.length, isAutoPlaying]);
  
  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % photos.length);
  };
  
  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + photos.length) % photos.length);
  };
  
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };
  
  // Manejar gestos táctiles
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      // Deslizamiento a la derecha
      nextSlide();
    }
    
    if (touchStart - touchEnd < -50) {
      // Deslizamiento a la izquierda
      prevSlide();
    }
  };
  
  // Pausar el carrusel cuando el usuario interactúa con él
  const pauseCarousel = () => {
    setIsAutoPlaying(false);
  };

  const resumeCarousel = () => {
    setIsAutoPlaying(true);
  };

  // Efecto para manejar la apertura del diálogo de carga al navegar
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('upload') === 'true' && fileInputRef.current) {
      fileInputRef.current.click();
      // Limpiar el parámetro de la URL sin recargar la página
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [navigate]);

  const handleUploadClick = () => {
    // Navegar a la página de galería con un parámetro para abrir el diálogo de carga
    navigate('/gallery?upload=true');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const email = prompt('Por favor ingresa tu correo electrónico:');
      if (!email) {
        toast.error('Se requiere un correo electrónico para subir fotos');
        return;
      }
      
      const message = prompt('Añade un mensaje (opcional):') || '';
      const success = await uploadPhoto(file, { 
        email,
        message,
        description: '' // No usamos descripción en este flujo
      });
      
      if (success) {
        toast.success('Foto subida exitosamente');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Error al subir la foto');
    } finally {
      setIsUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const themeColors = {
    boy: 'from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600',
    girl: 'from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600',
    neutral: 'from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600'
  };

  const buttonClass = `inline-flex items-center ${
    themeColors[theme] || themeColors.neutral
  } text-white px-6 py-2 rounded-full text-base font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300`;

  return (
    <div key="galeria" id="galeria" className="py-12 bg-gradient-to-br from-gray-50 to-white rounded-3xl my-8 p-6 shadow-lg">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            📸 Galería de Fotos
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Revive los mejores momentos del evento. Desliza para ver más fotos o sube las tuyas.
          </p>
        </div>
        
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          disabled={isUploading}
        />
        
        {photos.length === 0 ? (
          /* Empty state */
          <div className="text-center py-12 px-4 bg-white/50 rounded-xl border-2 border-dashed border-gray-200">
            <div className="max-w-md mx-auto px-4 text-center">
              <svg 
                className="mx-auto h-20 w-20 text-gray-300" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="1.5" 
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                />
              </svg>
              <h3 className="mt-4 text-xl font-semibold text-gray-800">¡Aún no hay fotos!</h3>
              <p className="mt-2 text-gray-600">Sé el primero en compartir los mejores momentos del evento.</p>
              <p className="mt-1 text-sm text-gray-500">Tus fotos aparecerán aquí para que todos las disfruten.</p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={handleUploadClick}
                  disabled={isUploading}
                  className={buttonClass}
                >
                  {isUploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                      Subir fotos
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => navigate('/gallery')}
                  className="inline-flex items-center text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 px-6 py-2 rounded-full text-base font-medium shadow-sm hover:shadow transition-all duration-200"
                >
                  Ver galería completa
                  <svg className="ml-2 -mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Gallery with photos */
          <>
            <div 
              className="relative overflow-hidden rounded-xl shadow-lg"
              onMouseEnter={pauseCarousel}
              onMouseLeave={resumeCarousel}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Contenedor del carrusel */}
              <div 
                className="relative w-full overflow-hidden rounded-xl"
                style={{
                  height: 'calc(100vw * 0.8)', // Tamaño para móviles
                  maxHeight: '600px', // Altura máxima
                  maxWidth: '900px', // Ancho máximo para computadoras
                  margin: '0 auto' // Centrar en pantallas grandes
                }}
              >
                {photos.map((photo, index) => (
                  <div
                    key={photo.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                      index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <img
                        src={photo.url}
                        alt={photo.description || 'Foto del evento'}
                        className="h-full w-auto max-w-full object-contain"
                        style={{
                          maxHeight: '100%',
                          maxWidth: '100%',
                          objectFit: 'contain'
                        }}
                      />
                    </div>
                    {photo.description && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
                        <p className="text-sm sm:text-base">{photo.description}</p>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Controles de navegación */}
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        prevSlide();
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors focus:outline-none"
                      aria-label="Imagen anterior"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        nextSlide();
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors focus:outline-none"
                      aria-label="Siguiente imagen"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7m7-7H3"></path>
                      </svg>
                    </button>
                  </>
                )}
              </div>
              
              {/* Indicadores de posición */}
              {photos.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 flex-wrap px-4">
                  {photos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`h-2 w-2 rounded-full transition-all ${
                        index === currentSlide ? 'bg-white w-6' : 'bg-white/50 w-2'
                      }`}
                      aria-label={`Ir a la imagen ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
            
            <div className="mt-8 flex flex-col items-center gap-4">
              <p className="text-sm text-gray-500 text-center mb-1">
                {currentSlide + 1} de {photos.length} fotos
              </p>
              <Button
                variant="outline"
                onClick={() => navigate('/gallery')}
                className="inline-flex items-center text-gray-700 bg-white border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 px-6 py-3 rounded-full text-base font-medium shadow-sm hover:shadow-md transition-all duration-200"
              >
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Ver galería completa
              </Button>
              
              {/* Botón para pausar/reanudar el carrusel */}
              {photos.length > 1 && (
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <Button
                    variant="ghost"
                    onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                    className="inline-flex items-center text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-full text-sm font-medium transition-colors border border-gray-200"
                  >
                    {isAutoPlaying ? (
                      <>
                        <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Pausar presentación
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        </svg>
                        Reanudar presentación
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={handleUploadClick}
                    className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-sm"
                  >
                    <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Subir fotos
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

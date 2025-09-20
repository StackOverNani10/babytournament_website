import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGallery } from '@/context/gallery/GalleryContext';
import Button from '@/components/ui/Button';
import { Upload, X as XIcon, Download, Trash2, Mail, ArrowLeft, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import * as Dialog from '@radix-ui/react-dialog';

const PhotoGallery: React.FC = () => {
  const { 
    photos, 
    loading, 
    uploadPhoto, 
    deletePhoto, 
    currentPage, 
    totalPages, 
    itemsPerPage, 
    setCurrentPage 
  } = useGallery();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Efecto para manejar la apertura del diálogo cuando se recibe el parámetro upload
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('upload') === 'true' && fileInputRef.current) {
      fileInputRef.current.click();
      // Limpiar el parámetro de la URL sin recargar la página
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prevFiles => [...prevFiles, ...newFiles]);
      // Reset form fields when new files are selected
      setEmail('');
      setMessage('');
      // Open the dialog
      setIsDialogOpen(true);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Por favor selecciona al menos una foto');
      return;
    }
    
    if (!email) {
      toast.error('Por favor ingresa tu correo electrónico');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Por favor ingresa un correo electrónico válido');
      return;
    }
    
    try {
      setIsUploading(true);
      const uploadPromises = selectedFiles.map(file => 
        uploadPhoto(file, { 
          description, 
          email, 
          message 
        })
      );
      
      await Promise.all(uploadPromises);
      
      // Reset form and close dialog
      setSelectedFiles([]);
      setDescription('');
      setEmail('');
      setMessage('');
      setIsDialogOpen(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      toast.success(`¡${selectedFiles.length} ${selectedFiles.length === 1 ? 'foto subida' : 'fotos subidas'} exitosamente!`);
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast.error('Error al subir las fotos. Por favor intenta de nuevo.');
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleCancelUpload = () => {
    setSelectedFiles([]);
    setEmail('');
    setMessage('');
    setIsDialogOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!photoToDelete) return;
    
    try {
      setIsDeleting(true);
      await deletePhoto(photoToDelete);
      toast.success('Foto eliminada exitosamente');
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Error al eliminar la foto');
    } finally {
      setIsDeleting(false);
      setPhotoToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setPhotoToDelete(null);
  };

  // Función handleDownload eliminada por no estar en uso

  const openImageModal = (url: string) => {
    setSelectedImage(url);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  // Función para truncar texto largo
  const truncateText = (text: string, maxLength: number = 100): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  // Navegación de paginación
  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generar botones de paginación
  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Botón Primera página
    if (startPage > 1) {
      pages.push(
        <button
          key="first"
          onClick={() => goToPage(1)}
          className="px-3 py-1 rounded-md hover:bg-gray-100"
          aria-label="Primera página"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
      );
    }

    // Botón Anterior
    pages.push(
      <button
        key="prev"
        onClick={() => goToPage(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'}`}
        aria-label="Página anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
    );

    // Números de página
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`w-8 h-8 rounded-md ${currentPage === i 
            ? 'bg-blue-600 text-white' 
            : 'hover:bg-gray-100'}`}
          aria-current={currentPage === i ? 'page' : undefined}
        >
          {i}
        </button>
      );
    }

    // Botón Siguiente
    pages.push(
      <button
        key="next"
        onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'}`}
        aria-label="Página siguiente"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    );

    // Botón Última página
    if (endPage < totalPages) {
      pages.push(
        <button
          key="last"
          onClick={() => goToPage(totalPages)}
          className="px-3 py-1 rounded-md hover:bg-gray-100"
          aria-label="Última página"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 sm:mb-8 px-1">
        <button
          onClick={() => navigate('/')}
          className="group flex items-center gap-3 text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium w-full sm:w-auto"
          aria-label="Volver al inicio"
        >
          <span className="flex items-center justify-center w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-gray-100 group-hover:bg-blue-50 active:bg-blue-100 transition-all duration-200">
            <ArrowLeft className="h-5 w-5 sm:h-4 sm:w-4 group-hover:scale-110 group-active:scale-95 transition-transform duration-200" />
          </span>
          <span className="text-sm sm:text-base font-medium">Volver al inicio</span>
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Galería de Fotos del Evento</h2>
        
        {/* Upload Section */}
        <div 
          className="mb-8 p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors duration-200"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Sube tus fotos</h3>
            <p className="text-sm text-gray-500">
              Comparte los mejores momentos del evento. Formatos soportados: JPG, PNG (Máx. 5MB)
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
              id="photo-upload"
              multiple
            />
          </div>
        </div>

        {/* Upload Dialog */}
        <Dialog.Root open={isDialogOpen} onOpenChange={(open: boolean) => {
          if (!open) handleCancelUpload();
          setIsDialogOpen(open);
        }}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
            <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] flex flex-col z-50 overflow-hidden">
              {/* Encabezado fijo */}
              <div className="flex-shrink-0 p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <Dialog.Title className="text-xl font-semibold">Compartir foto</Dialog.Title>
                  <Dialog.Close asChild>
                    <button className="text-gray-500 hover:text-gray-700 p-1 -mr-2">
                      <XIcon className="h-5 w-5" />
                    </button>
                  </Dialog.Close>
                </div>
              </div>
              
              {/* Contenido con scroll */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Vista previa de las imágenes */}
                {selectedFiles.length > 0 && (
                  <div className="mb-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Vista previa ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(index);
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                            aria-label="Eliminar foto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 text-center">
// ...
                      {selectedFiles.length} {selectedFiles.length === 1 ? 'imagen seleccionada' : 'imágenes seleccionadas'}
                    </p>
                  </div>
                )}
                
                <Dialog.Description className="text-gray-600 mb-4">
                  Completa la información para compartir tu foto en la galería del evento.
                </Dialog.Description>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Correo Electrónico <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="tucorreo@ejemplo.com"
                        value={email}
                        onChange={handleEmailChange}
                        className="pl-10 w-full"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Mensaje (opcional)
                    </Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={handleMessageChange}
                      placeholder="Agrega un mensaje opcional..."
                      rows={3}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
              
              {/* Pie de página fijo */}
              <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCancelUpload}
                    disabled={isUploading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={isUploading || !email}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isUploading ? 'Subiendo...' : 'Compartir foto'}
                  </button>
                </div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

      {/* Delete Confirmation Dialog */}
      <Dialog.Root open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-md z-50">
            <div className="flex flex-col space-y-4">
              <Dialog.Title className="text-xl font-semibold">Eliminar foto</Dialog.Title>
              <Dialog.Description className="text-gray-600">
                ¿Estás seguro de que deseas eliminar esta foto? Esta acción no se puede deshacer.
              </Dialog.Description>
              
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={cancelDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 flex items-center"
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Eliminando...
                    </>
                  ) : 'Eliminar'}
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Gallery Content */}
        <div className="mt-8">
          {loading && photos.length === 0 ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : photos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Aún no hay fotos en la galería. ¡Sé el primero en compartir!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo) => (
              <div 
                key={photo.id} 
                className="group relative aspect-square overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                onClick={() => openImageModal(photo.url)}
              >
                <img
                  src={photo.url}
                  alt={photo.description || 'Foto del evento'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200"></div>
                {photo.description && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-3">
                    <div 
                      className="text-white text-xs md:text-sm line-clamp-2 break-words"
                      title={photo.description.length > 100 ? photo.description : ''}
                    >
                      {truncateText(photo.description, 100)}
                    </div>
                  </div>
                )}
              </div>
            ))}
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Mostrando {itemsPerPage * (currentPage - 1) + 1}-{Math.min(itemsPerPage * currentPage, itemsPerPage * (currentPage - 1) + photos.length)} de {itemsPerPage * totalPages} fotos
              </div>
              <div className="flex items-center space-x-1">
                {renderPagination()}
              </div>
            </div>
          )}
        </div>
        
        {/* Image Preview Modal */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={closeImageModal}>
            <div className="relative max-w-4xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
              <button 
                className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
                onClick={closeImageModal}
              >
                <XIcon className="w-8 h-8" />
              </button>
              <div className="bg-white rounded-lg overflow-hidden">
                <img 
                  src={selectedImage} 
                  alt="Preview" 
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoGallery;

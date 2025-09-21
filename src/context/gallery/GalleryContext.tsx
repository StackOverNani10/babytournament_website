import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import env from '@/config/env';

export interface Photo {
  id: string;
  event_id: string;
  url: string;
  created_at: string;
  uploaded_by: string;
  description?: string;
}

interface UploadPhotoParams {
  description?: string;
  email: string;
  message?: string;
}

interface GalleryContextType {
  photos: Photo[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  uploadPhoto: (file: File, params: UploadPhotoParams) => Promise<boolean>;
  deletePhoto: (photoId: string) => Promise<boolean>;
  refreshPhotos: (page?: number) => Promise<void>;
  setCurrentPage: (page: number) => void;
}

const GalleryContext = createContext<GalleryContextType | undefined>(undefined);

export const GalleryProvider = ({ children }: { children: ReactNode }) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [itemsPerPage] = useState<number>(12); // 12 fotos por página

  const refreshPhotos = async (page: number = currentPage) => {
    try {
      setLoading(true);
      
      // Obtener el total de fotos para calcular las páginas
      const { count, error: countError } = await supabase
        .from('event_photos')
        .select('*', { count: 'exact', head: true });
      
      if (countError) throw countError;
      
      const totalPages = Math.ceil((count || 0) / itemsPerPage);
      setTotalPages(totalPages);
      
      // Asegurarse de que la página actual sea válida
      const validPage = Math.min(Math.max(1, page), totalPages || 1);
      if (validPage !== page) {
        setCurrentPage(validPage);
      }
      
      // Obtener las fotos para la página actual
      const from = (validPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      
      const { data, error } = await supabase
        .from('event_photos')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      setPhotos(data || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast.error('Error al cargar las fotos');
    } finally {
      setLoading(false);
    }
  };

  const uploadPhoto = async (file: File, { description = '', email, message = '' }: UploadPhotoParams) => {
    try {
      setLoading(true);
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Por favor ingresa un correo electrónico válido');
      }
      
      // Sanitize email for folder name (replace @ and . with -)
      const sanitizedEmail = email.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
      
      // Generate a unique file name
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `${sanitizedEmail}/${fileName}`;

      // 1. Try to upload the file directly
      // The bucket should be created via migrations, so we don't need to check it here
      // If the bucket doesn't exist, the upload will fail with a clear error

      // 2. Upload the file to storage with error handling for bucket not found
      const { error: uploadError } = await supabase.storage
        .from('event-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error('Error al subir el archivo');
      }

      // 3. Get the first event ID or use a default one
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('id')
        .limit(1);

      if (eventsError) {
        console.error('Error fetching events:', eventsError);
        throw new Error('Error al obtener la información del evento');
      }

      const eventId = events?.[0]?.id || 'default-event-id';
      const publicUrl = `${env.VITE_SUPABASE_URL}/storage/v1/object/public/event-photos/${filePath}`;

      // 4. Buscar un ID de usuario válido para usar como valor por defecto
      const getDefaultUserId = async (): Promise<string> => {
        // Intentar obtener cualquier usuario existente
        const { data: defaultUser } = await supabase
          .from('users')
          .select('id')
          .limit(1)
          .single();
          
        if (defaultUser?.id) {
          return defaultUser.id;
        }
        
        // Si no hay usuarios, intentar obtener el ID del primer invitado
        const { data: defaultGuest } = await supabase
          .from('guests')
          .select('id')
          .limit(1)
          .single();
          
        if (defaultGuest?.id) {
          return defaultGuest.id;
        }
        
        // Si no hay usuarios ni invitados, lanzar un error
        throw new Error('No se encontró ningún usuario o invitado en la base de datos');
      };
      
      // Obtener el ID del usuario que sube la foto
      let uploadedById: string;
      try {
        // Primero buscar en la tabla de invitados
        const { data: guestData } = await supabase
          .from('guests')
          .select('id')
          .eq('email', email.toLowerCase().trim())
          .single();
          
        if (guestData?.id) {
          // Si encontramos el invitado, verificar que exista en la tabla users
          const { data: userData } = await supabase
            .from('users')
            .select('id')
            .eq('id', guestData.id)
            .single();
            
          if (userData?.id) {
            uploadedById = userData.id;
          } else {
            // Si no existe en users, usar el valor por defecto
            uploadedById = await getDefaultUserId();
          }
        } else {
          // Si no es un invitado, usar el valor por defecto
          uploadedById = await getDefaultUserId();
        }
      } catch (error) {
        console.error('Error al buscar el usuario:', error);
        uploadedById = await getDefaultUserId();
      }

      // 5. Insert photo metadata into database
      const { error: dbError } = await supabase
        .from('event_photos')
        .insert({
          event_id: eventId,
          url: publicUrl,
          storage_path: filePath,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type || `image/${fileExt}`,
          uploaded_by: uploadedById, // Usar el ID del usuario o un valor por defecto
          description: message || description || null,
          email: email.toLowerCase().trim(),
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        // Try to clean up the uploaded file if database insert fails
        try {
          await supabase.storage
            .from('event-photos')
            .remove([filePath]);
        } catch (cleanupError) {
          console.error('Error cleaning up file after database error:', cleanupError);
        }
            
        throw new Error('Error al guardar la información de la foto en la base de datos');
      }
      
      await refreshPhotos();
      return true;
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Error al subir la foto: ' + (error as Error).message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deletePhoto = async (photoId: string) => {
    try {
      setLoading(true);
      
      // Obtener la foto de la lista actual para obtener su URL y storage_path
      const photo = photos.find(p => p.id === photoId);
      if (!photo) {
        throw new Error('No se encontró la foto a eliminar');
      }
      
      // Extraer el path del archivo de la URL completa
      let filePath = '';
      try {
        const url = new URL(photo.url);
        // El path del archivo está después del bucket en la URL
        const parts = url.pathname.split('/');
        const bucketIndex = parts.findIndex(part => part === 'storage' || part === 'object');
        if (bucketIndex !== -1) {
          filePath = parts.slice(bucketIndex + 2).join('/');
        } else if ('storage_path' in photo && photo.storage_path) {
          filePath = photo.storage_path as string;
        } else {
          // Si no podemos determinar el path del archivo, lanzar un error
          throw new Error('No se pudo determinar la ruta del archivo para eliminar');
        }
      } catch (e) {
        // Si falla el parseo de la URL, usar storage_path si existe
        if ('storage_path' in photo && photo.storage_path) {
          filePath = photo.storage_path as string;
        } else {
          console.warn('No se pudo determinar la ruta del archivo:', e);
        }
      }

      if (!filePath) {
        console.warn('No se pudo determinar la ruta del archivo, solo se eliminará el registro de la base de datos');
      } else {
        // Eliminar el archivo del storage
        const { error: storageError } = await supabase.storage
          .from('event-photos')
          .remove([filePath]);

        if (storageError) {
        }
      }

      // Eliminar el registro de la base de datos
      const { error: dbError } = await supabase
        .from('event_photos')
        .delete()
        .eq('id', photoId);

      if (dbError) throw dbError;

      // Actualizar la lista de fotos
      await refreshPhotos(currentPage);
      return true;
    } catch (error) {
      console.error('Error al eliminar la foto:', error);
      throw error; // Lanzar el error para que pueda ser manejado por el componente
    } finally {
      setLoading(false);
    }
  };

  // Actualizar las fotos cuando cambia la página actual
  useEffect(() => {
    refreshPhotos(currentPage);
  }, [currentPage]);

  // Cargar las fotos iniciales
  useEffect(() => {
    refreshPhotos(1);
  }, []);

  return (
    <GalleryContext.Provider 
      value={{ 
        photos, 
        loading, 
        uploadPhoto, 
        deletePhoto, 
        refreshPhotos,
        currentPage,
        totalPages,
        itemsPerPage,
        setCurrentPage,
      }}
    >
      {children}
    </GalleryContext.Provider>
  );
};

export const useGallery = (): GalleryContextType => {
  const context = useContext(GalleryContext);
  if (context === undefined) {
    throw new Error('useGallery must be used within a GalleryProvider');
  }
  return context;
};

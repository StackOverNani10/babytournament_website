// scripts/seedSupabase.ts
import { createClient } from '@supabase/supabase-js';
import { 
  categories, 
  stores, 
  products, 
  mockEvents, 
  mockGuests, 
  mockPredictions, 
  mockReservations 
} from '../src/data/mockData.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Database } from '../src/lib/database.types';

// Type definitions for better type safety
type TableName = keyof Database['public']['Tables'];

// Helper type to get the Insert type for a table
type InsertType<T extends TableName> = Database['public']['Tables'][T]['Insert'];

// Interface for transformed guest data
interface TransformedGuest extends Omit<Database['public']['Tables']['guests']['Insert'], 'id' | 'created_at' | 'updated_at'> {
  event_id: string;
  name: string;
  email: string;
  phone?: string | null;
}

// Interface for transformed prediction data
interface TransformedPrediction extends Omit<Database['public']['Tables']['predictions']['Insert'], 'id' | 'created_at'> {
  event_id: string;
  guest_id: string;
  prediction: 'boy' | 'girl';
  name_suggestion?: string | null;
}

// Interface for transformed reservation data
interface TransformedReservation extends Omit<Database['public']['Tables']['reservations']['Insert'], 'id' | 'created_at' | 'updated_at'> {
  guest_id: string;
  product_id: string;
  status?: 'pending' | 'confirmed' | 'cancelled';
}

// Configuración de rutas ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Faltan variables de entorno de Supabase');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function clearTables() {
    console.log('🧹 Limpiando tablas existentes...');

    // Clear tables in the correct order to respect foreign key constraints
    const tables: TableName[] = [
        'reservations',
        'predictions',
        'guests',
        'products',
        'event_sections',
        'events',
        'categories',
        'stores'
    ];

    for (const table of tables) {
        try {
            const { error } = await supabase
                .from(table)
                .delete()
                .neq('id', '0');

            if (error) throw error;
            console.log(`✅ Tabla ${table} limpiada correctamente`);
        } catch (error) {
            console.error(`❌ Error limpiando tabla ${table}:`, error);
            // Continue with other tables even if one fails
        }
    }

    console.log('✅ Todas las tablas limpiadas correctamente');
}

async function seedDatabase() {
    try {
        console.log('🌱 Iniciando la inserción de datos en Supabase...');
        
        // No need for explicit transaction with Supabase's auto-commit
        // Just ensure all operations are awaited and handle errors properly

        // 1. Insertar categorías
        console.log('📦 Insertando categorías...');
        const { data: insertedCategories, error: categoriesError } = await supabase
            .from('categories')
            .insert(categories)
            .select();

        if (categoriesError) {
            console.error('❌ Error insertando categorías:', categoriesError);
            throw new Error(`Error al insertar categorías: ${categoriesError.message}`);
        }
        console.log(`✅ ${insertedCategories?.length || 0} categorías insertadas`);

        // 2. Insertar tiendas
        console.log('🛍️ Insertando tiendas...');
        const { data: insertedStores, error: storesError } = await supabase
            .from('stores')
            .insert(stores)
            .select();

        if (storesError) {
            console.error('❌ Error insertando tiendas:', storesError);
            throw new Error(`Error al insertar tiendas: ${storesError.message}`);
        }
        console.log(`✅ ${insertedStores?.length || 0} tiendas insertadas`);

        // 3. Insertar eventos
        console.log('🎉 Insertando eventos...');
        const eventsToInsert = mockEvents.map(({ 
            sections, 
            imageUrl, 
            isActive, 
            createdAt, 
            ...eventData 
        }) => ({
            ...eventData,
            image_url: imageUrl || null,
            is_active: isActive,
            created_at: createdAt,
            updated_at: new Date().toISOString(),
            sections: JSON.stringify(sections) // Convert sections to JSON string
        }));

        const { data: insertedEvents, error: eventsError } = await supabase
            .from('events')
            .insert(eventsToInsert)
            .select();

        if (eventsError) {
            console.error('❌ Error insertando eventos:', eventsError);
            throw new Error(`Error al insertar eventos: ${eventsError.message}`);
        }
        console.log(`✅ ${insertedEvents?.length || 0} eventos insertados`);

        // 4. Insertar secciones de eventos
        console.log('📝 Insertando secciones de eventos...');
        const sectionsToInsert: Array<{
            event_id: string;
            section_id: string;
            enabled: boolean;
            title?: string;
            description?: string;
            order: number;
            config?: Record<string, unknown>;
            created_at?: string;
            updated_at?: string;
        }> = [];

        for (const event of mockEvents) {
            for (const [key, section] of Object.entries(event.sections)) {
                sectionsToInsert.push({
                    event_id: event.id,
                    section_id: section.id,
                    enabled: section.enabled,
                    title: section.title,
                    description: section.description,
                    order: section.order,
                    config: section.config
                });
            }
        }

        const { data: insertedSections, error: sectionsError } = await supabase
            .from('event_sections')
            .insert(sectionsToInsert)
            .select();

        if (sectionsError) {
            console.error('❌ Error insertando secciones de eventos:', sectionsError);
            throw new Error(`Error al insertar secciones de eventos: ${sectionsError.message}`);
        }
        console.log(`✅ ${insertedSections?.length || 0} secciones de eventos insertadas`);

        // 5. Insertar productos
        console.log('🎁 Insertando productos...');
        const productsToInsert = products.map(({ 
            categoryId, 
            storeId, 
            eventType, 
            imageUrl,
            isActive,
            suggestedQuantity,
            maxQuantity,
            ...product 
        }) => ({
            ...product,
            category_id: categoryId,
            store_id: storeId,
            event_type: eventType,
            image_url: imageUrl,
            is_active: isActive,
            suggested_quantity: suggestedQuantity,
            max_quantity: maxQuantity,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }));

        const { data: insertedProducts, error: productsError } = await supabase
            .from('products')
            .insert(productsToInsert)
            .select();

        if (productsError) {
            console.error('❌ Error insertando productos:', productsError);
            throw new Error(`Error al insertar productos: ${productsError.message}`);
        }
        console.log(`✅ ${insertedProducts?.length || 0} productos insertados`);

        // 6. Insertar invitados
        console.log('👥 Insertando invitados...');
        const guestsToInsert: InsertType<'guests'>[] = mockGuests.map(guest => ({
            ...guest,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }));

        const { data: insertedGuests, error: guestsError } = await supabase
            .from('guests')
            .insert(guestsToInsert)
            .select();

        if (guestsError) {
            console.error('❌ Error insertando invitados:', guestsError);
            throw new Error(`Error al insertar invitados: ${guestsError.message}`);
        }
        console.log(`✅ ${insertedGuests?.length || 0} invitados insertados`);

        // 7. Insertar predicciones
        console.log('🔮 Insertando predicciones...');
        const predictionsToInsert: InsertType<'predictions'>[] = mockPredictions.map(prediction => ({
            ...prediction,
            created_at: new Date().toISOString()
        }));

        const { data: insertedPredictions, error: predictionsError } = await supabase
            .from('predictions')
            .insert(predictionsToInsert)
            .select();

        if (predictionsError) {
            console.error('❌ Error insertando predicciones:', predictionsError);
            throw new Error(`Error al insertar predicciones: ${predictionsError.message}`);
        }
        console.log(`✅ ${insertedPredictions?.length || 0} predicciones insertadas`);

        // 8. Insertar reservaciones
        console.log('🎁 Insertando reservaciones...');
        const reservationsToInsert: InsertType<'reservations'>[] = mockReservations.map(reservation => ({
            ...reservation,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            status: reservation.status || 'pending' as const
        }));

        const { data: insertedReservations, error: reservationsError } = await supabase
            .from('reservations')
            .insert(reservationsToInsert)
            .select();

        if (reservationsError) {
            console.error('❌ Error insertando reservaciones:', reservationsError);
            throw new Error(`Error al insertar reservaciones: ${reservationsError.message}`);
        }
        console.log(`✅ ${insertedReservations?.length || 0} reservaciones insertadas`);
        
        console.log('✅ Datos insertados exitosamente!');
    } catch (error) {
        console.error('❌ Error durante la inserción de datos:', error);
        throw error;
    }
}

// Ejecutar migración
async function run() {
    try {
        await clearTables();
        await seedDatabase();
    } catch (error) {
        console.error('❌ Error en la ejecución:', error);
    } finally {
        process.exit(0);
    }
}

run();
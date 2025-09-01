# 🎉 Detallazo - Gestor de Eventos Especiales

Este proyecto es una plataforma para la gestión de eventos especiales, incluyendo registro de invitados, lista de regalos, y más.

## 🚀 Stack Tecnológico

### Frontend Principal
- **React 18** - Biblioteca de JavaScript para construir interfaces de usuario
- **TypeScript** - JavaScript tipado para mayor escalabilidad
- **Vite** - Herramienta de construcción y servidor de desarrollo ultrarrápido
- **React Router DOM** - Enrutamiento del lado del cliente
- **Tailwind CSS** - Framework CSS utilitario para diseño responsivo
- **Lucide React** - Biblioteca de iconos moderna y ligera

### Herramientas de Desarrollo
- **ESLint** - Linter para mantener la calidad del código
- **Prettier** - Formateador de código
- **Jest** - Framework de pruebas unitarias
- **Testing Library** - Utilidades para probar componentes React
- **TypeScript ESLint** - Reglas de ESLint para TypeScript

### Gestión de Estado
- **Context API** - Para el manejo de estado global
- **Hooks Personalizados** - Para lógica reutilizable

### Estructura y Tipado
- **TypeScript** - Tipado estático para JavaScript
- **Estructura Feature-based** - Organización modular por características
- **Importaciones absolutas** - Para rutas más limpias

## 🏗️ Estructura del Proyecto

```
src/
├── assets/               # Recursos estáticos (imágenes, fuentes, íconos)
│   ├── fonts/           
│   ├── icons/
│   └── images/
│
├── components/           # Componentes reutilizables
│   ├── layout/           # Componentes de diseño (Header, Footer, etc.)
│   └── ui/               # Componentes de interfaz de usuario reutilizables
│
├── context/              # Contextos de React organizados por dominio
│   ├── events/           # Gestión de eventos
│   ├── reservations/     # Reservas de regalos
│   └── theme/            # Tema de la aplicación
│
├── data/                 # Datos mock y estáticos
│
├── features/             # Características principales
│   ├── activity/         # Actividades del evento
│   ├── auth/             # Autenticación y autorización
│   ├── event/            # Gestión de eventos
│   ├── gifts/            # Catálogo de regalos
│   ├── predictions/      # Predicciones
│   ├── raffle/           # Sorteos
│   ├── reservation/      # Sistema de reservas
│   └── wishes/           # Deseos de los invitados
│
├── hooks/                # Hooks personalizados
│   └── browser/          # Hooks del navegador
│
├── types/                # Tipos TypeScript globales
│
└── utils/                # Utilidades
    ├── currency/         # Manejo de moneda
    └── date/             # Utilidades de fecha
    ├── date/            # Utilidades para manejo de fechas
    └── validation/      # Utilidades para validación
```

## Convenciones de Código

### Componentes
- Usar nombres en PascalCase (ej: `MyComponent.tsx`)
- Un componente por archivo
- Usar TypeScript para tipos
- Documentar props con JSDoc

### Hooks
- Usar el prefijo `use` (ej: `useLocalStorage`)
- Documentar el propósito y el valor de retorno

### Contextos
- Un contexto por dominio funcional
- Proporcionar un hook personalizado para acceder al contexto (ej: `useTheme`)

### Estilos
- Usar Tailwind CSS para estilos
- Mantener los estilos lo más cerca posible de los componentes
- Usar variables CSS para temas y colores

## Estructura de Características (Features)

Cada característica en el directorio `features/` debe seguir esta estructura:

```
feature-name/
├── components/      # Componentes específicos de la característica
├── hooks/           # Hooks específicos de la característica
├── services/        # Llamadas a API específicas
├── types/           # Tipos TypeScript específicos
├── utils/           # Utilidades específicas
├── index.ts         # Exportaciones públicas
└── README.md        # Documentación de la característica
```

## Pruebas

- Las pruebas deben estar junto al código que prueban
- Usar la convención `*.test.tsx` o `*.test.ts`
- Agrupar pruebas relacionadas con `describe`
- Usar nombres descriptivos para los tests

## Guía de Estilo

- Usar comillas simples para strings
- Punto y coma al final de las sentencias
- Usar `interface` sobre `type` para props de componentes
- Ordenar las importaciones: bibliotecas externas primero, luego importaciones internas

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run test` - Ejecuta las pruebas
- `npm run lint` - Ejecuta el linter
- `npm run format` - Formatea el código

## Configuración Recomendada para VSCode

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Dependencias Principales

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide Icons

## Estructura de Commits

Usar [Conventional Commits](https://www.conventionalcommits.org/):

- `feat`: Nueva característica
- `fix`: Corrección de errores
- `docs`: Cambios en la documentación
- `style`: Cambios de formato (puntuación, comas, etc.)
- `refactor`: Cambios que no corrigen errores ni agregan características
- `test`: Agregar o corregir pruebas
- `chore`: Cambios en el proceso de construcción o herramientas auxiliares

Ejemplo: `feat: agregar autenticación con Google`

## 🛠️ Configuración del Proyecto

### Requisitos
- Node.js v18+
- npm v9+ o yarn
- TypeScript v5+

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/detallazo.git
cd detallazo

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Vista previa de producción
npm run preview
```

## 🧪 Testing

El proyecto utiliza Jest y Testing Library para pruebas unitarias y de integración.

```bash
# Ejecutar pruebas
npm test

# Ejecutar pruebas en modo watch
npm test -- --watch

# Generar cobertura de código
npm test -- --coverage
```

## 🎨 Estilos

- **Tailwind CSS** para utilidades y estilos
- **CSS Modules** para estilos con alcance local
- **Variables CSS** para temas y colores

## 📦 Dependencias Principales

- React 18+
- TypeScript
- React Router DOM
- Vite
- Tailwind CSS
- Lucide React (iconos)

## 📝 Convenciones de Código

### Estructura de Componentes

```typescript
// 1. Importaciones (ordenadas)
import React from 'react';
import { useTheme } from '@/context/theme';

// 2. Tipos/Interfaces
type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'outline';
  children: React.ReactNode;
  onClick?: () => void;
};

// 3. Componente
const Button = ({ 
  variant = 'primary', 
  children, 
  onClick 
}: ButtonProps) => {
  const { theme } = useTheme();
  
  return (
    <button 
      className={`btn btn-${variant} ${theme}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
```

### Convenciones de Nombrado

- **Componentes**: PascalCase (`UserProfile.tsx`)
- **Utilidades**: camelCase (`formatDate.ts`)
- **Hooks**: Prefijo `use` (`useLocalStorage.ts`)
- **Archivos de prueba**: `.test.tsx` o `.spec.tsx`

## 🚀 Despliegue

El proyecto está configurado para desplegarse en Vercel o Netlify.

### Variables de Entorno

Crea un archivo `.env` en la raíz con:

```bash
VITE_API_URL=tu_url_de_api
# Otras variables de entorno
```

## 🤝 Contribución

1. Haz un fork del proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Haz commit de tus cambios (`git commit -m 'feat: agregar nueva funcionalidad'`)
4. Haz push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

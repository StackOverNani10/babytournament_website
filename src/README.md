# Estructura del Proyecto Detallazo

Este documento describe la estructura del proyecto y las convenciones utilizadas en el código.

## Estructura de Directorios

```
src/
├── assets/               # Recursos estáticos (imágenes, fuentes, íconos)
│   ├── fonts/           
│   ├── icons/
│   └── images/
│
├── components/          # Componentes reutilizables
│   ├── layout/          # Componentes de diseño (Header, Footer, etc.)
│   └── ui/              # Componentes de interfaz de usuario reutilizables
│
├── config/              # Configuraciones de la aplicación
│
├── constants/           # Constantes de la aplicación
│
├── context/             # Contextos de React organizados por dominio
│   ├── events/          # Contexto para gestión de eventos
│   ├── reservations/    # Contexto para reservas de regalos
│   └── theme/           # Contexto para el tema de la aplicación
│
├── features/            # Características de la aplicación (organizadas por dominio)
│   ├── activity/        # Funcionalidad de actividades
│   ├── auth/            # Autenticación y autorización
│   ├── event/           # Gestión de eventos
│   ├── gifts/           # Catálogo de regalos
│   ├── predictions/     # Predicciones de género
│   ├── raffle/          # Sorteos
│   └── wishes/          # Deseos de los invitados
│
├── hooks/               # Hooks personalizados
│   └── browser/         # Hooks relacionados con el navegador
│
├── pages/               # Componentes de página
│
├── services/            # Servicios para interactuar con APIs externas
│
├── stores/              # Almacenamiento global (si se usa algo como Zustand)
│
├── styles/              # Estilos globales
│
├── types/               # Tipos TypeScript globales
│
└── utils/               # Utilidades de la aplicación
    ├── currency/        # Utilidades para manejo de moneda
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

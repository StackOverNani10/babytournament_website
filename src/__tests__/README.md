# Pruebas Automatizadas

Este directorio contiene las pruebas automatizadas para la aplicación. La estructura sigue las mejores prácticas de pruebas en React con TypeScript.

## Estructura de Directorios

```
src/
├── __tests__/
│   ├── setupTests.ts       # Configuración global para las pruebas
│   └── README.md           # Este archivo
├── components/
│   └── ui/
│       └── __tests__/      # Pruebas de componentes UI
├── features/
│   └── [feature-name]/
│       └── __tests__/      # Pruebas específicas de cada feature
└── utils/
    └── __tests__/          # Pruebas de utilidades
```

## Tipos de Pruebas

### 1. Pruebas Unitarias
- **Ubicación**: `src/components/**/__tests__/`
- **Propósito**: Probar componentes individuales de forma aislada
- **Ejemplo**: `Button.test.tsx`

### 2. Pruebas de Integración
- **Ubicación**: `src/features/**/__tests__/`
- **Propósito**: Probar la interacción entre componentes y lógica de negocio
- **Ejemplo**: `ReservationModal.test.tsx`

### 3. Pruebas de Utilidades
- **Ubicación**: `src/utils/__tests__/`
- **Propósito**: Probar funciones utilitarias puras

## Ejecutando las Pruebas

### Instalar dependencias
```bash
npm install
```

### Ejecutar todas las pruebas
```bash
npm test
```

### Ejecutar pruebas en modo watch
```bash
npm test -- --watch
```

### Generar cobertura de código
```bash
npm test -- --coverage
```

## Convenciones

- **Nombres de archivos**: `[NombreComponente].test.tsx` o `[nombre-utilidad].test.ts`
- **Descripciones**: Usar `describe` para agrupar pruebas relacionadas
- **Casos de prueba**: Usar `it` o `test` para casos individuales
- **Mocks**: Ubicar los mocks en `__mocks__/` en el mismo nivel que el archivo que se está probando

## Buenas Prácticas

1. **AAA Pattern**: Organizar las pruebas en Arrange-Act-Assert
2. **Nombres descriptivos**: Usar nombres que describan el comportamiento esperado
3. **Pruebas aisladas**: Cada prueba debe ser independiente de las demás
4. **Mocks**: Usar mocks para dependencias externas
5. **Cobertura**: Apuntar al menos al 70% de cobertura de código

## Recursos

- [Testing Library](https://testing-library.com/)
- [Jest](https://jestjs.io/)
- [React Testing Examples](https://reactjs.org/docs/testing.html)

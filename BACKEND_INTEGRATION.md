# 📘 Integración Backend - Separación CRUD vs Business Logic

## 🎯 Resumen de Cambios

El backend ha sido refactorizado para separar las operaciones **CRUD puras** de la **lógica de negocio**. El frontend ahora soporta ambos tipos de endpoints y puede funcionar con servidores separados o unificados.

---

## 🔧 Configuración de Variables de Entorno

### Opción 1: Servidor Unificado (Actual - Por Defecto)
Ambos tipos de endpoints corren en el mismo servidor:

```env
VITE_CRUD_API=http://localhost:3007/dishdash
VITE_BUSINESS_API=http://localhost:3007/dishdash
```

### Opción 2: Servidores Separados (Futuro)
CRUD y Business Logic en servidores independientes:

```env
VITE_CRUD_API=http://localhost:3007/dishdash
VITE_BUSINESS_API=http://localhost:3008/dishdash
```

### Opción 3: Producción
```env
VITE_CRUD_API=https://api.dishdash.com/dishdash
VITE_BUSINESS_API=https://business-api.dishdash.com/dishdash
```

---

## 📦 Servicios Actualizados

### 1. **api.js** - Configuración Base

Se crearon dos instancias de axios:
- `axiosInstance`: Para operaciones CRUD (lectura/escritura básica)
- `axiosBusinessInstance`: Para lógica de negocio (cálculos, transformaciones)

```javascript
// Automáticamente usa las variables de entorno configuradas
import { axiosInstance, axiosBusinessInstance } from "./api";
```

---

### 2. **costAnalysis.js** - Análisis de Costos

#### ✨ Nuevos Métodos (Business Logic)

##### `calculateAndSave(data)` - **RECOMENDADO**
Calcula y guarda un análisis de costos en un solo paso.

```javascript
import costAnalysisService from "../services/costAnalysis";

// Ejemplo de uso
const payload = {
  recipeId: "abc123",
  selectedIngredients: [
    {
      ingredientName: "Harina",
      productId: "H001",
      quantity: 500,
      unit: "g"
    }
  ],
  margin: 30,          // Margen de ganancia en %
  ivaPercent: 15,      // IVA en %
  servicePercent: 10   // Servicio en %
};

const result = await costAnalysisService.calculateAndSave(payload);
console.log(result); // Análisis completo guardado en DB
```

**Ventajas:**
- ✅ Un solo llamado al backend
- ✅ Cálculos automáticos (ingredientes, producto, impuestos)
- ✅ Guarda directamente en base de datos
- ✅ Menos código en el frontend

##### `recalculate(id, data)` - Recalcular Análisis Existente
```javascript
const updated = await costAnalysisService.recalculate("analysis123", {
  margin: 35,      // Nuevo margen
  ivaPercent: 16   // Nuevo IVA
});
```

#### 🔄 Métodos Existentes (Business Logic)
Estos métodos siguen disponibles para cálculos paso a paso:

```javascript
// Calcular solo costo de ingredientes
const ingredientsCost = await costAnalysisService.calculateIngredientsCost([...]);

// Calcular costo del producto
const productCost = await costAnalysisService.calculateProductCost({
  ingredientsCost: 50,
  indirectCost: 10,
  servings: 4,
  margin: 30
});

// Calcular impuestos
const taxes = await costAnalysisService.calculateTaxes({
  suggestedPricePerServing: 25,
  ivaPercent: 15,
  servicePercent: 10
});
```

#### 📝 Métodos CRUD
Operaciones básicas sin cálculos:

```javascript
// Guardar análisis PRE-CALCULADO (ya no hace cálculos automáticos)
await costAnalysisService.create(preCalculatedData);

// Listar, obtener, actualizar, eliminar
await costAnalysisService.getAll();
await costAnalysisService.getById(id);
await costAnalysisService.update(id, data);
await costAnalysisService.remove(id);
```

---

### 3. **recipe.js** - Recetas

#### ✨ Nuevo Método (Business Logic)

##### `updateWithCalculations(id, data)` - Update CON Recálculo
Actualiza una receta y recalcula automáticamente `costPerServing` y `pricePerServing`.

```javascript
import recipeService from "../services/recipe";

// Actualizar con recálculo automático
const updatedRecipe = await recipeService.updateWithCalculations("recipe123", {
  name: "Pizza Margherita Especial",
  ingredients: [
    { ingredientName: "Harina", productId: "H001", quantity: 300, unit: "g" }
  ],
  servings: 8
});

console.log(updatedRecipe.costPerServing);  // Recalculado
console.log(updatedRecipe.pricePerServing); // Recalculado
```

**¿Cuándo usarlo?**
- Cuando cambias ingredientes y quieres costos actualizados
- Cuando cambias las porciones (servings)
- Cuando necesitas costos precisos al momento

#### 📝 Método CRUD Original

##### `update(id, data)` - Update Simple SIN Recálculo
Actualiza solo los datos sin recalcular costos.

```javascript
// Actualización simple (sin recálculos)
await recipeService.update("recipe123", {
  name: "Nuevo Nombre",
  description: "Nueva descripción"
});
```

**¿Cuándo usarlo?**
- Cambios cosméticos (nombre, descripción, categoría)
- Cuando NO necesitas recalcular costos
- Actualizaciones masivas (mejor rendimiento)

---

## 🎨 Componentes Actualizados

### `CreateAnalysisPage.jsx`

Ahora ofrece dos flujos:

#### 1️⃣ Flujo Directo (Recomendado) - Un Click
```jsx
// Usuario configura parámetros y presiona "Calcular y Guardar"
const payload = {
  recipeId: selectedRecipe._id,
  selectedIngredients: [...],
  margin: 30,
  ivaPercent: 15,
  servicePercent: 10
};

await costAnalysisService.calculateAndSave(payload);
// ✅ Listo! Análisis creado
```

#### 2️⃣ Flujo Paso a Paso - Para Auditoría
```jsx
// Paso 1: Calcular ingredientes
const step1 = await costAnalysisService.calculateIngredientsCost([...]);

// Paso 2: Calcular producto
const step2 = await costAnalysisService.calculateProductCost({...});

// Paso 3: Calcular impuestos
const step3 = await costAnalysisService.calculateTaxes({...});

// Paso 4: Guardar con método CRUD
await costAnalysisService.create(finalData);
```

**UI Actualizada:**
- Campo de "Margen (%)" agregado
- Botón "Calcular y Guardar" (verde) - Flujo directo
- Botón "Ver Cálculos Paso a Paso" (azul) - Flujo antiguo
- Mensaje informativo explicando la diferencia

---

## 🚦 Guía de Decisión

### ¿Qué endpoint usar?

#### Para Análisis de Costos:
| Acción | Método | Tipo | Cuándo Usar |
|--------|--------|------|-------------|
| Crear análisis completo | `calculateAndSave()` | Business | ⭐ Siempre que sea posible |
| Recalcular existente | `recalculate()` | Business | Cambios de parámetros |
| Cálculos individuales | `calculate*()` | Business | Auditoría o debugging |
| Guardar pre-calculado | `create()` | CRUD | Datos ya procesados |

#### Para Recetas:
| Acción | Método | Tipo | Cuándo Usar |
|--------|--------|------|-------------|
| Update con recálculo | `updateWithCalculations()` | Business | Cambios de ingredientes/porciones |
| Update simple | `update()` | CRUD | Cambios de texto/metadatos |
| Crear receta | `create()` | CRUD | Siempre |

---

## ⚠️ Breaking Changes

### 1. **Cost Analysis - POST /costanalysis**
**Antes:**
```javascript
// El endpoint hacía cálculos automáticamente
await costAnalysisService.create({
  recipeId: "123",
  selectedIngredients: [...],
  ivaPercent: 15
});
// ✅ Análisis calculado y guardado
```

**Ahora:**
```javascript
// El endpoint CRUD ya NO hace cálculos
await costAnalysisService.create({
  recipeId: "123",
  ingredientsCost: 50,    // ❌ Debes calcularlo antes
  totalCost: 150,         // ❌ Debes calcularlo antes
  // ... todos los campos calculados
});

// ✅ SOLUCIÓN: Usar el nuevo endpoint
await costAnalysisService.calculateAndSave({
  recipeId: "123",
  selectedIngredients: [...],
  margin: 30,
  ivaPercent: 15
});
```

### 2. **Recipe - PUT /recipe/:id**
**Antes:**
```javascript
// El endpoint recalculaba costos automáticamente
await recipeService.update("123", {
  ingredients: [...nuevos],
  servings: 8
});
// ✅ Costos recalculados
```

**Ahora:**
```javascript
// El endpoint CRUD ya NO recalcula costos
await recipeService.update("123", {...}); 
// ⚠️ Los costos NO se recalculan

// ✅ SOLUCIÓN: Usar el nuevo endpoint
await recipeService.updateWithCalculations("123", {
  ingredients: [...nuevos],
  servings: 8
});
// ✅ Costos recalculados
```

---

## 🔜 Próximos Pasos (Quotations)

El backend renombró el endpoint de cotizaciones:
- ❌ `PATCH /quotations/:id/approve`
- ✅ `PATCH /quotations/:id/approve-and-schedule`

**Actualización pendiente en frontend:**
```javascript
// services/api.js - Agregar cuando se implemente Quotations
quotations: {
  approveAndSchedule: async (id) => {
    return await axiosBusinessInstance.patch(
      `/quotations/${id}/approve-and-schedule`
    );
  }
}
```

---

## 🧪 Testing

### Test de Integración Local

1. **Servidor unificado (actual):**
```bash
# Backend corriendo en puerto 3007
# Frontend usa ambas variables apuntando al mismo servidor
VITE_CRUD_API=http://localhost:3007/dishdash
VITE_BUSINESS_API=http://localhost:3007/dishdash
```

2. **Servidores separados (futuro):**
```bash
# Terminal 1: CRUD server
npm run start:crud

# Terminal 2: Business server
npm run start:business

# Frontend
VITE_CRUD_API=http://localhost:3007/dishdash
VITE_BUSINESS_API=http://localhost:3008/dishdash
```

### Verificar Funcionalidad

#### Cost Analysis
```javascript
// 1. Crear análisis (método nuevo)
const result = await costAnalysisService.calculateAndSave({
  recipeId: "test123",
  selectedIngredients: [{
    ingredientName: "Test",
    productId: "T001",
    quantity: 100,
    unit: "g"
  }],
  margin: 30,
  ivaPercent: 15,
  servicePercent: 10
});
console.assert(result.totalCost > 0, "Costo calculado");

// 2. Listar análisis
const list = await costAnalysisService.getAll();
console.assert(Array.isArray(list), "Lista de análisis");
```

#### Recipes
```javascript
// 1. Update sin recálculo
const simple = await recipeService.update("recipe123", {
  name: "Nuevo Nombre"
});

// 2. Update con recálculo
const calculated = await recipeService.updateWithCalculations("recipe123", {
  ingredients: [...],
  servings: 10
});
console.assert(calculated.costPerServing, "Costo recalculado");
```

---

## 📚 Recursos Adicionales

### Archivos Modificados
1. `src/services/api.js` - Configuración dual CRUD/Business
2. `src/services/costAnalysis.js` - Nuevos métodos calculateAndSave y recalculate
3. `src/services/recipe.js` - Nuevo método updateWithCalculations
4. `src/views/costanalysis/CreateAnalysisPage.jsx` - UI con flujo dual

### Documentación Backend
Ver archivo `CRUD_VS_BUSINESS_SEPARATION.md` en el repositorio del backend para detalles completos de la implementación.

---

## 🆘 Troubleshooting

### Error: "No response from server"
- ✅ Verifica que las URLs en `.env` sean correctas
- ✅ Confirma que el backend esté corriendo
- ✅ Revisa CORS si usas dominios diferentes

### Error: "calculateAndSave is not a function"
- ✅ Asegúrate de importar desde `services/costAnalysis`
- ✅ Verifica que el backend tenga el endpoint `/costanalysis/calculate-and-save`

### Los costos no se recalculan en recetas
- ✅ Usa `updateWithCalculations()` en lugar de `update()`
- ✅ Verifica que el backend tenga el endpoint `/recipe/:id/with-calculations`

---

## 📝 Notas de Migración

Si tienes código legacy que usa los endpoints antiguos:

### Buscar y reemplazar:
```javascript
// Buscar:
costAnalysisService.create({
  recipeId: ...,
  selectedIngredients: ...
});

// Reemplazar por:
costAnalysisService.calculateAndSave({
  recipeId: ...,
  selectedIngredients: ...,
  margin: 30,
  ivaPercent: 15,
  servicePercent: 10
});
```

---

## ✅ Checklist de Implementación

- [x] Actualizar `api.js` con dual axios instances
- [x] Agregar métodos business en `costAnalysis.js`
- [x] Agregar `updateWithCalculations` en `recipe.js`
- [x] Actualizar `CreateAnalysisPage.jsx` con flujo dual
- [x] Documentar cambios en `BACKEND_INTEGRATION.md`
- [ ] Implementar `approveAndSchedule` en quotations (cuando se desarrolle)
- [ ] Tests de integración para ambos flujos

---

**Última actualización:** Enero 2026  
**Versión del Backend:** v2.0 (CRUD/Business Separation)  
**Compatibilidad:** Servidor unificado ✅ | Servidores separados ✅

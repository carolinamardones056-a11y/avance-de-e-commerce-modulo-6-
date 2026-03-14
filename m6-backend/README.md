# TienditaBL - E-commerce Backend API

Este proyecto es el backend de la tienda e-commerce de mangas BL (TienditaBL), construido con Node.js y Express. Utiliza el módulo File System (`fs`) para la persistencia de datos (productos y ventas) en archivos JSON.

## Instalación y Ejecución

Sigue estos pasos para ejecutar el proyecto localmente:

1. **Instalar dependencias**:
   Abre una terminal en la carpeta `m6-backend` y ejecuta:
   ```bash
   npm install
   ```
   Esto instalará los paquetes necesarios como `express`, `uuid` y `nodemon` (dependencia de desarrollo).

2. **Ejecutar el servidor**:
   Tienes dos opciones para levantar el servidor:

   - **Modo Producción** (ejecución normal con Node.js):
     ```bash
     npm start
     ```
   
   - **Modo Desarrollo** (ejecución con Nodemon, se reiniciará automáticamente si haces cambios en el código):
     ```bash
     npm run dev
     ```

3. **Acceder a la aplicación**:
   Una vez que el servidor esté corriendo, abre tu navegador y visita:
   [http://localhost:3005](http://localhost:3005)

## Estructura de Datos (Persistencia)

Los datos se guardan en la carpeta `data/` dentro del backend:
- `data/productos.json`: Catálogo de mangas y stock disponible.
- `data/ventas.json`: Historial de ventas realizadas.

## Endpoints de la API REST

### Vistas (Frontend)
- **`GET /`**
  - **Descripción**: Sirve la aplicación cliente (interfaz web de TienditaBL ubicada en la carpeta `public`).

### Productos
- **`GET /productos`**
  - **Descripción**: Retorna todos los productos disponibles con su respectivo inventario/stock.
  - **Respuesta Exitosa**: `200 OK` (Array de objetos JSON).

- **`POST /producto`**
  - **Descripción**: Registra un nuevo producto y lo almacena en `productos.json`. Genera un ID usando UUID.
  - **Cuerpo (JSON)**: `{ "nombre": "...", "precio": 10000, "stock": 5, "img": "...", "url": "..." }`
  - **Respuesta Exitosa**: `201 Created` (Objeto JSON creado).
  - **Errores**: `400 Bad Request` si faltan datos requeridos.

- **`PUT /producto`**
  - **Descripción**: Actualiza los datos de un producto existente por su ID.
  - **Cuerpo (JSON)**: `{ "id": "...", "precio": 12000, "stock": 10 }` (solo se envían los campos a actualizar).
  - **Respuesta Exitosa**: `200 OK` (Objeto actualizado).
  - **Errores**: `400 Bad Request` (Sin ID), `404 Not Found` (Producto no existe).

- **`DELETE /producto`**
  - **Descripción**: Elimina un producto por su ID.
  - **Parámetros (Query)**: `/producto?id=...`
  - **Respuesta Exitosa**: `200 OK`.
  - **Errores**: `400 Bad Request` (Sin ID), `404 Not Found` (Producto no existe).

### Ventas y Carrito
- **`GET /ventas`**
  - **Descripción**: Retorna todas las ventas guardadas en `ventas.json`.
  - **Respuesta Exitosa**: `200 OK` (Array de boletas u órdenes de compra).

- **`POST /venta`**
  - **Descripción**: Registra una nueva compra desde el carrito. Calcula los montos totales, aplica descuentos, actualiza el archivo `ventas.json` y descuenta el stock correspondiente en `productos.json`.
  - **Cuerpo (JSON)**: `{ "carrito": [ { "id": "...", "nombre": "...", "precio": 10000, "cantidad": 1 } ], "descuento": "DESC15" }`
  - **Respuesta Exitosa**: `201 Created` (Devuelve mensaje de éxito, ID de venta y total).
  - **Errores**:
    - `400 Bad Request`: El carrito está vacío o el formato es incorrecto.
    - `404 Not Found`: Algún producto del carrito no existe en la BD.
    - `409 Conflict`: No hay stock suficiente para uno o más productos.

---
**Nota sobre el puerto**: El servidor está configurado para correr en el puerto **3005** por defecto, ya que puertos como el 3000 o 3001 estaban en uso durante el desarrollo.

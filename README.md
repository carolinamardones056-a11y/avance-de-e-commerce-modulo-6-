# Proyecto E-commerce - Módulo 7 (Node.js + PostgreSQL)

Este proyecto es una evolución del sistema de e-commerce anterior, migrando el almacenamiento de archivos JSON a una base de datos relacional **PostgreSQL**. Utiliza una combinación de la librería nativa `pg` para operaciones críticas y transacciones, junto con el ORM **Sequelize** para la gestión de modelos y consultas generales.

## Requisitos Previos

- **Node.js**: Versión 16 o superior.
- **PostgreSQL**: Base de datos instalada y corriendo.

## Instalación y Configuración

1. Navega a la carpeta del backend:
   ```bash
   cd m7-backend
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno:
   Crea o edita el archivo `.env` en la raíz de `m7-backend` con tus credenciales:
   ```env
   DATABASE_URL=postgres://tu_usuario:tu_password@localhost:5432/tienditabl
   PORT=3007
   ```

## Base de Datos y Sincronización

El sistema está configurado para manejar la base de datos de forma automática:

- **Autenticación**: Al iniciar el servidor, Sequelize verifica la conexión con PostgreSQL.
- **Sync**: Se utiliza `sequelize.sync({ force: false })` para crear las tablas (`productos`, `ventas`, `detalle_ventas`) si no existen, sin borrar los datos actuales.

## Comandos de Ejecución

- **Iniciar servidor (Producción/Directo):**
  ```bash
  node src/server.js
  ```
- **Modo Desarrollo (con auto-reinicio):**
  ```bash
  npm run dev
  ```

*Nota: Si tienes problemas de permisos de scripts en PowerShell, usa `cmd /c npm start` o lanza el archivo con `node src/server.js` directamente.*

## Documentación de Endpoints (API REST)

### Productos
- `GET /productos`: Obtiene la lista de todos los productos (vía Sequelize).
- `GET /productos/raw`: Obtiene productos con stock utilizando consultas parametrizadas (**Prepared Statements** con `pg`).
- `POST /producto`: Crea un nuevo producto. (Payload: `nombre`, `precio`, `stock`, `img`, `url`).
- `PUT /producto`: Actualiza un producto existente por su ID.
- `DELETE /producto?id=XYZ`: Elimina un producto por ID.

### Ventas
- `GET /ventas`: Lista el historial de ventas incluyendo sus items (vía Sequelize Include).
- `POST /venta`: Registra una compra. Este endpoint utiliza **Transacciones SQL (BEGIN/COMMIT/ROLLBACK)** con `pg`.
  - **Payload**: `{ "carrito": [{ "id": "...", "cantidad": 1 }], "descuento": "DESC15" }`

## Cómo probar la Transacción (Stock y TCL)

Para verificar que el manejo de transacciones funciona correctamente:

1. **Prueba de Éxito**: Agrega productos al carrito y presiona "Comprar ahora". El servidor restará el stock, creará la venta y registrará el detalle. Si vas a "Historial Ventas", verás el registro.
2. **Prueba de Fallo (Rollback)**: Intenta comprar una cantidad superior al stock disponible. El servidor lanzará un error `409 Conflict`. Gracias a la transacción, **no se creará la venta ni se descontará stock parcialmente**, manteniendo la integridad de los datos.

---
*Desarrollado como parte del Portafolio del Curso - Módulo 7.*

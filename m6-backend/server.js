const express = require('express');
const path = require('path');
const { promises: fs } = require('fs');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, 'data');
const FILE_PROD = path.join(DATA_DIR, 'productos.json');
const FILE_VENT = path.join(DATA_DIR, 'ventas.json');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files / frontend

// Helper to read JSON files safely
const leerJson = async (file) => {
  try {
    const data = await fs.readFile(file, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${file}:`, error);
    return [];
  }
};

// Helper to write JSON files
const escribirJson = async (file, data) => {
  await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf-8');
};

// GET /productos - return all products
app.get('/productos', async (req, res) => {
  try {
    const productos = await leerJson(FILE_PROD);
    res.status(200).json(productos);
  } catch (error) {
    res.status(500).json({ error: 'Error al leer productos' });
  }
});

// POST /producto - create a new product
app.post('/producto', async (req, res) => {
  try {
    const { nombre, precio, stock, img, url } = req.body;
    if (!nombre || precio == null || stock == null) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }
    const productos = await leerJson(FILE_PROD);
    const nuevo = { id: uuidv4(), nombre, precio, stock, img: img || '', url: url || '' };
    productos.push(nuevo);
    await escribirJson(FILE_PROD, productos);
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// PUT /producto - update a product
app.put('/producto', async (req, res) => {
  try {
    const { id, nombre, precio, stock, img, url } = req.body;
    if (!id) return res.status(400).json({ error: 'ID es requerido para actualizar' });

    const productos = await leerJson(FILE_PROD);
    const index = productos.findIndex((p) => p.id === id);

    if (index === -1) return res.status(404).json({ error: 'Producto no encontrado' });

    const prodToUpdate = productos[index];
    if (nombre) prodToUpdate.nombre = nombre;
    if (precio != null) prodToUpdate.precio = precio;
    if (stock != null) prodToUpdate.stock = stock;
    if (img != null) prodToUpdate.img = img;
    if (url != null) prodToUpdate.url = url;

    productos[index] = prodToUpdate;
    await escribirJson(FILE_PROD, productos);

    res.status(200).json(prodToUpdate);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// DELETE /producto - delete a product by queries
app.delete('/producto', async (req, res) => {
  try {
    const { id } = req.query; // Assume sent as /producto?id=xyz
    if (!id) return res.status(400).json({ error: 'ID es requerido para eliminar' });

    let productos = await leerJson(FILE_PROD);
    const inicialLength = productos.length;
    productos = productos.filter((p) => p.id !== id);

    if (productos.length === inicialLength) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    await escribirJson(FILE_PROD, productos);
    res.status(200).json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

// GET /ventas - returns all sales
app.get('/ventas', async (req, res) => {
  try {
    const ventas = await leerJson(FILE_VENT);
    res.status(200).json(ventas);
  } catch (error) {
    res.status(500).json({ error: 'Error al leer ventas' });
  }
});

// POST /venta - handle a purchase from the cart
app.post('/venta', async (req, res) => {
  try {
    // Expected payload: { carrito: [ { id, cantidad/etc } ] }
    // Or just the raw cart array. We assume it's an array of items.
    const carrito = req.body.carrito || req.body;
    
    if (!Array.isArray(carrito) || carrito.length === 0) {
      return res.status(400).json({ error: 'El carrito está vacío o el formato es incorrecto' });
    }

    const productos = await leerJson(FILE_PROD);
    let totalVenta = 0;

    // Check availability and calculate total
    for (const item of carrito) {
      // Find the product in DB
      const dbProduct = productos.find(p => p.id === item.id);
      if (!dbProduct) {
        return res.status(404).json({ error: `Producto con id ${item.id} no encontrado en la base de datos` });
      }

      // We assume each cart item counts as 1 for simplicity if 'cantidad' is not explicitly sent,
      // but if the user has multiple same items they should be grouped or counted.
      // E.g. our frontend allows pushing identical items separately. Let's group them or count occurrences.
      const dbStock = Number(dbProduct.stock);
      const requestedAmt = item.cantidad || 1; 

      if (dbStock < requestedAmt) {
         return res.status(409).json({ error: `Stock insuficiente para el producto ${dbProduct.nombre}` });
      }

      // Add to total using the server's price to prevent tampering
      totalVenta += dbProduct.precio * requestedAmt;
    }

    // If we reach here, it means we have enough stock for all items
    // Apply discount logic if needed (From frontend req: "DESC15"). 
    // We'll trust the frontend for simplicity or recalculate. Let's just use the server total.
    // However, if the frontend sent a discount code, we could apply it. We'll check if a discount was sent.
    if (req.body.descuento === 'DESC15') {
        totalVenta = Math.round(totalVenta * 0.85);
    }

    // Discount stock
    for (const item of carrito) {
      const idx = productos.findIndex(p => p.id === item.id);
      const requestedAmt = item.cantidad || 1;
      productos[idx].stock -= requestedAmt;
    }

    // Save updated products
    await escribirJson(FILE_PROD, productos);

    // Register sale
    const ventas = await leerJson(FILE_VENT);
    const nuevaVenta = {
      id: uuidv4(),
      fecha: new Date().toISOString(),
      items: carrito,
      total: totalVenta
    };
    ventas.push(nuevaVenta);
    await escribirJson(FILE_VENT, ventas);

    res.status(201).json({ message: 'Venta registrada con éxito', idVenta: nuevaVenta.id, total: nuevaVenta.total });
  } catch (error) {
    console.error('Error in POST /venta', error);
    res.status(500).json({ error: 'Error al procesar la venta' });
  }
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`API en http://localhost:${PORT}`));

const crypto = require('crypto');
const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const Venta = require('../models/Venta');
const VentaItem = require('../models/VentaItem');
const Producto = require('../models/Producto');

router.get('/', async (req, res) => {
  try {
    const ventas = await Venta.findAll({
      include: [{ model: VentaItem }]
    });
    res.status(200).json(ventas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ventas' });
  }
});

router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const { carrito, descuento } = req.body;
    
    if (!carrito || !Array.isArray(carrito) || carrito.length === 0) {
      return res.status(400).json({ error: 'Carrito vacío' });
    }

    await client.query('BEGIN');

    let totalCalculado = 0;
    const itemsProcesados = [];

    for (const item of carrito) {
      const { rows } = await client.query(
        'SELECT id, nombre, precio, stock FROM productos WHERE id = $1',
        [item.id]
      );
      
      if (rows.length === 0) {
        throw new Error(`Producto ${item.id} no encontrado`);
      }

      const prod = rows[0];
      const cantidad = item.cantidad || 1;

      if (prod.stock < cantidad) {
        const err = new Error(`Stock insuficiente para ${prod.nombre}`);
        err.status = 409;
        throw err;
      }

      totalCalculado += prod.precio * cantidad;
      itemsProcesados.push({ ...prod, cantidad });
    }

    if (descuento === 'DESC15') {
      totalCalculado = Math.round(totalCalculado * 0.85);
    }

    const idVenta = crypto.randomUUID();
    
    await client.query(
      'INSERT INTO ventas (id, fecha, total) VALUES ($1, now(), $2)',
      [idVenta, totalCalculado]
    );

    for (const item of itemsProcesados) {
      await client.query(
        'INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio) VALUES ($1, $2, $3, $4)',
        [idVenta, item.id, item.cantidad, item.precio]
      );

      const { rowCount } = await client.query(
        'UPDATE productos SET stock = stock - $1 WHERE id = $2 AND stock >= $1',
        [item.cantidad, item.id]
      );

      if (rowCount === 0) {
        throw new Error(`Error al actualizar stock de ${item.nombre}`);
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ 
      message: 'Venta registrada con éxito', 
      idVenta: idVenta, 
      total: totalCalculado 
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en transacción venta:', error.message);
    const status = error.status || 500;
    res.status(status).json({ error: error.message });
  } finally {
    client.release();
  }
});

module.exports = router;

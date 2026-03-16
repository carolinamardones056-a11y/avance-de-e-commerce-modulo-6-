const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const Producto = require('../models/Producto');

router.get('/', async (req, res) => {
  try {
    const productos = await Producto.findAll();
    res.status(200).json(productos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

router.get('/raw', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, nombre, precio, stock FROM productos WHERE stock >= $1 ORDER BY id',
      [0]
    );
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar productos (raw)' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { nombre, precio, stock, img, url } = req.body;
    if (!nombre || precio == null || stock == null) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }
    const nuevo = await Producto.create({ nombre, precio, stock, img, url });
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

router.put('/', async (req, res) => {
  try {
    const { id, nombre, precio, stock, img, url } = req.body;
    if (!id) return res.status(400).json({ error: 'ID es requerido para actualizar' });

    const producto = await Producto.findByPk(id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

    await producto.update({ nombre, precio, stock, img, url });
    res.status(200).json(producto);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

router.delete('/', async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'ID es requerido para eliminar' });

    const result = await Producto.destroy({ where: { id } });
    if (result === 0) return res.status(404).json({ error: 'Producto no encontrado' });

    res.status(200).json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

module.exports = router;

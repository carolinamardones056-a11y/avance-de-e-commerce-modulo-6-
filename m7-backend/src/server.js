require('dotenv').config();
const express = require('express');
const path = require('path');
const sequelize = require('./db/sequelize');

const productosRoutes = require('./routes/productos');
const ventasRoutes = require('./routes/ventas');

const app = express();
app.use(express.json());

app.use(express.static(path.join(__dirname, '../public')));

app.use('/productos', productosRoutes);
app.use('/producto', productosRoutes);
app.use('/venta', ventasRoutes);
app.use('/ventas', ventasRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 3007;

const startServer = async () => {
  try {
     await sequelize.authenticate();
     console.log('Conexión a PostgreSQL (Sequelize) establecida.');
     
     await sequelize.sync({ force: false });
     
     app.listen(PORT, () => {
       console.log(`Servidor M7 corriendo en http://localhost:${PORT}`);
     });
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
  }
};

startServer();

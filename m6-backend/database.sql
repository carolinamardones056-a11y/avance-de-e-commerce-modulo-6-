-- Initialize the database
CREATE DATABASE tienditabl;

-- Connect to the newly created database (When using psql you do \c tienditabl)

-- Create the products table to store BL mangas and manhwas
CREATE TABLE productos (
    id UUID PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    precio INTEGER NOT NULL,
    stock INTEGER NOT NULL,
    img VARCHAR(255),
    url VARCHAR(255)
);

-- Insert sample BL manga/manhwa data
INSERT INTO productos (id, nombre, precio, stock, img, url) VALUES
    ('060c1d68-0fb5-48b2-bdec-912f2c8d28e1', 'Kimi no Yoru ni Fureru', 10990, 10, './asset/img/kimi.jpg', '../detalledeproducto.html'),
    ('bfa86ab5-efda-49a3-a0d0-0a25fc5c84d7', 'On Doorstep', 10490, 12, './asset/img/on.jpg', '../detalledeproducto2.html'),
    ('18c21a1b-e9b4-4e2b-baa3-cd0be9af9f8d', 'Apron Yankee', 9990, 8, './asset/img/apron.jpg', '../detalledeproducto3.html'),
    ('89b52a78-2cfb-41db-9de5-11756d56d6dc', 'Subarashii Kiseki ni Yasashii Kimi to', 10990, 15, './asset/img/subarashii.jpg', '../detalledeproducto4.html'),
    ('3be0da8b-6f7f-4f22-9df7-6eb9ef719119', 'Jinx', 11990, 20, './asset/img/jinx.jpg', ''),
    ('787c89a7-2051-41df-a56f-75edc3d9a65a', '2020', 10990, 5, './asset/img/2020.jpg', '');

-- Create sales table (optional, just in case a full DB is eventually required instead of JSON)
CREATE TABLE ventas (
    id UUID PRIMARY KEY,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total INTEGER NOT NULL
);

CREATE TABLE detalle_ventas (
    id SERIAL PRIMARY KEY,
    venta_id UUID REFERENCES ventas(id) ON DELETE CASCADE,
    producto_id UUID REFERENCES productos(id),
    cantidad INTEGER NOT NULL,
    precio INTEGER NOT NULL
);

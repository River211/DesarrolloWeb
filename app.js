require('dotenv').config();
const express = require('express');
const sql = require('mssql');

const app = express();
const port = process.env.PORT || 3000;

// Configuración de la base de datos
const dbConfig = {
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true, // Si estás usando Azure o quieres encriptar la conexión
        trustServerCertificate: true // Si tienes certificados auto-firmados
    }
};

// Middleware para manejar JSON
app.use(express.json());

// Conectar a la base de datos
sql.connect(dbConfig).then(pool => {
    if (pool.connected) {
        console.log('Conectado a SQL Server');
    }
}).catch(err => {
    console.error('Error conectando a la base de datos:', err);
});

// Rutas de Clientes

// Obtener todos los clientes
app.get('/clientes', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT * FROM Clientes');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Crear un cliente
app.post('/clientes', async (req, res) => {
    const { nombre, email } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('nombre', sql.NVarChar, nombre)
            .input('email', sql.NVarChar, email)
            .query('INSERT INTO Clientes (nombre, email) VALUES (@nombre, @email)');
        res.status(201).json({ message: 'Cliente creado' });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Rutas de Pedidos

// Obtener todos los pedidos de un cliente específico
app.get('/pedidos/:clienteId', async (req, res) => {
    const { clienteId } = req.params;
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('clienteId', sql.Int, clienteId)
            .query('SELECT * FROM Pedidos WHERE cliente_id = @clienteId');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Crear un pedido para un cliente
app.post('/pedidos', async (req, res) => {
    const { clienteId, fecha, total } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('clienteId', sql.Int, clienteId)
            .input('fecha', sql.Date, fecha)
            .input('total', sql.Decimal, total)
            .query('INSERT INTO Pedidos (cliente_id, fecha, total) VALUES (@clienteId, @fecha, @total)');
        res.status(201).json({ message: 'Pedido creado' });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Rutas de Detalles de Pedido

// Obtener los detalles de un pedido específico
app.get('/detallesPedido/:pedidoId', async (req, res) => {
    const { pedidoId } = req.params;
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('pedidoId', sql.Int, pedidoId)
            .query('SELECT * FROM DetallesPedido WHERE pedido_id = @pedidoId');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Crear un detalle de pedido
app.post('/detallesPedido', async (req, res) => {
    const { pedidoId, producto, cantidad, precio } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('pedidoId', sql.Int, pedidoId)
            .input('producto', sql.NVarChar, producto)
            .input('cantidad', sql.Int, cantidad)
            .input('precio', sql.Decimal, precio)
            .query('INSERT INTO DetallesPedido (pedido_id, producto, cantidad, precio) VALUES (@pedidoId, @producto, @cantidad, @precio)');
        res.status(201).json({ message: 'Detalle de pedido creado' });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});

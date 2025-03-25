require('dotenv').config();
const express = require('express');
const app = express();

const environment = process.env.NODE_ENV || 'developer';
const ip = process.env.IP || '127.0.0.1';
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send(`Entorno: ${environment} - IP: ${ip} - Puerto: ${port}`);
});

app.listen(port, ip, () => {
    console.log(`Servidor corriendo en http://${ip}:${port} en modo ${environment}`);
});

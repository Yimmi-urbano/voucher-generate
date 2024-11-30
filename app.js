const express = require('express');
const fetch = require('node-fetch');
const { createCanvas } = require('canvas');

const app = express();
const PORT = 3000;

// Función para obtener datos de la API
async function fetchOrderData(orderId) {
    const url = `https://api-orders.creceidea.pe/api/orders/${orderId}`;
    const headers = {
        "domain": "donguston.creceidea.pe"
    };

    try {
        const response = await fetch(url, { method: "GET", headers });
        if (!response.ok) throw new Error(`Error al obtener la orden: ${response.statusText}`);
        const data = await response.json();
        return data[0]; // Obtenemos el primer elemento del array
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}

// Ruta para generar el voucher
app.get('/voucher/:orderId', async (req, res) => {
    const orderId = req.params.orderId;

    // Obtener datos de la orden desde la API
    const orderData = await fetchOrderData(orderId);
    if (!orderData) {
        res.status(500).send("No se pudo obtener la información de la orden.");
        return;
    }

    // Crear un canvas
    const width = 600;
    const height = 800;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Fondo blanco
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height);

    // Encabezado
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#000';
    ctx.fillText('ORDER VOUCHER', 20, 40);

    // Información del cliente
    ctx.font = '16px Arial';
    ctx.fillText(`Client Name: ${orderData.clientInfo.name}`, 20, 80);
    ctx.fillText(`Email: ${orderData.clientInfo.email}`, 20, 110);
    ctx.fillText(`Phone: ${orderData.clientInfo.phone}`, 20, 140);

    // Información del pedido
    ctx.fillText(`Order Number: ${orderData.orderNumber}`, 20, 180);
    ctx.fillText(`Payment Status: ${orderData.paymentStatus}`, 20, 210);
    ctx.fillText(`Order Status: ${orderData.orderStatus}`, 20, 240);
    ctx.fillText(`Created At: ${orderData.createdAt}`, 20, 270);

    // Línea decorativa
    ctx.strokeStyle = '#333';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(20, 300);
    ctx.lineTo(width - 20, 300);
    ctx.stroke();
    ctx.setLineDash([]);

    // Tabla de productos
    ctx.font = 'bold 14px Arial';
    let startY = 330;
    ctx.fillText('Product', 20, startY);
    ctx.fillText('Qty', 250, startY);
    ctx.fillText('Price', 450, startY);

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, startY + 5);
    ctx.lineTo(width - 20, startY + 5);
    ctx.stroke();

    ctx.font = '14px Arial';
    startY += 30;

    for (const product of orderData.products) {
        ctx.fillText(product.title, 20, startY);
        ctx.fillText(`${product.qty}`, 250, startY);
        ctx.fillText(`S/. ${product.valid_price}`, 450, startY);
        startY += 30;
    }

    // Línea final de la tabla
    ctx.beginPath();
    ctx.moveTo(20, startY);
    ctx.lineTo(width - 20, startY);
    ctx.stroke();

    // Total del pedido
    startY += 20;
    ctx.font = 'bold 18px Arial';
    ctx.fillText(`TOTAL: S/. ${orderData.total}`, 20, startY + 30);

    // Respuesta como imagen
    res.setHeader('Content-Type', 'image/png');
    canvas.pngStream().pipe(res);
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

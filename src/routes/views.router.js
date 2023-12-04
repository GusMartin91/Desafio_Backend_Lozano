import { Router } from "express";
import { ProductManager } from '../productManager.js';
import { socketServer } from "../app.js";

const prodManager = new ProductManager("./Productos.json");

const router = Router()

router.get('/', (req, res) => {
    const products = prodManager.getProducts();
    res.render('home', { products })
})

router.get('/realtimeproducts', (req, res) => {
    const products = prodManager.getProducts();
    res.render('realTimeProducts', {
        title: "realTimeProducts",
        products
    })
    socketServer.emit('realTimeProducts', { products });
});

export default router
import { Router } from "express";
import { socketServer } from '../app.js';

const cartsRouter = (cartManager, productManager) => {
    const router = Router();

    router.get('/', (req, res) => {
        try {
            const carts = cartManager.getCarts();
            const limit = req.query.limit;

            if (limit) {
                res.json({ carts: carts.slice(0, limit) });
            } else {
                res.json({ carts });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    });

    router.post('/', (req, res) => {
        try {
            const newCartId = cartManager.getNextCartId();
            const newCart = cartManager.addCart(newCartId);
            res.status(201).json({ cart: newCart });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error interno del ervidor' });
        }
    });

    router.get('/:cid', (req, res) => {
        try {
            const cartId = parseInt(req.params.cid);
            const cart = cartManager.getCartById(cartId);
            if (cart) {
                res.json({ cart });
            } else {
                res.status(404).json({ error: 'Carrito no encontrado' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error interno del ervidor' });
        }
    });

    router.post('/:cid/product/:pid', (req, res) => {
        try {
            const cartId = parseInt(req.params.cid);
            const productId = parseInt(req.params.pid);
            const quantity = req.body.quantity || 1;

            const cart = cartManager.getCartById(cartId);
            const product = productManager.getProductByID(productId);

            if (!cart || !product) {
                return res.status(404).json({ error: 'Carrito o producto no encontrado' });
            }

            const existingProduct = cart.products.find(item => item.product.id === productId);

            if (existingProduct) {
                existingProduct.quantity += quantity;
            } else {
                cart.products.push({
                    product: { id: productId },
                    quantity: quantity,
                });
            }

            cartManager.updateCart(cartId, cart);

            socketServer.emit('productAdded', { productId: productId, message: 'Se ha agregado un nuevo producto.' });

            res.status(201).json({ cart: cart });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    });

    router.delete('/:cid/product/:pid', (req, res) => {
        try {
            const cartId = parseInt(req.params.cid);
            const productId = parseInt(req.params.pid);

            const cart = cartManager.getCartById(cartId);

            if (!cart) {
                return res.status(404).json({ error: 'Carrito no encontrado' });
            }

            cart.products = cart.products.filter(p => p.product !== productId);

            cartManager.saveCarts();

            res.json({ message: 'Producto eliminado del carrito exitosamente' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    });
    router.put('/:cid', (req, res) => {
        try {
            const cartId = parseInt(req.params.cid);
            const updatedCart = req.body;

            const cart = cartManager.getCartById(cartId);

            if (!cart) {
                return res.status(404).json({ error: 'Carrito no encontrado' });
            }

            cartManager.updateCart(cartId, updatedCart);

            res.json({ message: 'Carrito actualizado exitosamente' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    });

    router.delete('/:cid', (req, res) => {
        try {
            const cartId = parseInt(req.params.cid);

            const cart = cartManager.getCartById(cartId);

            if (!cart) {
                return res.status(404).json({ error: 'Carrito no encontrado' });
            }

            cart.products = [];
            cartManager.saveCarts();

            res.json({ message: 'Carrito vaciado exitosamente' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    });

    router.get('/:cid/total', (req, res) => {
        try {
            const cartId = parseInt(req.params.cid);

            const cart = cartManager.getCartById(cartId);

            if (!cart) {
                return res.status(404).json({ error: 'Carrito no encontrado' });
            }

            const total = cart.products.reduce((acc, product) => {
                const productInfo = productManager.getProductById(product.product);
                if (productInfo) {
                    acc += productInfo.price * product.quantity;
                }
                return acc;
            }, 0);

            res.json({ total });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    });

    return router;
};

export default cartsRouter;

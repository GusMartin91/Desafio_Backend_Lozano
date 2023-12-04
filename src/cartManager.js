import fs from 'fs';

class CartManager {
    constructor(path) {
        this.path = path;
        if (fs.existsSync(path)) {
            try {
                let carts = fs.readFileSync(path, 'utf-8');
                this.carts = JSON.parse(carts);
            } catch (error) {
                this.carts = [];
            }
        } else {
            this.carts = [];
        }
    }

    async saveCarts() {
        try {
            await fs.promises.writeFile(this.path, JSON.stringify(this.carts, null, '\t'));
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    getCarts() {
        return this.carts;
    }

    getCartById(cartId) {
        return this.carts.find(cart => cart.id === cartId);
    }

    addCart(cartId) {
        const newCart = new Cart(cartId);
        this.carts.push(newCart);
        this.saveCarts();
        return newCart;
    }

    updateCart(cartId, updatedCart) {
        const cartIndex = this.carts.findIndex(cart => cart.id === cartId);
        if (cartIndex !== -1) {
            this.carts[cartIndex] = { ...updatedCart, id: cartId };
            this.saveCarts();
        } else {
            console.log('Carrito no encontrado');
        }
    }

    deleteCart(cartId) {
        const cartIndex = this.carts.findIndex(cart => cart.id === cartId);
        if (cartIndex !== -1) {
            this.carts.splice(cartIndex, 1);
            this.saveCarts();
        } else {
            console.log('Carrito no encontrado');
        }
    }

    getNextCartId() {
        return this.carts.reduce((max, cart) => (cart.id > max ? cart.id : max), 0) + 1;
    }
}

class Cart {
    constructor(id) {
        this.id = id;
        this.products = [];
    }
}

export { CartManager, Cart };

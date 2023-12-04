import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import { ProductManager } from './productManager.js';
import { CartManager } from './cartManager.js';
import express from 'express'
import handlebars from 'express-handlebars'
import __dirname from './utils.js'
import { Server } from 'socket.io'
import viewRouter from './routes/views.router.js'
import path from 'path';

const app = express()
const PORT = 5000

const httpServer = app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`))
const socketServer = new Server(httpServer)

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.engine('hbs', handlebars.engine({
    extname: 'hbs',
    defaultLayout: 'main'
}))


app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.static(`${__dirname}/public`))

app.use('/', viewRouter)

const prodManager = new ProductManager("./Productos.json");
const cartManager = new CartManager("./Carritos.json", prodManager);



app.use('/api/products', productsRouter(prodManager));
app.use('/api/carts', cartsRouter(cartManager, prodManager));

socketServer.on('connection', (socketServer) => {
    socketServer.on('message', (data) => {
        console.log('Cliente Conectado: ', data);
    })
    socketServer.on('deleteProduct', (productId) => {
        prodManager.deleteProduct(productId);

        socketServer.emit('productDeleted', {
            productId
        });
    })
    socketServer.on('addProduct', (newProduct) => {
        prodManager.addProduct(newProduct);
        socketServer.emit('productAdded', { newProduct });
    })
});
export { socketServer };
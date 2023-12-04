import fs from 'fs'

class ProductManager {
    constructor(path) {
        this.path = path
        if (fs.existsSync(path)) {
            try {
                let productos = fs.readFileSync(path, "utf-8")
                this.products = JSON.parse(productos)
            } catch (error) {
                this.products = []
            }
        } else {
            this.products = []
        }
    }

    async saveFile(data) {
        try {
            await fs.promises.writeFile(this.path, JSON.stringify(data, null, '\t'))
            return true
        } catch (error) {
            console.log(error);
            return false
        }
    }

    getProducts() {
        return this.products;
    }

    isCodeDuplicate(code) {
        return this.products.some(product => product.code === code);
    }

    getProductByID(id) {
        const product = this.products.find(product => product.id === id);
        if (product) {
            return product;
        } else {
            console.log("¡Producto no encontrado!");
        }
    }

    async addProduct(product) {
        const requiredFields = ['title', 'description', 'price', 'thumbnail', 'code', 'stock'];
        for (const field of requiredFields) {
            if (!product[field]) {
                return console.log(`Falta completar el campo "${field}" del producto`);
            }
        }

        if (this.isCodeDuplicate(product.code)) {
            return console.log('¡El código del producto ya existe!');
        }

        product.id = this.getNextProductId();
        this.products.push(product);

        const respuesta = await this.saveFile(this.products);
        if (respuesta) {
            console.log('Producto añadido');
        } else {
            console.log('Hubo un error al añadir producto');
        }
    }

    getNextProductId() {
        const maxId = this.products.reduce((max, product) => (product.id > max ? product.id : max), 0);
        return maxId + 1;
    }


    async updateProduct(id, updatedProduct) {
        const productIndex = this.products.findIndex(product => product.id === id);
        if (productIndex !== -1) {
            this.products[productIndex] = { ...updatedProduct, id };
            const respuesta = await this.saveFile(this.products);
            if (respuesta) {
                console.log("Producto editado correctamente");
            } else {
                console.log("Hubo un error al editar el producto");
            }
        } else {
            console.log("Producto no encontrado");
        }
    }

    async deleteProduct(id) {
        const productIndex = this.products.findIndex(product => product.id === id);
        if (productIndex !== -1) {
            this.products.splice(productIndex, 1);
            const respuesta = await this.saveFile(this.products);
            if (respuesta) {
                console.log("Producto eliminado correctamente");
            } else {
                console.log("Hubo un error al eliminar el producto");
            }
        } else {
            console.log("Producto no encontrado");
        }
    }
}

class Product {
    constructor(
        title,
        description,
        price,
        thumbnail,
        code,
        stock
    ) {
        this.id = "";
        this.title = title;
        this.description = description;
        this.price = price;
        this.thumbnail = thumbnail;
        this.code = code;
        this.stock = stock;
    }
}
const producto1 = new Product("Manzana", "Manzana roja seleccionada", 7500, "https://elegifruta.com.ar/wp-content/uploads/2017/07/manzana_roja.jpg", "MR006", 1427)
const producto2 = new Product("pera", "pera seleccionada", 820, "https://img.freepik.com/foto-gratis/tiro-vertical-peras-maduras-frescas_181624-61344.jpg?w=360&t=st=1699375786~exp=1699376386~hmac=d86c89c024079a05ae83fe1e1cc90b0d331d8378c3d93ede57f49c872c9665b7", "PR004", 267)
const producto3 = new Product("banana", "banana seleccionada", 1200, "https://img.freepik.com/vector-gratis/racimo-platano-amarillo-maduro-vector-aislado-sobre-fondo-blanco_1284-45456.jpg?w=740&t=st=1699375720~exp=1699376320~hmac=60816c5e156992fd584689c4de83ebeab816060ee1081994c83f9fdad7c18835", "BN002", 1767)

const prodManager = new ProductManager("./Productos.json")

export { ProductManager, Product };
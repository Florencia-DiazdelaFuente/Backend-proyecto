import fs from "fs";
import { NotFoundError, ValidationError } from "../utils/index.js";

export class ProductManagerFilesystem {
    
    constructor (path) {
        this.path = path;

        this.#init();

    }

    #init() {
        try {
            const existFile = fs.existsSync(this.path);
            if (existFile) 
            return;
            fs.writeFileSync(this.path, JSON.stringify([]));
        } catch(error) {
            console.log(error)
        }
    }


    async getProducts () {
        
            const response = await fs.promises.readFile(this.path, "utf-8");
            return JSON.parse(response);
}

async getProductById(id) {
    const products = await this.getProducts()

    const product = products.find(el => el.id ===id) 

    return product;
}

async saveProduct({title, description, price, thumbnail, code, stock}) {
    const newProduct = { title, description, price, thumbnail, code, stock}

    const products = await this.getProducts()

    const existCodeInProducts = products.some(product => product.code === code)

    if(existCodeInProducts) {
        throw new ValidationError("El código no se puede repetir")
    }

    newProduct.id = !products.length ? 1 : products [products.length - 1].id + 1

    products.push(newProduct)

    await fs.promises.writeFile(this.path, JSON.stringify(products, null, 3))

    return newProduct;
}


async update(id, {title, description, price, thumbnail, code, stock}) {
    const products = await this.getProducts()

    const productIndex = products.findIndex(product => product.id === id)

    if (productIndex === -1) {
        throw new NotFoundError("El producto no fue encontrado")
    }

    const product = products[productIndex]

    products[productIndex] = {...product, title, description, price, thumbnail, code, stock}

    await fs.promises.writeFile(this.path, JSON.stringify(products, null, 3))

    return products[productIndex]

}

async deleteProduct(id) {
    const products = await this.getProducts()

    const productIndex = products.findIndex(product => product.id === id)

    if (productIndex === - 1) {
        throw new NotFoundError("Producto no encontrado")
    }

    const deletedProducts = products.splice(productIndex, 1)

    await fs.promises.writeFile(this.path, JSON.stringify(products, null, 3))

    return deletedProducts[0];
}
}


const socketClientRTP = io()


socketClientRTP.emit("message", "Cliente (realTimeProducts)")
socketClientRTP.on("realTimeProducts", ({ products }) => {
  console.log("Productos en tiempo real: ", products)
})

function deleteProduct(productId) {
  socketClientRTP.emit('deleteProduct', productId);
  console.log("Click en eliminar, ID: ", productId)
}

socketClientRTP.on('productAdded', ({ newProduct }) => {
  console.log("Nuevo producto en tiempo real: ", newProduct)
  const { thumbnail, title, description, price, code, stock, id } = newProduct
  const productList = document.getElementById('product-list');
  productList.innerHTML += `
    <div class="col-md-6 col-lg-4" id=${id}>
    <div class="card mt-4 bg-light" style="width: 100%;">
      <div
        class="img-container"
        style="width: 150px; height: 150px; overflow: hidden; margin: 0 auto;"
      >
        <img
          src="${thumbnail}"
          class="card-img-top"
          alt="${title}"
          style="width: 100%; height: 100%; object-fit: cover;"
        />
      </div>
      <div class="card-body" style="height: 250px;">
        <h2 class="card-title text-info">${title}</h2>
        <p
          class="card-text description"
          style="font-weight: bold; font-size: 1.1em;"
        >${description}</p>
        <p class="card-text">Precio: $ ${price}</p>
        <p class="card-text">Código: ${code}</p>
        <p class="card-text">Stock: ${stock}</p>
      </div>
      <div class="card-footer text-center">
      <button
        class="btn btn-danger"
        onclick="deleteProduct(${id})"
      >Eliminar</button>
    </div>
    </div>
  </div>
    `;
});

socketClientRTP.on('productDeleted', ({ productId }) => {
  console.log('producto eliminado, ID: ', productId);
  const productToRemove = document.getElementById(productId);
  if (productToRemove) {
    productToRemove.remove();
  }
});

document.getElementById('addProductForm').addEventListener('submit', function (event) {
  event.preventDefault();

  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const price = document.getElementById('price').value;
  const thumbnail = document.getElementById('thumbnail').value;
  const code = document.getElementById('code').value;
  const stock = document.getElementById('stock').value;

  socketClientRTP.emit('addProduct', {
    title,
    description,
    price,
    thumbnail,
    code,
    stock,
  });

  this.reset();
});

const api_url = `http://localhost:8080/api/productos-test`;
let products;
export default async function getProductsTest() {
  const res = await fetch(api_url);
  const data = await res.json();
  products = await data.products;
  renderProducts(products);
}

function renderProducts(products = []) {
  const html = productTemplate({
    products,
    productsExists: products.length,
  });
  productsTable.innerHTML = html;
}

// export default getProductsTest;
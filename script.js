const items = document.querySelector('.items');
const cartItems = document.querySelector('.cart__items');
const emptyCart = document.querySelector('.empty-cart');
const cart = document.querySelector('.cart');

let results = [];
let shoppingCart = [];
let sumPrice = 0;
let loading = '';
const urlItem = 'https://api.mercadolibre.com/items/';
const urlItens = 'https://api.mercadolibre.com/sites/MLB/search?q=computador';
let updateCart = null;

const checkCart = () => {
  if (localStorage.getItem('shoppingCart')) {
    return JSON.parse(localStorage.getItem('shoppingCart'));
  } 
  return [];  
};

function cartItemClickListener(event) {
  const data = event.target.textContent.split('|');
  const sku = data[0].replace('SKU: ', '');
  shoppingCart = checkCart();
  const result = shoppingCart.filter((item) => item.sku.trim() !== sku.trim());
  localStorage.setItem('shoppingCart', JSON.stringify(result));
  updateCart();
}

function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  return li;
}

const removeTotal = () => {
  if (document.querySelector('.total-price')) {
    const elem = document.querySelector('.total-price');
    elem.parentNode.removeChild(elem);
  }
};

updateCart = () => {
  shoppingCart = checkCart();
  sumPrice = 0;
  cartItems.innerHTML = '';
  const totalPrice = document.createElement('strong');
  totalPrice.className = 'total-price';
  shoppingCart.map((item) => {
    sumPrice += item.salePrice;    
    cartItems.append(createCartItemElement(item));
    totalPrice.textContent = sumPrice;
    return 0;
  });  
  removeTotal();
  console.log(totalPrice.textContent);
  if (sumPrice > 0) {
    cart.append(totalPrice);
  }
};

emptyCart.addEventListener('click', () => {
  localStorage.clear();
  removeTotal();
  updateCart();
});

const getProducts = async () => {
  const body = await fetch(urlItens);
  const json = await body.json(); 
  results = json.results;
};

const lazyLoad = () => {
  loading = document.createElement('div');
  loading.classList.add('loading'); 
  loading.textContent = 'loading...';
  items.append(loading);
};

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createProductItemElement({ sku, name, image }) {
  const section = document.createElement('section');
  section.className = 'item';

  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  section.appendChild(createCustomElement('button', 'item__add', 'Adicionar ao carrinho!'));

  return section;
}

const buildProducts = () => {
  results.map((item) => items.append(createProductItemElement({
    sku: item.id,
    name: item.title,
    image: item.thumbnail,
  })));
};

lazyLoad();  
updateCart();

const getItem = async (sku) => {
  const body = await fetch(urlItem + sku);
  const json = await body.json();
      shoppingCart = checkCart();
      shoppingCart.push({ 
        sku: json.id, 
        name: json.title, 
        salePrice: json.price,
      });
      localStorage.setItem('shoppingCart', JSON.stringify(shoppingCart));   
      updateCart();
};

async function initialize() {
  await getProducts();  
  buildProducts();
  if (document.querySelector('.loading')) {
    const elem = document.querySelector('.loading');
    elem.parentNode.removeChild(elem);
  }
  const itemAdd = document.querySelectorAll('.item__add');
    
  itemAdd.forEach((item) => {
    item.addEventListener('click', (evt) => {
      getItem(evt.path[1].firstChild.textContent);
    });
  });
}

initialize();
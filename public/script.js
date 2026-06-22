const products = [
  {
    id: "brasil-98",
    name: "Brasil 1998",
    category: "retro",
    price: 129.9,
    image: "assets/camisa-brasil.svg",
    tag: "Retrô",
    description: "Modelo amarelo clássico com gola verde e visual de coleção."
  },
  {
    id: "argentina-classica",
    name: "Argentina Clássica",
    category: "internacional",
    price: 119.9,
    image: "assets/camisa-argentina.svg",
    tag: "Internacional",
    description: "Listras tradicionais, tecido leve e acabamento esportivo."
  },
  {
    id: "europa-noite",
    name: "Europa Noite",
    category: "internacional",
    price: 149.9,
    image: "assets/camisa-europa.svg",
    tag: "Edição especial",
    description: "Camisa escura com detalhes dourados para jogo ou passeio."
  },
  {
    id: "rio-vermelha",
    name: "Rio Vermelha",
    category: "nacional",
    price: 109.9,
    image: "assets/camisa-rio.svg",
    tag: "Nacional",
    description: "Vermelha intensa, escudo minimalista e corte confortável."
  },
  {
    id: "sao-paulo-tricolor",
    name: "Tricolor Paulista",
    category: "nacional",
    price: 99.9,
    image: "assets/camisa-tricolor.svg",
    tag: "Nacional",
    description: "Faixa tricolor frontal com estilo limpo para torcer."
  },
  {
    id: "azul-retro",
    name: "Azul Retrô 80",
    category: "retro",
    price: 134.9,
    image: "assets/camisa-azul.svg",
    tag: "Retrô",
    description: "Visual anos 80 com gola polo e tecido macio."
  }
];

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

const productGrid = document.querySelector("[data-products]");
const filters = document.querySelectorAll("[data-filter]");
const cartDrawer = document.querySelector("[data-cart-drawer]");
const cartItems = document.querySelector("[data-cart-items]");
const cartTotal = document.querySelector("[data-cart-total]");
const cartCount = document.querySelector("[data-cart-count]");
const checkoutForm = document.querySelector("[data-checkout]");
const formStatus = document.querySelector("[data-form-status]");

let activeFilter = "todos";
const cart = new Map();

function renderProducts() {
  const visibleProducts =
    activeFilter === "todos"
      ? products
      : products.filter((product) => product.category === activeFilter);

  productGrid.innerHTML = visibleProducts
    .map(
      (product) => `
        <article class="product-card">
          <div class="product-image">
            <img src="${product.image}" alt="Camisa ${product.name}" />
            <span>${product.tag}</span>
          </div>
          <div class="product-info">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="product-footer">
              <strong>${currency.format(product.price)}</strong>
              <button type="button" data-add="${product.id}">Adicionar</button>
            </div>
          </div>
        </article>
      `
    )
    .join("");
}

function renderCart() {
  const entries = [...cart.values()];
  const amount = entries.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const quantity = entries.reduce((sum, item) => sum + item.quantity, 0);

  cartCount.textContent = quantity;
  cartTotal.textContent = currency.format(amount);

  if (!entries.length) {
    cartItems.innerHTML = '<p class="empty-cart">Seu carrinho ainda está vazio.</p>';
    return;
  }

  cartItems.innerHTML = entries
    .map(
      (item) => `
        <div class="cart-item">
          <img src="${item.image}" alt="Camisa ${item.name}" />
          <div>
            <strong>${item.name}</strong>
            <span>${currency.format(item.price)} x ${item.quantity}</span>
          </div>
          <div class="quantity-controls">
            <button type="button" data-decrease="${item.id}" aria-label="Diminuir ${item.name}">-</button>
            <button type="button" data-increase="${item.id}" aria-label="Aumentar ${item.name}">+</button>
          </div>
        </div>
      `
    )
    .join("");
}

function addToCart(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;

  const current = cart.get(id);
  cart.set(id, { ...product, quantity: current ? current.quantity + 1 : 1 });
  renderCart();
  cartDrawer.classList.add("is-open");
}

function changeQuantity(id, delta) {
  const item = cart.get(id);
  if (!item) return;

  const nextQuantity = item.quantity + delta;
  if (nextQuantity <= 0) {
    cart.delete(id);
  } else {
    cart.set(id, { ...item, quantity: nextQuantity });
  }
  renderCart();
}

filters.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filters.forEach((filter) => filter.classList.toggle("is-active", filter === button));
    renderProducts();
  });
});

document.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add]");
  const increaseButton = event.target.closest("[data-increase]");
  const decreaseButton = event.target.closest("[data-decrease]");

  if (addButton) addToCart(addButton.dataset.add);
  if (increaseButton) changeQuantity(increaseButton.dataset.increase, 1);
  if (decreaseButton) changeQuantity(decreaseButton.dataset.decrease, -1);
  if (event.target.closest("[data-cart-open]")) cartDrawer.classList.add("is-open");
  if (event.target.closest("[data-cart-close]")) cartDrawer.classList.remove("is-open");
});

cartDrawer.addEventListener("click", (event) => {
  if (event.target === cartDrawer) cartDrawer.classList.remove("is-open");
});

checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!cart.size) {
    formStatus.textContent = "Adicione pelo menos uma camisa ao carrinho antes de finalizar.";
    formStatus.className = "form-status is-error";
    return;
  }

  const data = new FormData(checkoutForm);
  const name = data.get("nome");
  const total = cartTotal.textContent;

  formStatus.textContent = `Pedido recebido, ${name}! Total: ${total}. Entraremos em contato pelo WhatsApp.`;
  formStatus.className = "form-status is-success";
  checkoutForm.reset();
  cart.clear();
  renderCart();
});

renderProducts();
renderCart();

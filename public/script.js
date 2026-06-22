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
const improvementForm = document.querySelector("[data-improvement-form]");
const improvementStatus = document.querySelector("[data-improvement-status]");
const assistantPreview = document.querySelector("[data-assistant-preview]");
const adminLogin = document.querySelector("[data-admin-login]");
const adminStatus = document.querySelector("[data-admin-status]");
const adminPanel = document.querySelector("[data-admin-panel]");
const requestList = document.querySelector("[data-request-list]");
const aiRequestForm = document.querySelector("[data-ai-request-form]");
const aiStatus = document.querySelector("[data-ai-status]");
const customerLogin = document.querySelector("[data-customer-login]");
const customerStatus = document.querySelector("[data-customer-status]");
const customerOrders = document.querySelector("[data-customer-orders]");

let activeFilter = "todos";
const cart = new Map();
const improvementStorageKey = "yndra-improvement-requests";
const orderStorageKey = "yndra-customer-orders";
const adminSessionKey = "yndra-admin-session";
const adminCredentials = {
  email: "g1@educacaoensa.com",
  password: "g1.123"
};

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

function loadRequests() {
  try {
    return JSON.parse(localStorage.getItem(improvementStorageKey)) || [];
  } catch {
    return [];
  }
}

function saveRequests(requests) {
  localStorage.setItem(improvementStorageKey, JSON.stringify(requests));
}

function loadOrders() {
  try {
    return JSON.parse(localStorage.getItem(orderStorageKey)) || [];
  } catch {
    return [];
  }
}

function saveOrders(orders) {
  localStorage.setItem(orderStorageKey, JSON.stringify(orders));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createAssistantSummary(request) {
  return [
    `Pedido: ${request.title}`,
    `Área afetada: ${request.area}.`,
    `Prioridade: ${request.priority}.`,
    `Resumo: ${request.description}`,
    `Aprovação: ${request.status}.`,
    "Próximo passo: transformar em alteração de código, testar e publicar com Firebase Hosting."
  ].join("\n");
}

function createAiPlan(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  const area = lowerPrompt.includes("produto") || lowerPrompt.includes("camisa")
    ? "Produtos"
    : lowerPrompt.includes("pedido") || lowerPrompt.includes("compra")
      ? "Pedido"
      : lowerPrompt.includes("cor") || lowerPrompt.includes("visual")
        ? "Visual"
        : "Admin";

  return {
    area,
    title: prompt.length > 70 ? `${prompt.slice(0, 70)}...` : prompt,
    description: [
      `Solicitação criada pelo administrador: ${prompt}`,
      "Plano da IA: localizar a seção afetada, alterar HTML/CSS/JS, validar no navegador e publicar uma nova versão."
    ].join(" ")
  };
}

function renderAdminRequests() {
  if (!requestList) return;

  const requests = loadRequests();

  if (!requests.length) {
    requestList.innerHTML = '<p class="empty-cart">Nenhuma melhoria foi enviada ainda.</p>';
    return;
  }

  requestList.innerHTML = requests
    .map(
      (request) => `
        <article class="request-card">
          <header>
            <h4>${escapeHtml(request.title)}</h4>
            <span class="request-pill">${escapeHtml(request.status)}</span>
          </header>
          <div class="request-meta">
            <span>${escapeHtml(request.area)}</span>
            <span>${escapeHtml(request.priority)}</span>
            <span>${escapeHtml(request.name)}</span>
            <span>${escapeHtml(request.source || "Visitante")}</span>
            <span>${escapeHtml(request.date)}</span>
          </div>
          <p>${escapeHtml(request.description)}</p>
          <p>${escapeHtml(request.summary).replaceAll("\n", "<br />")}</p>
          <div class="request-actions">
            <button type="button" data-request-status="${request.id}" data-status="Em análise">Em análise</button>
            <button type="button" data-request-status="${request.id}" data-status="Pronto para deploy">Pronto</button>
            <button type="button" data-request-remove="${request.id}">Remover</button>
          </div>
        </article>
      `
    )
    .join("");
}

function renderCustomerOrders(whatsapp) {
  if (!customerOrders) return;

  const normalizedWhatsapp = normalizePhone(whatsapp);
  const orders = loadOrders().filter((order) => normalizePhone(order.whatsapp) === normalizedWhatsapp);

  if (!orders.length) {
    customerOrders.innerHTML = '<p class="empty-cart">Nenhum pedido encontrado para este WhatsApp.</p>';
    return;
  }

  customerOrders.innerHTML = orders
    .map(
      (order) => `
        <article class="request-card">
          <header>
            <h4>Pedido ${escapeHtml(order.id)}</h4>
            <span class="request-pill">${escapeHtml(order.status)}</span>
          </header>
          <div class="request-meta">
            <span>${escapeHtml(order.name)}</span>
            <span>${escapeHtml(order.city)}</span>
            <span>${escapeHtml(order.date)}</span>
            <span>${escapeHtml(order.total)}</span>
          </div>
          <p>${escapeHtml(order.items.map((item) => `${item.quantity}x ${item.name}`).join(", "))}</p>
          <p>${escapeHtml(order.notes || "Sem observações.")}</p>
        </article>
      `
    )
    .join("");
}

function normalizePhone(phone) {
  return String(phone || "").replace(/\D/g, "");
}

function setAdminSession(isLoggedIn) {
  if (isLoggedIn) {
    sessionStorage.setItem(adminSessionKey, "true");
  } else {
    sessionStorage.removeItem(adminSessionKey);
  }

  if (adminPanel) adminPanel.hidden = !isLoggedIn;
  if (adminLogin) adminLogin.hidden = isLoggedIn;
  if (isLoggedIn) renderAdminRequests();
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
  const whatsapp = data.get("whatsapp");
  const city = data.get("cidade");
  const payment = data.get("pagamento");
  const notes = data.get("observacoes");
  const total = cartTotal.textContent;
  const order = {
    id: `YNDRA-${Date.now().toString().slice(-6)}`,
    name,
    whatsapp,
    city,
    payment,
    notes,
    total,
    status: "Recebido",
    date: new Date().toLocaleDateString("pt-BR"),
    items: [...cart.values()].map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    }))
  };

  const orders = loadOrders();
  orders.unshift(order);
  saveOrders(orders);

  formStatus.textContent = `Pedido ${order.id} recebido, ${name}! Total: ${total}. Você pode consultar pelo WhatsApp informado.`;
  formStatus.className = "form-status is-success";
  checkoutForm.reset();
  cart.clear();
  renderCart();
});

improvementForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const data = new FormData(improvementForm);
  const request = {
    id: crypto.randomUUID(),
    name: data.get("nome"),
    email: data.get("email"),
    area: data.get("area"),
    priority: data.get("prioridade"),
    title: data.get("titulo"),
    description: data.get("descricao"),
    status: "Aprovado automaticamente",
    source: "Visitante",
    date: new Date().toLocaleDateString("pt-BR")
  };

  request.summary = createAssistantSummary(request);

  const requests = loadRequests();
  requests.unshift(request);
  saveRequests(requests);

  assistantPreview.textContent = request.summary;
  improvementStatus.textContent = "Melhoria aprovada automaticamente e enviada para a fila do administrador.";
  improvementStatus.className = "form-status is-success";
  improvementForm.reset();
  renderAdminRequests();
});

aiRequestForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const data = new FormData(aiRequestForm);
  const prompt = data.get("prompt");
  const plan = createAiPlan(prompt);
  const request = {
    id: crypto.randomUUID(),
    name: "Administrador",
    email: adminCredentials.email,
    area: plan.area,
    priority: "Alta",
    title: plan.title,
    description: plan.description,
    status: "Aprovado automaticamente",
    source: "IA restrita",
    date: new Date().toLocaleDateString("pt-BR")
  };

  request.summary = createAssistantSummary(request);

  const requests = loadRequests();
  requests.unshift(request);
  saveRequests(requests);

  aiStatus.textContent = "Solicitação criada pela IA e aprovada automaticamente.";
  aiStatus.className = "form-status is-success";
  aiRequestForm.reset();
  renderAdminRequests();
});

adminLogin.addEventListener("submit", (event) => {
  event.preventDefault();

  const data = new FormData(adminLogin);
  const email = data.get("email");
  const password = data.get("senha");

  if (email === adminCredentials.email && password === adminCredentials.password) {
    adminStatus.textContent = "";
    adminLogin.reset();
    setAdminSession(true);
    return;
  }

  adminStatus.textContent = "E-mail ou senha incorretos.";
  adminStatus.className = "form-status is-error";
});

customerLogin.addEventListener("submit", (event) => {
  event.preventDefault();

  const data = new FormData(customerLogin);
  const whatsapp = data.get("whatsapp");
  renderCustomerOrders(whatsapp);
  customerStatus.textContent = "Consulta realizada.";
  customerStatus.className = "form-status is-success";
});

document.addEventListener("click", (event) => {
  const statusButton = event.target.closest("[data-request-status]");
  const removeButton = event.target.closest("[data-request-remove]");

  if (event.target.closest("[data-admin-logout]")) {
    setAdminSession(false);
  }

  if (statusButton) {
    const requests = loadRequests().map((request) =>
      request.id === statusButton.dataset.requestStatus
        ? { ...request, status: statusButton.dataset.status }
        : request
    );
    saveRequests(requests);
    renderAdminRequests();
  }

  if (removeButton) {
    const requests = loadRequests().filter((request) => request.id !== removeButton.dataset.requestRemove);
    saveRequests(requests);
    renderAdminRequests();
  }
});

renderProducts();
renderCart();
setAdminSession(sessionStorage.getItem(adminSessionKey) === "true");

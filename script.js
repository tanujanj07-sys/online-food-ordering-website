const foods = [
  {
    id: 1,
    name: "Margherita Pizza",
    category: "Pizza",
    price: 249,
    emoji: "🍕",
    description: "Classic cheese pizza with tomato and basil."
  },
  {
    id: 2,
    name: "Farmhouse Pizza",
    category: "Pizza",
    price: 329,
    emoji: "🍕",
    description: "Loaded with fresh vegetables and mozzarella."
  },
  {
    id: 3,
    name: "Classic Burger",
    category: "Burger",
    price: 179,
    emoji: "🍔",
    description: "Juicy patty with lettuce, cheese, and sauce."
  },
  {
    id: 4,
    name: "Cheese Burger",
    category: "Burger",
    price: 219,
    emoji: "🍔",
    description: "Delicious burger topped with melted cheese."
  },
  {
    id: 5,
    name: "Paneer Tikka",
    category: "Indian",
    price: 239,
    emoji: "🍢",
    description: "Spicy grilled paneer with Indian spices."
  },
  {
    id: 6,
    name: "Kolhapuri Thali",
    category: "Indian",
    price: 299,
    emoji: "🍛",
    description: "Traditional Maharashtrian meal with delicious curries."
  },
  {
    id: 7,
    name: "Veg Hakka Noodles",
    category: "Chinese",
    price: 189,
    emoji: "🍜",
    description: "Stir-fried noodles with vegetables and sauces."
  },
  {
    id: 8,
    name: "Manchurian",
    category: "Chinese",
    price: 199,
    emoji: "🥡",
    description: "Crispy vegetable balls in spicy Manchurian sauce."
  },
  {
    id: 9,
    name: "Chocolate Cake",
    category: "Dessert",
    price: 149,
    emoji: "🍰",
    description: "Soft and rich chocolate cake slice."
  },
  {
    id: 10,
    name: "Gulab Jamun",
    category: "Dessert",
    price: 99,
    emoji: "🍮",
    description: "Sweet Indian dessert served warm."
  }
];

let cart = JSON.parse(localStorage.getItem("foodieCart")) || [];
let selectedCategory = "All";

const foodGrid = document.getElementById("foodGrid");
const searchInput = document.getElementById("searchInput");
const categories = document.getElementById("categories");
const cartButton = document.getElementById("cartButton");
const cartSidebar = document.getElementById("cartSidebar");
const closeCart = document.getElementById("closeCart");
const overlay = document.getElementById("overlay");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const subtotalElement = document.getElementById("subtotal");
const deliveryFeeElement = document.getElementById("deliveryFee");
const totalElement = document.getElementById("total");
const checkoutButton = document.getElementById("checkoutButton");
const checkoutModal = document.getElementById("checkoutModal");
const closeModal = document.getElementById("closeModal");
const checkoutForm = document.getElementById("checkoutForm");
const notification = document.getElementById("notification");

function formatPrice(price) {
  return `₹${price.toLocaleString("en-IN")}`;
}

function saveCart() {
  localStorage.setItem("foodieCart", JSON.stringify(cart));
}

function renderFoods() {
  const searchText = searchInput.value.toLowerCase().trim();

  const filteredFoods = foods.filter((food) => {
    const matchesCategory =
      selectedCategory === "All" || food.category === selectedCategory;

    const matchesSearch =
      food.name.toLowerCase().includes(searchText) ||
      food.category.toLowerCase().includes(searchText);

    return matchesCategory && matchesSearch;
  });

  if (filteredFoods.length === 0) {
    foodGrid.innerHTML = `
      <p class="no-results">
        No food items found. Try another search.
      </p>
    `;
    return;
  }

  foodGrid.innerHTML = filteredFoods.map((food) => `
    <article class="food-card">
      <div class="food-image">${food.emoji}</div>

      <div class="food-info">
        <span class="food-category">${food.category}</span>
        <h3>${food.name}</h3>
        <p class="food-description">${food.description}</p>

        <div class="food-bottom">
          <span class="price">${formatPrice(food.price)}</span>
          <button class="add-button" data-id="${food.id}">
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  `).join("");
}

function addToCart(foodId) {
  const existingItem = cart.find((item) => item.id === foodId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    const food = foods.find((item) => item.id === foodId);

    cart.push({
      ...food,
      quantity: 1
    });
  }

  saveCart();
  renderCart();
  showNotification("Item added to cart");
}

function increaseQuantity(foodId) {
  const item = cart.find((cartItem) => cartItem.id === foodId);

  if (item) {
    item.quantity += 1;
  }

  saveCart();
  renderCart();
}

function decreaseQuantity(foodId) {
  const item = cart.find((cartItem) => cartItem.id === foodId);

  if (!item) {
    return;
  }

  item.quantity -= 1;

  if (item.quantity <= 0) {
    cart = cart.filter((cartItem) => cartItem.id !== foodId);
  }

  saveCart();
  renderCart();
}

function removeFromCart(foodId) {
  cart = cart.filter((item) => item.id !== foodId);
  saveCart();
  renderCart();
  showNotification("Item removed from cart");
}

function renderCart() {
  if (cart.length === 0) {
    cartItems.innerHTML = `
      <p class="empty-cart">Your cart is empty.</p>
    `;

    cartCount.textContent = "0";
    subtotalElement.textContent = "₹0";
    deliveryFeeElement.textContent = "₹0";
    totalElement.textContent = "₹0";
    return;
  }

  cartItems.innerHTML = cart.map((item) => `
    <div class="cart-item">
      <div class="cart-item-image">${item.emoji}</div>

      <div class="cart-item-details">
        <h4>${item.name}</h4>
        <p class="cart-item-price">${formatPrice(item.price)}</p>

        <div class="quantity-controls">
          <button data-action="decrease" data-id="${item.id}">−</button>
          <span>${item.quantity}</span>
          <button data-action="increase" data-id="${item.id}">+</button>
        </div>
      </div>

      <button class="remove-item" data-action="remove" data-id="${item.id}">
        Remove
      </button>
    </div>
  `).join("");

  const itemCount = cart.reduce((total, item) => {
    return total + item.quantity;
  }, 0);

  const subtotal = cart.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  const deliveryFee = subtotal >= 500 ? 0 : 40;
  const total = subtotal + deliveryFee;

  cartCount.textContent = itemCount;
  subtotalElement.textContent = formatPrice(subtotal);
  deliveryFeeElement.textContent =
    deliveryFee === 0 ? "Free" : formatPrice(deliveryFee);
  totalElement.textContent = formatPrice(total);
}

function openCart() {
  cartSidebar.classList.add("open");
  overlay.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeCartSidebar() {
  cartSidebar.classList.remove("open");
  overlay.classList.remove("show");
  document.body.style.overflow = "";
}

function openCheckoutModal() {
  if (cart.length === 0) {
    showNotification("Please add an item before checkout");
    return;
  }

  checkoutModal.classList.add("show");
}

function closeCheckoutModal() {
  checkoutModal.classList.remove("show");
}

function showNotification(message) {
  notification.textContent = message;
  notification.classList.add("show");

  setTimeout(() => {
    notification.classList.remove("show");
  }, 2500);
}

foodGrid.addEventListener("click", (event) => {
  const addButton = event.target.closest(".add-button");

  if (!addButton) {
    return;
  }

  const foodId = Number(addButton.dataset.id);
  addToCart(foodId);
});

categories.addEventListener("click", (event) => {
  const categoryButton = event.target.closest(".category");

  if (!categoryButton) {
    return;
  }

  document.querySelectorAll(".category").forEach((button) => {
    button.classList.remove("active");
  });

  categoryButton.classList.add("active");
  selectedCategory = categoryButton.dataset.category;
  renderFoods();
});

searchInput.addEventListener("input", renderFoods);

cartItems.addEventListener("click", (event) => {
  const clickedButton = event.target.closest("button");

  if (!clickedButton) {
    return;
  }

  const foodId = Number(clickedButton.dataset.id);
  const action = clickedButton.dataset.action;

  if (action === "increase") {
    increaseQuantity(foodId);
  }

  if (action === "decrease") {
    decreaseQuantity(foodId);
  }

  if (action === "remove") {
    removeFromCart(foodId);
  }
});

cartButton.addEventListener("click", openCart);
closeCart.addEventListener("click", closeCartSidebar);
overlay.addEventListener("click", closeCartSidebar);

checkoutButton.addEventListener("click", openCheckoutModal);
closeModal.addEventListener("click", closeCheckoutModal);

checkoutModal.addEventListener("click", (event) => {
  if (event.target === checkoutModal) {
    closeCheckoutModal();
  }
});

checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const customerName = document.getElementById("customerName").value;
  const paymentMethod = document.getElementById("paymentMethod").value;

  const orderNumber = Math.floor(100000 + Math.random() * 900000);

  alert(
    `Thank you, ${customerName}!\n\n` +
    `Order #${orderNumber} has been placed.\n` +
    `Payment: ${paymentMethod}\n\n` +
    `Your food will be delivered soon.`
  );

  cart = [];
  saveCart();
  renderCart();
  checkoutForm.reset();
  closeCheckoutModal();
  closeCartSidebar();
});

renderFoods();
renderCart();
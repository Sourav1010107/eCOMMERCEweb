// ----- PRODUCT DATA -----
const products = [
    {
        id: 1,
        name: "Leather Deep Box File",
        price: 99.5,
        oldPrice: 199,
        image: "https://via.placeholder.com/500x350"
    },
    {
        id: 2,
        name: "Leather Oval Valet Tray",
        price: 29.0,
        oldPrice: 69,
        image: "https://via.placeholder.com/500x350"
    },
    {
        id: 3,
        name: "Leather Paper Tray",
        price: 49.5,
        oldPrice: 99,
        image: "https://via.placeholder.com/500x350"
    },
    {
        id: 4,
        name: "Leather Buckled Magazine Basket",
        price: 89.0,
        oldPrice: 189,
        image: "https://via.placeholder.com/500x350"
    }
];

// ----- CART HELPERS -----
function loadCart() {
    try {
        return JSON.parse(localStorage.getItem("hexa_cart")) || [];
    } catch {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem("hexa_cart", JSON.stringify(cart));
}

function addToCart(productId, qty = 1) {
    let cart = loadCart();
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.qty += qty;
    } else {
        cart.push({ id: productId, qty });
    }
    saveCart(cart);
    updateCartCount();
}

function removeFromCart(productId) {
    let cart = loadCart().filter(i => i.id !== productId);
    saveCart(cart);
    updateCartCount();
}

function getCartWithDetails() {
    const cart = loadCart();
    return cart.map(item => {
        const p = products.find(prod => prod.id === item.id);
        return {
            ...item,
            name: p?.name,
            price: p?.price,
            image: p?.image
        };
    });
}

function formatPrice(num) {
    return "£" + num.toFixed(2);
}

function updateCartCount() {
    const cart = loadCart();
    const count = cart.reduce((sum, i) => sum + i.qty, 0);
    document.querySelectorAll(".cart-count").forEach(el => {
        el.textContent = count;
    });
}

// ----- RENDER CART PAGE -----
function renderCartPage() {
    const tbody = document.getElementById("cart-items");
    if (!tbody) return;

    const items = getCartWithDetails();
    tbody.innerHTML = "";

    let total = 0;

    if (items.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="5">Your cart is empty.</td></tr>
        `;
    } else {
        items.forEach(item => {
            const subtotal = (item.price || 0) * item.qty;
            total += subtotal;

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${item.name}</td>
                <td>${formatPrice(item.price || 0)}</td>
                <td>${item.qty}</td>
                <td>${formatPrice(subtotal)}</td>
                <td>
                    <button class="cart-remove-btn" data-id="${item.id}">&times;</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    const totalEl = document.getElementById("cart-total");
    if (totalEl) totalEl.textContent = formatPrice(total);

    // remove buttons
    tbody.querySelectorAll(".cart-remove-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = parseInt(btn.getAttribute("data-id"), 10);
            removeFromCart(id);
            renderCartPage();
        });
    });

    // checkout button
    const checkoutBtn = document.getElementById("cart-checkout");
    if (checkoutBtn) {
        checkoutBtn.onclick = () => {
            if (items.length === 0) {
                alert("Your cart is empty.");
                return;
            }
            window.location.href = "checkout.html";
        };
    }
}

// ----- RENDER PRODUCT DETAIL PAGE -----
function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

function renderProductDetailPage() {
    const nameEl = document.getElementById("detail-name");
    if (!nameEl) return; // not on product page

    const idParam = parseInt(getQueryParam("id") || "1", 10);
    const product = products.find(p => p.id === idParam) || products[0];

    const imgEl = document.getElementById("detail-image");
    const priceEl = document.getElementById("detail-price");
    const oldPriceEl = document.getElementById("detail-oldprice");

    nameEl.textContent = product.name;
    if (imgEl) imgEl.src = product.image;
    if (priceEl) priceEl.textContent = formatPrice(product.price);
    if (oldPriceEl) oldPriceEl.textContent = formatPrice(product.oldPrice);

    const addBtn = document.getElementById("detail-add");
    const buyBtn = document.getElementById("detail-buy");

    if (addBtn) {
        addBtn.addEventListener("click", () => {
            addToCart(product.id, 1);
            alert("Added to cart");
        });
    }

    if (buyBtn) {
        buyBtn.addEventListener("click", () => {
            // Add item then go directly to checkout ("cash out")
            addToCart(product.id, 1);
            window.location.href = "checkout.html";
        });
    }
}

// ----- RENDER CHECKOUT PAGE -----
function renderCheckoutPage() {
    const listEl = document.getElementById("checkout-summary-list");
    const totalEl = document.getElementById("checkout-total");
    const formEl = document.getElementById("checkout-form");

    if (!listEl || !totalEl || !formEl) return;

    const items = getCartWithDetails();
    listEl.innerHTML = "";
    let total = 0;

    if (items.length === 0) {
        listEl.innerHTML = "<li>Your cart is empty.</li>";
    } else {
        items.forEach(item => {
            const subtotal = (item.price || 0) * item.qty;
            total += subtotal;
            const li = document.createElement("li");
            li.textContent = `${item.name} × ${item.qty} — ${formatPrice(subtotal)}`;
            listEl.appendChild(li);
        });
    }
    totalEl.textContent = formatPrice(total);

    formEl.addEventListener("submit", e => {
        e.preventDefault();
        if (items.length === 0) {
            alert("Your cart is empty.");
            return;
        }
        alert("Order placed successfully! (Demo cash out)");
        saveCart([]);          // clear cart
        updateCartCount();
        window.location.href = "index.html";
    });
}

// ----- GLOBAL EVENTS -----
document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();

    // Add-to-cart buttons on listing pages
    document.querySelectorAll(".add-to-cart").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = parseInt(btn.getAttribute("data-id"), 10);
            addToCart(id, 1);
            alert("Added to cart");
        });
    });

    renderProductDetailPage();
    renderCartPage();
    renderCheckoutPage();
});

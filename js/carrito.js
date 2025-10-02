// Carrito de compras - Gestión de datos
class ShoppingCart {
    constructor() {
        this.items = this.loadCart();
        this.init();
    }

    // Cargar carrito desde localStorage
    loadCart() {
        const savedCart = localStorage.getItem('shoppingCart');
        return savedCart ? JSON.parse(savedCart) : [];
    }

    // Guardar carrito en localStorage
    saveCart() {
        localStorage.setItem('shoppingCart', JSON.stringify(this.items));
    }

    // Agregar producto al carrito
    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                ...product,
                quantity: 1
            });
        }
        
        this.saveCart();
        this.updateUI();
    }

    // Eliminar producto del carrito
    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.updateUI();
    }

    // Actualizar cantidad de un producto
    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        
        if (item) {
            if (quantity <= 0) {
                this.removeItem(productId);
            } else {
                item.quantity = quantity;
                this.saveCart();
                this.updateUI();
            }
        }
    }

    // Obtener cantidad total de productos
    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    // Calcular subtotal
    getSubtotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Calcular envío (gratis si el subtotal es mayor a 500,000)
    getShipping() {
        const subtotal = this.getSubtotal();
        return subtotal > 500000 ? 0 : 15000;
    }

    // Calcular total
    getTotal() {
        return this.getSubtotal() + this.getShipping();
    }

    // Formatear precio
    formatPrice(price) {
        return `$ ${price.toLocaleString('es-CO')}`;
    }

    // Inicializar el carrito
    init() {
        this.updateUI();
        this.attachEventListeners();
    }

    // Actualizar interfaz
    updateUI() {
        this.updateCartCount();
        this.renderCartItems();
        this.updateSummary();
    }

    // Actualizar contador del carrito en el header
    updateCartCount() {
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            const total = this.getTotalItems();
            cartCount.textContent = total;
            cartCount.style.display = total > 0 ? 'flex' : 'none';
        }
    }

    // Renderizar productos en el carrito
    renderCartItems() {
        const cartItemsContainer = document.getElementById('cartItems');
        const emptyCart = document.getElementById('emptyCart');
        
        if (!cartItemsContainer) return;

        if (this.items.length === 0) {
            cartItemsContainer.style.display = 'none';
            if (emptyCart) emptyCart.style.display = 'block';
            return;
        }

        cartItemsContainer.style.display = 'block';
        if (emptyCart) emptyCart.style.display = 'none';

        cartItemsContainer.innerHTML = this.items.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" class="item-image">
                
                <div class="item-details">
                    <h3 class="item-title">${item.name}</h3>
                    <button class="item-remove" data-id="${item.id}">Eliminar</button>
                    <p class="item-availability">+${item.stock || 10} disponibles</p>
                </div>
                
                <div class="item-actions">
                    <span class="item-price">${this.formatPrice(item.price)}</span>
                    
                    <div class="quantity-control">
                        <button class="quantity-btn decrease" data-id="${item.id}">−</button>
                        <input type="text" class="quantity-input" value="${item.quantity}" data-id="${item.id}" readonly>
                        <button class="quantity-btn increase" data-id="${item.id}">+</button>
                    </div>
                </div>
            </div>
        `).join('');

        this.attachItemEventListeners();
    }

    // Actualizar resumen de compra
    updateSummary() {
        const subtotalEl = document.getElementById('subtotal');
        const shippingEl = document.getElementById('shipping');
        const totalEl = document.getElementById('total');
        const checkoutBtn = document.getElementById('btnCheckout');

        if (subtotalEl) subtotalEl.textContent = this.formatPrice(this.getSubtotal());
        if (shippingEl) shippingEl.textContent = this.formatPrice(this.getShipping());
        if (totalEl) totalEl.textContent = this.formatPrice(this.getTotal());
        
        if (checkoutBtn) {
            checkoutBtn.disabled = this.items.length === 0;
        }
    }

    // Agregar event listeners a los items del carrito
    attachItemEventListeners() {
        // Botones de eliminar
        document.querySelectorAll('.item-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.dataset.id;
                this.removeItem(productId);
            });
        });

        // Botones de disminuir cantidad
        document.querySelectorAll('.quantity-btn.decrease').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.dataset.id;
                const item = this.items.find(item => item.id === productId);
                if (item) {
                    this.updateQuantity(productId, item.quantity - 1);
                }
            });
        });

        // Botones de aumentar cantidad
        document.querySelectorAll('.quantity-btn.increase').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.dataset.id;
                const item = this.items.find(item => item.id === productId);
                if (item) {
                    this.updateQuantity(productId, item.quantity + 1);
                }
            });
        });
    }

    // Agregar event listeners globales
    attachEventListeners() {
        const checkoutBtn = document.getElementById('btnCheckout');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (this.items.length > 0) {
                    alert('¡Gracias por tu compra! Total: ' + this.formatPrice(this.getTotal()));
                    // Aquí puedes redirigir a una página de checkout
                }
            });
        }

        // Icono del carrito en el header
        const cartIcon = document.querySelector('.cart-icon');
        if (cartIcon && !window.location.pathname.includes('carrito.html')) {
            cartIcon.addEventListener('click', () => {
                // Determinar la ruta correcta según la ubicación actual
                if (window.location.pathname.includes('/pages/')) {
                    window.location.href = 'carrito.html';
                } else {
                    window.location.href = 'pages/carrito.html';
                }
            });
        }
    }
}

// Inicializar el carrito cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.cart = new ShoppingCart();
    
    // Configurar botones de agregar al carrito en la página de productos
    setupProductButtons();
});

// Configurar los botones de productos
function setupProductButtons() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    
    // Definir los productos con sus datos
    const products = [
        {
            id: 'cuy-premium-001',
            name: 'Cuyes Premium',
            price: 40000,
            image: '../images/cuyes.jpg',
            stock: 15
        },
        {
            id: 'hortalizas-organicas-002',
            name: 'Hortalizas Orgánicas',
            price: 10000,
            image: '../images/hortalizas.jpg',
            stock: 50
        },
        {
            id: 'abono-organico-003',
            name: 'Abono Orgánico',
            price: 15000,
            image: '../images/abono.jpg',
            stock: 30
        }
    ];
    
    // Agregar event listener a cada botón
    addToCartButtons.forEach((button, index) => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const product = products[index];
            if (product) {
                addToCart(product);
            }
        });
    });
}

// Función global para agregar productos desde otras páginas
function addToCart(product) {
    if (window.cart) {
        window.cart.addItem(product);
        
        // Mostrar notificación
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background-color: #22c55e;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = '✓ Producto agregado al carrito';
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
}

// Estilos para las animaciones de notificación
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
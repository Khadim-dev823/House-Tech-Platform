/* ==========================================================================
   HOUSE TECH DAKAR - SCRIPT OFFICIEL DU SITE
   Gestion du Menu, Recherche en direct & Panier Persistant (localStorage)
   ========================================================================== */

// --------------------------------------------------------------------------
// 1. CHARGEMENT INITIAL DU PANIER DEPUIS LA MÉMOIRE (localStorage)
// --------------------------------------------------------------------------
// Si le client avait déjà des articles en mémoire, on les récupère, sinon panier vide []
let cart = JSON.parse(localStorage.getItem('house_tech_cart')) || [];

document.addEventListener('DOMContentLoaded', function () {

    // Affiche immédiatement le bon nombre d'articles au chargement de n'importe quelle page
    updateCartDisplay();

    // --------------------------------------------------------------------------
    // 2. MENU BURGER MOBILE
    // --------------------------------------------------------------------------
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNavDrawer = document.getElementById('mobileNavDrawer');

    if (mobileMenuBtn && mobileNavDrawer) {
        mobileMenuBtn.addEventListener('click', function () {
            mobileNavDrawer.classList.toggle('active');
        });

        mobileNavDrawer.querySelectorAll('.m-nav-link').forEach(link => {
            link.addEventListener('click', function () {
                mobileNavDrawer.classList.remove('active');
            });
        });
    }

    // --------------------------------------------------------------------------
    // 3. RECHERCHE EN TEMPS RÉEL (DESKTOP & MOBILE)
    // --------------------------------------------------------------------------
    const searchInputs = document.querySelectorAll('#liveSearchInput, .mobile-search-row input');
    const productCards = document.querySelectorAll('.tech-product-col');

    searchInputs.forEach(input => {
        input.addEventListener('input', function () {
            const query = this.value.toLowerCase().trim();

            searchInputs.forEach(otherInput => {
                if (otherInput !== this) otherInput.value = this.value;
            });

            productCards.forEach(col => {
                const title = (col.querySelector('.device-card')?.getAttribute('data-title') || '').toLowerCase();
                const category = (col.getAttribute('data-category') || '').toLowerCase();
                const specs = (col.querySelector('.device-short-specs')?.innerText || '').toLowerCase();

                if (title.includes(query) || category.includes(query) || specs.includes(query)) {
                    col.style.display = 'block';
                } else {
                    col.style.display = 'none';
                }
            });
        });
    });

    // --------------------------------------------------------------------------
    // 4. FILTRES PAR MARQUES
    // --------------------------------------------------------------------------
    const filterPills = document.querySelectorAll('.tech-filter-pill');

    filterPills.forEach(pill => {
        pill.addEventListener('click', function () {
            filterPills.forEach(p => p.classList.remove('active'));
            this.classList.add('active');

            const filter = this.getAttribute('data-filter');

            productCards.forEach(col => {
                const category = col.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    col.style.display = 'block';
                } else {
                    col.style.display = 'none';
                }
            });
        });
    });

    // --------------------------------------------------------------------------
    // 5. TIROIR DU PANIER (OUVERTURE & FERMETURE)
    // --------------------------------------------------------------------------
    const openCartBtn = document.getElementById('openCartBtn');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartDrawer = document.getElementById('cartDrawer');
    const cartBackdrop = document.getElementById('cartBackdrop');

    function openCart() {
        if (cartDrawer && cartBackdrop) {
            cartDrawer.classList.add('open');
            cartBackdrop.classList.add('active');
        }
    }

    function closeCart() {
        if (cartDrawer && cartBackdrop) {
            cartDrawer.classList.remove('open');
            cartBackdrop.classList.remove('active');
        }
    }

    if (openCartBtn) openCartBtn.addEventListener('click', openCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
    if (cartBackdrop) cartBackdrop.addEventListener('click', closeCart);
});

// --------------------------------------------------------------------------
// 6. SÉLECTION DU STOCKAGE (128Go, 256Go...)
// --------------------------------------------------------------------------
function selectStorage(btn) {
    const parent = btn.closest('.storage-options');
    parent.querySelectorAll('.storage-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

// --------------------------------------------------------------------------
// 7. MOTEUR DU PANIER AVEC SAUVEGARDE PERMANENTE (localStorage)
// --------------------------------------------------------------------------
function addToCart(btn) {
    const card = btn.closest('.device-card');
    const title = card.getAttribute('data-title');
    const activeStorageBtn = card.querySelector('.storage-btn.active');
    const storage = activeStorageBtn ? activeStorageBtn.innerText.trim() : 'Standard';

    // 1. Ajouter l'article dans la liste
    cart.push({ title: title, storage: storage });

    // 2. SAUVEGARDER DANS LA MÉMOIRE DU NAVIGATEUR (Ne disparaît plus jamais !)
    localStorage.setItem('house_tech_cart', JSON.stringify(cart));

    // 3. Animation de confirmation sur le bouton
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check me-1"></i> Ajouté !';
    btn.style.backgroundColor = '#10B981';

    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.backgroundColor = '';
    }, 700);

    // 4. Mettre à jour l'affichage
    updateCartDisplay();
}

function removeCartItem(index) {
    cart.splice(index, 1);
    // Met à jour la mémoire
    localStorage.setItem('house_tech_cart', JSON.stringify(cart));
    updateCartDisplay();
}

function clearCart() {
    cart = [];
    // Vide la mémoire
    localStorage.removeItem('house_tech_cart');
    updateCartDisplay();
}

function updateCartDisplay() {
    const counter = document.getElementById('cartCount');
    const list = document.getElementById('cartItemsList');
    const summary = document.getElementById('cartItemCountDisplay');
    const sendBtn = document.getElementById('btnSendWhatsAppOrder');

    // Met à jour le chiffre sur le panier en haut
    if (counter) counter.innerText = cart.length;

    if (!list) return;

    // Si le panier est vide
    if (cart.length === 0) {
        list.innerHTML = `
            <div class="text-center py-5 text-muted">
                <i class="fas fa-bag-shopping fs-1 text-secondary opacity-50 mb-3 d-block"></i>
                <p class="mb-0 fs-7">Votre panier est vide.</p>
                <small class="fs-8">Sélectionnez un appareil pour l'ajouter.</small>
            </div>
        `;
        if (summary) summary.innerText = '0 article';
        if (sendBtn) sendBtn.disabled = true;
        return;
    }

    // Affichage des articles
    let html = '';
    cart.forEach((item, index) => {
        html += `
            <div class="cart-item-row-tech">
                <div class="cart-item-info-tech">
                    <h6>${item.title}</h6>
                    <span>Option : ${item.storage}</span>
                </div>
                <button type="button" class="btn-del-cart-item" onclick="removeCartItem(${index})" title="Supprimer">
                    <i class="fas fa-trash-can"></i>
                </button>
            </div>
        `;
    });

    list.innerHTML = html;
    const articleWord = cart.length > 1 ? 'articles' : 'article';
    if (summary) summary.innerText = `${cart.length} ${articleWord}`;
    if (sendBtn) sendBtn.disabled = false;
}

// --------------------------------------------------------------------------
// 8. COMMANDE SUR WHATSAPP
// --------------------------------------------------------------------------
function sendOrderToWhatsApp() {
    if (cart.length === 0) return;

    const phoneNumber = "22178333321";
    let message = "*Salut House Tech (Keur Mbaye Fall)*,\n";
    message += "Je souhaite commander les appareils suivants vus sur votre site officiel :\n\n";

    cart.forEach((item, index) => {
        message += `${index + 1}. *${item.title}* (Option : ${item.storage})\n`;
    });

    const articleWord = cart.length > 1 ? 'articles' : 'article';
    message += `\n📦 *Total : ${cart.length} ${articleWord} sélectionné(s).*\n`;
    message += "Pouvez-vous me confirmer la disponibilité et les modalités de livraison ? Merci !";

    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
}

// --------------------------------------------------------------------------
// FILTRES DE LA PAGE BOUTIQUE (BOUTIQUE.HTML)
// --------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function () {
    const shopPills = document.querySelectorAll('.shop-pill');

    shopPills.forEach(pill => {
        pill.addEventListener('click', function () {
            shopPills.forEach(p => p.classList.remove('active'));
            this.classList.add('active');

            const filter = this.getAttribute('data-filter');
            const productCols = document.querySelectorAll('.tech-product-col');

            productCols.forEach(col => {
                const category = col.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    col.style.display = 'block';
                } else {
                    col.style.display = 'none';
                }
            });
        });
    });

    // Connexion automatique avec les rayons de l'accueil (ex: boutique.html?cat=iphones)
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('cat');
    if (catParam) {
        const targetPill = document.querySelector(`.shop-pill[data-filter="${catParam}"]`);
        if (targetPill) targetPill.click();
    }
});
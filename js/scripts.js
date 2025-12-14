    let cart = [];

    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const header = document.getElementById('header-char');


    const cartSubtotalEl = document.getElementById('cart-subtotal');
    const cartDiscountEl = document.getElementById('cart-discount');
    const cartTaxEl = document.getElementById('cart-tax');
    const clearCartBtn = document.getElementById('clear-cart-btn');

    const aboutSection = document.getElementById('about-charity');
    const giftGrid = document.getElementById('gift-grid');
    const checkoutSection = document.getElementById('checkout-section');
    const confirmationSection = document.getElementById('confirmation-section');
    const checkoutBtn = document.getElementById('checkout-btn');

    const TAX_RATE = 0.20;
    const DISCOUNT_RATE = 0.10;

    // CARD TOGGLE - Shows product name, description, price, and button only when the card is clicked, hides the details again when the same card is clicked a second time
    // https://youtu.be/R-_TZb0_oJA?si=MOG9yYpZUgohOSah
    document.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', e => {
        if (e.target.classList.contains('add-to-cart') || e.target.closest('.add-to-cart')) return;

        const isOpen = card.classList.contains('active');
        document.querySelectorAll('.product-card.active').forEach(c => c.classList.remove('active'));

        if (!isOpen) card.classList.add('active');
      });
    });

    // ADD TO CART 
    document.querySelectorAll('.add-to-cart').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();

        const item = btn.dataset.item;
        const price = parseFloat(btn.dataset.price);

        const existing = cart.find(i => i.item === item);
        if (existing) existing.qty += 1;
        else cart.push({ item, price, qty: 1 });

        updateCart();
      });
    });

    // Cart item qty change
    cartItems.addEventListener('click', (e) => {
      const plusBtn = e.target.closest('.qty-plus');
      const minusBtn = e.target.closest('.qty-minus');
      const removeBtn = e.target.closest('.remove-item');

      if (!plusBtn && !minusBtn && !removeBtn) return;
      e.stopPropagation();

      const idx = parseInt((plusBtn || minusBtn || removeBtn).dataset.index, 10);
      if (Number.isNaN(idx) || !cart[idx]) return;

      if (plusBtn) cart[idx].qty += 1;
      else if (minusBtn) {
        cart[idx].qty -= 1;
        if (cart[idx].qty <= 0) cart.splice(idx, 1);
      } else if (removeBtn) cart.splice(idx, 1);

      updateCart();
    });

    function updateCart() {
      const totalQty = cart.reduce((s, i) => s + i.qty, 0);
      cartCount.textContent = totalQty;

      cartItems.innerHTML = '';
      let subtotal = 0;

      cart.forEach((i, index) => {
        subtotal += i.price * i.qty;

        const li = document.createElement('li');
        li.className = 'list-group-item';

        li.innerHTML = `
          <div class="d-flex justify-content-between align-items-center">
            <div class="me-2">
              <div class="fw-semibold">${i.item}</div>
              <small class="text-muted">€${i.price.toFixed(2)} each • Line: €${(i.price * i.qty).toFixed(2)}</small>
            </div>

            <div class="d-flex align-items-center gap-2">
              <button class="btn btn-outline-secondary btn-sm qty-minus" data-index="${index}" aria-label="Decrease">−</button>
              <span class="fw-bold">${i.qty}</span>
              <button class="btn btn-outline-secondary btn-sm qty-plus" data-index="${index}" aria-label="Increase">+</button>
              <button class="btn btn-outline-danger btn-sm remove-item" data-index="${index}" aria-label="Remove">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        `;
        cartItems.appendChild(li);
      });

      const discount = (totalQty >= 3) ? subtotal * DISCOUNT_RATE : 0;
      const taxable = subtotal - discount;
      const tax = taxable * TAX_RATE;
      const total = taxable + tax;

      cartSubtotalEl.textContent = `€${subtotal.toFixed(2)}`;
      cartDiscountEl.textContent = `-€${discount.toFixed(2)}`;
      cartTaxEl.textContent = `€${tax.toFixed(2)}`;
      cartTotal.textContent = `€${total.toFixed(2)}`;
    }

    clearCartBtn.addEventListener('click', () => {
      cart = [];
      updateCart();
    });

    // Checkout btn
    checkoutBtn.addEventListener('click', () => {
      const totalQty = cart.reduce((s, i) => s + i.qty, 0);
      if (totalQty === 0) {
        alert("Your cart is empty.");
        return;
      }

      const cartModal = bootstrap.Modal.getInstance(document.getElementById('cartModal'));
      if (cartModal) cartModal.hide();

      giftGrid.classList.add('d-none');
      checkoutSection.classList.remove('d-none');
      header.classList.add('d-none');
      aboutSection.classList.add('d-none');
    });

    //payment helpers
    const cardNumberEl = document.getElementById('cardNumber');
    const expiryEl = document.getElementById('expiry');
    const cvvEl = document.getElementById('cvv');
    const phoneEl = document.getElementById('phone');
    const zipEl = document.getElementById('zip');

    function onlyDigits(value) {
      return value.replace(/\D/g, '');
    }

    // Card number: digits only
    cardNumberEl.addEventListener('input', () => {
      const digits = onlyDigits(cardNumberEl.value).slice(0, 16);
      const groups = digits.match(/.{1,4}/g) || [];
      cardNumberEl.value = groups.join(' ');
    });

    // Expiry: digits only, formatted MM/YY
    expiryEl.addEventListener('input', () => {
      const digits = onlyDigits(expiryEl.value).slice(0, 4); // MMYY
      if (digits.length <= 2) expiryEl.value = digits;
      else expiryEl.value = digits.slice(0, 2) + '/' + digits.slice(2);
    });

    // CVV: digits only, max 4
    cvvEl.addEventListener('input', () => {
      cvvEl.value = onlyDigits(cvvEl.value).slice(0, 4);
    });

    // Phone, ZIP: digits only
    phoneEl.addEventListener('input', () => { phoneEl.value = onlyDigits(phoneEl.value).slice(0, 15); });
    zipEl.addEventListener('input', () => { zipEl.value = onlyDigits(zipEl.value).slice(0, 6); });

    function isValidExpiry(mmYY) {
      if (!/^\d{2}\/\d{2}$/.test(mmYY)) return false;
      const [mmStr, yyStr] = mmYY.split('/');
      const mm = parseInt(mmStr, 10);
      const yy = parseInt(yyStr, 10);
      if (mm < 1 || mm > 12) return false;

      // Interpret YY as 2000+YY
      const now = new Date();
      const currentYY = now.getFullYear() % 100;
      const currentMM = now.getMonth() + 1;

     
      if (yy < currentYY) return false;
      if (yy === currentYY && mm < currentMM) return false;

      return true;
    }

    // Form submit   
    // https://youtu.be/In0nB0ABaUk?si=p1p4uwaXGQidtTOM = form validation video used as reference
    document.getElementById('checkout-form').addEventListener('submit', e => {
      e.preventDefault();

      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const phone = phoneEl.value.trim();
      const zip = zipEl.value.trim();

      const cardNumber = onlyDigits(cardNumberEl.value);
      const expiry = expiryEl.value.trim();
      const cvv = cvvEl.value.trim();

      if (!/^[A-Za-z\s]+$/.test(name)) return alert("Name invalid");
      if (!/^\S+@\S+\.\S+$/.test(email)) return alert("Email invalid");
      if (!/^\d+$/.test(phone) || phone.length < 7 || phone.length > 15) return alert("Phone invalid (7–15 digits), please dont use spaces");
      if (!/^\d{1,6}$/.test(zip)) return alert("ZIP invalid (max 6 digits)");

      
      if (!/^\d{16}$/.test(cardNumber)) return alert("Card number must be 16 digits.");
      if (!isValidExpiry(expiry)) return alert("Expiry must be valid (MM/YY) and not in the past.");
      if (!/^\d{3,4}$/.test(cvv)) return alert("CVV must be 3 or 4 digits.");

      const totalQty = cart.reduce((s, i) => s + i.qty, 0);

      let subtotal = cart.reduce((s, i) => s + (i.price * i.qty), 0);
      let discount = totalQty >= 3 ? subtotal * DISCOUNT_RATE : 0;
      let tax = (subtotal - discount) * TAX_RATE;
      let final = subtotal - discount + tax;

      checkoutSection.classList.add('d-none');
      confirmationSection.classList.remove('d-none');

      const maskedCard = "**** **** **** " + cardNumber.slice(-4);

      confirmationSection.innerHTML = `
<div class="card shadow-sm">
  <div class="card-header header-soft text-white">
    <h4 class="mb-0">Donation Confirmed</h4>
  </div>

  <div class="card-body">
    <p class="text-muted mb-4">
      Thank you for supporting <strong>WarmHerz Österreich</strong>.
      Here is your donation summary:
    </p>

    <div class="row mb-3">
      <div class="col-md-6">
        <div class="border rounded p-3 bg-light">
          <h6 class="mb-2">Donor Info</h6>
          <div><strong>Name:</strong> ${name}</div>
          <div><strong>Email:</strong> ${email}</div>
          <div><strong>Phone:</strong> ${phone}</div>
          <div><strong>ZIP:</strong> ${zip}</div>
        </div>
      </div>
      <div class="col-md-6 mt-3 mt-md-0">
        <div class="border rounded p-3 bg-light">
          <h6 class="mb-2">Payment</h6>
          <div><strong>Card:</strong> ${maskedCard}</div>
          <div><strong>Expiry:</strong> ${expiry}</div>
        </div>
      </div>
    </div>

    <div class="table-responsive">
      <table class="table table-bordered align-middle">
        <thead class="table-light">
          <tr>
            <th>Gift</th>
            <th class="text-center">Qty</th>
            <th class="text-end">Price</th>
            <th class="text-end">Line Total</th>
          </tr>
        </thead>
        <tbody>
          ${cart.map(i => `
            <tr>
              <td>${i.item}</td>
              <td class="text-center">${i.qty}</td>
              <td class="text-end">€${i.price.toFixed(2)}</td>
              <td class="text-end">€${(i.price * i.qty).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="row justify-content-end">
      <div class="col-md-6">
        <ul class="list-group">
          <li class="list-group-item d-flex justify-content-between">
            <span>Subtotal</span>
            <span>€${subtotal.toFixed(2)}</span>
          </li>
          <li class="list-group-item d-flex justify-content-between">
            <span>Discount (10% for 3+ items)</span>
            <span class="text-danger">-€${discount.toFixed(2)}</span>
          </li>
          <li class="list-group-item d-flex justify-content-between">
            <span>Tax / Fees (20%)</span>
            <span>€${tax.toFixed(2)}</span>
          </li>
          <li class="list-group-item d-flex justify-content-between fw-bold fs-5">
            <span>Total</span>
            <span>€${final.toFixed(2)}</span>
          </li>
        </ul>
      </div>
    </div>

    <div class="d-flex gap-2 mt-4">
      <a href="#gift-grid" id="back-to-gifts" class="btn btn-outline-secondary">
        Back to Gifts
      </a>
      <button class="btn btn-soft" onclick="window.print()">
        Print Receipt
      </button>
    </div>
  </div>
</div>
`;

      document.getElementById('back-to-gifts').addEventListener('click', () => {
        confirmationSection.classList.add('d-none');
        header.classList.remove('d-none');
        giftGrid.classList.remove('d-none');
        aboutSection.classList.remove('d-none');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });

      cart = [];
      updateCart();
      document.getElementById('checkout-form').reset();
    });

    updateCart();
  

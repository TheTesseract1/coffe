// место где все данные хранятся
// это объект. Ключ — id товара, значение — объект с name, price, quantity.
// пример после кликов: { "1": {name:"Капучино", price:220, quantity:2} }
// 1. ЗАГРУЖАЕМ КОРЗИНУ ИЗ LOCALSTORAGE
const cart = JSON.parse(localStorage.getItem('cart')) || {};

// перечень элементов на странице
const cartItemsEl = document.getElementById('cart-items');   // блок со списком
const cartTotalEl = document.getElementById('cart-total');   // сумма
const cartCountEl = document.getElementById('cart-count');   // счётчик в шапке
const buyButtons = document.querySelectorAll('.buy-btn');   // все кнопки "Купить"
const clearBtn = document.getElementById('clear-cart');      // кнопка очистки

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// ДЛЯ КАЖДОЙ КАРТОЧКИ: создаём счётчик и оживляем его
buyButtons.forEach(function (buyBtn) {
  // читаем данные из кнопки
  const id    = buyBtn.dataset.id;
  const name  = buyBtn.dataset.name;
  const price = Number(buyBtn.dataset.price);

  // Создаём счётчик: <div class="counter"> [−] 0 [+] </div>
  const counter = document.createElement('div');
  counter.className = 'counter';
  counter.innerHTML =
    '<button class="counter-btn minus" type="button">−</button>' +
    '<span class="counter-value">0</span>' +
    '<button class="counter-btn plus" type="button">+</button>';

  // Вставляем счётчик в карточку — сразу после кнопки "Купить"
  buyBtn.parentNode.appendChild(counter);

  // Находим элементы внутри счётчика
  const valueEl = counter.querySelector('.counter-value');
  const plusBtn = counter.querySelector('.plus');
  const minusBtn = counter.querySelector('.minus');

  // Функция: решить — показывать кнопку "Купить" или счётчик
  function updateCard() {
    const item = cart[id]; // товар из корзины (или undefined)
    if (item && item.quantity > 0) {
      // товар есть — скрываем "Купить", показываем счётчик
      buyBtn.style.display = 'none';
      counter.classList.add('active');
      valueEl.textContent = item.quantity;
    } else {
      // товара нет — показываем "Купить", скрываем счётчик
      buyBtn.style.display = '';
      counter.classList.remove('active');
      valueEl.textContent = '0';
    }
  }

  // Клик по "Купить" — добавляем в корзину и обновляем карточку
  buyBtn.addEventListener('click', function () {
    addToCart(id, name, price);
    updateCard();
  });

  // Клик по "+" — то же самое
  plusBtn.addEventListener('click', function () {
    addToCart(id, name, price);
    updateCard();
  });

  // Клик по "−" — убираем одну штуку
  minusBtn.addEventListener('click', function () {
    removeFromCart(id);
    updateCard();
  });

  // При загрузке страницы — сразу показываем актуальное состояние
  // (если товар уже в корзине — покажется счётчик, а не кнопка)
  updateCard();
});

// УБРАТЬ ОДНУ ШТУКУ ТОВАРА ИЗ КОРЗИНЫ
function removeFromCart(id) {
  // если товара нет — выходим
  if (!cart[id]) return;

  // уменьшаем количество на 1
  cart[id].quantity = cart[id].quantity - 1;

  // если стало 0 или меньше — удаляем запись целиком
  if (cart[id].quantity <= 0) {
    delete cart[id];
  }

  // сохраняем и обновляем всё, что нужно
  saveCart();
  updateCount();
  renderCart();
}

// добавление в корзину
function addToCart(id, name, price) {
  if (cart[id]) {
    // если товар уже в корзине увеличиваем количество
    cart[id].quantity = cart[id].quantity + 1;
  } else {
    // если товара ещё нет создаём запись
    cart[id] = {
      name: name,
      price: price,
      quantity: 1
    };
  }

  saveCart();       // сохраняем в localStorage
  updateCount();    // обновляем счётчик в шапке (работает везде)
  renderCart();     // рисуем список (только если блок есть)
}

// ОБНОВЛЕНИЕ СЧЁТЧИКА В ШАПКЕ
function updateCount() {
  let count = 0;
  for (const id in cart) {
    count = count + cart[id].quantity;
  }
  // Обновляем, только если элемент есть на странице
  if (cartCountEl) {
    cartCountEl.textContent = count;
  }
}



// 7. ОТРИСОВКА КОРЗИНЫ (только на cart.html)
function renderCart() {
  // Если блока корзины нет на странице — просто выходим
  if (!cartItemsEl) return;

  cartItemsEl.innerHTML = '';

  let total = 0;
  let isEmpty = true;

  for (const id in cart) {
    isEmpty = false;
    const item = cart[id];
    const subtotal = item.price * item.quantity;
    total = total + subtotal;

    const row = document.createElement('div');
    row.className = 'cart-row';
    row.innerHTML =
      '<span class="cart-row-name">' + item.name + ' × ' + item.quantity + '</span>' +
      '<span class="cart-row-price">' + subtotal + ' ₽</span>';

    cartItemsEl.appendChild(row);
  }

  if (isEmpty) {
    cartItemsEl.innerHTML = '<p class="cart-empty">Корзина пуста</p>';
  }

  if (cartTotalEl) {
    cartTotalEl.textContent = total;
  }
}

// ОЧИСТКА КОРЗИНЫ (только на cart.html)
if (clearBtn) {
  clearBtn.addEventListener('click', function () {
    for (const id in cart) {
      delete cart[id];
    }
    saveCart();
    updateCount();
    renderCart();
  });
}

// ПРИ ЗАГРУЗКЕ ЛЮБОЙ СТРАНИЦЫ
updateCount();   // показываем счётчик
renderCart();    // рисуем корзину (если блок есть)

//сделать фильтр + избранное
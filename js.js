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

// чтение каждой купить кнопки
buyButtons.forEach(function (button) {
  button.addEventListener('click', function () {
    // читаем data-атрибуты кнопки
    const id = button.dataset.id;
    const name = button.dataset.name;
    const price = Number(button.dataset.price); // превращаем строку в число

    addToCart(id, name, price);
  });
});

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
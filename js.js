const products = [
  { id: '1', name: 'Коффи для трудяг',   desc: 'Классика среди кото-рабов',    price: 220000, img: 'coffeCat.jpg',   category: 'hot' },
  { id: '2', name: 'Коффи для богатеев', desc: 'Все для крутышей',             price: 250000, img: 'akyla.jpg',      category: 'hot' },
  { id: '3', name: 'Бомбо-эспрессо',     desc: 'Крепкий и бодрящий',           price: 180000, img: 'doomCat.jpg',    category: 'hot' },
  { id: '4', name: 'Рppаф c пиписинкой', desc: 'Все для утреннего несванения', price: 280000, img: 'robita.jpg',     category: 'cold' },
  { id: '5', name: 'Американо школьный', desc: 'Вкус детства',                 price: 190000, img: 'naCat.jpg',      category: 'cold' },
  { id: '6', name: 'Тот самый кофе',     desc: 'Кофе в украденном стакане',    price: 270000, img: 'starCoffe.jpg',  category: 'special' },
];

// место где все данные хранятся
// это объект. Ключ — id товара, значение — объект с name, price, quantity.
// пример после кликов: { "1": {name:"Капучино", price:220, quantity:2} }
// 1. ЗАГРУЖАЕМ КОРЗИНУ ИЗ LOCALSTORAGE
const cart = JSON.parse(localStorage.getItem('cart')) || {};
// ИЗБРАННОЕ — массив id товаров
const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// перечень элементов на странице
const cartItemsEl = document.getElementById('cart-items');   // блок со списком
const cartTotalEl = document.getElementById('cart-total');   // сумма
const cartCountEl = document.getElementById('cart-count');   // счётчик в шапке
const buyButtons = document.querySelectorAll('.buy-btn');   // все кнопки "Купить"
const clearBtn = document.getElementById('clear-cart');      // кнопка очистки
const productsGrid = document.querySelector('.products-grid');
const searchInput = document.getElementById('search-input');
const searchClear = document.getElementById('search-clear');

// 4. КРАСИВЫЙ ФОРМАТ ЦЕНЫ (с пробелами)
function formatPrice(n) {
  return n.toLocaleString('ru-RU'); // 220000 → "220 000"
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

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



// 7. ГЕНЕРАЦИЯ КАРТОЧЕК С ФИЛЬТРОМ
function renderProducts() {
  if (!productsGrid) return;

  // Читаем активный фильтр
  const categoryInput = document.querySelector('input[name="category"]:checked');
  const category = categoryInput ? categoryInput.value : 'all';

  const priceMin = Number(document.getElementById('price-min').value) || 0;
  const priceMax = Number(document.getElementById('price-max').value) || Infinity;

  // Читаем поисковый запрос
  const searchText = searchInput ? searchInput.value.trim().toLowerCase() : '';

  productsGrid.innerHTML = '';

  // Фильтруем по категории, цене И поиску
  const list = products.filter(function (p) {
    const byCategory = category === 'all' || p.category === category;
    const byPrice = p.price >= priceMin && p.price <= priceMax;
    const bySearch = p.name.toLowerCase().includes(searchText);
    return byCategory && byPrice && bySearch;
  });

  // Если ничего не найдено
  if (list.length === 0) {
    productsGrid.innerHTML = '<p class="no-results">Ничего не найдено</p>';
    return;
  }

  list.forEach(function (p) {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.innerHTML =
    '<button class="fav-btn" type="button" data-id="' + p.id + '">♡</button>' +
    '<img src="' + p.img + '" alt="' + p.name + '" class="product-img">' +
    '<div class="product-body">' +
      '<h2 class="product-title">' + p.name + '</h2>' +
      '<p class="product-desc">' + p.desc + '</p>' +
      '<p class="product-price">' + formatPrice(p.price) + ' ₽</p>' +
      '<button class="buy-btn" data-id="' + p.id + '" data-name="' + p.name + '" data-price="' + p.price + '">Купить</button>' +
    '</div>';

  // ---- Оживляем сердечко ----
  const favBtn = card.querySelector('.fav-btn');

  function updateHeart() {
    if (isFavorite(p.id)) {
      favBtn.classList.add('active');
      favBtn.textContent = '♥';
    } else {
      favBtn.classList.remove('active');
      favBtn.textContent = '♡';
    }
  }

  favBtn.addEventListener('click', function (e) {
    e.stopPropagation();   // чтобы клик не задел карточку
    toggleFavorite(p.id);
    updateHeart();
  });

  updateHeart();   // сразу показываем актуальное состояние

  productsGrid.appendChild(card);
});

  attachBuyButtons();
}

// 8. ОЖИВЛЯЕМ КНОПКИ "КУПИТЬ" + СЧЁТЧИКИ
// ==========================================
function attachBuyButtons() {
  const buyButtons = document.querySelectorAll('.buy-btn');

  buyButtons.forEach(function (buyBtn) {
    const id    = buyBtn.dataset.id;
    const name  = buyBtn.dataset.name;
    const price = Number(buyBtn.dataset.price);

    // Создаём счётчик [−] 0 [+]
    const counter = document.createElement('div');
    counter.className = 'counter';
    counter.innerHTML =
      '<button class="counter-btn minus" type="button">−</button>' +
      '<span class="counter-value">0</span>' +
      '<button class="counter-btn plus" type="button">+</button>';
    buyBtn.parentNode.appendChild(counter);

    const valueEl  = counter.querySelector('.counter-value');
    const plusBtn  = counter.querySelector('.plus');
    const minusBtn = counter.querySelector('.minus');

    function updateCard() {
      const item = cart[id];
      if (item && item.quantity > 0) {
        buyBtn.style.display = 'none';
        counter.classList.add('active');
        valueEl.textContent = item.quantity;
      } else {
        buyBtn.style.display = '';
        counter.classList.remove('active');
        valueEl.textContent = '0';
      }
    }

    buyBtn.addEventListener('click',  function () { addToCart(id, name, price); updateCard(); });
    plusBtn.addEventListener('click', function () { addToCart(id, name, price); updateCard(); });
    minusBtn.addEventListener('click', function () { removeFromCart(id); updateCard(); });

    updateCard();
  });
}

// ==========================================
// 9. МОДАЛЬНОЕ ОКНО ФИЛЬТРА
// ==========================================
const filterModal   = document.getElementById('filter-modal');
const openFilterBtn = document.getElementById('open-filters');
const closeFilterBtn = document.getElementById('close-filters');
const applyFilterBtn = document.getElementById('apply-filters');
const resetFilterBtn = document.getElementById('reset-filters');

// Открыть окно
if (openFilterBtn) {
  openFilterBtn.addEventListener('click', function () {
    filterModal.classList.add('open');
  });
}

// Закрыть окно (крестик)
if (closeFilterBtn) {
  closeFilterBtn.addEventListener('click', function () {
    filterModal.classList.remove('open');
  });
}

// Закрыть при клике на тёмный фон (не на само окно)
if (filterModal) {
  filterModal.addEventListener('click', function (e) {
    if (e.target === filterModal) {
      filterModal.classList.remove('open');
    }
  });
}

// Применить фильтр
if (applyFilterBtn) {
  applyFilterBtn.addEventListener('click', function () {
    renderProducts();
    filterModal.classList.remove('open');
  });
}

// Сбросить фильтр
if (resetFilterBtn) {
  resetFilterBtn.addEventListener('click', function () {
    // Выбираем "Все"
    const allRadio = document.querySelector('input[name="category"][value="all"]');
    if (allRadio) allRadio.checked = true;
    // Очищаем цены
    document.getElementById('price-min').value = '';
    document.getElementById('price-max').value = '';
    renderProducts();
  });
}

// Закрыть окно по клавише Esc
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && filterModal) {
    filterModal.classList.remove('open');
  }
});

// Проверка: товар в избранном?
function isFavorite(id) {
  return favorites.includes(id);
}

// Переключить: добавить/убрать
function toggleFavorite(id) {
  const index = favorites.indexOf(id);
  if (index === -1) {
    favorites.push(id);       // не в избранном → добавляем
  } else {
    favorites.splice(index, 1); // в избранном → убираем
  }
  localStorage.setItem('favorites', JSON.stringify(favorites));
}

// ==========================================
// 10. ПОИСК ПО НАЗВАНИЮ
// ==========================================
if (searchInput) {
  // Показываем/скрываем кнопку очистки
  function updateClearButton() {
    if (searchClear) {
      if (searchInput.value.length > 0) {
        searchClear.classList.add('visible');
      } else {
        searchClear.classList.remove('visible');
      }
    }
  }

  // При вводе — перерисовываем карточки
  searchInput.addEventListener('input', function () {
    updateClearButton();
    renderProducts();
  });

  // Кнопка очистки
  if (searchClear) {
    searchClear.addEventListener('click', function () {
      searchInput.value = '';
      updateClearButton();
      renderProducts();
      searchInput.focus();   // курсор обратно в поле
    });
  }

  // При загрузке — сразу проверяем состояние
  updateClearButton();
}

// ПРИ ЗАГРУЗКЕ ЛЮБОЙ СТРАНИЦЫ
updateCount();   // показываем счётчик
renderCart();    // рисуем корзину (если блок есть)
renderProducts();   // ← без аргумента, теперь читает фильтр из DOM

//сделать поиск и перенести все данные в бд
//админка, создание карточек, покупка, перенести все данные, заказы, статус заказа
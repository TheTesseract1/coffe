// место где все данные хранятся
// это объект. Ключ — id товара, значение — объект с name, price, quantity.
// пример после кликов: { "1": {name:"Капучино", price:220, quantity:2} }
const cart = {};

// перечень элементов на странице
const cartItemsEl = document.getElementById('cart-items');   // блок со списком
const cartTotalEl = document.getElementById('cart-total');   // сумма
const cartCountEl = document.getElementById('cart-count');   // счётчик в шапке
const buyButtons = document.querySelectorAll('.buy-btn');   // все кнопки "Купить"
const clearBtn = document.getElementById('clear-cart');      // кнопка очистки

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

  renderCart(); // перерисовываем корзину
}

// сортировка корзины
function renderCart() {
  // очищаем блок перед перерисовкой
  cartItemsEl.innerHTML = '';

  let total = 0;       // общая сумма
  let count = 0;       // общее количество товаров
  let isEmpty = true;  // флаг «корзина пуста»

  // перебираем все товары в корзине
  // for...in проходит по ключам объекта
  for (const id in cart) {
    isEmpty = false; //меняем флаг на корзина не пуста

    const item = cart[id]; //достаёт товар из коробки cart по ключу id. Кладёт в переменную item
    const subtotal = item.price * item.quantity; // стоимость позиции
    total = total + subtotal;
    count = count + item.quantity; // тек кол-во + общий счетчик

    // создаём строчку для корзины
    const row = document.createElement('div');
    row.className = 'cart-row';// помечаем div как cart-row, что бы css знал как его оформить
    row.innerHTML = //Заполни этот div вот таким HTML-содержимым
      '<span class="cart-row-name">' + item.name + ' × ' + item.quantity + '</span>' +
      '<span class="cart-row-price">' + subtotal + ' ₽</span>';

    cartItemsEl.appendChild(row); //Возьми готовый div и вставь его внутрь блока корзины на странице
    //cartItemsEl — это тот самый блок в HTML, куда должны попасть все строки. После appendChild строка внутри
  }

  // если корзина пуста показываем "корзинка пуста"
  if (isEmpty) {
    cartItemsEl.innerHTML = '<p class="cart-empty">Корзина пуста</p>'; // то что рисуем
  }

  // обновляем сумму и счётчик
  cartTotalEl.textContent = total;
  cartCountEl.textContent = count;
}

// очистить корзину
clearBtn.addEventListener('click', function () {
  // Удаляем все ключи из объекта cart
  for (const id in cart) {
    delete cart[id];
  }
  renderCart();
});
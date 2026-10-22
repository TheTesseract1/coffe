// Находим элементы на странице
const loginBtn = document.getElementById('login-btn');
const loginInput = document.getElementById('login-username');
const passwordInput = document.getElementById('login-password');
const errorMsg = document.getElementById('login-error');

// Если мы на странице логина (кнопка существует)
if (loginBtn) {
  loginBtn.addEventListener('click', async function () {
    const login = loginInput.value.trim();
    const password = passwordInput.value;

    // Простая проверка на пустые поля
    if (!login || !password) {
      errorMsg.textContent = "Заполните все поля!";
      errorMsg.style.display = 'block';
      return;
    }

    try {
      // Отправляем запрос на сервер
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: login, password: password })
      });

      const data = await response.json();

      if (response.ok) {
        // Успех! Сервер прислал токен и роль
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('username', data.login);

        // Перекидываем пользователя на главную
        window.location.href = 'main.html';
      } else {
        // Ошибка (неверный пароль)
        errorMsg.textContent = data.error || "Ошибка входа";
        errorMsg.style.display = 'block';
      }
    } catch (error) {
      console.error(error);
      errorMsg.textContent = "Сервер не отвечает. Проверь, запущен ли Node.js";
      errorMsg.style.display = 'block';
    }
  });
}
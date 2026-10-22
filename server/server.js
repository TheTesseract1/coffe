const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json()); 

const SECRET_KEY = 'super_secret_coffee_cat_key';

// НАСТРОЙКИ БАЗЫ ДАННЫХ
const dbConfig = {
  host: '31.76.12.103',
  user: 'isp-41_kaydash_av', 
  password: 'isp-41_kaydash_av', 
  database: 'isp-41_kaydash_av_coffe_shop_db',
  port: '3306'
};

// 1. ПОЛУЧЕНИЕ ТОВАРОВ
app.get('/api/products', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM products');
    await connection.end();
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка базы данных' });
  }
});

// 2. ВХОД (авторизация)
app.post('/api/login', async (req, res) => {
  const { login, password } = req.body;
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [users] = await connection.execute('SELECT * FROM users WHERE login = ?', [login]);
    await connection.end();

    if (users.length === 0) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }

    const token = jwt.sign(
      { id: user.id, login: user.login, role: user.role }, 
      SECRET_KEY, 
      { expiresIn: '24h' }
    );

    res.json({ token, role: user.role, login: user.login });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// 3. СОЗДАНИЕ ЗАКАЗА
app.post('/api/orders', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Необходима авторизация' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const userId = decoded.id;
    const { items, totalPrice } = req.body;

    const connection = await mysql.createConnection(dbConfig);
    
    const [orderResult] = await connection.execute(
      'INSERT INTO orders (user_id, total_price) VALUES (?, ?)',
      [userId, totalPrice]
    );
    const orderId = orderResult.insertId;

    for (let item of items) {
      await connection.execute(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.id, item.quantity, item.price]
      );
    }

    await connection.end();
    res.json({ message: 'Заказ успешно оформлен', orderId });
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: 'Ошибка оформления заказа' });
  }
});

// 4. ИСТОРИЯ ЗАКАЗОВ
app.get('/api/my-orders', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Необходима авторизация' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const connection = await mysql.createConnection(dbConfig);
    const [orders] = await connection.execute(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [decoded.id]
    );
    await connection.end();
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: 'Ошибка токена' });
  }
});

// ЗАПУСК
app.listen(port, () => {
  console.log(`Сервер запущен`);
});

// ==========================================
// 5. ДОБАВЛЕНИЕ НОВОГО ТОВАРА (Только для админа!)
// ==========================================
app.post('/api/products', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Нет доступа' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    
    // ПРОВЕРКА: Если это не админ — выгоняем!
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Только администратор может добавлять товары' });
    }

    const { name, description, price, img, category } = req.body;
    const connection = await mysql.createConnection(dbConfig);
    
    await connection.execute(
      'INSERT INTO products (name, description, price, img, category) VALUES (?, ?, ?, ?, ?)',
      [name, description, price, img, category]
    );
    
    await connection.end();
    res.json({ message: 'Товар успешно добавлен!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при добавлении товара' });
  }
}); 

//http://localhost:3000/api/products


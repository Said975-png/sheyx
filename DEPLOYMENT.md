# 🚀 Полное руководство по развертыванию на Netlify

## 📋 Пошаговая инструкция

### 1. Подготовка репозитория

Убедитесь что весь код загружен в GitHub:

```bash
git add .
git commit -m "Deploy configuration ready"
git push origin main
```

### 2. Создание сайта на Netlify

1. **Зайдите на [netlify.com](https://netlify.com)**
2. **Нажмите "Add new site" → "Import from Git"**
3. **Выберите GitHub и найдите ваш репозиторий**
4. **Настройки сборки будут автоматически определены из `netlify.toml`:**
   - Build command: `npm run build:client`
   - Publish directory: `dist/spa`
   - Functions directory: `netlify/functions`

### 3. Настройка переменных окр��жения

В админ-панели Netlify:

1. **Site Settings → Environment variables**
2. **Добавьте обязательные переменные:**

   ```
   GROQ_API_KEY = your_groq_api_key_here
   JWT_SECRET = your-secret-key-for-jwt-tokens-make-it-long-and-random
   NODE_ENV = production
   ```

3. **Опциональные переменные д��я email функций:**
   ```
   SMTP_HOST = smtp.gmail.com
   SMTP_PORT = 587
   SMTP_USER = your-email@gmail.com
   SMTP_PASS = your-app-password
   ```

### 4. Первый деплой

1. **Нажмите "Deploy site"**
2. **Дождитесь завершения сборки (3-5 минут)**
3. **Проверьте логи деплоя на наличие ошибок**

## 🔧 Структура проекта после деплоя

```
Netlify сайт:
├── Static files (из dist/spa/)
│   ├── index.html (SPA entry point)
│   ├── assets/ (JS, CSS, изображения)
│   └── ...
└── Serverless functions:
    └── /.netlify/functions/api (обрабатывает /api/*)
```

## 🛣️ Маршрутизация

### API Endpoints (через Netlify Functions):

- `GET /api/ping` - Проверка работы API
- `POST /api/groq-chat` - Чат с ИИ Пятницей
- `GET /api/demo` - Демо endpoint
- `POST /api/orders` - Отправка заказов
- `POST /api/upload` - Загрузка файлов
- `POST /api/contracts` - Создание контрактов
- `GET /api/contracts` - Получение контрактов
- `POST /api/bookings` - Бронирования
- И другие...

### SPA Routes (клиентская маршрутизация):

- `/` - Главная страница
- `/chat` - Чат с Пя��ницей
- `/admin` - Панель администратора
- `/login` - Авторизация
- `/profile` - Профиль пользователя
- Все остальные маршруты

## ✅ Проверка работоспособности

После успешного деплоя проверьте:

1. **Откройте ваш сайт** (`https://your-site-name.netlify.app`)
2. **Проверьте API:** `/api/ping` должен вернуть JSON
3. **Проверьте чат:** Зайдите в `/chat` и отправьте сообщение
4. **Проверьте SPA маршруты:** `/admin`, `/profile` должны работать
5. **Проверьте 404:** несуществующие URL должны показать NotFound

## 🐛 Решение проблем

### Чат не работает

- ✅ Проверьте переменную `GROQ_API_KEY` в настройках
- ✅ Проверьте логи функций в Netlify Dashboard
- ✅ Убедитесь что API ключ активен

### Страницы возвращают 404

- ✅ Убедитесь что в `netlify.toml` есть SPA fallback
- ✅ Проверьте что `publish = "dist/spa"` указан правильно

### Функции не работают

- ✅ Проверьте что папка `netlify/functions` указана в настройках
- ✅ Убедитесь что все зависимости указаны в `external_node_modules`
- ✅ Проверьте логи сборки на ошибки

### API возвращает ошибки

- ✅ Проверьте переменные окружения
- ✅ Проверьте что все маршруты правильно настроены в `netlify/functions/api.ts`

## 🔄 Обновление сайта

Для обновления просто загрузите изменения в GitHub:

```bash
git add .
git commit -m "Update site"
git push origin main
```

Netlify автоматически пересоберет и задеплоит сайт.

## 🌟 Дополнительные возможности

- **Custom domain:** Site Settings → Domain management
- **Analytics:** Встроенная аналитика Netlify
- **Forms:** Обработка форм без сервера
- **Split testing:** A/B тестирование
- **Environment previews:** Превью для каждого PR

---

✨ **Готово!** Ваш сайт теперь полностью работает на Netlify с поддержкой всех функций.

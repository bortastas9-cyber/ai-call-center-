# 🚀 Настройка AI Call Center с реальными звонками

## Предварительные требования

- Node.js 14+ установлен
- npm или yarn
- Аккаунт Twilio (https://www.twilio.com)
- Аккаунт Google Cloud с включенным Text-to-Speech API

## Шаг 1: Получение ключей Twilio

1. Перейдите на https://www.twilio.com и создайте аккаунт
2. В консоли Twilio найдите:
   - **Account SID**
   - **Auth Token**
3. Купите виртуальный номер телефона (для production)
   - Для тестирования используйте пробный номер
4. Сохраните эти данные

## Шаг 2: Настройка Google Cloud Text-to-Speech

1. Создайте проект на https://cloud.google.com
2. Включите API: Google Cloud Text-to-Speech API
3. Создайте Service Account:
   - Перейдите в "Service Accounts"
   - Создайте новый сервисный аккаунт
   - Создайте JSON ключ
   - Скачайте JSON файл с ключами

## Шаг 3: Установка зависимостей

```bash
cd ai-call-center
npm install
```

## Шаг 4: Конфигурация переменных окружения

1. Скопируйте `.env.example` в `.env`:
```bash
cp .env.example .env
```

2. Отредактируйте `.env` файл:
```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890  # Ваш Twilio номер

# Google Cloud Configuration
GOOGLE_APPLICATION_CREDENTIALS=/path/to/google-credentials.json

# Environment
NODE_ENV=development
```

## Шаг 5: Локальная разработка

Для локальной разработки используйте Vercel CLI:

```bash
# Установка Vercel CLI
npm install -g vercel

# Запуск в режиме разработки
vercel dev
```

Это запустит сервер на `http://localhost:3000`

## Шаг 6: Развертывание на Vercel

1. Спуште код на GitHub:
```bash
git add .
git commit -m "Add Twilio VoIP integration"
git push origin main
```

2. Подключите репозиторий к Vercel:
   - Перейдите на https://vercel.com
   - Нажмите "New Project"
   - Импортируйте GitHub репозиторий

3. Установите environment variables в Vercel:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`
   - `GOOGLE_APPLICATION_CREDENTIALS` (содержимое JSON файла в виде строки)

4. Нажмите "Deploy"

## Тестирование

### Локальное тестирование

1. Откройте http://localhost:3000 в браузере
2. Перейдите в Dashboard
3. Нажмите "Новый звонок"
4. Введите номер телефона (в формате +1234567890)
5. Выберите скрипт
6. Нажмите "НАЧАТЬ ЗВОНОК"

### Production тестирование

1. Откройте развернутый сайт на Vercel
2. Повторите шаги тестирования выше

## Возможные проблемы

### Ошибка: "TWILIO_ACCOUNT_SID is undefined"
- Убедитесь, что `.env` файл находится в корне проекта
- Проверьте, что значения правильно скопированы из Twilio консоли

### Ошибка: "Cannot find module 'twilio'"
- Запустите `npm install`

### Ошибка: "Google credentials not found"
- Убедитесь, что путь к JSON файлу правильный
- На Windows используйте двойные слэши: `C:\\path\\to\\file.json`

### Звонок не инициируется
1. Проверьте консоль браузера (F12) на ошибки
2. Проверьте, что номер телефона в правильном формате
3. Проверьте баланс Twilio аккаунта (может быть исчерпан)

## Структура проекта

```
ai-call-center/
├── index.html          # Фронтенд приложение
├── api/
│   └── calls.js        # Vercel API endpoint для звонков
├── services/
│   └── tts.js          # Google Text-to-Speech сервис
├── package.json        # Зависимости Node.js
├── .env.example        # Шаблон переменных окружения
├── .env                # Локальные переменные окружения (не коммитить!)
└── SETUP.md            # Этот файл
```

## API Endpoints

### POST /api/calls
Инициирует новый звонок

**Request:**
```json
{
  "phoneNumber": "+1234567890",
  "scriptId": "sales-script",
  "callerId": "ai-call-center"
}
```

**Response:**
```json
{
  "success": true,
  "callId": "CA1234567890abcdef",
  "message": "Звонок инициирован",
  "status": "queued",
  "phoneNumber": "+1234567890",
  "scriptName": "Скрипт продаж"
}
```

### GET /api/calls?type=history
Получить историю звонков

**Response:**
```json
{
  "success": true,
  "callHistory": [...]
}
```

### GET /api/calls?type=stats
Получить статистику звонков

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalCalls": 10,
    "activeCalls": 2,
    "completedCalls": 8
  }
}
```

## Дополнительные ресурсы

- [Документация Twilio](https://www.twilio.com/docs)
- [Google Cloud Text-to-Speech](https://cloud.google.com/text-to-speech)
- [Vercel Functions](https://vercel.com/docs/functions)
- [Примеры Twilio Node.js](https://github.com/twilio/twilio-node)

## Поддержка

Для вопросов и проблем создайте issue на GitHub или свяжитесь с поддержкой Twilio.

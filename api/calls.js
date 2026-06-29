const twilio = require('twilio');
const { generateSpeech } = require('../services/tts');
const {
  handleCallStatusUpdate,
  getActiveCalls,
  generateTwiML,
  formatPhoneNumber,
  validatePhoneNumber
} = require('../services/webhooks');

// Инициализация Twilio клиента
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;
const client = twilio(accountSid, authToken);

// Скрипты звонков
const scripts = {
  'sales-script': {
    name: 'Скрипт продаж',
    text: 'Здравствуйте! Это звонок из AI Call Center. Я звоню с предложением о наших услугах. Могу ли я немного вашего времени?'
  },
  'support-script': {
    name: 'Скрипт поддержки',
    text: 'Здравствуйте! Это служба поддержки AI Call Center. Как мы можем вам помочь сегодня?'
  },
  'survey-script': {
    name: 'Скрипт опроса',
    text: 'Здравствуйте! Мы проводим короткий опрос. Это займет всего несколько минут. Вы согласны?'
  }
};

// Сохранение истории звонков
let callHistory = [];

// Handler для Vercel Function
module.exports = async (req, res) => {
  // Установка CORS заголовков
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { phoneNumber, scriptId, callerId } = req.body;

      // Валидация номера телефона
      if (!phoneNumber || !/^\+?[1-9]\d{1,14}$/.test(phoneNumber)) {
        return res.status(400).json({
          success: false,
          error: 'Некорректный номер телефона'
        });
      }

      // Получение скрипта
      const script = scripts[scriptId] || scripts['sales-script'];

      // Генерация TTS аудио (будет реализовано далее)
      const audioUrl = await generateSpeech(script.text);

      // Создание TwiML для звонка
      const twiml = new twilio.twiml.VoiceResponse();

      // Воспроизведение аудио
      twiml.play(audioUrl);

      // Ожидание ввода от пользователя (опционально)
      twiml.gather({
        numDigits: 1,
        timeout: 10
      });

      // Инициирование звонка через Twilio
      const call = await client.calls.create({
        from: fromNumber,
        to: phoneNumber,
        twiml: twiml.toString()
      });

      // Сохранение в историю
      const callRecord = {
        id: call.sid,
        phoneNumber: phoneNumber,
        scriptId: scriptId,
        scriptName: script.name,
        status: call.status,
        startTime: new Date().toISOString(),
        duration: 0
      };

      callHistory.push(callRecord);

      // Ограничение размера истории
      if (callHistory.length > 1000) {
        callHistory = callHistory.slice(-500);
      }

      return res.status(200).json({
        success: true,
        callId: call.sid,
        message: 'Звонок инициирован',
        status: call.status,
        phoneNumber: phoneNumber,
        scriptName: script.name
      });
    } catch (error) {
      console.error('Ошибка при инициировании звонка:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Ошибка при инициировании звонка'
      });
    }
  } else if (req.method === 'GET') {
    // GET запрос для получения истории звонков
    try {
      const { type } = req.query;

      if (type === 'history') {
        return res.status(200).json({
          success: true,
          callHistory: callHistory
        });
      } else if (type === 'stats') {
        return res.status(200).json({
          success: true,
          stats: {
            totalCalls: callHistory.length,
            activeCalls: callHistory.filter(c => c.status === 'in-progress').length,
            completedCalls: callHistory.filter(c => c.status === 'completed').length
          }
        });
      }

      return res.status(200).json({
        success: true,
        message: 'API готов к работе'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  } else {
    return res.status(405).json({
      success: false,
      error: 'Метод не поддерживается'
    });
  }
};

/**
 * Обработчик Twilio вебхуков для отслеживания статуса звонков
 * Этот файл содержит логику обработки статус-обновлений от Twilio
 */

// Хранилище текущих звонков (в production использовать базу данных)
const activeCalls = new Map();

/**
 * Обрабатывает статус-обновление от Twilio
 * @param {Object} data - Данные из вебхука Twilio
 * @returns {Object} Результат обработки
 */
function handleCallStatusUpdate(data) {
  const { CallSid, CallStatus, From, To, Duration } = data;

  // Обновляем статус звонка
  activeCalls.set(CallSid, {
    sid: CallSid,
    status: CallStatus,
    from: From,
    to: To,
    duration: Duration || 0,
    updatedAt: new Date().toISOString()
  });

  // Логируем событие
  console.log(`[${CallStatus}] Звонок от ${From} на ${To} (${CallSid})`);

  // Если звонок завершен, удаляем из активных
  if (CallStatus === 'completed' || CallStatus === 'failed' || CallStatus === 'busy') {
    setTimeout(() => {
      activeCalls.delete(CallSid);
    }, 5000);
  }

  return {
    success: true,
    callId: CallSid,
    status: CallStatus,
    message: `Статус обновлен на "${CallStatus}"`
  };
}

/**
 * Получить все активные звонки
 * @returns {Array} Массив активных звонков
 */
function getActiveCalls() {
  return Array.from(activeCalls.values());
}

/**
 * Получить информацию о конкретном звонке
 * @param {string} callId - ID звонка
 * @returns {Object|null} Информация о звонке или null
 */
function getCallInfo(callId) {
  return activeCalls.get(callId) || null;
}

/**
 * Генерирует TwiML для проигрывания аудио
 * @param {string} audioUrl - URL аудиофайла
 * @param {boolean} record - Записывать ли разговор
 * @returns {string} TwiML XML
 */
function generateTwiML(audioUrl, record = true) {
  let twiml = '<?xml version="1.0" encoding="UTF-8"?>';
  twiml += '<Response>';

  if (record) {
    twiml += '<Record maxLength="3600" />';
  }

  twiml += `<Play>${audioUrl}</Play>`;
  twiml += '<Gather numDigits="1" timeout="10" finishOnKey="#">';
  twiml += '<Say>Нажмите любую клавишу или решетку для завершения</Say>';
  twiml += '</Gather>';

  twiml += '</Response>';

  return twiml;
}

/**
 * Форматирует номер телефона в E.164 формат
 * @param {string} phoneNumber - Номер телефона
 * @returns {string} Номер в формате E.164
 */
function formatPhoneNumber(phoneNumber) {
  // Удаляем все нецифровые символы кроме +
  let cleaned = phoneNumber.replace(/[^\d+]/g, '');

  // Если не начинается с +, добавляем
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }

  return cleaned;
}

/**
 * Валидирует номер телефона
 * @param {string} phoneNumber - Номер телефона
 * @returns {boolean} Валиден ли номер
 */
function validatePhoneNumber(phoneNumber) {
  const e164Regex = /^\+?[1-9]\d{1,14}$/;
  return e164Regex.test(phoneNumber);
}

module.exports = {
  handleCallStatusUpdate,
  getActiveCalls,
  getCallInfo,
  generateTwiML,
  formatPhoneNumber,
  validatePhoneNumber
};

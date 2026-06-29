const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const path = require('path');

// Инициализация Google TTS клиента
const ttsClient = new textToSpeech.TextToSpeechClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

/**
 * Генерирует речь из текста используя Google Text-to-Speech
 * @param {string} text - Текст для преобразования в речь
 * @param {string} language - Код языка (по умолчанию 'ru-RU')
 * @returns {Promise<string>} URL или путь к аудиофайлу
 */
async function generateSpeech(text, language = 'ru-RU') {
  try {
    // Проверка, что текст не пустой
    if (!text || text.trim().length === 0) {
      throw new Error('Текст для преобразования не может быть пустым');
    }

    // Ограничение длины текста (Google имеет лимиты)
    const maxLength = 5000;
    const processedText = text.substring(0, maxLength);

    // Подготовка запроса к Google TTS
    const request = {
      input: {
        text: processedText
      },
      voice: {
        languageCode: language,
        name: language === 'ru-RU' ? 'ru-RU-Standard-D' : `${language}-Standard-C`,
        ssmlGender: textToSpeech.SsmlVoiceGender.FEMALE
      },
      audioConfig: {
        audioEncoding: textToSpeech.AudioEncoding.MP3,
        pitch: 0,
        speakingRate: 1.0
      }
    };

    // Вызов Google TTS API
    const [response] = await ttsClient.synthesizeSpeech(request);

    // Если используется локальное хранилище (для развития)
    if (process.env.NODE_ENV === 'development') {
      const audioFile = path.join(__dirname, '../public/audio', `${Date.now()}.mp3`);

      // Убедимся, что директория существует
      const audioDir = path.dirname(audioFile);
      if (!fs.existsSync(audioDir)) {
        fs.mkdirSync(audioDir, { recursive: true });
      }

      // Сохраняем аудиофайл
      fs.writeFileSync(audioFile, response.audioContent, 'binary');

      // Возвращаем относительный URL
      return `/audio/${path.basename(audioFile)}`;
    }

    // Для production: загрузить на облако (например Google Cloud Storage)
    // Это нужно будет реализовать отдельно
    // Временно возвращаем base64
    const base64Audio = Buffer.from(response.audioContent).toString('base64');
    return `data:audio/mp3;base64,${base64Audio}`;

  } catch (error) {
    console.error('Ошибка при генерировании речи:', error);

    // Резервный вариант: использовать молчание если TTS не работает
    console.warn('Не удалось сгенерировать речь, используется резервный вариант');

    // Возвращаем пустой MP3 или URL к предзаписанному аудио
    return '/audio/fallback.mp3';
  }
}

/**
 * Генерирует речь с сохранением в файл
 * @param {string} text - Текст для преобразования
 * @param {string} filename - Имя файла для сохранения
 * @returns {Promise<string>} Путь к сохраненному файлу
 */
async function generateSpeechToFile(text, filename) {
  try {
    const request = {
      input: { text: text },
      voice: {
        languageCode: 'ru-RU',
        name: 'ru-RU-Standard-D',
        ssmlGender: textToSpeech.SsmlVoiceGender.FEMALE
      },
      audioConfig: {
        audioEncoding: textToSpeech.AudioEncoding.MP3
      }
    };

    const [response] = await ttsClient.synthesizeSpeech(request);

    // Определяем путь сохранения
    const outputPath = path.join(__dirname, '../audio', filename);

    // Создаем директорию если ее нет
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Сохраняем файл
    fs.writeFileSync(outputPath, response.audioContent, 'binary');

    return outputPath;
  } catch (error) {
    console.error('Ошибка при сохранении речи в файл:', error);
    throw error;
  }
}

module.exports = {
  generateSpeech,
  generateSpeechToFile
};

import { RequestHandler } from "express";
import { ChatRequest, ChatResponse } from "@shared/api";

export const handleGroqChat: RequestHandler = async (req, res) => {
  try {
    console.log("📧 Получен запрос к groq-chat");
    const { messages }: ChatRequest = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.log("❌ Некорректные сообщения:", messages);
      const response: ChatResponse = {
        success: false,
        error: "Необходимо предоставить сообщения для чата",
      };
      return res.status(400).json(response);
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      console.log(
        "❌ GROQ_API_KEY не найден в переменных окружения, используем fallback",
      );

      // Fallback ответ при отсутствии API ключа
      const lastMessage =
        messages[messages.length - 1]?.content?.toLowerCase() || "";
      let fallbackMessage = "";

      if (
        lastMessage.includes("привет") ||
        lastMessage.includes("здравствуй")
      ) {
        fallbackMessage =
          "👋 Привет! Я Пятница, ваш ИИ-консультант. Сейчас работаю в демо-режиме. Расскажу о наших тарифах веб-разработки!";
      } else if (
        lastMessage.includes("тариф") ||
        lastMessage.includes("цен") ||
        lastMessage.includes("стоимость")
      ) {
        fallbackMessage =
          "💰 Наши тарифы веб-разработки:\n\n🥉 BASIC - 2.500.000 сум\n🥈 PRO - 3.500.000 сум (скидка с 4М)\n🥇 MAX - 5.500.000 сум\n\nВыберите тариф для подробностей!";
      } else {
        fallbackMessage =
          "🤖 Пятница здесь! Работаю в демо-режиме. Могу рассказать о наших услугах веб-разработки и тарифах. Что вас интересует?";
      }

      const response: ChatResponse = {
        success: true,
        message: fallbackMessage,
      };
      return res.status(200).json(response);
    }

    console.log(`🔑 API ключ найден, длина: ${groqApiKey.length} символов`);
    console.log(`📝 Количество сообщений: ${messages.length}`);

    // Используем модель llama-3.1-8b-instant
    console.log("🚀 Отправляем запрос к Groq API...");
    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: `Ты - Пятница 🤖, умный ИИ-ассистент и консультант компании STARK INDUSTRIES AI DIVISION по веб-разработке.

ЯЗЫКОВОЕ ТРЕБОВАНИЕ: Отвечай ТОЛЬКО на русском языке.

ТВОЯ РОЛЬ:
- Главный консультант по веб-разработке и услугам компании
- Универсальный помощник - отвечаешь на любые вопросы
- Решаешь математические задачи любой сложности
- Помогаешь с программированием на всех языках
- Общаешься на любые темы: наука, технологии, жизнь, хобби и т.д.
- Даешь советы и рекомендации

ИНФОРМАЦИЯ О КОМПАНИИ:
🏢 STARK INDUSTRIES AI DIVISION - инновационная команда веб-разработчиков
🚀 Специализируемся на создании современных сайтов с ИИ-технологиями

НАШИ ТАРИФЫ НА ВЕБ-РАЗРАБОТКУ:

1. 🥉 BASIC - 2.500.000 сум:
   🎨 Уникальный дизайн
   📱 Адаптивная верстка под все устройства
   🔍 SEO оптимизация для поисковых систем
   ⚡ Быстрая загрузка страниц
   📧 Контактные формы и обратная связь
   🛡️ Техническая поддержка 3 месяца
   📊 Базовая аналитика посещаемости

2. 🥈 PRO - 3.500.000 сум (скидка с 4.000.000):
   🚀 Все возможности тарифа Basic +
   🤖 ИИ-чат бот для автоматиче��ких ответов
   ⚙️ Удобная панель управления сайтом
   📊 Продвинутая аналитика и статистика
   💳 Интеграция онлайн платежей
   🛡️ Расширенная поддержка 6 месяцев
   🔐 Система авторизации пользователей

3. 🥇 MAX - 5.500.000 сум:
   💎 Все возможности тарифа Pro +
   🧠 Джарвис - голосовой ИИ помощник с аудио ответами
   🌟 Интерактивные 3D элементы и анимации
   🥽 VR/AR интеграция для иммерсивного опыта
   ⛓️ Блокчейн функции и криптоплатежи
   🛡️ Премиум поддержка 12 месяцев
   🚀 Персональные ИИ-функции под ваш бизнес

СТИЛЬ ОБЩЕНИЯ:
- Будь дружелюбным, но профессиональным консультантом
- Отвечай подробно на вопросы о веб-разработке и наших услугах
- На другие темы общайся естественно и помогай человеку
- Используй эмодзи умеренно дл�� удобства восприятия
- Говори понятным языком, избегай сложной терминологии
- Если не знаешь точного ответа - честно признавайся
- Проявляй интерес к вопросам пользователя
- Предлагай дополнительную помощь когда уместно

ВАЖНО: Ты можешь общаться на ЛЮБЫЕ темы - от программирования до кулинарии, от науки до развлечений. Главное - быть полезным помощником!`,
            },
            ...messages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
          ],
          max_tokens: 800,
          temperature: 0.7,
          top_p: 1,
          stream: false,
        }),
      },
    );

    console.log(`📡 Ответ от Groq API: статус ${groqResponse.status}`);

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error("❌ Groq API error:", {
        status: groqResponse.status,
        statusText: groqResponse.statusText,
        error: errorText,
      });

      // Fallback ответ при недоступности API
      const lastMessage =
        messages[messages.length - 1]?.content?.toLowerCase() || "";
      let fallbackMessage = "";

      if (
        lastMessage.includes("привет") ||
        lastMessage.includes("здравствуй")
      ) {
        fallbackMessage =
          "👋 Привет! Я Пятница, ваш ИИ-консультант по веб-разработке. В данный момент основной API недоступен, но я могу рассказать о наших тарифах!\n\n🥉 BASIC - 2.500.000 сум\n🥈 PRO - 3.500.000 сум\n🥇 MAX - 5.500.000 сум\n\nЧто вас интересует?";
      } else if (
        lastMessage.includes("тариф") ||
        lastMessage.includes("цен") ||
        lastMessage.includes("стоимость")
      ) {
        fallbackMessage =
          "💰 Наши тарифы:\n\n🥉 BASIC - 2.500.000 сум:\n• Уникальный дизайн\n• Адаптивная верстка\n• SEO оптимизация\n• Поддержка 3 месяца\n\n🥈 PRO - 3.500.000 сум:\n• Все из Basic +\n• ИИ-чат бот\n• Панель управления\n• Аналитика\n• Поддержка 6 месяцев\n\n���� MAX - 5.500.000 сум:\n• Все из Pro +\n• Джарвис с голосовыми ответами\n• 3D элементы\n• VR/AR интеграция\n• Поддержка 12 месяцев";
      } else if (
        lastMessage.includes("спасибо") ||
        lastMessage.includes("благодарю")
      ) {
        fallbackMessage =
          "😊 Пожалуйста! Рад помочь с веб-разработкой. Если есть вопросы по тарифам или услугам - обращайтесь!";
      } else {
        fallbackMessage = `🤖 Привет! Сейчас основной API временно недоступен, но я могу рассказать о наших услугах по веб-разработке.\n\nМы предлагаем 3 тарифа: BASIC (2.5М), PRO (3.5М) и MAX (5.5М).\n\nО чем хотели бы узнать подробнее?`;
      }

      const response: ChatResponse = {
        success: true,
        message: fallbackMessage,
      };
      return res.status(200).json(response);
    }

    const groqData = await groqResponse.json();
    console.log("📦 Получены данные от Groq API:", {
      hasChoices: !!groqData.choices,
      choicesLength: groqData.choices?.length || 0,
    });

    if (!groqData.choices || groqData.choices.length === 0) {
      console.error("❌ Пустой ответ от API:", groqData);
      const response: ChatResponse = {
        success: false,
        error: "Пустой ответ от API",
      };
      return res.status(500).json(response);
    }

    const aiMessage = groqData.choices[0].message.content;
    console.log("✅ Успешный ответ получен, длина:", aiMessage?.length || 0);

    const response: ChatResponse = {
      success: true,
      message: aiMessage,
    };

    res.json(response);
  } catch (error) {
    console.error("❌ Groq chat error:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      error,
    });
    const response: ChatResponse = {
      success: false,
      error: "Ошибка сервера",
    };
    res.status(500).json(response);
  }
};

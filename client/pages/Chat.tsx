import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ChatMessage, ChatRequest, ChatResponse } from "@shared/api";
import {
  Send,
  Bot,
  User,
  Loader2,
  MessageCircle,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";

// Функция fallback ответов
const getFallbackResponse = (userInput: string): string => {
  const input = userInput.toLowerCase();

  if (input.includes("привет") || input.includes("здравствуй") || input.includes("добро пожаловать")) {
    return "👋 Привет! Я Пятница, ваш ИИ-консультант. Сейчас работаю в демо-режиме. Расскажу о наших тарифах веб-разработки!";
  }

  if (input.includes("тариф") || input.includes("цен") || input.includes("стоимость") || input.includes("прайс")) {
    return "💰 Наши тарифы веб-разработки:\n\n🥉 BASIC - 2.500.000 сум:\n• Уникальный дизайн\n• Адаптивная верстка\n• SEO оптимизация\n• Поддержка 3 месяца\n\n🥈 PRO - 3.500.000 сум:\n• Все из Basic +\n• ИИ-чат бот\n• Панель управления\n• Аналитика\n• Поддержка 6 месяцев\n\n🥇 MAX - 5.500.000 сум:\n• Все из Pro +\n• Джарвис с голосовыми ответами\n• 3D элементы\n• VR/AR интеграция\n• Поддержка 12 месяцев";
  }

  if (input.includes("спасибо") || input.includes("благодарю")) {
    return "😊 Пожалуйста! Рад помочь с веб-разработкой. Если есть вопросы по тарифам или услугам - обращайтесь!";
  }

  if (input.includes("услуг") || input.includes("что делает") || input.includes("чем занимается")) {
    return "🚀 STARK INDUSTRIES AI DIVISION - мы создаём современные сайты с ИИ-технологиями:\n\n• Уникальный дизайн и адаптивная верстка\n• ИИ-чат боты для автоматических ответов\n• 3D элементы и интерактивные анимации\n• VR/AR интеграция\n• SEO оптимизация и аналитика\n\nВыберите тариф или задайте вопрос!";
  }

  return "🤖 Пятница здесь! Работаю в демо-режиме как консультант по веб-разработке.\n\nМогу рассказать о:\n• Наших тарифах (BASIC, PRO, MAX)\n• Услугах веб-разработки\n• Технологиях и возможностях\n\nЧто вас интересу��т? 😊";
};

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isRequestInProgressRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Приветственное сообщение от ИИ
    const welcomeMessage: ChatMessage = {
      role: "assistant",
      content:
        "Привет! Я Пятница 🤖\n\nМогу помочь с:\n• Консультацией по нашим тарифам веб-разработки\n• Математическими задачами\n• Программированием\n• Любыми вопросами\n\nЧто вас интересует?",
      timestamp: Date.now(),
    };
    setMessages([welcomeMessage]);
  }, []);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || isRequestInProgressRef.current)
      return;

    isRequestInProgressRef.current = true;

    const userMessage: ChatMessage = {
      role: "user",
      content: inputMessage.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const chatRequest: ChatRequest = {
        messages: [...messages, userMessage],
      };

      const response = await fetch("/api/groq-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(chatRequest),
      });

      // Проверяем статус ответа перед чтением body
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Клонир��ем response для безопасного чтения body
      const responseClone = response.clone();
      let data: ChatResponse;

      try {
        data = await responseClone.json();
      } catch (parseError) {
        console.error("Ошибка парсинга JSON:", parseError);
        throw new Error("Неверный фор��ат ответа от сервера");
      }

      if (data.success && data.message) {
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: data.message,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        // Даже при ошибке API показываем консультационный ответ
        const fallbackMessage = getFallbackResponse(userMessage.content);
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: fallbackMessage,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Ошибка отправки сообщения:", error);

      // Вместо ошибки показываем fallback ответ консультанта
      const fallbackMessage = getFallbackResponse(userMessage.content);

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: fallbackMessage,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
      isRequestInProgressRef.current = false;
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-white hover:bg-white/10"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  На главную
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Чат с П��тницей 🤖</h1>
                  <p className="text-sm text-white/60">
                    Супер-умный ИИ помощник и консультант ✨
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-white/60">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Онлайн</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden h-[calc(100vh-200px)] flex flex-col">
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-start space-x-3 animate-fadeIn",
                    message.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}

                  <div
                    className={cn(
                      "max-w-xs sm:max-w-md lg:max-w-2xl px-4 py-3 rounded-2xl relative",
                      message.role === "user"
                        ? "bg-white text-black ml-auto"
                        : "bg-white/10 border border-white/20 text-white",
                    )}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <div
                      className={cn(
                        "text-xs mt-2 opacity-70",
                        message.role === "user"
                          ? "text-black/60"
                          : "text-white/60",
                      )}
                    >
                      {formatTime(message.timestamp)}
                    </div>
                  </div>

                  {message.role === "user" && (
                    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center border border-white/20 flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex items-start space-x-3 animate-fadeIn">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white/10 border border-white/20 text-white px-4 py-3 rounded-2xl">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Пятница печатает...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-6 border-t border-white/10">
            <div className="flex items-center space-x-3">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Напишите ваше сообщение..."
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50 pr-12 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                  autoFocus
                />
                <MessageCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
              </div>
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <div className="mt-3 text-xs text-white/40 text-center">
              На��мите Enter для отправки • ИИ может ошибаться, проверяйте важную
              информацию
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

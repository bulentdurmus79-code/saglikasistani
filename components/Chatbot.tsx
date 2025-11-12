import React, { useState, useRef, useEffect } from 'react';
import { RobotIcon } from './icons/Icons';
import { ChatMessage, Task, TaskType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { identifyMedication, parseCommandToTask } from '../services/geminiService';
import { useAppStore } from '../store/useAppStore';

const WelcomeMessage: ChatMessage = {
  id: uuidv4(),
  sender: 'bot',
  text: 'Merhaba! Ben Akıllı Sağlık Asistanınız. Size nasıl yardımcı olabilirim? İlaç fotoğrafı yükleyebilir veya sesli komut verebilirsiniz.',
};

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WelcomeMessage]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { addTask, currentUserId } = useAppStore();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (text: string, image?: string) => {
    if (!text && !image) return;
    const userMessage: ChatMessage = { id: uuidv4(), sender: 'user', text, image };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    const loadingMessage: ChatMessage = { id: uuidv4(), sender: 'bot', text: '', isLoading: true };
    setMessages(prev => [...prev, loadingMessage]);

    let botResponseText = "Üzgünüm, bunu anlayamadım.";
    if (image) {
        botResponseText = await identifyMedication(image.split(',')[1]);
    } else {
        // Simple command handling for demonstration
        botResponseText = `"${text}" komutunuzu aldım ancak bu özellik henüz tam olarak aktif değil.`;
    }

    const botMessage: ChatMessage = { id: uuidv4(), sender: 'bot', text: botResponseText };
    setMessages(prev => [...prev.slice(0, -1), botMessage]);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        handleSendMessage("Bu hangi ilaç?", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVoiceCommand = () => {
    if (!('webkitSpeechRecognition' in window)) {
        alert("Sesli komut özelliği tarayıcınız tarafından desteklenmiyor.");
        return;
    }

    // Fix: Resolve TypeScript error "Cannot find name 'webkitSpeechRecognition'".
    // The constructor is on the window object and needs to be accessed from there.
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'tr-TR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => {
        console.error("Speech recognition error", event);
        setIsListening(false);
    };

    recognition.onresult = async (event) => {
        const command = event.results[0][0].transcript;
        const userMessage: ChatMessage = { id: uuidv4(), sender: 'user', text: `(Sesli Komut) ${command}` };
        setMessages(prev => [...prev, userMessage]);
        
        const loadingMessage: ChatMessage = { id: uuidv4(), sender: 'bot', text: '', isLoading: true };
        setMessages(prev => [...prev, loadingMessage]);

        const parsedTask = await parseCommandToTask(command);
        let botResponseText = "";
        if (parsedTask && currentUserId) {
            const newTask: Task = {
                id: uuidv4(),
                profileId: currentUserId,
                title: parsedTask.title,
                time: parsedTask.time,
                date: new Date().toISOString().split('T')[0],
                type: Object.values(TaskType).includes(parsedTask.type) ? parsedTask.type : TaskType.Other,
                isCritical: false,
                isCompleted: false,
            };
            addTask(newTask);
            botResponseText = `Anlaşıldı. "${parsedTask.title}" görevi saat ${parsedTask.time} için eklendi.`;
        } else {
            botResponseText = "Sesli komutunuzu bir göreve dönüştüremedim. Lütfen tekrar deneyin.";
        }

        const botMessage: ChatMessage = { id: uuidv4(), sender: 'bot', text: botResponseText };
        setMessages(prev => [...prev.slice(0, -1), botMessage]);
    };

    recognition.start();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-28 z-40 w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center shadow-lg focus:outline-none focus:ring-4 focus:ring-primary-300"
        aria-label="Yapay Zeka Asistanını Aç"
      >
        <RobotIcon className="w-8 h-8" />
      </button>

      {isOpen && (
        <div className="fixed bottom-0 right-4 w-full max-w-sm h-[70vh] bg-white dark:bg-gray-800 rounded-t-2xl shadow-2xl flex flex-col z-50">
          <header className="p-4 bg-primary text-white rounded-t-2xl flex justify-between items-center">
            <h3 className="font-bold text-lg">Akıllı Asistan</h3>
            <button onClick={() => setIsOpen(false)}>&times;</button>
          </header>

          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map(msg => (
              <div key={msg.id} className={`flex my-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-lg max-w-xs ${msg.sender === 'user' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-200 dark:bg-gray-700'}`}>
                  {msg.isLoading ? (
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    </div>
                  ) : (
                    <>
                      {msg.image && <img src={msg.image} alt="uploaded content" className="rounded-lg mb-2 max-h-40" />}
                      <p className="text-sm">{msg.text}</p>
                    </>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <footer className="p-3 border-t dark:border-gray-700 flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(input)}
              placeholder="Mesajınızı yazın..."
              className="flex-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                <i className="fa-solid fa-camera text-gray-600 dark:text-gray-300"></i>
            </button>
            <button onClick={handleVoiceCommand} className={`p-2 rounded-full ${isListening ? 'bg-red-200 dark:bg-red-800 animate-pulse' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                <i className="fa-solid fa-microphone text-gray-600 dark:text-gray-300"></i>
            </button>
            <button onClick={() => handleSendMessage(input)} className="p-2 rounded-full bg-primary text-white">
                <i className="fa-solid fa-paper-plane"></i>
            </button>
          </footer>
        </div>
      )}
    </>
  );
};

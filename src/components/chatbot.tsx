"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'bot' | 'user', content: string}[]>([
    { role: 'bot', content: 'Cześć! Jestem wirtualnym asystentem ZoneTV. W czym mogę Ci dzisiaj pomóc?' }
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: inputValue }]);
    
    // Simulate bot thinking/response (placeholder for future logic)
    setTimeout(() => {
        setMessages(prev => [...prev, { 
            role: 'bot', 
            content: 'Dziękuję za wiadomość. Aktualnie jestem w trybie demonstracyjnym. Wkrótce będę mógł odpowiedzieć na Twoje pytania lub przekierować sprawę do naszego zespołu wsparcia.' 
        }]);
    }, 1000);

    setInputValue("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      
      {/* Chat Window */}
      <div 
        className={cn(
            "w-[350px] sm:w-[400px] h-[500px] bg-background/95 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right",
            isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-10 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="bg-primary/10 border-b border-primary/10 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                    <Bot className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-sm">Asystent ZoneTV</h3>
                    <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-xs text-muted-foreground">Online</span>
                    </div>
                </div>
            </div>
            <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary"
                onClick={() => setIsOpen(false)}
            >
                <X className="h-4 w-4" />
            </Button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            {messages.map((msg, idx) => (
                <div 
                    key={idx} 
                    className={cn(
                        "flex w-full",
                        msg.role === 'user' ? "justify-end" : "justify-start"
                    )}
                >
                    <div 
                        className={cn(
                            "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                            msg.role === 'user' 
                                ? "bg-primary text-primary-foreground rounded-tr-sm" 
                                : "bg-muted/50 border border-white/5 text-foreground rounded-tl-sm"
                        )}
                    >
                        {msg.content}
                    </div>
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-background/50 border-t border-white/5">
            <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Napisz wiadomość..." 
                    className="flex-1 bg-white/5 border-white/10 focus-visible:ring-primary/50"
                />
                <Button type="submit" size="icon" className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 shrink-0">
                    <Send className="h-4 w-4" />
                </Button>
            </form>
            <div className="text-[10px] text-center text-muted-foreground mt-2">
                Powered by ZoneTV AI &bull; <span className="hover:text-primary cursor-pointer transition-colors">Polityka Prywatności</span>
            </div>
        </div>
      </div>

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
            "group relative flex items-center justify-center h-14 w-14 rounded-full bg-primary text-white shadow-[0_0_30px_-5px_rgba(229,9,20,0.6)] transition-all hover:scale-110 hover:shadow-[0_0_40px_-5px_rgba(229,9,20,0.8)] z-50",
            isOpen && "rotate-90 scale-0 opacity-0" // Hide when open or transform
        )}
      >
        <span className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping opacity-20" />
        <Bot className="h-7 w-7 transition-transform group-hover:rotate-12" />
        
        {/* Notification Badge (Fake) */}
        {!isOpen && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-background"></span>
            </span>
        )}
      </button>

      {/* Close/Minimize Button when Open (Optional, reusing the X in header but maybe nice to have a floating close too? No, header X is enough standard pattern) */}
    </div>
  );
}

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Send, Paperclip, Image as ImageIcon } from "lucide-react";
import { useState } from "react";

export function LiveChatPage() {
  const [message, setMessage] = useState("");

  const messages = [
    { id: 1, sender: "support", text: "Xin chào! Tôi có thể giúp gì cho bạn?", time: "10:30" },
    { id: 2, sender: "user", text: "Tôi muốn hỏi về tỷ giá hôm nay", time: "10:31" },
    { id: 3, sender: "support", text: "Tỷ giá hôm nay là 1¥ = 3,650₫ ạ", time: "10:31" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Hỗ trợ trực tuyến</h1>

      <Card className="h-[600px] flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-xl px-4 py-2 ${
                  msg.sender === "user"
                    ? "bg-primary text-white"
                    : "bg-muted"
                }`}
              >
                <p>{msg.text}</p>
                <p className={`text-xs mt-1 ${msg.sender === "user" ? "text-white/70" : "text-muted-foreground"}`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t p-4">
          <div className="flex gap-2">
            <button className="p-2 hover:bg-muted rounded-lg">
              <Paperclip className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-muted rounded-lg">
              <ImageIcon className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-1 px-4 py-2 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

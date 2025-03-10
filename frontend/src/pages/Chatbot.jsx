import React, { useState } from "react";

const Chatbot = () => {
    const [messages, setMessages] = useState([]);
    const [userMessage, setUserMessage] = useState("");

    const handleSendMessage = () => {
        setMessages([...messages, { type: "user", text: userMessage }]);
        setUserMessage("");
        // Simulate chatbot response
        setMessages((prevMessages) => [
            ...prevMessages,
            { type: "bot", text: "I'm here to help with your pet care questions!" },
        ]);
    };

    return (
        <div>
            <h2>Chatbot</h2>
            <div>
                {messages.map((message, index) => (
                    <div
                        key={index}
                        style={{
                            textAlign: message.type === "user" ? "right" : "left",
                        }}
                    >
                        <p>{message.text}</p>
                    </div>
                ))}
            </div>
            <input
                type="text"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                placeholder="Ask a question..."
            />
            <button onClick={handleSendMessage}>Send</button>
        </div>
    );
};

export default Chatbot;

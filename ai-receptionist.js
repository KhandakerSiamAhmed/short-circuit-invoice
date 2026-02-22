// ai-receptionist.js
document.addEventListener('DOMContentLoaded', () => {

    // IMPORTANT: REPLACE THIS WITH YOUR GEMINI API KEY
    const GEMINI_API_KEY = "AIzaSyBy2b3I9izA_ULf4u0f8DRn1hS9Zb2QiHY";

    // Inject HTML for the chat widget
    const widgetHTML = `
        <div class="ai-widget-container">
            <div class="ai-chat-window" id="aiChatWindow">
                <div class="ai-chat-header">
                    <div class="ai-chat-header-info">
                        <div class="ai-avatar">AI</div>
                        <div>
                            <div class="ai-chat-title">Short Circuit Assistant</div>
                            <div class="ai-chat-status">Online</div>
                        </div>
                    </div>
                    <button class="ai-close-btn" id="aiCloseBtn">×</button>
                </div>
                <div class="ai-chat-messages" id="aiChatMessages">
                    <div class="ai-message bot">
                        👋 Hi! I'm the Short Circuit AI Assistant. How can I help you find the right electronic components today?
                    </div>
                    <div class="ai-typing-indicator" id="aiTypingIndicator">
                        <div class="ai-dot"></div>
                        <div class="ai-dot"></div>
                        <div class="ai-dot"></div>
                    </div>
                </div>
                <div class="ai-chat-input-area">
                    <input type="text" class="ai-chat-input" id="aiChatInput" placeholder="Type your message...">
                    <button class="ai-send-btn" id="aiSendBtn">
                        <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                    </button>
                </div>
            </div>
            <div class="ai-widget-btn" id="aiWidgetBtn">
                <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', widgetHTML);

    const widgetBtn = document.getElementById('aiWidgetBtn');
    const chatWindow = document.getElementById('aiChatWindow');
    const closeBtn = document.getElementById('aiCloseBtn');
    const chatInput = document.getElementById('aiChatInput');
    const sendBtn = document.getElementById('aiSendBtn');
    const messagesContainer = document.getElementById('aiChatMessages');
    const typingIndicator = document.getElementById('aiTypingIndicator');

    let isChatOpen = false;

    // Toggle Chat visibility
    widgetBtn.addEventListener('click', () => {
        isChatOpen = !isChatOpen;
        if (isChatOpen) {
            chatWindow.classList.add('open');
            widgetBtn.style.transform = 'scale(0)';
            setTimeout(() => chatInput.focus(), 300);
        } else {
            chatWindow.classList.remove('open');
            widgetBtn.style.transform = 'scale(1)';
        }
    });

    closeBtn.addEventListener('click', () => {
        isChatOpen = false;
        chatWindow.classList.remove('open');
        widgetBtn.style.transform = 'scale(1)';
    });

    // Chat History to maintain context
    let chatHistory = [
        {
            role: "user",
            parts: [{ text: "You are the Short Circuit AI Assistant, a helpful receptionist for an electronics shop in Bangladesh named Short Circuit IUT. You help customers find products like Arduino, sensors, resistors, capacitors, breadboards, modules, and robotics kits. Keep your answers concise, friendly, and strictly related to electronics products available at the shop or general electronics questions. Do not use markdown like bolding or bullet points in your responses, just return standard plain text." }]
        },
        {
            role: "model",
            parts: [{ text: "Understood! I am ready to assist customers of Short Circuit IUT with their electronics needs concisely and without markdown." }]
        }
    ];

    async function handleSend() {
        const text = chatInput.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        chatInput.value = '';
        sendBtn.disabled = true;

        chatHistory.push({ role: "user", parts: [{ text }] });

        showTyping();

        if (!GEMINI_API_KEY) {
            setTimeout(() => {
                hideTyping();
                addMessage("Hi! My brains are currently resting. The shop owner needs to add their Google AI Pro API key to my code (ai-receptionist.js) to wake me up! 🧠🤖", 'bot');
                sendBtn.disabled = false;
            }, 1000);
            return;
        }

        try {
            // Using Gemini 2.5 Flash for faster, responsive chat if available, or fallback to Gemini Pro
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: chatHistory
                })
            });

            const data = await response.json();
            hideTyping();
            sendBtn.disabled = false;

            if (data.candidates && data.candidates.length > 0) {
                const botReply = data.candidates[0].content.parts[0].text;
                chatHistory.push({ role: "model", parts: [{ text: botReply }] });
                addMessage(botReply, 'bot');
            } else if (data.error) {
                console.error("Gemini API Error details:", data.error);
                let errorMessage = "API Error. Please check the console.";
                if (data.error.code === 400) errorMessage = "Invalid API Key or Bad Request.";
                addMessage(`Oops! ${errorMessage}`, 'bot');
            } else {
                addMessage("I'm sorry, I couldn't process that right now. Please try again later.", 'bot');
            }
        } catch (error) {
            console.error("Gemini API Request Failed:", error);
            hideTyping();
            sendBtn.disabled = false;
            addMessage("I'm experiencing a temporary circuit malfunction. 🔌 Please check your internet connection and try again!", 'bot');
        }
    }

    sendBtn.addEventListener('click', handleSend);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });

    function addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `ai-message ${sender}`;
        msgDiv.textContent = text;
        messagesContainer.insertBefore(msgDiv, typingIndicator);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function showTyping() {
        typingIndicator.classList.add('active');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function hideTyping() {
        typingIndicator.classList.remove('active');
    }
});

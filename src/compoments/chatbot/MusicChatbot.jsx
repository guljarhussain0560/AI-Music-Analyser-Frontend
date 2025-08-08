import React, { useState, useRef, useEffect } from 'react';
import api from '../../api/api.js'; // Adjust the path to your API module

// --- SVG Icons for the component (No changes here) ---
const ChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
);
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
);
const BotIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 8V4H8" />
        <rect x="4" y="12" width="16" height="8" rx="2" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="M12 12v-2" />
    </svg>
);
const NewChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12h14" />
    </svg>
);
const AskMaestroIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
         <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
     </svg>
);
const ResizeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
);

// --- NEW: Helper function to parse markdown for bolding and newlines ---
const parseMarkdownToHTML = (text) => {
    // Return an object for dangerouslySetInnerHTML
    // 1. Replace **text** with <strong>text</strong>
    // 2. Replace newline characters \n with <br /> tags
    return {
        __html: text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br />')
    };
};

// --- NEW: Component to render bot messages with a word-by-word typing effect ---
const BotMessage = ({ text, isLastMessage, chatEndRef }) => {
    // State to hold the text that is currently visible
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        // If it's the last message, trigger the typing animation
        if (isLastMessage) {
            setDisplayedText(''); // Ensure it starts empty
            const words = text.split(' ');
            let currentText = '';
            let wordIndex = 0;

            const intervalId = setInterval(() => {
                if (wordIndex < words.length) {
                    // Add the next word
                    currentText += (wordIndex > 0 ? ' ' : '') + words[wordIndex];
                    setDisplayedText(currentText);
                    wordIndex++;
                    // Scroll to the bottom as new words are added
                    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                } else {
                    // Stop the interval when all words are displayed
                    clearInterval(intervalId);
                }
            }, 75); // Adjust typing speed here (in milliseconds)

            return () => clearInterval(intervalId); // Cleanup on component unmount
        } else {
            // If it's not the last message (e.g., chat history), display it instantly
            setDisplayedText(text);
        }
    }, [text, isLastMessage, chatEndRef]);

    return (
        <div className="flex items-start gap-3 justify-start">
            <div className="text-cyan-400 mt-1"><BotIcon /></div>
            <p
                className="max-w-[85%] p-3 rounded-lg text-white text-sm leading-relaxed bg-gray-700/60"
                dangerouslySetInnerHTML={parseMarkdownToHTML(displayedText)}
            />
        </div>
    );
};


function MusicChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'bot', text: "Hi! I'm Maestro. Ask me anything about the musical terms you see here!" }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef(null);
    const textareaRef = useRef(null);
    const chatWindowRef = useRef(null);
    const resizeRef = useRef(null);

    // --- State for custom resizing ---
    const [size, setSize] = useState({ width: 320, height: 576 });

    // --- State for text selection popup ---
    const [selectionPopup, setSelectionPopup] = useState({
        visible: false,
        x: 0,
        y: 0,
        text: ''
    });

    useEffect(() => {
        // This effect ensures the view scrolls down when a new message is added instantly
        // or when the input area grows. Scrolling for typed messages is handled in BotMessage.
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length]); // Triggers on new message, but not during typing

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            const scrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = `${scrollHeight}px`;
        }
    }, [inputValue]);

    // --- Logic for custom drag-to-resize (No changes here) ---
    const startResizing = (e) => {
        e.preventDefault();
        resizeRef.current = {
            initialX: e.clientX,
            initialY: e.clientY,
            initialWidth: chatWindowRef.current.offsetWidth,
            initialHeight: chatWindowRef.current.offsetHeight,
        };
        window.addEventListener('mousemove', doResize);
        window.addEventListener('mouseup', stopResizing);
    };

    const doResize = (e) => {
        if (!resizeRef.current) return;
        
        const { initialX, initialY, initialWidth, initialHeight } = resizeRef.current;
        const deltaX = e.clientX - initialX;
        const deltaY = e.clientY - initialY;

        const newWidth = initialWidth - deltaX;
        const newHeight = initialHeight - deltaY;

        const clampedWidth = Math.max(320, Math.min(newWidth, window.innerWidth * 0.95));
        const clampedHeight = Math.max(384, Math.min(newHeight, window.innerHeight * 0.95));

        setSize({ width: clampedWidth, height: clampedHeight });
    };

    const stopResizing = () => {
        window.removeEventListener('mousemove', doResize);
        window.removeEventListener('mouseup', stopResizing);
        resizeRef.current = null;
    };

    // --- Logic for text selection popup (No changes here) ---
    useEffect(() => {
        const handleMouseUp = (event) => {
            if (event.target.closest('.chatbot-container') || event.target.closest('#selection-popup')) {
                return;
            }

            const selection = window.getSelection();
            const selectedText = selection.toString().trim();

            if (selectedText) {
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                setSelectionPopup({
                    visible: true,
                    x: rect.left + (rect.width / 2),
                    y: rect.top - 45,
                    text: selectedText
                });
            } else {
                setSelectionPopup(prev => ({ ...prev, visible: false }));
            }
        };

        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const handleAskAboutSelection = () => {
        setInputValue(`What does "${selectionPopup.text}" mean?`);
        setIsOpen(true);
        setSelectionPopup({ visible: false, x: 0, y: 0, text: '' });
    };


    const handleSendMessage = async (e) => {
        e.preventDefault();
        const userMessage = inputValue.trim();
        if (!userMessage) return;

        setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await api.post('/chat/ask', { question: userMessage });
            setMessages(prev => [...prev, { sender: 'bot', text: response.data.answer }]);
        } catch (error) {
            console.error("Failed to get response from AI:", error);
            setMessages(prev => [...prev, { sender: 'bot', text: "Sorry, I'm having trouble connecting. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleNewChat = () => {
        setMessages([
            { sender: 'bot', text: "Hi! I'm Maestro. Ask me anything about the musical terms you see here!" }
        ]);
        setInputValue('');
    };

    return (
        <>
            {/* Text Selection Popup (No changes here) */}
            {selectionPopup.visible && (
                <div
                    id="selection-popup"
                    className="fixed z-[9999] -translate-x-1/2"
                    style={{ top: `${selectionPopup.y}px`, left: `${selectionPopup.x}px` }}
                >
                    <button
                        onClick={handleAskAboutSelection}
                        className="flex items-center gap-2 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg border border-cyan-500/50 hover:bg-gray-800 transition-all"
                    >
                        <AskMaestroIcon />
                        <span className="text-sm font-semibold">Ask Maestro</span>
                    </button>
                </div>
            )}

            <div className="fixed bottom-4 right-0 z-50 font-sans chatbot-container">
                {/* Chat Window */}
                <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
                    <div
                        ref={chatWindowRef}
                        style={{ width: `${size.width}px`, height: `${size.height}px` }}
                        className="relative flex flex-col bg-black/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-cyan-500/20 overflow-hidden chat-window-bg"
                    >
                        {/* Resize Handle (No changes here) */}
                        <div
                            onMouseDown={startResizing}
                            className="absolute top-0 left-0 text-cyan-500/50 hover:text-cyan-400 cursor-nwse-resize p-2 z-20"
                            title="Drag to resize"
                        >
                            <ResizeIcon />
                        </div>

                        {/* Header (No changes here) */}
                        <div className="flex justify-between items-center p-4 border-b border-cyan-500/20 flex-shrink-0 sticky top-0 bg-black/50 backdrop-blur-xl z-10">
                            <h3 className="w-full text-center font-bold text-xl bg-gradient-to-r from-cyan-300 to-fuchsia-400 bg-clip-text text-transparent">Ask To Maestro</h3>
                            <div className="absolute right-4 flex items-center gap-2">
                                <button onClick={handleNewChat} className="text-gray-400 hover:text-white transition-colors" title="New Chat">
                                    <NewChatIcon />
                                </button>
                                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                    <CloseIcon />
                                </button>
                            </div>
                        </div>
                        {/* --- EDITED: Messages area to use the new BotMessage component --- */}
                        <div className="flex-grow p-4 space-y-6 overflow-y-auto">
                            {messages.map((msg, index) => {
                                if (msg.sender === 'user') {
                                    return (
                                        <div key={index} className="flex items-start gap-3 justify-end">
                                            <p className="max-w-[85%] p-3 rounded-lg text-white text-sm leading-relaxed bg-blue-600/80">
                                                {msg.text}
                                            </p>
                                        </div>
                                    );
                                } else {
                                    // It's a bot message, render it with the new component
                                    const isLastMessage = index === messages.length - 1 && !isLoading;
                                    return (
                                        <BotMessage
                                            key={index}
                                            text={msg.text}
                                            isLastMessage={isLastMessage}
                                            chatEndRef={chatEndRef}
                                        />
                                    );
                                }
                            })}
                            {isLoading && (
                                 <div className="flex items-start gap-3 justify-start">
                                     <div className="text-cyan-400 mt-1"><BotIcon /></div>
                                     <p className="p-3 rounded-lg text-white bg-gray-700/60">
                                         <span className="animate-pulse">...</span>
                                     </p>
                                 </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>
                        {/* Input (No changes here) */}
                        <div className="p-3 border-t border-cyan-500/20 flex-shrink-0 bg-black/50 backdrop-blur-xl">
                            <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                                <textarea
                                    ref={textareaRef}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage(e);
                                        }
                                    }}
                                    placeholder="Ask a question..."
                                    className="flex-grow bg-black/30 text-white rounded-lg px-4 py-3 border border-gray-600/50 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all resize-none overflow-y-hidden"
                                    rows={1}
                                    style={{maxHeight: '8rem'}}
                                    disabled={isLoading}
                                />
                                <button type="submit" className="bg-cyan-500 text-white rounded-lg p-3 self-end hover:bg-cyan-400 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors" disabled={isLoading}>
                                    <SendIcon />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Chatbot Toggle Button (No changes here) */}
                <button
                    onClick={() => setIsOpen(prev => !prev)}
                    className={`bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-full p-4 shadow-lg shadow-cyan-500/30 hover:scale-105 transition-all duration-300 ease-in-out flex items-center gap-3 ${isOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}
                    aria-label="Open AI Chat"
                >
                    <ChatIcon />
                    <span className="hidden sm:inline font-semibold pr-2">Ask To Maestro</span>
                </button>
            </div>
            {/* Style Block (No changes here) */}
            <style jsx global>{`
                @keyframes bg-pan {
                    0% { background-position: 0% 0%; }
                    100% { background-position: 100% 100%; }
                }
                .chat-window-bg {
                    background-image: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), 
                                      radial-gradient(at top left, rgba(0, 255, 255, 0.15) 0%, transparent 50%),
                                      radial-gradient(at bottom right, rgba(0, 80, 255, 0.15) 0%, transparent 50%);
                    background-size: 100% 100%, 200% 200%, 200% 200%;
                    animation: bg-pan 20s linear infinite;
                }
            `}</style>
        </>
    );
}

export default MusicChatbot;
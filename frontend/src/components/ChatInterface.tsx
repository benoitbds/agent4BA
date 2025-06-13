import React, { useState } from 'react';
import type { FormEvent } from 'react';

import fetchWithAuth from '../lib/fetchWithAuth'; // Assuming this handles auth tokens

interface CreatedItem {
  type: string;
  data: {
    id?: number;
    title?: string;
    [key: string]: unknown;
  };
}

interface Message {
  id: string; // Unique ID for each message
  text: string;
  sender: 'user' | 'ai';
  createdItem?: CreatedItem; // To store info about item created by AI
}

interface ChatInterfaceProps {
  projectId: number;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ projectId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Optional: Load initial messages or welcome message
  // useEffect(() => {
  //   setMessages([{ id: 'initial', text: 'Hello! How can I help you with your project today?', sender: 'ai' }]);
  // }, []);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString() + '-user',
      text: inputMessage,
      sender: 'user',
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      // The backend /chat endpoint expects project_id and message as query parameters
      const queryParams = new URLSearchParams({
        project_id: projectId.toString(),
        message: inputMessage,
      });

      const response = await fetchWithAuth(
        `${import.meta.env.VITE_API_BASE}/chat?${queryParams.toString()}`, // Corrected path if router has no prefix
                                                                            // If chat.py router has prefix /chat, then it's /chat/chat
                                                                            // The router in chat.py is APIRouter(tags=["Chat"], prefix=""), so /chat is correct
        {
          method: 'POST', // Even with query params, POST is fine. Backend uses message as query param.
                          // If backend expected JSON body, we'd send it here.
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Network response was not ok' }));
        throw new Error(errorData.detail || 'Failed to send message');
      }

      const data = await response.json();

      const aiMessage: Message = {
        id: Date.now().toString() + '-ai',
        text: data.reply,
        sender: 'ai',
        createdItem: data.created_item, // Store created item info
      };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);

      // Optional: If an item was created, maybe trigger a refresh of other components
      if (data.created_item) {
        console.log('AI created an item:', data.created_item);
        // Example: dispatch an event or call a callback
        // props.onItemCreated?.(data.created_item);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      // Optionally add error message to chat display
      // const errorMsgEntry: Message = { id: Date.now().toString() + '-err', text: `Error: ${errorMessage}`, sender: 'ai' };
      // setMessages((prevMessages) => [...prevMessages, errorMsgEntry]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-4 bg-white shadow">
      <h3 className="text-lg font-semibold text-gray-700">AI Chat Assistant</h3>
      <div className="h-80 overflow-y-auto p-3 space-y-3 bg-gray-50 rounded">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow ${
                msg.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <p>{msg.text}</p>
              {msg.createdItem && (
                <div className="mt-2 p-2 border-t border-gray-300 text-xs">
                  <p className="font-semibold">System Action:</p>
                  <p>Created {msg.createdItem.type}: "{msg.createdItem.data?.title || 'Unknown'}" (ID: {msg.createdItem.data?.id})</p>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="px-4 py-2 rounded-lg shadow bg-gray-200 text-gray-800 animate-pulse">
              AI is typing...
            </div>
          </div>
        )}
         {error && (
          <div className="flex justify-start">
            <div className="px-4 py-2 rounded-lg shadow bg-red-100 text-red-700">
              <p>Error: {error}</p>
            </div>
          </div>
        )}
      </div>
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask the AI to help with requirements..."
          className="flex-grow p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;

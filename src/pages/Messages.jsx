import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Search, 
  Phone, 
  Video, 
  MoreHorizontal,
  Paperclip,
  Smile,
  ArrowLeft,
  UserPlus,
  MessageCircle
} from 'lucide-react';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messages/conversations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await fetch(`/api/messages/conversations/${conversationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setMessages(data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const response = await fetch(`/api/messages/conversations/${selectedConversation._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          content: newMessage,
          messageType: 'text'
        })
      });

      const message = await response.json();
      setMessages([...messages, message]);
      setNewMessage('');
      
      // Update conversation's last message
      setConversations(convs => 
        convs.map(conv => 
          conv._id === selectedConversation._id 
            ? { ...conv, lastMessage: message, lastMessageAt: new Date() }
            : conv
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getOtherParticipant = (conversation) => {
    return conversation.participants.find(p => p._id !== localStorage.getItem('userId'));
  };

  const filteredConversations = conversations.filter(conv => {
    const otherParticipant = getOtherParticipant(conv);
    return otherParticipant?.username.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className={`${selectedConversation ? 'hidden lg:block' : 'block'} w-full lg:w-80 bg-white border-r border-gray-200 flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              title="New Chat"
            >
              <UserPlus size={20} />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations</h3>
              <p className="text-gray-500 mb-4">Start a new conversation to get started</p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                New Chat
              </button>
            </div>
          ) : (
            filteredConversations.map(conversation => {
              const otherParticipant = getOtherParticipant(conversation);
              return (
                <div
                  key={conversation._id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedConversation?._id === conversation._id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={otherParticipant?.avatar || '/default-avatar.png'}
                        alt={otherParticipant?.username}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {otherParticipant?.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 truncate">
                          {otherParticipant?.username}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatDate(conversation.lastMessageAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {conversation.lastMessage?.content || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-full"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="relative">
                  <img
                    src={getOtherParticipant(selectedConversation)?.avatar || '/default-avatar.png'}
                    alt={getOtherParticipant(selectedConversation)?.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {getOtherParticipant(selectedConversation)?.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {getOtherParticipant(selectedConversation)?.username}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {getOtherParticipant(selectedConversation)?.isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                  <Phone size={20} />
                </button>
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                  <Video size={20} />
                </button>
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                  <MoreHorizontal size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message, index) => {
                const isOwn = message.senderId._id === localStorage.getItem('userId');
                const showTime = index === 0 || 
                  new Date(message.createdAt).getTime() - new Date(messages[index - 1].createdAt).getTime() > 5 * 60 * 1000;

                return (
                  <div key={message._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isOwn 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-gray-900'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      {showTime && (
                        <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                          {formatTime(message.createdAt)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <form onSubmit={sendMessage} className="flex items-center space-x-2">
                <button
                  type="button"
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
                >
                  <Paperclip size={20} />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full py-2 px-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:bg-gray-100 rounded-full"
                  >
                    <Smile size={16} />
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-500">Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <NewChatModal 
          onClose={() => setShowNewChatModal(false)}
          onChatCreated={(conversation) => {
            setConversations([conversation, ...conversations]);
            setSelectedConversation(conversation);
            setShowNewChatModal(false);
          }}
        />
      )}
    </div>
  );
};

// New Chat Modal Component
const NewChatModal = ({ onClose, onChatCreated }) => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      searchUsers();
    } else {
      setUsers([]);
    }
  }, [searchTerm]);

  const searchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/search?q=${searchTerm}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (userId) => {
    try {
      const response = await fetch('/api/messages/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ receiverId: userId })
      });
      const conversation = await response.json();
      onChatCreated(conversation);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">New Chat</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="relative mb-4">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="max-h-60 overflow-y-auto">
          {loading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          )}
          
          {users.map(user => (
            <div
              key={user._id}
              onClick={() => createConversation(user._id)}
              className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
            >
              <img
                src={user.avatar || '/default-avatar.png'}
                alt={user.username}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h3 className="font-medium text-gray-900">{user.username}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
          ))}
          
          {searchTerm.length >= 2 && !loading && users.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No users found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;

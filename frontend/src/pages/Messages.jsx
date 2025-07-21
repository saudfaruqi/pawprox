import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Send, Heart, Reply, Trash2, Users, Bell, X, ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Modal component with improved styling and animations
const Modal = ({ isOpen, title, message, onConfirm, onCancel, confirmText, cancelText }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onCancel}></div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl z-10 max-w-md w-full p-6 transform transition-all animate-scaleIn">
        {title && <h3 className="text-xl font-bold mb-3 dark:text-white">{title}</h3>}
        {message && <p className="mb-6 text-gray-600 dark:text-gray-300">{message}</p>}
        <div className="flex justify-end space-x-3">
          {onCancel && (
            <button 
              onClick={onCancel} 
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-all focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              {cancelText || 'Cancel'}
            </button>
          )}
          <button 
            onClick={onConfirm} 
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {confirmText || 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Enhanced message component with reactions, animations and better styling
const Message = ({ message, onLike, onReply, currentUserId, onDelete }) => {
  const [showActions, setShowActions] = useState(false);
  
  if (!currentUserId) {
    console.warn('currentUserId is not set');
    return null;
  }
  
  const isSender = String(message.sender_id) === String(currentUserId);
  const initials = message.username ? message.username.slice(0, 2).toUpperCase() : 'UN';
  const messageTime = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const messageDate = new Date(message.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
  const isToday = new Date(message.timestamp).toDateString() === new Date().toDateString();

  // Helper to get a full URL if the profilePic is a relative path
  const getProfilePicUrl = (pic) => {
    if (!pic) return null;
    return pic.startsWith('http') ? pic : `https://pawprox-6dd216fb1ef5.herokuapp.com/${pic}`;
  };

  return (
    <div className="w-full mb-4 group">
      <div className={`flex items-end ${isSender ? 'justify-end' : 'justify-start'}`}>
        {/* For receiver messages, show profile pic on the left */}
        {!isSender && (
          <div className="mr-3 flex-shrink-0">
            {getProfilePicUrl(message.profilePic) ? (
              <img
                src={getProfilePicUrl(message.profilePic)}
                alt={message.username}
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 shadow-sm"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-sm font-medium text-white shadow-sm">
                {initials}
              </div>
            )}
          </div>
        )}
        
        <div className={`max-w-xs sm:max-w-sm md:max-w-md ${isSender ? 'mr-3' : 'ml-3'}`}>
          <div
            className={`relative px-4 py-3 rounded-2xl shadow-sm hover:shadow-md transition-all ${
              isSender 
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-none' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
            }`}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
          >
            {!isSender && <p className="text-sm font-bold mb-1">{message.username}</p>}
            <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
            
            {/* Message actions overlay */}
            {showActions && (
              <div className={`absolute ${isSender ? 'left-0 -translate-x-full pl-2' : 'right-0 translate-x-full pr-2'} top-1/2 -translate-y-1/2 flex items-center space-x-1 transition-opacity opacity-100`}>
                <button 
                  onClick={() => onLike(message.id)} 
                  className={`p-1.5 rounded-full ${message.likes > 0 ? 'bg-pink-100 text-pink-500' : 'bg-gray-200 text-gray-500'} hover:bg-pink-200 hover:text-pink-600 transition-colors`}
                  title="Like"
                >
                  <Heart size={14} className={message.likes > 0 ? 'fill-pink-500' : ''} />
                  {message.likes > 0 && <span className="text-xs ml-1">{message.likes}</span>}
                </button>
                <button 
                  onClick={() => onReply(message.id)} 
                  className="p-1.5 rounded-full bg-gray-200 text-gray-500 hover:bg-indigo-200 hover:text-indigo-600 transition-colors"
                  title="Reply"
                >
                  <Reply size={14} />
                </button>
                {isSender && (
                  <button 
                    onClick={() => onDelete(message.id)} 
                    className="p-1.5 rounded-full bg-gray-200 text-gray-500 hover:bg-red-200 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            )}
          </div>
          
          <div className={`flex ${isSender ? 'justify-end' : 'justify-start'} mt-1 text-xs text-gray-500`}>
            <span>{isToday ? messageTime : `${messageDate}, ${messageTime}`}</span>
            {message.likes > 0 && !showActions && (
              <span className="ml-2 text-pink-500 flex items-center">
                <Heart size={12} className="fill-pink-500 mr-1" />{message.likes}
              </span>
            )}
          </div>
        </div>
        
        {/* For sender messages, show profile pic on the right */}
        {isSender && (
          <div className="flex-shrink-0">
            {getProfilePicUrl(message.profilePic) ? (
              <img
                src={getProfilePicUrl(message.profilePic)}
                alt={message.username}
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 shadow-sm"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center text-sm font-medium text-white shadow-sm">
                {initials}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Improved ChatInput component with emoji picker and attachment options
const ChatInput = ({ messageText, onMessageChange, onSendMessage }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="flex items-center gap-2 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-lg">
      <div className="flex-1 relative">
        <textarea
          value={messageText}
          onChange={onMessageChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent resize-none dark:bg-gray-700 dark:text-white"
          rows={1}
          style={{ minHeight: '50px', maxHeight: '120px' }}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2 text-gray-400">
          {/* This could be replaced with actual emoji picker in a production app */}
          <button className="hover:text-indigo-500 transition-colors p-1">
            😊
          </button>
        </div>
      </div>
      <button
        onClick={onSendMessage}
        disabled={!messageText.trim()}
        className={`p-3 rounded-xl ${
          messageText.trim() 
            ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-md' 
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        } transition-all`}
      >
        <Send size={20} />
      </button>
    </div>
  );
};

// New component for user search results
const UserSearchResults = ({ users, friendStatuses, onSelectUser, onSendFriendRequest }) => {
  if (users.length === 0) return null;
  
  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium text-gray-500 mb-2">SEARCH RESULTS</h3>
      <ul className="space-y-2">
        {users.map(user => (
          <li key={user.id} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3" onClick={() => onSelectUser(user)}>
                {user.profilePic ? (
                  <img 
                    src={user.profilePic.startsWith('http') ? user.profilePic : `https://pawprox-6dd216fb1ef5.herokuapp.com/${user.profilePic}`} 
                    alt={user.username} 
                    className="w-9 h-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-center text-white">
                    {user.username.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{user.username}</p>
                  <p className="text-xs text-gray-500">{user.name || 'No name set'}</p>
                </div>
              </div>
              {!friendStatuses[user.id] && (
                <button
                  onClick={() => onSendFriendRequest(user.id)}
                  className="text-xs font-medium px-2 py-1 rounded-md bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-700 dark:text-indigo-100 dark:hover:bg-indigo-600 transition-colors"
                >
                  Add Friend
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

// New component for friend requests with improved UI
const FriendRequests = ({ requests, onAccept, onDecline }) => {
  if (requests.length === 0) return null;
  
  return (
    <div className="mb-6">
      <div className="flex items-center mb-2">
        <Bell size={16} className="text-yellow-500 mr-2" />
        <h3 className="text-sm font-medium text-gray-500">FRIEND REQUESTS</h3>
      </div>
      <ul className="space-y-2">
        {requests.map(req => (
          <li key={req.id} className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {req.senderPic ? (
                  <img
                    src={req.senderPic.startsWith('http') ? req.senderPic : `https://pawprox-6dd216fb1ef5.herokuapp.com/${req.senderPic}`}
                    alt={req.senderName}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-gradient-to-r from-orange-400 to-yellow-500 flex items-center justify-center text-white text-xs">
                    {req.senderName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{req.senderName}</p>
                  <p className="text-xs text-gray-500">Wants to connect with you</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onAccept(req.id, req.sender_id)}
                  className="px-3 py-1 rounded-md bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition-colors"
                >
                  Accept
                </button>
                <button
                  onClick={() => onDecline(req.id)}
                  className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Decline
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

// New component for friends list with online status
const FriendsList = ({ friends, onSelectFriend, onRemoveFriend, selectedFriendId }) => {
  if (friends.length === 0) return null;
  
  return (
    <div>
      <div className="flex items-center mb-2">
        <Users size={16} className="text-indigo-500 mr-2" />
        <h3 className="text-sm font-medium text-gray-500">FRIENDS</h3>
      </div>
      <ul className="space-y-1">
        {friends.map(friend => (
          <li 
            key={friend.id} 
            className={`p-2 rounded-lg ${selectedFriendId === friend.id ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-700'} transition-colors cursor-pointer group`}
          >
            <div className="flex items-center justify-between">
              <div 
                className="flex items-center space-x-3 flex-1" 
                onClick={() => onSelectFriend(friend)}
              >
                <div className="relative">
                  {friend.profilePic ? (
                    <img 
                      src={friend.profilePic.startsWith('http') ? friend.profilePic : `https://pawprox-6dd216fb1ef5.herokuapp.com/${friend.profilePic}`} 
                      alt={friend.username} 
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-400 to-blue-500 flex items-center justify-center text-white">
                      {friend.username.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  {/* Online status indicator - this would be dynamic in a real app */}
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${Math.random() > 0.5 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{friend.username}</p>
                  <p className="text-xs text-gray-500">{Math.random() > 0.5 ? 'Online' : 'Offline'}</p>
                </div>
              </div>
              <button
                onClick={() => onRemoveFriend(friend.id)}
                className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X size={16} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Chat component with improved auto-scroll behavior and layout fixes
const Chat = () => {
  // Retrieve current user info from localStorage
  const storedUser = localStorage.getItem('user');
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const currentUserId = currentUser ? currentUser.id : null;

  const [socket, setSocket] = useState(null);
  const [users, setUsers] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const [friendStatuses, setFriendStatuses] = useState({});
  const [friendRequests, setFriendRequests] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [isMobileViewActive, setIsMobileViewActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null,
  });

  // Modal helpers
  const openModal = (config) => setModalConfig({ isOpen: true, ...config });
  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

  // Check if the user is near the bottom of the messages container
  const scrollIfAtBottom = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      // Only scroll if the user is within 50px of the bottom
      if (scrollHeight - scrollTop - clientHeight < 50) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Handle window resize for responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Establish Socket.IO connection
  useEffect(() => {
    const newSocket = io('https://pawprox-6dd216fb1ef5.herokuapp.com', {
      auth: { token: localStorage.getItem('token') },
    });
    
    setSocket(newSocket);
    
    newSocket.on('connect', () => {
      console.log('Connected to chat server');
    });
    
    newSocket.on('disconnect', () => {
      console.log('Disconnected from chat server');
    });
    
    // Listen for new messages to update unread counts
    newSocket.on('newMessage', (data) => {
      if (data.sender_id !== currentUserId) {
        setUnreadCounts(prev => ({
          ...prev,
          [data.sender_id]: (prev[data.sender_id] || 0) + 1
        }));
      }
    });
    
    return () => newSocket.close();
  }, [currentUserId]);

  // Search users when query is non-empty
  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setUsers([]);
      return;
    }
    
    setIsLoading(true);
    const url = `https://pawprox-6dd216fb1ef5.herokuapp.com/api/users?search=${encodeURIComponent(debouncedSearch)}`;
    
    fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setIsLoading(false);
        if (!Array.isArray(data)) {
          console.error('Expected an array of users but got:', data);
          return;
        }
        const filtered = data.filter(user => user.id !== currentUserId);
        setUsers(filtered);
        
        // Check friend status for each result
        Promise.all(
          filtered.map(user =>
            fetch(`https://pawprox-6dd216fb1ef5.herokuapp.com/api/friends/check/${user.id}`, {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            })
              .then(res => res.json())
              .then(result => ({ id: user.id, areFriends: result.areFriends }))
          )
        )
          .then(results => {
            const statuses = results.reduce((acc, cur) => {
              acc[cur.id] = cur.areFriends;
              return acc;
            }, {});
            setFriendStatuses(prev => ({ ...prev, ...statuses }));
          })
          .catch(err => console.error('Error checking friend statuses:', err));
      })
      .catch(err => {
        console.error('Error fetching users:', err);
        setIsLoading(false);
      });
  }, [debouncedSearch, currentUserId]);

  // Fetch accepted friends when search query is empty
  useEffect(() => {
    if (debouncedSearch.trim()) {
      return;
    };
    
    setIsLoading(true);
    const url = `https://pawprox-6dd216fb1ef5.herokuapp.com/api/friends/accepted`;
    
    fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setIsLoading(false);
        if (Array.isArray(data)) {
          setFriendsList(data);
          const statuses = data.reduce((acc, friend) => {
            acc[friend.id] = true;
            return acc;
          }, {});
          setFriendStatuses(prev => ({ ...prev, ...statuses }));
        } else {
          console.error('Expected accepted friends as an array, but got:', data);
        }
      })
      .catch(err => {
        console.error('Error fetching accepted friends:', err);
        setIsLoading(false);
      });
  }, [debouncedSearch, currentUserId]);

  // Fetch incoming friend requests
  useEffect(() => {
    const url = `https://pawprox-6dd216fb1ef5.herokuapp.com/api/friends/requests`;
    
    fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setFriendRequests(data);
        } else {
          console.error('Expected friend requests as an array, but got:', data);
        }
      })
      .catch(err => console.error('Error fetching friend requests:', err));
  }, [currentUserId]);

  // Join chat room and fetch conversation when a friend is selected
  useEffect(() => {
    if (socket && selectedUser && friendStatuses[selectedUser.id]) {
      const room = [currentUserId, selectedUser.id].sort().join('_');
      
      setIsLoading(true);
      socket.emit('joinRoom', { room });
      
      // Reset unread count for this friend
      setUnreadCounts(prev => ({ ...prev, [selectedUser.id]: 0 }));
      
      fetch(`https://pawprox-6dd216fb1ef5.herokuapp.com/api/chat/conversation?receiver_id=${selectedUser.id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setIsLoading(false);
          if (Array.isArray(data)) {
            setMessages(data);
            // For initial load, scroll to bottom unconditionally
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }
        })
        .catch((err) => {
          console.error('Error fetching conversation:', err);
          setIsLoading(false);
        });

      socket.on('message', (message) => {
        setMessages((prev) => [...prev, message]);
        // Only scroll if the user is near the bottom
        setTimeout(() => scrollIfAtBottom(), 100);
      });
      
      socket.on('messageLiked', (updatedMessage) => {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg))
        );
      });
      
      socket.on('messageDeleted', (messageId) => {
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      });
      
      return () => {
        socket.off('message');
        socket.off('messageLiked');
        socket.off('messageDeleted');
      };
    }
  }, [socket, selectedUser, currentUserId, friendStatuses]);

  // Chat input handlers
  const handleMessageChange = (e) => setMessageText(e.target.value);
  
  const handleSendMessage = () => {
    if (messageText.trim() && selectedUser && socket && friendStatuses[selectedUser.id]) {
      const room = [currentUserId, selectedUser.id].sort().join('_');
      const newMessage = {
        sender_id: currentUserId,
        receiver_id: selectedUser.id,
        text: messageText,
        likes: 0,
        timestamp: new Date(),
        username: currentUser.name,
        profilePic: currentUser.profilePic,
      };
      socket.emit('sendMessage', { room, message: newMessage });
      setMessageText('');
      // Do not force scroll here so as not to disturb the user’s current scroll position.
    }
  };
  
  const handleLikeMessage = (messageId) => {
    if (socket && selectedUser && friendStatuses[selectedUser.id]) {
      const room = [currentUserId, selectedUser.id].sort().join('_');
      socket.emit('likeMessage', { messageId, room });
    }
  };
  
  const handleReplyMessage = (messageId) => {
    // Find the message being replied to
    const replyMessage = messages.find(msg => msg.id === messageId);
    if (replyMessage) {
      setMessageText(prev => `> ${replyMessage.text}\n\n${prev}`);
    }
  };
  
  const handleDeleteMessage = (messageId) => {
    if (socket && selectedUser) {
      openModal({
        title: 'Delete Message',
        message: "Are you sure you want to delete this message? This cannot be undone.",
        onConfirm: () => {
          const room = [currentUserId, selectedUser.id].sort().join('_');
          socket.emit('deleteMessage', { messageId, room });
          closeModal();
        },
        onCancel: closeModal,
        cancelText: 'Cancel',
        confirmText: 'Delete',
      });
    }
  };

  // Friend request actions using modals instead of alerts
  const sendFriendRequest = (userId) => {
    fetch('https://pawprox-6dd216fb1ef5.herokuapp.com/api/friends/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ receiver_id: userId })
    })
      .then(res => res.json())
      .then(data => {
        openModal({
          title: 'Friend Request',
          message: 'Friend request sent successfully!',
          onConfirm: closeModal,
        });
      })
      .catch(err => console.error('Error sending friend request:', err));
  };

  const handleAcceptRequest = (requestId, senderId) => {
    fetch(`https://pawprox-6dd216fb1ef5.herokuapp.com/api/friends/accept/${requestId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setFriendStatuses(prev => ({ ...prev, [senderId]: true }));
        setFriendRequests(prev => prev.filter(req => req.id !== requestId));
        
        // Fetch the friend's details to add to friendsList
        fetch(`https://pawprox-6dd216fb1ef5.herokuapp.com/api/users/${senderId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
          .then(res => res.json())
          .then(friendData => {
            setFriendsList(prev => [...prev, friendData]);
          })
          .catch(err => console.error('Error fetching friend details:', err));
      })
      .catch(err => console.error('Error accepting friend request:', err));
  };

  const handleDeclineRequest = (requestId) => {
    fetch(`https://pawprox-6dd216fb1ef5.herokuapp.com/api/friends/decline/${requestId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setFriendRequests(prev => prev.filter(req => req.id !== requestId));
      })
      .catch(err => console.error('Error declining friend request:', err));
  };

  const handleRemoveFriend = (friendId) => {
    openModal({
      title: 'Remove Friend',
      message: 'Are you sure you want to remove this friend?',
      onConfirm: () => {
         fetch(`https://pawprox-6dd216fb1ef5.herokuapp.com/api/friends/remove/${friendId}`, {
           method: 'DELETE',
           headers: {
             'Content-Type': 'application/json',
             'Authorization': `Bearer ${localStorage.getItem('token')}`
           }
         })
         .then(res => res.json())
         .then(data => {
             setFriendsList(prev => prev.filter(friend => friend.id !== friendId));
             setFriendStatuses(prev => {
                const newStatuses = { ...prev };
                delete newStatuses[friendId];
                return newStatuses;
             });
             closeModal();
         })
         .catch(err => console.error('Error removing friend:', err));
      },
      onCancel: closeModal,
      cancelText: 'Cancel',
      confirmText: 'Remove',
    });
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    if (isMobile) {
      setIsMobileViewActive(true);
    }
  };

  return (
    <div>
      <Header />
      <div className="relative flex flex-1 overflow-hidden mt-[120px] h-[80vh] w-[90%] mx-auto mb-12">
        {/* Sidebar for users */}
        <div className={`w-1/4 border-r border-gray-200 dark:bg-gray-700 ${isMobile && isMobileViewActive ? 'hidden' : 'block'}`}>
          <div className="p-4">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="w-full p-2 border rounded-md"
            />
          </div>
          <UserSearchResults 
            users={users} 
            friendStatuses={friendStatuses} 
            onSelectUser={handleSelectUser} 
            onSendFriendRequest={sendFriendRequest} 
          />
          <FriendRequests 
            requests={friendRequests} 
            onAccept={handleAcceptRequest} 
            onDecline={handleDeclineRequest} 
          />
          <FriendsList 
            friends={friendsList} 
            onSelectFriend={handleSelectUser} 
            onRemoveFriend={handleRemoveFriend} 
            selectedFriendId={selectedUser ? selectedUser.id : null} 
          />
        </div>
        
        {/* Chat conversation area */}
        <div className={`flex bg-slate-100 flex-col flex-1 ${isMobile && !isMobileViewActive ? 'hidden' : 'block'}`}>
          {isMobile && isMobileViewActive && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
              <button onClick={() => setIsMobileViewActive(false)} className="mr-2">
                <ArrowLeft size={20} />
              </button>
              <h2 className="text-lg font-semibold">{selectedUser ? selectedUser.username : 'Chat'}</h2>
            </div>
          )}
          {/* Attach the messages container ref here */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 min-h-0">
            {isLoading ? (
              <p className="text-center text-gray-500">Loading...</p>
            ) : (
              messages.map(msg => (
                <Message 
                  key={msg.id} 
                  message={msg} 
                  onLike={handleLikeMessage} 
                  onReply={handleReplyMessage} 
                  currentUserId={currentUserId}
                  onDelete={handleDeleteMessage}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          {selectedUser && (
            <ChatInput 
              messageText={messageText} 
              onMessageChange={handleMessageChange} 
              onSendMessage={handleSendMessage} 
            />
          )}
        </div>
      </div>
      <Footer />
      <Modal 
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
        onCancel={modalConfig.onCancel}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
      />
    </div>
  );
};

export default Chat;

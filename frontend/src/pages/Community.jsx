import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  Send,
  ThumbsUp,
  Laugh,
  Image as ImageIcon,
  Bookmark,
  MessageSquare,
  AlertCircle,
  ChevronDown,
  MoreHorizontal,
  X
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://pawprox-6dd216fb1ef5.herokuapp.com/api';

// Get current user from localStorage
const storedUser = localStorage.getItem("user");
const currentUser = storedUser ? JSON.parse(storedUser) : null;
const currentUserId = currentUser ? currentUser.id : null;

// Animation for reaction buttons
const ReactionButton = ({ icon: Icon, count, onClick, active, label }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  const handleClick = () => {
    setIsAnimating(true);
    onClick();
    setTimeout(() => setIsAnimating(false), 700);
  };

  return (
    <button
      onClick={handleClick}
      aria-label={label}
      className={`flex items-center gap-1 px-3 py-2 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50
        ${active ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-100'}`}
    >
      <span className={`transition-transform ${isAnimating ? 'scale-150' : 'scale-100'}`}>
        <Icon size={18} className={active ? 'fill-blue-600' : ''} />
      </span>
      <span className="text-sm font-semibold">{count > 0 ? count : ''}</span>
    </button>
  );
};

// Skeleton loader for posts
const PostSkeleton = () => (
  <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mb-6 animate-pulse">
    <div className="p-5">
      <div className="flex items-center gap-4 mb-4">
        <div className="h-12 w-12 rounded-full bg-gray-200" />
        <div className="space-y-2">
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-3 w-24 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-2/3 bg-gray-200 rounded" />
      </div>
      <div className="h-52 w-full bg-gray-200 rounded-lg" />
    </div>
    <div className="border-t border-gray-100 p-4">
      <div className="flex justify-around">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-8 w-16 bg-gray-200 rounded" />
        ))}
      </div>
    </div>
  </div>
);

// For example, in your Comment component:
const Comment = ({ comment, onReply, onUpdate, onDelete, level = 0 }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(comment.text);
  const initials = comment.username.slice(0, 2).toUpperCase();
  const commentDate = comment.timestamp
    ? new Date(comment.timestamp.replace(' ', 'T'))
    : new Date();

  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const currentUserId = currentUser ? currentUser.id : null;  

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onReply(comment.id, replyText);
    setReplyText('');
    setShowReplyInput(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editedText.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/comments/${comment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text: editedText })
      });
      if (res.ok) {
        const updatedComment = await res.json();
        onUpdate(updatedComment);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/comments/${comment.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        onDelete(comment.id);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const canShowReplies = level < 3;

  return (
    <div className={`py-3 ${level === 0 ? 'border-b last:border-0' : ''}`}>
      <div className="flex gap-3">
        <div className="h-8 w-8 rounded-full overflow-hidden flex-shrink-0">
          {comment.profilePic ? (
            <img
              src={
                comment.profilePic.startsWith('http')
                  ? comment.profilePic
                  : `${API_BASE_URL.replace('/api', '')}/${comment.profilePic}`
              }
              alt={`${comment.username} profile`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-xs font-medium text-white h-full w-full">
              {initials}
            </div>
          )}
        </div>
        <div className="flex-1">
          {isEditing ? (
            <form onSubmit={handleEditSubmit} className="bg-gray-50 p-3 rounded-lg shadow-sm">
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => { setIsEditing(false); setEditedText(comment.text); }}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-gray-50 p-3 rounded-lg shadow-sm">
              <p className="font-semibold text-gray-800 text-sm">{comment.username}</p>
              <p className="text-gray-700 text-sm mt-1">{comment.text}</p>
            </div>
          )}
          <div className="flex items-center mt-1 text-xs text-gray-500">
            <button 
              className="mr-3 hover:text-blue-600 transition-colors"
              onClick={() => {}}
            >
              Like
            </button>
            <button 
              className="mr-3 hover:text-blue-600 transition-colors"
              onClick={() => setShowReplyInput(!showReplyInput)}
            >
              Reply
            </button>
            <span>{commentDate.toLocaleDateString()}</span>
            {String(comment.user_id) === String(currentUserId) && !isEditing && (
              <>
                <button 
                  className="ml-3 text-xs text-gray-500 hover:text-blue-600"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </button>
                <button 
                  className="ml-2 text-xs text-red-600 hover:text-red-800"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </>
            )}
          </div>
          {showReplyInput && (
            <form onSubmit={handleReplySubmit} className="mt-2 flex gap-2">
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 py-1 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="p-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Send Reply"
              >
                <Send size={14} />
              </button>
            </form>
          )}
          {canShowReplies && comment.replies && comment.replies.length > 0 && (
            <div className="mt-2 ml-3 pl-3 border-l-2 border-gray-100 space-y-3">
              {comment.replies.map((reply) => (
                <Comment 
                  key={reply.id} 
                  comment={reply} 
                  onReply={onReply}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced Post component with edit, delete, and bookmark functionality
const Post = ({ post, onReact, onComment, onBookmark, onDeletePost, onUpdatePost }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [showOptions, setShowOptions] = useState(false);
  const commentInputRef = useRef(null);
  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const currentUserId = currentUser ? currentUser.id : null;
  
  const initials = post.username.slice(0, 2).toUpperCase();
  const postDate = post.timestamp
    ? new Date(post.timestamp.replace(' ', 'T'))
    : new Date();
    
  const isBookmarked = post.isBookmarked || false;
  const contentPreviewLength = 250;
  const hasLongContent = post.content && post.content.length > contentPreviewLength;
  const displayContent = !isExpanded && hasLongContent 
    ? post.content.substring(0, contentPreviewLength) + '...' 
    : post.content;

  const handleReaction = async (type) => {
    if (post.currentUserReaction === type) return;
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${post.id}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ type })
      });
      if (response.ok) {
        const updatedPost = await response.json();
        onReact(updatedPost);
      }
    } catch (error) {
      console.error("Error updating reaction:", error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${post.id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ text: commentText })
      });
      if (response.ok) {
        const updatedPost = await response.json();
        onComment(updatedPost);
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    }
    setCommentText('');
  };
  
  const handleReply = async (commentId, text) => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${post.id}/comments/${commentId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ text })
      });
      if (response.ok) {
        const updatedPost = await response.json();
        onComment(updatedPost);
      }
    } catch (error) {
      console.error('Error posting reply:', error);
    }
  };

  const handleEditPost = () => {
    setIsEditing(true);
    setEditedContent(post.content);
    setShowOptions(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(post.content);
  };

  const handleSaveEdit = async () => {
    if (!editedContent.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/posts/${post.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: editedContent })
      });
      if (res.ok) {
        const updatedPost = await res.json();
        onUpdatePost(updatedPost);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/posts/${post.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        onDeletePost(post.id);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const toggleBookmark = () => {
    onBookmark && onBookmark(post.id, !isBookmarked);
  };
  
  const focusCommentInput = () => {
    setShowComments(true);
    setTimeout(() => {
      commentInputRef.current?.focus();
    }, 100);
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mb-6 transform transition-all duration-200 hover:shadow-lg">
      <div className="p-5">
        {/* Post Header */}
        <div className="flex items-center gap-4 mb-4 relative">
          <div className="h-12 w-12 rounded-full overflow-hidden">
            {post.profilePic ? (
              <img
                src={
                  post.profilePic.startsWith('http')
                    ? post.profilePic
                    : `${API_BASE_URL.replace('/api', '')}/${post.profilePic}`
                }
                alt={`${post.username} profile`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-lg font-medium text-white h-full w-full">
                {initials}
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-800">{post.username}</p>
                <p className="text-xs text-gray-500">
                  {postDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric'
                  })}
                </p>
              </div>
              {String(post.user_id) === String(currentUserId) && (
                <div className="relative">
                  <button
                    onClick={() => setShowOptions(!showOptions)}
                    className="text-gray-400 hover:text-gray-700 p-2 rounded-full transition-colors focus:outline-none"
                  >
                    <MoreHorizontal size={18} />
                  </button>
                  {showOptions && (
                    <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-10">
                      <button
                        onClick={handleEditPost}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Edit Post
                      </button>
                      <button
                        onClick={handleDeletePost}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Delete Post
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Post Content */}
        {isEditing ? (
          <div className="mb-4">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-800 mb-4 whitespace-pre-wrap">{displayContent}</p>
            {hasLongContent && (
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-4 focus:outline-none transition-colors"
              >
                {isExpanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </>
        )}
        
        {post.image && (
          <div className="mb-4 cursor-pointer" onClick={() => setIsImageModalOpen(true)}>
            <img
              src={
                post.image.startsWith('data:')
                  ? post.image
                  : `${API_BASE_URL.replace('/api', '')}${post.image}`
              }
              alt="Post content"
              className="w-full object-cover rounded-lg max-h-[500px] hover:opacity-95 transition-opacity"
              loading="lazy"
            />
          </div>
        )}
        
        {/* Modal for full-size image viewing */}
        {isImageModalOpen && post.image && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <button 
              className="absolute top-4 right-4 text-white hover:text-gray-300 p-2"
              onClick={() => setIsImageModalOpen(false)}
            >
              <X size={24} />
            </button>
            <img
              src={
                post.image.startsWith('data:')
                  ? post.image
                  : `${API_BASE_URL.replace('/api', '')}${post.image}`
              }
              alt="Post content"
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>
        )}
        
        {/* Post Reactions and Comment Toggle */}
        <div className="flex items-center justify-between text-sm text-gray-600 border-t pt-3">
          <div className="flex items-center gap-2">
            {(post.reactions.like + post.reactions.love + post.reactions.haha) > 0 && (
              <>
                <div className="flex -space-x-1">
                  {post.reactions.like > 0 && (
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                      <ThumbsUp size={12} className="text-blue-600" />
                    </div>
                  )}
                  {post.reactions.love > 0 && (
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                      <Heart size={12} className="text-red-600" />
                    </div>
                  )}
                  {post.reactions.haha > 0 && (
                    <div className="w-5 h-5 rounded-full bg-yellow-100 flex items-center justify-center">
                      <Laugh size={12} className="text-yellow-600" />
                    </div>
                  )}
                </div>
                <span className="font-semibold">
                  {post.reactions.like + post.reactions.love + post.reactions.haha}
                </span>
              </>
            )}
          </div>
          <button
            onClick={() => setShowComments(!showComments)}
            className="hover:underline focus:outline-none flex items-center gap-1"
          >
            <span>{post.comments.length}</span>
            <span>{post.comments.length === 1 ? 'comment' : 'comments'}</span>
          </button>
        </div>
      </div>
      
      {/* Reaction Buttons */}
      <div className="border-t border-gray-100">
        <div className="flex justify-around p-2">
          <ReactionButton
            icon={ThumbsUp}
            count={post.reactions.like}
            onClick={() => handleReaction('like')}
            active={post.currentUserReaction === 'like'}
            label="Like"
          />
          <ReactionButton
            icon={Heart}
            count={post.reactions.love}
            onClick={() => handleReaction('love')}
            active={post.currentUserReaction === 'love'}
            label="Love"
          />
          <ReactionButton
            icon={Laugh}
            count={post.reactions.haha}
            onClick={() => handleReaction('haha')}
            active={post.currentUserReaction === 'haha'}
            label="Haha"
          />
          <button
            onClick={focusCommentInput}
            className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
            aria-label="Comment"
          >
            <MessageSquare size={18} />
          </button>
          <button
            onClick={toggleBookmark}
            className={`flex items-center gap-1 px-3 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50
              ${isBookmarked ? 'text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            aria-label="Bookmark"
          >
            <Bookmark size={18} className={isBookmarked ? 'fill-blue-600' : ''} />
          </button>
        </div>
      </div>
      
      {/* Comments Section */}
      {showComments && (
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          {post.comments.length > 0 ? (
            <div className="space-y-1 mb-4 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {post.comments.map((comment) => (
                <Comment 
                  key={comment.id} 
                  comment={comment} 
                  onReply={handleReply}
                  onUpdate={(updatedComment) => {
                    onComment(updatedComment);
                  }}
                  onDelete={(commentId) => {
                    onComment({ ...post, comments: post.comments.filter(c => c.id !== commentId) });
                  }}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 text-sm py-3">No comments yet. Be the first to comment!</p>
          )}
          <form onSubmit={handleCommentSubmit} className="flex gap-3 items-end">
            <textarea
              ref={commentInputRef}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white min-h-[60px] text-sm"
              rows={2}
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className={`p-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400
                ${commentText.trim() 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              aria-label="Send Comment"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

// Enhanced post creation component with image preview and emoji picker
const CreatePost = ({ onSubmit }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setError(null);
    } else if (file) {
      setError('Please select a valid image file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('content', content);
      if (image) {
        formData.append('image', image);
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Error creating post');
        return;
      }
      const newPost = await response.json();
      onSubmit(newPost);
      
      setContent('');
      setImage(null);
      setPreview('');
      setError(null);
    } catch (error) {
      console.error('Error during posting:', error);
      setError('An error occurred while creating the post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 mb-8 overflow-hidden">
      <div className="p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Create Post</h2>
        <form
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          className="space-y-4"
        >
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full min-h-[120px] p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              disabled={isSubmitting}
            />
            {showEmojiPicker && (
              <div className="absolute bottom-2 right-2 bg-white shadow-lg rounded-lg p-2 border border-gray-200">
                <div className="grid grid-cols-8 gap-1">
                  {['😊', '😂', '❤️', '👍', '🎉', '🔥', '👏', '🙏'].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        setContent(content + emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="w-8 h-8 text-xl hover:bg-gray-100 rounded flex items-center justify-center"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {preview && (
            <div className="relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
              <img
                src={preview}
                alt="Upload preview"
                className="w-full object-contain max-h-[300px]"
              />
              <button
                type="button"
                className="absolute top-2 right-2 h-8 w-8 rounded-full bg-gray-800/70 text-white flex items-center justify-center hover:bg-gray-800 transition-colors focus:outline-none"
                onClick={() => {
                  setImage(null);
                  setPreview('');
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                aria-label="Remove image"
              >
                <X size={16} />
              </button>
            </div>
          )}
          
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
              <AlertCircle size={16} />
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors cursor-pointer px-3 py-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                disabled={isSubmitting}
              >
                <ImageIcon size={18} />
                <span className="text-sm font-medium">Add Image</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isSubmitting}
                />
              </button>
              
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors cursor-pointer px-3 py-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                disabled={isSubmitting}
              >
                <span className="text-xl">😊</span>
              </button>
            </div>
            
            <button
              type="submit"
              disabled={!content.trim() || isSubmitting}
              className={`px-6 py-2 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50
                ${(!content.trim() || isSubmitting)
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow'}`}
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main content with infinite scroll and error handling
const MainContent = ({ posts, addNewPost, updatePost, onBookmark, isLoading, loadMorePosts, hasMore, deletePost }) => (
  <div className="min-h-screen bg-gray-50 py-10">
    <div className="container max-w-4xl mx-auto px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        Community Feed
      </h1>
      
      <CreatePost onSubmit={addNewPost} />
      
      {posts.length === 0 && !isLoading ? (
        <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500">No posts yet. Be the first to share something!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <Post
              key={post.id}
              post={post}
              onReact={updatePost}
              onComment={updatePost}
              onBookmark={onBookmark}
              onDeletePost={deletePost}
              onUpdatePost={updatePost}
            />
          ))}
          
          {isLoading && (
            <>
              <PostSkeleton />
              <PostSkeleton />
            </>
          )}
          
          {hasMore && !isLoading && (
            <button 
              onClick={loadMorePosts}
              className="w-full py-3 bg-white text-blue-600 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
            >
              <span>Load more posts</span>
              <ChevronDown size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  </div>
);

// Community component with state management and infinite scroll
const Community = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const postsPerPage = 5;

  const fetchPosts = async (pageNum = 1, append = false) => {
    try {
      setFetchError(null);
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const res = await fetch(`${API_BASE_URL}/posts?page=${pageNum}&limit=${postsPerPage}`);
      if (!res.ok) throw new Error('Failed to fetch posts');
      const data = await res.json();
      if (data.length < postsPerPage) {
        setHasMore(false);
      }
      if (append) {
        setPosts(prevPosts => [...prevPosts, ...data]);
      } else {
        setPosts(data);
      }
      setPage(pageNum);
    } catch (error) {
      setFetchError(error.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMorePosts = () => {
    fetchPosts(page + 1, true);
  };

  const addNewPost = (newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  const updatePost = (updatedPost) => {
    setPosts(prevPosts =>
      prevPosts.map(post => (post.id === updatedPost.id ? updatedPost : post))
    );
  };

  const deletePost = (postId) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  };

  const onBookmark = (postId, bookmarkStatus) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, isBookmarked: bookmarkStatus } : post
      )
    );
  };

  useEffect(() => {
    fetchPosts(1);
  }, []);

  return (
    <div>
      <Header />
      <Sidebar />
      <MainContent
        posts={posts}
        addNewPost={addNewPost}
        updatePost={updatePost}
        onBookmark={onBookmark}
        isLoading={loading}
        loadMorePosts={loadMorePosts}
        hasMore={hasMore}
        deletePost={deletePost}
      />
      <Footer />
    </div>
  );
};

export default Community;

import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  Calendar, 
  Eye, 
  Edit3, 
  Trash2, 
  Share2, 
  Heart, 
  MessageCircle,
  Repeat,
  Filter,
  Search
} from 'lucide-react';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filterOptions = [
    { value: 'all', label: 'All Posts' },
    { value: 'published', label: 'Published' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'draft', label: 'Drafts' }
  ];

  const platforms = [
    { id: 'twitter', name: 'Twitter', color: 'bg-blue-500' },
    { id: 'facebook', name: 'Facebook', color: 'bg-blue-600' },
    { id: 'instagram', name: 'Instagram', color: 'bg-pink-500' },
    { id: 'linkedin', name: 'LinkedIn', color: 'bg-blue-700' }
  ];

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/posts?filter=${filter}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setPosts(data.posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await fetch(`/api/posts/${postId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setPosts(posts.filter(post => post._id !== postId));
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  const handlePublishPost = async (postId) => {
    try {
      const response = await fetch(`/api/posts/${postId}/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const updatedPost = await response.json();
      setPosts(posts.map(post => 
        post._id === postId ? updatedPost : post
      ));
    } catch (error) {
      console.error('Error publishing post:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredPosts = posts.filter(post =>
    post.content.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Posts</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusCircle size={20} />
          Create Post
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {filterOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-2 flex-1">
          <Search size={20} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map(post => (
          <div key={post._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            {/* Post Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(post.status)}`}>
                  {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePublishPost(post._id)}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                  title="Publish"
                  disabled={post.status === 'published'}
                >
                  <Share2 size={16} />
                </button>
                <button
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                  title="Edit"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() => handleDeletePost(post._id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Post Content */}
            <div className="mb-4">
              <p className="text-gray-800 text-sm leading-relaxed line-clamp-3">
                {post.content.text}
              </p>
              
              {/* Media Preview */}
              {post.content.images && post.content.images.length > 0 && (
                <div className="mt-3 flex gap-2">
                  {post.content.images.slice(0, 2).map((image, index) => (
                    <img
                      key={index}
                      src={image.url}
                      alt={image.alt || 'Post image'}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ))}
                  {post.content.images.length > 2 && (
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-xs">
                      +{post.content.images.length - 2}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Platforms */}
            <div className="flex flex-wrap gap-2 mb-4">
              {post.platforms.map(platform => {
                const platformInfo = platforms.find(p => p.id === platform);
                return (
                  <span
                    key={platform}
                    className={`px-2 py-1 text-xs font-medium text-white rounded-full ${platformInfo?.color || 'bg-gray-500'}`}
                  >
                    {platformInfo?.name || platform}
                  </span>
                );
              })}
            </div>

            {/* Engagement Stats */}
            {post.status === 'published' && (
              <div className="flex items-center gap-4 text-gray-600 text-sm mb-4">
                <div className="flex items-center gap-1">
                  <Heart size={14} />
                  <span>{post.engagement.likes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle size={14} />
                  <span>{post.engagement.comments}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Repeat size={14} />
                  <span>{post.engagement.retweets}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Share2 size={14} />
                  <span>{post.engagement.shares}</span>
                </div>
              </div>
            )}

            {/* Post Date */}
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <Calendar size={14} />
              <span>
                {post.status === 'scheduled' ? 'Scheduled: ' : 'Created: '}
                {formatDate(post.scheduledTime || post.createdAt)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <PlusCircle size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Try adjusting your search terms.' : 'Create your first post to get started.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Post
            </button>
          )}
        </div>
      )}

      {/* Create Post Modal */}
      {showCreateModal && <CreatePostModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
};

// Create Post Modal Component
const CreatePostModal = ({ onClose }) => {
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [scheduledTime, setScheduledTime] = useState('');
  const [tags, setTags] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);

  const platforms = [
    { id: 'twitter', name: 'Twitter', color: 'bg-blue-500' },
    { id: 'facebook', name: 'Facebook', color: 'bg-blue-600' },
    { id: 'instagram', name: 'Instagram', color: 'bg-pink-500' },
    { id: 'linkedin', name: 'LinkedIn', color: 'bg-blue-700' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append('content', JSON.stringify({ text: content }));
      formData.append('platforms', JSON.stringify(selectedPlatforms));
      if (scheduledTime) {
        formData.append('scheduledTime', scheduledTime);
      }
      if (tags) {
        formData.append('tags', JSON.stringify(tags.split(',').map(t => t.trim())));
      }
      
      mediaFiles.forEach(file => {
        formData.append('media', file);
      });

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        onClose();
        window.location.reload(); // Refresh the page to show new post
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Create New Post</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full h-32 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Platforms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Platforms
            </label>
            <div className="flex flex-wrap gap-2">
              {platforms.map(platform => (
                <label
                  key={platform.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    selectedPlatforms.includes(platform.id)
                      ? `${platform.color} text-white`
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.includes(platform.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPlatforms([...selectedPlatforms, platform.id]);
                      } else {
                        setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform.id));
                      }
                    }}
                    className="hidden"
                  />
                  {platform.name}
                </label>
              ))}
            </div>
          </div>

          {/* Schedule */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Schedule (Optional)
            </label>
            <input
              type="datetime-local"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="social, marketing, tips"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Media */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Media (Optional)
            </label>
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={(e) => setMediaFiles(Array.from(e.target.files))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Posts;

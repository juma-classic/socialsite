import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  MapPin, 
  Link as LinkIcon, 
  Calendar, 
  Camera, 
  Edit3, 
  Save, 
  X,
  Users,
  MessageSquare,
  Heart,
  Settings
} from 'lucide-react';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    fetchUserProfile();
    fetchUserPosts();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const userData = await response.json();
      setUser(userData);
      setEditForm(userData);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await fetch(`/api/posts/user/${user?._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditForm({ ...editForm, avatar: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Update avatar if changed
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        
        const avatarResponse = await fetch('/api/users/profile/avatar', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });
        
        if (avatarResponse.ok) {
          const avatarData = await avatarResponse.json();
          setEditForm({ ...editForm, avatar: avatarData.avatar });
        }
      }

      // Update other profile fields
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          username: editForm.username,
          bio: editForm.bio,
          location: editForm.location,
          website: editForm.website,
          birthDate: editForm.birthDate
        })
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setEditForm(updatedUser);
        setIsEditing(false);
        setAvatarFile(null);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPostDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const tabs = [
    { id: 'posts', label: 'Posts', icon: MessageSquare },
    { id: 'followers', label: 'Followers', icon: Users },
    { id: 'following', label: 'Following', icon: Users }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
          {/* Avatar */}
          <div className="relative">
            <img
              src={editForm.avatar || user?.avatar || '/default-avatar.png'}
              alt={user?.username}
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            />
            {isEditing && (
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                <Camera size={16} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-4 mb-4">
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.username || ''}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className="text-2xl font-bold text-gray-900 border-b-2 border-blue-600 focus:outline-none bg-transparent"
                />
              ) : (
                <h1 className="text-2xl font-bold text-gray-900">{user?.username}</h1>
              )}
              
              <div className="flex space-x-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveProfile}
                      className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
                    >
                      <Save size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditForm(user);
                        setAvatarFile(null);
                      }}
                      className="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                  >
                    <Edit3 size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex justify-center md:justify-start space-x-6 mb-4">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">{posts.length}</div>
                <div className="text-sm text-gray-500">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">{user?.followers?.length || 0}</div>
                <div className="text-sm text-gray-500">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">{user?.following?.length || 0}</div>
                <div className="text-sm text-gray-500">Following</div>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              {isEditing ? (
                <textarea
                  value={editForm.bio || ''}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              ) : (
                user?.bio && (
                  <p className="text-gray-700">{user.bio}</p>
                )
              )}

              {/* Profile Details */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Mail size={16} />
                  <span>{user?.email}</span>
                </div>
                
                {(isEditing || user?.location) && (
                  <div className="flex items-center space-x-1">
                    <MapPin size={16} />
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.location || ''}
                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                        placeholder="Location"
                        className="border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
                      />
                    ) : (
                      <span>{user.location}</span>
                    )}
                  </div>
                )}

                {(isEditing || user?.website) && (
                  <div className="flex items-center space-x-1">
                    <LinkIcon size={16} />
                    {isEditing ? (
                      <input
                        type="url"
                        value={editForm.website || ''}
                        onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                        placeholder="Website"
                        className="border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
                      />
                    ) : (
                      <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {user.website}
                      </a>
                    )}
                  </div>
                )}

                <div className="flex items-center space-x-1">
                  <Calendar size={16} />
                  <span>Joined {formatDate(user?.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'posts' && (
            <div className="space-y-4">
              {posts.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                  <p className="text-gray-500">Start sharing your thoughts with the world!</p>
                </div>
              ) : (
                posts.map(post => (
                  <div key={post._id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          post.status === 'published' ? 'bg-green-100 text-green-800' :
                          post.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {post.status}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatPostDate(post.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-gray-500 text-sm">
                        <div className="flex items-center space-x-1">
                          <Heart size={14} />
                          <span>{post.engagement?.likes || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare size={14} />
                          <span>{post.engagement?.comments || 0}</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-800 mb-3">{post.content?.text}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {post.platforms?.map(platform => (
                        <span
                          key={platform}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'followers' && (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Followers</h3>
              <p className="text-gray-500">Your followers will appear here</p>
            </div>
          )}

          {activeTab === 'following' && (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Following</h3>
              <p className="text-gray-500">People you follow will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

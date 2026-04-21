import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { MessageSquare, Users, Sparkles, Filter, Send, ThumbsUp, MessageCircle, Briefcase, Plus, Search, Trash2, AlertTriangle, X } from 'lucide-react';
import './Community.css';

// ─── Delete Confirmation Modal ────────────────────────────────────────────────
const DeleteModal = ({ onConfirm, onCancel, type = 'post' }) => (
    <div className="modal-overlay" onClick={onCancel}>
        <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-icon">
                <AlertTriangle size={32} color="#ff4d4f" />
            </div>
            <h3>Delete {type === 'post' ? 'Post' : 'Comment'}?</h3>
            <p>
                This action <strong>cannot be undone</strong>.{' '}
                {type === 'post'
                    ? 'Your post and all its comments will be permanently removed.'
                    : 'Your comment will be permanently removed.'}
            </p>
            <div className="delete-modal-actions">
                <button className="modal-cancel-btn" onClick={onCancel}>
                    <X size={16} /> Cancel
                </button>
                <button className="modal-delete-btn" onClick={onConfirm}>
                    <Trash2 size={16} /> Yes, Delete
                </button>
            </div>
        </div>
    </div>
);

// ─── Main Community Component ─────────────────────────────────────────────────
const Community = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [posts, setPosts] = useState([]);
    const [groups, setGroups] = useState([]);
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [feedLoading, setFeedLoading] = useState(false);
    const [newPost, setNewPost] = useState('');
    const [mediaFile, setMediaFile] = useState(null);
    const [mediaPreview, setMediaPreview] = useState(null);
    const [mediaType, setMediaType] = useState('image');
    const [selectedCategory, setSelectedCategory] = useState('General');
    const [showMentorReg, setShowMentorReg] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [deletingPostIds, setDeletingPostIds] = useState(new Set()); 
    const [activeGroup, setActiveGroup] = useState(null);
    const [joiningGroup, setJoiningGroup] = useState(null); // for join confirmation modal

    // Modal state: { type: 'post' | 'comment', postId, commentId }
    const [deleteTarget, setDeleteTarget] = useState(null);

    const categories = ['General', 'Job Hiring', 'Backend Development', 'Frontend Development', 'AI / ML', 'Data Science', 'DevOps & Cloud'];
    const jobTypes = ['Full-time', 'Internship', 'Contract', 'Referral'];

    // Helper: get current user ID reliably (handles _id vs id)
    const currentUserId = user?._id || user?.id;

    // Helper: check if the logged-in user owns a resource
    const isOwner = (resourceUserId) => {
        if (!currentUserId || !resourceUserId) return false;
        return currentUserId.toString() === resourceUserId.toString();
    };

    useEffect(() => {
        fetchCommunityData();
    }, [activeGroup, selectedCategory]);

    const fetchCommunityData = async () => {
        try {
            if (!loading) setFeedLoading(true);
            let url = `/community/posts?`;
            if (activeGroup) url += `groupId=${activeGroup._id}`;
            else if (selectedCategory !== 'General') url += `category=${selectedCategory}`;
            
            const [postsRes, groupsRes, mentorsRes, profileRes] = await Promise.all([
                api.get(url),
                api.get('/community/groups'),
                api.get('/mentors/all'),
                user ? api.get('/mentors/profile') : Promise.resolve({ data: null })
            ]);
            setPosts(postsRes.data);
            setGroups(groupsRes.data);
            setMentors(mentorsRes.data);
            setUserProfile(profileRes.data);
            setLoading(false);
            setFeedLoading(false);
        } catch (err) {
            console.error('Error fetching community data:', err);
            setLoading(false);
            setFeedLoading(false);
        }
    };

    const handleMediaChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setMediaFile(file);
        const type = file.type.startsWith('video') ? 'video' : 'image';
        setMediaType(type);

        const reader = new FileReader();
        reader.onloadend = () => {
            setMediaPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const [isJobPost, setIsJobPost] = useState(false);
    const [jobData, setJobData] = useState({ role: '', company: '', location: '', applyLink: '' });

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newPost.trim() && !mediaFile && !isJobPost) return;

        const formData = new FormData();
        formData.append('content', newPost);
        formData.append('category', activeGroup ? activeGroup.domain : selectedCategory);
        if (activeGroup) formData.append('groupId', activeGroup._id);
        if (mediaFile) formData.append('media', mediaFile);
        
        if (isJobPost) {
            formData.append('jobData', JSON.stringify({ ...jobData, isHiringPost: true }));
        }

        try {
            const res = await api.post('/community/posts', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setPosts([res.data, ...posts]);
            setNewPost('');
            setMediaFile(null);
            setMediaPreview(null);
            setIsJobPost(false);
            setJobData({ role: '', company: '', location: '', applyLink: '' });
        } catch (err) {
            console.error('Error creating post:', err);
        }
    };

    const handleLike = async (id) => {
        try {
            const res = await api.post(`/community/posts/${id}/like`);
            setPosts(posts.map(p => p._id === id ? { ...p, likes: res.data.likes } : p));
        } catch (err) {
            console.error('Error liking post:', err);
        }
    };

    // ── Delete Post ──────────────────────────────────────────────────────────
    const confirmDeletePost = (postId) => {
        setDeleteTarget({ type: 'post', postId });
    };

    const handleDeletePost = async () => {
        const { postId } = deleteTarget;
        setDeleteTarget(null);

        // Add to deleting set to trigger fade-out
        setDeletingPostIds(prev => new Set(prev).add(postId));

        // Wait for animation then remove from state
        setTimeout(async () => {
            try {
                await api.delete(`/community/posts/${postId}`);
                setPosts(prev => prev.filter(p => p._id !== postId));
            } catch (err) {
                console.error('Error deleting post:', err);
                // On error, remove from deleting set so it reappears
                setDeletingPostIds(prev => {
                    const next = new Set(prev);
                    next.delete(postId);
                    return next;
                });
            }
            setDeletingPostIds(prev => {
                const next = new Set(prev);
                next.delete(postId);
                return next;
            });
        }, 350); // matches CSS transition duration
    };

    // ── Delete Comment ───────────────────────────────────────────────────────
    const confirmDeleteComment = (postId, commentId) => {
        setDeleteTarget({ type: 'comment', postId, commentId });
    };

    const handleDeleteComment = async () => {
        const { postId, commentId } = deleteTarget;
        setDeleteTarget(null);
        try {
            const res = await api.delete(`/community/posts/${postId}/comment/${commentId}`);
            setPosts(posts.map(p => p._id === postId ? res.data : p));
        } catch (err) {
            console.error('Error deleting comment:', err);
        }
    };

    const handleJoinGroup = async () => {
        if (!joiningGroup) return;
        try {
            const res = await api.post(`/community/groups/${joiningGroup._id}/join`);
            setGroups(groups.map(g => g._id === joiningGroup._id ? res.data : g));
            if (activeGroup && activeGroup._id === joiningGroup._id) {
                setActiveGroup(res.data);
            }
            setJoiningGroup(null);
            alert(`You have successfully joined the ${joiningGroup.name} community!`);
        } catch (err) {
            console.error('Error joining group:', err);
            setJoiningGroup(null);
        }
    };

    // ── Modal confirm dispatcher ─────────────────────────────────────────────
    const handleModalConfirm = () => {
        if (deleteTarget) {
            if (deleteTarget.type === 'post') handleDeletePost();
            else handleDeleteComment();
        } else if (joiningGroup) {
            handleJoinGroup();
        }
    };

    if (loading) return <div className="loader">Building Community...</div>;

    return (
        <div className="community-container">

            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <DeleteModal
                    type={deleteTarget.type}
                    onConfirm={handleModalConfirm}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}

            {/* Join Confirmation Modal */}
            {joiningGroup && (
                <div className="modal-overlay" onClick={() => setJoiningGroup(null)}>
                    <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="delete-modal-icon" style={{ background: 'var(--primary-light)' }}>
                            <Users size={32} color="var(--primary-orange)" />
                        </div>
                        <h3>Join {joiningGroup.name}?</h3>
                        <p>
                            Would you like to become a member of the <strong>{joiningGroup.name}</strong> community? 
                            You'll be able to see all posts and contribute to the discussion.
                        </p>
                        <div className="delete-modal-actions">
                            <button className="modal-cancel-btn" onClick={() => setJoiningGroup(null)}>
                                <X size={16} /> Cancel
                            </button>
                            <button className="modal-delete-btn" style={{ background: 'var(--primary-orange)' }} onClick={handleJoinGroup}>
                                <Plus size={16} /> Join Community
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showMentorReg && (
                <MentorRegistration
                    onComplete={() => {
                        setShowMentorReg(false);
                        fetchCommunityData();
                        alert('Congratulations! You are now a community mentor.');
                    }}
                    onCancel={() => setShowMentorReg(false)}
                />
            )}

            <div className="community-layout">

                {/* Sidebar: Groups */}
                <aside className="community-sidebar">
                    <div className="community-card card">
                        <h3>Domain Groups</h3>
                        <p className="text-muted small">Join discussions in your area of interest</p>
                        <div className="groups-list">
                            <button 
                                className={`group-item-btn ${!activeGroup ? 'active' : ''}`}
                                onClick={() => setActiveGroup(null)}
                            >
                                <div className="group-icon-mini">
                                    <MessageSquare size={16} />
                                </div>
                                <div className="group-info-mini">
                                    <span style={{ fontSize: '1.05rem', fontWeight: '700' }}>General Feed</span>
                                    <small>All domains</small>
                                </div>
                            </button>
                            {groups.map(group => (
                                <button 
                                    key={group._id} 
                                    className={`group-item-btn ${activeGroup?._id === group._id ? 'active' : ''}`}
                                    onClick={() => setActiveGroup(group)}
                                >
                                    <div className="group-icon-mini">
                                        <Briefcase size={16} />
                                    </div>
                                    <div className="group-info-mini">
                                        <span>{group.name}</span>
                                        <div className="group-meta-row">
                                            <small>{group.members?.length || 0} members</small>
                                            {user && group.members?.includes(currentUserId) && (
                                                <span className="joined-badge-mini">Joined</span>
                                            )}
                                        </div>
                                    </div>
                                    {user && !group.members?.includes(currentUserId) && (
                                        <button 
                                            className="join-btn-mini"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setJoiningGroup(group);
                                            }}
                                        >
                                            Join
                                        </button>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main: Feed */}
                <main className="community-main">
                    
                    {activeGroup && (
                        <div className="group-header-card card">
                            <div className="group-header-content">
                                <div className="group-header-info">
                                    <h2>{activeGroup.name}</h2>
                                    <p className="text-muted">{activeGroup.description}</p>
                                    <div className="group-stats">
                                        <span><Users size={14} /> {activeGroup.members?.length || 0} Members</span>
                                        <span><MessageSquare size={14} /> {posts.length} Posts</span>
                                    </div>
                                </div>
                                <div className="group-header-actions">
                                    {user && activeGroup.members?.includes(currentUserId) ? (
                                        <button className="btn-joined" disabled>
                                            <Sparkles size={16} /> Joined
                                        </button>
                                    ) : (
                                        <button 
                                            className="btn-primary" 
                                            onClick={() => setJoiningGroup(activeGroup)}
                                            disabled={!user}
                                        >
                                            <Plus size={16} /> Join Community
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="create-post-card card">
                        {!user ? (
                            <div className="login-prompt">
                                <h3>Join the conversation</h3>
                                <p>Please login to share your thoughts and interact with the community.</p>
                                <button className="btn-primary" onClick={() => navigate('/login')}>Login to Post</button>
                            </div>
                        ) : (
                            <>
                                <div className="category-tabs">
                                    {categories.map(cat => (
                                        <button
                                            key={cat}
                                            className={`cat-tab ${selectedCategory === cat ? 'active' : ''}`}
                                            onClick={() => setSelectedCategory(cat)}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                                <form onSubmit={handleCreatePost} className="post-form">
                                    <textarea
                                        placeholder="Share a resource, ask a question, or discuss a career doubt..."
                                        value={newPost}
                                        onChange={(e) => setNewPost(e.target.value)}
                                        rows={3}
                                    />
                                    <div className="media-upload-area">
                                        <input
                                            type="file"
                                            id="media-input"
                                            accept="image/*,video/*"
                                            onChange={handleMediaChange}
                                            hidden
                                        />
                                        <label htmlFor="media-input" className="media-upload-btn">
                                            <Plus size={18} /> Add Photos / Video
                                        </label>

                                        {mediaPreview && (
                                            <div className="media-preview-container">
                                                {mediaType === 'image' ? (
                                                    <img src={mediaPreview} alt="Preview" />
                                                ) : (
                                                    <video src={mediaPreview} controls />
                                                )}
                                                <button className="remove-media-btn" onClick={() => { setMediaFile(null); setMediaPreview(null); }}>
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {(selectedCategory === 'Job Hiring' || activeGroup?.domain === 'Job Hiring') && (
                                        <div className="job-toggle-area">
                                            <button 
                                                type="button"
                                                className={`job-toggle-btn ${isJobPost ? 'active' : ''}`}
                                                onClick={() => setIsJobPost(!isJobPost)}
                                            >
                                                <Briefcase size={16} /> {isJobPost ? 'Posting a Job' : 'Post a Job Opening'}
                                            </button>
                                        </div>
                                    )}

                                    {isJobPost && (
                                        <div className="job-post-fields card">
                                            <div className="job-field-row">
                                                <input 
                                                    type="text" 
                                                    placeholder="Job Role (e.g. Java Developer)" 
                                                    value={jobData.role}
                                                    onChange={(e) => setJobData({...jobData, role: e.target.value})}
                                                    required
                                                />
                                                <input 
                                                    type="text" 
                                                    placeholder="Company Name" 
                                                    value={jobData.company}
                                                    onChange={(e) => setJobData({...jobData, company: e.target.value})}
                                                    required
                                                />
                                            </div>
                                            <div className="job-field-row">
                                                <input 
                                                    type="text" 
                                                    placeholder="Location" 
                                                    value={jobData.location}
                                                    onChange={(e) => setJobData({...jobData, location: e.target.value})}
                                                    required
                                                />
                                                <input 
                                                    type="text" 
                                                    placeholder="Apply Link / Email" 
                                                    value={jobData.applyLink}
                                                    onChange={(e) => setJobData({...jobData, applyLink: e.target.value})}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="post-actions">
                                        <span className="text-muted small">
                                            Posting in {activeGroup ? activeGroup.name : selectedCategory}
                                        </span>
                                        <button type="submit" className="btn-primary post-btn" disabled={(!newPost.trim() && !isJobPost) || (activeGroup && !activeGroup.members?.includes(currentUserId))}>
                                            {isJobPost ? 'Post Opportunity' : `Post ${activeGroup ? 'to Group' : 'Community'}`} <Send size={16} />
                                        </button>
                                    </div>
                                    {activeGroup && !activeGroup.members?.includes(currentUserId) && (
                                        <p className="join-warning">Join this community to share your thoughts!</p>
                                    )}
                                </form>
                            </>
                        )}
                    </div>

                    <div className="feed-list">
                        {feedLoading ? (
                            <div className="feed-loader">Updating feed...</div>
                        ) : (
                            posts.map(post => (
                                <div
                                    key={post._id}
                                    className={`post-card card ${deletingPostIds.has(post._id) ? 'post-deleting' : ''}`}
                                >
                                    <div className="post-header">
                                        <div className="user-avatar-mini">
                                            {post.user?.name?.charAt(0) || '?'}
                                        </div>
                                        <div className="user-meta">
                                            <strong>{post.user?.name || 'Deleted User'}</strong>
                                            <span className="post-time">
                                                {post.createdAt
                                                    ? new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                                    : 'Unknown date'}
                                            </span>
                                        </div>
                                        <div className="post-header-right">
                                            <div className="post-tag">{post.category || 'General'}</div>
                                            {/* Delete button — only visible to post owner */}
                                            {isOwner(post.user?._id) && (
                                                <button
                                                    className="delete-post-btn"
                                                    onClick={() => confirmDeletePost(post._id)}
                                                    title="Delete your post"
                                                    aria-label="Delete post"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {post.jobData?.isHiringPost && (
                                        <div className="job-card-content card">
                                            <div className="job-card-header">
                                                <div className="job-badge">{post.isExternalJob ? post.user.name : 'HR Posting'}</div>
                                                <h4>{post.jobData.role}</h4>
                                                <h5>{post.jobData.company} — {post.jobData.location}</h5>
                                            </div>
                                            <div className="job-card-body">
                                                <p>{post.content}</p>
                                            </div>
                                            <a 
                                                href={post.jobData.applyLink} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="btn-apply-job"
                                            >
                                                Apply Now <Send size={14} />
                                            </a>
                                        </div>
                                    )}

                                    {!post.jobData?.isHiringPost && (
                                        <div className="post-content">{post.content}</div>
                                    )}
                                    
                                    {post.mediaUrl && (
                                        <div className="post-media">
                                            {post.mediaType === 'video' ? (
                                                <video src={post.mediaUrl} controls />
                                            ) : (
                                                <img src={post.mediaUrl} alt="Post content" />
                                            )}
                                        </div>
                                    )}

                                    <div className="post-footer">
                                        <button className="post-action-btn" onClick={() => handleLike(post._id)}>
                                            <ThumbsUp size={18} className={post.likes.length > 0 ? 'liked' : ''} />
                                            {post.likes.length}
                                        </button>
                                        <button className="post-action-btn">
                                            <MessageCircle size={18} /> {post.comments?.length || 0}
                                        </button>
                                        <button className="post-action-btn" onClick={() => {
                                            navigator.clipboard.writeText(`${window.location.origin}/community?post=${post._id}`);
                                            alert('Link copied to clipboard!');
                                        }}>
                                            <Send size={18} style={{ transform: 'rotate(-20deg)' }} /> Share
                                        </button>
                                    </div>

                                    {post.comments.length > 0 && (
                                        <div className="comments-section">
                                            {post.comments.map((comment, i) => (
                                                <div key={comment._id || i} className="comment-item">
                                                    <div className="comment-text">
                                                        <strong>{comment.user?.name || 'User'}:</strong>
                                                        <span> {comment.text}</span>
                                                    </div>
                                                    {/* Delete comment — only visible to comment owner */}
                                                    {isOwner(comment.user?._id) && (
                                                        <button
                                                            className="delete-comment-btn"
                                                            onClick={() => confirmDeleteComment(post._id, comment._id)}
                                                            title="Delete your comment"
                                                            aria-label="Delete comment"
                                                        >
                                                            <Trash2 size={13} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="comment-input-area">
                                        <input
                                            type="text"
                                            placeholder="Add a comment... (press Enter)"
                                            onKeyDown={async (e) => {
                                                if (e.key === 'Enter' && e.target.value.trim()) {
                                                    const text = e.target.value;
                                                    try {
                                                        const res = await api.post(`/community/posts/${post._id}/comment`, { text });
                                                        setPosts(posts.map(p => p._id === post._id ? res.data : p));
                                                        e.target.value = '';
                                                    } catch (err) {
                                                        console.error('Error adding comment:', err);
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                        {!feedLoading && posts.length === 0 && (
                            <div className="no-posts card">
                                <p>No posts yet in this community. Be the first to share something!</p>
                            </div>
                        )}
                    </div>
                </main>

                {/* Right Sidebar: Mentors & Tips */}
                <aside className="community-sidebar-right">
                    <div className="mentor-highlight-card card">
                        <div className="sparkle-title">
                            <Sparkles size={20} color="var(--primary-orange)" />
                            <h3>Top Community Mentors</h3>
                        </div>
                        <p className="text-muted small">Peer experts ready to help</p>
                        <div className="mini-mentor-list">
                            {mentors.slice(0, 5).map(mentor => (
                                <div key={mentor._id} className="mini-mentor-item" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
                                    <div className="avatar-blue">
                                        {mentor.user?.name?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                        <strong>{mentor.user?.name || 'Anonymous Mentor'}</strong>
                                        <p>{mentor.expertRole || mentor.primaryDomain || 'Mentor'}</p>
                                    </div>
                                </div>
                            ))}
                            {mentors.length === 0 && <p className="text-muted small">No mentors joined yet.</p>}
                        </div>
                        <button className="btn-secondary full-width" style={{ marginTop: '1.5rem' }} onClick={() => navigate('/dashboard')}>
                            Browse All Mentors
                        </button>
                    </div>

                    {user && userProfile && !userProfile.isMentor && (
                        <div className="join-mentors-cta card" style={{ marginTop: '1.5rem', background: 'var(--primary-gradient)', color: '#fff' }}>
                            <Sparkles size={24} style={{ marginBottom: '1rem' }} />
                            <h3>Want to Mentor?</h3>
                            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', marginBottom: '1.2rem' }}>Share your expertise with the community and help others grow.</p>
                            <button
                                className="btn-primary"
                                style={{ background: '#fff', color: 'var(--primary-orange)', border: 'none' }}
                                onClick={() => setShowMentorReg(true)}
                            >
                                Get Started
                            </button>
                        </div>
                    )}
                </aside>

            </div>
        </div>
    );
};

export default Community;

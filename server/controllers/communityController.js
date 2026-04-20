const Post = require('../models/Post');
const Group = require('../models/Group');
const Job = require('../models/Job');

exports.createPost = async (req, res) => {
    try {
        console.log('[COMMUNITY] Creating post:', req.body);
        const { content, category, groupId } = req.body;
        
        let mediaUrl = req.body.imageUrl || null;
        let mediaType = 'image';

        if (req.file) {
            mediaUrl = `/uploads/community/${req.file.filename}`;
            const ext = req.file.filename.split('.').pop().toLowerCase();
            if (['mp4', 'mov', 'avi'].includes(ext)) {
                mediaType = 'video';
            }
        }

        const post = new Post({
            user: req.user._id,
            content,
            category,
            group: groupId || null,
            mediaUrl,
            mediaType,
            jobData: req.body.jobData ? JSON.parse(req.body.jobData) : null
        });
        await post.save();
        const populatedPost = await Post.findById(post._id).populate('user', 'name');
        res.status(201).json(populatedPost);
    } catch (error) {
        res.status(500).json({ message: 'Error creating post', error: error.message });
    }
};

exports.getPosts = async (req, res) => {
    try {
        const { groupId, category } = req.query;
        let query = {};
        if (groupId) query.group = groupId;
        if (category) query.category = category;
        
        const posts = await Post.find(query)
            .populate('user', 'name')
            .sort({ createdAt: -1 });

        // If Job Hiring, inject Naukri jobs
        if (category === 'Job Hiring' || (groupId && await Group.findById(groupId).then(g => g?.domain === 'Job Hiring'))) {
            const externalJobs = await Job.find().sort({ createdAt: -1 }).limit(20);
            const formattedExternal = externalJobs.map(job => ({
                _id: job._id,
                isExternalJob: true,
                jobData: {
                    role: job.role,
                    company: job.company,
                    location: job.location,
                    applyLink: job.applyLink,
                    isHiringPost: true
                },
                content: job.description,
                category: 'Job Hiring',
                user: { name: job.source }, // Naukri
                likes: [],
                comments: [],
                createdAt: job.createdAt
            }));
            
            // Merge and sort by date
            const merged = [...posts, ...formattedExternal].sort((a, b) => 
                new Date(b.createdAt) - new Date(a.createdAt)
            );
            return res.status(200).json(merged);
        }

        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching posts', error: error.message });
    }
};

exports.likePost = async (req, res) => {
    try {
        console.log(`[COMMUNITY] Liking post: ${req.params.id}`);
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        if (post.likes.includes(req.user._id)) {
            post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
        } else {
            post.likes.push(req.user._id);
        }
        await post.save();
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error liking post', error: error.message });
    }
};

exports.addComment = async (req, res) => {
    try {
        console.log(`[COMMUNITY] Adding comment to post ${req.params.id}:`, req.body);
        const { text } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        post.comments.push({
            user: req.user._id,
            text
        });
        await post.save();
        const populatedPost = await Post.findById(post._id).populate('comments.user', 'name');
        res.status(200).json(populatedPost);
    } catch (error) {
        res.status(500).json({ message: 'Error adding comment', error: error.message });
    }
};

exports.getGroups = async (req, res) => {
    try {
        const groups = await Group.find();
        res.status(200).json(groups);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching groups', error: error.message });
    }
};

exports.joinGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        if (!group.members.includes(req.user._id)) {
            group.members.push(req.user._id);
            await group.save();
        }
        res.status(200).json(group);
    } catch (error) {
        res.status(500).json({ message: 'Error joining group', error: error.message });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized to delete this post' });
        }

        await post.deleteOne();
        res.status(200).json({ message: 'Post removed' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting post', error: error.message });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const comment = post.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        if (comment.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized to delete this comment' });
        }

        comment.deleteOne();
        await post.save();

        const populatedPost = await Post.findById(post._id).populate('comments.user', 'name');
        res.status(200).json(populatedPost);
    } catch (error) {
        res.status(500).json({ message: 'Error deleting comment', error: error.message });
    }
};

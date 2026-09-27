import React, { useState, useEffect } from 'react';
import {
    Heart,
    MessageCircle,
    Bookmark,
    Eye,
    Send,
    X,
    Loader,
    MoreHorizontal,
    Edit2,
    Trash2,
    ChevronLeft,
    ChevronRight,
    CheckCircle2
} from 'lucide-react';
import axios from 'axios';
import { commentApi } from '../api/comment.api';
import { getTimeAgo } from '../services/timeAgo.service';
import CommentCard from './CommentCard';
import { likeApi } from '../api/like.api';
import { saveApi } from '../api/save.api';
import { useNavigate } from 'react-router-dom';
import { blogApi } from '../api/blog.api';
import Swal from 'sweetalert2';

function BlogCard({
    id,
    title,
    description,
    imgUrl,
    images = [],
    tags = ["react", "javascript", "webdev"],
    likes = 0,
    comments = 0,
    views = 0,
    owner = {
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1",
        username: "johndoe",
        _id: "1",
        totalFollowers: 150,
        isOwner: false
    },
    followStatus = {},
    setFollowStatus = () => { },
    createdAt = new Date(),
    bgColor = "1f2936",
    isOwner = false,
    isSavedBlog = false
}) {
    const [isFollowed, setIsFollowed] = useState(owner.isFollowed);
    const [isLiked, setIsLiked] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [commentsList, setCommentsList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalLikes, setTotalLikes] = useState(likes);
    const [isSaved, setIsSaved] = useState(isSavedBlog);
    const [isOwnerOnlyMenuOpen, setIsOwnerOnlyMenuOpen] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const navigate = useNavigate();

    const hasImages = images && images.length > 0;

    const handleFollow = async () => {
        console.log(owner._id);
        
        if(followStatus[owner._id]){
            try {
                const res = await axios.post(
                    `${import.meta.env.VITE_ENV === "production" ? import.meta.env.VITE_BACKEND_URL_PROD : import.meta.env.VITE_BACKEND_URL_DEV}/followers/unfollow/${owner._id}`,
                    {},
                    {
                        withCredentials: true
                    }
                );

                console.log(res.data);

                setFollowStatus(prev => ({
                    ...prev,
                    [owner._id]: false
                }));
                setIsFollowed(false);
            } catch (error) {
                console.log("HandleFollow :: Error :: ", error.message);
            }
        }
        else{
            try {
                const res = await axios.post(
                    `${import.meta.env.VITE_ENV === "production" ? import.meta.env.VITE_BACKEND_URL_PROD : import.meta.env.VITE_BACKEND_URL_DEV}/followers/follow/${owner._id}`,
                    {},
                    {
                        withCredentials: true
                    }
                );

                console.log(res.data);

                setFollowStatus(prev => ({
                    ...prev,
                    [owner._id]: true
                }));
                setIsFollowed(true);
            } catch (error) {
                console.log("HandleFollow :: Error :: ", error.message);
            }
        }
    };

    const handleCommentSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setLoading(true);
        if (commentText.trim()) {
            const newComment = {
                blogId: id,
                content: commentText,
            };

            const res = await commentApi.postComment(newComment);

            if (res.success) {
                if (commentsList?.length) {
                    setCommentsList((prev) => (
                        [
                            res.data,
                            ...prev
                        ]
                    ));
                }
                else {
                    setCommentsList([res.data]);
                }
            }
            else {
                console.log("Comment Post Error :: ", res.message);
            }

            setCommentText('');
            setLoading(false);
        }
    };

    const handleCommentsFetch = async () => {
        setShowComments(!showComments);
        try {
            const res = await commentApi.getBlogComments(id);
            setCommentsList(res.data.comments);
        } catch (error) {
            console.log("Fetch Comments :: ERROR :: ", error.message);
        }
    };

    const isLikedToBlog = async () => {
        const res = await likeApi.isLikedToBlog(id);
        if (res.success) {
            setIsLiked(res.data.isLiked);
            console.log(res.data.isLiked);
        }
    };

    const handleBlogLikeToggle = async () => {
        console.log("blog Id = ", id);
        let isLikedC = !isLiked;
        setIsLiked(!isLiked);
        if (isLikedC) {
            setTotalLikes((prev) => prev + 1);
        }
        else{
            setTotalLikes((prev) => prev - 1);
        }
        const res = await likeApi.toggleBlogLike(id);
        if (!res.success) {
            console.log("Like Toggle Failed.");
            setIsLiked(!isLiked);
            if(isLikedC){
                setTotalLikes((prev) => prev - 1);
            }
            else{
                setTotalLikes((prev) => prev + 1);
            }
        }
    };

    const isSavedToBlog = async () => {
        const res = await saveApi.isBlogSaved(id);
        if (res.success) {
            setIsSaved(res.data?.isSaved);
        }
    };

    const handleToggleSave = async () => {
        setIsSaved(!isSaved);
        const res = await saveApi.toggleBlogSave(id);

        if (res.success) {
            console.log("Save Toggle Success.");
            setIsSaved(res.data.isSaved);
        }
        if (!res.success) {
            console.log("Save Toggle Failed.");
            setIsSaved(!isSaved);
        }
    };

    const handleDeleteBlog = async () => {
        Swal.fire({
            title: 'Are you sure?',
            text: "This action will permanently delete your blog. You won't be able to recover it!",
            icon: 'warning',
            background: '#1f2936',
            color: '#c9d1d9',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
        }).then(async(result) => {
            if (result.isConfirmed) {
                const res = await blogApi.deleteBlog(id);

                if (res.success) {
                    setIsDeleted(true);

                    Swal.fire({
                        icon: 'success',
                        title: 'Deleted!',
                        text: 'Your blog has been deleted successfully.',
                        background: '#1f2936',
                        color: '#c9d1d9',
                        timer: 2000,
                        showConfirmButton: false,
                    });
                }
            }
        });
    };

    useEffect(() => {
        isLikedToBlog();
        isSavedToBlog();
        setTotalLikes(likes);
    }, []);

    const handleUniversal = () => {
        if (isOwnerOnlyMenuOpen) {
            setIsOwnerOnlyMenuOpen(false);
        }
    };

    const handleImageIndexChangeRight = () => {
        if(currentImageIndex < images.length - 1){
            setCurrentImageIndex((prev) => prev + 1);
        }
    };

    const handleImageIndexChangeLeft = () => {
        if(currentImageIndex > 0){
            setCurrentImageIndex((prev) => prev - 1);
        }
    };

    const shouldShowReadMore = description && description.length > 150;

    return (
        <div 
            onClick={handleUniversal}
            className={`${isDeleted ? "hidden" : ""} w-full bg-white dark:bg-[#1f2937] md:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-800 overflow-hidden group mt-3`}
        >
            {/* Image Section - Only render if images exist */}
            {hasImages && (
                <div className="w-full relative overflow-hidden">
                    <div className="w-full aspect-video relative">
                        <img
                            className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
                            src={images[currentImageIndex]?.url}
                            alt={title}
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={handleImageIndexChangeLeft}
                                className={`${currentImageIndex === 0 ? "opacity-0 pointer-events-none" : "opacity-0 group-hover:opacity-100"} absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110`}
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={handleImageIndexChangeRight}
                                className={`${currentImageIndex === images.length - 1 ? "opacity-0 pointer-events-none" : "opacity-0 group-hover:opacity-100"} absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110`}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </>
                    )}

                    {/* Image Counter */}
                    {images.length > 1 && (
                        <div className="absolute bottom-4 right-4">
                            <div className="px-3 py-1.5 bg-black/70 backdrop-blur-md rounded-full text-white text-xs font-semibold shadow-lg">
                                {currentImageIndex + 1} / {images.length}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Content Section */}
            <div className="p-6">
                {/* Author Info */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="relative">
                            <div 
                                onClick={() => {navigate(`/user/profile/${owner._id}`)}}
                                className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-blue-500/20 dark:ring-blue-400/20 transition-all duration-300 hover:ring-4 hover:ring-blue-500/30 cursor-pointer"
                            >
                                <img
                                    className='w-full h-full object-cover'
                                    src={owner.avatar || "https://res.cloudinary.com/drftighpf/image/upload/v1751458090/f5ozv63h6ek3ujulc3gg.jpg"}
                                    alt={owner.username}
                                />
                            </div>
                            {/* Online Status Indicator */}
                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                        </div>

                        <div className='flex-1'>
                            <div className="flex items-center gap-1.5">
                                <span 
                                    onClick={() => {navigate(`/user/profile/${owner._id}`)}}
                                    className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer text-sm"
                                >
                                    {owner.username}
                                </span>
                                <CheckCircle2 size={16} className="text-blue-400 " />
                            </div>
                            <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
                                {getTimeAgo(createdAt)} · {owner.totalFollowers} followers
                            </p>
                        </div>
                    </div>

                    {!isOwner && (
                        <button
                            disabled={followStatus[owner._id]}
                            title={followStatus[owner._id] ? "Unfollow From Profile" : "Follow this user"}
                            onClick={handleFollow}
                            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${
                                followStatus[owner._id]
                                    ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-default"
                                    : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg hover:scale-105"
                            } disabled:cursor-not-allowed`}
                        >
                            {followStatus[owner._id] ? "Following" : "+ Follow"}
                        </button>
                    )}

                    {owner.isOwner && (
                        <div className="relative">
                            <button
                                onClick={() => setIsOwnerOnlyMenuOpen(!isOwnerOnlyMenuOpen)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                            >
                                <MoreHorizontal size={20} className="text-gray-600 dark:text-gray-400" />
                            </button>

                            {isOwnerOnlyMenuOpen && (
                                <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-10">
                                    <button 
                                        onClick={() => {navigate("/user/blogs/update/" + id)}}
                                        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors text-left"
                                    >
                                        <Edit2 size={16} className='text-blue-600' />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Edit</span>
                                    </button>
                                    <button 
                                        onClick={handleDeleteBlog}
                                        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-red-50 dark:hover:bg-gray-700 transition-colors text-left border-t border-gray-100 dark:border-gray-700"
                                    >
                                        <Trash2 size={16} className='text-red-600' />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Delete</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Title */}
                <h2 className='text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight mb-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer line-clamp-2'>
                    {title}
                </h2>

                {/* Description */}
                <div className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
                    <p className={!isExpanded && shouldShowReadMore ? "line-clamp-3" : ""}>
                        {description}
                    </p>
                    {shouldShowReadMore && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold text-xs mt-2 inline-flex items-center gap-1 transition-colors"
                        >
                            {isExpanded ? "Show less" : "Read more"}
                            <ChevronRight size={14} className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </button>
                    )}
                </div>

                {/* Tags */}
                {tags && tags.length > 0 && (
                    <div className="flex items-center flex-wrap gap-2 mb-4">
                        {tags.slice(0, 4).map((tag, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer"
                            >
                                #{tag}
                            </span>
                        ))}
                        {tags.length > 4 && (
                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs font-medium">
                                +{tags.length - 4}
                            </span>
                        )}
                    </div>
                )}

                {/* Stats & Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                        {/* Like */}
                        <button
                            onClick={handleBlogLikeToggle}
                            className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 ${
                                isLiked
                                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600'
                            }`}
                        >
                            <Heart
                                size={18}
                                className={`transition-all ${isLiked ? 'fill-red-600 scale-110' : ''}`}
                            />
                            <span className="text-sm font-semibold">{totalLikes}</span>
                        </button>

                        {/* Comment */}
                        <button
                            onClick={handleCommentsFetch}
                            className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 ${
                                showComments
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600'
                            }`}
                        >
                            <MessageCircle size={18} />
                            <span className="text-sm font-semibold">{comments}</span>
                        </button>

                        {/* Views */}
                        <button className="flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors">
                            <Eye size={18} />
                            <span className="text-sm font-semibold">{views}</span>
                        </button>
                    </div>

                    {/* Bookmark */}
                    <button
                        onClick={handleToggleSave}
                        className={`p-2 rounded-full transition-all duration-300 ${
                            isSaved
                                ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:text-yellow-600'
                        }`}
                    >
                        <Bookmark size={18} className={isSaved ? 'fill-yellow-600' : ''} />
                    </button>
                </div>

                {/* Comments Section */}
                {showComments && (
                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 animate-in">
                        {/* Comment Input */}
                        <div className="mb-6">
                            <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-gray-200 dark:ring-gray-700">
                                    <img
                                        className='w-full h-full object-cover'
                                        src={owner.avatar}
                                        alt="Your avatar"
                                    />
                                </div>
                                <div className="flex-1 flex gap-2">
                                    <input
                                        type="text"
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && commentText.trim()) {
                                                handleCommentSubmit(e);
                                            }
                                        }}
                                        placeholder="Write a comment..."
                                        className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-sm transition-all"
                                    />
                                    <button
                                        onClick={handleCommentSubmit}
                                        disabled={!commentText.trim()}
                                        className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-300 dark:disabled:from-gray-700 dark:disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-md hover:shadow-lg disabled:shadow-none flex items-center gap-2"
                                    >
                                        {loading ? (
                                            <Loader size={16} className="animate-spin" />
                                        ) : (
                                            <Send size={16} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Comments List or Empty State */}
                        {commentsList && commentsList.length > 0 ? (
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {commentsList.map((comment) => (
                                    <CommentCard key={comment._id} comment={comment} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                                    <MessageCircle size={28} className="text-gray-400 dark:text-gray-600" />
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 font-semibold mb-1">No comments yet</p>
                                <p className="text-sm text-gray-500 dark:text-gray-500">Be the first to share your thoughts!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(180deg, #4777f4 0%, #9035ea 100%);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(180deg, #5887ff 0%, #a045fa 100%);
                }
                @keyframes slide-in {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-in {
                    animation: slide-in 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}

export default BlogCard;
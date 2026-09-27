import React, { useState, useEffect } from 'react';
import {
    BookOpen,
    User,
    Calendar,
    MapPin,
    ExternalLink,
    Code,
    Users,
    UserPlus,
    UserMinus,
    ArrowLeft
} from 'lucide-react';
import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";
import { userApi } from '../../../api/user.api';
import MobileNavBottom from '../../../components/MobileNavBottom';
import BlogCard from '../../../components/BlogCard';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import SpinLoader from '../../../components/SpinLoader';
import FeedSidebar from '../../../components/FeedSidebar';
import { followApi } from '../../../api/follow.api';

function PublicProfilePage() {
    const [allBlogs, setAllBlogs] = useState([]);
    const [profileData, setProfileData] = useState({
        fullName: "",
        username: "",
        location: "",
        website: "",
        githubUrl: "",
        twitterUrl: "",
        linkedinUrl: "",
        joinedDate: "",
        bio: "",
        totalFollowers: 0,
        totalFollowing: 0,
        totalBlogs: 0,
        skills: [],
        avatar: "",
        isFollowed : false
    });
    const [loading, setLoading] = useState(true);
    const [followLoading, setFollowLoading] = useState(false);
    const [currentUserAvatar, setCurrentUserAvatar] = useState("");
    const [followStatus, setFollowStatus] = useState({})
    
    
    const userId = useParams().id;
    const [isFollowing, setIsFollowing] = useState(useParams().isFollowed);
    const navigate = useNavigate();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const fetchUserBlogs = async (userId) => {
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_ENV === "production" ? import.meta.env.VITE_BACKEND_URL_PROD : import.meta.env.VITE_BACKEND_URL_DEV}/blogs/user/${userId}?page=1&limit=10`,
                { withCredentials: true }
            );
            console.log("Blogs for followStatus :::::::::::::::::::::::::::::::::::::::::::::::::: ",res.data.data.blogs)
            setAllBlogs(res.data.data.blogs);
            loadFollowStatus(res.data.data.blogs)


        } catch (error) {
            console.log("Error :: Fetching User Blogs :: ", error.message);
        }
    };

    const fetchPublicProfile = async () => {
        try {
            setLoading(true);
            // Replace with your actual API call to fetch public profile by username
            const res = await axios.get(
                `${import.meta.env.VITE_ENV === "production" ? import.meta.env.VITE_BACKEND_URL_PROD : import.meta.env.VITE_BACKEND_URL_DEV}/users/profile/${userId}`,
                { withCredentials: true }
            );

            console.log("Public Profile Data ::: ",res.data)
            
            const userData = res.data.data;
            setProfileData({
                fullName: userData.fullName || "",
                username: userData.username || "",
                location: userData.location || "",
                website: userData.website || "",
                githubUrl: userData.githubUrl || "",
                twitterUrl: userData.twitterUrl || "",
                linkedinUrl: userData.linkedinUrl || "",
                joinedDate: months[new Date(userData.createdAt).getMonth()] + " " + new Date(userData.createdAt).getFullYear(),
                bio: userData.bio || "",
                totalFollowers: userData.totalFollowers || 0,
                totalFollowing: userData.totalFollowing || 0,
                totalBlogs: userData.totalBlogs || 0,
                skills: userData.skills || [],
                avatar: userData.avatar || "",
                isFollowed: userData.isFollowed || false
            });
            
            setIsFollowing(userData.isFollowing || false);
            await fetchUserBlogs(userData._id);
        } catch (error) {
            console.error('Error fetching public profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const getFollowStatus = async ()=>{
        const res = await followApi.getFollowStatus(userId)

        console.log("Follow Status ::::: ",res.data)

        if(res.success){
            setIsFollowing(res.data.isFollowed)
        }
    }

    const handleFollowToggle = async () => {
        if(profileData.isFollowed){
            try {
            setFollowLoading(true);
            // Replace with your actual follow/unfollow API call
            const res = await followApi.unfollowUser(userId)
            
            if (res.data.success) {
                setIsFollowing(true);
                setProfileData(prev => ({
                    ...prev,
                    totalFollowers: prev.isFollowed ? prev.totalFollowers - 1 : prev.totalFollowers + 1,
                    isFollowed: false
                }));

                setFollowStatus((prev)=>{
                    return {
                        ...prev,
                        [userId]: false
                    }
                })
            }
        } catch (error) {
            console.error('Error toggling follow:', error);
        } finally {
            setFollowLoading(false);
        }
        }

         if(!profileData.isFollowed){
            try {
            setFollowLoading(true);
            // Replace with your actual follow/unfollow API call
            const res = await followApi.followUser(userId)
            
            if (res.data.success) {
                setIsFollowing(true);
                setProfileData(prev => ({
                    ...prev,
                    totalFollowers: prev.isFollowed ? prev.totalFollowers - 1 : prev.totalFollowers + 1,
                    isFollowed: true
                }));

                setFollowStatus((prev)=>{
                    return {
                        ...prev,
                        [userId] : true
                    }
                })
            }
        } catch (error) {
            console.error('Error toggling follow:', error);
        } finally {
            setFollowLoading(false);
        }
        }
    };

    const fetchCurrentUserAvatar = async () => {
        try {
            const res = await userApi.fetchUserProfile();
            setCurrentUserAvatar(res.data.avatar);
        } catch (error) {
            console.error('Error fetching current user avatar:', error);
        }
    };

    
    const loadFollowStatus = (blogs) => {

            blogs.forEach((blog) => {
                setFollowStatus(
                    (prev) => {
                        return {
                            ...prev,
                            [blog.owner._id]: blog.owner.isFollowed
                        }
                    }
                )
            })

            console.log("Follow Status = ", followStatus)

        }

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: "instant"
        });
        document.documentElement.classList.add("dark");
        fetchPublicProfile();
        fetchCurrentUserAvatar();
        getFollowStatus()
        console.log("ISFOLLOWED ::: ",Boolean(isFollowing))
    }, [userId]);

    if (loading) {
        return (
            <div className='w-screen h-screen bg-[#111825] flex justify-center items-center'>
                <SpinLoader />
            </div>
        );
    }

    return (
        <div className='w-screen h-auto bg-[#111825] z-100 flex flex-col pb-16'>
            <div className="text-white hidden md:block mt-4 ml-2">
                <FeedSidebar activePage="profile" />
            </div>

            {/* Back Button */}
            <section className="w-[95%] md:w-[70%] lg:w-[60%] xl:w-[65%] mx-auto mt-4 px-3">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span className="text-sm font-medium">Back</span>
                </button>
            </section>

            {/* Cover Photo */}
            <section className="w-[95%] md:w-[70%] lg:w-[60%] xl:w-[65%] mx-auto mt-4 rounded-md py-3">
                <img
                    src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=400&fit=crop"
                    alt="Cover"
                    className="w-full h-auto rounded-md"
                />
            </section>

            {/* User Info */}
            <section className="w-full md:w-[70%] lg:w-[60%] xl:w-[65%] mx-auto mt-16 rounded-bl-0 rounded-br-0 md:rounded-bl-2xl md:rounded-br-2xl bg-gradient-to-br from-[#1e293b] to-[#1e293b]/95 backdrop-blur-xl border border-slate-700/50 shadow-2xl">
                <div className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                        {/* Left: Avatar + main info */}
                        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start flex-1">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-800 shadow-xl">
                                    <img
                                        src={profileData?.avatar || "https://res.cloudinary.com/drftighpf/image/upload/v1751458090/f5ozv63h6ek3ujulc3gg.jpg"}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 w-full text-center md:text-left">
                                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{profileData.fullName}</h1>
                                <p className="text-base text-slate-400 mb-4">@{profileData.username}</p>

                                {profileData.bio ? (
                                    <p className="text-base text-slate-300 leading-relaxed mb-4">{profileData.bio}</p>
                                ) : (
                                    <p className="text-base text-slate-500 italic mb-4">No bio added yet</p>
                                )}

                                <div className="flex flex-wrap gap-4 justify-center md:justify-start mt-4">
                                    {profileData.location && (
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <MapPin size={16} className="text-blue-400" />
                                            <span className="text-sm">{profileData.location}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Calendar size={16} className="text-purple-400" />
                                        <span className="text-sm">Joined {profileData.joinedDate}</span>
                                    </div>

                                    {profileData.website && (
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <ExternalLink size={16} className="text-green-400" />
                                            <a 
                                                href={profileData.website} 
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm hover:text-blue-400 transition-colors"
                                            >
                                                {profileData.website.replace(/^https?:\/\//, '')}
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {/* Social Links */}
                                {(profileData.githubUrl || profileData.twitterUrl || profileData.linkedinUrl) && (
                                    <div className="flex items-center gap-4 mt-4 justify-center md:justify-start">
                                        {profileData.githubUrl && (
                                            <a 
                                                href={profileData.githubUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-slate-400 hover:text-white transition-all hover:scale-110"
                                            >
                                                <FaGithub size={22} />
                                            </a>
                                        )}
                                        {profileData.twitterUrl && (
                                            <a 
                                                href={profileData.twitterUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-slate-400 hover:text-blue-400 transition-all hover:scale-110"
                                            >
                                                <FaTwitter size={22} />
                                            </a>
                                        )}
                                        {profileData.linkedinUrl && (
                                            <a 
                                                href={profileData.linkedinUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-slate-400 hover:text-blue-500 transition-all hover:scale-110"
                                            >
                                                <FaLinkedin size={22} />
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Follow Button */}
                        <div className="flex flex-col gap-3 w-full md:w-auto">
                            <button
                                onClick={handleFollowToggle}
                                disabled={followLoading}
                                className={`${
                                    profileData.isFollowed
                                        ? 'bg-slate-700 hover:bg-slate-600'
                                        : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-xl'
                                } text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {followLoading ? (
                                    <SpinLoader />
                                ) : (
                                    <>
                                        {profileData.isFollowed===true ? (
                                            <>
                                                <UserMinus size={20} />
                                                Unfollow
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus size={20} />
                                                Follow
                                            </>
                                        )}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Skills Section */}
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-white">Skills & Expertise</h2>
                        </div>

                        {profileData.skills.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {profileData.skills.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 text-blue-300 text-sm px-4 py-2 rounded-full font-medium hover:scale-105 transition-transform cursor-default"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 border-2 border-dashed border-slate-700 rounded-xl">
                                <Code size={32} className="text-slate-600 mx-auto mb-2" />
                                <p className="text-slate-500 text-sm">No skills added yet</p>
                            </div>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-700">
                        <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-transparent rounded-xl border border-blue-500/20 hover:scale-105 transition-transform cursor-pointer">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <BookOpen size={20} className='text-blue-400' />
                                <p className='text-2xl font-bold text-white'>{profileData?.totalBlogs || 0}</p>
                            </div>
                            <p className="text-sm text-slate-400 font-medium">Blogs</p>
                        </div>

                        <div className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-transparent rounded-xl border border-purple-500/20 hover:scale-105 transition-transform cursor-pointer">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Users size={20} className='text-purple-400' />
                                <p className='text-2xl font-bold text-white'>{profileData?.totalFollowers || 0}</p>
                            </div>
                            <p className="text-sm text-slate-400 font-medium">Followers</p>
                        </div>

                        <div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-transparent rounded-xl border border-green-500/20 hover:scale-105 transition-transform cursor-pointer">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <User size={20} className='text-green-400' />
                                <p className='text-2xl font-bold text-white'>{profileData?.totalFollowing || 0}</p>
                            </div>
                            <p className="text-sm text-slate-400 font-medium">Following</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* User Posts */}
            <section className="w-full md:w-[70%] lg:w-[60%] xl:w-[65%] mx-auto mt-4 bg-[#1f2935] px-3 mb-5">
                <div className="flex justify-start gap-5 items-center border-[1px] border-b-gray-500 border-t-0 border-l-0 border-r-0">
                    <h2 className="text-sm md:text-[1.1rem] font-[500] mb-0 pb-5 px-3 pt-3 h-full border-2 border-b-[#4083f2] border-t-0 border-r-0 border-l-0 text-[#4083f2]">
                        Posts
                    </h2>
                </div>

                {allBlogs.length > 0 ? (
                    <div className="w-full flex flex-col gap-3 mt-5">
                        {allBlogs.map((blog) => (
                            <div key={blog._id} className="w-full">
                                <BlogCard
                                    id={blog._id}
                                    title={blog.title}
                                    imgUrl={blog.images?.length ? blog.images[0].url : ""}
                                    images={blog.images}
                                    description={blog.content}
                                    likes={blog.totalLikes}
                                    comments={blog.totalComments}
                                    tags={blog.tags}
                                    views={blog.views}
                                    owner={blog.owner}
                                    followStatus={followStatus}
                                    setFollowStatus={setFollowStatus}
                                    createdAt={blog.createdAt}
                                    isOwner={false}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="w-full flex flex-col gap-3 mt-5 justify-center items-center py-8">
                        <BookOpen size={48} className="text-slate-600 mb-2" />
                        <h1 className="text-md md:text-xl text-gray-400">No posts yet</h1>
                    </div>
                )}
            </section>

            <MobileNavBottom avatarUrl={currentUserAvatar} fixed={true} />
        </div>
    );
}

export default PublicProfilePage;
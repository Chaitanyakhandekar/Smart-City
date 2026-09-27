import React, { useState, useEffect } from 'react';
import {
    BookOpen,
    Bookmark,
    User,
    Users,
    Settings,
    LogOut,
    Edit3,
    Heart,
    MessageCircle,
    Eye,
    Calendar,
    MapPin,
    ExternalLink,
    Camera,
    Check,
    X,
    Lock,
    Bell,
    Palette,
    Shield
} from 'lucide-react';
import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";
import MobileNavBottom from '../../../components/MobileNavBottom';
import axios from 'axios';
import BlogCard from '../../../components/BlogCard';

function ProfilePage() {
    // --- data states (kept in your original pattern) ---
    const [activeTab, setActiveTab] = useState("posts");
    const [userPosts, setUserPosts] = useState([]);
    const [userAvatar, setUserAvatar] = useState("");

    // profile editable fields (keeps structure from second snippet)
    const [profileData, setProfileData] = useState({
        name: "Byte Coder",
        username: "@byte_coder",
        location: "San Francisco, CA",
        website: "https://bytecoder.dev",
        githubUrl: "https://github.com/bytecoder",
        twitterUrl: "https://twitter.com/bytecoder",
        linkedinUrl: "https://linkedin.com/in/bytecoder"
    });

    const [bio, setBio] = useState("Full Stack Developer | Open Source Enthusiast | Building scalable web applications with React, Node.js, and TypeScript");
    const [editMode, setEditMode] = useState(false);
    const [showSettingsMenu, setShowSettingsMenu] = useState(false);

    const skills = ["JavaScript", "TypeScript", "React", "Node.js", "MongoDB", "Docker", "AWS"];

    const handleTabChange = (e) => {
        // you used this pattern in your original code; keep it
        setActiveTab(e.target.name);
    };

    // fetch posts (keeps your axios pattern from the first file)
    const fetchAllPosts = async () => {
        try {
            const base = import.meta.env.VITE_ENV === "production"
                ? import.meta.env.VITE_BACKEND_URL_PROD
                : import.meta.env.VITE_BACKEND_URL_DEV;

            const res = await axios.get(`${base}/blogs/user?page=1&limit=10`, { withCredentials: true });
            setUserPosts(res.data.data || []);
            // eslint-disable-next-line no-console
            console.log('blogs : ', res.data.data);
        } catch (error) {
            // keep silent like your original but log for dev
            // eslint-disable-next-line no-console
            console.error('Error fetching posts ::', error?.message || error);
        }
    };

    // fetch avatar (keeps your axios pattern)
    const fetchUserAvatar = async () => {
        try {
            const base = import.meta.env.VITE_ENV === "production"
                ? import.meta.env.VITE_BACKEND_URL_PROD
                : import.meta.env.VITE_BACKEND_URL_DEV;

            const res = await axios.get(`${base}/users/avatar`, { withCredentials: true });
            setUserAvatar(res.data.avatar || '');
        } catch (error) {
            // eslint-disable-next-line no-console
            console.log('Error :: Fetching User Avatar :: ', error?.message || error);
        }
    };

    // update profile (keeps signature you asked: "update profile function")
    const handleSaveProfile = async () => {
        try {
            setEditMode(false);
            setShowSettingsMenu(false);

            const base = import.meta.env.VITE_ENV === "production"
                ? import.meta.env.VITE_BACKEND_URL_PROD
                : import.meta.env.VITE_BACKEND_URL_DEV;

            // example endpoint - adjust to your backend route
            const payload = {
                name: profileData.name,
                username: profileData.username,
                location: profileData.location,
                website: profileData.website,
                githubUrl: profileData.githubUrl,
                twitterUrl: profileData.twitterUrl,
                linkedinUrl: profileData.linkedinUrl,
                bio
            };

            const res = await axios.put(`${base}/users/profile`, payload, { withCredentials: true });
            console.log('Profile update response: ', res?.data);

            // if backend returns updated avatar, update it
            if (res?.data?.avatar) setUserAvatar(res.data.avatar);

        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error updating profile ::', error?.message || error);
            // revert edit mode if you want user to try again
            // setEditMode(true);
        }
    };

    const handleLogout = () => {
        // keep placeholder from your second snippet
        console.log('Logging out...');
    };

    // initially fetch posts & avatar (keeps your original useEffect pattern)
    useEffect(() => {
        fetchAllPosts();
        fetchUserAvatar();

        // if your backend is not ready, keep a small fallback demo posts so UI doesn't break
        // (only set when userPosts is empty)
        // NOTE: this emulates the demo posts from Claude's version but only when backend returns nothing
        (async () => {
            if (!userPosts || userPosts.length === 0) {
                setUserPosts([
                    {
                        _id: 'demo-1',
                        title: 'Building Scalable Microservices with Node.js',
                        content: 'Learn how to architect and deploy production-ready microservices...',
                        images: [{ url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop' }],
                        totalLikes: 342,
                        totalComments: 45,
                        views: 2341,
                        tags: ['Node.js', 'Microservices', 'Architecture'],
                        owner: { name: profileData.name, avatar: userAvatar },
                        createdAt: new Date().toISOString()
                    },
                    {
                        _id: 'demo-2',
                        title: 'Modern React Patterns You Should Know',
                        content: 'Exploring the latest patterns and best practices in React development...',
                        images: [{ url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop' }],
                        totalLikes: 521,
                        totalComments: 67,
                        views: 3892,
                        tags: ['React', 'JavaScript', 'Frontend'],
                        owner: { name: profileData.name, avatar: userAvatar },
                        createdAt: new Date().toISOString()
                    }
                ]);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className='w-screen min-h-screen bg-[#0f172a] flex flex-col gap-10 pb-24'>
            {/* Cover */}
            <section className="w-full md:w-[70%] lg:w-[60%] xl:w-[65%] mx-auto md:mt-6 rounded-2xl overflow-hidden relative group">
                <img
                    src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=400&fit=crop"
                    alt="Cover"
                    className="w-full h-48 md:h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {editMode && (
                    <button className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-black/80 transition-all">
                        <Camera size={18} />
                        <span className="text-sm font-medium">Change Cover</span>
                    </button>
                )}
            </section>

            {/* Profile Card (merged look) */}
            <section className="w-full md:w-[70%] lg:w-[60%] xl:w-[65%] mx-auto -mt-16 rounded-bl-2xl rounded-br-2xl bg-gradient-to-br from-[#1e293b] to-[#1e293b]/95 backdrop-blur-xl border border-slate-700/50 shadow-2xl">
                <div className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">

                        {/* Left: Avatar + main info */}
                        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start flex-1">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-slate-800 shadow-xl relative">
                                    <img
                                        src={userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop'}
                                        alt="Profile"
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                    {editMode && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera size={24} className="text-white" />
                                        </div>
                                    )}
                                </div>

                                {!editMode && (
                                    <button className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-600 p-2.5 rounded-xl text-white shadow-lg hover:shadow-xl transition-all hover:scale-110">
                                        <ExternalLink size={18} />
                                    </button>
                                )}
                            </div>

                            <div className="flex-1 w-full text-center md:text-left">
                                {editMode ? (
                                    <input
                                        className="text-2xl md:text-3xl font-bold text-white mb-2 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none w-full"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                    />
                                ) : (
                                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{profileData.name}</h1>
                                )}

                                {editMode ? (
                                    <input
                                        className="text-base text-slate-400 mb-4 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none w-full"
                                        value={profileData.username}
                                        onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                                    />
                                ) : (
                                    <p className="text-base text-slate-400 mb-4">{profileData.username}</p>
                                )}

                                {editMode ? (
                                    <textarea
                                        className="text-base text-slate-300 leading-relaxed bg-slate-800/50 px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none w-full resize-none"
                                        rows="3"
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        placeholder="Tell us about yourself..."
                                    />
                                ) : (
                                    <p className="text-base text-slate-300 leading-relaxed mb-4">{bio}</p>
                                )}

                                <div className="flex flex-wrap gap-4 justify-center md:justify-start mt-4">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <MapPin size={16} className="text-blue-400" />
                                        {editMode ? (
                                            <input
                                                className="text-sm bg-slate-800/50 px-3 py-1 rounded-md border border-slate-600 focus:border-blue-500 focus:outline-none"
                                                value={profileData.location}
                                                onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                                            />
                                        ) : (
                                            <span className="text-sm">{profileData.location}</span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Calendar size={16} className="text-purple-400" />
                                        <span className="text-sm">Joined January 2020</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-slate-400">
                                        <ExternalLink size={16} className="text-green-400" />
                                        {editMode ? (
                                            <input
                                                className="text-sm bg-slate-800/50 px-3 py-1 rounded-md border border-slate-600 focus:border-blue-500 focus:outline-none"
                                                value={profileData.website}
                                                onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                                            />
                                        ) : (
                                            <a href={profileData.website} className="text-sm hover:text-blue-400 transition-colors">{profileData.website.replace(/^https?:\/\//,'')}</a>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 mt-4 justify-center md:justify-start">
                                    <a href={profileData.githubUrl} className="text-slate-400 hover:text-white transition-all hover:scale-110">
                                        <FaGithub size={22} />
                                    </a>
                                    <a href={profileData.twitterUrl} className="text-slate-400 hover:text-blue-400 transition-all hover:scale-110">
                                        <FaTwitter size={22} />
                                    </a>
                                    <a href={profileData.linkedinUrl} className="text-slate-400 hover:text-blue-500 transition-all hover:scale-110">
                                        <FaLinkedin size={22} />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Right: actions */}
                        <div className="flex flex-col gap-3 w-full md:w-auto">
                            {editMode ? (
                                <>
                                    <button
                                        onClick={handleSaveProfile}
                                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
                                    >
                                        <Check size={20} />
                                        Save Changes
                                    </button>

                                    <button
                                        onClick={() => setEditMode(false)}
                                        className="bg-slate-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-600 transition-all flex items-center justify-center gap-2"
                                    >
                                        <X size={20} />
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setEditMode(true)}
                                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
                                    >
                                        <Edit3 size={20} />
                                        Edit Profile
                                    </button>

                                    <div className="relative">
                                        <button
                                            onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                                            className="w-full bg-slate-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-600 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Settings size={20} />
                                            Settings
                                        </button>

                                        {showSettingsMenu && (
                                            <div className="absolute top-full right-0 mt-2 w-64 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden z-50">
                                                <div className="p-2">
                                                    <button className="w-full text-left px-4 py-3 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-3 group">
                                                        <Settings size={18} className="text-blue-400" />
                                                        <span className="font-medium">Account Settings</span>
                                                    </button>
                                                    <button className="w-full text-left px-4 py-3 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-3 group">
                                                        <Lock size={18} className="text-purple-400" />
                                                        <span className="font-medium">Privacy & Security</span>
                                                    </button>
                                                    <button className="w-full text-left px-4 py-3 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-3 group">
                                                        <Bell size={18} className="text-green-400" />
                                                        <span className="font-medium">Notifications</span>
                                                    </button>
                                                    <button className="w-full text-left px-4 py-3 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-3 group">
                                                        <Palette size={18} className="text-pink-400" />
                                                        <span className="font-medium">Appearance</span>
                                                    </button>
                                                    <button className="w-full text-left px-4 py-3 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-3 group">
                                                        <Shield size={18} className="text-yellow-400" />
                                                        <span className="font-medium">Blocked Users</span>
                                                    </button>
                                                    <div className="border-t border-slate-700 my-2"></div>
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-3 group"
                                                    >
                                                        <LogOut size={18} />
                                                        <span className="font-medium">Logout</span>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                    </div>

                    {/* Skills + stats */}
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-white">Skills & Expertise</h2>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {skills.map((skill, index) => (
                                <span
                                    key={index}
                                    className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 text-blue-300 text-sm px-4 py-2 rounded-full font-medium hover:scale-105 transition-transform cursor-default"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-700">
                        <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-transparent rounded-xl border border-blue-500/20 hover:scale-105 transition-transform cursor-pointer">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <BookOpen size={20} className='text-blue-400' />
                                <p className='text-2xl font-bold text-white'>120</p>
                            </div>
                            <p className="text-sm text-slate-400 font-medium">Posts</p>
                        </div>

                        <div className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-transparent rounded-xl border border-purple-500/20 hover:scale-105 transition-transform cursor-pointer">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Users size={20} className='text-purple-400' />
                                <p className='text-2xl font-bold text-white'>5.2K</p>
                            </div>
                            <p className="text-sm text-slate-400 font-medium">Followers</p>
                        </div>

                        <div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-transparent rounded-xl border border-green-500/20 hover:scale-105 transition-transform cursor-pointer">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <User size={20} className='text-green-400' />
                                <p className='text-2xl font-bold text-white'>300</p>
                            </div>
                            <p className="text-sm text-slate-400 font-medium">Following</p>
                        </div>

                        <div className="text-center p-4 bg-gradient-to-br from-pink-500/10 to-transparent rounded-xl border border-pink-500/20 hover:scale-105 transition-transform cursor-pointer">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Bookmark size={20} className='text-pink-400' />
                                <p className='text-2xl font-bold text-white'>151</p>
                            </div>
                            <p className="text-sm text-slate-400 font-medium">Saved</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tabs + content (uses BlogCard from your first file) */}
            <section className="w-[95%] md:w-[70%] lg:w-[60%] xl:w-[65%] mx-auto mt-4   bg-[#1f2935] px-3">

                {/* Tabs */}
                <div className="flex justify-start gap-5 items-center border-[1px] border-b-gray-500 border-t-0 border-l-0 border-r-0">
                    <button
                        className={`text-sm md:text-[1.1rem] font-[500] text-[#9ca3ae] mb-0 pb-5 px-3 pt-3 h-full ${activeTab === "posts" ? "border-2 border-b-[#4083f2] border-t-0 border-r-0 border-l-0 text-[#4083f2]" : "border-none text-[#9ca3ae]"}`}
                        name="posts"
                        onClick={handleTabChange}
                    >
                        Posts
                    </button>

                    <button
                        className={`text-sm md:text-[1.1rem] font-[500] text-[#9ca3ae] mb-0 pb-5 px-3 pt-3 h-full ${activeTab === "saved" ? "border-2 border-b-[#4083f2] border-t-0 border-r-0 border-l-0 text-[#4083f2]" : "border-none text-[#9ca3ae]"}`}
                        name="saved"
                        onClick={handleTabChange}
                    >
                        Saved
                    </button>

                    <button
                        className={`text-sm md:text-[1.1rem] font-[500] text-[#9ca3ae] mb-0 pb-5 px-3 pt-3 h-full ${activeTab === "drafts" ? "border-2 border-b-[#4083f2] border-t-0 border-r-0 border-l-0 text-[#4083f2]" : "border-none text-[#9ca3ae]"}`}
                        name="drafts"
                        onClick={handleTabChange}
                    >
                        Drafts
                    </button>
                </div>
                

                {/* POSTS */}
                {
                    activeTab==="posts" &&

                      <div className="w-full flex flex-col gap-3 mt-5">
                    {
                        userPosts.map((blog) => (
                            <div
                                key={blog._id}
                                className="w-full">
                                <BlogCard
                                    key={blog._id}
                                    title={blog.title}
                                    imgUrl={blog.images?.length ? blog.images[0].url : ""}
                                    images={blog.images}
                                    description={blog.content}
                                    likes={blog.totalLikes}
                                    comments={blog.totalComments}
                                    tags={blog.tags}
                                    views={blog.views}
                                    owner={blog.owner}
                                    followStatus={{}}
                                    setFollowStatus={()=>{}}
                                    createdAt={blog.createdAt}
                                    bgColor={"#182230"}
                                />
                            </div>
                        ))
                    }
                </div>
                }


                {/* SAVED */}

                {
                    activeTab==="saved" &&

                    <div className="w-full flex flex-col gap-3 mt-5 justify-center items-center">
                        <h1 className="text-md md:text-xl text-gray-400 py-5">No saved posts yet</h1>
                    </div>
                }


                  {/* DRAFTS */}

                {
                    activeTab==="drafts" &&

                    <div className="w-full flex flex-col gap-3 mt-5 justify-center items-center">
                        <h1 className="text-md md:text-xl text-gray-400 py-5">No drafts yet</h1>
                    </div>
                }

            </section>

            {/* mobile nav */}
            <div className="block md:hidden fixed bottom-0 w-full">
                <MobileNavBottom avatarUrl={userAvatar} />
            </div>
        </div>
    );
}

export default ProfilePage;

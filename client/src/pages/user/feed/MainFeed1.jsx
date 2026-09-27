import React, { useEffect, useState } from 'react'
import {
  Search,
  Bell,
  BookOpen,
  Bookmark,
  User,
  Settings,
  LogOut,
  Home,
  Edit3,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  TrendingUp,
  Calendar,
  Filter,
  Moon,
  Sun,
  Menu,
  X,
  ChevronDown,
  Code,
  Zap,
  Coffee,
  Briefcase,
  Github,
  ExternalLink,
  Clock,
  Users,
  Tag,
  Plus,
  Star,
  MoveDown,
  Pen,
  Sparkles,
  Flame,
  Activity,
  Award
} from 'lucide-react';
import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";

function MainFeed() {
  const [searchFocused, setSearchFocused] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [allBlogs, setAllBlogs] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(4);
  const [loading, setLoading] = useState(false);
  const [userAvatar, setUserAvatar] = useState("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop");
  const [followStatus, setFollowStatus] = useState({});

  const categories = [
    { name: "All", icon: <Home size={16} />, totalPosts: 1200 },
    { name: "Javascript", icon: <Code size={16} />, totalPosts: 800 },
    { name: "React", icon: <Zap size={16} />, totalPosts: 600 },
    { name: "Node.js", icon: <Briefcase size={16} />, totalPosts: 400 },
    { name: "Career", icon: <Coffee size={16} />, totalPosts: 300 },
    { name: "Open Source", icon: <FaGithub size={16} />, totalPosts: 200 },
  ];

  const trendingTags = [
    { name: "#WebDev", totalPosts: 1200 },
    { name: "#MachineLearning", totalPosts: 800 },
    { name: "#DevOps", totalPosts: 600 },
    { name: "#CloudComputing", totalPosts: 400 },
    { name: "#Debugging", totalPosts: 300 },
    { name: "#Performance", totalPosts: 200 },
    { name: "#Mobile", totalPosts: 100 },
  ];

  const handleTheme = () => {
    const html = document.documentElement;
    if (html.classList.contains("dark")) {
      setIsDark(false);
      html.classList.remove("dark");
      html.classList.add("light");
    } else {
      setIsDark(true);
      html.classList.remove("light");
      html.classList.add("dark");
    }
  };

  // Mock data for demo
  useEffect(() => {
    setAllBlogs([
      {
        _id: "1",
        title: "Building Scalable Microservices with Node.js",
        content: "Learn how to architect and deploy production-ready microservices using Node.js, Docker, and Kubernetes. This comprehensive guide covers everything from basic setup to advanced deployment strategies...",
        images: [{ url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop" }],
        totalLikes: 342,
        totalComments: 45,
        views: 2341,
        tags: ["Node.js", "Microservices", "Architecture"],
        owner: { 
          _id: "1",
          name: "Sarah Johnson", 
          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
          isFollowed: false
        },
        createdAt: new Date().toISOString()
      },
      {
        _id: "2",
        title: "Modern React Patterns You Should Know in 2025",
        content: "Exploring the latest patterns and best practices in React development. From hooks to suspense, learn how to write cleaner, more efficient React code...",
        images: [{ url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop" }],
        totalLikes: 521,
        totalComments: 67,
        views: 3892,
        tags: ["React", "JavaScript", "Frontend"],
        owner: { 
          _id: "2",
          name: "Michael Chen", 
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
          isFollowed: true
        },
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        _id: "3",
        title: "The Ultimate Guide to TypeScript Best Practices",
        content: "Master TypeScript with these essential best practices. Learn about advanced types, generics, and how to structure large-scale TypeScript applications...",
        images: [{ url: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=400&fit=crop" }],
        totalLikes: 689,
        totalComments: 92,
        views: 5234,
        tags: ["TypeScript", "JavaScript", "Best Practices"],
        owner: { 
          _id: "3",
          name: "Emma Wilson", 
          avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
          isFollowed: false
        },
        createdAt: new Date(Date.now() - 172800000).toISOString()
      },
      {
        _id: "4",
        title: "Docker Essentials: From Zero to Production",
        content: "Everything you need to know about Docker containerization. Build, ship, and run applications anywhere with confidence using Docker and Docker Compose...",
        images: [{ url: "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800&h=400&fit=crop" }],
        totalLikes: 445,
        totalComments: 58,
        views: 3156,
        tags: ["Docker", "DevOps", "Containers"],
        owner: { 
          _id: "4",
          name: "David Park", 
          avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
          isFollowed: false
        },
        createdAt: new Date(Date.now() - 259200000).toISOString()
      }
    ]);
  }, []);

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="main-feed w-screen min-h-screen bg-gradient-to-br from-[#0f172a] via-[#0f172a] to-[#1e293b] pb-16">
      
      {/* Enhanced Navbar */}
      <nav className="hidden md:flex w-full h-16 bg-[#1e293b]/95 backdrop-blur-xl border-b border-slate-700/50 items-center justify-center gap-8 px-6 sticky top-0 z-50 shadow-2xl">
        
        {/* Logo */}
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="h-10 w-10 flex justify-center items-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white font-mono font-bold rounded-xl shadow-lg group-hover:shadow-purple-500/50 transition-all group-hover:scale-110">
            {'<>'}
          </div>
          <div className="text-white text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            DevMark
          </div>
        </div>

        {/* Search Bar */}
        <div className={`flex-1 max-w-xl flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
          searchFocused 
            ? "bg-slate-800 border-2 border-blue-500 shadow-lg shadow-blue-500/20" 
            : "bg-slate-800/50 border-2 border-slate-700"
        }`}>
          <Search className={`${searchFocused ? 'text-blue-400' : 'text-slate-400'} transition-colors`} size={20} />
          <input
            className='bg-transparent border-none outline-none w-full text-slate-200 placeholder-slate-400'
            type="text"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder='Search articles, topics, or authors...'
          />
          {searchFocused && (
            <kbd className="px-2 py-1 text-xs bg-slate-700 text-slate-400 rounded">ESC</kbd>
          )}
        </div>

        {/* Navigation Links */}
        <div className='flex items-center gap-6'>
          <button className='flex items-center gap-2 text-slate-300 hover:text-white transition-all group'>
            <Home size={18} className='group-hover:scale-110 transition-transform' />
            <span className="font-medium">Home</span>
          </button>
          <button className='flex items-center gap-2 text-slate-300 hover:text-white transition-all group'>
            <Bookmark size={18} className='group-hover:scale-110 transition-transform' />
            <span className="font-medium">Saved</span>
          </button>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={handleTheme}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all hover:scale-110 border border-slate-700"
        >
          {isDark ? <Sun className="text-yellow-400" size={20} /> : <Moon className="text-slate-400" size={20} />}
        </button>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button className="relative p-2.5 hover:bg-slate-800 rounded-xl transition-all group">
            <Bell className='text-slate-400 group-hover:text-white transition-colors' size={20} />
            <span className='absolute top-1 right-1 w-2 h-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500 animate-pulse'></span>
          </button>

          <button className="px-5 py-2.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all hover:scale-105 flex items-center gap-2">
            <Pen size={16} />
            Write
          </button>

          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                isProfileMenuOpen ? 'bg-slate-800' : 'hover:bg-slate-800'
              }`}
            >
              <img
                className='w-9 h-9 rounded-full object-cover ring-2 ring-purple-500/50'
                src={userAvatar}
                alt="Profile"
              />
              <ChevronDown className={`text-slate-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} size={18} />
            </button>

            {/* Enhanced Dropdown */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden">
                <div className="p-2">
                  <button className='w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-700 rounded-lg transition-all group'>
                    <User size={18} className="text-blue-400" />
                    <span className="font-medium">Profile</span>
                  </button>
                  <button className='w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-700 rounded-lg transition-all group'>
                    <Settings size={18} className="text-purple-400" />
                    <span className="font-medium">Settings</span>
                  </button>
                  <div className="border-t border-slate-700 my-2"></div>
                  <button className='w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-all group'>
                    <LogOut size={18} />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className='w-full flex justify-center gap-6 px-4 py-6'>

        {/* Left Sidebar */}
        <aside className='hidden lg:block w-72 space-y-6 sticky top-24 h-fit'>
          
          {/* Quick Actions Card */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="text-purple-400" size={20} />
              <h2 className='text-lg font-bold text-white'>Quick Actions</h2>
            </div>
            
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 rounded-xl transition-all group border border-transparent hover:border-purple-500/30">
                <Pen size={18} className="text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Write Blog</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 rounded-xl transition-all group border border-transparent hover:border-purple-500/30">
                <BookOpen size={18} className="text-purple-400 group-hover:scale-110 transition-transform" />
                <span className="font-medium">My Blogs</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 rounded-xl transition-all group border border-transparent hover:border-purple-500/30">
                <Bookmark size={18} className="text-pink-400 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Saved Blogs</span>
              </button>
            </div>
          </div>

          {/* Trending Topics */}
          {/* <div className="bg-gradient-to-br from-slate-800/90 to-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <Flame className="text-orange-400" size={20} />
              <h2 className='text-lg font-bold text-white'>Trending Now</h2>
            </div>
            
            <div className="space-y-3">
              {trendingTags.slice(0, 5).map((tag, index) => (
                <button key={index} className="w-full flex items-center justify-between px-4 py-2 text-slate-300 hover:bg-slate-700/50 rounded-lg transition-all group">
                  <span className="font-medium text-sm">{tag.name}</span>
                  <span className="text-xs text-slate-500 group-hover:text-purple-400 transition-colors">{tag.totalPosts.toLocaleString()}</span>
                </button>
              ))}
            </div>
          </div> */}
        </aside>

        {/* Feed Section */}
        <section className='flex-1 max-w-3xl space-y-6'>
          
          {/* Feed Header */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  activeCategory === "All" 
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg" 
                    : "text-slate-400 hover:text-white hover:bg-slate-700"
                }`}>
                  Latest
                </button>
                <button className="px-4 py-2 rounded-xl font-semibold text-slate-400 hover:text-white hover:bg-slate-700 transition-all">
                  Following
                </button>
                <button className="px-4 py-2 rounded-xl font-semibold text-slate-400 hover:text-white hover:bg-slate-700 transition-all">
                  Popular
                </button>
              </div>
              
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl transition-all">
                <Filter size={16} />
                <span className="text-sm font-medium">Filter</span>
              </button>
            </div>
          </div>

          {/* Blog Posts */}
          <div className="space-y-6">
            {allBlogs.map((blog) => (
              <article key={blog._id} className="bg-gradient-to-br from-slate-800/90 to-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-purple-500/10 transition-all group">
                
                {/* Author Info */}
                <div className="p-6 pb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={blog.owner.avatar} 
                      alt={blog.owner.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-500/30"
                    />
                    <div>
                      <h3 className="font-semibold text-white">{blog.owner.name}</h3>
                      <p className="text-sm text-slate-400">{formatTimeAgo(blog.createdAt)}</p>
                    </div>
                  </div>
                  
                  <button className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                    blog.owner.isFollowed
                      ? "bg-slate-700 text-white hover:bg-slate-600"
                      : "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-purple-500/50"
                  }`}>
                    {blog.owner.isFollowed ? 'Following' : '+ Follow'}
                  </button>
                </div>

                {/* Content */}
                <div className="px-6">
                  <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all cursor-pointer">
                    {blog.title}
                  </h2>
                  <p className="text-slate-300 leading-relaxed mb-4 line-clamp-2">
                    {blog.content}
                  </p>
                </div>

                {/* Image */}
                {blog.images?.[0] && (
                  <div className="px-6 mb-4">
                    <div className="relative rounded-xl overflow-hidden">
                      <img 
                        src={blog.images[0].url} 
                        alt={blog.title}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="px-6 mb-4 flex flex-wrap gap-2">
                  {blog.tags.map((tag, idx) => (
                    <span key={idx} className="px-3 py-1 text-xs font-medium bg-blue-500/10 text-blue-300 rounded-full border border-blue-500/30 hover:bg-blue-500/20 transition-all cursor-pointer">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Stats & Actions */}
                <div className="px-6 pb-6 flex items-center justify-between border-t border-slate-700 pt-4">
                  <div className="flex items-center gap-6 text-sm">
                    <button className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-all group/like">
                      <Heart size={18} className="group-hover/like:scale-110 transition-transform" />
                      <span className="font-medium">{blog.totalLikes}</span>
                    </button>
                    <button className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-all group/comment">
                      <MessageCircle size={18} className="group-hover/comment:scale-110 transition-transform" />
                      <span className="font-medium">{blog.totalComments}</span>
                    </button>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Eye size={18} />
                      <span className="font-medium">{blog.views.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button className="p-2 hover:bg-slate-700 rounded-lg transition-all">
                      <Bookmark size={18} className="text-slate-400 hover:text-purple-400 transition-colors" />
                    </button>
                    <button className="p-2 hover:bg-slate-700 rounded-lg transition-all">
                      <Share2 size={18} className="text-slate-400 hover:text-blue-400 transition-colors" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Load More */}
          <button 
            onClick={() => setLimit(prev => prev + 4)}
            className="w-full py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-bold rounded-2xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Loading...
              </>
            ) : (
              <>
                <MoveDown size={20} />
                Load More Posts
              </>
            )}
          </button>
        </section>

        {/* Right Sidebar */}
        <aside className='hidden xl:block w-80 space-y-6 sticky top-24 h-fit'>
          
          {/* Featured Developers */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <Award className="text-yellow-400" size={20} />
              <h2 className='text-lg font-bold text-white'>Top Developers</h2>
            </div>
            
            <div className="space-y-4">
              {[
                { name: "Sarah Johnson", role: "Full Stack Dev", followers: "29.3k", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop" },
                { name: "Emma Wilson", role: "React Expert", followers: "24.1k", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop" },
                { name: "David Park", role: "DevOps Engineer", followers: "18.7k", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop" }
              ].map((dev, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 hover:bg-slate-700/30 rounded-xl transition-all group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <img 
                      src={dev.avatar} 
                      alt={dev.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-500/30"
                    />
                    <div>
                      <h4 className="font-semibold text-white text-sm">{dev.name}</h4>
                      <p className="text-xs text-slate-400">{dev.role}</p>
                      <p className="text-xs text-slate-500">{dev.followers} followers</p>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:shadow-lg">
                    Follow
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Card */}
          {/* <div className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="text-purple-400" size={20} />
              <h2 className='text-lg font-bold text-white'>Your Stats</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-slate-800/50 rounded-xl">
                <p className="text-2xl font-bold text-white">24</p>
                <p className="text-xs text-slate-400 mt-1">Posts</p>
              </div>
              <div className="text-center p-3 bg-slate-800/50 rounded-xl">
                <p className="text-2xl font-bold text-white">1.2K</p>
                <p className="text-xs text-slate-400 mt-1">Followers</p>
              </div>
              <div className="text-center p-3 bg-slate-800/50 rounded-xl">
                <p className="text-2xl font-bold text-white">12.5K</p>
                <p className="text-xs text-slate-400 mt-1">Views</p>
              </div>
              <div className="text-center p-3 bg-slate-800/50 rounded-xl">
                <p className="text-2xl font-bold text-white">890</p>
                <p className="text-xs text-slate-400 mt-1">Likes</p>
              </div>
            </div>
          </div> */}
        </aside>
      </main>
    </div>
  );
}

export default MainFeed;
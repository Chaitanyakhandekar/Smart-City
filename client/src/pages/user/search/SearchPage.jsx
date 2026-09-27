import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  Home,
  Bookmark,
  ChevronDown,
  X,
  Moon,
  Sun,
  Heart,
  MessageCircle,
  Eye,
  Users,
  BookOpen,
  ArrowUpDown
} from 'lucide-react';
import MobileNavBottom from '../../../components/MobileNavBottom';
import { userApi } from '../../../api/user.api';
import BlogCard from '../../../components/BlogCard';
import axios from 'axios';
import ProfileCard from '../../../components/ProfileCard';
import FeedSidebar from '../../../components/FeedSidebar';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [searchResults, setSearchResults] = useState({ blogs: [], users: [] });
  const [loading, setLoading] = useState(false);
  const searchInputRef = useRef(null);
  const [followStatus, setFollowStatus] = useState({});
  const [userAvatar, setUserAvatar] = useState("")


  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults({ blogs: [], users: [] });
  };

  const getTotalResults = () => {
    let total = 0;
    total += searchResults?.blogs?.length || 0;
    total += searchResults?.users?.length || 0;
    return total;
  };

  const loadFollowStatus = (blogs) => {
    blogs.forEach((blog) => {
      setFollowStatus((prev) => {
        return {
          ...prev,
          [blog.owner._id]: blog.owner.isFollowed,
        };
      });
    });

    console.log("Follow Status = ", followStatus);
  };

  const loadFollowStatusUsers = (users)=>{
    users.forEach((user)=>{
      setFollowStatus((prev)=>{
        return {
          ...prev,
          [user._id]: user.isFollowed,
        }
      })
    })
  }


  const fetchAllBlogs = async () => {
    setLoading(true);
    try {
      console.log("Fetching Search Results for Query :: ", searchQuery);
       const res = await axios.get(`${import.meta.env.VITE_ENV === "production" ? import.meta.env.VITE_BACKEND_URL_PROD : import.meta.env.VITE_BACKEND_URL_DEV}/blogs/search?searchQuery=${searchQuery}`, {
        withCredentials: true
      }
      )

      console.log("Result for Search (USERS) ", res?.data?.data?.users)
      console.log("Result for Search (BLOGS) ", res?.data?.data?.blogs)

      if(res?.data?.data?.blogs && res?.data?.data?.blogs?.length > 0 || res?.data?.data?.users && res?.data?.data?.users?.length > 0){
        setSearchResults({
        blogs: res?.data?.data?.blogs,
        users: res?.data?.data?.users
      })

      loadFollowStatus(res?.data?.data?.blogs);
      loadFollowStatusUsers(res?.data?.data?.users);

      }
      else{
        setSearchResults({ blogs: [], users: [] })
      }

      setLoading(false);
      
    } catch (error) {
      console.log("Error While Fetching Results. :: ",error)
    }
  }

  const fetchUserAvatar = async () => {
    const res = await userApi.fetchUserAvatar();
    console.log("User Avatar :: ", res.data.avatar)
    if(res.success){
      setUserAvatar(res.data.avatar)
    }
  }
  

  useEffect(() => {
    fetchUserAvatar()

  }, [])


   useEffect(() => {
   
    const delayBounce = setTimeout(()=>{

       if(searchQuery && searchQuery.trim() !== ""){
        fetchAllBlogs();
    }

    },700)

    return () => clearTimeout(delayBounce)
   
  }, [searchQuery])

  return (
    <div className={`min-h-screen pb-16 ${isDark ? 'bg-[#111826]' : 'bg-[#f4f2ee]'}`}>
      {/* Navigation */}
      <nav className="w-full h-16 bg-[#1f2936] flex items-center justify-center gap-10 px-4 sticky top-0 z-50 shadow-lg">
        <div className="hidden md:block h-full md:flex justify-center items-center gap-2">
          <div className="h-10 w-10 flex justify-center items-center bg-gradient-to-r from-[#4777f4] to-[#9035ea] text-white font-mono font-bold rounded-md text-sm">
            {'<>'}
          </div>
          <div className="text-white text-xl md:text-2xl font-bold">DevMark</div>
        </div>

        <div className="flex-1 max-w-2xl">
          <div
            className={`flex w-full text-gray-400 ${searchFocused ? 'border-2 border-blue-600' : 'border border-gray-600'
              } px-3 py-2 rounded-lg gap-2 bg-[#111826] transition-all`}
          >
            <Search size={20} />
            <input
              ref={searchInputRef}
              className="bg-transparent border-none outline-none w-full text-white placeholder-gray-500"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search blogs, users, topics..."
            />
            {searchQuery && (
              <button type="button" onClick={clearSearch}>
                <X size={20} className="text-gray-400 hover:text-white transition-colors" />
              </button>
            )}
          </div>
        </div>

        

       

        <div className="hidden md:flex items-center gap-4 relative">
          {/* <div className="w-9 h-9 hover:bg-gray-700 flex justify-center items-center rounded-lg relative transition-colors cursor-pointer">
            <Bell className="text-gray-400" size={20} />
            <div className="w-2 h-2 rounded-full bg-red-500 absolute top-1 right-1"></div>
          </div> */}

     


        

          
        </div>
      </nav>

      {/* Main Content */}
      <main className="w-screen  px-4 py-6 flex gap-5 justify-center md:justify-center">

          <div className="text-white hidden md:block">
        <FeedSidebar activePage="search" />
          </div>

        <div className="max-w-6xl mx-1 px-0 py-6 w-full">
          {searchQuery && (
          <>
            {/* Tabs and Sort */}
            <div className={`${isDark ? 'bg-[#1f2936] border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-4 mb-4 w-full`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'all'
                        ? 'bg-blue-500 text-white'
                        : isDark
                          ? 'text-gray-300 hover:bg-gray-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    All ({getTotalResults()})
                  </button>
                  <button
                    onClick={() => setActiveTab('blogs')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'blogs'
                        ? 'bg-blue-500 text-white'
                        : isDark
                          ? 'text-gray-300 hover:bg-gray-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    <BookOpen size={16} />
                    Blogs ({searchResults?.blogs?.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'users'
                        ? 'bg-blue-500 text-white'
                        : isDark
                          ? 'text-gray-300 hover:bg-gray-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    <Users size={16} />
                    Users ({searchResults?.users?.length})
                  </button>
                </div>


              </div>
            </div>

            {/* Results */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : getTotalResults() > 0 ? (
              <div className="space-y-4 w-full">
                {/* Users Results */}
                {(activeTab === 'all' || activeTab === 'users') && searchResults?.users?.length > 0 && (
                  <>
                    {activeTab === 'all' && (
                      <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>
                        Users
                      </h2>
                    )}
                    {searchResults?.users?.map((user) => (
                      <div
                        key={user._id}
                        className={`${isDark ? 'bg-[#1f2936] border-gray-700' : 'bg-white border-gray-200'} w-full border rounded-lg p-4 hover:shadow-xl transition-shadow cursor-pointer`}
                      >
                        <ProfileCard
                          user={user}
                          isDark={isDark}
                          followStatus={followStatus}
                          setFollowStatus={setFollowStatus}
                          isFollowed1={user.isFollowed}
                        />
                      </div>
                    ))}
                  </>
                )}

                {/* Blogs Results */}
                {(activeTab === 'all' || activeTab === 'blogs') && searchResults?.blogs?.length > 0 && (
                  <>
                    {activeTab === 'all' && searchResults?.users?.length > 0 && (
                      <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3 mt-6`}>
                        Blogs
                      </h2>
                    )}
                    {searchResults.blogs.map((blog) => (
                      <div
                        key={blog._id}
                        className="w-full">
                        <BlogCard
                          id={blog._id}
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
                          followStatus={followStatus}
                          setFollowStatus={setFollowStatus}
                          createdAt={blog.createdAt}
                        />
                      </div>
                    ))}
                  </>
                )}
              </div>
            ) : (
              <div className={`${isDark ? 'bg-[#1f2936] border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-16 text-center`}>
                <Search size={48} className={`mx-auto ${isDark ? 'text-gray-600' : 'text-gray-400'} mb-4`} />
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                  No results found
                </h3>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                  Try different keywords or check your spelling
                </p>
                <button
                  onClick={clearSearch}
                  className="text-blue-500 hover:text-blue-600 font-medium"
                >
                  Clear search
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!searchQuery && (
          <div className="w-full flex justify-center items-center mt-20">
              <div className={`${isDark ? 'bg-[#1f2936] border-gray-700' : 'bg-white border-gray-200'} border-2 w-[90vw] md:w-[550px] lg:w-[800px]  rounded-lg p-16 text-center`}>
            <Search size={64} className={`mx-auto ${isDark ? 'text-gray-600' : 'text-gray-400'} mb-4`} />
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
              Start searching
            </h2>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-lg`}>
              Search for blogs, users, and topics across DevMark
            </p>
          </div>

          </div>
        )}
        </div>
      </main>

      <MobileNavBottom fixed={true} avatarUrl={userAvatar}/>
    </div>
  );
};

export default SearchPage;
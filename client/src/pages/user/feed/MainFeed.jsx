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
  Pen
} from 'lucide-react';
import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";

import {logout} from '../../../services/logout.service'
import BlogCard from '../../../components/BlogCard';
import DefaultProfile from '../../../components/DefaultProfile';
import ProfileMeta from '../../../components/ProfileMeta';
import FollowerProfileMeta from '../../../components/feed page/FollowerProfileMeta';
import EventMetaCard from '../../../components/feed page/EventMetaCard';
import { useNavigate } from 'react-router-dom';
import MobileNavBottom from '../../../components/MobileNavBottom';
import axios from 'axios';
import { saveApi } from '../../../api/save.api';
import FeedSidebar from '../../../components/FeedSidebar';
import AuthLoader from '../../../components/AuthLoader';
import ProLoader from '../../../components/ProLoader';

function MainFeed() {

  const [searchFocused, setSearchFocused] = React.useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [allBlogs, setAllBlogs] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [savedBlogs, setSavedBlogs] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(4);
  const [loading,setLoading] = useState(false)
  const [userAvatar,setUserAvatar] = useState("")
  const [followStatus,setFollowStatus] = useState({})
  const [hasNextPage,setHasNextPage] = useState(false)
  const navigate = useNavigate();


  const toggleDarkMode = () => {
    setIsDark(!isDark);
  }

  const handleTheme = () => {
    const html = document.documentElement

    if (html.classList.contains("dark")) {
      setIsDark(false)
      html.classList.remove("dark")
      html.classList.add("light")
    } else {
      setIsDark(true)
      html.classList.remove("light")
      html.classList.add("dark")
    }
  }



  const loadFollowStatus = (blogs)=>{

    blogs.forEach((blog)=>{
      setFollowStatus(
        (prev)=>{
          return {
            ...prev,
            [blog.owner._id]:blog.owner.isFollowed
          }
        }
      )
    })

    console.log("Follow Status = ",followStatus)

  }

  const fetchAllBlogs = async()=>{
    try {
      setLoading(true)
      const res = await axios.get(`${import.meta.env.VITE_ENV === "production" ? import.meta.env.VITE_BACKEND_URL_PROD : import.meta.env.VITE_BACKEND_URL_DEV}/blogs/all?page=${page}&limit=${limit}`,{
        withCredentials:true
      })

      console.log("blogs : ",res.data.data.blogs)
  
      setAllBlogs(res.data.data.blogs)
      setHasNextPage(res.data.data.hasNextPage)
      
      loadFollowStatus(res.data.data.blogs)

      setLoading(false)

     

    } catch (error) {
      setLoading(false)
      console.log("Error :: Fetching All Blogs :: ",error.message)
    }
  }

  

  const fetchUserAvatar = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_ENV === "production" ? import.meta.env.VITE_BACKEND_URL_PROD : import.meta.env.VITE_BACKEND_URL_DEV}/users/avatar`, {
        withCredentials: true
      })

      // Set the user avatar in the state
      setUserAvatar(res.data.avatar)

    } catch (error) {
      console.log("Error :: Fetching User Avatar :: ", error.message)
    }
  }
  

  useEffect(()=>{
    fetchAllBlogs()
    fetchUserAvatar()
  },[])

  useEffect(()=>{
    fetchAllBlogs()
  },[limit])

  return (
    <div className="main-feed w-screen min-w-screen min-h-screen bg-[#f4f2ee] dark:bg-[#111826] mb-15">



      {/* Main Content */}
      <main className='border-1 w-full h-screen overflow-y-scroll min-h-screen flex justify-center items-start gap-3 relative'>

        {/* Section 1 Left Sidebar*/}
        <section className='hidden sm:hidden lg:block border-1 border-red-700 text-black dark:text-white lg:flex lg:flex-col fixed lg:gap-5 lg:py-3 '>

          {/*Quick actions */}

          <FeedSidebar />

        </section>

        {/* Section 2 Feed */}
        <section className='md:w-[20%] max-w-[900px] min-w-[250px]  border-1 border-red-700 flex-1 flex flex-col gap-3 md:px-5 py-3 pb-20'>

       

          <div className="w-full border-1 border-white text-white flex flex-col items-center gap-5 mt-5">
            
            {
              allBlogs.length!==0 && allBlogs.map((blog)=>(
               <div
                key={blog._id}
               className="w-full">
                 <BlogCard
                 id={blog._id}
                 key={blog._id}
                title={blog.title}
                imgUrl={blog.images?.length? blog.images[0].url : ""}
                images={blog.images}
                description={blog.content}
                likes={blog.totalLikes}
                comments={blog.totalComments}
                tags={blog.tags}
                views={blog.views}
                owner={blog.owner}
                isOwner={blog.owner.isOwner}
                followStatus={followStatus}
                setFollowStatus={setFollowStatus}
                createdAt={blog.createdAt}
                />
               </div>
            ))}

           {
            hasNextPage && !loading && (
            <button
  onClick={() => {
    setLimit((prev) => prev + prev)
  }}
  disabled={loading}
  className="relative overflow-hidden bg-gradient-to-r from-[#4777f4] to-[#9035ea] text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
>
  <span className={`flex items-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}>
    Load More Posts
  </span>
  {loading && (
    <span className="absolute inset-0 flex items-center justify-center">
      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </span>
  )}
</button>
            )
           }
          </div>

        </section>

           
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNavBottom avatarUrl={userAvatar} fixed={true} />

      {
        loading && (
         <ProLoader/>
        )
      }

    </div>
  )
}

export default MainFeed
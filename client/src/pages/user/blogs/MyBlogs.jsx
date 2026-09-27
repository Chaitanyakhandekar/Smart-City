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

import { logout } from '../../../services/logout.service'
import BlogCard from '../../../components/BlogCard';
import DefaultProfile from '../../../components/DefaultProfile';
import ProfileMeta from '../../../components/ProfileMeta';
import FollowerProfileMeta from '../../../components/feed page/FollowerProfileMeta';
import EventMetaCard from '../../../components/feed page/EventMetaCard';
import { useNavigate } from 'react-router-dom';
import MobileNavBottom from '../../../components/MobileNavBottom';
import axios from 'axios';
import FeedSidebar from '../../../components/FeedSidebar';
import ProLoader from '../../../components/ProLoader';

function MyBlogs() {

  const [searchFocused, setSearchFocused] = React.useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [allBlogs, setAllBlogs] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(4);
  const [loading, setLoading] = useState(false)
  const [userAvatar, setUserAvatar] = useState("")
  const [followStatus, setFollowStatus] = useState({})
  const [hasMore, setHasMore] = useState(false)
  const navigate = useNavigate();

  const categories = [
    { name: "All", icon: <Home size={16} />, totalPosts: 1200 },
    { name: "Javascript", icon: <Code size={16} />, totalPosts: 800 },
    { name: "React", icon: <Zap size={16} />, totalPosts: 600 },
    { name: "Node.js", icon: <Briefcase size={16} />, totalPosts: 400 },
    { name: "Career", icon: <Coffee size={16} />, totalPosts: 300 },
    { name: "Open Source", icon: <FaGithub size={16} />, totalPosts: 200 },
  ]

  const trendingTags = [
    { name: "#WebDev", totalPosts: 1200 },
    { name: "MachineLearning", totalPosts: 800 },
    { name: "#DevOps", totalPosts: 600 },
    { name: "#CloudComputing", totalPosts: 400 },
    { name: "#Debugging", totalPosts: 300 },
    { name: "#Performance", totalPosts: 200 },
    { name: "#Mobile", totalPosts: 100 },
  ]

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

  const fetchAllBlogs = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${import.meta.env.VITE_ENV === "production" ? import.meta.env.VITE_BACKEND_URL_PROD : import.meta.env.VITE_BACKEND_URL_DEV}/blogs/user?page=${page}&limit=${limit}`, {
        withCredentials: true
      })

      console.log("blogs : ", res.data.data.blogs)

      setAllBlogs(res.data.data.blogs)
      setHasMore(res.data.data.hasNextPage)

      loadFollowStatus(res.data.data.blogs)

      setLoading(false)



    } catch (error) {
      setLoading(false)
      console.log("Error :: Fetching All Blogs :: ", error.message)
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

  useEffect(() => {
    fetchAllBlogs()
    fetchUserAvatar()
  }, [])

  useEffect(() => {
    fetchAllBlogs()
  }, [limit])

  return (
    <div className="main-feed w-screen min-w-screen bg-[#f4f2ee] dark:bg-[#111826]">




      {/* Main Content */}
      <main className='border-1 w-full min-h-screen flex justify-center items-start gap-3 relative'>

        {/* Section 1 Left Sidebar*/}
        <section className='hidden sm:hidden md:block border-1 border-blue-700 text-black dark:text-white md:flex md:flex-col md:gap-5 md:py-3 sticky top-20'>


          {/*Quick actions */}

          <FeedSidebar activePage='my-blogs'/>

        </section>

        {/* Section 2 Feed */}
        <section className='md:w-[20%] max-w-[900px] min-w-[250px] border-1 border-red-700 flex-1 flex flex-col gap-3 md:px-5 py-3 '>


          <div className="w-full border-1 border-white text-white flex flex-col items-center gap-5 mt-5">

            {
              allBlogs.length !== 0 && allBlogs.map((blog) => (
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
                    followStatus={followStatus}
                    setFollowStatus={setFollowStatus}
                    createdAt={blog.createdAt}
                    isOwner={true}
                  />
                </div>
              ))}

         {
              hasMore && !loading && (
                   <button
              onClick={() => {
                setLimit((prev) => prev + prev)
              }}
              className="bg-gradient-to-r from-[#4777f4] to-[#9035ea] text-white font-bold p-3 rounded-md ">{loading ? "Loading..." : "Load More Posts"}</button>
              )
         }
          </div>

        </section>


        {/* Section 3 Right Sidebar */}
      

      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNavBottom avatarUrl={userAvatar} fixed={true} />

      {loading && (
        <ProLoader/>
      )}

    </div>
  )
}

export default MyBlogs
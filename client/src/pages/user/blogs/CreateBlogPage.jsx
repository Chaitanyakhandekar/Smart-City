import React, { useEffect, useState } from 'react'
import axios from "axios"
import { useNavigate } from 'react-router-dom'
import {
    Save,
    Eye,
    EyeOff,
    Bold,
    Italic,
    Code,
    Link2,
    List,
    ListOrdered,
    Quote,
    Image,
    Heading1,
    Heading2,
    Heading3,
    ArrowLeft,
    Settings,
    Tag,
    Globe,
    Lock,
    Clock,
    X,
    Plus,
    Type,
    FileText,
    Loader,
    Sparkles,
    TrendingUp,
    CheckCircle2,
    Trash2,
    ZoomIn,
    Home,
    Search,
    PenTool,
    Edit3,
    BookOpen,
    Bookmark,
    User,
    
} from 'lucide-react';
import MDEditor from "@uiw/react-md-editor"
import rehypeHighlights from "rehype-highlight"
import Swal from 'sweetalert2'
import MobileNavBottom from '../../../components/MobileNavBottom';
import { draftApi } from '../../../api/draft.api';

function CreateBlogPage() {
    const [tags, setTags] = useState([])
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [userAvatar, setUserAvatar] = useState("https://res.cloudinary.com/dzgtlxfhv/image/upload/v1759152185/dfwvfrdrczaf96nfnar8.png")
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [imagePreviewModal, setImagePreviewModal] = useState(null)

    const [blogData, setBlogData] = useState({
        content: "",
        title: "",
        status: "published",
        category: "Full Stack",
        tags: "",
        words: 0,
        images: [],
        characters: 0,
        readingTime: 0
    })

    const handleBlogDataChange = (e) => {
        setBlogData({
            ...blogData,
            [e.target.name]: e.target.value
        })
    }

    const clearData = () => {
        setBlogData({
            content: "",
            title: "",
            status: "published",
            category: "Full Stack",
            tags: "",
            words: 0,
            images: [],
            characters: 0,
            readingTime: 0
        })
    }

    const fetchUserAvatar = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_ENV === "production" ? import.meta.env.VITE_BACKEND_URL_PROD : import.meta.env.VITE_BACKEND_URL_DEV}/users/avatar`, {
                withCredentials: true
            })
            setUserAvatar(res.data.avatar)
        } catch (error) {
            console.log("Error :: Fetching User Avatar :: ", error.message)
        }
    }

    const publishBlog = async () => {

     

        if(blogData.images.length > 5){
            Swal.fire({
                icon: 'error',
                title: 'Too Many Images',
                text: 'You can upload a maximum of 5 images per blog post.',
                background: '#1f2936',
                color: '#c9d1d9'
            });
            return;
        }



        setLoading(true)


        try {
            const tagsArray = blogData.tags
                ? blogData.tags.split("#").map(tag => tag.trim()).filter(Boolean)
                : [];

            let imgs = new Array();
            imgs = blogData.images

            const formData = new FormData();

            formData.append("title", blogData.title || "Untitled Blog Post");
            formData.append("content", blogData.content);
            formData.append("category", blogData.category);
            formData.append("status", blogData.status);
            tagsArray.forEach(tag => formData.append("tags[]", tag));
            imgs.forEach(img => formData.append("images", img));

            const res = await axios.post(`${import.meta.env.VITE_ENV === "production" ? import.meta.env.VITE_BACKEND_URL_PROD : import.meta.env.VITE_BACKEND_URL_DEV}/blogs/create`, formData, {
                withCredentials: true,
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            if (res.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Blog Published',
                    text: 'Your blog has been published successfully!',
                    background: '#1f2936',
                    color: '#c9d1d9',
                    timer: 2000,
                    timerProgressBar: true,
                    showConfirmButton: false
                });
                clearData();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Blog Not Published',
                    text: 'There was an error publishing your blog.',
                    background: '#1f2936',
                    color: '#c9d1d9'
                });
            }
        } catch (error) {
            setError(error.message)
            console.log("PublishedBlog :: Error :: ", error)
        } finally {
            setLoading(false)
        }
    }

    const removeImage = (indexToRemove) => {
        setBlogData(prev => ({
            ...prev,
            images: prev.images.filter((_, index) => index !== indexToRemove)
        }))
    }

    useEffect(() => {
        let content = blogData.content;
        let words = content.split(" ")
        let characters = 0;

        words = words.filter((word) => word.trim() !== "")
        words.forEach((word) => {
            characters += word.length
        })

        const readingTimeCalc = Math.ceil(words.length / 200);

        setBlogData({
            ...blogData,
            words: words.length,
            characters: characters,
            readingTime: readingTimeCalc > 0 ? readingTimeCalc : 1
        })
    }, [blogData.content])

    useEffect(() => {
        fetchUserAvatar()
        const html = document.documentElement
        html.classList.add("dark")

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }, [])

    const categories = [
        'Frontend Development',
        'Backend Development',
        'Full Stack',
        'Mobile Development',
        'DevOps',
        'Data Science',
        'Machine Learning',
        'Cybersecurity',
        'Web3/Blockchain',
        'Career & Growth',
        'Tutorials',
        'Opinion & Discussion'
    ];

    const menuItems = [
    { id: "all", icon: Home, label: "All Blogs", route: "/user/feed" },
    { id: "search", icon: Search, label: "Search", route: "/user/search" },
    { id: "create", icon: PenTool, label: "Write Blog", route: "/user/blogs/create", highlight: true },
    { id: "update", icon: Edit3, label: "Update Blog", route: "/user/blogs/update"},
    { id: "my-blogs", icon: BookOpen, label: "My Blogs", route: "/user/blogs" },
    { id: "saved", icon: Bookmark, label: "Saved Blogs", route: "/user/saved-blogs" },
    { id: "profile", icon: User, label: "Profile", route: "/user/profile" }
  ];
    const navigate = useNavigate();

    const handleDraft = async () => {
        setLoading(true)
        console.log("Client Images ::::::::::::::::::::::::::::: ",blogData.images )
        const res = await draftApi.createDraft(blogData, blogData.images)

        if (res.success) {
            Swal.fire({
                icon: 'success',
                title: 'Blog Saved As Draft',
                text: 'Your blog has been saved as a draft successfully!',
                background: '#1f2936',
                color: '#c9d1d9',
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Draft Not Saved',
                text: 'There was an error saving your draft.',
                background: '#1f2936',
                color: '#c9d1d9'
            });
        }
        clearData();
        setLoading(false)
    }

    const activePage = "create";

    return (
        <div className="min-w-screen min-h-screen bg-[#0f1419]  dark:bg-[#0f1419] relative pb-16">
            {/* Enhanced Sidebar */}
         <aside className={`
              fixed top-0 left-0 h-screen w-72 z-50 
              bg-white dark:bg-[#1f2937]
              border-r border-gray-200 dark:border-gray-800
              transform transition-transform duration-300 ease-in-out
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
              md:translate-x-0
              shadow-xl
              flex flex-col
            `}>
              {/* Sidebar Header */}
              <div className="relative px-6 py-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 flex justify-center items-center bg-gradient-to-br from-blue-600 to-purple-600 text-white font-mono font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                      {'<>'}
                    </div>
                    <div>
                      <h1 className='font-bold text-xl text-gray-900 dark:text-white tracking-tight'>DevMark</h1>
                      <p className='text-xs text-gray-500 dark:text-gray-400 font-medium'>Create & Share</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSidebarOpen(false)}
                    className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
        
              {/* Navigation Menu */}
              <nav className="flex-1 overflow-y-auto px-4 py-4">
                <div className="space-y-1">
                  {menuItems.map((item) => {
                    const isActive = activePage === item.id;
                    const Icon = item.icon;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                            if(item.route !== undefined &&  item.route !== '/user/blogs/create'){
                                navigate(item.route)
                            }
                        }}
                        className={`
                          ${activePage !== "update" && item.id === "update" ? "hidden" : ""}
                          group relative flex items-center gap-3 px-4 py-3 rounded-xl
                          transition-all duration-300 ease-out text-left w-full
                          ${isActive 
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 scale-[1.02]' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:scale-[1.01]'
                          }
                        `}
                      >
                        {/* Active Indicator */}
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-lg"></div>
                        )}
                        
                        {/* Icon */}
                        <div className={`
                          ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'}
                          transition-colors duration-300
                        `}>
                          <Icon size={20} strokeWidth={2} />
                        </div>
                        
                        {/* Label */}
                        <span className={`
                          font-semibold text-sm flex-1
                          ${isActive ? 'text-white' : ''}
                        `}>
                          {item.label}
                        </span>
        
                        {/* Highlight Badge for Create */}
                        {item.highlight && !isActive && (
                          <span className="ml-auto flex items-center gap-1.5">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                          </span>
                        )}
        
                        {/* Hover Effect Overlay */}
                        {!isActive && (
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/5 group-hover:to-purple-600/5 rounded-xl transition-all duration-300"></div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </nav>
        
              {/* Sidebar Footer - Pro Tip Card */}
             <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                     <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200/50 dark:border-blue-700/30 rounded-xl p-4 group hover:shadow-lg transition-all duration-300">
                       {/* Animated Background */}
                       <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                       
                       {/* Content */}
                       <div className="relative">
                         <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                           <Sparkles size={16} className="animate-pulse" />
                           <p className="text-xs font-bold uppercase tracking-wide">Pro Tip</p>
                         </div>
                         <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                           Use markdown formatting to create rich, engaging blog posts with headers, lists, and code blocks!
                         </p>
                       </div>
             
                       {/* Decorative Elements */}
                       <div className="absolute top-0 right-0 w-20 h-20 bg-blue-400/10 rounded-full blur-2xl"></div>
                       <div className="absolute bottom-0 left-0 w-16 h-16 bg-purple-400/10 rounded-full blur-2xl"></div>
                     </div>
                   </div>
             
              
              {/* Custom Scrollbar Styles */}
              <style>{`
                aside::-webkit-scrollbar {
                  width: 6px;
                }
                aside::-webkit-scrollbar-track {
                  background: transparent;
                }
                aside::-webkit-scrollbar-thumb {
                  background: linear-gradient(180deg, #4777f4 0%, #9035ea 100%);
                  border-radius: 10px;
                }
                aside::-webkit-scrollbar-thumb:hover {
                  background: linear-gradient(180deg, #5887ff 0%, #a045fa 100%);
                }
              `}</style>
            </aside>

            {/* Main Content */}
            <div className="md:ml-64 min-h-screen">
                {/* Enhanced Navbar */}
                <nav className='sticky top-0 z-30 w-full bg-[#1f2936]/95 backdrop-blur-md border-b border-gray-700/50 shadow-lg'>
                    <div className='h-16 px-4 md:px-8 flex justify-between items-center'>
                        {/* Left Section */}
                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex items-center gap-2 text-gray-400 bg-gray-800/50 px-3 py-2 rounded-lg">
                                {/* <Clock size={16} />
                                <p className="text-sm">{blogData.words} words · {blogData.readingTime} min read</p> */}
                            </div>
                        </div>

                        {/* Right Section */}
                        <div className="flex justify-around md:justify-around w-full md:w-auto items-center gap-3">

                            <button
                                onClick={handleDraft}
                                disabled={blogData.content.trim().length === 0 && blogData.title.trim().length === 0 && !blogData.images.length}
                                title={blogData.content.trim().length === 0 && blogData.title.trim().length === 0 && !blogData.images.length ? "Cannot Save Empty Blog As A Draft." : "Save Blog as Draft"}
                                className=' flex items-center gap-2 text-sm px-4 py-2 bg-gray-700/50 hover:bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200'
                            >

                                {loading ? (
                                    <Loader size={16} className="animate-spin" />
                                ) : (
                                    <>
                                        <Save size={16} />
                                        Save Draft
                                    </>
                                )}

                            </button>

                            <button
                                onClick={publishBlog}
                                disabled={blogData.content.trim().length === 0 || blogData.title.trim().length === 0 || loading}
                                title={blogData.content.trim().length === 0 || blogData.title.trim().length === 0 ||  "Publish Blog"}
                                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg px-4 py-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                {loading ? (
                                    <Loader size={16} className="animate-spin" />
                                ) : (
                                    <>
                                        <TrendingUp size={16} />
                                        <span className=" sm:inline">Publish</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </nav>

                {/* Content Area */}
                <div className="flex flex-col w-full min-h-screen justify-center lg:flex-row gap-6 p-4 md:p-6 lg:p-8 md:mx-5 pb-12 mb-0 sm:mb-0">
                    {/* Editor Section */}
                    <div className="flex-1 max-w-4xl mx-auto lg:mx-0 w-full">
                        <div className="space-y-4">
                            {/* Title Input */}
                            <div className="bg-[#1f2936] border border-gray-700/50 rounded-xl p-4 shadow-lg hover:border-blue-500/50 transition-colors">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Type className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="title"
                                        value={blogData.title}
                                        onChange={handleBlogDataChange}
                                        placeholder="Enter your blog title..."
                                        className="w-full pl-10 pr-4 py-3 text-xl font-bold bg-transparent text-white placeholder-gray-500 focus:outline-none"
                                        maxLength={200}
                                    />
                                </div>
                                <div className="mt-2 flex justify-between items-center text-xs">
                                    <span className="text-gray-400">Make it catchy and descriptive</span>
                                    <span className={`${blogData.title.length > 180 ? 'text-orange-400' : 'text-gray-400'}`}>
                                        {blogData.title.length}/200
                                    </span>
                                </div>
                            </div>

                            {/* Markdown Editor */}
                            <div className="relative rounded-xl overflow-hidden shadow-2xl border border-gray-700/50">
                                <MDEditor
                                    value={blogData.content}
                                    onChange={(value) => setBlogData({ ...blogData, content: value || "" })}
                                    preview="edit"
                                    height={680}
                                    className='dark:bg-[#1f2936]'
                                    data-color-mode="dark"
                                    previewOptions={{
                                        rehypePlugins: [[rehypeHighlights, { detect: true }]]
                                    }}
                                    textareaProps={{
                                        placeholder: '✨ Start writing your amazing content here...\n\n💡 Pro tips:\n• Use **bold** and *italic* for emphasis\n• Add code with `backticks`\n• Create headers with # ## ###\n• Insert links [text](url)\n• Add images ![alt](url)',
                                        className: 'dark:bg-[#1f2936] dark:text-white',
                                        style: {
                                            fontSize: '15px',
                                            lineHeight: '1.7',
                                            fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace'
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Settings */}
                    <aside className="w-full lg:w-80 space-y-4">
                        {/* Category Card */}
                        <div className="bg-[#1f2936] border border-gray-700/50 rounded-xl p-5 shadow-lg">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <Tag size={18} className="text-blue-400" />
                                </div>
                                <h2 className="text-white font-bold">Category</h2>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-300 mb-2 block">Select blog category</label>
                                <select
                                    value={blogData.category}
                                    onChange={(e) => setBlogData({ ...blogData, category: e.target.value })}
                                    className='w-full bg-gray-800/50 border border-gray-600 text-white outline-none p-3 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all'
                                >
                                    {categories.map((category, index) => (
                                        <option key={index} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Image Upload & Preview Card */}
                        <div className="bg-[#1f2936] border border-gray-700/50 rounded-xl p-5 shadow-lg">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-purple-500/20 rounded-lg">
                                    <Image size={18} className="text-purple-400" />
                                </div>
                                <h2 className="text-white font-bold">Media Gallery</h2>
                            </div>

                            <div className="space-y-4">
                                {/* Upload Button */}
                                <div className="relative">
                                    <input
                                        type="file"
                                        id="image-upload"
                                        accept="image/*"
                                        multiple
                                        onChange={(e) => {
                                            setBlogData((prev) => ({
                                                ...prev,
                                                images: [...prev.images, ...Array.from(e.target.files)]
                                            }))
                                        }}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="image-upload"
                                        className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl"
                                    >
                                        <Plus size={18} />
                                        <span>Upload Images</span>
                                    </label>
                                </div>

                                {/* Image Count Badge */}
                                {blogData.images.length > 0 && (
                                    <div className="flex items-center justify-between bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg px-4 py-2">
                                        <div className="flex items-center gap-2 text-purple-400">
                                            <CheckCircle2 size={16} />
                                            <span className="text-sm font-medium">{blogData.images.length} image{blogData.images.length > 1 ? 's' : ''} selected</span>
                                        </div>
                                    </div>
                                )}

                                {/* Image Preview Grid */}
                                {blogData.images.length > 0 && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-medium text-gray-300">Preview</h3>
                                            <span className="text-xs text-gray-500">Click to enlarge</span>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                                            {blogData.images.map((image, index) => (
                                                <div
                                                    key={index}
                                                    className="group relative aspect-square rounded-lg overflow-hidden border-2 border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 shadow-lg hover:shadow-purple-500/20"
                                                >
                                                    <img
                                                        src={URL.createObjectURL(image)}
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                    />
                                                    
                                                    {/* Overlay with actions */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                        <div className="absolute bottom-0 left-0 right-0 p-2 flex items-center justify-between">
                                                            <span className="text-xs text-white/90 font-medium truncate flex-1 mr-2">
                                                                {image.name}
                                                            </span>
                                                            
                                                            <div className="flex gap-1">
                                                                <button
                                                                    onClick={() => setImagePreviewModal(URL.createObjectURL(image))}
                                                                    className="p-1.5 bg-blue-600/90 hover:bg-blue-600 text-white rounded-md transition-colors"
                                                                    title="View full size"
                                                                >
                                                                    <ZoomIn size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={() => removeImage(index)}
                                                                    className="p-1.5 bg-red-600/90 hover:bg-red-600 text-white rounded-md transition-colors"
                                                                    title="Remove image"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* File size badge */}
                                                        <div className="absolute top-2 right-2">
                                                            <span className="text-xs bg-black/70 text-white px-2 py-1 rounded-md backdrop-blur-sm">
                                                                {(image.size / 1024 / 1024).toFixed(2)} MB
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Empty State */}
                                {blogData.images.length === 0 && (
                                    <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
                                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800/50 rounded-full mb-3">
                                            <Image size={28} className="text-gray-500" />
                                        </div>
                                        <p className="text-sm text-gray-400 mb-1">No images uploaded yet</p>
                                        <p className="text-xs text-gray-500">Click upload to add images</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tags Card */}
                        <div className="bg-[#1f2936] border border-gray-700/50 rounded-xl p-5 shadow-lg ">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-green-500/20 rounded-lg">
                                    <Tag size={18} className="text-green-400" />
                                </div>
                                <h2 className="text-white font-bold">Tags</h2>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-300 mb-2 block">Add relevant tags</label>
                                <textarea
                                    className='w-full bg-gray-800/50 text-white border border-gray-600 outline-none p-3 rounded-lg resize-none focus:ring-2 focus:ring-green-500 transition-all'
                                    placeholder='#react #javascript #webdev'
                                    name="tags"
                                    value={blogData.tags}
                                    onChange={handleBlogDataChange}
                                    rows={3}
                                />
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {/* Image Preview Modal */}
            {imagePreviewModal && (
                <div 
                    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setImagePreviewModal(null)}
                >
                    <div className="relative max-w-5xl max-h-[90vh] w-full">
                        <button
                            onClick={() => setImagePreviewModal(null)}
                            className="absolute -top-12 right-0 p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        >
                            <X size={24} />
                        </button>
                        <img
                            src={imagePreviewModal}
                            alt="Full size preview"
                            className="w-full h-full object-contain rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}

            <MobileNavBottom avatarUrl={userAvatar} fixed={true}/>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(31, 41, 55, 0.5);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(139, 92, 246, 0.5);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(139, 92, 246, 0.7);
                }
            `}</style>
        </div>
    )
}

export default CreateBlogPage
import React, { useEffect, useState } from 'react'
import axios from "axios"
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
    CheckCircle2
} from 'lucide-react';
import MDEditor from "@uiw/react-md-editor"
import rehypeHighlights from "rehype-highlight"
import Swal from 'sweetalert2'
import MobileNavBottom from '../../../components/MobileNavBottom';
import { draftApi } from '../../../api/draft.api';
import { useParams } from 'react-router-dom';
import { blogApi } from '../../../api/blog.api';
import { useNavigate } from 'react-router-dom';

function EditDraft() {
    const [tags, setTags] = useState([])
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [userAvatar, setUserAvatar] = useState("https://res.cloudinary.com/dzgtlxfhv/image/upload/v1759152185/dfwvfrdrczaf96nfnar8.png")
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [draftId, setDraftId] = useState(useParams().id)

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
        setLoading(true)

        console.log("Blog Data for creating blog from Draft :::: ", blogData)
        try {
            let tagsArray = []
            if (Array.isArray(blogData.tags && blogData.tags?.length !== 0)) {
                tagsArray = blogData.tags
                    ? blogData.tags?.split("#").map(tag => tag.trim()).filter(Boolean)
                    : [];
            }

            let imgs = new Array();
            imgs = blogData.images

            const formData = new FormData();

            formData.append("title", blogData.title);
            formData.append("content", blogData.content || "");
            formData.append("category", blogData.category || "");
            formData.append("status", blogData.status || "published");
            if (tagsArray.length) {
                tagsArray.forEach(tag => formData.append("tags[]", tag));
            }
            if (imgs.length) {
                imgs.forEach(img => formData.append("images", img));
            }

            for (let pair of formData.entries()) {
                console.log(pair[0] + ": " + pair[1]);
            }


            const res = await blogApi.createBlog(formData)                  // API Call For Publish Blog

            console.log("Response for Creating Blog ::::::::::::::::::: ", res)

            if (res.success) {
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
                draftApi.deleteDraft(draftId)
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Blog Not Published',
                    text: 'There was an error publishing your blog.',
                    background: '#1f2936',
                    color: '#c9d1d9'
                });
                console.log("Error :: Publish Draft Blog :: ", res.message)
            }
        } catch (error) {
            setError(error.message)
            console.log("PublishedBlog :: Error :: ", error)
        } finally {
            setLoading(false)
        }
    }

    const fetchDraftData = async () => {
        const res = await draftApi.getDraftById(draftId)
        if (res.success) {
            setBlogData(res.data)

        }
    }

    useEffect(() => {
        let content = blogData.content;
        let words = content?.split(" ")
        let characters = 0;

        words = words?.filter((word) => word?.trim() !== "")
        words?.forEach((word) => {
            characters += word?.length
        })

        const readingTimeCalc = Math.ceil(words?.length / 200);

        setBlogData({
            ...blogData,
            words: words?.length || 0,
            characters: characters || 0,
            readingTime: readingTimeCalc > 0 ? readingTimeCalc : 1
        })
    }, [blogData.content])

    useEffect(() => {
        fetchUserAvatar()
        fetchDraftData(draftId)
        const html = document.documentElement
        html.classList.add("dark")

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }, [])

    // useEffect(()=>{
    //     if(!blogData.tags?.length){
    //         setBlogData((prev=>prev.tags=""))
    //     }
    // },[blogData])

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
        { id: "all", icon: "📚", label: "All Blogs", route: "/user/feed" },
        { id: "search", icon: "🔍", label: "Search", route: "/user/search" },
        { id: "create", icon: "✍️", label: "Write Blog", route: "/user/blogs/create", highlight: true },
        { id: "my-blogs", icon: "📖", label: "My Blogs", route: "/user/blogs" },
        { id: "saved", icon: "🔖", label: "Saved Blogs", route: "/user/saved-blogs" },
        { id: "profile", icon: "👤", label: "Profile", route: "/user/profile" }
    ];

    const navigationFn = useNavigate();
    const navigate = (route) => {
        navigationFn(route);
    };

    const handleDraft = async () => {
        setLoading(true)
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

    return (
        <div className="min-w-screen min-h-screen dark:bg-[#0f1419] relative">
            {/* Enhanced Sidebar */}
            <aside className={`
                hidden md:block
                fixed top-0 left-0 h-screen w-64 z-50 
                bg-gradient-to-b from-[#1f2936] to-[#161d28]
                border-r border-gray-700/50
                transform transition-transform duration-300 ease-in-out
                md:translate-x-0
                shadow-2xl
            `}>
                {/* Sidebar Header */}
                <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 px-5 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 flex justify-center items-center bg-white/20 backdrop-blur-sm text-white font-mono font-bold rounded-lg shadow-lg">
                                {'<>'}
                            </div>
                            <div>
                                <h1 className='font-bold text-lg text-white tracking-wide'>DevMark</h1>
                                <p className='text-xs text-white/80'>Create & Share</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="md:hidden text-white/80 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <div className="absolute inset-0 bg-black/10"></div>
                </div>

                {/* Navigation Menu */}
                <nav className="flex flex-col gap-1 p-3 mt-2">
                    {menuItems.map((item) => {
                        const isActive = "create" === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => navigate(item.route)}
                                className={`
                                    group relative flex items-center gap-3 px-4 py-3 rounded-lg
                                    transition-all duration-300 ease-out text-left w-full
                                    ${isActive
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-[1.02]'
                                        : 'hover:bg-gray-800/50 text-gray-300 hover:text-white hover:scale-[1.01]'
                                    }
                                    ${item.highlight && !isActive ? 'border border-dashed border-gray-600' : ''}
                                `}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                                )}

                                <span className="text-xl">{item.icon}</span>
                                <span className="font-medium text-sm">{item.label}</span>

                                {item.highlight && !isActive && (
                                    <span className="ml-auto flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-orange-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Sidebar Footer */}
                <div className="absolute bottom-0 w-full p-4">
                    <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-blue-400 mb-1">
                            <Sparkles size={14} />
                            <p className="text-xs font-semibold">Pro Tip</p>
                        </div>
                        <p className="text-xs text-gray-300">Use markdown for rich formatting!</p>
                    </div>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}


            {/* Main Content */}
            <div className="md:ml-64 min-h-screen">
                {/* Enhanced Navbar */}
                <nav className='sticky top-0 z-30 w-full bg-[#1f2936]/95 backdrop-blur-md border-b border-gray-700/50 shadow-lg'>
                    <div className='h-16 px-4 md:px-8 flex justify-between items-center'>
                        {/* Left Section */}
                        <div className="flex items-center gap-4">
                            {/* <button 
                                onClick={() => setSidebarOpen(true)}
                                className="md:hidden text-white hover:bg-gray-700 p-2 rounded-lg transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button> */}

                            <div className="hidden md:flex items-center gap-2 text-gray-400 bg-gray-800/50 px-3 py-2 rounded-lg">
                                <Clock size={16} />
                                <p className="text-sm">{blogData.words} words · {blogData.readingTime} min read</p>
                            </div>
                        </div>

                        {/* Right Section */}
                        <div className="flex justify-around md:justify-around w-full md:w-auto items-center gap-3">

                            <button
                                onClick={handleDraft}
                                disabled={blogData.content?.trim().length === 0 && blogData.title?.trim().length === 0 && !blogData.images?.length}
                                title={blogData.content?.trim().length === 0 && blogData.title?.trim().length === 0 && !blogData.images?.length ? "Cannot Save Empty Blog As A Draft." : "Save Blog as Draft"}
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
                                disabled={blogData.content?.trim().length === 0 || blogData.title?.trim().length === 0 || !blogData.images?.length || loading}
                                title={blogData.content?.trim().length === 0 || blogData.title?.trim().length === 0 || !blogData.images?.length ? "Title, content and image required" : "Publish Blog"}
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
                <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-6 lg:p-8">
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
                        {/* Publish Settings Card */}
                        <div className="bg-[#1f2936] border border-gray-700/50 rounded-xl p-5 shadow-lg">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <Settings size={18} className="text-blue-400" />
                                </div>
                                <h2 className="text-white font-bold">Publish Settings</h2>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2 mb-2">
                                        <Globe size={14} />
                                        Status
                                    </label>
                                    <select
                                        value={blogData.status}
                                        onChange={(e) => setBlogData({ ...blogData, status: e.target.value })}
                                        className='w-full bg-gray-800/50 border border-gray-600 text-white outline-none p-3 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all'
                                    >
                                        <option value="draft">📝 Draft</option>
                                        <option value="published">🌍 Published</option>
                                        <option value="private">🔒 Private</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2 mb-2">
                                        <Tag size={14} />
                                        Category
                                    </label>
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
                        </div>

                        {/* Tags & Images Card */}
                        <div className="bg-[#1f2936] border border-gray-700/50 rounded-xl p-5 shadow-lg">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-green-500/20 rounded-lg">
                                    <Tag size={18} className="text-green-400" />
                                </div>
                                <h2 className="text-white font-bold">Tags & Media</h2>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-300 mb-2 block">Tags</label>
                                    <textarea
                                        className='w-full bg-gray-800/50 text-white border border-gray-600 outline-none p-3 rounded-lg resize-none focus:ring-2 focus:ring-green-500 transition-all'
                                        placeholder='#react #javascript #webdev'
                                        name="tags"
                                        value={blogData.tags}
                                        onChange={handleBlogDataChange}
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2 mb-2">
                                        <Image size={14} />
                                        Upload Images
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={(e) => {
                                                setBlogData((prev) => ({
                                                    ...prev,
                                                    images: [...prev.images, ...Array.from(e.target.files)]
                                                }))
                                            }}
                                            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer transition-all"
                                        />
                                    </div>
                                    {blogData.images.length > 0 && (
                                        <div className="mt-2 flex items-center gap-2 text-xs text-green-400 bg-green-500/10 px-3 py-2 rounded-lg">
                                            <CheckCircle2 size={14} />
                                            {blogData.images.length} image(s) selected
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Statistics Card */}
                        <div className="bg-[#1f2936] border border-gray-700/50 rounded-xl p-5 shadow-lg">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-purple-500/20 rounded-lg">
                                    <FileText size={18} className="text-purple-400" />
                                </div>
                                <h2 className="text-white font-bold">Statistics</h2>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 p-3 rounded-lg">
                                    <p className='text-xs text-gray-400 mb-1'>Words</p>
                                    <p className='text-xl font-bold text-white'>{blogData.words}</p>
                                </div>

                                <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 p-3 rounded-lg">
                                    <p className='text-xs text-gray-400 mb-1'>Characters</p>
                                    <p className='text-xl font-bold text-white'>{blogData.characters}</p>
                                </div>

                                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 p-3 rounded-lg">
                                    <p className='text-xs text-gray-400 mb-1'>Read Time</p>
                                    <p className='text-xl font-bold text-white'>{blogData.readingTime} min</p>
                                </div>

                                <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 p-3 rounded-lg">
                                    <p className='text-xs text-gray-400 mb-1'>Title</p>
                                    <p className='text-xl font-bold text-white'>{blogData.title.length}</p>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            <MobileNavBottom avatarUrl={userAvatar} fixed={true} />

        </div>
    )
}

export default EditDraft
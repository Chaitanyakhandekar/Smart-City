import React, { useState, useEffect, useRef } from 'react';
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
    MapPin,
    ExternalLink as LinkIcon,
    Mail,
    MoreHorizontal,
    Edit,
    Trash2,
    Grid,
    List,
    Activity,
    Palette,
    Shield,
    Lock,
    Check,
    Camera,
    AlertCircle,
    Delete,
    Save
} from 'lucide-react';
import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";
import { userApi } from '../../../api/user.api';
import MobileNavBottom from '../../../components/MobileNavBottom';
import BlogCard from '../../../components/BlogCard';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SpinLoader from '../../../components/SpinLoader';
import { saveApi } from '../../../api/save.api';
import FeedSidebar from '../../../components/FeedSidebar';
import Swal from 'sweetalert2';
import { draftApi } from '../../../api/draft.api';
import BlogDraftCard from '../../../components/DraftBlogCard';

function ProfilePage() {
    const [activeTab, setActiveTab] = useState("posts");
    const [allBlogs, setAllBlogs] = useState([]);
    const [userAvatar, setUserAvatar] = useState("");
    const [file, setFile] = useState(null)
    const [saveButton, setSaveButton] = useState(false)

    const [profileData, setProfileData] = useState({
        name: "",
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
        totalSavedBlogs: 0,
        skills: [],
        avatar: ""

    });

    // const [profileData.bio, setprofileData.bio] = useState("");
    const [editMode, setEditMode] = useState(false);
    const [showSettingsMenu, setShowSettingsMenu] = useState(false);
    // const [skills, setskills] = useState([]);
    const [newSkill, setNewSkill] = useState("");
    const [showSkillInput, setShowSkillInput] = useState(false);
    const [skills, setSkills] = useState([])
    const [loading,setLoading] = useState(false)
    const [profilePopup, setProfilePopup] = useState(false)
    const [savedBlogs, setSavedBlogs] = useState([])
    const [drafts,setDrafts] = useState([])
    const [page,setPage] = useState(1)
    const [limit,setLimit] = useState(10)
    const [followStatus,setFollowStatus] = useState({})
    const navigate = useNavigate()
    const fileInputRef = useRef(null);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];


    const fetchAllBlogs = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_ENV === "production" ? import.meta.env.VITE_BACKEND_URL_PROD : import.meta.env.VITE_BACKEND_URL_DEV}/blogs/user?page=${1}&limit=${10}`, {
                withCredentials: true
            })

            console.log("blogs : ", res.data.data.blogs)

            setAllBlogs(res.data.data.blogs)

            console.log("Hello = ", res.data.data.blogs)



        } catch (error) {
            console.log("Error :: Fetching All Blogs :: ", error.message)
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

    const fetchDrafts = async () =>{
        const res = await draftApi.getAllUserDrafts()
        if(res.success){
            setDrafts(res.data)
        }
    }

    const fetchUserProfile = async () => {
        const res = await userApi.fetchUserProfile()
        console.log(res.data)
        setProfileData({
            id: res.data._id,
            fullName: res.data.fullName || "",
            username: res.data.username || "",
            location: res.data.location || "",
            website: res.data.website || "",
            githubUrl: res.data.githubUrl || "",
            twitterUrl: res.data.twitterUrl || "",
            linkedinUrl: res.data.linkedinUrl || "",
            joinedDate: months[new Date(res.data.createdAt).getMonth()] + " " + new Date(res.data.createdAt).getFullYear() || "",
            bio: res.data.bio || "",
            totalFollowers: res.data.totalFollowers || 0,
            totalFollowing: res.data.totalFollowing || 0,
            totalBlogs: res.data.totalBlogs || 0,
            totalSavedBlogs: res.data.totalSavedBlogs || 0,
            skills: res.data.skills || [],
            avatar: res.data.avatar || ""
        });

        setSkills(res.data.skills)

        console.log("Profile Data = ", res.data.joinedDate)
        console.log("Profile Data = ", new Date(res.data.createdAt).getMonth())

    }

    const handleProfileDataChange = (e) => {
        setProfileData((prev) => (
            {
                ...prev,
                [e.target.name]: e.target.value
            }
        ))
    }

    const handleTabChange = (e) => {
        setActiveTab(e.target.name);
    };

    const handleAddSkill = () => {
        setShowSkillInput(true)
        if (newSkill.trim() && !skills.includes(newSkill.trim())) {
            setSkills((prev) => [...prev, newSkill.trim()]);
            setNewSkill("");
            setShowSkillInput(false);
        }
        // console.log(skills)
    };

    const handleRemoveSkill = (skillToRemove) => {
        setSkills((prev) => prev.filter(skill => skill != skillToRemove))
    };

    const handleSaveProfile = async () => {
        try {
            setEditMode(false);
            setShowSettingsMenu(false);
            console.log('Saving profile:', { profileData, bio: profileData.bio, skills: skills });

            const res = await userApi.updateUserProfile({
                ...profileData, skills: skills
            })

            if (!res.success) {
                throw new Error(res.error)
            }
            if (res.success) {
                setProfileData({
                    fullName: res.data.fullName,
                    username: res.data.username,
                    location: res.data.location || "",
                    website: res.data.website || "",
                    githubUrl: res.data.githubUrl || "",
                    twitterUrl: res.data.twitterUrl || "",
                    linkedinUrl: res.data.linkedinUrl || "",
                    joinedDate: months[new Date(res.data.createdAt).getMonth()] + " " + new Date(res.data.createdAt).getFullYear(),
                    bio: res.data.bio || "",
                    totalFollowers: res.data.totalFollowers || 0,
                    totalFollowing: res.data.totalFollowing || 0,
                    totalBlogs: res.data.totalBlogs || 0,
                    totalSavedBlogs: res.data.totalSavedBlogs || 0,
                    skills: res.data.skills || [],
                    avatar: res.data.avatar || ""
                })
            }

        } catch (error) {
            console.error('Error updating profile ::', error?.message || error);
        }
    };

    const handleLogout = async () => {
        const res = await userApi.logoutUser()

        if (res.success) {
            navigate("/login")
        }
    };

    const handleCameraClick = () => {
        fileInputRef.current.click(); // triggers file picker
    };

    const handleDeleteClick = async () =>{
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                document.querySelector(".user-avatar").firstElementChild.setAttribute("src", "https://res.cloudinary.com/drftighpf/image/upload/v1751458090/f5ozv63h6ek3ujulc3gg.jpg")
                const res = await userApi.deleteUserAvatar()
                if (res.success) {
                    Swal.fire(
                        'Deleted!',
                        'Your avatar has been deleted.',
                        'success'
                    )
                }
                else {
                    Swal.fire(
                        'Error!',
                        'There was an error deleting your avatar.',
                        'error'
                    )
                }
            }
        })
    }

    const handleFileChange = (event) => {
        setFile(event.target.files[0])
        const file1 = event.target.files[0];
        if (file1) {
            setSaveButton(true)
            console.log("Selected file:", file1);
            setProfileData((prev) => ({ ...prev, avatar: URL.createObjectURL(file1) }))

            // You can handle preview or upload logic here
        }
    };

    const handleAvatarUpload = async ()=>{
        const formData =  new FormData()

        formData.set("newAvatar",file)
        setLoading(true)
        const res = await userApi.updateUserAvatar(formData)
        setProfilePopup(false)
        setLoading(false)
    }

     const fetchSavedBlogs = async()=>{
                
                setLoading(true)
                const res = await saveApi.getUserSavedBlogs(page,limit)
    
                if(res.success){
                    setSavedBlogs(res.data.data.blogs)
                    loadFollowStatus(res.data.data.blogs)
                }
                
                else{
                console.log("Error :: Fetching Saved Blogs :: ",error.message)
                }
                setLoading(false)
                
            }

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: "instant"
        })

        document.documentElement.classList.add("dark")
        fetchUserProfile()
        fetchAllBlogs()
        fetchSavedBlogs(page,limit)
        fetchDrafts()

    }, [])
    useEffect(() => {

        console.log("dfdsfdsfsddsgsdfgdfssssssssssssssssssss = ", profileData)

    }, [profileData])

    // Check if profile is incomplete
    const isProfileIncomplete = !profileData.bio || !profileData.location || skills.length === 0;

    return (
        <div className='w-screen h-auto bg-[#111825] z-100 flex flex-col pb-16'>

            <div className="text-white hidden md:block mt-4 ml-2">
                <FeedSidebar activePage="profile" />
            </div>

            {/* Cover Photo */}
            <section className="w-[95%] md:w-[70%] lg:w-[60%] xl:w-[65%] mx-auto mt-4 rounded-md py-3 px-x">
                <img
                    src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=400&fit=crop"
                    alt="Cover"
                    className="w-full h-auto rounded-md"
                />
            </section>

            {
                profilePopup &&

                <div className="w-screen h-screen bg-transparent backdrop-blur-sm fixed inset-0 z-10 flex justify-center items-center">
                    <div className="w-[95%] md:w-[30%] h-[45%] bg-gray-900 rounded-xl shadow-lg flex flex-col justify-center items-center gap-4 relative">

                        {/* Profile Picture */}
                        <div className="border-2 border-gray-700 w-[8rem] h-[8rem] bg-gray-800 rounded-full flex justify-center items-center overflow-hidden user-avatar">
                            <img
                                className="w-full h-full object-cover rounded-full"
                                src={profileData.avatar || "https://res.cloudinary.com/drftighpf/image/upload/v1751458090/f5ozv63h6ek3ujulc3gg.jpg"}
                                alt="Profile"
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-4 mt-4">
                            <button
                                onClick={handleCameraClick}
                                className="px-5 py-2 bg-gray-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-all duration-200">
                                <Camera size={20} />
                            </button>
                            <button
                            onClick={handleDeleteClick}
                            className="px-5 py-2 bg-gray-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-md transition-all duration-200">
                                <Trash2 size={20} />
                            </button>

                            {
                                saveButton &&
                                <button
                                onClick={handleAvatarUpload}
                                className="px-5 py-2 bg-green-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-md transition-all duration-200">
                                    {
                                        loading && 
                                        <SpinLoader/>

                                        ||

                                    <Save size={20} />

                                    }
                                </button>

                            }
                        </div>

                        {/* Optional Close Button */}
                        <button
                            className="absolute top-3 right-4 text-gray-400 hover:text-gray-200 text-xl font-bold transition-all duration-150"
                            onClick={() => setProfilePopup(false)} // if you have a state to close modal
                        >
                            ×
                        </button>
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />
                </div>

            }

            {/* User Info */}
            <section className="w-full md:w-[70%] lg:w-[60%] xl:w-[65%] mx-auto mt-16 rounded-bl-0 rounded-br-0   md:rounded-bl-2xl md:rounded-br-2xl bg-gradient-to-br from-[#1e293b] to-[#1e293b]/95 backdrop-blur-xl border border-slate-700/50 shadow-2xl">


                <div className="p-6 md:p-8">
                    {/* Incomplete Profile Banner */}
                    {!editMode && isProfileIncomplete && (
                        <div className="mb-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
                            <AlertCircle size={20} className="text-amber-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <h3 className="text-amber-300 font-semibold mb-1">Complete Your Profile</h3>
                                <p className="text-slate-300 text-sm mb-2">
                                    Add more details to help others know you better
                                </p>
                                <button
                                    onClick={() => setEditMode(true)}
                                    className="text-amber-400 text-sm font-medium hover:text-amber-300 transition-colors flex items-center gap-1"
                                >
                                    <Edit3 size={14} />
                                    Add Details
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                        {/* Left: Avatar + main info */}
                        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start flex-1">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-[50%] overflow-hidden border-4 border-slate-800 shadow-xl relative">
                                    <img
                                        src={profileData?.avatar || "https://res.cloudinary.com/drftighpf/image/upload/v1751458090/f5ozv63h6ek3ujulc3gg.jpg"}
                                        alt="Profile"
                                        className="w-full h-full object-cover transition-transform rounded-[50%] duration-300 group-hover:scale-110"
                                    />
                                    {editMode && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                            <Camera size={24} className="text-white" />
                                        </div>
                                    )}
                                </div>

                                {!editMode && (
                                    <button
                                        onClick={() => { setProfilePopup(true) }}
                                        className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-600 p-2.5 rounded-xl text-white shadow-lg hover:shadow-xl transition-all hover:scale-110">
                                        <ExternalLink size={18} />
                                    </button>
                                )}
                            </div>

                            <div className="flex-1 w-full text-center md:text-left">
                                {editMode ? (
                                    <input
                                        name='fullName'
                                        className="text-2xl md:text-3xl font-bold text-white mb-2 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none w-full"
                                        value={profileData.fullName}
                                        onChange={handleProfileDataChange}
                                        placeholder="Your Name"

                                    />
                                ) : (
                                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{profileData.fullName}</h1>
                                )}

                                {editMode ? (
                                    <input
                                        name='username'
                                        className="text-base text-slate-400 mb-4 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none w-full"
                                        value={profileData.username}
                                        onChange={handleProfileDataChange}
                                        placeholder="@username"
                                    />
                                ) : (
                                    <p className="text-base text-slate-400 mb-4">{profileData.username}</p>
                                )}

                                {editMode ? (
                                    <textarea
                                        className="text-base text-slate-300 leading-relaxed bg-slate-800/50 px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none w-full resize-none"
                                        rows="3"
                                        name='bio'
                                        value={profileData.bio}
                                        onChange={handleProfileDataChange}
                                        placeholder="Tell us about yourself..."
                                    />
                                ) : (
                                    <>
                                        {profileData.bio ? (
                                            <p className="text-base text-slate-300 leading-relaxed mb-4">{profileData.bio}</p>
                                        ) : (
                                            <p className="text-base text-slate-500 italic mb-4">No bio added yet</p>
                                        )}
                                    </>
                                )}

                                <div className="flex flex-wrap gap-4 justify-center md:justify-start mt-4">
                                    {editMode ? (
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <MapPin size={16} className="text-blue-400" />
                                            <input
                                                name='location'
                                                className="text-sm bg-slate-800/50 px-3 py-1 rounded-md border border-slate-600 focus:border-blue-500 focus:outline-none"
                                                value={profileData.location}
                                                onChange={handleProfileDataChange}
                                                placeholder="Add location"
                                            />
                                        </div>
                                    ) : (
                                        profileData.location && (
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <MapPin size={16} className="text-blue-400" />
                                                <span className="text-sm">{profileData.location}</span>
                                            </div>
                                        )
                                    )}

                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Calendar size={16} className="text-purple-400" />
                                        <span className="text-sm">Joined on {profileData.joinedDate}</span>
                                    </div>

                                    {editMode ? (
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <ExternalLink size={16} className="text-green-400" />
                                            <input
                                                name='website'
                                                className="text-sm bg-slate-800/50 px-3 py-1 rounded-md border border-slate-600 focus:border-blue-500 focus:outline-none"
                                                value={profileData.website}
                                                onChange={handleProfileDataChange}
                                                placeholder="Your website"
                                            />
                                        </div>
                                    ) : (
                                        profileData.website && (
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <ExternalLink size={16} className="text-green-400" />
                                                <a href={profileData.website} className="text-sm hover:text-blue-400 transition-colors">
                                                    {profileData.website.replace(/^https?:\/\//, '')}
                                                </a>
                                            </div>
                                        )
                                    )}
                                </div>

                                {/* Social Links */}
                                {editMode ? (
                                    <div className="mt-4 space-y-2 text-white">
                                        <div className="flex items-center gap-2">
                                            <FaGithub size={18} className="text-slate-400" />
                                            <   input
                                                name='githubUrl'
                                                className="text-sm bg-slate-800/50 text-white px-3 py-1 rounded-md border border-slate-600 focus:border-blue-500 focus:outline-none flex-1"
                                                value={profileData.githubUrl}
                                                onChange={handleProfileDataChange}
                                                placeholder="GitHub profile URL"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaTwitter size={18} className="text-slate-400" />
                                            <input
                                                name='twitterUrl'
                                                className="text-sm bg-slate-800/50 px-3 py-1 rounded-md border border-slate-600 focus:border-blue-500 focus:outline-none flex-1"
                                                value={profileData.twitterUrl}
                                                onChange={handleProfileDataChange}
                                                placeholder="Twitter profile URL"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaLinkedin size={18} className="text-slate-400" />
                                            <input
                                                name='linkedinUrl'
                                                className="text-sm bg-slate-800/50 px-3 py-1 rounded-md border border-slate-600 focus:border-blue-500 focus:outline-none flex-1"
                                                value={profileData.linkedinUrl}
                                                onChange={handleProfileDataChange}
                                                placeholder="LinkedIn profile URL"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    (profileData.githubUrl || profileData.twitterUrl || profileData.linkedinUrl) && (
                                        <div className="flex items-center gap-4 mt-4 justify-center md:justify-start">
                                            {profileData.githubUrl && (
                                                <a href={profileData.githubUrl} className="text-slate-400 hover:text-white transition-all hover:scale-110">
                                                    <FaGithub size={22} />
                                                </a>
                                            )}
                                            {profileData.twitterUrl && (
                                                <a href={profileData.twitterUrl} className="text-slate-400 hover:text-blue-400 transition-all hover:scale-110">
                                                    <FaTwitter size={22} />
                                                </a>
                                            )}
                                            {profileData.linkedinUrl && (
                                                <a href={profileData.linkedinUrl} className="text-slate-400 hover:text-blue-500 transition-all hover:scale-110">
                                                    <FaLinkedin size={22} />
                                                </a>
                                            )}
                                        </div>
                                    )
                                )}
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
                                                    {/* <button className="w-full text-left px-4 py-3 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-3 group">
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
                                                    </button> */}
                                                    <button className="w-full text-left px-4 py-3 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-3 group">
                                                        <Palette size={18} className="text-pink-400" />
                                                        <span className="font-medium">Appearance</span>
                                                    </button>
                                                    {/* <button className="w-full text-left px-4 py-3 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-3 group">
                                                        <Shield size={18} className="text-yellow-400" />
                                                        <span className="font-medium">Blocked Users</span>
                                                    </button> */}
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

                    {/* skills Section */}
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-white">Skills & Expertise</h2>
                            {editMode && (
                                <button
                                    onClick={handleAddSkill}
                                    className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 text-sm"
                                >
                                    <Plus size={16} />
                                    Add Skill
                                </button>
                            )}
                        </div>

                        {showSkillInput && editMode && (
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                                    placeholder="Enter skill name"
                                    className="flex-1 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none text-white text-sm"
                                />
                                <button
                                    onClick={handleAddSkill}
                                    className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors"
                                >
                                    <Check size={18} className="text-white" />
                                </button>
                                <button
                                    onClick={() => {
                                        setShowSkillInput(false);
                                        setNewSkill("");
                                    }}
                                    className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition-colors"
                                >
                                    <X size={18} className="text-white" />
                                </button>
                            </div>
                        )}

                        {skills.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {skills.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 text-blue-300 text-sm px-4 py-2 rounded-full font-medium hover:scale-105 transition-transform cursor-default flex items-center gap-2"
                                    >
                                        {skill}
                                        {editMode && (
                                            <button
                                                onClick={() => handleRemoveSkill(skill)}
                                                className="hover:text-red-400 transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 border-2 border-dashed border-slate-700 rounded-xl">
                                <Code size={32} className="text-slate-600 mx-auto mb-2" />
                                <p className="text-slate-500 text-sm">
                                    {editMode ? "Click 'Add Skill' to showcase your expertise" : "No skills added yet"}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-700">
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

                        <div className="text-center p-4 bg-gradient-to-br from-pink-500/10 to-transparent rounded-xl border border-pink-500/20 hover:scale-105 transition-transform cursor-pointer">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Bookmark size={20} className='text-pink-400' />
                                <p className='text-2xl font-bold text-white'>0</p>
                            </div>
                            <p className="text-sm text-slate-400 font-medium">Saved</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* User Posts */}
            <section className="w-full md:w-[70%] lg:w-[60%] xl:w-[65%] mx-auto mt-4 bg-[#1f2935] px-3 mb-5">
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

                {activeTab === "posts" && allBlogs.length > 0 &&


                    <div className="w-full flex flex-col gap-3 mt-5 ">
                        {
                            allBlogs.map((blog) => (
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
                                        followStatus={{}}
                                        setFollowStatus={() => { }}
                                        createdAt={blog.createdAt}
                                        // bgColor={"#182230"}
                                        isOwner={true}
                                    />
                                </div>
                            ))
                        }
                    </div>
                }

                {activeTab === "saved" && savedBlogs.length > 0 &&


                    <div className="w-full flex flex-col gap-3 mt-5 ">
                        {
                            savedBlogs.map((blog) => (
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
                                        followStatus={followStatus || {}}
                                        setFollowStatus={setFollowStatus}
                                        createdAt={blog.createdAt}
                                        // bgColor={"#182230"}
                                        isOwner={blog.owner._id === profileData.id}
                                    />
                                </div>
                            ))
                        }
                    </div>
                }


                   {activeTab === "drafts" && drafts.length > 0 &&


                    <div className="w-full flex flex-col gap-3 mt-5 ">
                        {
                            drafts.map((blog) => (
                                <div
                                    key={blog._id}
                                    className="w-full">
                                    <BlogDraftCard
                                        id={blog._id}
                                        key={blog._id}
                                        title={blog.title}
                                        imgUrl={blog.images?.length ? blog.images[0].url : ""}
                                        images={blog.images}
                                        description={blog.content}                         
                                        tags={blog.tags} 
                                        createdAt={blog.createdAt}
                                        updatedAt={blog.updatedAt}
                                        isOwner={true}
                                    />
                                </div>
                            ))
                        }
                    </div>
                }


                {activeTab === "posts" && allBlogs.length === 0 && (
                            <div className="w-full flex flex-col gap-3 mt-5 justify-center items-center py-8">
                                <BookOpen size={48} className="text-slate-600 mb-2" />
                                <h1 className="text-md md:text-xl text-gray-400">No posts yet</h1>
                            </div>
                        )}

                {activeTab === "saved" && savedBlogs.length === 0 && (
                    <div className="w-full flex flex-col gap-3 mt-5 justify-center items-center py-8">
                        <Bookmark size={48} className="text-slate-600 mb-2" />
                        <h1 className="text-md md:text-xl text-gray-400">No saved posts yet</h1>
                    </div>
                )}

                {activeTab === "drafts" && drafts.length === 0 && (
                    <div className="w-full flex flex-col gap-3 mt-5 justify-center items-center py-8">
                        <Edit size={48} className="text-slate-600 mb-2" />
                        <h1 className="text-md md:text-xl text-gray-400">No drafts yet</h1>
                    </div>
                )}
            </section>

            <MobileNavBottom avatarUrl={profileData.avatar} fixed />

        </div>
    );
}

export default ProfilePage;
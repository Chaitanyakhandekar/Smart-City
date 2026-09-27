import React,{useState} from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ProfileCard({user,isDark,followStatus,setFollowStatus,isFollowed1=false , isOwner=false}) {

     const [isFollowed, setIsFollowed] = useState(isFollowed1);
     const navigate = useNavigate()

     const handleFollow = async () => {
        console.log(user._id);
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_ENV === "production" ? import.meta.env.VITE_BACKEND_URL_PROD : import.meta.env.VITE_BACKEND_URL_DEV}/followers/follow/${user._id}`,
                {},
                {
                    withCredentials: true
                }
            );

            console.log(res.data);

            setFollowStatus(prev => ({
                ...prev,
                [user._id]: true
            }));
            setIsFollowed(true);
        } catch (error) {
            console.log("HandleFollow :: Error :: ", error.message);
        }
    };


  return (
    <div
    onClick={()=>navigate(`/user/search/${user._id}`)}
    className="flex items-start justify-between w-full ]">
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-full  flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                              <img
                              className='w-full h-full rounded-[50%] fit-cover'
                              src={user.avatar} alt="" />
                            </div>
                            <div>
                              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'} hover:text-blue-500`}>
                                {user.fullName}
                              </h3>
                              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                                {user.username}
                              </p>
                              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
                                {user.bio}
                              </p>
                              <div className="flex items-center gap-4 text-sm">
                                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                  {user.totalFollowers} followers
                                </span>
                                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                  {user.totalBlogs} blogs
                                </span>
                              </div>
                            </div>
                          </div>
                           {!isOwner && (
                        <button
                            disabled={followStatus[user._id]}
                            onClick={handleFollow}
                            className={`text-sm font-medium cursor-pointer px-4 py-1.5 rounded-md transition-all duration-200 ${
                                followStatus[user._id]
                                    ? "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-default"
                                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow"
                            }`}
                        >
                            {followStatus[user._id] ? "Following" : "Follow"}
                        </button>
                    )}
                        </div>
  )
}

export default ProfileCard
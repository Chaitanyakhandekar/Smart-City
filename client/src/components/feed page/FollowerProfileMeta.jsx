import React from 'react'
import DefaultProfile from '../DefaultProfile'
import { Eye } from 'lucide-react'

function FollowerProfileMeta({ username = "username", role = "Full Stack Dev", profileText = "1", followers = "20.4k" }) {
    return (
        <div className=" w-full flex items-center justify-around  pr-2">
            <div className=" flex items-center gap-1">
                <DefaultProfile w={"min-w-12"} h={"min-h-12"} text={profileText} />
                <div className="border-1 flex flex-col items-start gap-1">
                    <h1 className=' text-[0.9rem] font-bold'>{username}</h1>
                    <div className="flex flex-col text-sm text-gray-500 items-center gap-0">
                        <div className="flex items-center gap-1">
                            <p className='text-[0.8rem]'>{role}</p>
                        </div>
                        <p className='text-[0.8rem]'>{followers} followers</p>
                    </div>
                </div>


            </div>
                <button className="bg-[#4b78ef] text-white text-sm px-4 py-2 rounded-lg mt-4">Follow</button>
        </div>
    )
}

export default FollowerProfileMeta
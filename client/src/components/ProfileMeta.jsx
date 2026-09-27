import React from 'react'
import DefaultProfile from './DefaultProfile'
import { Eye } from 'lucide-react'

function ProfileMeta({title="Title" , views="0" , username="username" , profileText="1"}) {
    return (
        <div className=" w-full flex items-start gap-3 pl-5">
            <DefaultProfile w={"min-w-8"} h={"min-h-8"} text={profileText} />
            <div className=" flex flex-col items-start gap-1">
                <h1 className='max-w-[80%] text-sm font-bold'>{title}</h1>
                <div className="flex text-sm text-gray-500 items-center gap-3">
                    <div className="flex items-center gap-1">
                        <Eye size={14} />
                        <p>{views}</p>
                    </div>
                    <p>{username}</p>
                </div>
            </div>


        </div>
    )
}

export default ProfileMeta
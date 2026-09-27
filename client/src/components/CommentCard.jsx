import React, { useEffect, useState } from 'react'
import { getTimeAgo } from '../services/timeAgo.service'

function CommentCard({
    comment
}) {

    return (
        <div key={comment._id} className="flex gap-3">
            <div className="w-9 h-9 rounded-full flex-shrink-0 overflow-hidden bg-gray-200 dark:bg-gray-700">
                <img
                    className='w-full h-full object-cover'
                    src={comment.owner.avatar}
                    alt={comment.owner.username}
                />
            </div>
            <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm">{comment.owner.username}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{getTimeAgo(comment.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-0">{comment.content}</p>
                {/* <div className="flex items-center gap-3">
                    <button className="flex items-center gap-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors text-xs">
                        <Heart size={14} />
                        {comment.likes > 0 && <span>{comment.likes}</span>}
                    </button>
                    <button className="text-xs text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors font-medium">
                        Like
                    </button>
                </div> */}
            </div>
        </div>
    )
}

export default CommentCard

import React, { useState } from 'react';
import {
    Edit2,
    Trash2,
    Eye,
    Clock,
    FileText,
    MoreVertical,
    Calendar,
    Tag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { draftApi } from '../api/draft.api';
import Swal from 'sweetalert2';

export default function BlogDraftCard({
    id,
    title = "Untitled Draft",
    description = "",
    imgUrl,
    tags = [],
    createdAt = new Date(),
    updatedAt = new Date(),
    bgColor = "1f2936",
    onEdit = () => {},
    onDelete = () => {},
    onPreview = () => {}
}) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDeleted,setIsDeleted] = useState(false)
    const navigate = useNavigate()

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60
        };

        for (const [unit, secondsInUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInUnit);
            if (interval >= 1) {
                return `${interval} ${unit}${interval !== 1 ? 's' : ''} ago`;
            }
        }
        return 'just now';
    };

    const shouldShowReadMore = description && description.length > 120;

    const handleUniversal = () => {
        if (isMenuOpen) {
            setIsMenuOpen(false);
        }
    };

    const handleDelete = async () =>{


            Swal.fire({
                    title: 'Are you sure?',
                    text: "This action will permanently delete your Draft. You won't be able to recover it!",
                    icon: 'warning',
                    background: '#1f2936',
                    color: '#c9d1d9',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Yes, delete it!',
                    cancelButtonText: 'Cancel',
                    reverseButtons: true,
                }).then(async(result) => {
                    if (result.isConfirmed) {
                       
                         const res = await draftApi.deleteDraft(id)
        
                if (res.success) {
                    setIsDeleted(true)
        
                      Swal.fire({
                            icon: 'success',
                            title: 'Deleted!',
                            text: 'Your Draft has been deleted successfully.',
                            background: '#1f2936',
                            color: '#c9d1d9',
                            timer: 2000,
                            showConfirmButton: false,
                        });
                }
              
                    }
                });
    
    }

    return (
        <div
            onClick={handleUniversal}
            className={`${isDeleted ? "hidden" : ""} w-full md:w-full bg-white dark:bg-[#${bgColor}] md:rounded-lg shadow-sm hover:shadow-md transition-all duration-200 md:dark:border dark:border-gray-700 overflow-hidden mt-3 relative`}
        >
            {/* Draft Badge */}
            <div className="absolute top-4 left-4 z-10">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/90 backdrop-blur-sm rounded-lg text-white text-xs font-semibold shadow-md">
                    <FileText size={14} />
                    <span>DRAFT</span>
                </div>
            </div>

            {/* Image Section */}
            <div className="w-full relative group rounded-md">
                <div className="w-full flex justify-center overflow-hidden rounded-md relative">
                    {imgUrl ? (
                        <img
                            className='w-full h-[280px] object-cover transition-transform duration-300 group-hover:scale-105 p-2 rounded-md opacity-90'
                            src={imgUrl}
                            alt={title}
                        />
                    ) : (
                        <div className="w-full h-[280px] bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 p-2 rounded-md flex items-center justify-center">
                            <div className="text-center text-gray-400 dark:text-gray-500">
                                <FileText size={64} className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm font-medium">No cover image</p>
                            </div>
                        </div>
                    )}
                    
                    {/* Overlay gradient for draft indication */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none m-2 rounded-md"></div>
                </div>
            </div>

            {/* Content Section */}
            <div className="w-full flex flex-col gap-4 p-5 text-black dark:text-white">
                {/* Header with Actions */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        {/* Title */}
                        <h2 className='text-xl md:text-2xl font-bold leading-tight text-gray-800 dark:text-gray-200 line-clamp-2 mb-2'>
                            {title}
                        </h2>
                        
                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                                <Clock size={14} />
                                <span>Updated {getTimeAgo(updatedAt)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar size={14} />
                                <span>Created {getTimeAgo(createdAt)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions Menu */}
                
                </div>

                {/* Description */}
                {description && (
                    <div className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        <p className={!isExpanded && shouldShowReadMore ? "line-clamp-2" : ""}>
                            {description}
                        </p>
                        {shouldShowReadMore && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium mt-1 transition-colors"
                            >
                                {isExpanded ? "show less" : "read more"}
                            </button>
                        )}
                    </div>
                )}

                {!description && (
                    <p className="text-gray-400 dark:text-gray-500 text-sm italic">
                        No description added yet
                    </p>
                )}

                {/* Tags */}
                {tags.length > 0 ? (
                    <div className="flex items-center flex-wrap gap-2">
                        {tags.map((tag, index) => (
                            <span
                                key={index}
                                className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md text-xs font-medium border border-gray-200 dark:border-gray-700"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 text-xs">
                        <Tag size={14} />
                        <span>No tags added</span>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="w-full border-t border-gray-200 dark:border-gray-700 pt-4 flex items-center gap-3">
                    <button
                        onClick={()=>{navigate(`/user/drafts/edit/${id}`)}}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm shadow-sm hover:shadow"
                    >
                        <Edit2 size={16} />
                        <span>Continue Editing</span>
                    </button>
                    {/* <button
                        onClick={onPreview}
                        className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors font-medium text-sm border border-gray-200 dark:border-gray-700"
                    >
                        <Eye size={16} />
                    </button> */}
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors font-medium text-sm border border-gray-200 dark:border-gray-700"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
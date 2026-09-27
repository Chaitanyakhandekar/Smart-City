import React from 'react'
import { Users } from 'lucide-react';

function HomePageBox2({ number, label ,icon, ...props}) {
  return (
    <div className={`w-[85%] md:w-[32%] min-h-[200px] sm:min-w-[330px] min-w-[300px] max-w-[450px] max-h-[300px] h-auto md:h-[20vh] flex flex-col justify-center items-start pl-5 pr-3 border-[1.2px] dark:border-[0.2px] dark:border-[#343d4e] bg-[#dddd] dark:bg-[#1f2937] dark:text-white rounded-2xl py-4 hover:scale-105 transition-all duration-300 gap-3 `}>
        
       <div className="bg-gradient-to-r from-[#4777f4] to-[#9035ea] p-2 rounded-xl">
        {icon}
        </div>
      <p className="text-xl md:text-xl font-semibold">{number}</p>
      <p className='text-md md:text-md text-gray-600 dark:text-gray-400 font-semibold text-left'>{label}</p>

      
    </div>
  )
}

export default HomePageBox2
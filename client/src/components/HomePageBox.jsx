import React from 'react'

function HomePageBox({ number, label ,icon,className, ...props}) {
  return (
    <div className={`w-10 md:w-auto h-10 md:h-auto flex flex-col justify-center items-center border-[1.2px] dark:border-[0.2px] dark:border-[#343d4e] bg-[#dddd] dark:bg-[#1f2339] dark:text-white rounded-2xl p-[4rem] md:px-20 md:py-4 hover:scale-105 transition-all duration-300 ${className}`}>
        {icon && <div className="mb-2">{icon}</div>}
      <h1 className="text-3xl md:text-4xl font-bold">{number}</h1>
      <h1 className='text-md md:text-lg text-gray-600 dark:text-gray-400 font-semibold'>{label}</h1>

      
    </div>
  )
}

export default HomePageBox
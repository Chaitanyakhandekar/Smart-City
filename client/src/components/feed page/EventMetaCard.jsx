import { ArrowBigLeft, ArrowBigRight } from 'lucide-react'
import React from 'react'

function EventMetaCard({title="Event" , time="Default" , bg="bg-[#222a45]" , border="border-[#233fa0]" , linkColor=`text-[#62a5f6]`}) {
  return (
    <div className={`w-full ${bg} border-[1px] ${border} rounded-lg p-3 flex flex-col items-start px-3 gap-3`}>
        <div className="">
            <h1 className='font-semibold text-sm text-white'>{title}</h1>
        <p className='text-[0.8rem] text-gray-400'>{time}</p>
        </div>
        <div className="flex items-center gap-1">
            <p className={`underline cursor-pointer ${linkColor} text-sm font-semibold`}>Learn more →</p> 
            </div>
    </div>
  )
}

export default EventMetaCard
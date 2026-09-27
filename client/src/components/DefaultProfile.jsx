import React from 'react'

function DefaultProfile({text="P",w="w-5" ,h="h-5"}) {
  return (
    <div className={`${w} ${h} rounded-[50%] bg-gradient-to-r from-[#4777f4] to-[#9035ea] text-white flex items-center justify-center font-bold`}>{text}</div>
  )
}

export default DefaultProfile
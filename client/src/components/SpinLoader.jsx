import React from 'react'

function SpinLoader({width = 8 , height = 8 , borderWidth = 2}) {
  return (
      <div className={`animate-spin w-${width} h-${height} border-${borderWidth} border-t-transparent border-b-transparent border-r-transparent border-t-gray-300 border-l-gray-300  rounded-full`}></div>
  )
}

export default SpinLoader
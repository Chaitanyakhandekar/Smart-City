import React from 'react'

function TestimonialCard({ testimonial }) {
  return (
      <div className="flex flex-col gap-3 justify-center items-start w-[93%] lg:w-[22%] min-w-[300px] h-[30%] min-h-[200px] max-h-[200px] max-w-[400px] sm:min-w-[330px] bg-[#eeee] dark:bg-[#18212f] border-[0.1px] border-gray-300 dark:border-gray-700 rounded-2xl p-5">
                <div className="h-auto flex gap-5">
                  <div className="h-[3rem] w-[3rem] rounded-[50%] bg-gradient-to-r from-[#4777f4] to-[#9035ea] flex justify-center items-center text-white font-semibold p-5">
                    {testimonial.avatar || "SC"}
                  </div>

                  <div className="flex flex-col">
                    <p className="text-gray-800 dark:text-white font-[500] text-lg">{testimonial.name}</p>
                    <p className="text-gray-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>

                <div className='text-gray-700 dark:text-gray-300 italic leading-relaxed'>
                  "{testimonial.content}"
                </div>
            </div>

  )
}

export default TestimonialCard
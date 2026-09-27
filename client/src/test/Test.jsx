import React from "react";
import axios from "axios";

export const Test = ()=>{
    const [res,setRes] = React.useState(null)

return (
    <div className="w-[100vw] h-[100vh] bg-gray-700 flex flex-col gap-10  justify-start py-20 items-center">
        <button 
        className="bg-blue-500 text-white font-bold px-5 py-3 rounded-md hover:bg-blue-600 transition duration-300 ease-in-out"
        onClick={async()=>{
            try {
                const response = await axios.get("https://devmark-8het.onrender.com/api/v1/tests/test-1")
                console.log(response)
                setRes(response.data)
            } catch (error) {
                console.error("Error fetching data:", error);
                setRes("Error fetching data")
            }
        }}
        >
            Test
        </button>

       <div className="text-white font-bold p-5 bg-gray-800 rounded-md w-[80%] h-[50%] flex flex-col justify-center items-center">
            {res && <div className="w-full h-full">
                <h1 className="text-2xl mb-4">Response from Server:</h1>
                <pre className="bg-gray-900 p-4 rounded-md overflow-auto">{JSON.stringify(res, null, 2)}</pre>
                
            </div>}
        </div>
        
    </div>
)
}

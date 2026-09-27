import React from "react";

function Input({type="text",placeholder="placeholder",value=0,onChange=()=>{},...props}){
    return (
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            {...props}
            className="border-2 border-gray-300 p-2 rounded-lg w-full"
        />
    )
}

export default Input
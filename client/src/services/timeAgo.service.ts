import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const time = dayjs("2025-10-09T10:00:00");
console.log(time.fromNow()); // e.g. "2 hours ago"


const getTimeAgo = function(timestamp:string){
    if(!timestamp || timestamp?.trim()===""){
        console.log("Get Time Ago :: Error :: Timestamp Required for Conversion")
        return null
    }

    const time = dayjs(timestamp)
    return time.fromNow()
}

export {
    getTimeAgo
}
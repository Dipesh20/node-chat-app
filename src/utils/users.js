const user = []

//  addUser , removeUser , getUser , getUserInRoom

const addUser = ({ id , username , room})=>{
    
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //Validate the data
    if(!username || !room)
    {
        return {
            error:'Username and Room are required!'    
        }
    }
    
    // Check for existing user
    const existingUser = user.find((user)=>{
        return user.room===room && user.username===username
    })
    
    //Validate userame

    if(existingUser)
    {
        return {
            error:'Username is in use'
        }
    }

    const entry = {id,username,room}
    user.push(entry)
    return {entry}
}

const removeUser = (id)=>{
    const index = user.findIndex((ent)=>{
        return ent.id===id
    })
    if(index!==-1)
    {
        return user.splice(index,1)[0]
    }

}

const getUser = (id)=>{
    const index = user.find((entry)=>{
        return entry.id===id
    })

    if(index)
    {
        return index
    }
    else
    return undefined
}
const getUserInRoom = (room)=>{
    room = room.trim().toLowerCase()
    const entries = user.filter((ent)=>{
        return ent.room===room
    })
    return(entries)
}
module.exports = {
    addUser,
    removeUser,
    getUser,
    getUserInRoom
}
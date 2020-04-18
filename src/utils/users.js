const users = []
const rooms = []

const addUser = ({id,username,room,password}) => {
    // Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()
    password = password.trim()
    
    // Validate the data
    if(!username || !room){
        return {
            error: "Username and Room are required!"
        }
    }

    //Add room if it doesn't exist
    if(!roomExist(room)){
        const {error,roomObj} = addRoom({room,password})
        if(error){
            return {error}
        }
    }

    // Authenticate Password
    const roomObj = getRoom(room)

    if(roomObj.password !== password){
        return {
            error: "Invalid password or Room already in use!"
        }
    }

    // Check existing user in the room
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    // Validate existing user
    if(existingUser){
        return {
            error: "Username is in use!"
        }
    }

    // Add the user
    const user = {id,username,room}
    users.push(user)

    // Increase userCount in room
    increaseUserCount(room)

    return {user}
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if(index !== -1){
        const user = users.splice(index,1)[0]
        decreaseUserCount(user.room)
        return user
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}

const addRoom = ({room,password}) =>{
    room = room.trim().toLowerCase()
    password = password.trim()

    //Validate data
    if(!room){
        return {
            error: "Room is required!"
        }
    }

    //Check existing room
    if(roomExist(room)){
        return {
            error: "Room already in use!"
        }
    }

    //Add the Room
    const roomObj = {room,userCount: 0,password}
    rooms.push(roomObj)
    return {roomObj}
}

const getRoom = (room) => {
    return rooms.find((roomObj) => roomObj.room === room)
}

const deleteRoom = (room) => {
    const index = rooms.findIndex((roomObj) => roomObj.room === room)

    if(index !== -1){
        return rooms.splice(index,1)[0]
    }
}

const roomExist = (room) => {
    const roomObj = getRoom(room)
    if(roomObj) return true
    return false
}

const increaseUserCount = (room) => {
    const index = rooms.findIndex((roomObj) => roomObj.room === room)

    if(index !== -1){
        rooms[index].userCount++
    }
}

const decreaseUserCount = (room) => {
    const index = rooms.findIndex((roomObj) => roomObj.room === room)

    if(index !== -1){
        rooms[index].userCount--

        // Delete the room if no user is left
        if(rooms[index].userCount === 0){
            deleteRoom(rooms[index].room)
        }
    }
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}
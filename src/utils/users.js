const bcrypt = require('bcrypt')

const users = []
const rooms = []

const addUser = async ({id,username,room,password}) => {
    // Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()
    password = password.trim()
    
    // Validate the data
    if(!username || !room){
        throw new Error('Username and Room are required!')
    }

    //Add room if it doesn't exist
    let roomObj = {}
    if(!roomExist(room)){
        try{
            roomObj = await addRoom({room,password})

            // @issue --> if room created successfully but next step like authentication etc fails
            //            the room with 0 member is left. But room should get deleted in such case.
        } catch(error){
            throw error
        }
    }else {
        roomObj = getRoom(room)
    }
    
    // Authenticate Password if room has a password
    if(roomObj.password){
        let isMatch = false
        try{
            isMatch = await bcrypt.compare(password,roomObj.password)
        } catch(error){
            console.log("Error: Unable to compare hash password : ",error)      //for debugging
            throw new Error('Server Error, Please try again!')
        }
        if(!isMatch){
            throw new Error('Invalid password or Room already in use!')
        }
    }

    // Check existing user in the room
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    // Validate existing user
    if(existingUser){
        throw new Error('Username is in use!')
    }

    // Add the user
    const user = {id,username,room}
    users.push(user)

    // Increase userCount in room
    increaseUserCount(room)
    
    return user
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

const addRoom = async ({room,password}) =>{
    room = room.trim().toLowerCase()
    password = password.trim()

    //Validate data
    if(!room){
        throw new Error('Room is required!')
    }

    //Check existing room
    if(roomExist(room)){
        throw new Error('Room already in use!')
    }

    // Hash the password if it is not empty
    if(password){
        try{
            password = await bcrypt.hash(password,10)
        }catch(error){
            console.log("Error: Unable to hash password : ",error)      //for debugging
            throw new Error('Server Error, Please try again!')
        }
    }

    //Add the Room
    const roomObj = {room,userCount: 0,password}
    rooms.push(roomObj)
    return roomObj
}

const getRoom = (room) => {
    return rooms.find((roomObj) => roomObj.room === room)
}

const getAllRooms = () => {
    const allRooms = []
    rooms.forEach((roomObj) => {
        const room = {
            room: roomObj.room,
            userCount: roomObj.userCount
        }
        allRooms.push(room)
    })
    return allRooms
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
    getUsersInRoom,
    getAllRooms
}
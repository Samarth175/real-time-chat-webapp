const socket = io()

//elements
const $liveRoomsContainer = document.querySelector('#liverooms-container')
const $roomInput = document.querySelector("form input[name='room']")

//templates
const $liveRoomsTemplate = document.querySelector('#liverooms-template').innerHTML

//utility functions

// fills room name on selecting a live room
selectRoom = (element) => {
    const roomName = element.querySelector('.room__name').innerHTML
    $roomInput.value = roomName
}


socket.emit('getRooms', (rooms,error) => {
    if(error){
        console.log("error: ",error)
    }
    // console.log("rooms: ",rooms)

    // Render template with error if there is no live room
    if(rooms.length === 0){
        const html = Mustache.render($liveRoomsTemplate,{error: "No Room Available"})
        $liveRoomsContainer.innerHTML = html
        document.querySelector('#rooms-list__error').style.display = "block"
        return  
    }

    const html = Mustache.render($liveRoomsTemplate,{rooms})
    $liveRoomsContainer.innerHTML = html
})
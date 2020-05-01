const socket = io()

// elements
const $messageForm = document.querySelector('#form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messagesContainer = document.querySelector('#messages')
const $sidebarContainer = document.querySelector('#sidebar')

// templates
const $messageTemplate = document.querySelector('#message-template').innerHTML
const $locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const {username, room, password} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () => {
    // Get new message element
    const $newMessage = $messagesContainer.lastElementChild
    
    // Calculate new message height
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    const visibleHeight = $messagesContainer.offsetHeight

    const messagesContainerHeight = $messagesContainer.scrollHeight

    //How far user has scrolled
    const scrollOffset = $messagesContainer.scrollTop + visibleHeight

    // Scroll only when user is not scrolling manually
    if(messagesContainerHeight - newMessageHeight <= scrollOffset){
        $messagesContainer.scrollTop = $messagesContainer.scrollHeight
    }
}

const expandSidebar = () => {
    const sidebar = document.getElementById("sidebar");
    if (sidebar.className === "chat__sidebar") {
        sidebar.className += " responsive";
    } else {
        sidebar.className = "chat__sidebar";
    }
}

socket.on('message', (message) => {
    const html = Mustache.render($messageTemplate,{
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messagesContainer.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage', (message) => {
    const html = Mustache.render($locationMessageTemplate,{
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messagesContainer.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData', ({room,users}) => {
    const html = Mustache.render($sidebarTemplate,{room,users})
    $sidebarContainer.innerHTML = html
})

$messageForm.addEventListener('submit', (event) => {
    // disable form input
    $messageFormButton.setAttribute('disabled','disabled')

    event.preventDefault()

    const message = event.target.elements.message.value

    socket.emit('messageSent', message, (error) => {
        // re-enable the form input
        $messageFormInput.value = ''
        $messageFormInput.focus()
        $messageFormButton.removeAttribute('disabled')

        if(error){
            return alert(error)
        }
        // console.log("Message Delivered!")
    })
})

$sendLocationButton.addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }

    $sendLocationButton.setAttribute('disabled','disabled')

    // @issue not working in firefox
    navigator.geolocation.getCurrentPosition((position) => {
        const location = {
            latitude : position.coords.latitude,
            longitude : position.coords.longitude
        }
        socket.emit('sendLocation', location, () => {
            $sendLocationButton.removeAttribute('disabled')
            // console.log("Location shared!")
        })
    })
})

socket.emit('join', {username,room,password}, (error) => {
    if(error){
        alert(error)
        location.href = '/'
    }
})
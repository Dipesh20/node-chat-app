const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('input')
const $messageFormButton = document.querySelector('button')
const $messageLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')
//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-template').innerHTML
const SidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
const {username,room} = Qs.parse(location.search,{ ignoreQueryPrefix:true})


socket.on('message',(message)=>{
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room,users})=>{
    const html = Mustache.render(SidebarTemplate,{
        room,users
    })
    $sidebar.innerHTML=html
})

socket.on('locationmessage',(url)=>{
    const html = Mustache.render(locationMessageTemplate,{
        username:url.username,
        url:url.text,
        createdAt: moment(url.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    
    $messageFormButton.setAttribute('disabled','disabled')
    
    const message = e.target.elements.message.value

    socket.emit('sendMessage',message,(error)=>{
        
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()
        if(error)
        {
            return console.log(error)
        }
        console.log('Message Delivered')
    })
})
$messageLocationButton.addEventListener('click',()=>{
    
    $messageLocationButton.setAttribute('disabled','disabled')
    if(!navigator.geolocation)
    {
        return alert('Geoloation is not supported by your browser')
    }
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },()=>{
            $messageLocationButton.removeAttribute('disabled')
            console.log('Location Shared')
        })
    })
}) 

socket.emit('join',{username,room},(error)=>{
    if(error)
    {
        alert(error)
        location.href='/'
    }
})

const autoscroll = ()=>{

    const $newMessage = $messages.lastElementChild
    
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    const VisibleHeight = $messages.offsetHeight

    const containerHeight = $messages.scrollHeight

    const scrollOffset = $messages.scrollTop + VisibleHeight
    if (containerHeight - newMessageHeight <= scrollOffset) {

        $messages.scrollTop = $messages.scrollHeight
    }
}
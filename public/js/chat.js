const socket = io()



//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButtion = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML

//Options 
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll=()=>{
   //new message element
   const $newMessage=$messages.lastElementChild

   //height of the last message or the new message
   const newMessageStyles=getComputedStyle($newMessage)
   const newMessageMargin=parseInt(newMessageStyles.marginBottom)
   const newMessageHeight=$newMessage.offsetHeight+newMessageMargin

   //Visible height
   const visibleHeight=$messages.offsetHeight

   //Height of messages container
   const containerHeight=$messages.scrollHeight

   //How far have i scrolled
   const scrollOffset=$messages.scrollTop+visibleHeight

   if(containerHeight-newMessageHeight<=scrollOffset){
    $messages.scrollTop=$messages.scrollHeight
   }
}

socket.on('message', (message) => {
    console.log(message);

    const html = Mustache.render(messageTemplate, {
        username:message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (url) => {
    console.log(url)
    const html = Mustache.render(locationMessageTemplate, {
        username: url.username,
        url: url.url,
        createdAt: moment(url.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})
//To receive event that server is sending we use and name must match to socket.emit name
// socket.on('countUpdated',(count)=>{
//     console.log('Count has been updated!',count);
// })

// document.querySelector('#increment').addEventListener('click',()=>{
//     console.log('clicked');

//     //Emit an event from client and have that event listened for on the server
//     socket.emit('increment')
// })

socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    //disable form when location is sent and downbelow in acknowldgement we will enable the form
    $messageFormButton.setAttribute('disabled', 'disabled')//this will disable the form once submitted

    const message = e.target.elements.message.value//to get the input text form by name or u can also use getelementbyid

    //Event acknowledgement is used to indicate that the particular event is received by receiver
    socket.emit('sendMessage', message, (error) => {
        //enable the form after acknowledged
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if (error) {
            return console.log(error);
        }

        console.log('Message delivered');
    })
})


//We use browser geolocation api to fetch user application location in client side javascript
$sendLocationButtion.addEventListener('click', () => {
    //Everything we need for geolocation lives on navigator
    //if navigator.geolocation is working then the browser supports sending location
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }
    //disable the button
    $sendLocationButtion.setAttribute('disabled', 'disabled')
    //location can be fetched using below code
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            console.log('Location Shared!');
            $sendLocationButtion.removeAttribute('disabled')
        })

    })


})

socket.emit('join', {
    username: username,
    room: room
}, (error) => {
    if (error) {
        alert(error)
        location.href('/')
    }
})











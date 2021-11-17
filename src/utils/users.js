const users = []

//addUser,removeUser,getUser,getUsersInRoom

const addUser = ({ id, username, room }) => {
    //Note-id,username and room we are destructuring
    //Every single connection to the server has unique id generated

    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //Validate the data 
    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }
    
    //Check for existing user
    const existingUser= users.find((user)=>{
        return user.room===room  && user.username===username
    })

    //Validate username
    if(existingUser){
        return {
            error:'User name is in use'
        }
    }

    //Store user
    const user={id,username,room}
    users.push(user)
    return {
        user:user,
    } 
}

const removeUser=(id)=>{
    const index=users.findIndex((user)=>{
        return user.id===id
    })

    if(index!==-1){
        return users.splice(index,1)[0]  //To remove item by index we use splice u can also use filter method but splice is faster
    }
}
// addUser({
//     id:22,
//     username:'Andrew',
//     room:'South Philly'
// })
// addUser({
//     id:42,
//     username:'Mike',
//     room:'South Philly'
// })
// addUser({
//     id:32,
//     username:'Andrew',
//     room:'Center City'
// })
// console.log(users);

//  const removedUser=removeUser(22)
//  console.log(removedUser);
//  console.log(users);


const getUser=(id)=>{
    const user=users.find((user)=>{
        return user.id===id
    })
    return user
}

// const user=getUser(32)
// console.log(user);

const getUsersInRoom=(room)=>{
    room=room.trim().toLowerCase()
const userArray=users.filter((user)=>{
    return user.room===room
})
return userArray
}

// const userList=getUsersInRoom('south philly')
// console.log(userList);

module.exports={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}
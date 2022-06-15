import React, { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import Nav from './Nav';
import Chat from './Chat';
import NewRoom from './NewRoom';
import RoomMembers from './RoomMembers';
import axios from 'axios';
import confetti from 'canvas-confetti';
// import Video from './Video';

export default function Dashboard({roomsList, setRoomsList, user, room, socket, makingRoom, sessionComplete, setState}) {

  const [url, setUrl] = useState("");
  const [newRoomMessage, setNewRoomMessage] = useState("")
  // const [sessionComplete, setSessionComplete] = useState(false)

  const handleURLChange = (event) => {
    setUrl(event.target.value);
    console.log(url);
  }

  useEffect(() => {
    setUrl('');
    setState(prev => ({...prev, sessionComplete: false}));
  },[room])
  
  useEffect(() => {
    setState(prev => ({...prev, sessionComplete: true}));
  },[socket])

  useEffect(() => {
    socket.on('send_new_room', (roomData) => {
      console.log('sent room', roomData);
      if (roomData.user_1_id === user.id || roomData.user_2_id === user.id || roomData.user_3_id === user.id || roomData.user_4_id === user.id) {
        console.log('worked');
        setRoomsList(prev => ([...prev, roomData]));
        console.log('show')
        setNewRoomMessage(`${roomData.maker} has added you to a new room: ${roomData.name}!!`);
        setTimeout(() => {
          console.log('close')
          setNewRoomMessage('');
        }, 2000)
      }
    })

    socket.on('complete_session_all', () => {
      setState(prev => ({...prev, sessionComplete: true}));
    })
  }, [socket])

  const addCompletedSession = () => {
    axios.post(`/rooms/session/${room.id}`).then(res => {
      setState(prev => ({...prev, sessionComplete: true}));
      socket.emit('complete_session', room.id);
    })
  }

  return (
    <div>
    { makingRoom ? (
      <NewRoom user={user} setState={setState} socket={socket}/>
      ) : (
        <div>
          {newRoomMessage && <p>{newRoomMessage}</p>}
          <span className='current-activity'>
            {sessionComplete ? <button className='great-work'>&#x2605;</button> :<button onClick={() => {addCompletedSession(); confetti()}} className="mark-complete">&#10003;</button>}
            <h1>{room.name}</h1>
          </span>
          <div style={{display: "flex"}}>
            <div className={"me-4"}>
              <input 
                style={{width: "640px", marginBottom: "20px", height: "30px", fontSize: "17px", borderRadius: "5px"}} 
                onChange={handleURLChange} 
                type="text"
                value={url}
                placeholder="Input video url" 
              />
              <ReactPlayer playing={true} style={{border: "solid 2px black"}} url={url} controls={true}/>
            </div>
            <Chat socket={socket} user={user} room={room} setUrl={setUrl}/>
            <RoomMembers room={room} user={user}/>
          </div>
        </div>
      )
    }
    </div>
  )
}
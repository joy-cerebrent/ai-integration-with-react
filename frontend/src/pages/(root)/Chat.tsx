import React from 'react'
import { useParams } from 'react-router-dom'

const Chat = () => {
  const { id } = useParams();
  return (
    <div>Chat</div>
  )
}

export default Chat
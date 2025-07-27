import { createContext, useContext, useEffect, useState } from 'react'
import { AuthContext } from './AuthContext'
import toast from 'react-hot-toast'

// eslint-disable-next-line
export const ChatContext = createContext()

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([])
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [unseenMessages, setUnseenMessages] = useState({})

  const { socket, axios } = useContext(AuthContext)

  // get all users for sidebar
  const getUsers = async () => {
    try {
      const { data } = await axios.get('/api/messages/users')
      if (data.success) {
        setUsers(data.users)
        setUnseenMessages(data.unseenMessages)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error(error.message)
    }
  }

  // get messages for selected user
  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`)
      if (data.success) {
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast.error(error.message)
    }
  }

  // send message to selected user
  const sendMessage = async (messageData) => {
    try {
      const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData)
      if (data.success) {
        setMessages((prev) => [...prev, data.newMessage])
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error(error.message)
    }
  }

  // subscribe to messages for selected user
  const subscribeToMessages = () => {
    if (!socket) return

    socket.on('newMessage', (newMessage) => {
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        newMessage.seen = true
        setMessages((prev) => [...prev, newMessage])
        axios.put(`/api/messages/mark/${newMessage._id}`)
      } else {
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1
        }))
      }
    })
  }

  //   unsubscribe from messages
  const unsubscribeFromMessages = () => {
    if (socket) {
      socket.off('newMessage')
    }
  }

  useEffect(() => {
    subscribeToMessages()
    return () => unsubscribeFromMessages()
  }, [socket, selectedUser])

  const value = {
    messages,
    users,
    selectedUser,
    unseenMessages,
    setMessages,
    getUsers,
    setSelectedUser,
    setUnseenMessages,
    sendMessage
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}

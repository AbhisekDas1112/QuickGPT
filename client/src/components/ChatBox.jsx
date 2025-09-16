import React, { useEffect, useRef, useState } from 'react'
import { useAppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import Message from './Message';
import toast from 'react-hot-toast';

const ChatBox = () => {

  const containerRef = useRef(null);

  const { selectedChat, theme, user, axios, token, setUser } = useAppContext();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("text");
  const [isPublished, setIsPublished] = useState(false);

  const onSubmit = async (e) => {
  e.preventDefault()
  try {
    if (!user) return toast('Login to send message')
    setLoading(true)
    const promptCopy = prompt
    setPrompt('')
    setMessages(prev => [...prev, {role: 'user', content: prompt, timestamp: Date.now(), isImage: false}])
    
    const {data} = await axios.post(`/api/message/${mode}`, {chatId: selectedChat._id, prompt, isPublished}, {headers: {Authorization : token}})
  
    if (data.success) {
      setMessages(prev => [...prev, data.reply])
      // Decrease credits
      if (mode === 'image') {
        setUser(prev => ({...prev, credits: prev.credits - 2}))
      } else {
        setUser(prev => ({...prev, credits: prev.credits - 1}))
      }
    } else {
      toast.error(data.message)
      setPrompt(promptCopy)
    }
  } catch (error) {
    toast.error(error.message)
  }finally{
    setPrompt('')
    setLoading(false)
  }
}


  useEffect(() => {
    if (selectedChat) {
      setMessages(selectedChat.messages);
    }
  }, [selectedChat]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col justify-between px-4 sm:px-6 md:px-10 lg:px-20 xl:px-28 2xl:px-40 py-4">

      {/* Chat messages */}
      <div ref={containerRef} className="flex-1 mb-5 overflow-y-auto">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full">
            <img
              src={theme === 'dark' ? assets.logo_full : assets.logo_full_dark}
              alt=""
              className="w-40 sm:w-52 md:w-60 lg:w-72"
            />
            <p className="mt-5 text-4xl sm:text-6xl text-center text-gray-400 dark:text-white">
              Ask me anything.
            </p>
          </div>
        )}

        {messages.map((message, index) => <Message key={index} message={message}/>)}

        {/* Three Dots Loading */}
        {
          loading && <div className='loader flex items-center gap-1.5'>
            <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'></div>
            <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'></div>
            <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'></div>
          </div>
        }
      </div>

      {mode === "image" && (
        <label className='inline-flex items-center gap-2 mb-3 text-sm mx-auto'>
          <p className='text-xs'>Publish Generated Image to Community</p>
          <input type="checkbox" className='cursor-pointer' checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)}/>
        </label>
      )}

      {/* Prompt */}
      <form  onSubmit={onSubmit} className='bg-primary/20 dark:bg-[#583C79]/30 border border-primary dark:border-[#80609F]/30 rounded-full w-full max-w-2xl p-3 pl-4 mx-auto flex gap-4 items-center'>
        <select onChange={(e) => setMode(e.target.value)} value={mode} className='text-sm pl-3 pr-2 outline-none'>
          <option className='dark:bg-purple-900' value="text">Text</option>
          <option className='dark:bg-purple-900' value="image">Image</option>
        </select>
        <input onChange={(e) => setPrompt(e.target.value)} value={prompt} type="text" placeholder='Type your prompt here...' className='flex-1 w-full text-sm outline-none' />
        <button disabled={loading}>
          <img className='w-8 cursor-pointer' src={loading ? assets.stop_icon : assets.send_icon} alt="" />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;

import Chat from "../models/Chat.js";


// API Controller for creating a new chat
export const createChat = async (req, res) => {
    try {
        const userId = req.user._id;
        const chatData = {
            user: userId,
            messages: [],
            name: "New Chat",
            userName: req.user.name
        }
        await Chat.create(chatData)
        res.json({success: true, message: 'Chat created'});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

// API Controller for getting all chats
export const getChats = async (req, res) => {
    try {
        const userId = req.user._id;
        const chats = await Chat.find({user: userId}).sort({updatedAt: -1});

        res.json({success: true, chats});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

// API Controller for deleting a chat
export const deleteChat = async (req, res) => {
    try {
        const userId = req.user._id;
        const {chatId} = req.body;
        await Chat.deleteOne({_id: chatId, user: userId});
        res.json({success: true, message: 'Chat deleted'});
    } catch (error) {
        res.json({success: false, error: error.message});
    }
}
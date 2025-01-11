const express = require('express');
const router = express.Router();
const {chat,fetchchat,groupChat,renamegroup,removeGroup,addtogroup,createmessage,getmessage}=require('../controllers/chatControllers');
router.post('/chat',chat);
router.post('/fetchchat',fetchchat);
router.post('/chat/group',groupChat);
router.put('/chat/rename',renamegroup);
router.put('/chat/groupremove',removeGroup);
router.put('/chat/groupadd',addtogroup);
router.post('/message',createmessage);
router.get('/message/:chatId',getmessage)

module.exports = router;
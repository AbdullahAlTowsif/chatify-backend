import express from 'express';
import { getAllContacts, getAllPartners, getMessagesByUserId, sendMessage } from '../controller/message.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import { arcjetProtection } from '../middleware/arcjet.middleware.js';
const router = express.Router();

router.use(arcjetProtection, protectRoute);
// router.use( protectRoute);

router.get("/contacts", getAllContacts);
router.get("/chats", getAllPartners);
router.get("/:id", getMessagesByUserId);
router.post("/send/:id", sendMessage);


export default router;

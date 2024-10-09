import express from "express";

const router = express.Router();

import { register, authenticate, confirm } from "../controllers/userController.js";

// Auhtenticate, Register and confirm user

router.post('/register', register)
router.post('/login', authenticate)
router.get('/confirm/:token', confirm)

export default router;
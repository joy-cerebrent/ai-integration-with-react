import express from 'express';
import {
  register,
  login,
  logout,
  validateToken
} from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/validate-token', validateToken);
router.post('/logout', logout);

export default router;

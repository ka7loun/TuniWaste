import express from 'express';
import path from 'path';
import { upload, uploadFile, uploadMultiple, deleteFile } from '../controllers/fileController.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protected upload endpoints (must come before static serving to avoid conflicts)
router.post('/upload', authenticateToken, upload.single('file'), uploadFile);
router.post('/upload-multiple', authenticateToken, upload.array('files', 10), uploadMultiple);
router.delete('/:filename', authenticateToken, deleteFile);

// Serve uploaded files statically (public access) - must be last to avoid route conflicts
router.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

export default router;


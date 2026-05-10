const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const verifyToken = require('../middleware/auth.middleware');
const evidenceController = require('../controllers/evidence.controller');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Ensure this directory exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

router.post('/upload', verifyToken, upload.single('file'), evidenceController.uploadEvidence);
router.get('/meeting/:meetingId', verifyToken, evidenceController.getMeetingEvidence);
router.get('/view/:id', verifyToken, evidenceController.viewEvidence);

module.exports = router;

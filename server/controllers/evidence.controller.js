const Evidence = require('../models/evidence.model');
const AuditLog = require('../models/auditLog.model');
const User = require('../models/user.model');
const path = require('path');
const evidenceSecurity = require('../services/evidenceSecurity.service');

// Upload evidence
exports.uploadEvidence = async (req, res) => {
  try {
    const { title, description, meetingId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileType = req.file.mimetype;

    // Encrypt the file on disk
    await evidenceSecurity.encryptFile(filePath);

    // Initial creation with placeholder URL
    const evidence = await Evidence.create({
      title,
      description,
      fileUrl: '/placeholder',
      physicalPath: filePath, // Storing the actual physical path
      fileType,
      uploadedBy: req.userId,
      meetingId
    });

    // Update the URL to the secure view endpoint using its ID
    evidence.fileUrl = `/api/evidence/view/${evidence.id}`;
    await evidence.save();

    // Log the upload action
    await AuditLog.create({
      action: 'EVIDENCE_UPLOADED',
      details: `Encrypted Evidence '${title}' securely uploaded to court repository.`,
      userId: req.userId,
      meetingId
    });

    res.status(201).json({
      message: 'Evidence securely uploaded and encrypted',
      evidence
    });
  } catch (error) {
    console.error('Evidence upload error:', error);
    res.status(500).json({ message: 'Server error during evidence upload' });
  }
};

// Get evidence list for a meeting
exports.getMeetingEvidence = async (req, res) => {
  try {
    const { meetingId } = req.params;
    
    const evidenceList = await Evidence.findAll({
      where: { meetingId },
      include: [{ association: 'uploader', attributes: ['id', 'name', 'role'] }]
    });

    res.status(200).json({ evidenceList });
  } catch (error) {
    console.error('Fetch evidence error:', error);
    res.status(500).json({ message: 'Server error while fetching evidence' });
  }
};

// Securely view evidence
exports.viewEvidence = async (req, res) => {
  try {
    const { id } = req.params;
    const evidence = await Evidence.findByPk(id, {
      include: [{ association: 'meeting' }]
    });

    if (!evidence || !evidence.physicalPath) {
      return res.status(404).json({ message: 'Evidence not found' });
    }

    const user = await User.findByPk(req.userId);

    // Log the view access immediately with millisecond precision
    const timestamp = new Date();
    await AuditLog.create({
      action: 'EVIDENCE_ACCESSED',
      details: `User ${user.name} (${user.role}) viewed evidence: '${evidence.title}' at ${timestamp.toISOString()}`,
      userId: req.userId,
      meetingId: evidence.meetingId
    });

    // Decrypt file
    const decryptedBuffer = await evidenceSecurity.decryptFile(evidence.physicalPath);

    // Apply watermark if it's an image
    let finalBuffer = decryptedBuffer;
    if (evidence.fileType.startsWith('image/')) {
      finalBuffer = await evidenceSecurity.applyWatermark(decryptedBuffer, user.name, timestamp.toISOString());
    }

    // Serve the file securely
    res.setHeader('Content-Type', evidence.fileType);
    res.send(finalBuffer);
  } catch (error) {
    console.error('View evidence error:', error);
    res.status(500).json({ message: 'Server error while fetching secure evidence' });
  }
};


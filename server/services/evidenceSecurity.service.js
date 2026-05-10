const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

const ALGORITHM = 'aes-256-cbc';
// For demo purposes, we create a fallback 32-byte key if not in env
const ENCRYPTION_KEY = process.env.EVIDENCE_ENCRYPTION_KEY 
  ? crypto.createHash('sha256').update(String(process.env.EVIDENCE_ENCRYPTION_KEY)).digest('base64').substring(0, 32)
  : crypto.createHash('sha256').update('fallback_virtual_court_secret_key_123').digest('base64').substring(0, 32);
const IV_LENGTH = 16;

exports.encryptFile = async (filePath) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  
  const fileBuffer = await fs.readFile(filePath);
  const encrypted = Buffer.concat([cipher.update(fileBuffer), cipher.final()]);
  
  // Store IV prepended to the encrypted file so we can decrypt it later
  const encryptedWithIv = Buffer.concat([iv, encrypted]);
  await fs.writeFile(filePath, encryptedWithIv);
  return true;
};

exports.decryptFile = async (filePath) => {
  const fileBuffer = await fs.readFile(filePath);
  
  // Extract IV from the first 16 bytes
  const iv = fileBuffer.slice(0, IV_LENGTH);
  const encryptedText = fileBuffer.slice(IV_LENGTH);
  
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
  
  return decrypted;
};

exports.applyWatermark = async (imageBuffer, watermarkText, timestamp) => {
  try {
    const Jimp = require('jimp');
    const image = await Jimp.read(imageBuffer);
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
    
    // Create text
    const text = `CONFIDENTIAL - ${watermarkText} - ${timestamp}`;
    
    // Simple watermark at the bottom
    image.print(font, 20, image.getHeight() - 50, text);
    
    return await image.getBufferAsync(Jimp.MIME_PNG);
  } catch (error) {
    console.error('Watermarking failed:', error);
    // If it's not an image or fails, return the decrypted buffer as is
    return imageBuffer; 
  }
};

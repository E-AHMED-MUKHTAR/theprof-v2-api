const crypto = require('crypto');
require('dotenv').config();
const algorithm = 'aes-256-cbc';
const secretKey = Buffer.from(process.env.SECRET_KEY, 'utf8');
const iv = Buffer.from(process.env.initialization_vector_key, 'utf8');
function encrypt(text) {
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    content: encrypted
  };
}
function decrypt(encryptedData) {
  const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
  let decrypted = decipher.update(encryptedData.content, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
module.exports = { encrypt, decrypt };

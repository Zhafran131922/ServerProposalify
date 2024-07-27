const crypto = require('crypto');

const generateJWTSecret = () => {
  return crypto.randomBytes(32).toString('hex');
};

console.log(generateJWTSecret());

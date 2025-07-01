// /src/utils/TokenUtil.js
import jwt from 'jsonwebtoken';

class TokenUtil {
  generateAccessToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET_ACCESS_TOKEN, {
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION
    });
  }

  generateRefreshToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET_REFRESH_TOKEN, {
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION
    });
  }
   generatePasswordRecoveryToken(id) {
    return new Promise((resolve, reject) => {
      jwt.sign(
        { id },
        process.env.JWT_SECRET_PASSWORD_RECOVERY,
        { expiresIn: process.env.JWT_PASSWORD_RECOVERY_EXPIRATION || '30m' },
        (err, token) => {
          if (err) {
            return reject(err);
          }
          resolve(token);
        }
      );
    });
  }


}

export default new TokenUtil();

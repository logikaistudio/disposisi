import bcrypt from 'bcryptjs';

const hash = '$2a$10$Fh7ndOtz1on2Zt3JFH2JUOjFFJ3XH73ZMYGhhksHxTD3Sita67rfa';
const password = 'password123';

bcrypt.compare(password, hash).then(isMatch => {
  console.log(`Match: ${isMatch}`);
});

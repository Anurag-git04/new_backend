import jwt from("jsonwebtoken");

const generateToken = (payload) => {
  console.log("GENERATE key: secret =", process.env.JWT_SECRET);
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "24H" });
};

const verifyToken = (token) => {
  try {
    console.log("VERIFY key: secret =", process.env.JWT_SECRET);
    console.log(token);
    const verify = jwt.verify(token, process.env.JWT_SECRET);
    console.log("VERIFY:", verify);
    return verify;
  } catch (error) {
    console.log("ERROR:", error);
    throw new Error("Invalid token or expired token");
  }
};

module.exports = {
  generateToken,
  verifyToken,
};

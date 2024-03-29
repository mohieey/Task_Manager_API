const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const payLoad = await jwt.verify(token, process.env.jwtSecretKey);
    const user = await User.findOne({
      _id: payLoad._id,
      "tokens.token": token,
    });
    if (!user) throw new Error();
    req.token = token;
    req.user = user;
    next();
  } catch (e) {
    res.status(401).send({ error: "Please, login or register" });
  }
};

module.exports = auth;

const express = require("express");
const jwt = require("jsonwebtoken");
const admin = require("../firebaseAdmin");

const router = express.Router();

router.post("/google", async (req, res) => {
  try {
    const { token } = req.body;

    const decoded =
      await admin.auth().verifyIdToken(token);

    const user = {
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
    };

    const appToken = jwt.sign(
      user,
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      token: appToken,
      user,
    });

  } catch (error) {
    console.error(error);

    res.status(401).json({
      error: "Invalid Google token",
    });
  }
});

module.exports = router;
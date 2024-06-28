require("dotenv").config();

const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");

app.use(express.json());

let refreshTokens = []; //create database instead of this cuz this is just an example

app.post("/token", (req, res) => {
  const refreshToken = req.body.token;

  if (refreshToken == null) return res.sendStatus(401)

  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken({ name: user.name });
    res.json({ accessToken: accessToken });
  });
});




app.post("/login", (req, res) => {
  //Authentication

  const username = req.body.username;
  const user = { name: username };

  const accessToken = generateAccessToken(user);
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
  refreshTokens.push(refreshToken);
  res.json({ accessToken: accessToken, refreshToken: refreshToken });
})



// Route de diagnostic pour vérifier les tokens de rafraîchissement
app.get('/debug/tokens', (req, res) => {
    res.json({ refreshTokens });
})


function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15s" });
}

// Route pour supprimer un token de rafraîchissement
app.delete('/logout', (req, res) => {
    const refreshToken = req.body.token;
    if (refreshToken == null) return res.sendStatus(401);
    refreshTokens = refreshTokens.filter(token => token !== refreshToken);
    res.sendStatus(204);
  });



app.listen(4000);

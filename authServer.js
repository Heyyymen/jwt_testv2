const mysql = require('mysql');
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Configurer la connexion MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Se connecter à MySQL
connection.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à MySQL : ', err.stack);
    return;
  }
  console.log('Connecté à MySQL en tant que ID : ', connection.threadId);
});

app.use(express.json());

// Route POST /token pour vérifier et renvoyer un nouvel access token
app.post("/token", (req, res) => {
  const refreshToken = req.body.token;

  if (refreshToken == null) return res.sendStatus(401);

  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken({ name: user.name });
    res.json({ accessToken: accessToken });
  });
});

// Route POST /login pour l'authentification et la génération de tokens
app.post("/login", (req, res) => {
  const username = req.body.username;
  const user = { name: username };

  const accessToken = generateAccessToken(user);
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);

  // Sauvegarder le refresh token dans MySQL
  const sqlInsertToken = `INSERT INTO refresh_tokens (token, user_id) VALUES ('${refreshToken}', (SELECT id FROM users WHERE username = '${username}'))`;

  connection.query(sqlInsertToken, (err, result) => {
    if (err) {
      console.error('Erreur lors de l\'insertion du token : ', err);
      return res.sendStatus(500); // Erreur interne du serveur
    }

    console.log('Refresh token inséré avec succès !');
    res.json({ accessToken, refreshToken });
  });
});

// Route de diagnostic pour vérifier les tokens de rafraîchissement
app.get('/debug/tokens', (req, res) => {
  connection.query('SELECT token FROM refresh_tokens', (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des tokens : ', err);
      return res.sendStatus(500); // Erreur interne du serveur
    }

    const refreshTokens = results.map(row => row.token);
    res.json({ refreshTokens });
  });
});

// Fonction pour générer l'access token
function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "20s" });
}

// Route DELETE /logout pour supprimer un token de rafraîchissement
app.delete('/logout', (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken == null) return res.sendStatus(401);

  // Supprimer le refresh token de MySQL
  const sqlDeleteToken = `DELETE FROM refresh_tokens WHERE token = '${refreshToken}'`;

  connection.query(sqlDeleteToken, (err, result) => {
    if (err) {
      console.error('Erreur lors de la suppression du token : ', err);
      return res.sendStatus(500); // Erreur interne du serveur
    }

    console.log('Refresh token supprimé avec succès !');
    res.sendStatus(204);
  });
});

// Démarrer le serveur Express
const port = 4000;
app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});

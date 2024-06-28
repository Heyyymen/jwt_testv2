// à tester

// const axios = require('axios');

// async function getTokenAndFetchPosts() {
//     try {
//         // Étape 1: Se connecter et récupérer le token
//         const loginResponse = await axios.post('http://localhost:3000/login', {
//             username: 'Jim'
//         }, {
//             headers: {
//                 'Content-Type': 'application/json'
//             }
//         });

//         const accessToken = loginResponse.data.accessToken;
//         console.log('Access Token:', accessToken);

//         // Étape 2: Utiliser le token pour accéder aux posts
//         const postsResponse = await axios.get('http://localhost:3000/posts', {
//             headers: {
//                 'Authorization': `Bearer ${accessToken}`
//             }
//         });

//         console.log('Posts:', postsResponse.data);
//     } catch (error) {
//         console.error('Error:', error.response ? error.response.data : error.message);
//     }
// }

// getTokenAndFetchPosts();

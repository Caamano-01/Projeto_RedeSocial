import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { initAuth } from './auth.js';
import { criarPostNovo } from './posts.js';
import { deslogar } from './auth.js';

document.getElementById("btnLogout")?.addEventListener("click", deslogar);

// Importar para garantir que os listeners globais de comentários e likes sejam registrados
import './comments.js';
import './likes.js';

const firebaseConfig = {
  apiKey: "AIzaSyB19gxl7E3NeqKKZ9pNe634wtbkghXNSVM",
  authDomain: "senax-rede.firebaseapp.com",
  databaseURL: "https://senax-rede-default-rtdb.firebaseio.com",
  projectId: "senax-rede",
  storageBucket: "senax-rede.firebasestorage.app",
  messagingSenderId: "714869150902",
  appId: "1:714869150902:web:2ee1f1d634624113a4c217"
};

initializeApp(firebaseConfig);

// Apenas inicialize o Auth. 
// O carregamento do feed já acontece dentro do onAuthStateChanged lá no auth.js
initAuth();

// Botão de criar post (garantindo que o evento seja anexado)
const btnPostar = document.querySelector(".btn-post-submit");
if (btnPostar) {
    btnPostar.addEventListener("click", criarPostNovo);
}
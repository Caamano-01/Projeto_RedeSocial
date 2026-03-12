import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { initAuth } from './auth.js';
import { criarPostNovo } from './posts.js';

import './feed.js';
import './comments.js';
import './likes.js';
import './seguindo.js';
import './postRender.js';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB19gxl7E3NeqKKZ9pNe634wtbkghXNSVM",
  authDomain: "senax-rede.firebaseapp.com",
  databaseURL: "https://senax-rede-default-rtdb.firebaseio.com",
  projectId: "senax-rede",
  storageBucket: "senax-rede.firebasestorage.app",
  messagingSenderId: "714869150902",
  appId: "1:714869150902:web:2ee1f1d634624113a4c217"
};

// Inicialização do Firebase
initializeApp(firebaseConfig);

// Inicia a autenticação e escuta de usuários
initAuth();
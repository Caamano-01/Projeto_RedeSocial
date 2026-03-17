import './firebase-config.js'; // inicialização antes de tudo
import { initAuth } from './auth.js';
import { criarPostNovo } from './posts.js';
import { deslogar } from './auth.js';

// Importar para garantir que os listeners globais de comentários e likes sejam registrados
import './comments.js';
import './likes.js';

document.getElementById("btnLogout")?.addEventListener("click", deslogar);

// Inicializa o Auth (o carregamento do feed já acontece dentro do onAuthStateChanged no auth.js)
initAuth();

// Botão de criar post
const btnPostSubmit = document.querySelector(".btn-post-submit");
if (btnPostSubmit) {
    btnPostSubmit.addEventListener("click", criarPostNovo);
}
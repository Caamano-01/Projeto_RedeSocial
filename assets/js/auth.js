import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { carregarPosts } from './feed.js';
import { carregarSeguindo } from './seguindo.js';

export let usuarioAtual = null;
export let usuarioDados = null;

// Retorna avatar do usuário logado
export function getAvatarUsuario() {
  return usuarioDados?.fotoPerfil || "../assets/img/default-avatar.png";
}

// Atualiza sidebar e avatar do post
export async function atualizarSidebarUsuario() {
  if (!usuarioAtual) return;

  const db = getDatabase();
  const snap = await get(ref(db, "usuarios/" + usuarioAtual.uid));
  usuarioDados = snap.val();

  const avatarEl = document.getElementById("userAvatar");
  const nomeEl = document.getElementById("userName");
  const postAvatarEl = document.getElementById("postAvatar");

  const fotoPerfil = getAvatarUsuario();

  if (avatarEl) avatarEl.src = fotoPerfil;
  if (nomeEl) nomeEl.textContent = usuarioDados?.nome || "Usuário";
  if (postAvatarEl) postAvatarEl.src = fotoPerfil;
}

// Inicializa autenticação e escuta mudanças
export function initAuth() {
  const auth = getAuth();

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      usuarioAtual = user;
      
      // Pegar os dados do banco
      await atualizarSidebarUsuario(); 
      
      // depois carregar o que depende dos dados (como o feed)
      carregarSeguindo();
      carregarPosts();
    } else {
      window.location.href = "./index.html";
    }
  });
}

// Função para deslogar
export function deslogar() {
  const auth = getAuth();
  signOut(auth).then(() => {
    window.location.href = "./index.html";
  });
}
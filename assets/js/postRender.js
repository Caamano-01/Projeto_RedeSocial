import { getDatabase, ref, get, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { curtir } from './likes.js';
import { abrirComentarios } from './comments.js';
import { escaparHTML, tempo } from './utils.js';

export async function renderizarPost(id, p, usuario) {
  const db = getDatabase();
  const div = document.createElement("div");
  div.className = "post";

  const likesSnap = await get(ref(db, "likes/" + id));
  const likesData = likesSnap.exists() ? likesSnap.val() : {};
  const totalLikes = Object.keys(likesData).length;
  const meuLike = likesData[usuario.uid];

  div.innerHTML = `
    <img class="post-user-img" src="${p.avatar}">
    <div>
      <div class="post-info">
        <strong>${escaparHTML(p.nome)}</strong>
        <span>${tempo(p.timestamp)}</span>
      </div>
      <div class="post-text">${escaparHTML(p.texto)}</div>
      ${p.imagem ? `<img class="post-img" src="${p.imagem}">` : ""}
      <div class="post-interactions">
        <span class="btn-like">${meuLike ? '💔' : '❤️'} ${totalLikes}</span>
        <span class="btn-comentario">💬 Comentários</span>
        ${p.uid === usuario.uid ? `<span class="btn-deletar">🗑</span>` : ""}
      </div>
      <div id="comentarios-${id}"></div>
    </div>
  `;

  div.querySelector(".btn-like").addEventListener("click", () => curtir(id, usuario));
  div.querySelector(".btn-comentario").addEventListener("click", () => abrirComentarios(id, usuario));
  if (p.uid === usuario.uid) {
    div.querySelector(".btn-deletar").addEventListener("click", () => deletarPost(id));
  }

  return div;
}

export function deletarPost(id) {
  if (!confirm("Deseja realmente deletar este post?")) return;
  const db = getDatabase();
  remove(ref(db, "posts/" + id));
}

window.deletarPost = deletarPost;
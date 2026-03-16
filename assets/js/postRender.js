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
    <div class="post-container-flex" onclick="location.href='perfil.html?uid=${p.uid}'" style="cursor:pointer;">
      <img class="post-user-img" src="${p.avatar}">

      <div class="post-body">
        <div class="post-header-info">
          <span class="post-author-name">${escaparHTML(p.nome)}</span>
          <span class="post-metadata"> · ${tempo(p.timestamp)}</span>
        </div>
      
        <div class="post-text">${escaparHTML(p.texto)}</div>

        ${p.imagem ? `<img class="post-img" src="${p.imagem}">` : ""}
        
        <div class="post-interactions">
          <div class="interaction-item btn-like">
              <i class="${meuLike ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}" 
                style="color: ${meuLike ? '#ff3131' : 'inherit'}"></i>
              <span>${totalLikes}</span>
          </div>
          
          <div class="interaction-item btn-comentario">
              <i class="fa-regular fa-comment"></i>
              <span>Comentários</span>
          </div>

          ${p.uid === usuario.uid ? `
          <div class="interaction-item btn-deletar">
              <i class="fa-regular fa-trash-can"></i>
          </div>` : ""}
          </div>
          <div id="comentarios-${id}"></div>
        </div>
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
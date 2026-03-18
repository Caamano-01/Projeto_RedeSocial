import { getDatabase, ref, get, remove, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { curtir } from './likes.js';
import { abrirComentarios } from './comments.js';
import { escaparHTML, tempo } from './utils.js';

function monitorarContagemComentarios(idPost, db) {
    const contagemRef = ref(db, "comentarios/" + idPost);
    onValue(contagemRef, (snapshot) => {
        const span = document.getElementById(`contagem-${idPost}`);
        if (span) {
            const total = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
            span.innerText = total;
        }
    });
}

export async function renderizarPost(id, p, usuario) {
  const db = getDatabase();
  const div = document.createElement("div");
  div.className = "post";

  // Busca Likes
  const likesSnap = await get(ref(db, "likes/" + id));
  const likesData = likesSnap.exists() ? likesSnap.val() : {};
  const totalLikes = Object.keys(likesData).length;
  const meuLike = likesData[usuario.uid];

  div.innerHTML = `
    <div class="post-container-flex">
      <img class="post-user-img" src="${p.avatar}" 
           onclick="window.location.href='perfil.html?uid=${p.uid}'" 
           style="cursor:pointer;">

      <div class="post-body">
        <div class="post-header-info">
          <span class="post-author-name" 
                onclick="window.location.href='perfil.html?uid=${p.uid}'" 
                style="cursor:pointer; font-weight: bold;">${escaparHTML(p.nome)}</span>
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
              <span id="contagem-${id}">0</span>
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

  // Listeners de clique
  div.querySelector(".btn-like").onclick = (e) => { e.stopPropagation(); curtir(id, usuario); };
  div.querySelector(".btn-comentario").onclick = (e) => { e.stopPropagation(); abrirComentarios(id, usuario); };
  
  const btnDel = div.querySelector(".btn-deletar");
  if (btnDel) {
      btnDel.onclick = (e) => { e.stopPropagation(); deletarPost(id); };
  }

  monitorarContagemComentarios(id, db);

  return div;
}

export function deletarPost(id) {
  if (!confirm("Deseja realmente deletar este post?")) return;
  remove(ref(getDatabase(), "posts/" + id));
  remove(ref(getDatabase(), "comentarios/" + id));
  remove(ref(getDatabase(), "likes/" + id));
}
import { getDatabase, ref, onValue, query, orderByChild, limitToLast } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { renderizarPost } from './postRender.js';
import { listaSeguindo } from './seguindo.js';
import { usuarioAtual } from './auth.js';

export const feed = document.getElementById("posts-feed");
export let modoFeed = "todos";

export function carregarPosts() {
  if (!usuarioAtual) return;
  const db = getDatabase();
  const postsQuery = query(ref(db, "posts"), orderByChild("timestamp"), limitToLast(50));

  onValue(postsQuery, async (snap) => {
    feed.innerHTML = "";
    const dados = snap.val();
    if (!dados) return;

    const posts = Object.entries(dados).sort((a, b) => b[1].timestamp - a[1].timestamp);

    // Dentro de carregarPosts
    for (const [id, p] of posts) {
      // Se o modo for "seguindo" e o autor não estiver na lista, pula
      if (modoFeed === "seguindo" && (!listaSeguindo || !listaSeguindo[p.uid])) {
        continue;
      }
      
      // No modo "todos" (Para Você), ele deve passar direto e renderizar
      const postElemento = await renderizarPost(id, p, usuarioAtual);
      feed.appendChild(postElemento);
    }
  });
}

// Tabs feed
document.getElementById("tab-para-voce").onclick = () => {
  modoFeed = "todos";
  document.getElementById("tab-para-voce").classList.add("active");
  document.getElementById("tab-seguindo").classList.remove("active");
  carregarPosts();
};

document.getElementById("tab-seguindo").onclick = () => {
  modoFeed = "seguindo";
  document.getElementById("tab-seguindo").classList.add("active");
  document.getElementById("tab-para-voce").classList.remove("active");
  carregarPosts();
};
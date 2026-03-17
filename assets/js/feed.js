import { getDatabase, ref, onValue, query, orderByChild, limitToLast } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { renderizarPost } from './postRender.js';
import { listaSeguindo } from './seguindo.js';
import { usuarioAtual } from './auth.js';

export const feed = document.getElementById("posts-feed");
export let modoFeed = "todos";

export function carregarPosts() {
  if (!usuarioAtual || !feed) return;
  const db = getDatabase();
  const postsQuery = query(ref(db, "posts"), orderByChild("timestamp"), limitToLast(50));

  onValue(postsQuery, async (snap) => {
    feed.innerHTML = "";
    const dados = snap.val();
    if (!dados) return;

    const posts = Object.entries(dados).sort((a, b) => b[1].timestamp - a[1].timestamp);

    for (const [id, p] of posts) {
      if (modoFeed === "seguindo" && (!listaSeguindo || !listaSeguindo[p.uid])) continue;
      
      const postElemento = await renderizarPost(id, p, usuarioAtual);
      feed.appendChild(postElemento);
    }
  });
}

// Configuração das abas (apenas se existirem na tela)
const tabParaVoce = document.getElementById("tab-para-voce");
const tabSeguindo = document.getElementById("tab-seguindo");

if (tabParaVoce && tabSeguindo) {
  tabParaVoce.onclick = () => {
    modoFeed = "todos";
    tabParaVoce.classList.add("active");
    tabSeguindo.classList.remove("active");
    carregarPosts();
  };

  tabSeguindo.onclick = () => {
    modoFeed = "seguindo";
    tabSeguindo.classList.add("active");
    tabParaVoce.classList.remove("active");
    carregarPosts();
  };
}
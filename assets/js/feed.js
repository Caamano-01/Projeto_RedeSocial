import { getDatabase, ref, onValue, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { renderizarPost } from './postRender.js';
import { listaSeguindo } from './seguindo.js';

export const feed = document.getElementById("posts-feed");
export let modoFeed = "todos";

export function carregarPosts() {
  const db = getDatabase();
  onValue(ref(db, "posts"), async (snap) => {
    feed.innerHTML = "";
    const dados = snap.val();
    if (!dados) return;

    const posts = Object.entries(dados).sort((a,b)=>b[1].timestamp-a[1].timestamp);
    for (const [id, p] of posts) {
      if (modoFeed === "seguindo" && !listaSeguindo[p.uid]) continue;
      feed.appendChild(await renderizarPost(id, p, id));
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
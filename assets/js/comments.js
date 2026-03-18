import { getDatabase, ref, push, onValue, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { usuarioAtual } from './auth.js';
import { escaparHTML } from './utils.js';

const comentariosListeners = {};

export function abrirComentarios(id, usuario) {
  const db = getDatabase();
  const c = document.getElementById("comentarios-" + id);

  c.innerHTML = `
    <div class="comment-box">
      <input id="comentario-${id}" placeholder="Postar sua resposta">
      <button id="btn-comentar-${id}">Responder</button>
    </div>
    <div id="lista-${id}" class="lista-comentarios"></div>
  `;

  document.getElementById(`btn-comentar-${id}`).addEventListener("click", () => enviarComentario(id, usuario));
  carregarComentarios(id);
}

export async function enviarComentario(id, usuario) {
  const db = getDatabase();
  const input = document.getElementById("comentario-" + id);
  const texto = input.value.trim();
  if (!texto) return;

  const snap = await get(ref(db, "usuarios/" + usuario.uid));
  const u = snap.val();

  await push(ref(db, "comentarios/" + id), {
    uid: usuario.uid,
    nome: u.nome,
    fotoPerfil: u.fotoPerfil || "",
    texto,
    timestamp: Date.now()
  });

  input.value = "";
  const lista = document.getElementById("lista-" + id);
  lista.scrollTop = lista.scrollHeight;
}

export function carregarComentarios(id) {
  const db = getDatabase();

  if (comentariosListeners[id]) comentariosListeners[id](); // remove listener antigo

  const listener = onValue(ref(db, "comentarios/" + id), (snap) => {
    const lista = document.getElementById("lista-" + id);
    lista.innerHTML = "";
    const dados = snap.val();
    if (!dados) return;

    const fragment = document.createDocumentFragment();
    Object.values(dados)
      .sort((a, b) => a.timestamp - b.timestamp)
      .forEach(c => {
        const div = document.createElement("div");
        div.className = "comentario-item";
        const tempo = formatarTempo(c.timestamp);

        // Lógica para decidir qual foto mostrar
        const fotoExibida = c.fotoPerfil 
          ? c.fotoPerfil 
          : `https://ui-avatars.com/api/?name=${encodeURIComponent(c.nome)}&background=ff7804&color=fff`;

        div.innerHTML = `
          <img class="avatar" src="${fotoExibida}" alt="Perfil">
          <div class="comentario-conteudo">
            <div class="comentario-topo">
              <span class="nome">${escaparHTML(c.nome)}</span>
              <span class="tempo">${tempo}</span>
            </div>
            <div class="texto">${escaparHTML(c.texto)}</div>
          </div>
        `;
        fragment.appendChild(div);
      });
    lista.appendChild(fragment);
    lista.scrollTop = lista.scrollHeight;
  });

  comentariosListeners[id] = listener;
}

function formatarTempo(timestamp) {
  const agora = Date.now();
  const diff = Math.floor((agora - timestamp) / 1000);

  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

window.abrirComentarios = abrirComentarios;
window.enviarComentario = enviarComentario;
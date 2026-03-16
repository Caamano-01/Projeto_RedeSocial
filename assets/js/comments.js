import { getDatabase, ref, push, onValue, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { usuarioAtual } from './auth.js';
import { escaparHTML } from './utils.js';

const comentariosListeners = {};

export function abrirComentarios(id, usuario) {
  const db = getDatabase();
  const c = document.getElementById("comentarios-" + id);

  c.innerHTML = `
    <div class="comment-box">
      <input id="comentario-${id}" placeholder="Comentar">
      <button id="btn-comentar-${id}">Enviar</button>
    </div>
    <div id="lista-${id}"></div>
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
        const p = document.createElement("p");
        p.innerHTML = `<strong>${escaparHTML(c.nome)}</strong>: ${escaparHTML(c.texto)}`;
        fragment.appendChild(p);
      });
    lista.appendChild(fragment);
    lista.scrollTop = lista.scrollHeight;
  });

  comentariosListeners[id] = listener;
}

window.abrirComentarios = abrirComentarios;
window.enviarComentario = enviarComentario;
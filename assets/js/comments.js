import { getDatabase, ref, onValue, push, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { escaparHTML } from './utils.js';

// Abrir comentários de um post
export function abrirComentarios(id, usuario) {
  const db = getDatabase(); // Inicializa aqui
  const c = document.getElementById("comentarios-" + id);

  c.innerHTML = `
    <div class="comment-box">
      <input id="comentario-${id}" placeholder="Comentar">
      <button id="btn-comentar-${id}">Enviar</button>
    </div>
    <div id="lista-${id}"></div>
  `;

  document.getElementById(`btn-comentar-${id}`).addEventListener("click", () => {
    enviarComentario(id, usuario);
  });

  carregarComentarios(id);
}

// Enviar comentário
export async function enviarComentario(id, usuario) {
  const db = getDatabase(); // Inicializa aqui
  const input = document.getElementById("comentario-" + id);
  const texto = input.value.trim();
  if (!texto) return;

  const snap = await get(ref(db,"usuarios/"+usuario.uid));
  const u = snap.val();

  await push(ref(db,"comentarios/"+id),{
    nome: u.nome,
    texto
  });

  input.value="";
}

// Carregar comentários
export function carregarComentarios(id) {
  const db = getDatabase();
  onValue(ref(db,"comentarios/"+id),(snap)=>{
    const lista = document.getElementById("lista-"+id);
    lista.innerHTML="";
    const dados = snap.val();
    if(!dados) return;
    Object.values(dados).forEach((c)=>{
      lista.innerHTML += `<p><strong>${escaparHTML(c.nome)}</strong>: ${escaparHTML(c.texto)}</p>`;
    });
  });
}

window.abrirComentarios = abrirComentarios;
window.enviarComentario = enviarComentario;
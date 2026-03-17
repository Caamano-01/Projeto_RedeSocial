import './firebase-config.js'; // CRITICAL: Inicializa o Firebase primeiro
import { getDatabase, ref, get, onValue, query, orderByChild, equalTo, update, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { renderizarPost } from './postRender.js';
import { atualizarSidebarUsuario } from './auth.js';

const urlParams = new URLSearchParams(window.location.search);
const perfilId = urlParams.get('uid');

const auth = getAuth(); // Agora o app já foi inicializado

onAuthStateChanged(auth, async (user) => {
    if (user) {
        await atualizarSidebarUsuario();
        if (perfilId) {
            carregarDadosPerfil(user);
            carregarPostsUsuario(user);
            verificarSeguindo(user.uid);
        }
    } else {
        window.location.href = "index.html";
    }
});

async function carregarDadosPerfil(userLogado) {
    const db = getDatabase();
    const snap = await get(ref(db, `usuarios/${perfilId}`));
    
    if (snap.exists()) {
        const dados = snap.val();
        document.getElementById("perfil-nome").textContent = dados.nome;
        document.getElementById("perfil-avatar").src = dados.fotoPerfil || "../assets/img/default-avatar.png";
        document.getElementById("perfil-turma").textContent = "Turma: " + (dados.turma || "Não informada");
        document.getElementById("perfil-descricao").textContent = dados.descricao || "Sem descrição.";
        
        const btnSeguir = document.getElementById("btn-seguir-acao");
        const btnEditar = document.getElementById("btn-editar-perfil");

        // LÓGICA DE VERIFICAÇÃO DE DONO DO PERFIL
        if (userLogado.uid === perfilId) {
            // É o meu perfil
            if (btnSeguir) btnSeguir.style.display = "none";
            if (btnEditar) {
                btnEditar.style.display = "block";
                btnEditar.onclick = () => {
                    window.location.href = ""; 
                };
            }
        } else {
            // É o perfil de outra pessoa
            if (btnSeguir) btnSeguir.style.display = "block";
            if (btnEditar) btnEditar.style.display = "none";
            verificarSeguindo(userLogado.uid); // Só checa o follow se não for meu perfil
        }
    }
}

async function carregarPostsUsuario(userLogado) {
    const db = getDatabase();
    const postsRef = query(ref(db, "posts"), orderByChild("uid"), equalTo(perfilId));
    onValue(postsRef, async (snap) => {
        const container = document.getElementById("posts-usuario");
        if (!container) return;
        container.innerHTML = "";
        const dados = snap.val();
        if (!dados) return;

        const posts = Object.entries(dados).sort((a, b) => b[1].timestamp - a[1].timestamp);
        for (const [id, p] of posts) {
            container.appendChild(await renderizarPost(id, p, userLogado));
        }
    });
}

function verificarSeguindo(meuUid) {
    const db = getDatabase();
    const btn = document.getElementById("btn-seguir-acao");
    if (!btn) return;

    onValue(ref(db, `seguindo/${meuUid}/${perfilId}`), (snap) => {
        if (snap.exists()) {
            btn.textContent = "Seguindo";
            btn.classList.add("seguindo");
        } else {
            btn.textContent = "Seguir";
            btn.classList.remove("seguindo");
        }
    });
}
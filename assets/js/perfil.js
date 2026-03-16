import { getDatabase, ref, get, onValue, query, orderByChild, equalTo, set, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { renderizarPost } from './postRender.js';
import { atualizarSidebarUsuario } from './auth.js';

const db = getDatabase();
const auth = getAuth();
const urlParams = new URLSearchParams(window.location.search);
const perfilId = urlParams.get('uid');

onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Atualiza a sidebar com os dados de QUEM está logado
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
    const snap = await get(ref(db, `usuarios/${perfilId}`));
    if (snap.exists()) {
        const dados = snap.val();
        document.getElementById("perfil-nome").textContent = dados.nome;
        document.getElementById("perfil-avatar").src = dados.fotoPerfil || "../assets/img/default-avatar.png";
        document.getElementById("perfil-turma").textContent = "Turma: " + (dados.turma || "Não informada");
        document.getElementById("perfil-descricao").textContent = dados.descricao || "Sem descrição.";

        if (userLogado.uid === perfilId) {
            document.getElementById("btn-seguir-acao").style.display = "none";
        }
    }
}

async function carregarPostsUsuario(userLogado) {
    const postsRef = query(ref(db, "posts"), orderByChild("uid"), equalTo(perfilId));
    onValue(postsRef, async (snap) => {
        const container = document.getElementById("posts-usuario");
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
    const btn = document.getElementById("btn-seguir-acao");
    const seguindoRef = ref(db, `seguindo/${meuUid}/${perfilId}`);
    
    onValue(seguindoRef, (snap) => {
        if (snap.exists()) {
            btn.textContent = "Seguindo";
            btn.classList.add("seguindo");
            btn.onclick = () => remove(seguindoRef);
        } else {
            btn.textContent = "Seguir";
            btn.classList.remove("seguindo");
            btn.onclick = () => set(seguindoRef, true);
        }
    });
}
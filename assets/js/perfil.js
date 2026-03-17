import './firebase-config.js'; // Inicializa o Firebase
import { getDatabase, ref, get, onValue, query, orderByChild, equalTo, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { renderizarPost } from './postRender.js';
import { atualizarSidebarUsuario } from './auth.js';

const urlParams = new URLSearchParams(window.location.search);
const perfilId = urlParams.get('uid');
const auth = getAuth();
const db = getDatabase();

onAuthStateChanged(auth, async (user) => {
    if (user) {
        await atualizarSidebarUsuario();
        // Se não houver UID na URL, assume que o utilizador quer ver o seu próprio perfil
        const idParaCarregar = perfilId || user.uid;
        
        carregarDadosPerfil(idParaCarregar, user);
        carregarPostsUsuario(idParaCarregar, user);
    } else {
        window.location.href = "index.html";
    }
});

/**
 * Carrega as informações do perfil (Nome, Foto, Turma, Bio)
 */
async function carregarDadosPerfil(uidPerfil, userLogado) {
    const snap = await get(ref(db, `usuarios/${uidPerfil}`));
    
    if (snap.exists()) {
        const dados = snap.val();
        
        // Preencher elementos da interface
        document.getElementById("perfil-nome").textContent = dados.nome || "Utilizador";
        document.getElementById("perfil-avatar").src = dados.fotoPerfil || "../assets/img/default-avatar.png";
        document.getElementById("perfil-turma").textContent = dados.turma ? `Turma: ${dados.turma}` : "Turma não informada";
        document.getElementById("perfil-descricao").textContent = dados.descricao || "Sem descrição.";
        
        const btnSeguir = document.getElementById("btn-seguir-acao");
        const btnEditar = document.getElementById("btn-editar-perfil");

        // Lógica: Se o perfil visualizado for do próprio utilizador logado
        if (userLogado.uid === uidPerfil) {
            if (btnSeguir) btnSeguir.style.display = "none";
            if (btnEditar) {
                btnEditar.style.display = "block";
                btnEditar.onclick = () => abrirModalEdicao(dados, userLogado.uid);
            }
        } else {
            // Perfil de outra pessoa
            if (btnSeguir) btnSeguir.style.display = "block";
            if (btnEditar) btnEditar.style.display = "none";
            verificarSeguindo(userLogado.uid, uidPerfil);
        }
    }
}

/**
 * Configura e abre o Modal de Edição
 */
function abrirModalEdicao(dadosAtuais, meuUid) {
    const modal = document.getElementById("modal-editar");
    if (!modal) return;

    modal.style.display = "block";

    // Preenche os inputs do modal com os dados atuais do Firebase
    document.getElementById("edit-nome").value = dadosAtuais.nome || "";
    document.getElementById("edit-turma").value = dadosAtuais.turma || "";
    document.getElementById("edit-descricao").value = dadosAtuais.descricao || "";
    document.getElementById("edit-preview-avatar").src = dadosAtuais.fotoPerfil || "../assets/img/default-avatar.png";

    // Fechar o modal ao clicar no X
    const btnFechar = document.querySelector(".close-modal");
    if (btnFechar) {
        btnFechar.onclick = () => modal.style.display = "none";
    }

    // Salvar as alterações no Firebase
    const btnSalvar = document.getElementById("btn-salvar-perfil");
    btnSalvar.onclick = async () => {
        const novoNome = document.getElementById("edit-nome").value;
        const novaTurma = document.getElementById("edit-turma").value;
        const novaDesc = document.getElementById("edit-descricao").value;

        try {
            await update(ref(db, `usuarios/${meuUid}`), {
                nome: novoNome,
                turma: novaTurma,
                descricao: novaDesc
            });

            alert("Perfil atualizado com sucesso!");
            modal.style.display = "none";
            window.location.reload();
        } catch (error) {
            console.error("Erro ao atualizar perfil:", error);
            alert("Erro ao salvar alterações.");
        }
    };
}

/**
 * Carrega apenas os posts feitos pelo dono do perfil
 */
async function carregarPostsUsuario(uidPerfil, userLogado) {
    const postsRef = query(ref(db, "posts"), orderByChild("uid"), equalTo(uidPerfil));
    
    onValue(postsRef, async (snap) => {
        const container = document.getElementById("posts-usuario");
        if (!container) return;
        
        container.innerHTML = ""; // Limpa antes de carregar
        const dados = snap.val();
        if (!dados) {
            container.innerHTML = "<p style='padding:20px;'>Este utilizador ainda não fez publicações.</p>";
            return;
        }

        // Converte para array e ordena por data (mais recente primeiro)
        const posts = Object.entries(dados).sort((a, b) => b[1].timestamp - a[1].timestamp);
        
        for (const [id, p] of posts) {
            container.appendChild(await renderizarPost(id, p, userLogado));
        }
    });
}

/**
 * Verifica se o utilizador logado segue este perfil
 */
function verificarSeguindo(meuUid, perfilAlvoId) {
    const btn = document.getElementById("btn-seguir-acao");
    if (!btn) return;

    onValue(ref(db, `seguindo/${meuUid}/${perfilAlvoId}`), (snap) => {
        if (snap.exists()) {
            btn.textContent = "Seguindo";
            btn.classList.add("seguindo");
        } else {
            btn.textContent = "Seguir";
            btn.classList.remove("seguindo");
        }
    });
}

// Fechar modal se o utilizador clicar fora da caixa branca
window.onclick = (event) => {
    const modal = document.getElementById("modal-editar");
    if (event.target == modal) {
        modal.style.display = "none";
    }
};
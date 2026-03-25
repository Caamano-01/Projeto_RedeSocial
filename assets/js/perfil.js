import './firebase-config.js'; // Inicializa o Firebase
import { getDatabase, ref, get, onValue, query, orderByChild, equalTo, update, remove, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { renderizarPost } from './postRender.js';
import { atualizarSidebarUsuario } from './auth.js';

const urlParams = new URLSearchParams(window.location.search);
const perfilId = urlParams.get('uid');
const auth = getAuth();
const db = getDatabase();

onAuthStateChanged(auth, async (user) => {
    if (user) {
        // BLOQUEIO DE EMAIL NÃO INSTITUCIONAL
        if (!user.email.endsWith("@aluno.senai.br")) {
            alert("Acesso negado! Use apenas seu e-mail @aluno.senai.br");
            await signOut(auth);
            window.location.href = "index.html";
            return;
        }

        const idParaCarregar = perfilId || user.uid;
        
        carregarDadosPerfil(idParaCarregar, user);
        carregarPostsUsuario(idParaCarregar, user);
        monitorarContadores(idParaCarregar); 
        
        // configuração do botão Seguir
        const btnSeguir = document.getElementById("btn-seguir-acao");
        if (btnSeguir && perfilId && perfilId !== user.uid) {
            verificarSeguindo(user.uid, perfilId);
            
            btnSeguir.onclick = async () => {
                const meuUid = user.uid;
                const alvoUid = perfilId;
                const caminhoSeguindo = ref(db, `seguindo/${meuUid}/${alvoUid}`);
                const caminhoSeguidores = ref(db, `seguidores/${alvoUid}/${meuUid}`);

                const snap = await get(caminhoSeguindo);
                if (snap.exists()) {
                    await remove(caminhoSeguindo);
                    await remove(caminhoSeguidores);
                } else {
                    await set(caminhoSeguindo, true);
                    await set(caminhoSeguidores, true);
                }
            };
        }
    } else {
        window.location.href = "index.html";
    }
});

// carrega informações básicas do perfil
async function carregarDadosPerfil(id, userLogado) {
    const userRef = ref(db, `usuarios/${id}`);
    const snap = await get(userRef);

    const btnSeguir = document.getElementById("btn-seguir-acao");
    const btnEditar = document.getElementById("btn-editar-perfil");

    if (snap.exists()) {
        const dados = snap.val();

        document.getElementById("perfil-nome").textContent = dados.nome || "Usuário";
        document.getElementById("perfil-turma").textContent = dados.turma || "Sem turma";
        document.getElementById("perfil-descricao").textContent = dados.descricao || "Sem bio definida.";
        document.getElementById("perfil-avatar").src = dados.fotoPerfil || "../assets/img/default-avatar.png";

        if (id === userLogado.uid) {
            // Meu perfil
            if (btnEditar) btnEditar.style.display = "block";
            if (btnSeguir) btnSeguir.style.display = "none";
        } else {
            // Perfil de outro usuário
            if (btnEditar) btnEditar.style.display = "none";
            if (btnSeguir) btnSeguir.style.display = "inline-block";
        }
    }
}

// monitora seguidores e seguindo em tempo real
function monitorarContadores(id) {
    const seguindoRef = ref(db, `seguindo/${id}`);
    const seguidoresRef = ref(db, `seguidores/${id}`);

    onValue(seguindoRef, (snap) => {
        const count = snap.exists() ? Object.keys(snap.val()).length : 0;
        const el = document.getElementById("count-seguindo") || document.getElementById("num-seguindo");
        if (el) el.textContent = count;
    });

    onValue(seguidoresRef, (snap) => {
        const count = snap.exists() ? Object.keys(snap.val()).length : 0;
        const el = document.getElementById("count-seguidores") || document.getElementById("num-seguidores");
        if (el) el.textContent = count;
    });
}

// carrega apenas os posts do usuário dono do perfil
async function carregarPostsUsuario(id, userLogado) {
    const postsRef = query(ref(db, "posts"), orderByChild("uid"), equalTo(id));
    
    onValue(postsRef, async (snap) => {
        const container = document.getElementById("posts-usuario");
        if (!container) return;
        
        container.innerHTML = "<h3 class='titulo-posts'>Posts</h3>";
        const dados = snap.val();
        
        if (!dados) {
            container.innerHTML = "<p style='padding:20px;'>Este utilizador ainda não fez publicações.</p>";
            return;
        }

        const posts = Object.entries(dados).sort((a, b) => b[1].timestamp - a[1].timestamp);
        
        for (const [postId, p] of posts) {
            container.appendChild(await renderizarPost(postId, p, userLogado));
        }
    });
}

// Verifica se o utilizador logado segue este perfil para mudar o estilo do botão
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

const btnSalvar = document.getElementById("btn-salvar-perfil");

if (btnSalvar) {
    btnSalvar.addEventListener("click", async () => {
        const user = auth.currentUser;
        if (!user) return;

        const novoNome = document.getElementById("edit-nome").value.trim();
        const novaTurma = document.getElementById("edit-turma").value.trim();
        const novaBio = document.getElementById("edit-descricao").value.trim();
        const inputFoto = document.getElementById("input-foto");
        
        btnSalvar.disabled = true;
        btnSalvar.innerText = "Salvando...";

        try {
            let fotoUrl = usuarioDados.fotoPerfil; // Mantém a atual por padrão

            // Se houver nova foto, faz upload para o Cloudinary
            if (inputFoto.files[0]) {
                const formData = new FormData();
                formData.append("file", inputFoto.files[0]);
                formData.append("upload_preset", "rede_senax");
                
                const res = await fetch("https://api.cloudinary.com/v1_1/dywza3kuv/image/upload", {
                    method: "POST",
                    body: formData
                });
                const data = await res.json();
                fotoUrl = data.secure_url;
            }

            // Atualiza no Firebase Realtime Database
            await update(ref(db, 'usuarios/' + user.uid), {
                nome: novoNome,
                nome_lower: novoNome.toLowerCase(),
                turma: novaTurma,
                descricao: novaBio,
                fotoPerfil: fotoUrl
            });

            alert("Perfil atualizado com sucesso!");
            location.reload(); // Recarrega para aplicar as mudanças
        } catch (error) {
            console.error(error);
            alert("Erro ao atualizar perfil.");
        } finally {
            btnSalvar.disabled = false;
            btnSalvar.innerText = "Salvar Alterações";
        }
    });
}
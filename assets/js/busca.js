// inicializar Firebase
import './firebase-config.js';
import { getDatabase, ref, get, query, orderByChild, startAt, endAt } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const db = getDatabase();

// ELEMENTOS
const inputBusca = document.getElementById('input-busca');
const resultadosDiv = document.getElementById('resultados-busca');
const btnAbrir = document.getElementById('btn-abrir-busca');
const btnFechar = document.getElementById('btn-fechar-busca');
const overlay = document.querySelector('.search-overlay');

// DEBOUNCE
let timeout = null;

if (inputBusca) {
    inputBusca.addEventListener('input', (e) => {
        clearTimeout(timeout);

        timeout = setTimeout(() => {
            buscarUsuarios(e.target.value);
        }, 300);
    });
}

// BUSCAR USUÁRIOS
async function buscarUsuarios(valor) {
    const termo = valor.trim().toLowerCase();

    if (termo.length < 2) {
        resultadosDiv.style.display = 'none';
        resultadosDiv.innerHTML = '';
        return;
    }

    try {
        const usuariosQuery = query(
            ref(db, 'usuarios'),
            orderByChild('nome_lower'),
            startAt(termo),
            endAt(termo + "\uf8ff")
        );

        const snap = await get(usuariosQuery);
        const usuarios = snap.val();

        resultadosDiv.innerHTML = '';

        if (!usuarios) {
            resultadosDiv.innerHTML = `
                <div class="item-busca vazio">
                    Nenhum usuário encontrado
                </div>
            `;
            resultadosDiv.style.display = 'block';
            return;
        }

        Object.entries(usuarios).forEach(([id, u]) => {
            const item = document.createElement('div');
            item.className = 'item-busca';

            item.innerHTML = `
                <img src="${u.fotoPerfil || '../assets/img/default-avatar.png'}">
                <span>${u.nome}</span>
            `;

            item.onclick = () => {
                window.location.href = `./perfil.html?uid=${id}`;
            };

            resultadosDiv.appendChild(item);
        });

        resultadosDiv.style.display = 'block';

    } catch (erro) {
        console.error("Erro na busca:", erro);
    }
}

// ABRIR BUSCA
btnAbrir?.addEventListener('click', () => {
    overlay.classList.add('ativo');
    inputBusca.classList.add('ativo');
    inputBusca.focus();
    document.body.style.overflow = 'hidden';
});
// FECHAR BUSCA
btnFechar?.addEventListener('click', fecharBusca);

// clicar fora fecha
overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) {
        fecharBusca();
    }
});

// ESC fecha
document.addEventListener('keydown', (e) => {
    if (e.key === "Escape") {
        fecharBusca();
    }
});

function fecharBusca() {
    overlay.classList.remove('ativo');
    inputBusca.classList.remove('ativo');
    resultadosDiv.style.display = 'none';
    resultadosDiv.innerHTML = '';
    inputBusca.value = '';
    document.body.style.overflow = 'auto';
}
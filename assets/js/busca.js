import { 
    getDatabase, ref, get, query, orderByChild, startAt, endAt 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const db = getDatabase();
const inputBusca = document.getElementById('input-busca');
const resultadosDiv = document.getElementById('resultados-busca');

// debounce
let timeout = null;

if (inputBusca) {
    inputBusca.addEventListener('input', (e) => {
        clearTimeout(timeout);

        timeout = setTimeout(() => {
            buscarUsuarios(e.target.value);
        }, 300);
    });
}

async function buscarUsuarios(valor) {
    const termo = valor.trim().toLowerCase();

    if (termo.length < 2) {
        resultadosDiv.style.display = 'none';
        return;
    }

    try {
        const usuariosQuery = query(
            ref(db, 'usuarios'),
            orderByChild('nome'),
            startAt(termo),
            endAt(termo + "\uf8ff")
        );

        const snap = await get(usuariosQuery);
        const usuarios = snap.val();

        resultadosDiv.innerHTML = '';

        //  tratamento de null
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

const btnAbrirBusca = document.getElementById('btn-abrir-busca');

if (btnAbrirBusca && inputBusca) {
    btnAbrirBusca.addEventListener('click', () => {
        inputBusca.classList.toggle('ativo');
        
        if (inputBusca.classList.contains('ativo')) {
            inputBusca.focus();
        } else {
            resultadosDiv.style.display = 'none';
        }
    });
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
        resultadosDiv.style.display = 'none';
        if (window.innerWidth <= 480) {
            inputBusca.classList.remove('ativo');
        }
    }
});

// mobile
document.getElementById('btn-abrir-busca')?.addEventListener('click', () => {
    if (window.innerWidth <= 1024) {
        inputBusca.style.display = 'block';
        inputBusca.focus();
    }
});
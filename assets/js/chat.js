// inicializar Firebase
import './firebase-config.js';

import {
    getDatabase, ref, push, onValue, off, update,
    set, remove, serverTimestamp, query, orderByChild, limitToLast
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

import { initAuth, usuarioAtual } from './auth.js';
import { escaparHTML } from './utils.js';

const db = getDatabase();

let conversaAtivaId = null;
let destinatarioAtual = null;
let msgRefAtual = null;
let limiteMensagens = 20;

// iniciar auth
initAuth();

// aguardar login
const checkAuth = setInterval(() => {
    if (usuarioAtual) {
        carregarConversas();
        clearInterval(checkAuth);
    }
}, 500);

// LISTAR QUEM SEGUE
function carregarConversas() {
    const lista = document.getElementById('lista-contatos');
    lista.innerHTML = "<p>Carregando...</p>";

    const seguindoRef = ref(db, `seguindo/${usuarioAtual.uid}`);
    const convRef = ref(db, 'conversas');

    onValue(seguindoRef, (snapSeguindo) => {

        if (!snapSeguindo.exists()) {
            lista.innerHTML = "<p>Você não segue ninguém</p>";
            return;
        }

        onValue(convRef, (snapConversas) => {

            lista.innerHTML = "";

            const seguindo = snapSeguindo.val();
            const conversas = snapConversas.val() || {};

            Object.keys(seguindo).forEach(uidSeguido => {

                let conversaId = null;
                let ultimaMensagem = "";

                // procurar conversa existente
                Object.keys(conversas).forEach(id => {
                    const c = conversas[id];

                    if (
                        c.participantes &&
                        c.participantes[usuarioAtual.uid] &&
                        c.participantes[uidSeguido]
                    ) {
                        conversaId = id;
                        ultimaMensagem = c.ultimaMensagem || "";
                    }
                });

                // se não existir, cria
                if (!conversaId) {
                    const novaConv = push(ref(db, 'conversas'));

                    conversaId = novaConv.key;

                    set(novaConv, {
                        participantes: {
                            [usuarioAtual.uid]: true,
                            [uidSeguido]: true
                        },
                        timestamp: Date.now(),
                        ultimaMensagem: ""
                    });
                }

                carregarUsuario(uidSeguido, {
                    id: conversaId,
                    ultimaMensagem
                });
            });

        }, { onlyOnce: true });

    });
}

// CARREGAR USUÁRIO NA LISTA
function carregarUsuario(uid, conv) {
    const userRef = ref(db, `usuarios/${uid}`);

    onValue(userRef, (snap) => {
        const user = snap.val();
        if (!user) return;

        const lista = document.getElementById('lista-contatos');

        // evita duplicação
        if (document.getElementById(`contato-${uid}`)) return;

        const item = document.createElement('div');
        item.className = 'contato-item';
        item.id = `contato-${uid}`;

        item.innerHTML = `
            <img src="${user.fotoPerfil || '../assets/img/default-avatar.png'}">
            <div>
                <strong>${user.nome}</strong>
                <p class="preview-msg">${escaparHTML(conv.ultimaMensagem || '')}</p>
            </div>
        `;

        item.onclick = () => abrirConversa(user, conv.id, item);

        lista.appendChild(item);
    });
}

// ABRIR CONVERSA
function abrirConversa(user, conversaId, element) {
    document.getElementById('chat-vazio').style.display = 'none';

    const chatAtivo = document.getElementById('chat-ativo');
    const chatArea = document.querySelector('.chat-area');

    chatAtivo.style.display = 'block';
    chatArea.classList.add('active');

    // MOBILE
    if (window.innerWidth <= 480) {
        document.querySelector('.chat-list').style.display = 'none';
    }

    document.getElementById('chat-target-name').textContent = user.nome;
    document.getElementById('chat-target-avatar').src =
        user.fotoPerfil || '../assets/img/default-avatar.png';

    document.querySelectorAll('.contato-item')
        .forEach(el => el.classList.remove('active'));

    element.classList.add('active');

    conversaAtivaId = conversaId;
    destinatarioAtual = user;
    limiteMensagens = 20;

    escutarMensagens();
    escutarDigitando();

    document.getElementById('msg-input').focus();
}

// MENSAGENS
function escutarMensagens() {
    if (msgRefAtual) off(msgRefAtual);

    const mensagensRef = query(
        ref(db, `mensagens/${conversaAtivaId}`),
        orderByChild('timestamp'),
        limitToLast(limiteMensagens)
    );

    msgRefAtual = mensagensRef;

    const area = document.getElementById('chat-messages');
    area.innerHTML = "<p>Carregando...</p>";

    onValue(mensagensRef, (snapshot) => {
        area.innerHTML = "";

        snapshot.forEach(child => {
            const m = child.val();

            // marcar como lido
            if (m.senderId !== usuarioAtual.uid && !m.lido) {
                update(ref(db, `mensagens/${conversaAtivaId}/${child.key}`), {
                    lido: true
                });
            }

            const div = document.createElement('div');
            div.className = `message ${m.senderId === usuarioAtual.uid ? 'sent' : 'received'}`;

            div.innerHTML = `
                <p>${escaparHTML(m.texto)}</p>
                ${m.senderId === usuarioAtual.uid
                    ? `<span class="status">${m.lido ? '✔✔' : '✔'}</span>`
                    : ''}
            `;

            area.appendChild(div);
        });

        area.scrollTop = area.scrollHeight;
    });

    // scroll infinito
    area.addEventListener('scroll', () => {
        if (area.scrollTop === 0) {
            limiteMensagens += 20;
            escutarMensagens();
        }
    });
}

// ENVIAR MENSAGEM
async function enviarMensagem() {
    const input = document.getElementById('msg-input');
    const texto = input.value.trim();

    if (!texto || !conversaAtivaId) return;

    const msgData = {
        senderId: usuarioAtual.uid,
        texto,
        timestamp: serverTimestamp(),
        lido: false
    };

    input.value = "";

    await push(ref(db, `mensagens/${conversaAtivaId}`), msgData);

    await update(ref(db, `conversas/${conversaAtivaId}`), {
        ultimaMensagem: texto,
        timestamp: Date.now()
    });

    remove(ref(db, `digitando/${conversaAtivaId}/${usuarioAtual.uid}`));
}

// DIGITANDO...
function escutarDigitando() {
    const refDigitando = ref(db, `digitando/${conversaAtivaId}`);

    onValue(refDigitando, (snapshot) => {
        let ativo = false;

        snapshot.forEach(child => {
            if (child.key !== usuarioAtual.uid) ativo = true;
        });

        const el = document.getElementById('digitando-indicator');
        el.textContent = ativo ? "Digitando..." : "";
    });
}

// DETECTAR DIGITAÇÃO
const inputMsg = document.getElementById('msg-input');

inputMsg?.addEventListener('input', () => {
    if (!conversaAtivaId) return;

    const typingRef = ref(db, `digitando/${conversaAtivaId}/${usuarioAtual.uid}`);

    set(typingRef, true);

    clearTimeout(window.typingTimeout);
    window.typingTimeout = setTimeout(() => {
        remove(typingRef);
    }, 1000);
});

// BOTÃO VOLTAR (MOBILE)
const btnVoltar = document.getElementById('btn-voltar');

function atualizarBotaoVoltar() {
    if (!btnVoltar) return;

    if (window.innerWidth <= 480) {
        btnVoltar.style.display = 'block';
    } else {
        btnVoltar.style.display = 'none';
    }
}

window.addEventListener('resize', atualizarBotaoVoltar);
atualizarBotaoVoltar();

btnVoltar?.addEventListener('click', () => {
    document.querySelector('.chat-list').style.display = 'block';
    document.querySelector('.chat-area').classList.remove('active');
});

// EVENTOS
document.getElementById('btn-enviar-msg')
    ?.addEventListener('click', enviarMensagem);

inputMsg?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        enviarMensagem();
    }
});
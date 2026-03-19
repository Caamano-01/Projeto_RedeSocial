// inicializar Firebase
import './firebase-config.js';

import {getDatabase, ref, push, onValue, off, update, set, remove, serverTimestamp, query, orderByChild, limitToLast } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
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


// LISTA DE CONVERSAS
function carregarConversas() {
    const convRef = query(ref(db, 'conversas'), orderByChild('timestamp'));

    onValue(convRef, (snapshot) => {
        const lista = document.getElementById('lista-contatos');
        lista.innerHTML = "";

        const conversas = [];

        snapshot.forEach(child => {
            const c = child.val();
            const id = child.key;

            if (c.participantes && c.participantes[usuarioAtual.uid]) {
                conversas.push({ id, ...c });
            }
        });

        conversas.reverse();

        conversas.forEach(conv => {
            const outroUid = Object.keys(conv.participantes)
                .find(uid => uid !== usuarioAtual.uid);

            carregarUsuario(outroUid, conv);
        });
    });
}

// buscar dados do usuário
function carregarUsuario(uid, conv) {
    const userRef = ref(db, `usuarios/${uid}`);

    onValue(userRef, (snap) => {
        const user = snap.val();
        if (!user) return;

        const lista = document.getElementById('lista-contatos');

        const item = document.createElement('div');
        item.className = 'contato-item';

        item.innerHTML = `
            <img src="${user.fotoPerfil || '../assets/img/default-avatar.png'}" class="user-avatar-mini">
            <div>
                <strong>${user.nome}</strong>
                <p class="preview-msg">${escaparHTML(conv.ultimaMensagem || '')}</p>
            </div>
        `;

        item.onclick = (e) => abrirConversa(user, conv.id, item);

        lista.appendChild(item);
    });
}


// ABRIR CONVERSA
function abrirConversa(user, conversaId, element) {
    document.getElementById('chat-vazio').style.display = 'none';
    document.getElementById('chat-ativo').style.display = 'block';

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


// MENSAGENS (COM PAGINAÇÃO)
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

    // scroll para carregar mais
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
        timestamp: Date.now(),
        participantes: {
            [usuarioAtual.uid]: true,
            [destinatarioAtual.uid]: true
        }
    });

    // parar "digitando"
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

        let el = document.getElementById('digitando-indicator');

        if (!el) {
            el = document.createElement('div');
            el.id = 'digitando-indicator';
            document.querySelector('.chat-window-header').appendChild(el);
        }

        el.textContent = ativo ? "Digitando..." : "";
    });
}


// detectar digitação
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


// EVENTOS
document.getElementById('btn-enviar-msg')
    ?.addEventListener('click', enviarMensagem);

inputMsg?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        enviarMensagem();
    }
});
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { usuarioAtual } from './auth.js';

export let listaSeguindo = {};

export function carregarSeguindo() {
  const db = getDatabase();
  onValue(ref(db, "seguindo/" + usuarioAtual.uid), (snap) => {
    listaSeguindo = snap.val() || {};
  });
}
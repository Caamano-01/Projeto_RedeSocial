import { getDatabase, ref, onChildAdded, onChildRemoved } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { usuarioAtual } from './auth.js';

export let listaSeguindo = {};

export function carregarSeguindo() {
  if (!usuarioAtual) return;
  const db = getDatabase();
  const dbRef = ref(db, "seguindo/" + usuarioAtual.uid);

  listaSeguindo = {};

  onChildAdded(dbRef, (snap) => listaSeguindo[snap.key] = true);
  onChildRemoved(dbRef, (snap) => delete listaSeguindo[snap.key]);
}
import { getDatabase, ref, runTransaction } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

export async function curtir(id, usuario) {
  const db = getDatabase();
  const likeRef = ref(db, "likes/" + id + "/" + usuario.uid);

  await runTransaction(likeRef, (current) => current ? null : true);
}

window.curtir = curtir;
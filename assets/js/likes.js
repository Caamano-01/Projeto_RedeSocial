import { getDatabase, ref, get, set, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Curtir ou descurtir um post
export async function curtir(id, usuario) {
  const db = getDatabase();
  const likeRef = ref(db, "likes/" + id + "/" + usuario.uid);
  const snap = await get(likeRef);

  if (snap.exists()) {
    await remove(likeRef);
  } else {
    await set(likeRef, true);
  }
}

window.curtir = curtir;
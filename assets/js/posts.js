import { getDatabase, ref, get, push } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { ref as sRef, uploadBytes, getDownloadURL, getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
import { usuarioAtual, usuarioDados, getAvatarUsuario } from './auth.js';

const fileInput = document.getElementById("file-input");
const postSection = document.querySelector(".create-post");
const postText = document.getElementById("postText");

// Preview de imagem
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  let preview = document.getElementById("img-preview");
  if (preview) preview.remove();

  if (file) {
    preview = document.createElement("img");
    preview.id = "img-preview";
    preview.src = URL.createObjectURL(file);
    preview.style.maxWidth = "200px";
    preview.style.marginTop = "10px";
    postSection.appendChild(preview);
  }
});

export async function criarPostNovo() {
  if (!usuarioAtual || !usuarioDados) return;

  const db = getDatabase();
  const storage = getStorage();
  const texto = postText.value.trim();
  const file = fileInput.files[0];
  if (!texto && !file) return;

  let imagem = null;

  // Upload da imagem, se houver
  if (file) {
    const imgRef = sRef(storage, "posts/" + Date.now() + "_" + file.name);
    await uploadBytes(imgRef, file);
    imagem = await getDownloadURL(imgRef);
  }

  const post = {
    uid: usuarioAtual.uid,
    nome: usuarioDados.nome,
    avatar: getAvatarUsuario(),
    texto,
    imagem,
    timestamp: Date.now()
  };

  await push(ref(db, "posts"), post);

  // Limpar inputs
  postText.value = "";
  fileInput.value = "";
  const preview = document.getElementById("img-preview");
  if (preview) preview.remove();
}

// Botão de postar
const btnPostar = document.querySelector(".btn-post-submit");
if (btnPostar) {
  btnPostar.addEventListener("click", criarPostNovo);
}
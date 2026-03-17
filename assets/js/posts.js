import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { usuarioAtual, usuarioDados, getAvatarUsuario } from './auth.js';

const fileInput = document.getElementById("file-input");
const postSection = document.querySelector(".create-post");
const postText = document.getElementById("postText");

// Preview de imagem - Protegido com verificação de existência
if (fileInput) {
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
      postSection?.appendChild(preview);
    }
  });
}

export async function criarPostNovo() {
  if (!usuarioAtual || !usuarioDados || !postText) return;

  const db = getDatabase();
  const texto = postText.value.trim();
  const file = fileInput?.files[0];
  
  if (!texto && !file) return;

  let imagem = null;

  // Upload para Cloudinary
  if (file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "rede_senax");

    try {
        const res = await fetch("https://api.cloudinary.com/v1_1/dywza3kuv/image/upload", {
          method: "POST",
          body: formData
        });
        const data = await res.json();
        imagem = data.secure_url;
    } catch (err) {
        console.error("Erro no upload da imagem:", err);
    }
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
  
  // Limpar campos
  postText.value = "";
  if (fileInput) fileInput.value = "";
  document.getElementById("img-preview")?.remove();
}
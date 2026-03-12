// Funções auxiliares
export function escaparHTML(texto) {
  return texto.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function tempo(t) {
  const m = Math.floor((Date.now() - t) / 60000);
  if (m < 1) return "agora";
  if (m < 60) return m + "m";

  const h = Math.floor(m / 60);
  if (h < 24) return h + "h";

  const d = Math.floor(h / 24);
  return d + "d";
}
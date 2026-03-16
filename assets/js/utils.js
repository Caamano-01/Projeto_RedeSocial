export function escaparHTML(texto) {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function tempo(t) {
  const diff = Date.now() - t;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "agora";
  if (m < 60) return m + "m";

  const h = Math.floor(m / 60);
  if (h < 24) return h + "h";

  const d = Math.floor(h / 24);
  if (d < 7) return d + "d";

  const data = new Date(t);
  return data.toLocaleDateString();
}
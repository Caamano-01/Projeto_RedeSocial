import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyB19gxl7E3NeqKKZ9pNe634wtbkghXNSVM",
  authDomain: "senax-rede.firebaseapp.com",
  databaseURL: "https://senax-rede-default-rtdb.firebaseio.com",
  projectId: "senax-rede",
  storageBucket: "senax-rede.firebasestorage.app",
  messagingSenderId: "714869150902",
  appId: "1:714869150902:web:2ee1f1d634624113a4c217"
};

// Inicializa o Firebase uma única vez
export const app = initializeApp(firebaseConfig);
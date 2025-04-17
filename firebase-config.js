// firebase/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";

const firebaseConfig = {
	apiKey: "AIzaSyBRnkzpWkkC3stynXLrPNjTaQaSFISm8sQ",
	authDomain: "djonly-kansil.firebaseapp.com",
	projectId: "djonly-kansil",
	storageBucket: "djonly-kansil.firebasestorage.app",
	messagingSenderId: "150182611621",
	appId: "1:150182611621:web:14bcc3a9aa6b61b9525b4c"
};

const app = initializeApp(firebaseConfig);
export default app;
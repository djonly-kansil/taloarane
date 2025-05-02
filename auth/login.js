import app from "../firebase-config.js";
import {
	getAuth,
	signInWithEmailAndPassword,
	onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
	getFirestore,
	doc,
	getDoc
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);
const spinner = document.getElementById("loadingSpinner");
const btnText = document.getElementById("btn-text");

// Fungsi bantu: tampilkan spinner, sembunyikan teks
function showSpinner() {
	btnText.classList.add("hidden");
	spinner.classList.remove("hidden");
	spinner.classList.add("visible");
}

// Fungsi bantu: sembunyikan spinner, tampilkan teks
function hideSpinner() {
	btnText.classList.remove("hidden");
	spinner.classList.add("hidden");
	spinner.classList.remove("visible");
}

// ✅ Cek otomatis jika user sudah login
onAuthStateChanged(auth, async (user) => {
	if (user) {
		showSpinner();
		try {
			const userRef = doc(db, "users", user.uid);
			const userSnap = await getDoc(userRef);
			
			if (userSnap.exists()) {
				const role = userSnap.data().role || "viewer";
				
				if (role === "admin") {
					window.location.href = "../admin/admin.html";
				} else if (role === "editor") {
					window.location.href = "../admin/editor.html";
				} else {
					window.location.href = "/index.html";
				}
			} else {
				console.warn("Data pengguna tidak ditemukan.");
				hideSpinner();
			}
		} catch (err) {
			console.error("Gagal ambil data user:", err);
			hideSpinner();
		}
	}
});

// ✅ Proses login saat tombol ditekan
document.getElementById("loginForm").addEventListener("submit", async (e) => {
	e.preventDefault();
	showSpinner();
	
	const email = document.getElementById("email").value.trim();
	const password = document.getElementById("password").value;
	
	try {
		const userCredential = await signInWithEmailAndPassword(auth, email, password);
		const uid = userCredential.user.uid;
		
		const userRef = doc(db, "users", uid);
		const userSnap = await getDoc(userRef);
		
		if (!userSnap.exists()) {
			alert("Data pengguna tidak ditemukan.");
			hideSpinner();
			return;
		}
		
		const role = userSnap.data().role || "viewer";
		
		if (role === "admin") {
			window.location.href = "../admin/admin.html";
		} else if (role === "editor") {
			window.location.href = "../admin/editor.html";
		} else {
			window.location.href = "/index.html";
		}
		
	} catch (error) {
		console.error("Login error:", error.message);
		alert("Login gagal: " + error.message);
		hideSpinner();
	}
});
import app from "../firebase-config.js";
import {
	getAuth,
	onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
	getFirestore,
	doc,
	getDoc,
	setDoc,
	serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);
const form = document.getElementById("uploadForm");
const statusDiv = document.getElementById("uploadStatus");

let currentUser = null;

// Hanya admin/editor yang boleh mengakses
onAuthStateChanged(auth, async (user) => {
	if (user) {
		const userRef = doc(db, "users", user.uid);
		const userSnap = await getDoc(userRef);
		const role = userSnap.data()?.role;
		if (!userSnap.exists() || (role !== "admin" && role !== "editor")) {
			alert("Akses ditolak. Hanya admin/editor saja.");
			window.location.href = "/index.html";
		} else {
			currentUser = user;
		}
	} else {
		alert("Silakan login terlebih dahulu.");
		window.location.href = "../auth/login.html";
	}
});

// Upload dan timpa file lama
form.addEventListener("submit", async (e) => {
	e.preventDefault();
	const file = document.getElementById("fileInput").files[0];
	if (!file || !currentUser) return;
	
	statusDiv.innerHTML = "Mengupload...";
	
	try {
		const idToken = await currentUser.getIdToken();
		
		const sigRes = await fetch("https://imagekit-upload-djonly-kansils-projects.vercel.app/api/get-signature", {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${idToken}`,
				"Content-Type": "application/json"
			}
		});
		
		const sigData = await sigRes.json();
		if (!sigRes.ok) throw new Error(sigData.error || "Gagal mendapatkan signature");
		
		const ext = file.name.split('.').pop(); // ambil ekstensi file
		const finalFileName = `pengumuman.${ext}`;
		
		const formData = new FormData();
		formData.append("file", file);
		formData.append("fileName", finalFileName);
		formData.append("folder", "/pengumuman");
		formData.append("useUniqueFileName", "false");
		formData.append("overwriteFile", "true");
		formData.append("publicKey", sigData.publicKey);
		formData.append("signature", sigData.signature);
		formData.append("expire", sigData.expire);
		formData.append("token", sigData.token);
		
		const uploadRes = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
			method: "POST",
			body: formData
		});
		const result = await uploadRes.json();
		if (!result.url) throw new Error("Upload gagal");
		
		// Simpan ke Firestore
		await setDoc(doc(db, "pengumuman", "pengumuman"), {
			fileName: finalFileName,
			fileType: file.type,
			url: result.url,
			uploadedBy: currentUser.uid,
			uploadedAt: serverTimestamp()
		});
		
		statusDiv.innerHTML = `<div class="alert alert-success">Upload berhasil sebagai ${finalFileName}!</div>`;
	} catch (err) {
		console.error(err);
		statusDiv.innerHTML = `<div class="alert alert-danger">Upload gagal. ${err.message}</div>`;
	}
});

import { signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

document.getElementById("logoutBtn").addEventListener("click", async () => {
	try {
		await signOut(auth);
		alert("Berhasil logout");
		window.location.href = "../auth/login.html";
	} catch (error) {
		console.error("Logout gagal:", error);
		alert("Logout gagal. Coba lagi.");
	}
});
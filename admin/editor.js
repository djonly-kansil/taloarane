// editor.js

import app from "../firebase-config.js";
import {
	getAuth,
	onAuthStateChanged,
	signOut
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
	getFirestore,
	doc,
	getDoc,
	setDoc,
	serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import {
	getImageKitSignature,
	uploadToImageKit
} from "../imagekit.js";

const auth = getAuth(app);
const db = getFirestore(app);
const form = document.getElementById("uploadForm");
const statusDiv = document.getElementById("uploadStatus");

let currentUser = null;

// Akses hanya admin/editor
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

// Upload file
form.addEventListener("submit", async (e) => {
	e.preventDefault();
	const file = document.getElementById("fileInput").files[0];
	if (!file || !currentUser) return;
	
	statusDiv.innerHTML = "Mengupload...";
	
	try {
		const idToken = await currentUser.getIdToken();
		const sigData = await getImageKitSignature({
			"Authorization": `Bearer ${idToken}`
		});
		
		const ext = file.name.split('.').pop();
		const finalFileName = `pengumuman.${ext}`;
		
		const result = await uploadToImageKit(file, sigData, {
			fileName: finalFileName,
			folder: "/pengumuman",
			overwrite: true
		});
		
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

// Logout
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
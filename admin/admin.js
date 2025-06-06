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

import {
	getImageKitSignature,
	uploadToImageKit
} from "../imagekit.js";

const auth = getAuth(app);
const db = getFirestore(app);

// Proteksi hanya admin
onAuthStateChanged(auth, async (user) => {
	if (user) {
		const userRef = doc(db, "users", user.uid);
		const userSnap = await getDoc(userRef);
		if (!userSnap.exists() || userSnap.data().role !== "admin") {
			alert("Akses ditolak. Hanya admin yang boleh mengakses halaman ini.");
			window.location.href = "/index.html";
		}
	} else {
		alert("Silakan login terlebih dahulu.");
		window.location.href = "../auth/login.html";
	}
});

const form = document.getElementById("uploadForm");
const statusDiv = document.getElementById("uploadStatus");

form.addEventListener("submit", async (e) => {
	e.preventDefault();
	statusDiv.innerHTML = "Mengupload...";
	
	const user = auth.currentUser;
	if (!user) {
		alert("Pengguna tidak ditemukan. Silakan login ulang.");
		return;
	}
	
	const idToken = await user.getIdToken();
	const uploadPromises = [];
	
	for (let i = 1; i <= 10; i++) {
		const input = document.getElementById(`slide${i}`);
		const file = input.files[0];
		if (!file) continue;
		
		if (file.size > 5 * 1024 * 1024) {
			statusDiv.innerHTML = `Slide ${i} melebihi batas ukuran 5MB. Upload dibatalkan.`;
			return;
		}
		
		try {
			const signatureData = await getImageKitSignature({
				"Authorization": `Bearer ${idToken}`
			});
			
			const finalFileName = `slide${i}.jpg`;
			
			const result = await uploadToImageKit(file, signatureData, {
				fileName: finalFileName,
				folder: "/slides",
				useUniqueFileName: false,
				overwrite: true
			});
			
			const promise = setDoc(doc(db, "slides", `slide${i}`), {
				fileName: result.name,
				url: result.url,
				uploadedAt: serverTimestamp()
			});
			
			uploadPromises.push(promise);
		} catch (err) {
			console.error(`Gagal upload slide ${i}:`, err);
			statusDiv.innerHTML = `<div class="alert alert-danger">Gagal upload slide ${i}.</div>`;
			return;
		}
	}
	
	try {
		await Promise.all(uploadPromises);
		statusDiv.innerHTML = `<div class="alert alert-success">Upload dan penyimpanan semua slide selesai!</div>`;
	} catch (err) {
		console.error("Upload error:", err);
		statusDiv.innerHTML = `<div class="alert alert-danger">Terjadi kesalahan saat menyimpan data slide.</div>`;
	}
});
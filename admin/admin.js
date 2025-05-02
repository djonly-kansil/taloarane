import app from "../firebase-config.js";
import {
	getAuth,
	onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

import {
	getFirestore,
	doc,
	getDoc,
	setDoc
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

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
	
	const uploadPromises = [];
	
	for (let i = 1; i <= 10; i++) {
		const input = document.getElementById(`slide${i}`);
		const file = input.files[0];
		if (!file) continue;
		
		if (file.size > 2 * 1024 * 1024) {
			statusDiv.innerHTML = `Slide ${i} melebihi batas ukuran 2MB. Upload dibatalkan.`;
			return;
		}
		
		try {
			// Ambil signature + publicKey dari server
			const sigRes = await fetch("https://imagekit-upload-djonly-kansils-projects.vercel.app/api/get-signature");
			const signatureData = await sigRes.json();
			
			const formData = new FormData();
			formData.append("file", file);
			formData.append("fileName", `slide${i}.jpg`);
			formData.append("folder", "/slides");
			formData.append("useUniqueFileName", "false");
			formData.append("overwriteFile", "true");
			formData.append("publicKey", signatureData.publicKey);
			formData.append("signature", signatureData.signature);
			formData.append("expire", signatureData.expire);
			formData.append("token", signatureData.token);
			
			const promise = fetch("https://upload.imagekit.io/api/v1/files/upload", {
					method: "POST",
					body: formData
				})
				.then(res => res.json())
				.then(async result => {
					if (result && result.url) {
						await setDoc(doc(db, "slides", `slide${i}`), {
							fileName: result.name,
							url: result.url,
							uploadedAt: new Date()
						});
					} else {
						console.error("Upload ke ImageKit gagal:", result);
						throw new Error("Gagal upload ke ImageKit");
					}
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
		statusDiv.innerHTML = `<div class="alert alert-success">Upload dan penyimpanan URL selesai!</div>`;
	} catch (err) {
		console.error("Upload error:", err);
		statusDiv.innerHTML = `<div class="alert alert-danger">Terjadi kesalahan saat upload atau simpan URL.</div>`;
	}
});
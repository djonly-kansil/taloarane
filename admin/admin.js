import { supabase } from "../supabase-config.js";
import app from "../firebase-config.js";
import {
	getAuth,
	onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
	getFirestore,
	doc,
	getDoc
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

// Proteksi hanya admin yang boleh akses
onAuthStateChanged(auth, async (user) => {
	if (user) {
		const userRef = doc(db, "users", user.uid);
		const userSnap = await getDoc(userRef);
		
		if (userSnap.exists()) {
			const role = userSnap.data().role;
			if (role !== "admin") {
				alert("Akses ditolak. Hanya admin yang boleh mengakses halaman ini.");
				window.location.href = "/index.html";
			}
		} else {
			alert("Data pengguna tidak ditemukan.");
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
		const fileInput = document.getElementById(`slide${i}`);
		const file = fileInput.files[0];
		
		if (file) {
			if (file.size > 2 * 4000 * 3000) {
				statusDiv.innerHTML = `Slide ${i} melebihi batas ukuran 2MB. Upload dibatalkan.`;
				return;
			}
			
			const fileName = `slide${i}.jpg`;
			
			const uploadPromise = supabase.storage
				.from("taloarane")
				.upload(fileName, file, {
					upsert: true,
					contentType: file.type
				});
			
			uploadPromises.push(uploadPromise);
		}
	}
	
	try {
		const results = await Promise.all(uploadPromises);
		statusDiv.innerHTML = `<div class="alert alert-success">Upload selesai!</div>`;
		console.log(results);
	} catch (err) {
		console.error("Upload error:", err);
		statusDiv.innerHTML = `<div class="alert alert-danger">Terjadi kesalahan saat upload.</div>`;
	}
});
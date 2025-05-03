import app from "../firebase-config.js";
import {
	getAuth,
	onAuthStateChanged,
	signOut,
	reload,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
	getFirestore,
	doc,
	getDoc,
	setDoc,
	deleteDoc,
	serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

const statusEl = document.getElementById("status");

onAuthStateChanged(auth, async (user) => {
	if (!user) {
		statusEl.innerHTML = "Anda belum login. Silakan <a href='login.html'>login</a> terlebih dahulu.";
		return;
	}
	
	await reload(user); // Pastikan status email terbaru
	
	if (!user.emailVerified) {
		statusEl.innerHTML = `
			Email Anda belum terverifikasi.<br>
			Silakan verifikasi email terlebih dahulu, lalu klik tombol di bawah ini untuk cek ulang:
			<br><br>
			<button id="reloadBtn">Saya sudah verifikasi, periksa ulang</button>
		`;
		document.getElementById("reloadBtn").addEventListener("click", () => location.reload());
		return;
	}
	
	try {
		const pendingRef = doc(db, "pendingUsers", user.uid);
		const pendingSnap = await getDoc(pendingRef);
		
		if (!pendingSnap.exists()) {
			statusEl.textContent = "Data pendaftaran tidak ditemukan atau sudah diproses sebelumnya.";
			return;
		}
		
		const userRef = doc(db, "users", user.uid);
		const userSnap = await getDoc(userRef);
		if (userSnap.exists()) {
			statusEl.textContent = "Akun sudah diverifikasi dan data sudah tersimpan sebelumnya.";
			await deleteDoc(pendingRef); // optional cleanup
			return;
		}
		
		const data = pendingSnap.data();
		
		await setDoc(userRef, {
			...data,
			email: user.email,
			verifiedAt: serverTimestamp()
		});
		
		await deleteDoc(pendingRef);
		
		statusEl.textContent = "Verifikasi berhasil! Data Anda telah disimpan.";
	} catch (err) {
		console.error(err);
		statusEl.textContent = "Terjadi kesalahan saat memproses verifikasi.";
	}
});
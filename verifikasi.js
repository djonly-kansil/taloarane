import app from "../firebase-config.js";
import {
	getAuth,
	onAuthStateChanged,
	sendEmailVerification
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

import {
	getFirestore,
	doc,
	setDoc
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);
const statusDiv = document.getElementById("status");

// Fungsi untuk simpan data ke Firestore
async function simpanUser(uid, data) {
	try {
		await setDoc(doc(db, "users", uid), data);
		statusDiv.innerHTML = "<p class='success'>Email telah diverifikasi. Data berhasil disimpan. Anda akan diarahkan ke halaman login.</p>";
		localStorage.removeItem("userPendingData");
		setTimeout(() => {
			window.location.href = "../auth/login.html";
		}, 3000);
	} catch (err) {
		statusDiv.innerHTML = "<p class='error'>Gagal menyimpan data pengguna. Silakan coba lagi.</p>";
		console.error(err);
	}
}

onAuthStateChanged(auth, async (user) => {
	if (user) {
		await user.reload(); // Refresh status verifikasi
		if (user.emailVerified) {
			const dataJson = localStorage.getItem("userPendingData");
			if (!dataJson) {
				statusDiv.innerHTML = "<p class='error'>Data pengguna tidak ditemukan. Harap daftar ulang.</p>";
				return;
			}
			
			const userData = JSON.parse(dataJson);
			await simpanUser(user.uid, {
				...userData,
				email: user.email,
				createdAt: new Date()
			});
			
		} else {
			statusDiv.innerHTML = `
        <p>Email Anda belum diverifikasi.</p>
        <button id="resend">Kirim Ulang Email Verifikasi</button>
      `;
			
			document.getElementById("resend").addEventListener("click", async () => {
				try {
					await sendEmailVerification(user);
					alert("Email verifikasi telah dikirim ulang.");
				} catch (err) {
					alert("Gagal mengirim ulang email verifikasi.");
				}
			});
		}
	} else {
		statusDiv.innerHTML = "<p class='error'>Anda belum login. Silakan login terlebih dahulu.</p>";
	}
});
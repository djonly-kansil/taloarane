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

// Pastikan SweetAlert2 ditambahkan di HTML:
// <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, async (user) => {
	if (!user) {
		Swal.fire({
			icon: 'info',
			title: 'Belum Daftar',
			html: 'Silakan <a href="auth/signup.html">Daftar</a> terlebih dahulu.',
			confirmButtonText: 'OK'
		});
		return;
	}
	
	await reload(user);
	
	// Spinner singkat sebelum periksa status
	await Swal.fire({
		title: 'Memeriksa status...',
		timer: 2000,
		didOpen: () => {
			Swal.showLoading();
		},
		willClose: () => {}
	});
	
	if (!user.emailVerified) {
		Swal.fire({
			icon: 'warning',
			title: 'Email Belum Terverifikasi',
			html: `
				Silakan buka email Anda dan klik link verifikasi.<br>
				Kemudian klik tombol di bawah ini untuk memeriksa ulang.
			`,
			showCancelButton: true,
			confirmButtonText: 'Saya sudah verifikasi',
			cancelButtonText: 'Nanti saja'
		}).then((result) => {
			if (result.isConfirmed) {
				location.reload(); // reload halaman untuk cek ulang
			}
		});
		return;
	}
	
	// Email sudah diverifikasi, lanjut proses
	try {
		Swal.fire({
			title: 'Memproses data...',
			allowOutsideClick: false,
			didOpen: () => {
				Swal.showLoading();
			}
		});
		
		const pendingRef = doc(db, "pendingUsers", user.uid);
		const pendingSnap = await getDoc(pendingRef);
		
		if (!pendingSnap.exists()) {
			Swal.close();
			Swal.fire(
				'Tidak Ditemukan',
				'Data pendaftaran tidak tersedia atau sudah diproses sebelumnya.',
				'info'
			);
			return;
		}
		
		const userRef = doc(db, "users", user.uid);
		const userSnap = await getDoc(userRef);
		
		if (userSnap.exists()) {
			await deleteDoc(pendingRef); // optional cleanup
			Swal.close();
			Swal.fire(
				'Verifikasi Tersimpan',
				'Akun Anda sudah terverifikasi sebelumnya.',
				'success'
			);
			return;
		}
		
		const data = pendingSnap.data();
		
		await setDoc(userRef, {
			...data,
			email: user.email,
			verifiedAt: serverTimestamp()
		});
		
		await deleteDoc(pendingRef);
		Swal.close();
		
		// Berhasil, alert lalu redirect sesuai role
		Swal.fire({
			title: 'Verifikasi Berhasil!',
			text: 'Anda akan dialihkan...',
			icon: 'success',
			timer: 2000,
			showConfirmButton: false
		}).then(() => {
			const role = data.role;
			if (role === 'admin') {
				window.location.href = 'admin/admin.html';
			} else if (role === 'editor') {
				window.location.href = 'admin/editor.html';
			} else {
				Swal.fire('Peran Tidak Dikenal', 'Silakan hubungi admin.', 'error');
			}
		});
	} catch (err) {
		console.error(err);
		Swal.close();
		Swal.fire('Kesalahan', 'Terjadi kesalahan saat memproses verifikasi.', 'error');
	}
});
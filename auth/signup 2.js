import app from "../firebase-config.js";
import { loadWilayah } from "./lokasi.js";

import {
	getAuth,
	createUserWithEmailAndPassword,
	sendEmailVerification
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

import {
	getFirestore,
	doc,
	setDoc,
	getDoc,
	serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

// Panggil fungsi untuk load data lokasi
loadWilayah();

document.getElementById("signupForm").addEventListener("submit", async e => {
	e.preventDefault();
	
	const nama = document.getElementById("nama").value.trim();
	const provinsi = document.getElementById("provinsi").value;
	const kabupaten = document.getElementById("kabupaten").value;
	const kecamatan = document.getElementById("kecamatan").value;
	const kelurahan = document.getElementById("kelurahan").value;
	const nohp = document.getElementById("nohp").value.trim();
	const email = document.getElementById("email").value.trim();
	const password = document.getElementById("password").value;
	const jenisRole = document.getElementById("jenisRole").value;
	const kodeRole = document.getElementById("kodeRole").value.trim();
	const button = e.submitter;
	
	if (!nama || !provinsi || !kabupaten || !kecamatan || !kelurahan || !nohp || !email || !password || !jenisRole || !kodeRole) {
		Swal.fire("Oops!", "Harap isi semua kolom yang wajib diisi.", "warning");
		return;
	}
	
	button.disabled = true;
	button.textContent = "Mendaftar...";
	
	let role = "viewer";
	
	try {
		const kodeRef = doc(db, "roleCodes", kodeRole);
		const kodeSnap = await getDoc(kodeRef);
		if (kodeSnap.exists()) {
			const roleFromDB = kodeSnap.data().role;
			if (roleFromDB.toLowerCase() !== jenisRole.toLowerCase()) {
				await Swal.fire("Kode Tidak Cocok", `Kode role tidak sesuai dengan jenis role yang dipilih (${jenisRole}).`, "error");
				button.disabled = false;
				button.textContent = "Daftar";
				return;
			}
			role = roleFromDB;
		} else {
			await Swal.fire("Kode Salah", "Kode Role tidak ditemukan.", "error");
			button.disabled = false;
			button.textContent = "Daftar";
			return;
		}
	} catch (err) {
		await Swal.fire("Error", "Terjadi kesalahan saat memvalidasi kode role.", "error");
		console.warn(err.message);
		button.disabled = false;
		button.textContent = "Daftar";
		return;
	}
	
	try {
		const userCredential = await createUserWithEmailAndPassword(auth, email, password);
		await sendEmailVerification(userCredential.user);
		
		// Simpan ke koleksi pendingUsers
		await setDoc(doc(db, "pendingUsers", userCredential.user.uid), {
			nama,
			email,
			nohp,
			role,
			alamat: {
				provinsi: provinsi.split('-')[1],
				kabupaten: kabupaten.split('-')[1],
				kecamatan: kecamatan.split('-')[1],
				kelurahan
			},
			createdAt: serverTimestamp()
		});
		
		await Swal.fire("Berhasil", "Pendaftaran berhasil! Silakan verifikasi email Anda terlebih dahulu.", "success");
		window.location.href = "../verifikasi.html";
	} catch (error) {
		let errorMessage = "Terjadi kesalahan saat mendaftar.";
		switch (error.code) {
			case "auth/email-already-in-use":
				errorMessage = "Email sudah digunakan. Gunakan email lain.";
				break;
			case "auth/invalid-email":
				errorMessage = "Email tidak valid. Harap periksa kembali.";
				break;
			case "auth/weak-password":
				errorMessage = "Password terlalu lemah. Gunakan minimal 6 karakter.";
				break;
			default:
				errorMessage += `\n${error.message}`;
				break;
		}
		await Swal.fire("Gagal", errorMessage, "error");
	} finally {
		button.disabled = false;
		button.textContent = "Daftar";
	}
});
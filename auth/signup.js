import app from "../firebase-config.js"; // jika signup.js ada di folder seperti /auth atau /js

import {
	getAuth,
	createUserWithEmailAndPassword,
	sendEmailVerification
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

import {
	getFirestore,
	doc,
	setDoc,
	getDoc
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

// ========================
// 1. Load Data Lokasi dari Emsifa
// ========================
async function loadWilayah() {
	const provinsiSelect = document.getElementById('provinsi');
	const kabupatenSelect = document.getElementById('kabupaten');
	const kecamatanSelect = document.getElementById('kecamatan');
	const kelurahanSelect = document.getElementById('kelurahan');
	
	const getWilayah = async (url) => {
		const res = await fetch(url);
		return await res.json();
	};
	
	const provinsi = await getWilayah('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json');
	provinsi.forEach(p => provinsiSelect.innerHTML += `<option value="${p.id}-${p.name}">${p.name}</option>`);
	
	provinsiSelect.addEventListener('change', async () => {
		const [id] = provinsiSelect.value.split('-');
		const kabupaten = await getWilayah(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${id}.json`);
		kabupatenSelect.innerHTML = '<option value="">Pilih Kabupaten</option>';
		kecamatanSelect.innerHTML = '<option value="">Pilih Kecamatan</option>';
		kelurahanSelect.innerHTML = '<option value="">Pilih Kelurahan</option>';
		kabupaten.forEach(k => kabupatenSelect.innerHTML += `<option value="${k.id}-${k.name}">${k.name}</option>`);
	});
	
	kabupatenSelect.addEventListener('change', async () => {
		const [id] = kabupatenSelect.value.split('-');
		const kecamatan = await getWilayah(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${id}.json`);
		kecamatanSelect.innerHTML = '<option value="">Pilih Kecamatan</option>';
		kelurahanSelect.innerHTML = '<option value="">Pilih Kelurahan</option>';
		kecamatan.forEach(k => kecamatanSelect.innerHTML += `<option value="${k.id}-${k.name}">${k.name}</option>`);
	});
	
	kecamatanSelect.addEventListener('change', async () => {
		const [id] = kecamatanSelect.value.split('-');
		const kelurahan = await getWilayah(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${id}.json`);
		kelurahanSelect.innerHTML = '<option value="">Pilih Kelurahan</option>';
		kelurahan.forEach(k => kelurahanSelect.innerHTML += `<option value="${k.name}">${k.name}</option>`);
	});
}

loadWilayah();

// ========================
// 2. Proses Pendaftaran
// ========================
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
	const kodeRole = document.getElementById("kodeRole").value.trim();
	
	if (!nama || !provinsi || !kabupaten || !kecamatan || !kelurahan || !nohp || !email || !password) {
		alert("Harap isi semua kolom yang wajib diisi.");
		return;
	}
	
	// ====================
	// Ambil Role dari Firestore
	// ====================
	let role = "viewer"; // default jika kode salah
	
	if (kodeRole) {
		try {
			const kodeRef = doc(db, "roleCodes", kodeRole); // dokumen: ADMIN927, EDITOR744
			const kodeSnap = await getDoc(kodeRef);
			if (kodeSnap.exists()) {
				role = kodeSnap.data().role || "viewer";
			}
		} catch (err) {
			console.warn("Gagal membaca kode role dari Firestore:", err.message);
		}
	}
	
	try {
		const userCredential = await createUserWithEmailAndPassword(auth, email, password);
		await sendEmailVerification(userCredential.user);
		
		await setDoc(doc(db, "users", userCredential.user.uid), {
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
			createdAt: new Date()
		});
		
		alert("Pendaftaran berhasil! Silakan verifikasi email Anda.");
		window.location.href = "confirm.html";
	} catch (error) {
		let errorMessage = "Terjadi kesalahan saat mendaftar. ";
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
				errorMessage += error.message;
				break;
		}
		alert(errorMessage);
	}
});
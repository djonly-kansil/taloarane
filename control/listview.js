import app from "../firebase-config.js";
import {
	getFirestore,
	doc,
	getDoc,
	collection,
	getDocs
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

import {
	getAuth,
	onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const auth = getAuth(app);
const db = getFirestore(app);

// Fungsi utama untuk load user list
async function loadUsers() {
	const tableBody = document.getElementById("userTableBody");
	tableBody.innerHTML = `<tr><td colspan="5">Memuat data...</td></tr>`;
	
	try {
		const querySnapshot = await getDocs(collection(db, "users"));
		tableBody.innerHTML = "";
		
		if (querySnapshot.empty) {
			tableBody.innerHTML = `<tr><td colspan="5">Tidak ada data pengguna.</td></tr>`;
			return;
		}
		
		querySnapshot.forEach(doc => {
			const data = doc.data();
			const alamat = data.alamat || {};
			const row = `
        <tr>
          <td>${data.nama || "-"}</td>
          <td>${data.email || "-"}</td>
          <td>${data.nohp || "-"}</td>
          <td>${data.role || "-"}</td>
          <td>
            ${alamat.kecamatan || ""}, 
            ${alamat.kelurahan || ""}
          </td>
        </tr>
      `;
			tableBody.innerHTML += row;
		});
	} catch (err) {
		console.error("Gagal memuat data:", err);
		tableBody.innerHTML = `<tr><td colspan="5">Gagal memuat data pengguna.</td></tr>`;
	}
}

// Cek apakah user admin
onAuthStateChanged(auth, async (user) => {
	if (user) {
		const uid = user.uid;
		const userRef = doc(db, "users", uid);
		const userSnap = await getDoc(userRef);
		
		if (userSnap.exists()) {
			const role = userSnap.data().role;
			
			if (role === "admin") {
				// Jika admin, tampilkan data
				loadUsers();
			} else {
				alert("Akses ditolak. Anda bukan admin.");
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
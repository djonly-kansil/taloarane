import app from "../firebase-config.js";
import {
	getFirestore,
	collection,
	getDocs,
	doc,
	getDoc
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import {
	getAuth,
	onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const db = getFirestore(app);
const auth = getAuth(app);

const modal = document.getElementById("userModal");
const spanClose = document.querySelector(".close");

function showModal(user) {
	document.getElementById("modalNama").innerText = user.nama || "-";
	document.getElementById("modalEmail").innerText = user.email || "-";
	document.getElementById("modalNoHP").innerText = user.nohp || "-";
	document.getElementById("modalRole").innerText = user.role || "-";
	const alamat = user.alamat || {};
	document.getElementById("modalAlamat").innerText =
		`${alamat.kelurahan || ""}, ${alamat.kecamatan || ""}, ${alamat.kabupaten || ""}` || "-";
	modal.style.display = "block";
}

spanClose.onclick = () => (modal.style.display = "none");
window.onclick = (event) => {
	if (event.target == modal) modal.style.display = "none";
};

async function loadUsers() {
	const tableBody = document.getElementById("userTableBody");
	tableBody.innerHTML = "";
	const querySnapshot = await getDocs(collection(db, "users"));
	if (querySnapshot.empty) {
		tableBody.innerHTML = `<tr><td colspan="2">Tidak ada data pengguna.</td></tr>`;
		return;
	}
	
	querySnapshot.forEach((docSnap) => {
		const data = docSnap.data();
		const row = document.createElement("tr");
		row.innerHTML = `
      <td>${data.nama || "-"}</td>
      <td>${data.email || "-"}</td>
    `;
		row.style.cursor = "pointer";
		row.onclick = () => showModal(data);
		tableBody.appendChild(row);
	});
}

onAuthStateChanged(auth, async (user) => {
	if (user) {
		const userSnap = await getDoc(doc(db, "users", user.uid));
		if (userSnap.exists() && userSnap.data().role === "admin") {
			loadUsers();
		} else {
			alert("Akses ditolak. Anda bukan admin.");
			location.href = "/index.html";
		}
	} else {
		alert("Silakan login terlebih dahulu.");
		location.href = "../auth/login.html";
	}
});
import app from "../firebase-config.js";
import {
	getFirestore,
	doc,
	getDoc
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const db = getFirestore(app);
const container = document.getElementById("pengumumanContainer");

async function tampilkanPengumuman() {
	try {
		const docRef = doc(db, "pengumuman", "pengumuman");
		const docSnap = await getDoc(docRef);
		
		if (!docSnap.exists()) {
			container.innerHTML = "<p>Tidak ada file pengumuman saat ini.</p>";
			return;
		}
		
		const { url, fileType, fileName } = docSnap.data();
		const ext = fileName.split(".").pop().toLowerCase();
		
		if (["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(ext)) {
			const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
			container.innerHTML = `<iframe src="${viewerUrl}" style="width:100%; height:600px;" frameborder="0"></iframe>`;
		} else if (ext === "pdf") {
			container.innerHTML = `<iframe src="${url}" style="width:100%; height:600px;" frameborder="0"></iframe>`;
		} else if (ext === "html" || ext === "htm") {
			container.innerHTML = `<iframe src="${url}" style="width:100%; height:600px;" frameborder="0"></iframe>`;
		} else if (ext === "txt") {
			const res = await fetch(url);
			const text = await res.text();
			container.innerHTML = `<pre style="white-space: pre-wrap; background:#f5f5f5; padding:1rem;">${text}</pre>`;
		} else {
			container.innerHTML = `<a href="${url}" target="_blank">Silahkan Buka (${fileName})</a>`;
		}
	} catch (err) {
		console.error(err);
		container.innerHTML = "<p>Gagal memuat pengumuman.</p>";
	}
}

tampilkanPengumuman();
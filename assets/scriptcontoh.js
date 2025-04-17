import app from "../firebase-config.js";
import {
getStorage,
ref,
getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-storage.js";

const storage = getStorage(app);
const sliderTrack = document.getElementById("slider-track");

// Nama-nama file gambar di Firebase Storage
const imageFiles = [
"slide1.jpg",
"slide2.jpg",
"slide3.jpg"
];

const imageFolder = "backgrounds"; // folder di Storage kamu

// Ambil semua gambar dan tambahkan ke slider
imageFiles.forEach(async (fileName) => {
const fileRef = ref(storage, `${imageFolder}/${fileName}`);
try {
const url = await getDownloadURL(fileRef);
const img = document.createElement("img");
img.src = url;
img.alt = "Slideshow background";
sliderTrack.appendChild(img);
} catch (error) {
console.error(`Gagal ambil gambar ${fileName}:`, error);
}
});
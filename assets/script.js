const contentContainer = document.getElementById("content");
const sliderTrack = document.getElementById("slider-track");
const totalSlides = 10;

// Slideshow
(() => {
	const imageUrls = [];
	for (let i = 1; i <= totalSlides; i++) {
		imageUrls.push(`images/foto${i}.jpg`);
	}
	[...imageUrls, ...imageUrls].forEach(url => {
		const img = document.createElement("img");
		img.src = url;
		img.alt = "Slideshow background";
		sliderTrack.appendChild(img);
	});
})();

// Navigasi dinamis
function loadPage(page) {
	const pageFile = page === "" ? "beranda" : page;
	
	fetch(`pages/${pageFile}.html`)
		.then(res => res.ok ? res.text() : Promise.reject("404"))
		.then(html => {
			contentContainer.innerHTML = html;
			
			// Jika halaman peta atau pengumuman, muat script masing-masing
if (["peta", "pengumuman"].includes(pageFile)) {
	const script = document.createElement("script");
	script.type = "module";
	script.src = `assets/${pageFile}.js`;
	document.body.appendChild(script);
}
		})
		.catch(() => {
			contentContainer.innerHTML = "<p>Halaman tidak ditemukan.</p>";
		});
}

// Klik menu navigasi utama
document.querySelectorAll("nav a").forEach(link => {
	link.addEventListener("click", e => {
		e.preventDefault();
		const page = link.getAttribute("data-page");
		history.pushState(null, "", `#${page}`);
		loadPage(page);
	});
});

window.addEventListener("DOMContentLoaded", () => {
	const page = location.hash.replace("#", "");
	loadPage(page);
	
	// Tombol pengumuman sebagai navigasi tambahan
	const btnPengumuman = document.getElementById("btnPengumuman");
	if (btnPengumuman) {
		btnPengumuman.addEventListener("click", () => {
			history.pushState(null, "", "#pengumuman");
			loadPage("pengumuman");
		});
	}
});

window.addEventListener("popstate", () => {
	const page = location.hash.replace("#", "");
	loadPage(page);
});
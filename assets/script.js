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
			
			// Jika halaman peta, muat peta.js
			if (pageFile === "peta") {
				const script = document.createElement("script");
		script.src = "assets/peta.js";
				document.body.appendChild(script);
			}
		})
		.catch(() => {
			contentContainer.innerHTML = "<p>Halaman tidak ditemukan.</p>";
		});
}

// Klik menu
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
});

window.addEventListener("popstate", () => {
	const page = location.hash.replace("#", "");
	loadPage(page);
});
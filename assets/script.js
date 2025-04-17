import { supabase } from "../supabase-config.js";

const sliderTrack = document.getElementById("slider-track");
const totalSlides = 10;

(async () => {
	const imageUrls = [];
	
	for (let i = 1; i <= totalSlides; i++) {
		const fileName = `slide${i}.jpg`;
		
		// Ambil URL publik dari Supabase
		const { data, error } = supabase.storage
			.from("taloarane")
			.getPublicUrl(fileName);
		
		if (error) {
			console.warn(`❌ Gagal ambil URL untuk ${fileName}`, error.message);
			continue;
		}
		
		imageUrls.push(data.publicUrl);
	}
	
	// Gandakan untuk efek slide looping (seperti sebelumnya)
	const allImages = [...imageUrls, ...imageUrls];
	
	allImages.forEach((url) => {
		const img = document.createElement("img");
		img.src = url;
		img.alt = "Slideshow background";
		sliderTrack.appendChild(img);
	});
})();
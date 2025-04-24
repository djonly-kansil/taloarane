const sliderTrack = document.getElementById("slider-track");
const totalSlides = 10;

(() => {
	const imageUrls = [];
	
	for (let i = 1; i <= totalSlides; i++) {
		const fileName = `images/foto${i}.jpg`;
		imageUrls.push(fileName);
	}
	
	// Gandakan untuk efek slide looping
	const allImages = [...imageUrls, ...imageUrls];
	
	allImages.forEach((url) => {
		const img = document.createElement("img");
		img.src = url;
		img.alt = "Slideshow background";
		sliderTrack.appendChild(img);
	});
})();
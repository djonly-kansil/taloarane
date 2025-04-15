const imagePaths = [
	"assets/foto1.jpg",
	"assets/foto2.jpg",
	"assets/foto3.jpg",
	"assets/foto4.jpg",
	"assets/foto5.jpg",
	"assets/foto6.jpg",
	"assets/foto7.jpg",
	"assets/foto8.jpg",
	"assets/foto9.jpg",
	"assets/foto10.jpg"
];

const sliderTrack = document.getElementById('slider-track');
const allImages = [...imagePaths, ...imagePaths];


allImages.forEach((path) => {
	const img = document.createElement('img');
	img.src = path;
	img.alt = "Slideshow background";
	sliderTrack.appendChild(img);

});


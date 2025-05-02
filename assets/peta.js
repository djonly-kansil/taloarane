// Muat Leaflet CSS & JS
const leafletCSS = document.createElement("link");
leafletCSS.rel = "stylesheet";
leafletCSS.href = "https://unpkg.com/leaflet/dist/leaflet.css";
document.head.appendChild(leafletCSS);

const leafletJS = document.createElement("script");
leafletJS.src = "https://unpkg.com/leaflet/dist/leaflet.js";
leafletJS.onload = () => {
	const mapDiv = document.getElementById("map");
	if (!mapDiv) return;

	const locations = {
		raja: { coords: [3.565893, 125.517683], label: "Rumah Raja" },
		kantor: { coords: [3.567679, 125.518160], label: "Kantor Desa Taloarane" },
		gereja: { coords: [3.564519, 125.517578], label: "Gereja Katolik" },
		gereja2: { coords: [3.567079, 125.515180], label: "Gereja Petra Manganitu" },
		camat: { coords: [3.565330, 125.518099], label: "Rumah Dinas Camat" }
	};

	const map = L.map("map").setView(locations.kantor.coords, 17);

	const satelliteLayer = L.tileLayer(
		"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
		{ attribution: "Tiles © Esri" }
	).addTo(map);

	const osmLayer = L.tileLayer(
		"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
		{ attribution: "© OpenStreetMap contributors" }
	);

	L.control.layers({ Satelit: satelliteLayer, "Peta Jalan": osmLayer }).addTo(map);

	const markers = {};
	for (const key in locations) {
		const loc = locations[key];
		markers[key] = L.marker(loc.coords).addTo(map).bindPopup(loc.label);
	}

	window.goToLocation = key => {
		const target = locations[key];
		map.setZoom(17, { animate: true });
		setTimeout(() => {
			map.setView(target.coords, 17, { animate: true });
			markers[key].openPopup();
		}, 400);
	};

	markers.kantor.openPopup();
};
document.body.appendChild(leafletJS);
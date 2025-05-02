// lokasi.js
export async function loadWilayah() {
	const provinsiSelect = document.getElementById('provinsi');
	const kabupatenSelect = document.getElementById('kabupaten');
	const kecamatanSelect = document.getElementById('kecamatan');
	const kelurahanSelect = document.getElementById('kelurahan');
	
	const getWilayah = async (url) => {
		const res = await fetch(url);
		return await res.json();
	};
	
	const provinsi = await getWilayah('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json');
	provinsi.forEach(p => provinsiSelect.innerHTML += `<option value="${p.id}-${p.name}">${p.name}</option>`);
	
	provinsiSelect.addEventListener('change', async () => {
		const [id] = provinsiSelect.value.split('-');
		const kabupaten = await getWilayah(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${id}.json`);
		kabupatenSelect.innerHTML = '<option value="">Pilih Kabupaten</option>';
		kecamatanSelect.innerHTML = '<option value="">Pilih Kecamatan</option>';
		kelurahanSelect.innerHTML = '<option value="">Pilih Kelurahan</option>';
		kabupaten.forEach(k => kabupatenSelect.innerHTML += `<option value="${k.id}-${k.name}">${k.name}</option>`);
	});
	
	kabupatenSelect.addEventListener('change', async () => {
		const [id] = kabupatenSelect.value.split('-');
		const kecamatan = await getWilayah(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${id}.json`);
		kecamatanSelect.innerHTML = '<option value="">Pilih Kecamatan</option>';
		kelurahanSelect.innerHTML = '<option value="">Pilih Kelurahan</option>';
		kecamatan.forEach(k => kecamatanSelect.innerHTML += `<option value="${k.id}-${k.name}">${k.name}</option>`);
	});
	
	kecamatanSelect.addEventListener('change', async () => {
		const [id] = kecamatanSelect.value.split('-');
		const kelurahan = await getWilayah(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${id}.json`);
		kelurahanSelect.innerHTML = '<option value="">Pilih Kelurahan</option>';
		kelurahan.forEach(k => kelurahanSelect.innerHTML += `<option value="${k.name}">${k.name}</option>`);
	});
}
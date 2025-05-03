// imagekit.js

export async function getImageKitSignature(headers = {}) {
	const res = await fetch("https://imagekit-upload-djonly-kansils-projects.vercel.app/api/get-signature", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			...headers
		}
	});
	if (!res.ok) {
		const errorData = await res.json();
		throw new Error(errorData.error || "Gagal mengambil signature dari server");
	}
	return await res.json();
}

export async function uploadToImageKit(file, signatureData, options = {}) {
	const formData = new FormData();
	formData.append("file", file);
	formData.append("fileName", options.fileName || file.name);
	formData.append("folder", options.folder || "/");
	formData.append("useUniqueFileName", options.useUniqueFileName ? "true" : "false");
	formData.append("overwriteFile", options.overwrite ? "true" : "false");
	formData.append("publicKey", signatureData.publicKey);
	formData.append("signature", signatureData.signature);
	formData.append("expire", signatureData.expire);
	formData.append("token", signatureData.token);
	
	const uploadRes = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
		method: "POST",
		body: formData
	});
	const result = await uploadRes.json();
	if (!uploadRes.ok || !result.url) {
		console.error("Gagal upload ke ImageKit:", result);
		throw new Error("Upload gagal ke ImageKit");
	}
	return result;
}
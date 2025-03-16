const uploadArea = document.getElementById("upload-area");
const fileInput = document.getElementById("file-input");
const fileInfo = document.getElementById("file-info");
const container = document.getElementById("container");
const editor = document.getElementById("editor");
const imagePreview = document.getElementById("image-preview");

uploadArea.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", handleFile);

uploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadArea.classList.add("highlight");
});

uploadArea.addEventListener("dragleave", () => {
    uploadArea.classList.remove("highlight");
});

uploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadArea.classList.remove("highlight");
    fileInput.files = e.dataTransfer.files;
    handleFile();
});

function handleFile() {
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        fileInfo.textContent = "تم تحديد الملف: " + file.name;
        const imageUrl = URL.createObjectURL(file);
        const img = document.getElementById("image-preview");
        img.setAttribute('data-original-src', imageUrl);
        displayImage(imageUrl);
    }
}

function uploadFromUrl() {
    const imageUrl = document.getElementById("image-url").value;
    if (imageUrl) {
        fileInfo.textContent = "تم تحميل الصورة من الرابط: " + imageUrl;
        const img = document.getElementById("image-preview");
        img.setAttribute('data-original-src', imageUrl);
        img.src = imageUrl;
        img.onload = () => {
            displayImage(imageUrl);
        };
    } else {
        alert("يرجى إدخال رابط صحيح!");
    }
}

function pasteUrl() {
    navigator.clipboard.readText().then(text => {
        document.getElementById("image-url").value = text;
        uploadFromUrl();
    }).catch(err => {
        alert("Failed to read clipboard contents: " + err);
    });
}

function displayImage(src) {
    imagePreview.src = src;
    container.style.display = "none";
    editor.style.display = "flex";
}

function showTool(toolId) {
    document.querySelectorAll('.tools').forEach(tool => tool.classList.remove('active'));
    document.getElementById(toolId).classList.add('active');
}

function resetAllFilters() {
    const img = document.getElementById("image-preview");
    img.style.filter = "";
}
function adjustSaturation() {
    const img = document.getElementById("image-preview");
    img.style.filter = "saturate(150%)";
}
function invertColors() {
    const img = document.getElementById("image-preview");
    img.style.filter = "invert(100%)";
}
function grayscaleImage() {
    const img = document.getElementById("image-preview");
    img.style.filter = "grayscale(100%)";
}
function adjustBrightness() {
    const brightnessRange = document.getElementById("brightness-range");
    const brightnessValue = document.getElementById("brightness-value");
    const img = document.getElementById("image-preview");
    brightnessRange.addEventListener("input", () => {
        const brightness = brightnessRange.value;
        brightnessValue.textContent = brightness;
        const currentFilter = img.style.filter;
        const newFilter = currentFilter.replace(/brightness\(\d+%\)/, "").trim();
        img.style.filter = `${newFilter} brightness(${brightness}%)`.trim();
    });
}
adjustBrightness();

function flipHorizontal() {
    const img = document.getElementById("image-preview");
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = img.src;
    image.onload = () => {
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(image, 0, 0);
        img.src = canvas.toDataURL();
    };
}

function flipVertical() {
    const img = document.getElementById("image-preview");
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const image = new Image();
    image.src = img.src;
    image.onload = () => {
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.translate(0, canvas.height);
        ctx.scale(1, -1);
        ctx.drawImage(image, 0, 0);
        img.src = canvas.toDataURL();
    };
}

function rotateImage() {
    const img = document.getElementById("image-preview");
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const image = new Image();
    image.src = img.src;
    image.onload = () => {
        canvas.width = image.height;
        canvas.height = image.width;
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(90 * Math.PI / 180);
        ctx.drawImage(image, -image.width / 2, -image.height / 2);
        img.src = canvas.toDataURL();
    };
}

function resetTransform() {
    const img = document.getElementById("image-preview");
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const image = new Image();
    image.src = img.src;
    image.onload = () => {
        canvas.width = image.height;
        canvas.height = image.width;
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-90 * Math.PI / 180);
        ctx.drawImage(image, -image.width / 2, -image.height / 2);
        img.src = canvas.toDataURL();
    };
}

let cropping = false;
let cropper = null;

function cropImage() {
    if (cropping) return;
    cropping = true;

    // Create cropper overlay
    cropper = document.createElement('div');
    cropper.style.position = 'fixed';
    cropper.style.top = '0';
    cropper.style.left = '0';
    cropper.style.width = '100%';
    cropper.style.height = '100%';
    cropper.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    cropper.style.zIndex = '1000';
    cropper.style.cursor = 'crosshair';
    document.body.appendChild(cropper);

    // Create crop area
    const cropArea = document.createElement('div');
    cropArea.style.position = 'absolute';
    cropArea.style.border = '2px dashed #fff';
    cropArea.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
    cropper.appendChild(cropArea);

    let startX, startY, endX, endY;

    cropper.addEventListener('mousedown', (e) => {
        const rect = imagePreview.getBoundingClientRect();
        if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
            cancelCrop();
            return;
        }
        startX = e.clientX;
        startY = e.clientY;
        cropArea.style.left = `${startX}px`;
        cropArea.style.top = `${startY}px`;
        cropArea.style.width = '0';
        cropArea.style.height = '0';
        cropper.addEventListener('mousemove', onMouseMove);
    });

    cropper.addEventListener('mouseup', (e) => {
        cropper.removeEventListener('mousemove', onMouseMove);
        const rect = imagePreview.getBoundingClientRect();
        if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
            cancelCrop();
            return;
        }
        endX = e.clientX;
        endY = e.clientY;
        applyCrop(startX, startY, endX, endY);
        document.body.removeChild(cropper);
        cropping = false;
    });

    function onMouseMove(e) {
        const currentX = e.clientX;
        const currentY = e.clientY;
        cropArea.style.width = `${Math.abs(currentX - startX)}px`;
        cropArea.style.height = `${Math.abs(currentY - startY)}px`;
        cropArea.style.left = `${Math.min(currentX, startX)}px`;
        cropArea.style.top = `${Math.min(currentY, startY)}px`;
    }

    function cancelCrop() {
        document.body.removeChild(cropper);
        cropping = false;
    }
}

function applyCrop(startX, startY, endX, endY) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = imagePreview.src;
    img.onload = () => {
        const rect = imagePreview.getBoundingClientRect();
        const scaleX = img.width / imagePreview.clientWidth;
        const scaleY = img.height / imagePreview.clientHeight;
        const cropX = (Math.min(startX, endX) - rect.left) * scaleX;
        const cropY = (Math.min(startY, endY) - rect.top) * scaleY;
        const cropWidth = Math.abs(endX - startX) * scaleX;
        const cropHeight = Math.abs(endY - startY) * scaleY;

        canvas.width = cropWidth;
        canvas.height = cropHeight;
        ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
        imagePreview.src = canvas.toDataURL();
    };
}

function resizeImage() {
    const width = document.getElementById("resize-width").value;
    const height = document.getElementById("resize-height").value;
    if (width && height) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = imagePreview.src;
        img.onload = () => {
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            imagePreview.src = canvas.toDataURL();
        };
    } else {
        alert("يرجى إدخال العرض والارتفاع!");
    }
}

function enhanceImage() {
    const img = document.getElementById("image-preview");
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const image = new Image();
    image.crossOrigin = "anonymous"; // Allow cross-origin requests
    image.src = img.src;
    image.onload = () => {
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.filter = "contrast(120%) brightness(110%) saturate(120%)";
        ctx.imageRendering = "crisp-edges"; // Enhance image quality without changing size
        ctx.drawImage(image, 0, 0, image.width, image.height);
        img.src = canvas.toDataURL("image/png");
        img.setAttribute('data-original-src', img.src); // Update original source
    };
    image.onerror = () => {
        alert("Failed to load image. Please ensure the image is from a same-origin source or a CORS-enabled source.");
    };
}

function resetImage() {
    const img = document.getElementById("image-preview");
    img.src = img.getAttribute('data-original-src');
    img.style.filter = "";
    img.style.transform = "";
}

document.getElementById("file-input").addEventListener("change", () => {
    const img = document.getElementById("image-preview");
    img.setAttribute('data-original-src', img.src);
});

document.getElementById("image-url").addEventListener("input", () => {
    const img = document.getElementById("image-preview");
    img.setAttribute('data-original-src', img.src);
});

function saveImage() {
    const img = document.getElementById("image-preview");
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const image = new Image();
    image.src = img.src;
    image.onload = () => {
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0, image.width, image.height);
        const format = prompt("Enter the image format (e.g., png, jpeg, webp):", "png");
        if (format) {
            const dataURL = canvas.toDataURL(`image/${format}`);
            const link = document.createElement('a');
            link.href = dataURL;
            link.download = `edited-image.${format}`;
            link.click();
        } else {
            alert("Invalid format!");
        }
    };
}
document.querySelector('.image-state button:first-child').addEventListener('click', saveImage);

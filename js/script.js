const mainImageInput = document.getElementById('mainImage');
const logoImageInput = document.getElementById('logoImage');
const positionSelect = document.getElementById('position');
const opacityRange = document.getElementById('opacity');
const scaleRange = document.getElementById('scale');
const opacityValue = document.getElementById('opacityValue');
const scaleValue = document.getElementById('scaleValue');
const downloadBtn = document.getElementById('download');
const canvas = document.getElementById('previewCanvas');
const ctx = canvas.getContext('2d');

let mainImg = null, logoImg = null;

function updatePercentages() {
  opacityValue.textContent = Math.round(opacityRange.value * 100) + '%';
  scaleValue.textContent = Math.round(scaleRange.value * 100) + '%';
}

function checkDownloadReady() {
  downloadBtn.disabled = !(mainImg && logoImg);
}

function drawPreview() {
  if (!mainImg) return;

  canvas.width = mainImg.width;
  canvas.height = mainImg.height;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(mainImg, 0, 0, canvas.width, canvas.height);

  if (logoImg) {
    const scale = parseFloat(scaleRange.value);
    const opacity = parseFloat(opacityRange.value);

    // Ajuste proporcional suave
    const maxWidthRatio = 0.95; // logo ocupa até 95% da largura da imagem
    const maxHeightRatio = 0.95; // idem para altura

    // Cálculo da escala proporcional ao tamanho da imagem principal
    const widthRatio = (logoImg.width / mainImg.width);
    const heightRatio = (logoImg.height / mainImg.height);

    // Se a logo for maior, normaliza mantendo proporção
    const baseScale = Math.min(
      (maxWidthRatio / widthRatio),
      (maxHeightRatio / heightRatio)
    );

    // Aplicar escala linearmente conforme o slider
    const logoWidth = logoImg.width * baseScale * scale;
    const logoHeight = logoImg.height * baseScale * scale;

    ctx.globalAlpha = opacity;

    if (positionSelect.value === 'distribuir') {
      const cols = 3;
      const rows = 3;
      const xGap = (canvas.width - cols * logoWidth) / (cols + 1);
      const yGap = (canvas.height - rows * logoHeight) / (rows + 1);

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = xGap + i * (logoWidth + xGap);
          const y = yGap + j * (logoHeight + yGap);
          ctx.drawImage(logoImg, x, y, logoWidth, logoHeight);
        }
      }
    } else {
      let x = 0, y = 0;
      switch (positionSelect.value) {
        case 'top-left': x = 10; y = 10; break;
        case 'top-right': x = canvas.width - logoWidth - 10; y = 10; break;
        case 'bottom-left': x = 10; y = canvas.height - logoHeight - 10; break;
        case 'bottom-right': x = canvas.width - logoWidth - 10; y = canvas.height - logoHeight - 10; break;
        default:
          x = (canvas.width - logoWidth) / 2;
          y = (canvas.height - logoHeight) / 2;
      }
      ctx.drawImage(logoImg, x, y, logoWidth, logoHeight);
    }

    ctx.globalAlpha = 1.0;
  }
}


mainImageInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    mainImg = new Image();
    mainImg.onload = () => { drawPreview(); checkDownloadReady(); };
    mainImg.src = reader.result;
  };
  reader.readAsDataURL(file);
});

logoImageInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    logoImg = new Image();
    logoImg.onload = () => { drawPreview(); checkDownloadReady(); };
    logoImg.src = reader.result;
  };
  reader.readAsDataURL(file);
});

positionSelect.addEventListener('change', drawPreview);
opacityRange.addEventListener('input', () => { updatePercentages(); drawPreview(); });
scaleRange.addEventListener('input', () => { updatePercentages(); drawPreview(); });

downloadBtn.addEventListener('click', () => {
  // Gera a data/hora atual
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yy = String(now.getFullYear()).slice(-2);
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');

  const filename = `image-markaai-${dd}${mm}${yy}${hh}${min}${ss}.jpg`;

  // Cria o link e força o download
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/jpeg', 0.9);
  link.click();
});


updatePercentages();

const fs = require('fs');
const path = require('path');

const folders = [
  "../ImagesChamps/DefaultChamps",
  "../ImagesChamps/SkinChamps",
  "../ImagesChampPixel/DefaultChampsPixel/easy",
  "../ImagesChampPixel/DefaultChampsPixel/medium",
  "../ImagesChampPixel/DefaultChampsPixel/hard",
  "../ImagesChampPixel/DefaultChampsPixel/extreme",
  "../ImagesChampPixel/SkinChampsPixel/easy",
  "../ImagesChampPixel/SkinChampsPixel/medium",
  "../ImagesChampPixel/SkinChampsPixel/hard",
  "../ImagesChampPixel/SkinChampsPixel/extreme"
];

let allImages = [];

folders.forEach(folder => {
  const folderPath = path.join(__dirname, folder);
  if (fs.existsSync(folderPath)) {
    const files = fs.readdirSync(folderPath);
    files.forEach(file => {
      if (/\.(png|jpg|jpeg)$/i.test(file)) {
        allImages.push(`${folder}/${file}`.replace(/\\/g, "/").replace("../","./"));
      }
    });
  }
});

fs.writeFileSync("images_list.json", JSON.stringify(allImages, null, 2));
console.log(`✅ images_list.json généré avec ${allImages.length} images`);

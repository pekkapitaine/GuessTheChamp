import fs from "fs";
import path from "path";

const defaultDir = "./ImagesChamps/DefaultChamps";
const skinDir = "./ImagesChamps/SkinChamps";

function generateImageEntries(dir, category) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".png"));
  return files.map(file => {
    const name = path.parse(file).name;
    const entry = {
      file,
      champion: name.split("-")[0],
      category
    };

if (category === "skin") {
  const [champPart, skinPart] = name.split(/-(.+)/); 

  const champion = champPart;
  const skinName = skinPart.endsWith(champion) 
                   ? skinPart.slice(0, -champion.length - 1)
                   : skinPart;

  entry.champion = champion;
  entry.skinName = skinName;
}

    return entry;
  });
}

// Générer toutes les images
const defaultImages = generateImageEntries(defaultDir, "default");
const skinImages = generateImageEntries(skinDir, "skin");

const gameData = {
  images: [...defaultImages, ...skinImages]
};

// Écrire le JSON avec indentation pour lisibilité
fs.writeFileSync("../game_data.json", JSON.stringify(gameData, null, 2));
console.log("✅ game_data.json généré !");

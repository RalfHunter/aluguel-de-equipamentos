import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

const diretorio = 'uploads/equipamentos';

if (!fs.existsSync(diretorio)) {
  fs.mkdirSync(diretorio, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, diretorio);
  },
  filename: (req, file, cb) => {
    const extensao = path.extname(file.originalname).toLowerCase();
    const nomeUnico = `${uuidv4()}${extensao}`;
    cb(null, nomeUnico);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, 
  },
  fileFilter: (req, file, cb) => {
    const extensao = path.extname(file.originalname).toLowerCase();
    const permitidas = ['.jpg', '.jpeg', '.png'];

    if (!permitidas.includes(extensao)) {
      return cb(new Error("Extensão de imagem inválida."), false);
    }

    cb(null, true);
  }
});

export default upload;

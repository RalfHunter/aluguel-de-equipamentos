import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";

const diretorio = 'uploads/usuarios';

// Criar diretório se não existir
if (!fs.existsSync(diretorio)) {
  fs.mkdirSync(diretorio, { recursive: true });
}

// Função para remover fotos existentes do usuário (VERSÃO OTIMIZADA)
const removerFotoExistente = (userId) => {
  try {
    const extensoesPossiveis = ['.jpg', '.jpeg', '.png'];
    let arquivoRemovido = false;

    extensoesPossiveis.forEach(extensao => {
      const caminhoArquivo = path.join(diretorio, `${userId}${extensao}`);

      if (fs.existsSync(caminhoArquivo)) {
        fs.unlinkSync(caminhoArquivo);
        console.log(`Foto anterior removida: ${caminhoArquivo}`);
        arquivoRemovido = true;
      }
    });

    return arquivoRemovido;
  } catch (error) {
    console.warn('Erro ao remover foto existente:', error.message);
    return false;
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, diretorio);
  },
  filename: (req, file, cb) => {
    try {
      // Usar o ID dos parâmetros da URL
      const userId = req.params.id;

      if (!userId) {
        return cb(new Error('ID do usuário não encontrado nos parâmetros.'), null);
      }

      // Remover foto existente antes de salvar a nova
      const fotoRemovidaExistia = removerFotoExistente(userId);

      if (fotoRemovidaExistia) {
        console.log(`Foto anterior do usuário ${userId} foi substituída`);
      }

      // Gerar nome do arquivo com ID dos parâmetros
      const extensao = path.extname(file.originalname).toLowerCase();
      const nomeArquivo = `${userId}${extensao}`;

      console.log(`Salvando nova foto: ${nomeArquivo}`);
      cb(null, nomeArquivo);

    } catch (error) {
      console.error('Erro no processamento do filename:', error);
      cb(error, null);
    }
  }
});

const uploadUsuario = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB para fotos de usuário
  },
  fileFilter: (req, file, cb) => {
    try {
      // Verificar se o ID está nos parâmetros
      if (!req.params.id) {
        return cb(new Error('ID do usuário não encontrado nos parâmetros.'), false);
      }

      // Validar extensão
      const extensao = path.extname(file.originalname).toLowerCase();
      const permitidas = ['.jpg', '.jpeg', '.png'];

      if (!permitidas.includes(extensao)) {
        return cb(new Error("Extensão de imagem inválida. Apenas JPG, JPEG e PNG são permitidos."), false);
      }

      // Validar tipo MIME
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error("Tipo de arquivo inválido. Apenas imagens são permitidas."), false);
      }

      cb(null, true);
    } catch (error) {
      cb(error, false);
    }
  }
});

// Middleware para compressão de imagens
const compressUserImage = async (req, res, next) => {
  if (!req.file) return next();

  const filePath = req.file.path;
  const tempPath = `${filePath}_temp`;

  try {
    // Verificar o tamanho do arquivo
    const stats = fs.statSync(filePath);
    const fileSizeInMB = stats.size / (1024 * 1024);

    // Só comprimir se for maior que 2MB
    if (fileSizeInMB > 2) {
      console.log(`Comprimindo imagem de ${fileSizeInMB.toFixed(2)}MB...`);

      await sharp(filePath)
        .resize(1200, 900, { 
          fit: 'inside', 
          withoutEnlargement: true 
        })
        .jpeg({ 
          quality: 85,
          progressive: true 
        })
        .toFile(tempPath);

      // Substituir o arquivo original pelo comprimido
      fs.unlinkSync(filePath);
      fs.renameSync(tempPath, filePath);

      // Atualizar informações do arquivo no req.file
      const newStats = fs.statSync(filePath);
      req.file.size = newStats.size;
      
      console.log(`Imagem comprimida para ${(newStats.size / (1024 * 1024)).toFixed(2)}MB`);
    }

    next();
  } catch (error) {
    console.error('Erro ao comprimir imagem:', error);
    
    // Limpar arquivo temporário se existir
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
    
    // Continuar sem compressão em caso de erro
    next();
  }
};

export default uploadUsuario;
export { compressUserImage };
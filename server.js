import dotenv from 'dotenv';
import app from "./src/app.js";
import DbConnect from "./src/config/DbConnect.js";

dotenv.config();

const port = process.env.PORT || 5011;

// Faz a conexão com o banco antes de subir o servidor
DbConnect.conectar().then(() => {
    app.listen(port, () => {
        console.log(`Servidor rodando em http://localhost:${port}`);
    });
}).catch((err) => {
    console.error("Erro ao conectar com o banco:", err);
});

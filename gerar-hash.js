// Arquivo: gerar-hash.js
const bcrypt = require('bcryptjs');

// ===================================================================
// IMPORTANTE: Coloque aqui a senha que VOCÊ quer usar para o admin
const minhaSenhaSecreta = 'Reserva207*'; // <-- TROQUE AQUI SE QUISER OUTRA SENHA
// ===================================================================

// O '10' é o "custo" da criptografia. É um bom valor padrão.
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(minhaSenhaSecreta, salt);

console.log("--- GERADOR DE HASH DE SENHA ---");
console.log("Sua Senha Original:", minhaSenhaSecreta);
console.log("Seu Hash Seguro (copie a linha abaixo):");
console.log(hash);
console.log("---------------------------------");
console.log("\nAgora, cole o hash gerado na sua API de login.");
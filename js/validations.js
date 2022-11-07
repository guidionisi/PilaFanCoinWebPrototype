// Verifica se o endereço de email é um valor válido, ie, contem @ e .
function verificarEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

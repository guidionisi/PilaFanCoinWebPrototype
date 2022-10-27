//UTILITARIOS -----------------------------------------------------------------------
//pega a data atual
function getDate() {
  const date = new Date();
  return date;
}

//formata o valor da moeda
//retorna uma String no formato R$ 000.00
function formataMoeda(moeda) {
  //   console.log("chamou formata moeda");
  return `${moeda.currency} ${moeda.value.toFixed(2)}`;
}

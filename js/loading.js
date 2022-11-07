//faz o bloqueio da tela inserindo uma div com fundo semitransparente por cima do conteúdo

function mostrarLoading() {
  // cria o elemento div no html
  const div = document.createElement("div");
  // adiciona a classe ao elemento
  div.classList.add("loading");

  //cria o campo de texto
  const label = document.createElement("label");
  //adiciona o texto no elemento
  label.innerText = "Carregando ...";
  //adiciona o span como filho de div
  div.appendChild(label);
  //adiciona o elemento div como filho de body
  document.body.appendChild(div);
  setTimeout(() => esconderLoading(), 2000);
}

function esconderLoading() {
  const loadings = document.getElementsByClassName("loading"); //lista de todos os elementos com classe loading da tela
  //   console.log(loading);
  //se existe um elemento na lista, então remove
  if (loadings.length) {
    loadings[0].remove(); //remove o primeiro elemento da lista
  }
}

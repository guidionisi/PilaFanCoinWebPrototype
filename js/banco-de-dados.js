firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    console.log("UID do usuário logado : ", user.uid);
    getBlockchainData(); //carrega dados da blockchain
    getUserData(user.uid); //carrega dados do usuário
  } else {
    window.location.href = "../index.html";
  }
});

// pega o id do usuário logado passado na na url da página
const parametros = new URLSearchParams(window.location.search);
const uidParam = parametros.get("uid");

//faz a autenticação do usuário
// autenticacao();

//chama getUserData()
// getUserData(uidParam);

function autenticacao() {
  firebase
    .auth()
    // .signInWithEmailAndPassword("lara@rambo.com", "123456")
    .signInWithEmailAndPassword("lara@rambo.com", "123456")
    .then((resposta) => {
      console.log("Autenticação realizada com sucesso =>", resposta.user.email);
      //const uid = resposta.user.uid; //console.log(uid);
      getUserData(uid);
    })
    .catch((error) => {
      console.log("erro", error);
    });
}

//faz o logout do usuário
function logout() {
  firebase
    .auth()
    .signOut()
    .then(() => {
      window.location.href = "../index.html";
    })
    .catch(() => {
      alert("Erro ao fazer logout");
    });
}

//recebe do BD os dados do documento 'blockchain'
//retorna objetos cotacao, reau e pila
//o objeto tem as propriedades currency e value
function getBlockchainData() {
  firebase
    .firestore()
    .collection("blockchain")
    .get()
    .then((snap) => {
      snap.docs.forEach((dados) => {
        blockchain = dados.data(); //console.log("BLOCKCHAIN ", blockchain);
        atualizarDadosBlockchain();
      });
    });
}

//escreve no campo cotação do HTML os dados da Blockchain
// function atualizarDadosBlockchain(cotacao, real, pila) {
function atualizarDadosBlockchain() {
  console.log("COTACAO BLOCK: ", blockchain.cotacao.value);
  console.log("REAL BLOCK: ", blockchain.real.value);
  console.log("PILA BLOCK: ", blockchain.pila.value);
  html.cotacao.innerText = formataMoeda(blockchain.cotacao); //deve ser passado um objeto={currency, value}
  html.blockchainReal.innerText = blockchain.real.value;
  html.blockchainPila.innerText = blockchain.pila.value;
}

//recebe do BD os dados do documento 'users'
//a função autenticacao() chama essa função passando como parâmetro o uid do usuário que fez login
function getUserData(uid) {
  console.log("UID =>", uid);

  firebase
    .firestore()
    .collection("users")
    .where("user.uid", "==", uid)
    .get()
    .then((snap) => {
      snap.docs.forEach((dados) => {
        user = dados.data(); //retorna objeto user com atributos currency e value
        userDocId = dados.id; //pega o id do documento que pertence ao usuário logado
        atualizarDadosUsuario();
      });
    });
}

//atualiza os dados do usuário no HTML com os dados vindos do BD
//essa função é chamada pela getUserData() que retorna o objeto user
//user tem o formato user:{
//pila:{currency, value},
//reau:{currency, value},
//user:{nome, sobrenome, uid}
//}
function atualizarDadosUsuario() {
  // console.log("USER NAME: ", user.user.nome, user.user.sobrenome);
  // console.log("USER PILA: ", user.pila.value);
  // console.log("USER REAU: ", user.reau.value);
  // console.log("USER DOC ID: ", userDocId);

  //calcula o patrimônio
  const patrimonio =
    user.pila.value * blockchain.cotacao.value + user.reau.value;

  //atualiza os campos no html
  html.userName.innerText = user.user.nome;
  html.userPatrimonio.innerText = `${patrimonio.toFixed(2)}`;
  html.userPila.innerText = `${user.pila.value.toFixed(2)}`;
  html.userReal.innerText = `${user.reau.value.toFixed(2)}`;
}

//-------------------------------------------operações--------------------------------------------------------

//------------------------------------------ações do botão COMPRAR ----------------------------------------------------
function queroComprar() {
  const pilas = Number(html.pilasComprados.value);
  const cotacao = blockchain.cotacao.value;

  //calcula o valor em reais de compra atualizado pela cotação
  const montante = pilas * cotacao;

  if (montante <= user.reau.value) {
    html.pilasComprados.value = ""; //limpa o campo
    html.errorMsgComprar.style.display = "none";

    //saída de controle
    console.log(
      "Você comprou " + pilas + " pilas" + " = " + montante + " reais"
    );

    //---------------------------------------------------------------------
    const pilasAtualizados = pilas + user.pila.value;
    const reaisAtualizados = user.reau.value - montante;

    //cria e retorna o objeto usuario que será enviado para o firebase
    const usuario = createUserObject(pilasAtualizados, reaisAtualizados);

    recalcBlockchain(montante, pilas);
    //salva o objeto atualizacao no BD
    updateUser(usuario);
  } else {
    console.log("Saldo insuficiente!");
    html.errorMsgComprar.style.display = "block";
  }
}

//------------------------------------------ações do botão VENDER ----------------------------------------------------
function queroVender() {
  //pega o valor digitado no input
  const pilas = Number(html.pilasVendidos.value);

  //calcula o valor em reais atualizado pela cotação
  const cotacao = blockchain.cotacao.value;
  const montante = pilas * cotacao;

  //verifica se tem pilas suficientes para venda
  if (pilas <= user.pila.value) {
    document.getElementById("vender-pila").value = ""; //limpa o campo
    html.errorMsgVender.style.display = "none";
    //saída de controle
    console.log(
      "Você vender " + pilas + " pilas" + " = " + montante + " reais"
    );

    //----
    const pilasAtualizados = user.pila.value - pilas;
    const reaisAtualizados = user.reau.value + montante;

    //cria o objeto que será enviado para o firebase
    const usuario = createUserObject(pilasAtualizados, reaisAtualizados);

    //atualiza a blockchain
    recalcBlockchain(-montante, -pilas);
    updateUser(usuario); //salva o objeto atualizacao no BD
  } else {
    console.log("Saldo insuficiente!");
    html.errorMsgVender.style.display = "block";
  }
}

//salva dados do usuário no BD
function updateUser(usuario) {
  const uid = firebase.auth().currentUser.uid;

  firebase
    .firestore()
    .collection("users")
    .doc(userDocId) //id do documento do usuário logado
    .update(usuario)
    .then(() => {
      console.log("Dados do usuário atualizados com sucesso.");
      getUserData(uid); //atualiza a página com os novos dados do usuário
    })
    .catch((error) => {
      console.log("Erro ao salvar no banco.");
      console.log(error);
    });
}

//salva dados da blockchain no BD
function updateBlockchain(blockchain) {
  firebase
    .firestore()
    .collection("blockchain")
    .doc("blockchain-data")
    .update(blockchain)
    .then(() => {
      console.log("Blockchain atualizada");
      getBlockchainData(); //atualiza os dados da blockchain na página
    })
    .catch((error) => {
      console.log("Erro ao atualizar Blockchain: ", error);
    });
}

//calcula os novos valores da Blockchain após uma operação de compra ou vendo do usuário
function recalcBlockchain(reais, pilas) {
  const montanteReal = Number(html.blockchainReal.innerText);
  const montantePila = Number(html.blockchainPila.innerText);

  const montantePilaAtualizado = montantePila - pilas;
  const montanteRealAtualizado = montanteReal + reais;

  const cotacaoAtualizada = novaCotacao(montantePila, pilas); //calcula a nova cotação
  console.log("############## cotacao atualizada", cotacaoAtualizada);

  blockchain = createBlockchainObject(
    cotacaoAtualizada,
    montantePilaAtualizado,
    montanteRealAtualizado
  );
  console.log("$$$$$$$$$$$$$$", blockchain);

  updateBlockchain(blockchain);
}

function novaCotacao(montantePila, pilas) {
  const cotacao = Number(html.cotacao.innerText.split(" ")[1]);

  //fator para ajuste da cotação -> caso limete a zero, a cotação precisa explodir para o infinito
  const fator = 10000 * Math.exp(-(montantePila - pilas)) + 1;
  // console.log("FATOR: ", fator);

  // console.log("antes ##", pilas);
  if (pilas < 0) {
    // pilas = pilas * -1; //garante que pilas seja positivo
  }
  // console.log("depois ##", pilas);

  //pega o percentual de pilas alterado em relação ao que havia na blockchain e soma/subtrai da cotação
  return (cotacaoAtualizada = cotacao + (pilas / montantePila) * fator);
}

//cria o objeto usuário clone do BD
function createUserObject(pilasAtualizados, reaisAtualizados) {
  return {
    user: {
      nome: user.user.nome,
      sobrenome: user.user.sobrenome,
      uid: firebase.auth().currentUser.uid,
    },
    pila: {
      currency: "PL$",
      value: pilasAtualizados,
    },
    reau: {
      currency: "R$",
      value: reaisAtualizados,
    },
  };
}

//cria o objeto blockchain clone do BD
function createBlockchainObject(cotacao, pila, real) {
  return {
    cotacao: {
      currency: "R$",
      value: cotacao,
      date: getDate(),
    },
    pila: {
      currency: "PL$",
      value: pila,
    },
    real: {
      currency: "R$",
      value: real,
    },
  };
}

//objetos da tela
let html = {
  cotacao: document.getElementById("cotacao-real"),
  blockchainReal: document.getElementById("montante-real"),
  blockchainPila: document.getElementById("montante-pila"),
  userName: document.getElementById("user-nome"),
  userSobrenome: document.getElementById("user-sobrenome"),
  userReal: document.getElementById("user-real"),
  userPila: document.getElementById("user-pila"),
  userPatrimonio: document.getElementById("user-patrimonio"),
  pilasComprados: document.getElementById("comprar-pila"),
  pilasVendidos: document.getElementById("vender-pila"),
  errorMsgComprar: document.getElementById("error-msg-comprar"),
  errorMsgVender: document.getElementById("error-msg-vender"),
};

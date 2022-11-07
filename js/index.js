//Verifica se já existe um usuário logado e redireciona à página home
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // alert("Usuário já está logado -> redirecionando para home");
    window.location.href = "./pages/home.html";
  }
});

//--------------------------------chamada de funções-----------------------------------//
// Verifica se o email digitado está vazio e se corresponde a um endereço válido
function onChangeEmail() {
  emailError();
  mudarEstadoBotao();
}
//Verifica se o campo senha está vazio
function onChangeSenha() {
  senhaError();
  mudarEstadoBotao();
}
//faz a autenticação do usuário
function login() {
  mostrarLoading();
  // faz uma autenticação
  firebase
    .auth()
    .signInWithEmailAndPassword(form.email().value, form.senha().value)
    .then((response) => {
      esconderLoading();
      const uid = response.user.uid; //console.log(uid);
      window.location.href = "./pages/home.html";
      //console.log(response);
    })
    .catch((error) => {
      esconderLoading();
      console.log("error", error);
      alert(getErrorMessage(error));
    });
}
//recebe o erro informado pelo firebase e retorna uma mensagem para o usuário
function getErrorMessage(error) {
  if (error.code == "auth/user-not-found") {
    return "Usuário não encontrado.";
  }
  if (error.code == "auth/wrong-password") {
    return "Senha incorreta.";
  } else {
    return error.message;
  }
}
//utiliza a função de recuperar senha do firebase
function recuperarSenha() {
  mostrarLoading();
  firebase
    .auth()
    .sendPasswordResetEmail(form.email().value)
    .then(() => {
      esconderLoading();
      console.log("Email enviado com sucesso.");
      alert("Email enviado com sucesso.");
    })
    .catch((error) => {
      esconderLoading();
      console.log(error);

      alert(getErrorMessage(error));
    });
}
//encaminha para página de registro de novo usuário
function registrar() {
  window.location.href = "./pages/registro.html";
}

//---------------------------------ações email----------------------------------//
//Verifica se o email inserido é vazio ou inválido ou não -> retorna TRUE ou FALSE
function isEmailValid() {
  const email = form.email().value;
  if (!email) {
    return false; //se vazio retorna false
  } else {
    return verificarEmail(email); //retorna true ou false
  }
}

// Mostrar/esconder mensagens de erros de email
function emailError() {
  const email = form.email().value;
  form.mensagemEmailVazio().style.display = email ? "none" : "block"; //substitui o if-else: se email = true, então "none", senão "block"

  const emailValid = isEmailValid(); //pega o retorno da função isEmailValid que é TRUE ou FALSE
  form.mensagemEmailInvalido().style.display = emailValid ? "none" : "block";
}

//---------------------------------ações senha----------------------------------//
//Verifica se a senha é válida/vazia
function isSenhaValid() {
  const senha = form.senha().value;
  if (!senha) {
    return false; //se vazio retorna false
  } else {
    return true; //retorna true ou false
  }
}
// Mostrar e esconder mensagens de erros de senha
function senhaError() {
  const senha = isSenhaValid();
  form.mensagemSenhaVazia().style.display = senha ? "none" : "block";
  if (!senha) {
    form.mensagemSenhaVazia().style.display = "block";
  } else {
    form.mensagemSenhaVazia().style.display = "none";
  }
}

//--------------------------------habilitar e desabilitar botões-----------------------------------//
// Habilitar/Desabilitar botão
function mudarEstadoBotao() {
  const emailValido = isEmailValid(); //pega o retorno da função isEmailValid que é TRUE ou FALSE
  form.botaoRecuperar().disabled = !emailValido;
  const senhaValida = isSenhaValid(); //pega o retorno da função isSenhaValid que é TRUE ou FALSE
  form.botoaEntrar().disabled = !senhaValida || !emailValido;
}

//------------------------------elementos da tela-------------------------------------//
//instancia os elementos da tela
const form = {
  email: () => document.getElementById("email"),
  mensagemEmailVazio: () => document.getElementById("email-vazio"),
  mensagemEmailInvalido: () => document.getElementById("email-invalido"),
  senha: () => document.getElementById("senha"),
  mensagemSenhaVazia: () => document.getElementById("senha-vazia"),
  botaoRecuperar: () => document.getElementById("botao-recuperar"),
  botoaEntrar: () => document.getElementById("botao-entrar"),
};

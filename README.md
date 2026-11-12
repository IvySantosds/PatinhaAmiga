# PatinhaAmiga

## Visão Geral e Requisitos

O PatinhaAmiga é um aplicativo para aproximar pessoas interessadas em adotar animais e ONGs. A pessoa usuária pode conhecer os animais disponíveis, favoritar os que gostou e enviar um pedido de adoção. A ONG acompanha os pedidos e cadastra os animais pelo painel de administrador.

O projeto foi desenvolvido como aplicativo móvel e atende a estes requisitos:

- Cadastro e login com e-mail e senha.
- Navegação entre as telas de usuário e de administrador.
- Leitura e gravação de dados em banco na nuvem.
- Exibição de fotos e informações dos animais.
- Uso de GPS, acelerômetro e retorno tátil do aparelho.
- Mensagens de carregamento, confirmação, erro e lista vazia.

## Tecnologias Utilizadas

- **JavaScript:** linguagem usada no código do aplicativo.
- **React Native:** construção das telas para Android e iOS.
- **Expo SDK 58:** execução e configuração do app.
- **React Navigation:** navegação em abas e entre telas.
- **Firebase Authentication:** cadastro e login.
- **Cloud Firestore:** dados de usuários, animais, ONGs, favoritos e pedidos.
- **AsyncStorage:** mantém a sessão do Firebase salva no aparelho.
- **`react-native-maps` e Expo Location:** mapa, coordenadas e localização do aparelho.
- **Expo Sensors:** leitura do acelerômetro para sortear um animal ao sacudir o celular.
- **Expo Haptics:** vibração tátil em ações como favoritar e enviar pedido.
- **Fredoka e Expo Vector Icons:** fonte e ícones usados na interface.
- **npm:** instalação das dependências do projeto.

## Funcionalidades

### Para quem quer adotar

- **Criar conta e entrar:** autentica pelo Firebase e cria um perfil em `usuarios/{uid}`.
- **Explorar animais:** mostra animais disponíveis em cartões com foto, nome, raça e idade.
- **Buscar e filtrar:** pesquisa por nome, raça, ONG ou cidade; a busca não diferencia maiúsculas e minúsculas nem exige acentos. Os filtros separam todos, cães, gatos e filhotes.
- **Ver detalhes:** apresenta informações do animal, dados de saúde e nome da ONG responsável.
- **Favoritar:** salva os animais na subcoleção `usuarios/{uid}/favoritos`. A lista acompanha as mudanças do Firestore.
- **Ver ONGs no mapa:** mostra os pontos cadastrados, enquadra as ONGs no mapa e apresenta cidade e endereço. Quando permitido, também mostra a localização do aparelho e a distância aproximada até a ONG. É possível ligar para a ONG.
- **Enviar pedido de adoção:** valida os dados essenciais e grava o pedido no Firestore para análise da ONG.
- **Acompanhar pedidos:** o perfil mostra a quantidade de pedidos e o status de cada um.
- **Sortear animal:** sacudir o aparelho na tela inicial abre os detalhes de um animal disponível.

### Para o administrador

- **Acompanhar pedidos:** consulta os pedidos pendentes, aprovados ou recusados.
- **Analisar pedido:** mostra os dados enviados pela pessoa interessada e permite aprovar ou recusar.
- **Aprovar adoção:** atualiza o status do pedido e marca o animal como indisponível.
- **Cadastrar animal:** grava os dados do animal no Firestore e associa o cadastro à ONG do administrador.

## Demonstração

[Assista à demonstração do PatinhaAmiga]([https://youtube.com/shorts/_WEwdj7bUUo?feature=share])


## Instalação e Execução

### Pré-requisitos

- Node.js e npm instalados.
- Um projeto no Firebase com Authentication e Cloud Firestore configurados.
- Expo Go em um celular ou um emulador Android/iOS para testar as funções nativas.

### Instalar e iniciar

Na pasta do projeto, instale as dependências:

```bash
npm install
```

Configure os dados do Firebase em `src/config/firebase.js` e inicie o servidor:

```bash
npx expo start
```

Leia o QR code com o Expo Go ou escolha um emulador no terminal do Expo. Para abrir no navegador, use:

```bash
npx expo start --web
```

Na versão web, a tela do mapa mostra a lista de ONGs e oferece um botão para abrir suas coordenadas no Google Maps. No Android e iOS, ela usa o mapa nativo e pode solicitar acesso à localização.

### Configurar o Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/).
2. Em **Authentication**, ative o provedor **E-mail/senha**.
3. Crie o banco em **Firestore Database**.
4. Copie a configuração do app Web do Firebase para `src/config/firebase.js`.
5. Configure regras que permitam ao usuário acessar seus próprios dados e que reservem alterações administrativas para contas cadastradas em `admins/{uid}`.

O app usa estas coleções e campos principais:

| Caminho | Campos principais |
| --- | --- |
| `animais/{id}` | `nome`, `especie`, `raca`, `idade`, `sexo`, `porte`, `vacinado`, `castrado`, `filhote`, `cidade`, `descricao`, `foto`, `ongId`, `ongNome`, `disponivel` |
| `ongs/{ongId}` | `nome`, `telefone`, `cidade`, `endereco`, `latitude`, `longitude` |
| `usuarios/{uid}` | `uid`, `email`, `nome`, `criadoEm` |
| `usuarios/{uid}/favoritos/{animalId}` | Dados do animal favoritado |
| `pedidos/{id}` | `uid`, dados do adotante, `animalId`, `animalNome`, `animalFoto`, `status`, datas |
| `admins/{uid}` | `ongId`, `ongNome` e `cidade` |

Latitude e longitude devem ser números, por exemplo `-23.5505` e `-46.6333`. O campo `ongId` do admin deve ser igual ao ID do documento da ONG em `ongs`.

### Criar um administrador e cadastrar uma ONG

1. Crie uma conta pelo app ou no Firebase Authentication.
2. Copie o UID da conta e crie `admins/{uid}` no Firestore.
3. Preencha nesse documento `ongId`, `ongNome` e `cidade`.
4. Crie `ongs/{ongId}` usando o mesmo ID e preencha `nome`, `cidade`, `endereco`, `telefone`, `latitude` e `longitude`.

O documento em `admins` libera o painel administrativo para aquela conta. O documento em `ongs` fornece os dados de localização e contato exibidos no mapa.

## Aprendizados e Próximos Passos

Durante o desenvolvimento, foram praticados a criação de telas móveis, a navegação entre diferentes fluxos, a autenticação de usuários e a gravação de dados no Firestore. O projeto também integrou recursos do aparelho, como GPS, acelerômetro e vibração, e mostrou a importância de validar dados e apresentar mensagens para cada situação.

Como próximos passos, o projeto pode receber:

- Gravação e inclusão de um vídeo ou GIF de demonstração.
- Testes em aparelhos Android e iOS diferentes.
- Cadastro e edição de ONGs por uma tela administrativa.
- Envio de fotos para armazenamento na nuvem, em vez de depender de links externos.
- Testes automatizados e revisão das regras do Firestore antes de uma publicação.

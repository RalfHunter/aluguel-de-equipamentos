# Aluguel de Equipamentos

<p style="margin: 0 auto;">
<img src="./images/logo.png" alt="logoLocaFácil" width="1000" />
</p>


## 📌 Objetivo do Projeto
O projeto **ALOCA FÁCIL** tem como objetivo desenvolver uma solução digital, em formato mobile, voltada para o aluguel de equipamentos diversos — como ferramentas, eletrônicos e itens profissionais — por meio de uma plataforma colaborativa, onde qualquer usuário pode se cadastrar e anunciar seus próprios equipamentos para alugar, visando oferecer uma alternativa prática, econômica e segura tanto para quem deseja alugar quanto para quem deseja obter renda extra com itens que possui.

## Funcionalidades
* Cadastro e autenticação de usuários (locadores e locatários)
* Anúncio de equipamentos para aluguel
* Visualização e busca de equipamentos disponíveis
* Criação e gerenciamento de reservas
* Controle de permissões por tipo de usuário
* Histórico de aluguéis realizados e recebidos

## Tecnologias Utilizadas

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* Bcrypt
* Swagger
* Docker

### Desenvolvimento

* Jest
* ESLint
* Nodemon

## Requisitos
Para executar o projeto localmente ou em ambiente de produção, siga os passos abaixo. Certifique-se de configurar corretamente as variáveis de ambiente, conforme o arquivo .env.example localizado na raiz do projeto.

* Node.js
* MongoDB
<br/>

      #clone este repositório
      git clone <https://gitlab.fslab.dev/f-brica-de-software-ii-2025-1/aluguel-de-equipamentos>

      # Acesse a pasta do projeto no terminal/cmd
      aluguel-de-equipamentos

      # Instale as dependências com o comando
      npm install

      # Executar seeds para popular o banco
      npm run seed

      # Execute a aplicação em modo de desenvolvimento
      npm run dev

## Para executar o docker
* Ter docker instalado

        # Subir o container
        docker-compose up -d

        # Parar o container
        docker-compose down

        # Reconstruir e subir
        docker-compose up --build

## Para executar os testes

    # Executar todos os testes
    npm run test



## Equipe

| NOME                | Função   | E-MAIL                 |
| :------------------ | :------ | :--------------------- |
| Danielle Melo | Analista | danielle.melo@estudante.ifro.edu.br |
| Taline Rodrigues | Analista | talinefranca32@gmail.com |
| Silvio Ruan | Analista | silviohuan@gmail.com |

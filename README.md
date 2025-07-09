# Aluguel de Equipamentos

<p style="margin: 0 auto;">
<img src="./images/logo.png" alt="logoLocaFácil" width="1000" />
</p>


## 📌 Objetivo do Projeto
O projeto **ALOCA FÁCIL** tem como objetivo desenvolver uma solução digital, em formato mobile, voltada para o aluguel de equipamentos diversos — como ferramentas, eletrônicos e itens profissionais — por meio de uma plataforma colaborativa, onde qualquer usuário pode se cadastrar e anunciar seus próprios equipamentos para alugar, visando oferecer uma alternativa prática, econômica e segura tanto para quem deseja alugar quanto para quem deseja obter renda extra com itens que possui.

## Funcionalidades
<li>Cadastro e autenticação de usuários (locadores e locatários)</li>
<li>Anúncio de equipamentos para aluguel</li>
<li>Visualização e busca de equipamentos disponíveis</li>
<li>Criação e gerenciamento de reservas</li>
<li>Controle de permissões por tipo de usuário</li>
<li>Histórico de aluguéis realizados e recebidos</li>

## Tecnologias Utilizadas

### Backend

<li>Node.js</li>
<li>Express.js</li>
<li>MongoDB</li>
<li>Mongoose</li>
<li>JWT</li>
<li>Bcrypt</li>
<li>Swagger</li>
<li>Docker</li>

### Desenvolvimento

<li>Jest</li>
<li>ESLint</li>
<li>Nodemon</li>

## Requisitos
Para executar o projeto localmente ou em ambiente de produção, siga os passos abaixo. Certifique-se de configurar corretamente as variáveis de ambiente, conforme o arquivo .env.example localizado na raiz do projeto.

<li>Jest</li>
<li>ESLint</li>
<li>Nodemon</li>
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
<li>Ter docker instalado</li>

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

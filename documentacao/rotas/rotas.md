## 1. Login de Usuário

### 1.1 POST /login 

#### Caso de Uso
- Permitir que os usuários (ou sistemas externos) entrem no sistema e obtenham acesso às funcionalidades internas.

#### Regras de Negócio
- Verificação de Credenciais: Validar login/senha.
- Bloqueio de Usuários:  Impedir o acesso de usuários desativados ou não confirmados.
- Gestão de Tokens: Gerar e armazenar tokens de acesso e refresh de forma segura, permitindo revogação futura.

#### Resultado Esperado
- Retorno dos tokens de acesso e refresh.
- Em caso de erro, mensagem de erro: "E-mail já cadastrado" ou "Dados inválidos".

### 1.2 POST  /register

#### Caso de Uso
- Permitir que novos usuários se cadastrem no sistema para acessar as funcionalidades do aplicativo, criando uma conta com suas informações pessoais.

#### Regras de Negócio
- Validação de Dados: Verificar se os campos obrigatórios (nome, e-mail, senha, telefone) 
- Confirmação de Cadastro: Enviar um e-mail de confirmação com um link para validar a conta antes de permitir o login
- Criptografia de Senha: Armazenar a senha de forma segura.

#### Caso de Uso
- Usuário cadastrado com sucesso.
- Em caso de erro, mensagem de erro: "E-mail já cadastrado" ou "Dados inválidos".


## 2. Equipamentos

### 2.1 POST /equipamentos

#### Caso de Uso
Criar um novo equipamento para locação.

#### Regras de Negócio
- Todos os campos são obrigatórios.
- Apenas locador autenticado pode cadastrar.
- `equiValorDiaria` deve ser um número maior que 0.
- `equiQuantidadeDisponivel` deve ser um número inteiro não negativo.
- `equiFotos` deve conter pelo menos uma foto, enviada como arquivo com formato válido (JPEG, PNG ou RIFF).
- Equipamento criado com status pendente.

#### Resultado Esperado
- Equipamento criado, aguardando aprovação.
- Em caso de erro, ex.: campos inválidos, falta de fotos, ou formato inválido, retorna erro e o equipamento não será cadastrado.

### 2.2 GET /equipamentos

#### Caso de Uso
Listar equipamentos cadastrados.

#### Regras de Negócio
- Filtros: categoria, faixa de valor.
- Paginação: parâmetros page e limite, limite máximo 100.
- Status pendente: restrito a administradores.
- Não retorna equipamentos inativos ou pendentes para usuários comuns.

#### Resultado Esperado
Lista paginada de equipamentos.

### 2.3 GET /equipamentos/:id

#### Caso de Uso
Obter equipamento por ID.

#### Regras de Negócio
- ID deve ser válido.
- Retorna apenas equipamentos com qualquer status para o usuário dono do equipamento.

#### Resultado Esperado
Equipamento específico.

### 2.4 PATCH /equipamentos/:id

#### Caso de Uso
Atualizar equipamento.

#### Regras de Negócio
- ID deve ser válido.
- Apenas locador pode editar.
- Permite atualizar apenas valor diária e quantidade disponível.
- Equipamento pendente e inativo não podem ser atualizados.

#### Resultado Esperado
Equipamento atualizado.

### 2.5 PATCH /equipamentos/:id/aprovar

#### Caso de Uso
Aprovar equipamento pendente.

#### Regras de Negócio
- ID deve ser válido.
- Apenas administradores podem aprovar.
- Equipamento deve estar pendente.

#### Resultado Esperado
Equipamento aprovado.

### 2.6 PATCH /equipamentos/:id/reprovar

#### Caso de Uso
Reprovar equipamento pendente.

#### Regras de Negócio
- ID deve ser válido.
- Apenas administradores podem reprovar.
- Equipamento deve estar pendente.
- Equipamento deve ser excluído do banco após reprovação.

#### Resultado Esperado
Equipamento reprovado e excluído.

## 3. Reservas

### 3.1 POST /reservas

#### Caso de Uso
- Criar uma nova reserva de equipamento com base nas informações fornecidas pelo usuário.

#### Regras de Negócio
- O usuário solicitante deve estar cadastrado.
- Campos obrigatórios: `dataInicial`, `dataFinal`, `quantidadeEquipamento`, `valorEquipamento`, `enderecoEquipamento`, `equipamento`, `usuario`.
- `quantidadeEquipamento` deve ser um número inteiro positivo.
- `dataInicial` e `dataFinal` devem ser datas válidas.
- `dataInicial` não pode ser no passado
- Verificar se `equipamento` existe.
- Retornar erro se equipamento não existir
- Não permitir reservas sobrepostas para o mesmo equipamento no período solicitado.

#### Resultado Esperado
- Reserva criada com status "pendente" até a aprovação do locador.

### 3.2 GET /reservas

#### Caso de Uso
- Listar reservas do usuário ou dos seus equipamentos.

#### Regras de Negócio
- Filtrar por status.
- Filtrar por datas.
- Filtrar por usuário e equipamento.

#### Resultado Esperado
- Lista dos equipamentos reservados. 

### 3.3 GET /reservas/:id

#### Caso de Uso
- Obter os detalhes de uma reserva específica com base no identificador único (id) fornecido.

#### Regras de Negócio
- O parâmetro :id deve ser um valor válido.
- Caso o :id seja inválido (formato incorreto ou vazio), retornar erro.

#### Resultado Esperado
- Retorna os dados completos de uma reserva específica em formato JSON.
- Em caso de erro, retorna o código de status apropriado.

### 3.4 PATCH /reservas/:id

#### Caso de Uso
- Atualizar parcialmente os dados de uma reserva específica com base no identificador único (id) fornecido

#### Regras de Negócio
- O parâmetro :id deve ser um valor válido.
- Caso o :id seja inválido (formato incorreto ou vazio), retornar erro.
- Verificar se existe uma reserva associada ao :id fornecido.

#### Resultado Esperado
- Dados completos da reserva atualizada em JSON.    
- Códigos de erro apropriados com mensagens claras.

## 4. Usuario

### 4.1 GET /usuario/:id

#### Caso de Uso
- Obter detalhes de um usuário específico.

#### Regras de Negócio
- Validação de Existência: verificar se o usuário existe.
- Controle de Permissão: o próprio usuário ou administradores podem visualizar.

#### Resultado Esperado
- Detalhamento completo: nome, e-mail, status, foto.
- Erro caso não encontrado ou sem permissão.

### 4.2 PATCH /usuario/:id

#### Caso de Uso
- Atualizar informações do usuário.

#### Regras de Negócio
- Garantir a existência do usuário.
- Garantir que os dados estejam em formato válido. 

#### Resultado Esperado
- Dados atualizados com sucesso.
- Erro em caso de duplicidade ou violação de regras.

## 5. Avaliações

### 5.1 GET /avaliacoes

#### Caso de Uso
- Listar avaliações feitas em um determinado equipamento.

#### Regras de Negócio
- Obrigatório fornecer equipamentoId via query params.
- Permite ordenação por nota ordenarPorNota=mais-relevantes ou menos-relevantes.
- Permite filtros como notaMinima e notaMaxima.

#### Resultado Esperado
- Lista de avaliações do equipamento especificado com metadados de paginação.
- Mensagem de nenhuma avaliação encontrada para esse equipamento.

### 5.2 POST /avaliacoes

#### Caso de Uso
- Permitir que um usuário avalie um equipamento após utilizá-lo.

#### Regras de Negócio
- Um usuário só pode avaliar um mesmo equipamento uma única vez.
- A nota deve ser um número de 1 a 5.
- O ID do usuário e do equipamento devem ser válidos.

#### Resultado Esperado
- Avaliação registrada e associada ao equipamento.
- A nota média do equipamento será recalculada automaticamente.
- Em caso de erro (como avaliação duplicada), retornar mensagem de erro.   

### 5.3 PATCH /avaliacoes/:id

#### Caso de Uso
- Permitir que o próprio usuário atualize sua avaliação.

#### Regras de Negócio
- Apenas o autor da avaliação pode editá-la.
- IDs devem ser válidos.
- A nota média do equipamento será recalculada após a atualização.

#### Resultado Esperado
- Avaliação atualizada com sucesso.
- Média do equipamento ajustada.
- Em caso de tentativa de edição por outro usuário, retornar mensagem de erro.   

### 5.4 DELETE /avaliacoes/:id

#### Caso de Uso
- Permitir que o apenas o administrador remova avaliações.

#### Regras de Negócio
- Apenas usuários com permissão de administrador (tipoUsuario: "admin") podem excluir avaliações.
- O ID da avaliação deve ser válido.
- A média do equipamento será recalculada após a exclusão.

#### Resultado Esperado
- Avaliação removida com sucesso.
- Equipamento atualizado com nova média.
- Em caso de acesso não autorizado, retornar mensagem de erro.   

## Considerações Finais

- Segurança: Implementação de mecanismos de autenticação, autorização e registro de logs.

- Validação e Tratamento de Erros: Validar entradas dos usuários e retornar mensagens de erro claras.

- Escalabilidade e Performance: Aplicação de filtros, paginação e caching para otimizar o desempenho.

- Documentação e Monitoramento: Manter uma documentação atualizada dos endpoints e monitorar as requisições.






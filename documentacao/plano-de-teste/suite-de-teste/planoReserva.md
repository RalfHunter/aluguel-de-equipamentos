# Plano de Teste para Model (Srint 5) 

| Funcionalidade          | Comportamento Esperado                                                          | Verificações                                                  | Critérios de Aceite                                                          |
| ----------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Cadastro de reserva       | Uma reserva só pode ser cadastrada se possuir dataInicial, dataFinal, quantidadeEquipamento, valorEquipamento, enderecoEquipamento, equipamentos, e usuarios                      | Tentar salvar reserva sem dataInicial, dataFinal, quantidadeEquipamento, valorEquipamento, enderecoEquipamento, equipamentos, ou usuarios                  | A operação deve falhar com erro de validação (`required`)               |
| Cadastro válido         | Uma reserva com todos os campos obrigatórios preenchidos corretamente deve ser salva com sucesso   | Inserir uma reserva com dataInicial, dataFinal, quantidadeEquipamento, valorEquipamento, enderecoEquipamento, equipamentos, e usuarios válidos | A reserva é salva e retornada com `_id`, `createdAt` e `updatedAt`          |
| Valor padrão statusReserva | Ao cadastrar uma reserva sem informar statusReserva, o valor padrão deve ser `pendente` | Cadastrar uma reserva sem o campo statusReserva                 | O campo statusReserva deve estar como `pendente` no documento salvo             |
| Registro de timestamps  | O sistema deve registrar automaticamente as datas de criação e atualização      | Cadastrar uma reserva e verificar `createdAt` e `updatedAt`      | Os campos `createdAt` e `updatedAt` existem e são preenchidos corretamente com instâncias de Date  |
| Validação de quantidadeEquipamento     | A quantidade de equipamento deve ser um número inteiro positivo maior que 0                             | Tentar salvar uma reserva com quantidadeEquipamento igual a 0 ou negativo          | A operação deve falhar com erro de validação                         |


# Plano de Teste para Controller (Srint 5) 

| Funcionalidade          | Comportamento Esperado                                                          | Verificações                                                  | Critérios de Aceite                                                          |
| ----------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Listagem de reservas      | O sistema deve retornar todas as reservas cadastradas                     | Fazer chamada ao método listar sem parâmetros            | A resposta contém um array com as reservas cadastradas e `status 200`               |
| Listagem por ID        | O sistema deve retornar uma reserva específica pelo ID   | Fazer chamada ao método listar com params.id válido | A resposta contém os dados da reserva e `status 200`        |
| Listagem com filtros | O sistema deve retornar reservas filtradas por queries `(ex.: dataInicial)` | Fazer chamada ao método listar com query.dataInicial                 | A resposta contém um array com reservas filtradas e `status 200`             |
| Criação de reserva  | Uma reserva com dados válidos deve ser criada com sucesso      | Fazer chamada ao método criar com body contendo todos os campos obrigatórios      | A reserva é criada, retornada com `status 201`, e contém os dados enviados  |
| Atualização de reserva     | Deve ser possível atualizar informações de uma reserva existente                            | Fazer chamada ao método atualizar com params.id e body com novos dados (ex.: status, quantidadeEquipamento)    | A reserva reflete os dados alterados, updatedAt é atualizado, e `status 200` é retornado                         |
| Validação de ID na atualização     | A tentativa de atualizar uma reserva com ID inválido deve falhar                           | Fazer chamada ao método atualizar com params.id inválido    | A operação deve lançar um erro                         |

# Plano de Teste para Repository (Srint 5) 

| Funcionalidade          | Comportamento Esperado                                                          | Verificações                                                  | Critérios de Aceite                                                          |
| ----------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Listagem por ID      | O sistema deve retornar uma reserva pelo ID com populate                    | Fazer chamada ao método listar com req.params.id            | A reserva é retornada com dados populados de equipamentos e usuarios               |
| Listagem por ID não encontrado      | A tentativa de listar uma reserva com ID inexistente deve falhar   | Fazer chamada ao método listar com req.params.id inexistente | A operação lança um erro CustomError com `status 404`        |
| Criação de reserva | Uma nova reserva deve ser criada com dados válidos | Fazer chamada ao método criar com dados válidos                 | A reserva é salva e retornada com _id             |
| Atualização de reserva      | Uma reserva existente deve ser atualizada com novos dados      | Fazer chamada ao método atualizar com ID e novos dados      |A reserva reflete os dados alterados e é retornada  |
| Atualização de reserva não encontrada    | A tentativa de atualizar uma reserva inexistente deve falhar                            | Fazer chamada ao método atualizar com ID inexistente     | A operação lança um erro CustomError com `status 404`                          |
| Busca de reservas sobrepostas     | O sistema deve encontrar reservas sobrepostas para um equipamento em um período                           | Fazer chamada ao método findReservasSobrepostas com equipamentoId, dataInicial, e dataFinal   | A resposta contém um array com reservas sobrepostas                         |

# Plano de Teste para Service (Srint 5) 

| Funcionalidade          | Comportamento Esperado                                                          | Verificações                                                  | Critérios de Aceite                                                          |
| ----------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Listagem de reservas     | O sistema deve retornar todas as reservas                    | Chamar método listar sem filtros           | A resposta contém um array com todas as reservas               |
| Criação de reserva válida      | Uma reserva com dados válidos deve ser criada   | Chamar método criar com dados válidos, incluindo equipamento existente e sem reservas sobrepostas | A reserva é criada e retornada       |
| Validação de dataInicial                      |   A data inicial não pode ser no passado ou posterior à data final              | Chamar método criar com dataInicial no passado ou >= dataFinal | A operação lança um erro CustomError com `status 400` | 
| Validação de dataFinalAtrasada     | A data final atrasada deve ser posterior à data final                           | Chamar método criar com dataFinalAtrasada <= dataFinal   | A operação lança um erro CustomError com `status 400` |      
| Validação de quantidadeEquipamento     | A quantidade deve ser um número inteiro positivo                           | Chamar método criar com quantidadeEquipamento <= 0   | A operação lança um erro CustomError com `status 400` |  
| Validação de equipamento     | O equipamento deve existir e o ID deve ser válido                           | Chamar método criar com equipamentoId inválido ou inexistente  | A operação lança um erro CustomError com `status 400 ou 404` |
| Validação de quantidade disponível   | A quantidade solicitada não pode exceder a disponível   | Chamar método criar com quantidadeEquipamento maior que equiQuantidadeDisponivel        | A operação lança um erro CustomError com `status 400`            | 
| Validação de reservas sobrepostas   | Não deve ser possível criar reservas sobrepostas para o mesmo equipamento      | Chamar método criar com período que se sobrepõe a uma reserva existente        | A operação lança um erro CustomError com `status 409`         | 
| Atualização de reserva   | Uma reserva existente deve ser atualizada com dados válidos      | Chamar método atualizar com ID e novos dados       | A reserva reflete os dados alterados e é retornada         |
| Verificação de existência   | A reserva deve existir para ser atualizada      | Chamar método ensureReservaExists com ID inexistente       | A operação lança um erro CustomError com `status 404`         |

# Plano de Teste Endpoints (Sprint 8)

| Funcionalidade          | Comportamento Esperado                                                          | Verificações                                                  | Critérios de Aceite                                                          |
| ----------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Listar todas as reservas    | Deve retornar todas as reservas via `GET /reservas`                   | Fazer requisição `GET /reservas`         | 	Resposta contém array com todas as reservas cadastradas e `status 200`             |
| Buscar reserva por ID	      | 	Deve retornar a reserva correta via `GET /reservas/:id`   | Fazer requisição `GET /reservas/:id` | 	Retorna a reserva correta ou `status 404` se não encontrada     |
| Listar reservas com filtros                   | Deve retornar reservas filtradas via `GET /reservas` com query params      | Fazer `GET /reservas?dataInicial=...` | Retorna array com reservas filtradas conforme query | 
| Criar reserva válida  | 	Deve criar reserva via POST /reservas com dados válidos                           | Fazer `POST /reservas` com todos os campos obrigatórios   | Reserva criada, retornada com _id, `status 201` | 
| Criar reserva com dados inválidos     | Não deve criar reserva com dados faltando ou inválidos                           | azer `POST /reservas` com campos obrigatórios faltando ou inválidos   | Retorna `erro 400` com mensagem de validação |  
| Criar reserva com data sobreposta   | Não deve permitir reserva em período já reservado para mesmo equipamento                           | Fazer `POST /reservas` com período que conflita com outra reserva  | Retorna `erro 409 conflito` |
| Atualizar reserva válida   | Deve atualizar reserva via PUT /reservas/:id com dados válidos   | CFazer `PATCH /reservas/:id` com novos dados válidos     | Reserva atualizada com sucesso, `status 200`            | 
| Atualizar reserva com ID inválido  | Não deve atualizar reserva com ID inválido      | Fazer `PUT /reservas/:idInválido`        | Retorna `erro 404`        | 

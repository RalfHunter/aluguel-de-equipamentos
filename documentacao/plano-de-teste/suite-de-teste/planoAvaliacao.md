# Plano de Teste para Model (Sprint 8)

| Funcionalidade                | Comportamento Esperado                                                    | Verificações                                              | Critérios de Aceite                                                      |
|------------------------------|---------------------------------------------------------------------------|-----------------------------------------------------------|---------------------------------------------------------------------------|
| Cadastro de avaliação        | Deve exigir os campos obrigatórios: nota, descrição, usuarios, equipamentos       | Tentar salvar avaliação sem algum campo obrigatório            | A operação falha com erro de validação (required)                        |
| Valor mínimo e máximo de nota| A nota deve ser entre 1 e 5                                               | Tentar salvar avaliação com nota menor que 1 ou maior que 5 | A operação deve falhar com erro de validação                            |
| Referência a usuário e equipamento | A avaliação deve conter referências válidas de usuário e equipamento | Inserir avaliação com IDs inválidos                       | A operação falha com erro de validação (ObjectId inválido)              |
| Registro de timestamps       | O sistema deve registrar createdAt e updatedAt automaticamente            | Criar uma avaliação e verificar os campos de timestamp    | Os campos createdAt e updatedAt existem e são instâncias de Date        |
| Relacionamento com populate  | Ao buscar avaliações, deve retornar nome do usuário e nome do equipamento associados | Buscar avaliações e verificar se os dados estão populados | Os dados retornam com as informações populadas                          |

---

# Plano de Teste para Controller (Sprint 8)

| Funcionalidade          | Comportamento Esperado                                                 | Verificações                                            | Critérios de Aceite                                                |
|-------------------------|------------------------------------------------------------------------|---------------------------------------------------------|---------------------------------------------------------------------|
| Listagem de avaliações  | O sistema deve retornar avaliações de um equipamento específico       | Chamar listar() com query equipamentoId válido          | A resposta retorna um array de avaliações com `status 200`           |
| Criação de avaliação    | Avaliação com nota e descrição válidas deve ser criada                | Chamar criar() com dados válidos e usuário autenticado  | Avaliação criada com sucesso e resposta `201`                        |
| Atualização de avaliação| Usuário deve poder atualizar apenas sua própria avaliação             | Chamar atualizar() com ID de avaliação e novo conteúdo  | Retorna avaliação atualizada e `status 200`                          |
| Exclusão de avaliação   | Apenas administradores podem excluir avaliações                       | Chamar remover() com token de admin e ID válido         | Avaliação removida com sucesso e `status 200`                        |
| Validação de IDs        | ID de avaliação ou equipamento inválidos devem ser tratados           | Chamar qualquer método com ObjectId inválido            | Retorna erro `400` indicando ID inválido                             |

---

# Plano de Teste para Repository (Sprint 8)

| Funcionalidade                 | Comportamento Esperado                                               | Verificações                                              | Critérios de Aceite                                                      |
|-------------------------------|----------------------------------------------------------------------|-----------------------------------------------------------|---------------------------------------------------------------------------|
| Listar avaliações             | Retornar avaliações filtradas e paginadas                           | Chamar listar() com query equipamentoId, notaMinima, notaMaxima | Retorna array paginado com avaliações e status `200`                |
| Criar nova avaliação          | Criar avaliação com dados válidos e equipamento existente           | Chamar criar() com dados válidos                          | A avaliação é salva, associada ao equipamento e retorna com _id          |
| Impedir duplicidade           | Usuário não pode avaliar o mesmo equipamento mais de uma vez        | Chamar criar() novamente com mesmo usuarioId e equipamentoId | Retorna erro `409 - Usuário já avaliou este equipamento`           |
| Atualizar avaliação           | Atualizar avaliação existente com novos dados                       | Chamar atualizar() com dados válidos e ID da avaliação    | Retorna avaliação com novos dados e status `200`                          |
| Atualizar avaliação inexistente | Não deve atualizar avaliação que não existe                       | Chamar atualizar() com ID inexistente                     | Retorna erro `404 - Avaliação não encontrada`                            |
| Excluir avaliação             | Deve excluir avaliação e recalcular média                           | Chamar remover() com ID válido                            | Avaliação é excluída e média de notas é atualizada                      |
| Excluir avaliação inexistente | Tentativa de excluir avaliação inexistente deve falhar              | Chamar remover() com ID inexistente                       | Retorna erro `404 `                                                        |

---

# Plano de Teste para Service (Sprint 8)

| Funcionalidade                 | Comportamento Esperado                                              | Verificações                                              | Critérios de Aceite                                                      |
|-------------------------------|---------------------------------------------------------------------|-----------------------------------------------------------|---------------------------------------------------------------------------|
| Listagem com equipamentoId    | Deve listar avaliações relacionadas ao equipamento informado       | Chamar listar() com equipamentoId                         | Retorna avaliações ou mensagem de "nenhuma avaliação encontrada"         |
| Criação com dados válidos     | Deve criar avaliação com nota e descrição válidos                  | Chamar criar() com dados válidos                          | A avaliação é criada e retornada com _id e timestamps                    |
| Validação de nota             | Nota deve estar entre 1 e 5                                        | Chamar criar() com nota fora do intervalo                 | Retorna erro `400 - nota inválida`                                         |
| Validação de duplicidade      | Impedir avaliações duplicadas do mesmo usuário para o mesmo equipamento | Chamar criar() duas vezes com os mesmos dados         | A segunda chamada retorna erro `409`                                       |
| Atualização com dados válidos | Deve atualizar avaliação existente e recalcular média              | Chamar atualizar() com novos dados                        | Avaliação atualizada e média alterada                                   |
| Atualização com ID inválido   | ID de avaliação inválido deve ser tratado                          | Chamar atualizar() com ID inválido                        | Retorna erro `400`                                                         |
| Exclusão de avaliação por admin ou moderador | Apenas administradores ou moderadores podem excluir avaliações                  | Chamar remover() com usuarioId que não existe ou não é admin | Retorna erro `403   `                                                   |

---

# Plano de Teste Endpoints (Sprint 8)

| Funcionalidade            | Comportamento Esperado                                                     | Verificações                                                    | Critérios de Aceite                                                                |
|---------------------------|----------------------------------------------------------------------------|------------------------------------------------------------------|-------------------------------------------------------------------------------------|
| Listar avaliações         | Retornar avaliações do equipamento via `GET /avaliacoes?equipamentoId=...`  | Fazer requisição GET com query válida                            | Retorna lista paginada de avaliações e `status 200`                                  |
| Criar avaliação válida    | Criar avaliação via `POST /avaliacoes` com dados válidos                    | Fazer POST com nota, descrição, equipamentoId e token válido     | Avaliação criada com sucesso e `status 201`                                          |
| Criar avaliação duplicada | Impedir que o mesmo usuário avalie o mesmo equipamento mais de uma vez    | Fazer POST duas vezes com os mesmos dados                        | Segunda tentativa retorna erro `409  `                                               |
| Atualizar avaliação válida| Atualizar avaliação via `PATCH /avaliacoes/:id`                             | Fazer PATCH com token do autor da avaliação                      | Avaliação atualizada com sucesso e `status 200`                                      |
| Atualizar com ID inválido | Não permitir atualização com ID inválido                                  | Fazer `PATCH /avaliacoes/idInvalido`                               | Retorna erro `400`                                                                    |
| Excluir avaliação válida  | Deletar avaliação via `DELETE /avaliacoes/:id` com token admin              | Fazer DELETE com token de admin e ID da avaliação                | Avaliação excluída com sucesso e `status 200`                                        |
| Excluir com permissão negada | Bloquear exclusão para usuários comuns                                | Fazer DELETE com token não admin                                | Retorna erro `403` - Apenas administradores podem remover avaliações                 |

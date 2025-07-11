# Documentação das Rotas

## 1. Autenticação (Auth)

### 1.1 POST /signup

#### Caso de Uso
- Registrar um novo usuário no sistema.

#### Regras de Negócio
- Não requer autenticação.
- Dados obrigatórios: nome, email, telefone, senha, dataNascimento, CPF.
- Email deve ser único no sistema.
- Telefone deve ser único no sistema.
- CPF deve ser único no sistema.
- Senha deve atender aos critérios de segurança.

#### Resultado Esperado
- Usuário registrado com sucesso e token de acesso retornado.
- Em caso de erro, mensagem de erro: "Email já cadastrado", "Telefone já cadastrado", "CPF já cadastrado" ou "Dados inválidos".

### 1.2 POST /login

#### Caso de Uso
- Realizar login de usuário no sistema.

#### Regras de Negócio
- Não requer autenticação.
- Dados obrigatórios: email e senha.
- Usuário deve estar ativo no sistema.
- Credenciais devem ser válidas.

#### Resultado Esperado
- Login realizado com sucesso e token de acesso retornado.
- Em caso de erro, mensagem de erro: "Credenciais inválidas", "Usuário inativo", "Dados inválidos" ou "Usuário não está cadastrado".

### 1.3 POST /revoke

#### Caso de Uso
- Revogar token de acesso do usuário.

#### Regras de Negócio
- Requer autenticação.
- Token deve ser válido.

#### Resultado Esperado
- Token revogado com sucesso.
- Em caso de erro, mensagem de erro: "Token inválido" ou "Não autorizado".

### 1.4 POST /logout

#### Caso de Uso
- Realizar logout do usuário do sistema.

#### Regras de Negócio
- Requer autenticação.
- Token deve ser válido.

#### Resultado Esperado
- Logout realizado com sucesso.
- Em caso de erro, mensagem de erro: "Token inválido" ou "Não autorizado".

### 1.5 POST /refresh

#### Caso de Uso
- Renovar token de acesso do usuário.

#### Regras de Negócio
- Requer token de refresh válido.
- Token de refresh não deve estar expirado.

#### Resultado Esperado
- Novo token de acesso gerado com sucesso.
- Em caso de erro, mensagem de erro: "Token de refresh inválido" ou "Token expirado".

### 1.6 POST /introspect

#### Caso de Uso
- Verificar informações do token de acesso.

#### Regras de Negócio
- Requer token de acesso.
- Token deve ser válido.

#### Resultado Esperado
- Informações do token retornadas com sucesso.
- Em caso de erro, mensagem de erro: "Token inválido" ou "Token expirado".

### 1.7 POST /recover

#### Caso de Uso
- Solicitar redefinição de senha via email.

#### Regras de Negócio
- Não requer autenticação.
- Email deve estar cadastrado no sistema.
- Usuário deve estar ativo.

#### Resultado Esperado
- Email de redefinição de senha enviado com sucesso.
- Em caso de erro, mensagem de erro: "Email não encontrado" ou "Usuário inativo".

### 1.8 PATCH /password/reset/token

#### Caso de Uso
- Redefinir senha do usuário usando token de redefinição.

#### Regras de Negócio
- Não requer autenticação.
- Token de redefinição deve ser válido e não expirado.
- Nova senha deve atender aos critérios de segurança.

#### Resultado Esperado
- Senha redefinida com sucesso.
- Em caso de erro, mensagem de erro: "Token inválido", "Token expirado" ou "Senha inválida".

## 2. Usuários

### 2.1 GET /usuarios

#### Caso de Uso
- Listar todos os usuários do sistema.

#### Regras de Negócio
- Apenas usuários autenticados podem acessar.
- Requer permissão de administrador ou moderador.
- Filtragem e paginação disponíveis.

#### Resultado Esperado
- Lista de usuários com informações básicas.
- Em caso de erro, mensagem de erro: "Não autorizado" ou "Permissão negada".

### 2.2 GET /usuarios/:id

#### Caso de Uso
- Buscar um usuário específico pelo ID.

#### Regras de Negócio
- Apenas usuários autenticados podem acessar.
- Requer permissão de administrador ou moderador.
- ID do usuário deve ser válido.

#### Resultado Esperado
- Dados do usuário solicitado.
- Em caso de erro, mensagem de erro: "Usuário não encontrado" ou "Permissão negada".

### 2.3 PATCH /usuarios/

#### Caso de Uso
- Atualizar dados do próprio usuário logado.

#### Regras de Negócio
- Apenas usuários autenticados podem acessar.
- Usuário só pode editar seus próprios dados.
- Campos editáveis: nome, telefone, dataNascimento.

#### Resultado Esperado
- Dados do usuário atualizados com sucesso.
- Em caso de erro, mensagem de erro: "Dados inválidos" ou "Não autorizado".

### 2.4 PATCH /usuarios/:id

#### Caso de Uso
- Alterar status do usuário (apenas administradores e moderadores).

#### Regras de Negócio
- Apenas usuários autenticados podem acessar.
- Requer permissão de administrador ou moderador.
- ID do usuário deve ser válido.

#### Resultado Esperado
- Status do usuário alterado com sucesso.
- Em caso de erro, mensagem de erro: "Usuário não encontrado" ou "Permissão negada".

### 2.5 POST /usuarios

#### Caso de Uso
- Criar um novo usuário no sistema.

#### Regras de Negócio
- Apenas usuários autenticados podem acessar.
- Requer permissão de administrador ou moderador.
- Dados obrigatórios: nome, email, telefone, senha, dataNascimento, CPF.
- Email deve ser único no sistema.
- Telefone deve ser único no sistema.
- CPF deve ser único no sistema.

#### Resultado Esperado
- Usuário criado com sucesso.
- Em caso de erro, mensagem de erro: "Email já cadastrado", "Telefone já cadastrado", "CPF já cadastrado" ou "Permissão negada".

### 2.6 POST /usuarios/:id/foto

#### Caso de Uso
- Fazer upload da foto do usuário.

#### Regras de Negócio
- Apenas usuários autenticados podem acessar.
- Usuário pode fazer upload de sua própria foto ou administradores/moderadores podem fazer upload para qualquer usuário.
- Arquivo deve ser uma imagem válida.
- Tamanho máximo do arquivo limitado.

#### Resultado Esperado
- Foto do usuário salva com sucesso.
- Em caso de erro, mensagem de erro: "Arquivo inválido", "Tamanho muito grande" ou "Permissão negada".

### 2.7 GET /usuarios/:id/foto

#### Caso de Uso
- Obter a foto do usuário.

#### Regras de Negócio
- Apenas usuários autenticados podem acessar.
- ID do usuário deve ser válido.

#### Resultado Esperado
- Foto do usuário retornada com sucesso.
- Em caso de erro, mensagem de erro: "Usuário não encontrado" ou "Foto não encontrada".

### 2.8 DELETE /usuarios/:id/foto

#### Caso de Uso
- Remover a foto do usuário.

#### Regras de Negócio
- Apenas usuários autenticados podem acessar.
- Usuário pode remover sua própria foto ou administradores/moderadores podem remover foto de qualquer usuário.
- ID do usuário deve ser válido.

#### Resultado Esperado
- Foto do usuário removida com sucesso.
- Em caso de erro, mensagem de erro: "Usuário não encontrado", "Foto não encontrada" ou "Permissão negada".

### 2.9 DELETE /usuarios/:id

#### Caso de Uso
- Deletar um usuário do sistema.

#### Regras de Negócio
- Apenas usuários autenticados podem acessar.
- Requer permissão de administrador ou moderador.
- ID do usuário deve ser válido.
- Usuário não pode deletar a si mesmo.

#### Resultado Esperado
- Usuário deletado com sucesso.
- Em caso de erro, mensagem de erro: "Usuário não encontrado", "Não é possível deletar o próprio usuário" ou "Permissão negada".

### 2.10 GET /perfil/

#### Caso de Uso
- Obter dados do perfil do usuário logado.

#### Regras de Negócio
- Apenas usuários autenticados podem acessar.
- Retorna dados do próprio usuário.

#### Resultado Esperado
- Dados do perfil do usuário retornados com sucesso.
- Em caso de erro, mensagem de erro: "Não autorizado" ou "Usuário não encontrado".

### 2.11 PATCH /perfil/

#### Caso de Uso
- Atualizar dados específicos do perfil do usuário logado.

#### Regras de Negócio
- Apenas usuários autenticados podem acessar.
- Usuário só pode editar seus próprios dados.
- Pelo menos um campo deve ser fornecido para atualização.

#### Resultado Esperado
- Dados do perfil atualizados com sucesso.
- Em caso de erro, mensagem de erro: "Dados inválidos" ou "Não autorizado".

### 2.12 DELETE /usuarios/:id

#### Caso de Uso
- Deletar um usuário do sistema.

#### Regras de Negócio
- Apenas usuários autenticados podem acessar.
- Requer permissão de administrador ou moderador.
- ID do usuário deve ser válido.
- Usuário não pode deletar a si mesmo.

#### Resultado Esperado
- Usuário deletado com sucesso.
- Em caso de erro, mensagem de erro: "Usuário não encontrado", "Não é possível deletar próprio usuário" ou "Permissão negada".

## 3. Grupos

### 3.1 GET /grupos

#### Caso de Uso
- Listar todos os grupos do sistema.

#### Regras de Negócio
- Apenas usuários autenticados podem acessar.
- Requer permissão de administrador.
- Filtragem e paginação disponíveis.

#### Resultado Esperado
- Lista de grupos com informações básicas.
- Em caso de erro, mensagem de erro: "Não autorizado" ou "Permissão negada".

### 3.2 GET /grupos/:id

#### Caso de Uso
- Obter informações específicas de um grupo.

#### Regras de Negócio
- Apenas usuários autenticados podem acessar.
- Requer permissão de administrador.
- ID do grupo deve ser válido.

#### Resultado Esperado
- Dados completos do grupo solicitado.
- Em caso de erro, mensagem de erro: "Grupo não encontrado" ou "Permissão negada".

### 3.3 POST /grupos

#### Caso de Uso
- Criar novo grupo no sistema.

#### Regras de Negócio
- Apenas usuários autenticados podem acessar.
- Requer permissão de administrador.
- Nome do grupo deve ser único.
- Validação de dados obrigatórios.

#### Resultado Esperado
- Grupo criado com sucesso.
- Em caso de erro, mensagem de erro: "Nome já existe" ou "Dados inválidos".

### 3.4 PUT /grupos/:id

#### Caso de Uso
- Atualizar grupo existente.

#### Regras de Negócio
- Apenas usuários autenticados podem acessar.
- Requer permissão de administrador.
- ID do grupo deve ser válido.
- Validação de dados obrigatórios.

#### Resultado Esperado
- Grupo atualizado com sucesso.
- Em caso de erro, mensagem de erro: "Grupo não encontrado" ou "Dados inválidos".

### 3.5 PATCH /grupos/:id

#### Caso de Uso
- Atualizar parcialmente dados de um grupo existente.

#### Regras de Negócio
- Apenas usuários autenticados podem acessar.
- Requer permissão de administrador.
- ID do grupo deve ser válido.
- Pelo menos um campo deve ser fornecido para atualização.
- Nome do grupo deve ser único (se fornecido).

#### Resultado Esperado
- Grupo atualizado com sucesso.
- Em caso de erro, mensagem de erro: "Grupo não encontrado", "Nome já existe" ou "Dados inválidos".

### 3.6 DELETE /grupos/:id

#### Caso de Uso
- Remover grupo do sistema.

#### Regras de Negócio
- Apenas usuários autenticados podem acessar.
- Requer permissão de administrador.
- ID do grupo deve ser válido.
- Grupo não pode ter usuários associados.

#### Resultado Esperado
- Grupo removido com sucesso.
- Em caso de erro, mensagem de erro: "Grupo não encontrado" ou "Grupo em uso".

## 4. Equipamentos

### 4.1 POST /equipamentos

#### Caso de Uso
Criar um novo equipamento para locação.

#### Regras de Negócio
- Todos os campos são obrigatórios.
- Apenas locador autenticado pode cadastrar.
- Valor diária deve ser número maior que 0.
- Quantidade deve ser número inteiro.
- Fotos: mínimo uma, formato JPEG, PNG ou RIFF.
- Equipamento criado com status pendente.

#### Resultado Esperado
Equipamento criado, aguardando aprovação.

### 4.2 GET /equipamentos

#### Caso de Uso
Listar equipamentos disponíveis para locação com filtros.

#### Regras de Negócio
- Usuário deve estar autenticado.
- Retorna apenas equipamentos aprovados.
- Filtros: categoria, preço, localização, disponibilidade.
- Paginação de resultados.

#### Resultado Esperado
Lista de equipamentos conforme filtros aplicados.

### 4.3 GET /equipamentos/:id

#### Caso de Uso
Visualizar detalhes de um equipamento específico.

#### Regras de Negócio
- Usuário deve estar autenticado.
- ID do equipamento deve ser válido.
- Retorna informações completas do equipamento.

#### Resultado Esperado
Dados detalhados do equipamento solicitado.

### 4.4 PUT /equipamentos/:id

#### Caso de Uso
Atualizar informações de um equipamento existente.

#### Regras de Negócio
- Usuário deve ser o proprietário do equipamento ou admin.
- Todos os campos são validados.
- Alterações passam por nova aprovação se necessário.

#### Resultado Esperado
Equipamento atualizado com sucesso.

### 4.5 DELETE /equipamentos/:id

#### Caso de Uso
Remover equipamento do sistema.

#### Regras de Negócio
- Apenas proprietário ou admin podem remover.
- Equipamento não pode ter reservas ativas.
- Remoção das fotos associadas.

#### Resultado Esperado
Equipamento removido com sucesso.

### 4.6 POST /equipamentos/:id/foto

#### Caso de Uso
Fazer upload de foto para o equipamento.

#### Regras de Negócio
- Apenas proprietário ou admin podem adicionar fotos.
- Formatos aceitos: JPG, PNG, WEBP.
- Compressão automática aplicada.
- Limite de fotos por equipamento.

#### Resultado Esperado
Foto adicionada com sucesso ao equipamento.

### 4.7 GET /equipamentos/:id/foto

#### Caso de Uso
Obter foto do equipamento.

#### Regras de Negócio
- Acesso público para visualização.
- Retorna primeira foto ou foto padrão.

#### Resultado Esperado
Imagem do equipamento retornada.

### 4.8 DELETE /equipamentos/:id/foto

#### Caso de Uso
Remover foto do equipamento.

#### Regras de Negócio
- Apenas proprietário ou admin podem remover.
- Remoção do arquivo físico do servidor.
- Manter pelo menos uma foto.

#### Resultado Esperado
Foto removida com sucesso.

## 5. Reservas

### 5.1 GET /reservas

#### Caso de Uso
Listar reservas do usuário ou todas (se admin).

#### Regras de Negócio
- Usuário deve estar autenticado.
- Usuários comuns veem apenas suas reservas.
- Admins veem todas as reservas.
- Filtros: status, data, equipamento.

#### Resultado Esperado
Lista de reservas conforme permissões e filtros.

### 5.2 GET /reservas/:id

#### Caso de Uso
Visualizar detalhes de uma reserva específica.

#### Regras de Negócio
- Usuário deve estar autenticado.
- Acesso apenas se for proprietário da reserva ou admin.
- ID da reserva deve ser válido.

#### Resultado Esperado
Dados detalhados da reserva solicitada.

### 5.3 POST /reservas

#### Caso de Uso
Criar nova reserva de equipamento.

#### Regras de Negócio
- Usuário deve estar autenticado.
- Equipamento deve estar disponível.
- Datas devem ser válidas e futuras.
- Verificação de conflitos de horário.

#### Resultado Esperado
Reserva criada com sucesso.

### 5.4 PUT /reservas/:id

#### Caso de Uso
Atualizar reserva existente.

#### Regras de Negócio
- Apenas proprietário da reserva pode alterar.
- Alterações permitidas apenas antes do início.
- Revalidação de disponibilidade.

#### Resultado Esperado
Reserva atualizada com sucesso.

### 5.5 DELETE /reservas/:id

#### Caso de Uso
Cancelar reserva existente.

#### Regras de Negócio
- Apenas proprietário pode cancelar.
- Cancelamento com antecedência mínima.
- Aplicação de políticas de cancelamento.

#### Resultado Esperado
Reserva cancelada com sucesso.

## 6. Avaliações

### 6.1 GET /avaliacoes

#### Caso de Uso
Listar avaliações dos equipamentos.

#### Regras de Negócio
- Usuário deve estar autenticado.
- Filtros: equipamento, nota, data.
- Paginação de resultados.

#### Resultado Esperado
Lista de avaliações conforme filtros aplicados.

### 6.2 GET /avaliacoes/:id

#### Caso de Uso
Visualizar detalhes de uma avaliação específica.

#### Regras de Negócio
- Usuário deve estar autenticado.
- ID da avaliação deve ser válido.
- Retorna informações completas da avaliação.

#### Resultado Esperado
Dados detalhados da avaliação solicitada.

### 6.3 POST /avaliacoes

#### Caso de Uso
Criar nova avaliação para equipamento.

#### Regras de Negócio
- Usuário deve ter usado o equipamento.
- Uma avaliação por usuário por equipamento.
- Nota deve ser entre 1 e 5.
- Comentário opcional.

#### Resultado Esperado
Avaliação criada com sucesso.

### 6.4 PUT /avaliacoes/:id

#### Caso de Uso
Atualizar avaliação existente.

#### Regras de Negócio
- Apenas autor da avaliação pode alterar.
- Prazo limite para edição.
- Validação de dados.

#### Resultado Esperado
Avaliação atualizada com sucesso.

### 6.5 DELETE /avaliacoes/:id

#### Caso de Uso
Remover avaliação do sistema.

#### Regras de Negócio
- Apenas autor ou admin podem remover.
- Remoção definitiva do sistema.

#### Resultado Esperado
Avaliação removida com sucesso.

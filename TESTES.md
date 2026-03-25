# Relatório de Testes - SenaX

Este documento descreve os testes realizados para garantir a conformidade com os requisitos do projeto "Conecta Escola".

## 1. Testes de Histórias de Usuário (HU)

| ID | Descrição | Resultado | Observação |
|:---|:---|:---:|:---|
| **HU01** | Cadastro de alunos | OK | Valida nome, e-mail, turma e senha. |
| **HU02** | Login/Logout | OK | Persistência de sessão funcionando via Firebase Auth. |
| **HU03** | E-mail institucional | OK | Bloqueia e-mails fora do padrão `@aluno.senai.br`. |
| **HU04** | Visualizar perfil | OK | Dados carregados dinamicamente do Realtime Database. |
| **HU05** | Editar perfil | OK | Edição de perfil como nome. |
| **HU06** | Criar postagens | OK | Suporta texto e upload de imagem via Cloudinary. |
| **HU07** | Listar postagens | OK | Aparecer postagens no feed. |
| **HU08** | Excluir postagens | OK | Excluir as postagens do usuário. |
| **HU09** | Curtir/Comentar | OK | Atualização em tempo real (Realtime). |
| **HU010** | Visualizar postagens por usuário | OK | Ver postagens de um usuário ao clicar em seu perfil |
| **HU11** | Acesso Restrito | OK | Usuário deslogado é expulso ao tentar acessar o feed. |

## 2. Testes de Segurança (Critérios Técnicos)

- **SQL Injection:** Protegido por arquitetura NoSQL (Firebase SDK).
- **XSS:** Testado com a inserção de tags `<script>` no campo de post; o código foi renderizado como texto puro, sem execução.
- **Inatividade:** Sistema de logout automático após 15 minutos de ausência de interação.
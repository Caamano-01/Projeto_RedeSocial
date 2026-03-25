# SenaX - Rede Social Escolar (baseada no X)

O **SenaX** é uma rede social interna desenvolvida para que alunos possam compartilhar ideias, divulgar trabalhos e interagir de forma responsável. O projeto simula uma aplicação real de mercado, focando em conexões rápidas e seguras entre a comunidade acadêmica.

---

## Sobre o Projeto

O Senax foi criado como um ambiente digital controlado onde apenas estudantes cadastrados podem interagir. Esta aplicação utiliza uma arquitetura Full Stack moderna para garantir performance e escalabilidade.

---

### Tecnologias
| Camada | Tecnologias |
|--------|-------------|
| **Front-end** | HTML, CSS, JavaScript |
| **Back-end** | JavaScript |
| **Banco de dados** | Realtime Database(Firebase) |

---

### Funcionalidades

- Cadastro (com criptografia de senha), login e logout
- Visualizar perfil, editar informações, foto de perfil
- Criar posts, listar no feed e excluir seus posts
- Curtir e comentar em posts
- Feed cronológico (do mais recente ao mais antigo)

---

### Estrutura do projeto
```text
├── assets/
│   ├── css/
│   │   ├── chat.css
│   │   ├── perfil.css
│   │   ├── style-index.css
│   │   └── style-pgInicial.css
│   ├── img/
│   │   ├── default-avatar.png
│   │   ├── logo-clara.png
│   │   ├── logo-escura.png
│   │   ├── S-logo-clara.png
│   │   └── S-logo-escura.png
│   └── js/
│       ├── auth.js
│       ├── busca.js
│       ├── chat.js
│       ├── comments.js
│       ├── feed.js
│       ├── firebase-config.js
│       ├── likes.js
│       ├── main.js
│       ├── perfil.js
│       ├── postRender.js
│       ├── posts.js
│       ├── seguindo.js
│       └── utils.js
├── public/
│   ├── chat.html
│   ├── page_inicial.html
│   └── perfil.html
└── index.html
````

---

### Segurança e boas práticas
Para atender aos requisitos de um ambiente escolar seguro, o SenaX implementa:
- **Ambiente Controlado:** Bloqueio de cadastros que não utilizem o domínio do senai via Firebase Security Rules.
- **Proteção contra XSS:** Sanitização de todas as entradas de texto (posts e comentários) através de escape de caracteres HTML.
- **Integridade de Dados:** Regras de banco NoSQL que garantem que apenas o autor de uma postagem possa excluí-la.
- **Sessão Segura:** Proteção de rotas que redireciona usuários não autenticados para a tela de login.

---

### Como executar
1. Clone o repositório.
2. Como o projeto utiliza módulos ES6 (`type="module"`), é necessário rodar através de um servidor local (ex: Extensão *Live Server* do VS Code).
3. Abra o arquivo `index.html` no navegador.

---

### Link do protótipo
#### https://www.canva.com/design/DAHC09K0sRQ/OYVol2nps79a50FNBhblDw/edit?utm_content=DAHC09K0sRQ&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton

---

## Testes automatizados

Os testes de aceitação foram realizados utilizando **Selenium IDE**. O arquivo de roteiro de testes (`SenaX_Testes.side`) está disponível na branch "tests" e cobre todas as 11 HUs listadas no relatório de testes.

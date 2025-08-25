# 📱 Rede Social em React Native

Uma aplicação completa de rede social desenvolvida em React Native com backend em Node.js, permitindo que usuários criem posts, comentem, curtam e interajam em uma plataforma social moderna e responsiva.

## 🚀 Funcionalidades

### 🔐 Autenticação
- **Registro de usuários** com validação de dados
- **Login seguro** com JWT (JSON Web Tokens)
- **Gerenciamento de sessão** persistente
- **Logout** com limpeza de dados locais

### 📝 Gestão de Posts
- **Criar posts** com texto e imagens
- **Visualizar feed** de posts em tempo real
- **Buscar posts** por título ou conteúdo
- **Upload de imagens** para posts
- **Paginação infinita** para melhor performance

### 💬 Sistema de Interações
- **Comentários** em posts
- **Sistema de likes** e dislikes
- **Favoritar posts** para visualização posterior
- **Visualização de detalhes** do post

### 👤 Perfil do Usuário
- **Editar perfil** (bio, foto de perfil)
- **Visualizar posts próprios**
- **Gerenciar conta**

### 🎨 Interface
- **Design responsivo** para diferentes tamanhos de tela
- **Tema personalizado** com cores consistentes
- **Animações suaves** e feedback visual
- **Navegação intuitiva** com React Navigation

## 🛠️ Tecnologias Utilizadas

### Frontend (React Native)
- **React Native** 0.79.3
- **Expo** ~53.0.10
- **React Navigation** 7.x (navegação entre telas)
- **Axios** (requisições HTTP)
- **AsyncStorage** (armazenamento local)
- **Expo Image Picker** (seleção de imagens)
- **TypeScript** (tipagem estática)

### Backend (Node.js)
- **Node.js** com Express.js
- **MySQL** (banco de dados)
- **JWT** (autenticação)
- **bcryptjs** (criptografia de senhas)
- **Multer** (upload de arquivos)
- **CORS** (configuração de origens)

### Banco de Dados
- **MySQL** com as seguintes tabelas:
  - `users` - dados dos usuários
  - `posts` - publicações
  - `comments` - comentários
  - `likes` - curtidas
  - `favorites` - posts favoritos

## 📁 Estrutura do Projeto

```
Rede-Social-em-React-Native/
├── app-forum/                    # Frontend React Native
│   ├── src/
│   │   ├── components/           # Componentes reutilizáveis
│   │   │   ├── CommentItem.js    # Item de comentário
│   │   │   ├── CustomButton.js   # Botão personalizado
│   │   │   ├── Header.js         # Cabeçalho da app
│   │   │   └── PostCard.js       # Card de post
│   │   ├── context/
│   │   │   └── AuthContext.js    # Contexto de autenticação
│   │   ├── screens/              # Telas da aplicação
│   │   │   ├── AuthStack.js      # Stack de autenticação
│   │   │   ├── EditProfileScreen.js
│   │   │   ├── HomeScreen.js     # Tela principal
│   │   │   ├── LoginScreen.js
│   │   │   ├── PostDetailScreen.js
│   │   │   ├── ProfileScreen.js
│   │   │   └── RegisterScreen.js
│   │   ├── services/
│   │   │   └── api.js            # Configuração da API
│   │   └── styles/
│   │       └── theme.js          # Tema e cores
│   ├── assets/                   # Recursos estáticos
│   ├── App.js                    # Componente principal
│   ├── package.json
│   └── forum_db.sql              # Script do banco de dados
│
└── server/                       # Backend Node.js
    ├── src/
    │   ├── controllers/          # Controladores das rotas
    │   │   ├── authController.js
    │   │   ├── commentController.js
    │   │   ├── postController.js
    │   │   ├── uploadController.js
    │   │   └── userController.js
    │   ├── middlewares/
    │   │   └── authMiddleware.js # Middleware de autenticação
    │   └── routes/               # Definição das rotas
    │       ├── authRoutes.js
    │       ├── commentRoutes.js
    │       ├── postRoutes.js
    │       ├── uploadRoutes.js
    │       └── userRoutes.js
    ├── uploads/                  # Arquivos enviados
    ├── db.js                     # Configuração do banco
    ├── server.js                 # Servidor principal
    └── package.json
```

## ⚙️ Instalação e Configuração

### Pré-requisitos
- Node.js (v16 ou superior)
- npm ou yarn
- MySQL (v8.0 ou superior)
- Expo CLI
- Android Studio ou Xcode (para emuladores)

### 1. Clone o repositório
```bash
git clone https://github.com/annaluizapm/Rede-Social-em-React-Native.git
cd Rede-Social-em-React-Native
```

### 2. Configuração do Banco de Dados
1. Instale e configure o MySQL
2. Crie o banco de dados executando o script:
```bash
mysql -u root -p < app-forum/forum_db.sql
```

### 3. Configuração do Backend
```bash
cd server
npm install
```

Crie um arquivo `.env` na pasta `server` com as configurações:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=forum_db
JWT_SECRET=seu_jwt_secret_aqui
PORT=3001
```

Inicie o servidor:
```bash
npm start
```

### 4. Configuração do Frontend
```bash
cd app-forum
npm install
```

Configure a URL da API em `src/services/api.js`:
```javascript
const API_URL = 'http://SEU_IP:3001/api';
```

Inicie a aplicação:
```bash
npm start
```

## 📱 Como Usar

### 1. Primeiro Acesso
1. Abra a aplicação no seu dispositivo/emulador
2. Clique em "Registrar" para criar uma nova conta
3. Preencha os dados solicitados
4. Faça login com suas credenciais

### 2. Navegação Principal
- **Home**: Feed principal com todos os posts
- **Perfil**: Visualize e edite seu perfil
- **Criar Post**: Botão flutuante para criar novos posts

### 3. Interações
- **Curtir**: Toque no ícone de coração
- **Comentar**: Toque no post para abrir os detalhes
- **Favoritar**: Use o ícone de estrela
- **Buscar**: Use a barra de pesquisa no topo

## 🔧 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Posts
- `GET /api/posts` - Listar posts
- `POST /api/posts` - Criar post
- `GET /api/posts/:id` - Detalhes do post
- `PUT /api/posts/:id` - Atualizar post
- `DELETE /api/posts/:id` - Deletar post

### Comentários
- `GET /api/comments/post/:postId` - Comentários do post
- `POST /api/comments` - Criar comentário
- `DELETE /api/comments/:id` - Deletar comentário

### Usuários
- `GET /api/users/profile` - Perfil do usuário
- `PUT /api/users/profile` - Atualizar perfil
- `POST /api/users/avatar` - Upload de avatar

## 🎨 Capturas de Tela

> 📸 *Adicione aqui capturas de tela da sua aplicação*

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👩‍💻 Autora

**Anna Luiza**
- GitHub: [@annaluizapm](https://github.com/annaluizapm)
- Email: annaluizapm2007@gmail.com

## 🚀 Próximas Funcionalidades

- [ ] Sistema de notificações push
- [ ] Chat privado entre usuários
- [ ] Compartilhamento de posts
- [ ] Sistema de hashtags
- [ ] Modo escuro
- [ ] Histórias (stories)
- [ ] Verificação de conta

## 🐛 Problemas Conhecidos

Se você encontrar algum problema, por favor:
1. Verifique se todas as dependências estão instaladas
2. Confirme se o banco de dados está configurado corretamente
3. Verifique se a URL da API está correta
4. Abra uma issue neste repositório

## 📚 Documentação Adicional

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [Express.js](https://expressjs.com/)
- [MySQL](https://dev.mysql.com/doc/)

---

⭐ Se este projeto te ajudou, não esqueça de dar uma estrela!

# Projeto-base — aplicação web

Aplicação responsiva com login, dashboard e cadastro de itens, construída sobre Create React App com React, TypeScript, Tailwind CSS, Lucide React e React Router. O login é simulado, sem backend, e persiste apenas o identificador do usuário (nunca a senha).

## Executar localmente

Instale as dependências com `npm install` e inicie o servidor de desenvolvimento:

```bash
npm start
```

Abra `http://localhost:3000`.

Sem uma sessão ativa, as rotas privadas redirecionam para `/login`. Após entrar, a opção “Cadastro de Itens” fica disponível na barra lateral. “Lembrar-me” mantém a sessão em `localStorage`; sem essa opção, ela usa `sessionStorage`. Para desenvolvimento, qualquer identificador válido e senha não vazia são aceitos pelo serviço simulado.

## Testes e build

```bash
npm test -- --watchAll=false
npm run build
```

A opção “Esqueci minha senha” está apontada para um endereço de suporte de exemplo e deve ser atualizada para o canal real do produto. “Meu perfil” e “Configurações” são itens visuais desabilitados até que essas páginas sejam implementadas.

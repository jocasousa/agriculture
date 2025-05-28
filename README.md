# Agriculture - Cadastro de Produtores Rurais

## 🌱 Apresentação

Sistema completo para gerenciamento de produtores rurais e suas propriedades, permitindo cadastrar produtores, propriedades, safras e culturas plantadas, além de apresentar dashboards e relatórios visuais.

Principais funcionalidades:
- Cadastro e edição de produtores (CPF/CNPJ), propriedades rurais, safras e culturas
- Validação das áreas e documentos (CPF/CNPJ)
- Relatórios com gráficos de uso do solo, culturas, estados e totais
- Backend escalável e testado em **NestJS** + **Postgres**
- Frontend moderno em **ReactJS + Vite + Redux**
- Testes automatizados no frontend e backend
- Containers Docker para fácil execução em qualquer ambiente

---

## 🚀 Como rodar o projeto completo via Docker

### **Pré-requisitos**
- [Docker](https://docs.docker.com/get-docker/) e [Docker Compose](https://docs.docker.com/compose/install/)

### **Passos para rodar tudo**
1. **Clone o repositório:**
   ```bash
   git clone https://github.com/jocasousa/agriculture.git
   cd agriculture
   ```

2. **Suba todos os containers (backend, frontend e postgres):**
   ```bash
   docker compose build --no-cache
   docker compose up
   ```

3. **Acesse:**
   - **Frontend:** [http://localhost:3000/](http://localhost:3000/)
   - **API Backend:** [http://localhost:3002/](http://localhost:3002/)
   - **Postgres:** (localhost:5432, user: postgres, password: postgres)

---

## 🖥️ Como rodar os projetos individualmente (sem Docker)

### **Backend**

```bash
cd backend
npm install
npm run migration:run
npm run test       # Para executar os testes do backend
npm run start:dev  # Ou npm run start:prod
```
- API ficará disponível em: [http://localhost:3002/](http://localhost:3002/)

---

### **Frontend**

```bash
cd frontend
npm install
npm run test        # Para executar os testes do frontend
npm run dev         # Para rodar local em desenvolvimento
```
- App disponível em: [http://localhost:5173/](http://localhost:5173/) (ou endereço mostrado pelo terminal)

---

## 🧪 Como executar os testes

### **Backend**
```bash
cd backend
npm run test
```

### **Frontend**
```bash
cd frontend
npm run test
```

---

## 🔑 Dados para acesso

- **Usuário admin:**  
  ```
  usuário: admin  
  senha:   123456
  ```

---

## ⚙️ Notas finais

- Os testes automatizados rodam tanto localmente quanto no Docker.
- Caso queira customizar variáveis de ambiente, edite o arquivo `.env` nas pastas **backend** e **frontend**.
- Em caso de erro no start do backend devido ao banco de dados, aguarde alguns segundos e rode `docker compose up` novamente, pois o banco pode demorar a inicializar.

---

> Qualquer dúvida técnica ou sugestão, entre em contato!  
> Projeto desenvolvido por **Joca**.

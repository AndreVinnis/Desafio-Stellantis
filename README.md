# Desafio Stellantis — Gestão de Veículos e Concessionárias

Aplicação full stack para cadastro, consulta, alteração e exclusão de veículos e concessionárias, com associação entre eles, autenticação JWT e preenchimento automático de endereço via ViaCEP.

Backend em **Java 21 + Spring Boot** expondo uma API REST, frontend em **React + TypeScript + Vite** consumindo essa API, e **MySQL** como banco relacional. Tudo sobe com um `docker compose up`.

---

## Índice

- [Stack](#stack)
- [Arquitetura](#arquitetura)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Como executar](#como-executar)
  - [Com Docker (recomendado)](#com-docker-recomendado)
  - [Localmente, sem Docker](#localmente-sem-docker)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Autenticação e perfis](#autenticação-e-perfis)
- [API](#api)
- [Modelo de dados](#modelo-de-dados)
- [Validações de negócio](#validações-de-negócio)
- [Tratamento de erros](#tratamento-de-erros)
- [Testes e cobertura](#testes-e-cobertura)
- [CI](#ci)
- [Decisões técnicas](#decisões-técnicas)

---

## Stack

### Backend

| Item | Versão / Escolha |
|---|---|
| Java | 21 |
| Spring Boot | 4.1.1 (Web MVC, Data JPA, Security, Validation, Actuator) |
| Persistência | Hibernate / JPA |
| Banco | MySQL 8.4 (H2 em memória nos testes) |
| Build | Maven (wrapper incluso) |
| Autenticação | JWT (jjwt 0.12.6) + BCrypt |
| Documentação | springdoc-openapi (Swagger UI) |
| Cobertura | JaCoCo |

### Frontend

| Item | Versão / Escolha |
|---|---|
| React | 19 |
| TypeScript | 5.9 |
| Build | Vite 8 |
| Dados / cache | TanStack Query (React Query) |
| Formulários | React Hook Form + Zod |
| Rotas | React Router 8 |
| UI | shadcn/ui + Tailwind CSS 4 |
| HTTP | Axios |
| Feedback | Sonner (toasts) |

---

## Arquitetura

Três processos independentes, comunicando-se por HTTP:

```
┌──────────────────────────────┐
│  Navegador                   │
│  Frontend — React + Vite     │──── consulta de CEP ───►  ViaCEP
│  :5173                       │                           viacep.com.br
└───────────────┬──────────────┘
                │  REST + Authorization: Bearer <JWT>
                ▼
┌──────────────────────────────┐
│  Backend — Spring Boot :8080 │
│                              │
│  SecurityFilter (valida JWT) │
│             ▼                │
│  Controllers                 │
│  /auth · /vehicles · /dealer │
│             ▼                │
│  Services                    │
│  regras de negócio,          │
│  validações, entidade ↔ DTO  │
│             ▼                │
│  Repositories (Spring Data)  │
└───────────────┬──────────────┘
                │  JDBC / Hibernate
                ▼
┌──────────────────────────────┐
│  MySQL 8.4 :3306             │
└──────────────────────────────┘
```

Responsabilidade de cada camada do backend:

- **SecurityFilter** — intercepta a requisição, valida o JWT e popula o contexto de segurança. A API é stateless: não há sessão no servidor.
- **Controllers** — apenas entrada/saída HTTP, validação declarativa (`@Valid`) e autorização por perfil (`@PreAuthorize`).
- **Services** — regras de negócio, validações de domínio (CNPJ, CEP, ano, preço) e conversão entidade ↔ DTO.
- **Repositories** — acesso a dados via Spring Data JPA.
- **DTOs** — `record`s de request e response; entidades JPA nunca são expostas diretamente na borda da API.
- **Exceptions** — exceções de domínio próprias, traduzidas para HTTP por um `@RestControllerAdvice` central.

A consulta ao ViaCEP é feita **no frontend**, no momento em que o usuário digita o CEP, para dar feedback imediato no formulário; o backend valida o formato do CEP recebido antes de persistir.

---

## Estrutura do repositório

```
.
├── backend/                      # API REST (Spring Boot)
│   └── src/main/java/com/andre/DesafioStellantis/
│       ├── auth/                 # JwtService, SecurityFilter, SecurityConfiguration
│       ├── config/               # OpenAPI/Swagger
│       ├── controllers/          # AuthenticationController, CarController, DealershipController
│       ├── domain/               # Entidades JPA: Car, Dealership, Address, User
│       ├── dto/request|response/ # Contratos da API
│       ├── enums/                # FuelType, UserRole
│       ├── exceptions/           # Exceções de domínio + GlobalExceptionHandler
│       ├── repository/           # Spring Data JPA
│       └── services/             # Regras de negócio
├── frontend/                     # SPA (React + Vite)
│   └── src/
│       ├── api/                  # client Axios, endpoints, integração ViaCEP
│       ├── components/           # Layout, formulários, ProtectedRoute, ui/ (shadcn)
│       ├── hooks/                # useVehicles, useDealers (React Query)
│       ├── pages/                # Listagens, detalhes, formulários, login
│       ├── schemas/              # Validação Zod
│       └── utils/                # máscaras, CNPJ, JWT
├── .github/workflows/ci.yml      # CI: testes + cobertura JaCoCo
└── docker-compose.yml            # MySQL + API + Frontend
```

---

## Como executar

### Com Docker (recomendado)

Pré-requisitos: Docker e Docker Compose.

```bash
git clone git@github.com:AndreVinnis/Desafio-Stellantis.git
cd Desafio-Stellantis
docker compose up
```

Sobem três serviços:

| Serviço | URL | Observação |
|---|---|---|
| Frontend | http://localhost:5173 | Vite em modo dev, com hot reload |
| API | http://localhost:8080 | Spring Boot |
| MySQL | localhost:3306 | base `stellantis_db`, criada automaticamente |

O schema é criado pelo Hibernate (`ddl-auto: update`) na primeira subida — não é necessário rodar scripts SQL manualmente. Os dados ficam no volume `mysql-dev-data` e sobrevivem a `docker compose down`; para começar do zero, use `docker compose down -v`.

Documentação da API: **http://localhost:8080/swagger-ui.html**

### Localmente, sem Docker

Pré-requisitos: JDK 21, Node 22+, MySQL 8 rodando.

**Backend**

```bash
cd backend
# exporte as variáveis de ambiente (ver seção abaixo)
./mvnw spring-boot:run
```

Por padrão o `application.yaml` aponta para `jdbc:mysql://localhost:3306/stellantis` com usuário `app` / senha `app`. Ajuste a URL e as credenciais conforme o seu MySQL, ou sobrescreva via variáveis `SPRING_DATASOURCE_*`.

**Frontend**

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

---

## Variáveis de ambiente

**Backend** (obrigatórias — a aplicação não sobe sem elas):

| Variável | Descrição | Exemplo |
|---|---|---|
| `JWT_SECRET` | Chave HMAC em Base64 usada para assinar os tokens | `zdtlD3G/O/9n8u0K1XyBwH2z...` |
| `JWT_EXPIRATION_MS` | Validade do token **em minutos** | `1440` |
| `SPRING_DATASOURCE_URL` | URL JDBC (opcional fora do Docker) | `jdbc:mysql://localhost:3306/stellantis` |
| `SPRING_DATASOURCE_USERNAME` | Usuário do banco | `app` |
| `SPRING_DATASOURCE_PASSWORD` | Senha do banco | `app` |
| `app.cors.allowed-origins` | Origens liberadas no CORS | `http://localhost:5173` |

No Docker Compose essas variáveis já vêm preenchidas. Para gerar um segredo novo:

```bash
openssl rand -base64 32
```

**Frontend** (`frontend/.env`):

| Variável | Descrição | Padrão |
|---|---|---|
| `VITE_API_URL` | Base URL da API | `http://localhost:8080` |

---

## Autenticação e perfis

A API é stateless e protegida por JWT. O fluxo é:

1. `POST /auth/register` ou `POST /auth/login` retornam um token.
2. O frontend guarda o token e o envia em `Authorization: Bearer <token>` em todas as chamadas.
3. Um filtro (`SecurityFilter`) valida o token e popula o contexto de segurança.
4. Requisições sem token válido recebem **401 em JSON**, e o frontend redireciona para `/login` automaticamente.

Há dois perfis:

| Perfil | Permissões |
|---|---|
| `USER` | CRUD completo de veículos; leitura de concessionárias |
| `ADMIN` | Tudo de `USER` + criar, editar e excluir concessionárias |

O cadastro público (`/auth/register`) sempre cria um usuário `USER`. Para promover alguém a `ADMIN`:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'seu@email.com';
```

---

## API

Base URL: `http://localhost:8080`. Todas as rotas, exceto `/auth/**` e a documentação, exigem token.

### Autenticação

| Método | Rota | Body | Resposta |
|---|---|---|---|
| `POST` | `/auth/register` | `{ name, email, password, position }` | `201` + `{ token }` |
| `POST` | `/auth/login` | `{ email, password }` | `200` + `{ token }` |

### Veículos

| Método | Rota | Perfil | Descrição |
|---|---|---|---|
| `GET` | `/vehicles` | `USER` | Lista todos os veículos |
| `GET` | `/vehicles/{id}` | `USER` | Consulta um veículo |
| `POST` | `/vehicles` | `USER` | Cria um veículo |
| `PUT` | `/vehicles/{id}` | `USER` | Atualiza o veículo (inclusive a concessionária associada) |
| `DELETE` | `/vehicles/{id}` | `USER` | Remove o veículo |

### Concessionárias

| Método | Rota | Perfil | Descrição |
|---|---|---|---|
| `GET` | `/dealer` | `USER` | Lista todas as concessionárias |
| `GET` | `/dealer/{id}` | `USER` | Consulta uma concessionária **com seus veículos** |
| `POST` | `/dealer` | `ADMIN` | Cria uma concessionária |
| `PUT` | `/dealer/{id}` | `ADMIN` | Atualiza a concessionária |
| `DELETE` | `/dealer/{id}` | `ADMIN` | Remove a concessionária |

### Exemplos

<details>
<summary>Criar concessionária</summary>

```bash
curl -X POST http://localhost:8080/dealer \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Concessionária Centro",
    "cnpj": "12.345.678/0001-95",
    "address": {
      "cep": "58400-000",
      "street": "Rua Sete de Setembro",
      "complement": "Sala 2",
      "neighborhood": "Centro",
      "city": "Campina Grande",
      "stateName": "PB"
    }
  }'
```
</details>

<details>
<summary>Criar veículo associado a uma concessionária</summary>

```bash
curl -X POST http://localhost:8080/vehicles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mark": "Fiat",
    "model": "Pulse",
    "chassis": "9BD1234567890XYZ0",
    "year": 2025,
    "price": 119900.00,
    "fuelsTypes": ["FLEX"],
    "color": "Preto",
    "externalColor": "Preto Vulcano",
    "dealershipId": 1
  }'
```
</details>

**Associação de veículos:** um veículo pertence obrigatoriamente a uma concessionária (`dealershipId`). Trocar a concessionária é um `PUT /vehicles/{id}` com o novo `dealershipId`, e a listagem por concessionária vem em `GET /dealer/{id}`, que já retorna os veículos vinculados.

### Tipos de combustível

`GASOLINE` · `ETHANOL` · `DIESEL` · `FLEX` · `ELECTRICITY` · `HYBRID`

Um veículo aceita **mais de um** tipo de combustível (`fuelsTypes` é uma lista), o que cobre casos como flex + elétrico.

---

## Modelo de dados

O schema é gerado pelo Hibernate a partir das entidades JPA. Relacionamentos:

- `dealerships` **1 : 1** `addresses` — cascade + `orphanRemoval`: o endereço nasce e morre com a concessionária.
- `dealerships` **1 : N** `cars` — cascade + `orphanRemoval`: excluir a concessionária exclui seus veículos.
- `cars` **1 : N** `car_fuel_types` — `@ElementCollection` de enum, um veículo pode aceitar vários combustíveis.

### `dealerships`

| Coluna | Tipo | Restrições |
|---|---|---|
| `id` | BIGINT | PK, auto-increment |
| `name` | VARCHAR(100) | NOT NULL — razão social |
| `cnpj` | VARCHAR(14) | NOT NULL — somente dígitos |
| `address_id` | BIGINT | NOT NULL, FK → `addresses.id` |
| `created_at` | TIMESTAMP | NOT NULL, imutável |
| `updated_at` | TIMESTAMP | NOT NULL |

### `addresses`

| Coluna | Tipo | Restrições |
|---|---|---|
| `id` | BIGINT | PK, auto-increment |
| `cep` | VARCHAR(9) | NOT NULL — formato `#####-###` |
| `street` | VARCHAR(150) | NOT NULL — logradouro |
| `complement` | VARCHAR(100) | opcional |
| `neighborhood` | VARCHAR(100) | NOT NULL — bairro |
| `city` | VARCHAR(100) | NOT NULL |
| `state_name` | VARCHAR(50) | NOT NULL — UF |
| `created_at` | TIMESTAMP | NOT NULL, imutável |
| `updated_at` | TIMESTAMP | NOT NULL |

### `cars`

| Coluna | Tipo | Restrições |
|---|---|---|
| `id` | BIGINT | PK, auto-increment |
| `mark` | VARCHAR(100) | NOT NULL — marca |
| `model` | VARCHAR(100) | NOT NULL |
| `chassis` | VARCHAR(100) | NOT NULL |
| `year` | INT | NOT NULL |
| `price` | DECIMAL | NOT NULL |
| `color` | VARCHAR(50) | NOT NULL |
| `external_color` | VARCHAR(50) | NOT NULL — cor externa |
| `dealership_id` | BIGINT | NOT NULL, FK → `dealerships.id` |
| `created_at` | TIMESTAMP | NOT NULL, imutável |
| `updated_at` | TIMESTAMP | NOT NULL |

### `car_fuel_types`

| Coluna | Tipo | Restrições |
|---|---|---|
| `car_id` | BIGINT | FK → `cars.id` |
| `fuel_type` | VARCHAR | enum `FuelType` gravado como texto |

### `users`

| Coluna | Tipo | Restrições |
|---|---|---|
| `id` | BIGINT | PK, auto-increment |
| `name` | VARCHAR(100) | NOT NULL |
| `email` | VARCHAR(150) | NOT NULL, UNIQUE — é o login |
| `password` | VARCHAR(64) | NOT NULL — hash BCrypt |
| `role` | VARCHAR | enum `UserRole`: `USER` ou `ADMIN` |
| `position` | VARCHAR(100) | NOT NULL — cargo |
| `created_at` | TIMESTAMP | NOT NULL, imutável |
| `updated_at` | TIMESTAMP | NOT NULL |

Todas as tabelas têm `created_at` / `updated_at`, preenchidos por callbacks JPA (`@PrePersist` / `@PreUpdate`).

---

## Validações de negócio

**Backend** (fonte da verdade, em `services/`):

- Campos obrigatórios via Bean Validation (`@NotBlank`, `@NotNull`, `@Size`).
- **CNPJ** — validação completa dos dois dígitos verificadores; rejeita sequências repetidas (`11111111111111`). Persistido apenas com dígitos.
- **CEP** — formato `#####-###`.
- **E-mail** — formato validado por regex; e-mail duplicado é rejeitado.
- **Ano** e **preço** do veículo — não aceitam valores inválidos.
- **Combustível** — a lista não pode vir vazia, e os valores são restritos ao enum `FuelType`.
- **Senha** — mínimo de 8 caracteres, armazenada com BCrypt.

**Frontend**: os mesmos formatos são validados no cliente com **Zod + React Hook Form**, com máscaras de CNPJ, CEP e valor, para o usuário não precisar de um round-trip para descobrir um erro simples.

---

## Tratamento de erros

Um `GlobalExceptionHandler` (`@RestControllerAdvice`) centraliza a tradução de exceções para HTTP. Todas as respostas de erro usam o mesmo formato:

```json
{
  "timestamp": "2026-09-20T12:34:56Z",
  "status": 400,
  "error": "Bad Request",
  "message": "CNPJ inválido: 12.345.678/0001-00",
  "path": "/dealer",
  "fields": {
    "name": "must not be blank"
  }
}
```

O campo `fields` só aparece em erros de validação de campo. No frontend, esses erros são exibidos como toasts e mensagens inline nos formulários.

---

## Testes e cobertura

Testes unitários das camadas de serviço, usando H2 em memória:

```bash
cd backend
./mvnw verify
```

`verify` (e não apenas `test`) é necessário para o JaCoCo gerar o relatório, disponível em `backend/target/site/jacoco/index.html`.

| Suíte | Cenários |
|---|---|
| `CarServiceTest` | 14 |
| `DealershipServiceTest` | 9 |
| `UserServiceTest` | 3 |

---

## CI

O workflow `.github/workflows/ci.yml` roda a cada push em branches de trabalho e em todo PR para `main`:

- build e testes com JDK 21 (Temurin) e cache do Maven;
- relatório de cobertura JaCoCo publicado como artefato;
- resumo de cobertura (instruções, ramos, linhas) direto no summary da execução;
- relatórios do Surefire publicados quando algum teste falha.

---

## Decisões técnicas

**JWT em vez de sessão.** A API é stateless, o que simplifica a separação entre frontend e backend e o deploy em container. O token carrega `userId` e roles; nenhuma consulta extra ao banco é necessária para autorizar.

**Autorização por perfil no controller.** `@PreAuthorize` mantém a regra de acesso visível ao lado do endpoint. Concessionária é cadastro estrutural, então ficou restrita a `ADMIN`; veículo é operação do dia a dia da área comercial, liberada para `USER`.

**DTOs como `record`.** Entidades JPA nunca cruzam a borda da API — isso evita serialização acidental de relacionamentos lazy e desacopla o contrato público do modelo de persistência.

**Validação em duas camadas.** O cliente valida para dar feedback rápido; o servidor revalida porque a API é pública e não pode confiar no cliente. A regra de CNPJ é implementada no backend sem dependência externa.

**ViaCEP consumido pelo frontend.** O preenchimento acontece enquanto o usuário digita, com `AbortSignal` e timeout de 8s. Um CEP inexistente não bloqueia o cadastro: os campos continuam editáveis manualmente.

**Lista de combustíveis em `@ElementCollection`.** Um veículo pode aceitar mais de um combustível, e uma tabela auxiliar com enum em `STRING` mantém o histórico legível no banco.

**React Query para estado de servidor.** Cache, invalidação após mutações, estados de `loading` e `error` sem estado global manual — o que também dá os skeletons e o feedback visual pedidos nos requisitos de UX.

**`ddl-auto: update`.** Adequado ao escopo do desafio, evitando scripts de migração. Em produção a escolha seria Flyway ou Liquibase, com o schema versionado.

**Docker Compose em modo dev.** Os serviços montam o código como volume e rodam com hot reload, para que quem avalia consiga subir tudo com um comando e ainda navegar/alterar o código. O `backend/Dockerfile` traz o build multi-stage de produção (Maven → JRE Alpine, usuário não-root) para quando o objetivo for gerar a imagem final.

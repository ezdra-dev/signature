# Assinatura GL ONE

Sistema para geração de assinaturas de email profissionais.

## Refatorações Realizadas

### 1. Frontend (`public/`)

#### Estrutura de Arquivos
- `index.html` - HTML limpo e semântico
- `styles.css` - Estilos organizados e comentados
- `app.js` - JavaScript modular e orientado a objetos

#### Melhorias no HTML
- ✅ Separação de responsabilidades (HTML, CSS, JS)
- ✅ Estrutura semântica melhorada
- ✅ Classes CSS organizadas
- ✅ Remoção de estilos inline

#### Melhorias no CSS
- ✅ Organização por seções (layout, componentes, utilitários)
- ✅ Comentários explicativos
- ✅ Classes reutilizáveis
- ✅ Sistema de toast notifications

#### Melhorias no JavaScript
- ✅ Arquitetura orientada a objetos
- ✅ Classes modulares (`SignatureApp`, `Validator`, `FileHandler`)
- ✅ Configurações centralizadas
- ✅ Tratamento de erros melhorado
- ✅ Validações robustas
- ✅ Sistema de toast notifications

### 2. Backend (`server/`)

#### Estrutura de Arquivos
- `index.js` - Servidor refatorado com classes

#### Melhorias no Servidor
- ✅ Arquitetura orientada a objetos
- ✅ Classes especializadas:
  - `SignatureServer` - Servidor principal
  - `EmailService` - Configuração e envio de emails
  - `DataValidator` - Validações de dados
  - `BusinessCardProcessor` - Processamento de cartões
- ✅ Configurações centralizadas
- ✅ Validações robustas
- ✅ Tratamento de erros melhorado
- ✅ Middleware de upload com validações
- ✅ Health check endpoint
- ✅ Graceful shutdown
- ✅ Logs estruturados

### 3. Configurações

#### Variáveis de Ambiente
Crie um arquivo `.env` baseado no exemplo:

```env
# Configurações do servidor
PORT=3000

# Configurações do Nodemailer
NODE_MAILER_HOST=smtp.gmail.com
NODE_MAILER_PORT=465
NODE_MAILER_USER=seu-email@gmail.com
NODE_MAILER_PASS=sua-senha-de-app

# Configurações do Google Wallet (para implementação futura)
GOOGLE_CLIENT_EMAIL=seu-email-de-servico@projeto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSUA_CHAVE_AQUI\n-----END PRIVATE KEY-----\n"
GOOGLE_WALLET_ISSUER_ID=seu-issuer-id
```

## Como Executar

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente:**
   ```bash
   cp .env.example .env
   # Editar .env com suas configurações
   ```

3. **Executar o servidor:**
   ```bash
   node server/index.js
   ```

4. **Acessar a aplicação:**
   ```
   http://localhost:3000
   ```

## Funcionalidades

### ✅ Implementadas
- ✅ Formulário de geração de assinatura
- ✅ Upload de imagem para cartão de visita
- ✅ Validações de dados
- ✅ Envio de email com assinatura
- ✅ Interface responsiva
- ✅ Sistema de notificações (toast)
- ✅ Máscara de telefone brasileiro

### 🚧 Próximas Implementações
- 🚧 Integração com Google Wallet API
- 🚧 Geração de cartão de visita digital
- 🚧 QR Code para cartão
- 🚧 Preview da assinatura
- 🚧 Histórico de assinaturas

## Estrutura do Projeto

```
signature/
├── public/
│   ├── index.html      # HTML refatorado
│   ├── styles.css      # CSS organizado
│   ├── app.js          # JavaScript modular
│   └── assets/         # Imagens e recursos
├── server/
│   └── index.js        # Servidor refatorado
├── templates/
│   └── signature-colaborator.js
└── package.json
```

## Benefícios da Refatoração

1. **Manutenibilidade:** Código organizado e modular
2. **Escalabilidade:** Fácil adição de novas funcionalidades
3. **Testabilidade:** Classes isoladas e testáveis
4. **Performance:** Carregamento otimizado de recursos
5. **UX:** Interface mais responsiva e feedback visual
6. **Segurança:** Validações robustas e tratamento de erros
7. **Monitoramento:** Logs estruturados e health checks

## Próximos Passos

Para implementar o cartão de visita digital com Google Wallet:

1. Configurar Google Service Account
2. Instalar dependências do Google Wallet
3. Implementar classe `GoogleWalletService`
4. Integrar com o `BusinessCardProcessor`
5. Adicionar endpoint para gerar links do cartão
6. Incluir link no email enviado 
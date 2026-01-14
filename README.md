
# Pelada PFC Manager - Sistema de Gestão de Performance

Este é o sistema oficial de gestão da **Pelada PFC**, projetado para rodar em dispositivos móveis e desktop, com sincronização em tempo real via Google Sheets.

## 🚀 Como subir para o GitHub

Para subir este projeto para o seu próprio repositório no GitHub, siga estes passos no seu terminal:

1. **Crie um repositório vazio** no seu [GitHub](https://github.com/new).
2. **Abra o terminal** na pasta raiz deste projeto.
3. **Execute os seguintes comandos**:

```bash
# Inicializa o repositório Git local
git init

# Adiciona todos os arquivos (o .gitignore cuidará do resto)
git add .

# Cria o primeiro commit
git commit -m "feat: setup inicial do Pelada PFC Manager"

# Define a branch principal como 'main'
git branch -M main

# Conecta ao seu repositório remoto (Substitua pela sua URL)
# Exemplo: git remote add origin https://github.com/SEU_USUARIO/NOME_DO_REPO.git
git remote add origin https://github.com/SEU_USUARIO/NOME_DO_REPO.git

# Envia os arquivos para o GitHub
git push -u origin main
```

## 🛠️ Configuração do Backend (Google Apps Script)

1. No Google Sheets, vá em **Extensões > Apps Script**.
2. Cole o código contido no arquivo `google-apps-script.gs`.
3. Clique em **Implantar > Nova Implantação**.
4. Selecione **Tipo: App da Web**.
5. Em "Quem pode acessar", selecione **Qualquer um**.
6. Copie a URL gerada e coloque-a como variável de ambiente `VITE_API_URL` ou substitua diretamente no arquivo `services/pfcApi.ts`.

## 📦 Como fazer Deploy na Vercel

1. No painel da Vercel, clique em `Add New` > `Project`.
2. Importe seu repositório do GitHub criado no passo anterior.
3. Configure as Variáveis de Ambiente:
   - **Key**: `VITE_API_URL`
   - **Value**: `SUA_URL_DO_GOOGLE_APPS_SCRIPT_AQUI`
4. Clique em `Deploy`.

## 📱 Funcionalidades Principais

- **Check-in Dinâmico**: Jogadores confirmam presença via QR Code ou link ao chegar na quadra.
- **Painel de Escalação**: Organizador monta os times com base em quem já chegou.
- **Lançamento de Scouts**: Gols, assistências e capitão da rodada.
- **Dashboard de Performance**: Gráficos de artilharia, garçons e presença anual.
- **Gestão de Acessos**: Controle de quem pode editar ou apenas visualizar dados.

---
&copy; 2025 Pelada PFC - Desenvolvido para alta performance.

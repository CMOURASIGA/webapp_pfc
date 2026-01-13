
# Pelada PFC Manager - Guia de Produção (Vercel)

Este sistema foi projetado para ser 100% funcional tanto no computador quanto no celular, integrando estatísticas de futebol amador com o Google Sheets.

## Como fazer Deploy na Vercel

1. **Suba o código para o GitHub**: Crie um repositório privado ou público com os arquivos deste projeto.
2. **Conecte à Vercel**: 
   - No painel da Vercel, clique em `Add New` > `Project`.
   - Importe seu repositório do GitHub.
3. **Configure as Variáveis de Ambiente**:
   - No passo de `Environment Variables`, adicione:
     - **Key**: `VITE_API_URL`
     - **Value**: `SUA_URL_DO_GOOGLE_APPS_SCRIPT_AQUI` (aquela que termina em `/exec`).
4. **Deploy**: Clique em `Deploy`. A Vercel gerará um link automático (ex: `pfc-manager.vercel.app`).

## Uso no Dia a Dia

### Organizador (Administrador)
- **Escalação**: Deve ser feita minutos antes dos jogos começarem.
- **Jogadas**: Devem ser lançadas durante ou logo após cada partida.
- **Usuários**: Utilize a tela de Acessos para dar permissão limitada a outros amigos que queiram ajudar no lançamento.

### Atletas (Operadores)
- **Check-in**: O atleta abre o site no celular assim que chegar na quadra e confirma presença. Isso ajuda o organizador a saber quem já está pronto para jogar.

### Visualização
- **Resultados**: Ideal para compartilhar o "print" do campeão do dia no grupo do WhatsApp.
- **Dashboard**: Ideal para consultar no final do ano e decidir premiações de artilharia.

## Configuração do Backend (Lembrete)
Não esqueça de publicar o script no Google Apps Script como **App da Web** com acesso para **Qualquer um**, caso contrário o sistema não conseguirá ler os dados da planilha.

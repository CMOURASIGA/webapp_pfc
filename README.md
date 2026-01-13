
# Pelada PFC Manager - Integrado com Google Sheets

Este projeto está configurado para ler e gravar dados diretamente na sua planilha Google via Google Apps Script.

## Configuração do Backend (Planilha)

1. Abra a sua planilha [ID: 1SCSIAF0lPHH9UShJF7x6k8w-CmHWiGyaxAeaVIvHxg4].
2. Vá em **Extensões** > **Apps Script**.
3. Apague qualquer código existente e cole o conteúdo do arquivo `google-apps-script.gs` disponível na raiz deste projeto.
4. Clique no ícone de disquete para salvar.
5. Clique no botão azul **Implantar** > **Nova Implantação**.
6. Tipo: **App da Web**.
7. Configuração:
   - Executar como: **Eu** (seu e-mail).
   - Quem pode acessar: **Qualquer um**.
8. Clique em **Implantar** e autorize as permissões solicitadas pelo Google.
9. Copie a **URL do App da Web** gerada (termina em `/exec`).
10. No seu código frontend, abra o arquivo `src/services/pfcApi.ts` e cole a URL na variável `API_URL`.

## Estrutura da Planilha Esperada

- **Respostas ao formulário 1**: Registros individuais de gols/assists.
- **JOGADORES**: Lista de nomes na primeira coluna.
- **Jogos_2025**: Resultados de partidas (Data, Time1, Gols1, Time2, Gols2).

## Desenvolvimento Local

```bash
npm install
npm run dev
```

O sistema funcionará em modo "Cache Local" caso a URL da API não seja fornecida, usando dados de exemplo baseados na sua planilha.

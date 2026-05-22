# Guia de Desenvolvimento 🛠️

Este guia fornece instruções básicas para desenvolvedores que desejam contribuir para o projeto **mAI** ou executar o código-fonte no modo de desenvolvimento.

## Estrutura do Projeto

O mAI é estruturado como um monorepo moderno (utilizando pnpm e Turborepo):
- `apps/web`: O aplicativo principal Next.js.
- `packages/`: Módulos compartilhados e configurações reutilizáveis (componentes de UI, tipos, utilitários).

## Executando no Modo de Desenvolvimento

1. **Pré-requisitos**: Certifique-se de ter o Node.js (versão LTS recomendada) e o pnpm ou o bun instalados.
2. **Instalar Dependências**:
   ```bash
   pnpm install
   ```
3. **Iniciar o Servidor Dev**:
   ```bash
   pnpm run dev
   ```
   O aplicativo estará acessível localmente em `http://localhost:3000`.

## Testes

Usamos o **Vitest** para nossas suítes de testes:
- Executar testes uma vez: `pnpm run test`
- Executar testes em modo de observação (watch): `pnpm run test:watch`

Certifique-se de que todos os testes passem com sucesso antes de enviar quaisquer modificações.

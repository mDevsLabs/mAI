# Arquitetura do mAI 🏗️

O aplicativo **mAI** é construído sobre uma arquitetura moderna projetada para desempenho, extensibilidade e manutenabilidade. Ele é estruturado como um monorepo.

## Tecnologias Principais

- **Framework Core**: Next.js (com App Router) para renderização e roteamento.
- **Gerenciamento de Estado**: Zustand para controle de estado do lado do cliente leve e reativo.
- **Design & UI**: Componentes Ant Design estilizados com `antd-style` e `@lobehub/ui`.
- **Banco de Dados**: SQLite localmente (ou PostgreSQL em produção) gerenciado pelo Drizzle ORM.

## Estrutura do Monorepo

A base de código é dividida em pacotes reutilizáveis no diretório `packages/`:
- `packages/const`: Constantes e configurações globais.
- `packages/builtin-agents`: Agentes padrão do sistema (incluindo a May).
- `packages/database`: Modelos de dados, esquemas do Drizzle e migrações.
- `packages/types`: Definições de tipos TypeScript compartilhadas.

Essa separação isola a lógica de negócios principal (como a execução de solicitações de API de modelo ou o gerenciamento de plugins) da interface de usuário web principal localizada em `src/`.

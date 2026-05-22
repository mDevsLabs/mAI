# Gerenciamento de Banco de Dados 🗄️

O **mAI** gerencia o armazenamento de seus dados de maneira estruturada e de alto desempenho para garantir acesso rápido e offline às suas conversas e configurações.

## Arquitetura de Armazenamento

Dependendo do ambiente de execução (Desktop ou Web), o mAI utiliza diferentes mecanismos de armazenamento:
- **Aplicativo Desktop**: Utiliza um banco de dados local leve (SQLite) armazenado no diretório do usuário do aplicativo. Ele garante excelente desempenho de leitura/gravação para grandes volumes de histórico.
- **Aplicativo Web**: Baseia-se no banco de dados interno do navegador (IndexedDB) ou em serviços de API externos sincronizados com um banco de dados PostgreSQL se o modo de nuvem estiver ativado.

## Migrações de Esquema

O mAI inclui um sistema de migração automática de esquema de banco de dados. A cada atualização do aplicativo, se a estrutura do banco de dados for alterada (por exemplo, adicionando um novo campo a agentes ou mensagens), as migrações serão executadas perfeitamente na inicialização, sem alterar seus dados existentes.

## Otimização de Desempenho

Para manter o aplicativo rápido:
- **Limpeza Automática**: Mensagens temporárias ou sessões expiradas podem ser limpas periodicamente.
- **Indexação**: As mensagens de conversa são indexadas para permitir uma busca de texto quase instantânea.

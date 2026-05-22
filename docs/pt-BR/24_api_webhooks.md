# API e Webhooks 🔗

O **mAI** fornece interfaces programáticas para permitir integrações externas com seus próprios aplicativos, serviços web ou scripts de automação.

## API Local (HTTP)

O aplicativo de desktop mAI pode executar um servidor web local seguro em uma porta designada. Este servidor expõe vários endpoints:
- `POST /api/chat`: Envia uma mensagem para um agente específico e retorna uma resposta estruturada (suporta formato padrão ou streaming).
- `GET /api/agents`: Lista todos os agentes disponíveis e suas configurações.
- `POST /api/agents`: Permite criar um novo agente de forma programática.

## Integração de Webhooks

Você pode configurar webhooks de saída nas configurações avançadas do mAI. Um webhook envia automaticamente um payload JSON para uma URL externa sempre que eventos específicos ocorrem:
- **Mensagem de chat concluída**: Disparado assim que um agente termina de gerar uma resposta.
- **Agente criado**: Disparado quando um novo perfil de agente é adicionado.
- **Erro do sistema**: Disparado durante problemas de validação de chave de API ou interrupções de provedores de LLM.

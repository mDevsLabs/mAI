# Privacidade e Segurança 🔒

A segurança dos dados e o respeito à sua privacidade são princípios fundamentais no design do **mAI**.

## Armazenamento Local Criptografado

Todos os seus dados confidenciais são armazenados localmente no seu dispositivo:
- **Chaves de API**: Elas são criptografadas usando algoritmos padrão do setor antes de serem salvas no seu armazenamento local. Suas chaves de API nunca são enviadas para nossos servidores; elas são despachadas diretamente do seu dispositivo para os respectivos servidores de provedores de LLM.
- **Histórico de Chat**: Suas conversas permanecem na sua máquina (a menos que você ative explicitamente a sincronização segura em nuvem).

## Conexões Seguras

Todas as solicitações de saída para APIs de modelos de linguagem usam protocolos de comunicação seguros (HTTPS / SSL), garantindo que os dados trocados não possam ser interceptados pela rede.

## Práticas Recomendadas para Empresas

Para o mais alto nível de segurança em ambientes corporativos:
- Use modelos hospedados localmente via **Ollama** ou um servidor de inferência privado (o que significa que nenhum dado sai da rede corporativa).
- Desative a telemetria anônima na guia de configurações gerais.

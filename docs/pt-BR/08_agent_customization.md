# Personalização de Agentes ⚙️

O ajuste fino de agentes no **mAI** permite que você modifique profundamente o comportamento deles, o estilo de resposta e as ferramentas que eles podem acessar.

## Configurações Básicas

Para cada agente, você pode configurar:
- **Prompt do Sistema (System Prompt)**: As instruções fundamentais que definem a personalidade, as regras e a função do agente. Esta é a configuração mais influente nas respostas do agente.
- **Modelo de Linguagem**: Selecione o LLM padrão a ser usado (por exemplo, GPT-4o, Claude 3.5 Sonnet, Llama 3).

## Configurações Avançadas

Você também pode modificar os hiperparâmetros de geração:
- **Temperatura**: Controla a criatividade das respostas. Uma temperatura mais baixa (por exemplo, 0.2) produz respostas mais factuais e determinísticas. Uma temperatura mais alta (por exemplo, 0.9) estimula a criatividade.
- **Top P**: Outro método para controlar a diversidade das respostas.
- **Penalidade de Presença / Frequência**: Incentiva ou desencoraja o agente a repetir as mesmas palavras ou a se desviar dos tópicos discutidos.
- **Tokens Máximos (Max Tokens)**: Limita o comprimento máximo da resposta gerada.

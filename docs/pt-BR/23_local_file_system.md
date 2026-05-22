# Sistema de Arquivos Local 📂

O aplicativo desktop **mAI** apresenta uma integração profunda com o sistema de arquivos do seu sistema operacional, permitindo que você acesse e analise seus arquivos locais com segurança.

## Lendo e Analisando Arquivos

Você pode enviar arquivos diretamente para seus agentes (como a **May**) para análise ou processamento:
- **Arrastar e Soltar (Drag and Drop)**: Arraste um documento de texto, arquivo PDF, planilha Excel ou imagem diretamente para a área de chat do mAI.
- **Anexo**: Clique no ícone de clipe de papel no chat para navegar pelo seu explorador de arquivos.
- Os arquivos são analisados e processados localmente, e apenas o texto extraído (ou a própria imagem para modelos multimodais) é enviado para o LLM.

## Limites de Segurança

Para manter seu sistema seguro:
- O mAI nunca lê arquivos sem a sua ação explícita (arrastar e soltar ou seleção manual de arquivos).
- Você pode especificar um diretório dedicado nas configurações gerais para restringir o acesso do mAI apenas a essa pasta.

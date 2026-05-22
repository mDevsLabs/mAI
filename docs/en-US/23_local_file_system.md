# Local File System 📂

The **mAI** desktop application features deep integration with your operating system's file system, allowing you to access and analyze your local files securely.

## Reading and Analyzing Files

You can send files directly to your agents (such as **May**) for analysis or processing:
- **Drag and Drop**: Drag a text document, PDF file, Excel sheet, or image directly into the mAI chat area.
- **Attachment**: Click the paperclip icon in the chat to browse your file explorer.
- Files are parsed and processed locally, and only the extracted text (or the image itself for multimodal models) is sent to the LLM.

## Security Boundaries

To keep your system secure:
- mAI never reads files without your explicit action (drag-and-drop or manual file picking).
- You can specify a dedicated directory in the general settings to restrict mAI's access to only that folder.

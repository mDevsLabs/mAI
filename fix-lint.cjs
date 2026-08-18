const fs = require('fs');
const path = require('path');

const fixCatch = (file) => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/catch\s*\(\w+\)\s*\{/g, 'catch {');
  fs.writeFileSync(file, content);
};

const removeVars = (file, vars) => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  for (const v of vars) {
    // try to remove from import { ... }
    const regex = new RegExp(`\\b${v}\\b\\s*,?`, 'g');
    content = content.replace(regex, '');
  }
  // Cleanup hanging commas in imports e.g., import { , A }
  content = content.replace(/\{\s*,/g, '{');
  content = content.replace(/,\s*\}/g, '}');
  content = content.replace(/,\s*,/g, ',');
  // Remove empty imports e.g., import {} from 'lucide-react';
  content = content.replace(/import\s*\{\s*\}\s*from\s*['"][^'"]+['"];?\n?/g, '');
  fs.writeFileSync(file, content);
};

// fix devices routes
fixCatch('app/api/v1/devices/[id]/route.ts');
fixCatch('app/api/v1/devices/route.ts');
fixCatch('components/account/devices-list.tsx');

// fix imports
removeVars('app/legal/privacy/page.tsx', ['Eye', 'FileText']);
removeVars('app/projects/cli/page.tsx', ['Sparkles', 'Code', 'ShieldCheck', 'ArrowRight', 'Download']);
removeVars('app/projects/cloud/page.tsx', ['ShieldCheck', 'ArrowRight']);
removeVars('app/projects/office/page.tsx', ['Sparkles', 'FileSpreadsheet', 'ArrowRight']);
removeVars('app/projects/pulse/page.tsx', ['Sparkles', 'Layers', 'ArrowRight']);
removeVars('app/projects/web/page.tsx', ['ShieldCheck', 'ArrowRight']);
removeVars('components/home/projects-showcase.tsx', ['Image']);
removeVars('components/navbar.tsx', ['User', 'Sparkles']);
removeVars('lib/docs.ts', ['walkDocs']);

// PlaygroundClient.tsx has imports and variable assignments
let pg = 'app/playground/PlaygroundClient.tsx';
if (fs.existsSync(pg)) {
  let content = fs.readFileSync(pg, 'utf8');
  const vars = ['AlertTriangle', 'ImageIcon', 'Copy', 'Check', 'RotateCcw', 'Edit3', 'CheckCircle2', 'FileCode', 'Share2', 'Sparkles'];
  for (const v of vars) {
    const regex = new RegExp(`\\b${v}\\b\\s*,?`, 'g');
    content = content.replace(regex, '');
  }
  content = content.replace(/\{\s*,/g, '{').replace(/,\s*\}/g, '}').replace(/,\s*,/g, ',');
  content = content.replace(/import\s*\{\s*\}\s*from\s*['"][^'"]+['"];?\n?/g, '');
  
  // comment out unused variables lines
  content = content.replace(/const\s+\[errorMsg,\s*setErrorMsg\][^;]+;/g, 'const [, setErrorMsg] = useState<string | null>(null);');
  content = content.replace(/const\s+\[copiedMsgId,\s*setCopiedMsgId\][^;]+;/g, 'const [, setCopiedMsgId] = useState<string | null>(null);');
  content = content.replace(/const\s+\[ollamaStatus,\s*setOllamaStatus\][^;]+;/g, 'const [, setOllamaStatus] = useState<any>({});');
  
  // other unused functions
  content = content.replace(/const handleImageUpload = /g, '// const handleImageUpload = ');
  content = content.replace(/const handleRemoveImage = /g, '// const handleRemoveImage = ');
  content = content.replace(/const handleRetryLast = /g, '// const handleRetryLast = ');
  content = content.replace(/const handleEditMessage = /g, '// const handleEditMessage = ');
  content = content.replace(/const handleCopyMessage = /g, '// const handleCopyMessage = ');
  content = content.replace(/const userInitials = /g, '// const userInitials = ');

  fs.writeFileSync(pg, content);
}

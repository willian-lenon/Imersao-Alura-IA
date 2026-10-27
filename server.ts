import express from 'express';
import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Endpoint de integridade e versão do motor Python
app.get('/api/health', (req, res) => {
  execFile('python3', ['--version'], (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Python 3 não encontrado no ambiente do servidor.',
        error: error.message
      });
    }
    return res.json({
      status: 'ok',
      pythonVersion: stdout.trim() || stderr.trim(),
      timestamp: new Date().toISOString(),
      engine: 'PyCalc Express-Python Bridge'
    });
  });
});

// Endpoint que expõe o código-fonte Python original
app.get('/api/python-code', (req, res) => {
  try {
    const pythonFilePath = path.join(__dirname, 'calculator.py');
    const code = fs.readFileSync(pythonFilePath, 'utf-8');
    res.json({
      success: true,
      filename: 'calculator.py',
      code
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: 'Não foi possível carregar o arquivo Python: ' + err.message
    });
  }
});

// Endpoint principal de cálculo matemático executado pelo script Python
app.post('/api/calculate', (req, res) => {
  const { expression } = req.body;

  if (!expression || typeof expression !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Expressão matemática é obrigatória e deve ser uma string válida.'
    });
  }

  const trimmed = expression.trim();
  if (trimmed.length > 500) {
    return res.status(400).json({
      success: false,
      error: 'A expressão excede o limite máximo permitido de 500 caracteres.'
    });
  }

  const scriptPath = path.join(__dirname, 'calculator.py');

  // Executa o script Python passando a expressão como argumento seguro
  execFile('python3', [scriptPath, trimmed], { timeout: 4000 }, (error, stdout, stderr) => {
    if (stdout) {
      try {
        const parsed = JSON.parse(stdout);
        return res.json(parsed);
      } catch (parseErr) {
        console.error('Falha ao parsear JSON de saída do Python:', stdout, parseErr);
      }
    }

    if (stderr) {
      console.error('Erro no stderr do Python:', stderr);
    }

    if (error) {
      return res.status(400).json({
        success: false,
        error: stderr || error.message || 'Erro durante a execução do motor Python.',
        expression: trimmed
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Resposta inesperada do interpretador Python.'
    });
  });
});

// Inicialização do servidor com Vite em Desenvolvimento ou estáticos em Produção
async function startServer() {
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[PyCalc Server] Servidor Full Stack rodando na porta ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[PyCalc Server] Erro fatal ao iniciar:', err);
  process.exit(1);
});

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async function handler(req, res) {
  // Import your built Express app
  const { default: app } = await import('./dist/index.js');
  return app(req, res);
}

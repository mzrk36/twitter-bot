// Serverless function entry point for Vercel
import express from 'express';
import { registerRoutes } from '../dist/routes.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize routes
let initialized = false;
let routesApp;

export default async function handler(req, res) {
  if (!initialized) {
    routesApp = express();
    routesApp.use(express.json());
    routesApp.use(express.urlencoded({ extended: false }));
    await registerRoutes(routesApp);
    initialized = true;
  }
  
  return routesApp(req, res);
}
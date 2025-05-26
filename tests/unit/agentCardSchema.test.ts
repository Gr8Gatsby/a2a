import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { AgentCardSchema } from '../../src/schemas/agentConfig.schema.js';
import type { AgentCard } from '../../src/types/agent-card.js';

const validDir = path.join(__dirname, '../mocks/agent-cards/valid');
const invalidDir = path.join(__dirname, '../mocks/agent-cards/invalid');

describe('AgentCardSchema validation', () => {
  if (fs.existsSync(validDir)) {
    fs.readdirSync(validDir).forEach(file => {
      it(`validates valid card: ${file}`, () => {
        const card = JSON.parse(fs.readFileSync(path.join(validDir, file), 'utf-8'));
        const result = AgentCardSchema.safeParse(card);
        expect(result.success).toBe(true);
      });
    });
  }

  if (fs.existsSync(invalidDir)) {
    fs.readdirSync(invalidDir).forEach(file => {
      it(`rejects invalid card: ${file}`, () => {
        const card = JSON.parse(fs.readFileSync(path.join(invalidDir, file), 'utf-8'));
        const result = AgentCardSchema.safeParse(card);
        expect(result.success).toBe(false);
      });
    });
  }
}); 
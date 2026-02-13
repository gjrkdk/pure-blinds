/**
 * Pricing matrix file loader (server-side only)
 */

import { promises as fs } from 'fs';
import path from 'path';
import type { PricingMatrixData } from './types';

/**
 * Load pricing matrix from file path (server-side only)
 * @param matrixPath - Relative path from project root (e.g., '/data/pricing/rollerblinds-white.json')
 * @returns Parsed pricing matrix data
 * @throws Error if file not found or invalid JSON
 */
export async function loadPricingMatrix(
  matrixPath: string
): Promise<PricingMatrixData> {
  const fullPath = path.join(process.cwd(), matrixPath);

  try {
    const fileContent = await fs.readFile(fullPath, 'utf-8');
    return JSON.parse(fileContent) as PricingMatrixData;
  } catch (error) {
    if (
      error instanceof Error &&
      'code' in error &&
      (error as NodeJS.ErrnoException).code === 'ENOENT'
    ) {
      throw new Error(`Pricing matrix not found: ${matrixPath}`);
    }
    throw new Error(`Failed to load pricing matrix: ${matrixPath}`);
  }
}

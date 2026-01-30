import { json } from '@sveltejs/kit';
import { spawn } from 'child_process';
import { join } from 'path';

/**
 * Dev-mode-only API endpoint for uploading cover images.
 * Accepts either:
 * - JSON body: { url: string, gameId: string }
 * - FormData with 'file' (PNG) and 'gameId'
 *
 * The endpoint:
 * 1. Downloads the image from URL or uses uploaded file
 * 2. Saves to static/covers_raw/{gameId}.png
 * 3. Runs optimize-covers-full.ts to generate WebP versions
 */

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
    // Only allow in development mode
    if (import.meta.env.PROD) {
        return new Response('Not found', { status: 404 });
    }

    const fs = (await import('node:fs/promises')).default;
    const path = (await import('node:path')).default;

    try {
        const contentType = request.headers.get('content-type') || '';
        let gameId: string;
        let imageBuffer: ArrayBuffer;

        if (contentType.includes('multipart/form-data')) {
            // Handle file upload
            const formData = await request.formData();
            const file = formData.get('file') as File | null;
            gameId = formData.get('gameId') as string;

            if (!file || !gameId) {
                return json({ error: 'Missing file or gameId' }, { status: 400 });
            }

            // Validate PNG
            if (!file.type.includes('png') && !file.name.toLowerCase().endsWith('.png')) {
                return json({ error: 'Only PNG files are accepted' }, { status: 400 });
            }

            imageBuffer = await file.arrayBuffer();
        } else {
            // Handle JSON with URL
            const body = await request.json();
            const { url, gameId: id } = body;

            if (!url || !id) {
                return json({ error: 'Missing url or gameId' }, { status: 400 });
            }

            gameId = id;

            // Validate URL
            try {
                const parsed = new URL(url);
                if (!['http:', 'https:'].includes(parsed.protocol)) {
                    return json({ error: 'Invalid URL protocol' }, { status: 400 });
                }
            } catch {
                return json({ error: 'Invalid URL' }, { status: 400 });
            }

            // Download image from URL
            const response = await fetch(url);
            if (!response.ok) {
                return json({ error: `Failed to download image: ${response.status}` }, { status: 400 });
            }

            const responseContentType = response.headers.get('content-type') || '';
            if (!responseContentType.includes('image')) {
                return json({ error: 'URL does not point to an image' }, { status: 400 });
            }

            imageBuffer = await response.arrayBuffer();
        }

        // Sanitize gameId to prevent path traversal
        const sanitizedGameId = gameId.replace(/[^a-z0-9-]/gi, '-').toLowerCase();

        // Save to covers_raw directory
        const coversRawDir = path.join(process.cwd(), 'static', 'covers_raw');
        const outputPath = path.join(coversRawDir, `${sanitizedGameId}.png`);

        // Ensure directory exists
        await fs.mkdir(coversRawDir, { recursive: true });

        // Write the file
        await fs.writeFile(outputPath, Buffer.from(imageBuffer));

        // Run the optimization script
        const scriptPath = path.join(process.cwd(), 'scripts', 'optimize-covers-full.ts');

        await new Promise<void>((resolve, reject) => {
            const child = spawn('bun', ['run', scriptPath, sanitizedGameId], {
                cwd: process.cwd(),
                stdio: 'pipe'
            });

            let stderr = '';
            child.stderr?.on('data', (data) => {
                stderr += data.toString();
            });

            child.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`Optimization script failed with code ${code}: ${stderr}`));
                }
            });

            child.on('error', (err) => {
                reject(err);
            });
        });

        return json({
            success: true,
            gameId: sanitizedGameId,
            coverPath: `covers/${sanitizedGameId}.webp`,
            message: 'Cover image processed successfully'
        });
    } catch (error) {
        console.error('[Cover Upload] Error:', error);
        return json(
            {
                error: 'Failed to process cover image',
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}

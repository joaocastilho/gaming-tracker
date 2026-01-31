import type { z } from 'zod';

type Env = {
    SESSION_SECRET?: string;
    GITHUB_TOKEN?: string;
    GH_REPO_OWNER?: string;
    GH_REPO_NAME?: string;
    GH_BRANCH?: string;
};

/**
 * Encode binary data to base64 string (Web API)
 */
function binaryToBase64(bytes: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

/**
 * Verify session cookie
 */
async function verifySession(cookieHeader: string | null, secret: string): Promise<boolean> {
    if (!cookieHeader) return false;
    const cookies = cookieHeader.split(';').map((c) => c.trim());
    const token = cookies.find((c) => c.startsWith('gt_session='))?.split('=')[1];
    if (!token) return false;

    const [expiresRaw, sig] = token.split('.');
    if (!expiresRaw || !sig) return false;

    const expiresAt = Number(expiresRaw);
    if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(expiresRaw));
    const bytes = new Uint8Array(signature);

    let base64 = '';
    for (let i = 0; i < bytes.length; i++) {
        base64 += String.fromCharCode(bytes[i]);
    }

    const expected = btoa(base64).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

    return sig === expected;
}

/**
 * Commit a file to GitHub via the Contents API
 */
async function commitFileToGitHub(
    filePath: string,
    content: Uint8Array,
    message: string,
    env: Env
): Promise<void> {
    const token = env.GITHUB_TOKEN;
    const owner = env.GH_REPO_OWNER;
    const repo = env.GH_REPO_NAME;
    const branch = env.GH_BRANCH || 'main';

    if (!token || !owner || !repo) {
        throw new Error('GitHub not configured');
    }

    const apiBase = 'https://api.github.com';

    // Get current file SHA if it exists
    let sha: string | undefined;
    const getRes = await fetch(
        `${apiBase}/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath)}?ref=${encodeURIComponent(branch)}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github+json',
                'User-Agent': 'gaming-tracker-cloudflare'
            }
        }
    );

    if (getRes.ok) {
        const fileJson = (await getRes.json()) as { sha: string };
        sha = fileJson.sha;
    }

    // Create or update the file
    const putRes = await fetch(
        `${apiBase}/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath)}`,
        {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github+json',
                'Content-Type': 'application/json',
                'User-Agent': 'gaming-tracker-cloudflare'
            },
            body: JSON.stringify({
                message,
                content: binaryToBase64(content),
                sha,
                branch
            })
        }
    );

    if (!putRes.ok) {
        const errorBody = await putRes.text().catch(() => 'no body');
        throw new Error(`GitHub update failed: ${putRes.status} - ${errorBody}`);
    }
}

/**
 * Trigger the optimize-covers GitHub Action workflow
 */
async function triggerOptimizeWorkflow(gameId: string, env: Env): Promise<void> {
    const token = env.GITHUB_TOKEN;
    const owner = env.GH_REPO_OWNER;
    const repo = env.GH_REPO_NAME;
    const branch = env.GH_BRANCH || 'main';

    if (!token || !owner || !repo) {
        console.log('GitHub not configured, skipping workflow trigger');
        return;
    }

    const apiBase = 'https://api.github.com';

    const res = await fetch(
        `${apiBase}/repos/${owner}/${repo}/actions/workflows/optimize-covers.yml/dispatches`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github+json',
                'Content-Type': 'application/json',
                'User-Agent': 'gaming-tracker-cloudflare'
            },
            body: JSON.stringify({
                ref: branch,
                inputs: {
                    game_id: gameId
                }
            })
        }
    );

    if (!res.ok) {
        const errorBody = await res.text().catch(() => 'no body');
        console.error(`Failed to trigger workflow: ${res.status} - ${errorBody}`);
        // Don't throw - we don't want to fail the upload if workflow trigger fails
    }
}

/**
 * POST /api/cover-upload - Upload and process cover image via GitHub
 * 
 * Accepts JSON: { url: string, gameId: string }
 * or FormData with file and gameId
 * 
 * Downloads/processes the image and commits to GitHub:
 * - static/covers_raw/{gameId}.png
 * - static/covers/{gameId}.webp (placeholder - actual processing needs sharp)
 */
export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
    try {
        const secret = env.SESSION_SECRET;
        if (!secret) {
            return new Response(JSON.stringify({ error: 'Session not configured' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const cookieHeader = request.headers.get('cookie');
        if (!(await verifySession(cookieHeader, secret))) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const contentType = request.headers.get('content-type') || '';
        let gameId: string;
        let imageData: Uint8Array;

        if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            const file = formData.get('file') as File | null;
            gameId = formData.get('gameId') as string;

            if (!file || !gameId) {
                return new Response(JSON.stringify({ error: 'Missing file or gameId' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            imageData = new Uint8Array(await file.arrayBuffer());
        } else {
            const body = await request.json().catch(() => null) as { url?: string; gameId?: string } | null;
            if (!body?.url || !body?.gameId) {
                return new Response(JSON.stringify({ error: 'Missing url or gameId' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            gameId = body.gameId;

            // Download image from URL
            const response = await fetch(body.url);
            if (!response.ok) {
                return new Response(JSON.stringify({ error: 'Failed to download image' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            imageData = new Uint8Array(await response.arrayBuffer());
        }

        // Sanitize gameId
        const sanitizedGameId = gameId.replace(/[^a-z0-9-]/gi, '-').toLowerCase();

        // Commit PNG to covers_raw
        await commitFileToGitHub(
            `static/covers_raw/${sanitizedGameId}.png`,
            imageData,
            `chore(covers): add cover image for ${sanitizedGameId}`,
            env
        );

        // Trigger the optimize-covers workflow via GitHub API
        await triggerOptimizeWorkflow(sanitizedGameId, env);

        return new Response(
            JSON.stringify({
                success: true,
                gameId: sanitizedGameId,
                message: 'Cover image uploaded and optimization workflow triggered.',
                coverPath: `covers/${sanitizedGameId}.webp`
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(JSON.stringify({ event: 'cover_upload_error', message: errorMessage }));
        return new Response(
            JSON.stringify({ error: 'Failed to upload cover', details: errorMessage }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
};

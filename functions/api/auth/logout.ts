// POST /api/auth/logout - Clear session cookie
export const onRequestPost = async () => {
	const headers = new Headers();
	headers.set('Content-Type', 'application/json');
	// Clear the session cookie by setting it to empty with immediate expiry
	headers.append('Set-Cookie', 'gt_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0');

	return new Response(JSON.stringify({ ok: true }), {
		status: 200,
		headers
	});
};

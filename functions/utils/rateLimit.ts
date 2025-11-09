export type RateLimitConfig = {
	windowMs: number;
	max: number;
	prefix: string;
};

export type RateLimitResult = {
	allowed: boolean;
	remaining: number;
};

type KV = {
	get(key: string): Promise<string | null>;
	put(key: string, value: string): Promise<void>;
};

export async function checkRateLimit(
	kv: KV,
	ip: string,
	config: RateLimitConfig
): Promise<RateLimitResult> {
	const now = Date.now();
	const windowStart = now - config.windowMs;
	const key = `${config.prefix}:${ip}`;
	const stored = await kv.get(key);

	if (!stored) {
		const record = JSON.stringify([{ t: now }]);
		await kv.put(key, record);
		return { allowed: true, remaining: config.max - 1 };
	}

	let events: { t: number }[];
	try {
		events = JSON.parse(stored) as { t: number }[];
	} catch {
		events = [];
	}

	const recent = events.filter((e) => e.t >= windowStart);
	recent.push({ t: now });

	if (recent.length > config.max) {
		await kv.put(key, JSON.stringify(recent));
		return { allowed: false, remaining: 0 };
	}

	await kv.put(key, JSON.stringify(recent));
	return { allowed: true, remaining: config.max - recent.length };
}

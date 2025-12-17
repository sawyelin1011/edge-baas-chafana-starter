// Minimal D1 type for local builds
export type D1Database = any;

export type Env = {
	Bindings: {
		DB: D1Database;
	};
};

// Generated types will be added here
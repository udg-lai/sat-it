const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["dimacs/NQueens/NQueens10.cnf","dimacs/NQueens/NQueens10quad.cnf","dimacs/NQueens/NQueens11.cnf","dimacs/NQueens/NQueens12.cnf","dimacs/NQueens/NQueens15.cnf","dimacs/NQueens/NQueens15quad.cnf","dimacs/NQueens/NQueens17.cnf","dimacs/NQueens/NQueens17quad.cnf","dimacs/NQueens/NQueens18.cnf","dimacs/NQueens/NQueens18quad.cnf","dimacs/NQueens/NQueens19quad.cnf","dimacs/NQueens/NQueens20.cnf","dimacs/NQueens/NQueens20quad.cnf","dimacs/NQueens/NQueens21quad.cnf","dimacs/NQueens/NQueens22quad.cnf","dimacs/NQueens/NQueens23quad.cnf","dimacs/NQueens/NQueens25quad.cnf","dimacs/NQueens/NQueens27quad.cnf","dimacs/NQueens/NQueens29quad.cnf","dimacs/NQueens/NQueens30.cnf","dimacs/NQueens/NQueens30quad.cnf","dimacs/NQueens/NQueens33quad.cnf","dimacs/NQueens/NQueens34.cnf","dimacs/NQueens/NQueens34quad.cnf","dimacs/NQueens/NQueens4.cnf","dimacs/NQueens/NQueens4quad.cnf","dimacs/NQueens/NQueens5.cnf","dimacs/NQueens/NQueens5quad.cnf","dimacs/NQueens/NQueens6.cnf","dimacs/NQueens/NQueens6quad.cnf","dimacs/NQueens/NQueens7.cnf","dimacs/NQueens/NQueens7quad.cnf","dimacs/NQueens/NQueens8.cnf","dimacs/NQueens/NQueens8quad.cnf","dimacs/NQueens/NQueens9.cnf","dimacs/NQueens/NQueens9quad.cnf","dimacs/easy/NQueens5quad.cnf","dimacs/easy/cc3-2-1.cnf","dimacs/easy/contradiccio.cnf","dimacs/easy/ex5.cnf","dimacs/easy/ex5_mod.cnf","dimacs/easy/miniBT.cnf","dimacs/easy/miniUnsat.cnf","dimacs/easy/php10-5.cnf","dimacs/easy/rand.cnf","dimacs/easy/random_ksat.cnf","dimacs/easy/random_ksat2.cnf","dimacs/easy/test.cnf","dimacs/errors/error01.dimacs","dimacs/fail.cnf","dimacs/hard/3x3X_full.cnf","dimacs/hard/NQueens21quad.cnf","dimacs/hard/NQueens23quad.cnf","dimacs/hard/NQueens25quad.cnf","dimacs/hard/hanoi4.cnf","dimacs/hard/ssa0432-003.cnf","dimacs/large.cnf","dimacs/normal/NQueens10quad.cnf","dimacs/normal/NQueens15.cnf","dimacs/queens/NQueens4.dimacs","dimacs/queens/NQueens8.dimacs","dimacs/simplification.cnf","dimacs/tooHard/4x4_full.cnf","dimacs/tooHard/NQueens20quad.cnf","dimacs/tooHard/hole8.cnf","dimacs/tooHard/php10-15.cnf","dimacs/tooHard/php15-20.cnf","favicon.png"]),
	mimeTypes: {".png":"image/png"},
	_: {
		client: {"start":"_app/immutable/entry/start.C_HD7Tsf.js","app":"_app/immutable/entry/app.BgBllWKY.js","imports":["_app/immutable/entry/start.C_HD7Tsf.js","_app/immutable/chunks/Bu8BVEvf.js","_app/immutable/chunks/DXEXe3cE.js","_app/immutable/chunks/eStX7PGV.js","_app/immutable/entry/app.BgBllWKY.js","_app/immutable/chunks/eStX7PGV.js","_app/immutable/chunks/B8KWLFWI.js","_app/immutable/chunks/DlatQsYX.js","_app/immutable/chunks/CvPerx1q.js","_app/immutable/chunks/DXEXe3cE.js"],"stylesheets":[],"fonts":[],"uses_env_dynamic_public":false},
		nodes: [
			__memo(() => import('./chunks/0-BRm0-uXl.js')),
			__memo(() => import('./chunks/1-CdOyYabz.js')),
			__memo(() => import('./chunks/2-CtJLFvg7.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			}
		],
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

const prerendered = new Set([]);

const base = "";

export { base, manifest, prerendered };
//# sourceMappingURL=manifest.js.map

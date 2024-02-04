// include all utils
import "./util/_all.ts";
// include all prototypes
import "./prototypes/_all.ts";

export function loop(): void {
	for (const name in Memory.creeps) {
		if (!(name in Game.creeps)) {
			delete Memory.creeps[name];
		}
	}
}

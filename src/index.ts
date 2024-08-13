// include all utils
import "./util";
// include all prototypes
import "./prototypes";
import ErrorMapper from "./util/errorMapper";

export const loop = ErrorMapper(function () {
	for (const name in Memory.creeps) {
		if (!(name in Game.creeps)) {
			delete Memory.creeps[name];
		}
	}
});

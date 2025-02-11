declare global {
	interface ObjectConstructor {
		keys<Obj extends Record<any, any>>(object: Obj): Array<keyof Obj>;
		keys<Obj extends { [_ in any]: any }>(object: Obj): Array<keyof Obj>;

		entries<Obj extends { [Key in any]: any }>(object: Obj): Array<[keyof Obj, Obj[keyof Obj]]>;
	}
}

export { };

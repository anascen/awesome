#!/usr/bin/env node
import path from "path";
import awesome = require("./index");

// Show usage and exit with code
function help(code: number) {
	console.log(`Usage:
  awesome install [dir] (default: .awesome)
  awesome uninstall
  awesome set|add <file> [cmd]`);
	process.exit(code);
}

// Get CLI arguments
const [, , cmd, ...args] = process.argv;
const ln = args.length;
const [x, y] = args;

// Set or add command in hook
const hook = (fn: (a1: string, a2: string) => void) => (): void => {
	!ln || ln > 2 ? help(2) : fn(x!.toString(), y!.toString());
};

// CLI commands
const cmds: { [key: string]: () => void } = {
	install: (): void => (ln > 1 ? help(2) : awesome.install(x)),
	uninstall: awesome.uninstall,
	set: hook(awesome.set),
	add: hook(awesome.add),
	["-v"]: () =>
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-var-requires
		console.log(require(path.join(__dirname, "../package.json")).version),
};

// Run CLI
try {
	// Run command or show usage for unknown command
	if (cmd === undefined) {
		help(0);
	} else {
		// Run command or show usage for unknown command
		const commandFunction = cmds[cmd];
		if (commandFunction) {
			commandFunction();
		} else {
			help(0);
		}
	}
} catch (e) {
	console.error(e instanceof Error ? `awesome - ${e.message}` : e);
	process.exit(1);
}

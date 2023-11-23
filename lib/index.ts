import { SpawnSyncReturns, spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

/*
 * Logger
 */
const logger = (msg: string): void => {
	console.log(`awesome - ${msg}`);
};

/*
 * Execute git command
 */
const git = (args: string[]): SpawnSyncReturns<Buffer> => {
	return spawnSync("git", args, { stdio: "inherit" });
};

/*
 * Install awesome
 */
export const install = (dir = "awesome"): void => {
	if (process.env["AWESOME"] === "0") {
		logger("awesome env variable is set to 0, skipping install");
		return;
	}

	/*
	 * Ensure in Git repository
	 * If git command is not found, status is null and we should return
	 * That's why status value needs to be checked explicitly
	 */
	if (git(["rev-parse"]).status !== 0) {
		logger(`git command not found, skipping install`);
		return;
	}

	/*
	 * Ensure that we're not trying to install outside of cwd
	 */
	if (!path.resolve(process.cwd(), dir).startsWith(process.cwd())) {
		throw new Error(`... not allowed`);
	}

	/*
	 * Ensure that cwd is git top level
	 */
	if (!fs.existsSync(".git")) {
		throw new Error(`.git can't be found`);
	}

	try {
		// Create .awesome/_
		fs.mkdirSync(path.join(dir, "_"), { recursive: true });

		// Create .awesome/_/.gitignore
		fs.writeFileSync(path.join(dir, "_/.gitignore"), "*");

		// Copy aw+esome.sh to .awesome/_/awesome.sh
		fs.copyFileSync(
			path.join(__dirname, "../awesome.sh"),
			path.join(dir, "_/awesome.sh")
		);

		// Configure repo
		const { error } = git(["config", "core.hooksPath", dir]);
		if (error) {
			throw error;
		}
	} catch (error) {
		logger("Git hooks failed to install");
		throw error;
	}
	logger("Git hooks successfully installed");
};

export function set(file: string, cmd: string): void {
	const dir = path.dirname(file);
	if (!fs.existsSync(dir)) {
		throw new Error(
			`can't create hook, ${dir} directory doesn't exist (try running awesome install)`
		);
	}

	fs.writeFileSync(
		file,
		`#!/usr/bin/env sh
. "$(dirname -- "$0")/_/awesome.sh"

${cmd}
`,
		{ mode: 0o0755 }
	);

	logger(`created ${file}`);

	if (os.type() === "Windows_NT") {
		logger(
			`Due to a limitation on Windows systems, the executable bit of the file cannot be set without using git. 
      To fix this, the file ${file} has been automatically moved to the staging environment and the executable bit has been set using git. 
      Note that, if you remove the file from the staging environment, the executable bit will be removed. 
      You can add the file back to the staging environment and include the executable bit using the command 'git update-index -add --chmod=+x ${file}'. 
      If you have already committed the file, you can add the executable bit using 'git update-index --chmod=+x ${file}'. 
      You will have to commit the file to have git keep track of the executable bit.`
		);

		git(["update-index", "--add", "--chmod=+x", file]);
	}
}

// Create a hook if it doesn't exist or append command to it
export function add(file: string, cmd: string): void {
	if (fs.existsSync(file)) {
		fs.appendFileSync(file, `${cmd}\n`);
		logger(`updated ${file}`);
	} else {
		set(file, cmd);
	}
}

// Uninstall awesome
export function uninstall(): void {
	git(["config", "--unset", "core.hooksPath"]);
}

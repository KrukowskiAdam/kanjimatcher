import fs from "fs";
import path from "path";

const rootDir = process.cwd();
const sourceDir = path.join(rootDir, "build");
const targetDir = path.join(rootDir, "functions", "build");

const copyDir = (src, dest) => {
    if (!fs.existsSync(src)) {
        throw new Error(`Build output not found at ${src}`);
    }
    fs.rmSync(dest, { recursive: true, force: true });
    fs.mkdirSync(dest, { recursive: true });

    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
};

copyDir(sourceDir, targetDir);

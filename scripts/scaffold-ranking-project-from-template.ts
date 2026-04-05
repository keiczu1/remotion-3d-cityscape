import fs from "node:fs";
import path from "node:path";

import { TEMPLATE_CATALOG } from "../src/lib/ranking-corridor/catalog";

const args = process.argv.slice(2);
const [templateId, projectSlug, ...restArgs] = args;
const isDryRun = restArgs.includes("--dry-run");

if (!templateId || !projectSlug) {
    console.error("Usage: npm run scaffold:template -- <template-id> <project-slug> [--dry-run]");
    process.exit(1);
}

const template = TEMPLATE_CATALOG.find((entry) => entry.id === templateId);

if (!template) {
    console.error(`Unknown template id: ${templateId}`);
    process.exit(1);
}

const rootDir = process.cwd();
const sourceSlug = template.sourceProjectSlug;
const targetProjectPath = path.join(rootDir, "projects", projectSlug);
const targetCompositionPath = path.join(rootDir, "src", "compositions", projectSlug);
const targetPublicAssetsPath = path.join(rootDir, "public", "ranking-corridor", projectSlug);

const toPascalCase = (value: string) =>
    value
        .split(/[^a-zA-Z0-9]+/)
        .filter(Boolean)
        .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
        .join("");

const renderTemplate = (value: string) =>
    value
        .split("{{projectSlug}}").join(projectSlug)
        .split("{{projectSlugPascal}}").join(toPascalCase(projectSlug));

const operations: string[] = [];
const shouldCopyPublicAssets = Boolean(template.publicAssetsPath);

const ensureTargetDoesNotExist = (targetPath: string) => {
    if (fs.existsSync(targetPath)) {
        throw new Error(`Target already exists: ${path.relative(rootDir, targetPath)}`);
    }
};

ensureTargetDoesNotExist(targetProjectPath);
ensureTargetDoesNotExist(targetCompositionPath);
if (shouldCopyPublicAssets) {
    ensureTargetDoesNotExist(targetPublicAssetsPath);
}

const replaceInDirectory = (directoryPath: string) => {
    const entries = fs.readdirSync(directoryPath, { withFileTypes: true });

    for (const entry of entries) {
        const absolutePath = path.join(directoryPath, entry.name);
        if (entry.isDirectory()) {
            replaceInDirectory(absolutePath);
            continue;
        }

        const currentContent = fs.readFileSync(absolutePath, "utf8");
        const nextContent = currentContent.split(sourceSlug).join(projectSlug);
        if (nextContent !== currentContent) {
            fs.writeFileSync(absolutePath, nextContent, "utf8");
        }
    }
};

const updateRootRegistration = () => {
    const rootPath = path.join(rootDir, template.rootRegistrationTarget);
    const currentRoot = fs.readFileSync(rootPath, "utf8");
    const importPath = `./compositions/${projectSlug}`;
    const importSceneAlias = `${toPascalCase(projectSlug)}Scene`;
    const importDurationAlias = `${toPascalCase(projectSlug)}Duration`;
    const compositionId = renderTemplate(template.compositionIdTemplate);

    if (currentRoot.includes(importPath) || currentRoot.includes(`id="${compositionId}"`)) {
        operations.push(`skip root registration, already present: ${template.rootRegistrationTarget}`);
        return;
    }

    const importStatement = `import { Scene as ${importSceneAlias}, durationInFrames as ${importDurationAlias} } from "${importPath}";`;
    const compositionBlock = [
        "      <Composition",
        `        id="${compositionId}"`,
        `        component={${importSceneAlias}}`,
        `        durationInFrames={${importDurationAlias}}`,
        "        fps={60}",
        "        width={1920}",
        "        height={1080}",
        "      />",
    ].join("\n");

    const updatedImports = currentRoot.replace(
        'import { Composition } from "remotion";',
        `import { Composition } from "remotion";\n${importStatement}`,
    );
    const updatedRoot = updatedImports.replace("    </>", `${compositionBlock}\n    </>`);

    fs.writeFileSync(rootPath, updatedRoot, "utf8");
    operations.push(`update root registration: ${template.rootRegistrationTarget}`);
};

operations.push(`create project dir: projects/${projectSlug}`);
operations.push(`copy composition: ${template.compositionPath} -> src/compositions/${projectSlug}`);
if (shouldCopyPublicAssets) {
    operations.push(`copy public assets: ${template.publicAssetsPath} -> public/ranking-corridor/${projectSlug}`);
}
operations.push(`register composition in ${template.rootRegistrationTarget}`);

if (isDryRun) {
    console.log(`Dry run for template ${template.id}:`);
    for (const operation of operations) {
        console.log(`- ${operation}`);
    }
    process.exit(0);
}

fs.mkdirSync(targetProjectPath, { recursive: true });
fs.cpSync(path.join(rootDir, template.compositionPath), targetCompositionPath, { recursive: true });
replaceInDirectory(targetCompositionPath);

if (shouldCopyPublicAssets && template.publicAssetsPath) {
    fs.cpSync(path.join(rootDir, template.publicAssetsPath), targetPublicAssetsPath, { recursive: true });
    replaceInDirectory(targetPublicAssetsPath);
}

updateRootRegistration();

console.log(`Scaffolded template ${template.id} into project ${projectSlug}.`);

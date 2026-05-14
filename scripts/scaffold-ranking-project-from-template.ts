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
const allowedExistingProjectFiles = new Set(["README.md"]);
const textFileExtensions = new Set([
    ".css",
    ".html",
    ".js",
    ".json",
    ".jsx",
    ".md",
    ".mjs",
    ".scss",
    ".svg",
    ".ts",
    ".tsx",
    ".txt",
    ".yml",
    ".yaml",
]);

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

const normalizeRepoRelativePath = (value: string) => value.replace(/\\/g, "/");
const renderPolicyPath = (value: string) => normalizeRepoRelativePath(value).split("<source-slug>").join(sourceSlug);
const renderedCopyExcludes = template.copyPolicy.exclude.map(renderPolicyPath);
const operations: string[] = [];
const shouldCopyPublicAssets = Boolean(template.publicAssetsPath);
const shouldCopyProjectContainer = Boolean(template.projectContainerPath);

const ensureTargetDoesNotExist = (targetPath: string) => {
    if (fs.existsSync(targetPath)) {
        throw new Error(`Target already exists: ${path.relative(rootDir, targetPath)}`);
    }
};

ensureTargetDoesNotExist(targetCompositionPath);
if (shouldCopyPublicAssets) {
    ensureTargetDoesNotExist(targetPublicAssetsPath);
}

const ensureProjectTargetIsReady = () => {
    if (!fs.existsSync(targetProjectPath)) {
        return;
    }

    const disallowedEntries = fs
        .readdirSync(targetProjectPath, { withFileTypes: true })
        .filter((entry) => !allowedExistingProjectFiles.has(entry.name))
        .map((entry) => entry.name);

    if (disallowedEntries.length > 0) {
        throw new Error(
            `Project dir already contains materialized files: projects/${projectSlug}/${disallowedEntries.join(", ")}`,
        );
    }
};

const isPathCoveredByRules = (repoRelativePath: string, rules: readonly string[]) =>
    rules.some((rule) => repoRelativePath === rule || repoRelativePath.startsWith(`${rule}/`));

const shouldCopyRepoRelativePath = (repoRelativePath: string) => {
    if (isPathCoveredByRules(repoRelativePath, renderedCopyExcludes)) {
        return false;
    }

    return true;
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

const rewriteTextFileIfNeeded = (targetPath: string) => {
    if (!template.placeholderReplacementPolicy.replaceSourceSlug) {
        return;
    }

    const extension = path.extname(targetPath).toLowerCase();
    if (!textFileExtensions.has(extension)) {
        return;
    }

    const currentContent = fs.readFileSync(targetPath, "utf8");
    const nextContent = currentContent.split(sourceSlug).join(projectSlug);
    if (nextContent !== currentContent) {
        fs.writeFileSync(targetPath, nextContent, "utf8");
    }
};

const copyDirectoryWithPolicy = (sourceRelativePath: string, targetPath: string) => {
    const sourcePath = path.join(rootDir, sourceRelativePath);

    const copyRecursively = (currentSourcePath: string, currentTargetPath: string) => {
        const repoRelativePath = normalizeRepoRelativePath(path.relative(rootDir, currentSourcePath));
        if (!shouldCopyRepoRelativePath(repoRelativePath)) {
            return;
        }

        const stats = fs.statSync(currentSourcePath);
        if (stats.isDirectory()) {
            fs.mkdirSync(currentTargetPath, { recursive: true });
            const entries = fs.readdirSync(currentSourcePath, { withFileTypes: true });
            for (const entry of entries) {
                copyRecursively(
                    path.join(currentSourcePath, entry.name),
                    path.join(currentTargetPath, entry.name),
                );
            }
            return;
        }

        fs.mkdirSync(path.dirname(currentTargetPath), { recursive: true });
        fs.copyFileSync(currentSourcePath, currentTargetPath);
        rewriteTextFileIfNeeded(currentTargetPath);
    };

    copyRecursively(sourcePath, targetPath);
};

ensureProjectTargetIsReady();

operations.push(`create or reuse project dir: projects/${projectSlug}`);
if (shouldCopyProjectContainer && template.projectContainerPath) {
    operations.push(`copy project container: ${template.projectContainerPath} -> projects/${projectSlug}`);
}
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
if (shouldCopyProjectContainer && template.projectContainerPath) {
    copyDirectoryWithPolicy(template.projectContainerPath, targetProjectPath);
}
copyDirectoryWithPolicy(template.compositionPath, targetCompositionPath);

if (shouldCopyPublicAssets && template.publicAssetsPath) {
    copyDirectoryWithPolicy(template.publicAssetsPath, targetPublicAssetsPath);
}

updateRootRegistration();

console.log(`Scaffolded template ${template.id} into project ${projectSlug}.`);

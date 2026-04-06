import fs from "node:fs";
import path from "node:path";

import {
    CONSTRUCTOR_CATALOG,
    TEMPLATE_CATALOG,
    type AllowedAdaptationScope,
} from "../src/lib/ranking-corridor/catalog";

const allowedScopes = new Set<AllowedAdaptationScope>([
    "data-only",
    "assets-only",
    "theme-tuning",
    "scene-world-tuning",
    "template-fork-required",
]);

const rootDir = process.cwd();
const errors: string[] = [];

const relativePathExists = (relativePath: string | null) => {
    if (!relativePath) {
        return true;
    }

    return fs.existsSync(path.join(rootDir, relativePath));
};

const ensureUniqueIds = (ids: string[], label: string) => {
    const seen = new Set<string>();

    for (const id of ids) {
        if (seen.has(id)) {
            errors.push(`${label}: duplicate id \`${id}\`.`);
            continue;
        }

        seen.add(id);
    }
};

ensureUniqueIds(CONSTRUCTOR_CATALOG.sceneCounts.map((item) => item.id), "sceneCounts");
ensureUniqueIds(CONSTRUCTOR_CATALOG.worldOptions.map((item) => item.id), "worldOptions");
ensureUniqueIds(CONSTRUCTOR_CATALOG.cameraPackages.map((item) => item.id), "cameraPackages");
ensureUniqueIds(CONSTRUCTOR_CATALOG.heroPackages.map((item) => item.id), "heroPackages");
ensureUniqueIds(TEMPLATE_CATALOG.map((item) => item.id), "templateCatalog");

const cameraPackageIds = new Set(CONSTRUCTOR_CATALOG.cameraPackages.map((item) => item.id));
const heroPackageIds = new Set(CONSTRUCTOR_CATALOG.heroPackages.map((item) => item.id));
const worldOptionIds = new Set(CONSTRUCTOR_CATALOG.worldOptions.map((item) => item.id));

for (const worldOption of CONSTRUCTOR_CATALOG.worldOptions) {
    for (const reference of worldOption.references) {
        if (!relativePathExists(reference.path)) {
            errors.push(`worldOption \`${worldOption.id}\` points to missing path: ${reference.path}`);
        }
    }
}

for (const heroPackage of CONSTRUCTOR_CATALOG.heroPackages) {
    for (const reference of heroPackage.references) {
        if (!relativePathExists(reference.path)) {
            errors.push(`heroPackage \`${heroPackage.id}\` points to missing path: ${reference.path}`);
        }
    }
}

for (const cameraPackage of CONSTRUCTOR_CATALOG.cameraPackages) {
    for (const reference of cameraPackage.references) {
        if (!relativePathExists(reference.path)) {
            errors.push(`cameraPackage \`${cameraPackage.id}\` points to missing path: ${reference.path}`);
        }
    }
}

for (const template of TEMPLATE_CATALOG) {
    const sourceKind = template.sourceKind as "project-container" | "composition-only";
    const projectContainerPath = template.projectContainerPath as string | null;

    if (sourceKind === "project-container" && !projectContainerPath) {
        errors.push(`template \`${template.id}\` with sourceKind \`project-container\` must define projectContainerPath.`);
    }

    if (sourceKind === "composition-only" && projectContainerPath) {
        errors.push(`template \`${template.id}\` with sourceKind \`composition-only\` must not define projectContainerPath.`);
    }

    if (!cameraPackageIds.has(template.cameraPackageId)) {
        errors.push(`template \`${template.id}\` references unknown cameraPackageId \`${template.cameraPackageId}\`.`);
    }

    if (!heroPackageIds.has(template.heroPackageId)) {
        errors.push(`template \`${template.id}\` references unknown heroPackageId \`${template.heroPackageId}\`.`);
    }

    for (const worldId of template.sceneWorldBaseline) {
        if (!worldOptionIds.has(worldId)) {
            errors.push(`template \`${template.id}\` references unknown sceneWorldBaseline id \`${worldId}\`.`);
        }
    }

    if (!allowedScopes.has(template.allowedAdaptationScope)) {
        errors.push(`template \`${template.id}\` has invalid allowedAdaptationScope \`${template.allowedAdaptationScope}\`.`);
    }

    if (!template.compositionIdTemplate) {
        errors.push(`template \`${template.id}\` is missing compositionIdTemplate.`);
    }

    if (!template.rootRegistrationTarget) {
        errors.push(`template \`${template.id}\` is missing rootRegistrationTarget.`);
    }

    if (!relativePathExists(template.compositionPath)) {
        errors.push(`template \`${template.id}\` points to missing compositionPath: ${template.compositionPath}`);
    }

    if (!relativePathExists(template.projectContainerPath)) {
        errors.push(`template \`${template.id}\` points to missing projectContainerPath: ${template.projectContainerPath}`);
    }

    if (!relativePathExists(template.publicAssetsPath)) {
        errors.push(`template \`${template.id}\` points to missing publicAssetsPath: ${template.publicAssetsPath}`);
    }

    if (!relativePathExists(template.rootRegistrationTarget)) {
        errors.push(`template \`${template.id}\` points to missing rootRegistrationTarget: ${template.rootRegistrationTarget}`);
    }
}

if (errors.length > 0) {
    console.error("Catalog validation failed:");
    for (const error of errors) {
        console.error(`- ${error}`);
    }
    process.exit(1);
}

console.log("Catalog validation passed.");

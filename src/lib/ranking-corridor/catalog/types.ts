export type ConstructorSelectionMode = "block-constructor" | "template-clone";

export type AllowedAdaptationScope =
    | "data-only"
    | "assets-only"
    | "theme-tuning"
    | "scene-world-tuning"
    | "template-fork-required";

export type CatalogWorldSlot =
    | "horizon"
    | "side-dressing"
    | "atmospheric-motion"
    | "directed-motion"
    | "ground"
    | "light-weather"
    | "payoff";

export type CatalogReferenceKind = "library-module" | "scene-preset-package" | "source-project";

export type CatalogReference = {
    kind: CatalogReferenceKind;
    id: string;
    path: string;
};

export type ConstructorSceneCountOption = {
    id: string;
    sceneCount: 4;
    label: string;
    description: string;
};

export type ConstructorWorldOption = {
    id: string;
    label: string;
    description: string;
    slot: CatalogWorldSlot;
    sourceProjects: string[];
    references: CatalogReference[];
    recommendedFor: string[];
};

export type ConstructorCameraPackageOption = {
    id: string;
    packageId: string;
    label: string;
    description: string;
    sourceProjects: string[];
    references: CatalogReference[];
};

export type ConstructorHeroPackageOption = {
    id: string;
    label: string;
    description: string;
    sourceProjects: string[];
    references: CatalogReference[];
};

export type ConstructorCatalog = {
    sceneCounts: readonly ConstructorSceneCountOption[];
    worldOptions: readonly ConstructorWorldOption[];
    cameraPackages: readonly ConstructorCameraPackageOption[];
    heroPackages: readonly ConstructorHeroPackageOption[];
};

export type CopyPolicy = {
    include: readonly string[];
    exclude: readonly string[];
};

export type PlaceholderReplacementPolicy = {
    replaceSourceSlug: boolean;
    replaceCompositionImports: boolean;
    replacePublicAssetPaths: boolean;
    replaceProjectPathReferences: boolean;
    replaceCompositionId: boolean;
};

export type TemplateSourceKind = "project-container" | "composition-only";

export type TemplateCatalogEntry = {
    id: string;
    label: string;
    description: string;
    sourceProjectSlug: string;
    sourceKind: TemplateSourceKind;
    projectContainerPath: string | null;
    compositionPath: string;
    publicAssetsPath: string | null;
    compositionIdTemplate: string;
    rootRegistrationTarget: string;
    cameraPackageId: string;
    heroPackageId: string;
    sceneWorldBaseline: readonly string[];
    requiredDataShape: readonly string[];
    allowedAdaptationScope: AllowedAdaptationScope;
    fallbackRule: string;
    copyPolicy: CopyPolicy;
    placeholderReplacementPolicy: PlaceholderReplacementPolicy;
};

export type TemplateCatalog = readonly TemplateCatalogEntry[];

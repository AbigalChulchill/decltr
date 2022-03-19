import esbuild from "esbuild";
import { parse } from "acorn";

import compilerError, {
  defineDecltrApp,
  exportDefaultApp,
  decltrAppUsingConst,
  decltrAppUsingDestructuring,
} from "./compilerError";
import { appPath } from "../env";
import { AcornNode } from "../types";

const getAppParams = async () => {
  const esm = await esbuild
    .build({
      bundle: false,
      entryPoints: [appPath],
      format: "esm",
      write: false,
      platform: "node",
    })
    .then((buildRes) => {
      const tx = new TextDecoder();
      return tx.decode(buildRes.outputFiles[0].contents);
    });

  const ast = parse(esm, {
    ecmaVersion: "latest",
    sourceType: "module",
  }) as AcornNode;

  if (!ast.body) {
    compilerError({
      compiler: "no ast.body",
      human: `file @ ${appPath} was empty`,
      solutions: [defineDecltrApp, exportDefaultApp],
    });
    process.exit(1);
  }

  const exportNode = ast.body.filter(
    (an) => an.type === "ExportNamedDeclaration"
  )[0];

  if (!exportNode) {
    compilerError({
      compiler: "no node within ast.body with type 'ExportNamedDeclaration'",
      human: `file @ ${appPath} had no default exported component`,
      solutions: [defineDecltrApp, exportDefaultApp],
    });
    process.exit(1);
  }

  if (!exportNode.specifiers) {
    compilerError({
      compiler: "no specifiers within exportNode",
      human: `file @ ${appPath} had no default exported component`,
      solutions: [exportDefaultApp],
    });
    process.exit(1);
  }

  const defaultExport = exportNode.specifiers.filter(
    (an) => an.exported && an.exported.name === "default"
  )[0];

  if (!defaultExport) {
    compilerError({
      compiler: "no node within exportNode.specifiers with name 'default'",
      human: `file @ ${appPath} had no default exported component`,
      solutions: [exportDefaultApp],
    });
    process.exit(1);
  }

  if (!defaultExport.local) {
    compilerError({
      compiler: "no local within defaultExport",
      human: `file @ ${appPath} had no default exported component`,
      solutions: [exportDefaultApp],
    });
    process.exit(1);
  }

  if (defaultExport.local.type !== "Identifier" || !defaultExport.local.name) {
    compilerError({
      compiler:
        "no identifier within defaultExport.local or no name with in exportDefault.local",
      human: `file @ ${appPath} had no default exported component`,
      solutions: [defineDecltrApp, exportDefaultApp],
    });
    process.exit(1);
  }

  const exportDefaultVariableNode = findVariableDeclaration(
    ast.body,
    defaultExport.local.name
  );

  if (!exportDefaultVariableNode) {
    compilerError({
      compiler:
        "no exportDefaultVariableNode. the ast was scanned and found nothing",
      human: `file @ ${appPath} had no default exported component`,
      solutions: [defineDecltrApp, exportDefaultApp],
    });
    process.exit(1);
  }

  if (exportDefaultVariableNode.type === "VariableDeclarator") {
    if (!exportDefaultVariableNode.init) {
      compilerError({
        compiler:
          "no init within exportDefaultVariableNode. this means the exported value wasn't initialized at declaration.",
        human: `file @ ${appPath} had an exported component that wasn't defined at one point.`,
        solutions: [decltrAppUsingConst],
      });
      process.exit(1);
    }
    return parseParamsToStrings(exportDefaultVariableNode.init.params);
  }
  return parseParamsToStrings(exportDefaultVariableNode.params);
};

const findVariableDeclaration = (
  astBody: AcornNode[],
  varName: string
): AcornNode | undefined => {
  return astBody.flatMap((an) => {
    if (
      (an.type !== "VariableDeclaration" || !an.declarations) &&
      an.type !== "FunctionDeclaration"
    ) {
      return [];
    }
    if (an.type === "FunctionDeclaration" || !an.declarations) {
      return [an];
    }
    const declNode = an.declarations.filter(
      (an) => an.id && an.id.name === varName
    )[0];
    if (!declNode || !declNode.init) {
      return [];
    }
    if (declNode.init.type === "Identifier") {
      if (!declNode.init.name) {
        return [];
      }
      return [findVariableDeclaration(astBody, declNode.init.name)];
    }
    return declNode ? [declNode] : [];
  })[0];
};

const parseParamsToStrings = (
  params: Array<AcornNode> | undefined
): Array<string> => {
  if (!params || params.length === 0) {
    return [];
  }
  if (!params[0].properties) {
    compilerError({
      compiler: "no key was inside property parameter.",
      human: `file @ ${appPath} exports a component that doesnt use object destructuring.`,
      solutions: [decltrAppUsingDestructuring],
    });
    process.exit(1);
  }
  return params[0].properties.map((pm) => {
    if (!pm.key || !pm.key.name) {
      compilerError({
        compiler: "no key was inside property parameter.",
        human: `file @ ${appPath} exports a component that doesnt use object destructuring.`,
        solutions: [decltrAppUsingDestructuring],
      });
      process.exit(1);
    }
    return pm.key.name;
  });
};

export default getAppParams;

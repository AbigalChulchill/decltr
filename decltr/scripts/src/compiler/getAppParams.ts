import esbuild from "esbuild";
import { parse } from "acorn";

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
      // @ts-ignore
      const tx = new TextDecoder() as any;
      return tx.decode(buildRes.outputFiles[0].contents) as string;
    });

  const ast = parse(esm, {
    ecmaVersion: "latest",
    sourceType: "module",
  }) as AcornNode;

  if (!ast.body) {
    throw new Error("no ast.body. try adding default export to src/App.ts");
  }

  const exportNode = ast.body.filter(
    (an) => an.type === "ExportNamedDeclaration"
  )[0];

  if (!exportNode) {
    throw new Error("no exportNode. try adding default export to src/App.ts");
  }

  if (!exportNode.specifiers) {
    throw new Error(
      "no specifiers within exportNode. try adding default export to src/App.ts"
    );
  }

  const defaultExport = exportNode.specifiers.filter(
    (an) => an.exported && an.exported.name === "default"
  )[0];

  if (!defaultExport) {
    throw new Error(
      "no node within exportNode.specifiers with name 'default'. try adding default export to src/App.ts"
    );
  }

  if (!defaultExport.local) {
    throw new Error(
      "no local within defaultExport. try adding default export to src/App.ts"
    );
  }

  if (defaultExport.local.type !== "Identifier" || !defaultExport.local.name) {
    throw new Error(
      "no identifier within defaultExport.local or no name with in exportDefault.local. try adding default export to src/App.ts"
    );
  }

  const exportDefaultVariableNode = findVariableDeclaration(
    ast.body,
    defaultExport.local.name
  );

  if (!exportDefaultVariableNode) {
    throw new Error(
      "no exportDefaultVariableNode. the ast was scanned and found nothing. try adding default export to src/App.ts"
    );
  }

  if (exportDefaultVariableNode.type === "VariableDeclarator") {
    if (!exportDefaultVariableNode.init) {
      throw new Error(
        "no init within exportDefaultVariableNode. this means the exported value wasn't initialized at declaration. try adding default export to src/App.ts"
      );
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
    throw new Error(
      "no key was inside property parameter. try using object destructuring for first argument of default export"
    );
  }
  return params[0].properties.map((pm) => {
    if (!pm.key || !pm.key.name) {
      throw new Error(
        "no key was inside property parameter. try using object destructuring for first argument of default export"
      );
    }
    return pm.key.name;
  });
};

export default getAppParams;

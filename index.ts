import { PluginObj } from "@babel/core";
import { createFilter } from "@rollup/pluginutils";
import * as babel from "@babel/core";
import { NodePath } from "@babel/traverse";
import {
  JSXOpeningElement,
  JSXAttribute,
  JSXElement,
  JSXIdentifier,
  StringLiteral,
} from "@babel/types";

type TestPluginOptions = {
  prefix?: string;
  include?: string[];
  exclude?: string[];
};

const includeSourceMap = process.env.NODE_ENV === "development";

const CONVERT_MUI_HTML_ELEMENTS: Record<string, string> = {
  Box: "div",
  Stack: "div",
  Grid: "div",
  Typography: "span",
  FormLabel: "div",
  FormControlLabel: "label",
  FormHelperText: "p",
  AppBar: "header",
  IconButton: "button",
};

export default function testIdPlugin({
  prefix = "",
  include,
  exclude,
}: TestPluginOptions): PluginObj {
  const filter = createFilter(include, exclude);

  return {
    name: "testIdPlugin",
    visitor: {
      JSXOpeningElement(path: NodePath<JSXOpeningElement>, state) {
        const filePath = state.filename || state.file?.opts?.filename;

        // If filePath is not available (in case of no state or no filename), return early
        if (!filePath || !filter(filePath)) {
          return; // Skip files that don't match the filter
        }
        // Skip if `data-testid` already exists
        const hasTestId = path.node.attributes.some((attribute) => {
          if (attribute.type !== "JSXAttribute") return false;
          return attribute.name.name === "data-testid";
        });

        if (hasTestId) return;

        // Handle Material-UI to native element mapping
        const elementName = (path.node.name as JSXIdentifier)?.name;
        if (elementName === "ThemeProvider") return;
        const convertedName =
          CONVERT_MUI_HTML_ELEMENTS[elementName] || elementName;

        // Find parent element's `data-testid` (recursively propagate the parent ID)
        const parentElement = path.findParent((p) =>
          p.isJSXElement()
        ) as NodePath<JSXElement> | null;
        const parentTestIdAttr =
          parentElement?.node.openingElement.attributes.find(
            (attr) =>
              attr.type === "JSXAttribute" &&
              (attr.name as JSXIdentifier)?.name === "data-testid"
          ) as JSXAttribute | undefined;

        const parentTestId = (parentTestIdAttr?.value as StringLiteral)?.value;

        // Add sibling index to ensure uniqueness
        const siblingIndex = calculateSiblingIndex(path, convertedName);

        // Generate unique test ID for the current element
        const generatedTestId = generateTestId({
          prefix,
          parentTestId,
          elementName: convertedName,
          siblingIndex,
        });

        // Add `data-testid` attribute
        path.node.attributes.push({
          type: "JSXAttribute",
          name: { type: "JSXIdentifier", name: "data-testid" },
          value: { type: "StringLiteral", value: generatedTestId },
        });
      },
    },
  };
}

function calculateSiblingIndex(
  path: NodePath<JSXOpeningElement>,
  elementName: string
): number {
  const parentElement = path.findParent((p) =>
    p.isJSXElement()
  ) as NodePath<JSXElement> | null;
  if (!parentElement) return 1;

  let index = 1;
  parentElement.node.children.forEach((child) => {
    if (
      child.type === "JSXElement" &&
      ((child as JSXElement).openingElement.name as JSXIdentifier)?.name ===
        elementName
    ) {
      if (child === path.parent) return; // Stop counting siblings once we reach the current element
      index++;
    }
  });

  return index;
}

function generateTestId({
  prefix,
  parentTestId,
  elementName,
  siblingIndex,
}: {
  prefix: string;
  parentTestId?: string;
  elementName: string;
  siblingIndex: number;
}) {
  // Combine parent ID, element name, and sibling index for uniqueness
  const baseTestId = `${parentTestId ? `${parentTestId}-` : ""}${elementName}`;
  return `${prefix}${baseTestId}${
    siblingIndex > 1 ? `-${siblingIndex}` : ""
  }`.toLowerCase();
}

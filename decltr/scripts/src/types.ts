import { Node } from "acorn";

export interface AcornNode extends Node {
  body?: Array<AcornNode>;
  specifiers?: Array<AcornNode>;
  exported?: AcornNode;
  name?: string;
  local?: AcornNode;
  id?: AcornNode;
  declarations?: Array<AcornNode>;
  init?: AcornNode;
  params?: Array<AcornNode>;
  properties?: Array<AcornNode>;
  key?: AcornNode;
}

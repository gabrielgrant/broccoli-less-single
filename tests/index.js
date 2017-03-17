"use strict";

const fs = require("fs");
const path = require("path");
const expect = require("chai").expect;
const testHelpers = require("broccoli-test-helper");
const LESSCompiler = require("../index");

const createBuilder = testHelpers.createBuilder;
const createTempDir = testHelpers.createTempDir;

function read(filepath) {
  return fs.readFileSync(__dirname + filepath, "utf8");
}

describe("BroccoliLessSingle", function() {
  let input;
  let output;
  let subject;

  beforeEach(() => {
    return createTempDir().then(_input => {
      input = _input;

      this.createSubject = function(inputPath, ouputFile, options) {
        subject = new LESSCompiler(input.path(), inputPath, ouputFile, options);
        output = createBuilder(subject);

        return output.build().then(() => output.read());
      };
    });
  });

  afterEach(() => {
    return Promise.all(
      [input, output]
        .filter(obj => {
          return obj && typeof obj.dispose === "function";
        })
        .map(obj => obj.dispose())
    );
  });

  it("exports a constructor", function() {
    expect(typeof LESSCompiler).to.equal("function");
  });

  it("basic preprocessing", () => {
    input.write({
      "input.less": read("/fixtures/basic/input.less", "utf8")
    });

    return this.createSubject("input.less").then(out => {
      expect(out).to.deep.equal({
        "input.css": read("/fixtures/basic/output.css", "utf8")
      });
    });
  });

  it("basic preprocessing + sourceMap file detection", () => {
    input.write({
      "input.less": read("/fixtures/basic/input.less", "utf8")
    });

    return this.createSubject("input.less", "input.css", {
      sourceMap: {
        sourceMapURL: "input.map"
      }
    }).then(out => {
      expect(out["input.css"]).to.equal(
        read("/fixtures/basic/output.css", "utf8") +
          "/*# sourceMappingURL=input.map */"
      );
      expect(typeof out["input.map"]).to.equal("string");
    });
  });

  it("`import`", () => {
    input.write({
      "input.less": read("/fixtures/import/input.less", "utf8"),
      "input2.less": read("/fixtures/import/input2.less", "utf8")
    });

    return this.createSubject("input.less", "output.css").then(out => {
      expect(out).to.deep.equal({
        "output.css": read("/fixtures/import/output.css", "utf8")
      });
    });
  });

  it("`path` option", () => {
    input.write({
      styles: {
        "input.less": read("/fixtures/paths/styles/input.less", "utf8")
      },
      src: {
        "branch.less": read("/fixtures/paths/src/branch.less", "utf8")
      }
    });

    return this.createSubject("styles/input.less", "output.css", {
      paths: ["../src/branch"]
    }).then(out => {
      expect(out).to.deep.equal({
        "output.css": read("/fixtures/paths/output.css", "utf8")
      });
    });
  });
});

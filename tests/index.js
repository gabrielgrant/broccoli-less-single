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
  let input = null;
  let output = null;

  beforeEach(() => {
    return createTempDir().then(_input => {
      input = _input;

      this.createSubject = function(inputPath, ouputFile, options) {
        let subject = new LESSCompiler(
          input.path(),
          inputPath,
          ouputFile,
          options
        );
        output = createBuilder(subject);

        return output.build().then(() => output.read());
      };
    });
  });

  afterEach(() => {
    let final = () => {
      input = null;
      output = null;
    };

    return Promise.all(
      [input, output]
        .filter(obj => {
          return obj && typeof obj.dispose === "function";
        })
        .map(obj => {
          return obj.dispose();
        })
    ).then(
      () => final(),
      e => {
        final();

        throw e;
      }
    );
  });

  it("exports a constructor", () => {
    expect(typeof LESSCompiler).to.equal("function");
  });

  it("basic preprocessing", () => {
    input.write({
      "input.less": read("/fixtures/basic/input.less")
    });

    return this.createSubject("input.less").then(out => {
      expect(out).to.deep.equal({
        "input.css": read("/fixtures/basic/output.css")
      });
    });
  });

  it("basic preprocessing + sourceMap file detection", () => {
    input.write({
      "input.less": read("/fixtures/basic/input.less")
    });

    return this.createSubject("input.less", "input.css", {
      sourceMap: {
        sourceMapURL: "input.map"
      }
    }).then(out => {
      expect(out["input.css"]).to.equal(
        read("/fixtures/basic/output.css") +
          "/*# sourceMappingURL=input.map */"
      );
      expect(typeof out["input.map"]).to.equal("string");
    });
  });

  it("basic preprocessing + inline sourceMap", () => {
    input.write({
      "input.less": read("/fixtures/basic/input.less")
    });

    return this.createSubject("input.less", "input.css", {
      sourceMap: {
        sourceMapFileInline: true
      }
    }).then(out => {
      expect(out["input.css"]).to.have.string(
        read("/fixtures/basic/output.css") +
          "/*# sourceMappingURL=data:application/json;base64"
      );
      expect(out["input.map"]).to.be.undefined;
    })
  });

  it("`import`", () => {
    input.write({
      "input.less": read("/fixtures/import/input.less"),
      "input2.less": read("/fixtures/import/input2.less")
    });

    return this.createSubject("input.less", "output.css").then(out => {
      expect(out).to.deep.equal({
        "output.css": read("/fixtures/import/output.css")
      });
    });
  });

  it("`path` option", () => {
    input.write({
      styles: {
        "input.less": read("/fixtures/paths/styles/input.less")
      },
      src: {
        "index.less": read("/fixtures/paths/src/index.less"),
        a: {
          "foo.less": read("/fixtures/paths/src/a/foo.less"),
        },
        b: {
          "bar.less": read("/fixtures/paths/src/b/bar.less")
        }
      }
    });

    return this.createSubject("styles/input.less", "output.css", {
      paths: [
        path.join(input.path(), "src/"),
        path.join(input.path(), "src/a"),
        path.join(input.path(), "src/b"),
      ]
    }).then(out => {
      expect(out).to.deep.equal({
        "output.css": read("/fixtures/paths/output.css")
      });
    });
  });
});

'use strict';

var esprima = require('esprima');
var estraverse = require('estraverse');
var escodegen = require('escodegen');

function createBaseAST() {
  var ast = {};
  ast.type = 'Program';
  ast.body = [];
  return ast;
}

function createStubFunctionASTNode(functionName) {
  var node = {
    type: 'FunctionDeclaration',
    id: {
      type: 'Identifier',
      name: functionName
    },
    params: [],
    defaults: [],
    body: {
      type: 'BlockStatement',
      body: []
    },
    generator: false,
    expression: false
  };
  return node;
}

function _generateStubs(data) {
  var ast = esprima.parse(data);
  var stubs = [];
  estraverse.traverse(ast, {
    leave: function (node, parent) {
      if (node.type === 'AssignmentExpression'
        && node.operator === '='
        && node.left.type === 'MemberExpression'
        && node.left.object.type === 'Identifier'
        && node.left.object.name === 'global') {
        var functionName = node.left.property.name;
        stubs.push(createStubFunctionASTNode(functionName));
      }
    }
  });

  return stubs;
}

function generateStubs(source) {
  var baseAST = createBaseAST();
  var stubs = _generateStubs(source);
  stubs.map(function (stub) {
    baseAST.body.push(stub);
  });
  return escodegen.generate(baseAST);
}

module.exports.generateStubs = generateStubs;

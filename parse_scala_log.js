'use strict';


function throwUnexpected(c, state) {
  throw new Error('Unexpected character: ' + c + '. State: ' + state);
}

/**
 *
 * @param {object} root
 * @param {array<string>} path
 * @param returnLastItemIfArray
 * @returns {*}
 */
function getObjectByPath(root, path, returnLastItemIfArray) {
  let ret = root;

  for (const key of path) {
    ret = ret[key];
    if (Array.isArray(ret)) {
      ret = ret[ret.length - 1];
    }
  }

  if (returnLastItemIfArray && Array.isArray(ret)) {
    return  ret[ret.length - 1];
  }

  return ret;
}

function parseOldFormat(str) {
  const ret = {};
  const path = [];
  let state = 'fieldValue';
  let token = '';
  let fieldName = 'root';

  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    switch (c) {
      case '(':
        switch (state) {
          case 'fieldValue':
            getObjectByPath(ret, path)[fieldName] = { 'clz': token };
            path.push(fieldName);
            state = 'objectBody';
            token = '';
            break;
          case 'fieldName':
            getObjectByPath(ret, path)[token] = { 'clz': token };
            path.push(token);
            state = 'objectBody';
            token = '';
            break;
          default:
            throwUnexpected(c, state);
            break;
        }
        break;
      case ')':
        switch (state) {
          case 'fieldValue':
            getObjectByPath(ret, path)[fieldName] = token;
            token = '';
            fieldName = null;
            break;
          case 'objectBody':
            break;
          default:
            throwUnexpected(c, state);
            break;
        }
        path.pop();
        state = 'objectBody';
        break;
      case '{':
        switch (state) {
          case 'fieldValue':
            getObjectByPath(ret, path)[fieldName] = [];
            path.push(fieldName);
            fieldName = null;
            state = 'objectBody';
            break;
          default:
            throwUnexpected(c, state);
            break;
        }
        break;
      case '}':
        path.pop();
        break;
      case ',':
        switch (state) {
          case 'objectBody':
            if (Array.isArray(getObjectByPath(ret, path))) {
              getObjectByPath(ret, path).push({});
              fieldName = getObjectByPath(ret, path).length - 1;
              state = 'fieldValue';
            }
            break;
          case 'fieldValue':
            getObjectByPath(ret, path)[fieldName] = token;
            token = '';
            fieldName = null;
            state = 'objectBody';
            break;
          default:
            throwUnexpected(c, state);
            break;
        }
        break;
      case '=':
        switch (state) {
          case 'fieldName':
            fieldName = token;
            token = '';
            state = 'fieldValue';
            break;
          default:
            throwUnexpected(c, state);
            break;
        }
        break;
      case ' ':
        break;
      default:
        switch (state) {
          case 'objectBody':
            if (Array.isArray(getObjectByPath(ret, path))) {
              getObjectByPath(ret, path).push({});
              fieldName = getObjectByPath(ret, path).length - 1;
              state = 'fieldValue';
            } else {
              state = 'fieldName';
            }
            break;
        }
        token += c;
        break;
    }
  }
  return ret.root;
}

/**
 * States:
 *
 * - fieldName
 * - fieldWaitValue
 * - fieldValue
 * - fieldValueString
 * - objectBody
 *
 * @param str
 * @returns {*|Node|Element}
 */
function parseNewFormat(str) {
  const ret = {};
  const path = [];
  let state = 'objectBody';
  let token = '';
  let fieldName = '';

  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    switch (c) {
      case '{':
        switch (state) {
          case 'fieldName':
            let objByPath = getObjectByPath(ret, path)[fieldName];
            if (objByPath) {
              if (Array.isArray(objByPath)) {
                // ok, do nothing
              } else if (typeof objByPath === 'object') {
                objByPath = [objByPath];
                getObjectByPath(ret, path)[fieldName] = objByPath;
              } else {
                throw new Error('Only object array supported');
              }
              objByPath.push({});
            } else {
              getObjectByPath(ret, path)[fieldName] = {};
            }
            path.push(fieldName);
            state = 'objectBody';
            token = '';
            fieldName = '';
            break;
          case 'fieldValueString':
            token += c;
            break;
          default:
            throwUnexpected(c, state);
            break;
        }
        break;
      case '}':
        switch (state) {
          case 'objectBody':
            path.pop();
            break;
          case 'fieldValue':
            getObjectByPath(ret, path, true)[fieldName] = token;
            fieldName = '';
            token = '';
            state = 'objectBody';
            path.pop();
            break;
          case 'fieldValueString':
            token += c;
            break;
          default:
            throwUnexpected(c, state);
            break;
        }
        break;
      case ':':
        switch (state) {
          case 'fieldName':
            state = 'fieldWaitValue';
            break;
          case 'fieldValueString':
            token += c;
            break;
          default:
            throwUnexpected(c, state);
            break;
        }
        break;
      case '"':
        switch (state) {
          case 'fieldWaitValue':
            state = 'fieldValueString';
            token = '';
            break;
          case 'fieldValueString':
            getObjectByPath(ret, path, true)[fieldName] = token;
            fieldName = '';
            token = '';
            state = 'objectBody';
            break;
          default:
            throwUnexpected(c, state);
            break;
        }
        break;
      case ' ':
        switch (state) {
          case 'fieldValueString':
            token += c;
            break;
          case 'fieldValue':
            getObjectByPath(ret, path, true)[fieldName] = token;
            fieldName = '';
            token = '';
            state = 'objectBody';
            break;
        }
        break;
      default:
        switch (state) {
          case 'fieldValueString':
            token += c;
            break;
          case 'fieldWaitValue':
            state = 'fieldValue';
            token += c;
            break;
          case 'objectBody':
            state = 'fieldName';
            fieldName += c;
            break;
          case 'fieldName':
            fieldName += c;
            break;
          case 'fieldValue':
            token += c;
            break;
        }
        break;
    }
  }

  return ret;
}

module.exports = function(str, format) {
  if (!format) {
    format = 'old';
  }
  switch (format) {
    case 'new':
      return parseNewFormat(str);
    case 'old':
      return parseOldFormat(str);
  }
};

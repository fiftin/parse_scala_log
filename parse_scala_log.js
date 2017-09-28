function throwUnexpected(c, state) {
  throw new Error('Unexpected character: ' + c + '. State: ' + state);
}


function getObjectByPath(root, path) {
  let ret = root;

  for (const key of path) {
    ret = ret[key];
  }

  return ret;
}

module.exports = function(str) {
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
    console.log(c, state, path.join('/'));
  }
  console.log(ret);
  return ret.root;
}

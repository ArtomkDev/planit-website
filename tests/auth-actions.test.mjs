import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const source = await readFile('src/components/auth/AuthActionClient.tsx', 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
}).outputText;

const loadActions = ({ operation = 'VERIFY_AND_CHANGE_EMAIL', applyError } = {}) => {
  const calls = [];
  class FirebaseError extends Error {
    constructor(code, message) { super(message); this.code = code; }
  }
  const context = vm.createContext({
    exports: {}, URL, process: { env: {} },
    require: (name) => {
      if (name === 'firebase/app') return { FirebaseError };
      if (name === '@/lib/firebase') return { auth: {} };
      if (name === 'firebase/auth') return {
        checkActionCode: async (_auth, code) => {
          calls.push(['check', code]);
          return { operation, data: { email: 'new@example.com', previousEmail: 'old@example.com' } };
        },
        applyActionCode: async (_auth, code) => {
          calls.push(['apply', code]);
          if (applyError) throw applyError;
        },
        verifyPasswordResetCode: async (_auth, code) => {
          calls.push(['verifyPassword', code]);
          return 'person@example.com';
        },
      };
      return {};
    },
  });
  vm.runInContext(compiled + '\nexports.actions = { isSupportedMode, runInitialAction };', context);
  return { ...context.exports.actions, calls };
};

test('account handler accepts all supported email actions and rejects unknown modes', () => {
  const { isSupportedMode } = loadActions();
  for (const mode of ['resetPassword', 'verifyEmail', 'verifyAndChangeEmail', 'recoverEmail']) {
    assert.equal(isSupportedMode(mode), true);
  }
  for (const mode of [null, '', 'unknown']) assert.equal(isSupportedMode(mode), false);
});

test('email confirmation, change, and recovery check the signed operation before applying', async () => {
  for (const [mode, operation] of [
    ['verifyEmail', 'VERIFY_EMAIL'],
    ['verifyAndChangeEmail', 'VERIFY_AND_CHANGE_EMAIL'],
    ['recoverEmail', 'RECOVER_EMAIL'],
  ]) {
    const actions = loadActions({ operation });
    const result = await actions.runInitialAction(mode, 'signed-code');
    assert.equal(result.kind, mode);
    assert.deepEqual(actions.calls, [['check', 'signed-code'], ['apply', 'signed-code']]);
    if (mode === 'verifyAndChangeEmail') assert.equal(result.email, 'new@example.com');
  }
});

test('a mismatched mode never applies another account action', async () => {
  const actions = loadActions({ operation: 'RECOVER_EMAIL' });
  await assert.rejects(actions.runInitialAction('verifyAndChangeEmail', 'signed-code'), {
    code: 'auth/invalid-action-code',
  });
  assert.deepEqual(actions.calls, [['check', 'signed-code']]);
});

test('expired actions fail without returning a success result', async () => {
  const actions = loadActions({ applyError: { code: 'auth/expired-action-code' } });
  await assert.rejects(actions.runInitialAction('verifyAndChangeEmail', 'expired-code'), {
    code: 'auth/expired-action-code',
  });
});

test('password reset still validates the code before presenting the password form', async () => {
  const actions = loadActions();
  const result = await actions.runInitialAction('resetPassword', 'reset-code');
  assert.equal(result.email, 'person@example.com');
  assert.deepEqual(actions.calls, [['verifyPassword', 'reset-code']]);
});

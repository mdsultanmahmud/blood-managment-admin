import { RuleTester } from 'eslint';
import { describe, it } from 'vitest';
import rule from './no-literal-ui-text.js';

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const tester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2024,
    sourceType: 'module',
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

tester.run('no-literal-ui-text', rule, {
  valid: [
    'const a = <p>{t("auth.login.title")}</p>;',
    'const a = <Button label={t("common.actions.retry")} />;',
    'const a = <div className="flex gap-2" />;',
    'const a = <img alt="" />;',
    'const a = <p>{count} / {total}</p>;',
    'notify.error(t("errors.unknown"));',
  ],
  invalid: [
    { code: 'const a = <p>Sign in</p>;', errors: [{ messageId: 'literal' }] },
    { code: 'const a = <Button label="Save" />;', errors: [{ messageId: 'literal' }] },
    { code: 'const a = <img alt={"Logo"} />;', errors: [{ messageId: 'literal' }] },
    {
      code: 'const a = <input placeholder={`Search ${x}`} />;',
      errors: [{ messageId: 'literal' }],
    },
    { code: 'const a = <b aria-label="Close" />;', errors: [{ messageId: 'literal' }] },
    { code: 'notify.success("User saved");', errors: [{ messageId: 'literal' }] },
  ],
});

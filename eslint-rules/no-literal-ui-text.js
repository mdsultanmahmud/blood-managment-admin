/**
 * Fails on user-facing text written directly in code (ADR 0022): JSX text, the JSX attributes
 * people read, and messages passed to notify.*(). Use t('key') from react-i18next instead.
 */
const READ_ATTRIBUTES = new Set([
  'label',
  'title',
  'placeholder',
  'alt',
  'aria-label',
  'description',
  'helperText',
  'message',
]);
const HAS_LETTER = /\p{L}/u;

function literalText(node) {
  if (!node) return null;
  if (node.type === 'Literal' && typeof node.value === 'string') return node.value;
  if (node.type === 'TemplateLiteral') return node.quasis.map((q) => q.value.cooked ?? '').join('');
  if (node.type === 'JSXExpressionContainer') return literalText(node.expression);
  return null;
}

export default {
  meta: {
    type: 'problem',
    docs: { description: 'User-facing text must come from i18n keys' },
    messages: { literal: 'User-facing text must use t("key"), found "{{text}}"' },
    schema: [],
  },
  create(context) {
    const check = (node, text) => {
      if (text !== null && HAS_LETTER.test(text)) {
        context.report({ node, messageId: 'literal', data: { text: text.trim().slice(0, 40) } });
      }
    };
    return {
      JSXText(node) {
        check(node, node.value);
      },
      JSXAttribute(node) {
        if (node.name.type !== 'JSXIdentifier' || !READ_ATTRIBUTES.has(node.name.name)) return;
        check(node, literalText(node.value));
      },
      CallExpression(node) {
        const callee = node.callee;
        if (
          callee.type === 'MemberExpression' &&
          callee.object.type === 'Identifier' &&
          callee.object.name === 'notify'
        ) {
          check(node, literalText(node.arguments[0]));
        }
      },
    };
  },
};

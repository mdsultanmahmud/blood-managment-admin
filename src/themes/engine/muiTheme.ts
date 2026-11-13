import { createTheme, type Theme } from '@mui/material/styles';
import type { ThemeConfig } from '../types';
import type { ThemeTokens } from './tokens';

/**
 * MUI is used for form inputs only. Its theme comes from the same config/tokens as Tailwind,
 * so a brand change re-themes focus rings, error states and helper text too.
 */
export function buildMuiTheme(config: ThemeConfig, tokens: ThemeTokens): Theme {
  const { primary, neutral, danger, success, warning, info } = tokens.scales;
  return createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: primary[600],
        dark: primary[700],
        light: primary[400],
        contrastText: '#FFFFFF',
      },
      error: { main: danger[600], dark: danger[700], light: danger[400] },
      success: { main: success[600] },
      warning: { main: warning[600] },
      info: { main: info[600] },
      text: { primary: neutral[900], secondary: neutral[600], disabled: neutral[400] },
      divider: neutral[200],
      background: { default: tokens.canvas, paper: tokens.surface },
    },
    shape: { borderRadius: config.radius.control },
    typography: {
      fontFamily: config.font.sans,
      fontSize: config.font.baseSize,
      htmlFontSize: 16,
      // MUI scales body1 to 1rem by default; inputs should match the app's base size.
      body1: { fontSize: config.font.baseSize },
      body2: { fontSize: config.font.baseSize - 1 },
    },
    components: {
      MuiTextField: { defaultProps: { size: 'small', fullWidth: true } },
      MuiFormControl: { defaultProps: { size: 'small', fullWidth: true } },
      MuiAutocomplete: { defaultProps: { size: 'small', fullWidth: true } },
      MuiInputLabel: {
        styleOverrides: {
          root: { color: neutral[600], '&.Mui-focused': { color: primary[700] } },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: tokens.surface,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: neutral[300] },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: neutral[500] },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: primary[600],
              borderWidth: 1.5,
            },
            '&.Mui-error .MuiOutlinedInput-notchedOutline': { borderColor: danger[600] },
            '&.Mui-disabled': { backgroundColor: neutral[50] },
          },
        },
      },
      MuiFormHelperText: {
        styleOverrides: {
          root: { marginLeft: 0, color: neutral[600], '&.Mui-error': { color: danger[700] } },
        },
      },
      MuiCheckbox: {
        defaultProps: { size: 'small' },
        styleOverrides: { root: { color: neutral[400], padding: 4 } },
      },
      MuiSwitch: { defaultProps: { size: 'small' } },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: config.radius.layer,
            border: `1px solid ${neutral[200]}`,
            boxShadow: '0 6px 20px -8px rgb(0 0 0 / 0.18)',
          },
        },
      },
    },
  });
}

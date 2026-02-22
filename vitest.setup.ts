import '@testing-library/jest-dom'

// React 19 only exports `act` in its development build.
// When tests are run with NODE_ENV=production, `require('react')` loads
// `react.production.js` which does NOT export `act`, causing:
//   TypeError: React.act is not a function
//
// Fix: import `act` directly from the dev build and patch it into the
// production React module so `react-dom/test-utils` can find it.
import * as ReactProd from 'react'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ReactDev = require('react/cjs/react.development.js')

if (typeof (ReactProd as { act?: unknown }).act === 'undefined' && typeof ReactDev.act === 'function') {
  // @ts-ignore – patching act onto the production React export
  ReactProd.act = ReactDev.act
}

// Tell React testing tools this is an act() environment
// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true

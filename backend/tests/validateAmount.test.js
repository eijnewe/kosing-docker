import { expect, it } from 'vitest'
import { validateAmount } from '../src/validateAmount.js'

it.each([25, 0.01, 123.45])('godkänner %s kr', (amount) => {
  expect(validateAmount(amount)).toBe(true)
})

it.each([0, -10, NaN, Infinity, '25', null, 0.001, 100_000_000])('avvisar %s', (amount) => {
  expect(validateAmount(amount)).toBe(false)
})

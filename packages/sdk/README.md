# @tac-crypto-payment/sdk

TypeScript SDK for creating TAC crypto-payment sessions through PayZap and submitting EVM or Tron token transactions.

## Installation

```sh
pnpm add @tac-crypto-payment/sdk axios @reown/appkit @reown/appkit-adapter-tron tronweb viem
```

## Basic usage

```ts
import { createPayZapSdk } from '@tac-crypto-payment/sdk'

const sdk = createPayZapSdk('https://api.payzap.cc')
const payment = await sdk.createPayment({
  productId: 'product-id',
  chain: 'evm',
  gasless: false,
  asset,
})
```

Use `EvmExecutor` or `TronExecutor` with `payment.pay()` to submit the token transaction. Validate the amount, recipient, asset, and active wallet chain in your application before requesting a wallet signature.

## Package commands

```sh
pnpm --filter @tac-crypto-payment/sdk build
pnpm --filter @tac-crypto-payment/sdk type-check
pnpm --filter @tac-crypto-payment/sdk pack
```

`prepack` runs the build and type-check automatically before a package is created or published.

## License

MIT. See [LICENSE](./LICENSE).

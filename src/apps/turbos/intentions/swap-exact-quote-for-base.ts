import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { Network, TurbosSdk } from 'turbos-clmm-sdk';

import { BaseIntention } from '@/apps/interface/sui';

import { swap_exact_quote_for_base } from '../api/deepbook';
import { SuiNetworks, SwapExactQuoteForBaseIntentionData, TransactionSubType } from '../types';

export class SwapExactQuoteForBaseIntention extends BaseIntention<SwapExactQuoteForBaseIntentionData> {
  txType!: TransactionType.Other;

  txSubType!: TransactionSubType.SwapExactQuoteForBase;

  constructor(public override readonly data: SwapExactQuoteForBaseIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<TransactionBlock> {
    const turbosSdk = new TurbosSdk(input.network.replace('sui:', '') as Network, input.suiClient);
    const txb = await swap_exact_quote_for_base({ ...this.data, turbosSdk, currentAddress: input.account.address });
    return txb;
  }

  static fromData(data: SwapExactQuoteForBaseIntentionData) {
    return new SwapExactQuoteForBaseIntention(data);
  }
}

import { TransactionType } from '@msafe/sui3-utils';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntentionLegacy } from '@/apps/interface/sui-js';

import { borrowToken } from '../api/incentiveV2';
import config from '../config';
import { CoinType, TransactionSubType } from '../types';

export interface EntryBorrowIntentionData {
  amount: number;
  coinType: CoinType;
}

export class EntryBorrowIntention extends BaseIntentionLegacy<EntryBorrowIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.EntryBorrow;

  constructor(public readonly data: EntryBorrowIntentionData) {
    super(data);
  }

  async build(input: { account: WalletAccount }): Promise<TransactionBlock> {
    const { coinType, amount } = this.data;
    const tx = new TransactionBlock();
    console.log('build', this.data);

    const pool = config.pool[coinType];

    if (!pool) {
      throw new Error(`${coinType} not support, please use ${Object.keys(config.pool).join(', ')}.`);
    }

    return borrowToken(tx, pool, amount, input.account.address);
  }

  static fromData(data: EntryBorrowIntentionData) {
    return new EntryBorrowIntention(data);
  }
}

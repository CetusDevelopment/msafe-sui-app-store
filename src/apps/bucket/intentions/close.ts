import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { CloseIntentionData } from '@/apps/bucket/types/api';
import { BaseIntention } from '@/apps/interface/sui';
import { SuiNetworks } from '@/types';

import { getCloseTx } from '../api/lending';
import { TransactionSubType } from '../types';

export class CloseIntention extends BaseIntention<CloseIntentionData> {
  txType = TransactionType.Other;

  txSubType = TransactionSubType.Close;

  constructor(public readonly data: CloseIntentionData) {
    super(data);
  }

  async build(input: { network: SuiNetworks; suiClient: SuiClient; account: WalletAccount }): Promise<Transaction> {
    const { account, network } = input;
    const tx = await getCloseTx(this.data, account, network);
    return tx;
  }

  static fromData(data: CloseIntentionData) {
    return new CloseIntention(data);
  }
}

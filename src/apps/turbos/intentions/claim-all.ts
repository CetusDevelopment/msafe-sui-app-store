import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { Pool, TurbosSdk, Network } from 'turbos-clmm-sdk';

import { BaseIntention } from '@/apps/interface/sui';

import { SuiNetworks, TransactionSubType } from '../types';

interface ClaimAllParams extends Pool.CollectFeeOptions, Pool.CollectRewardOptions {}

export interface ClaimAllIntentionData {
  positions: ClaimAllParams[];
}

export class ClaimAllIntention extends BaseIntention<ClaimAllIntentionData> {
  txType!: TransactionType.Other;

  txSubType!: TransactionSubType.ClaimAll;

  constructor(public override readonly data: ClaimAllIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<TransactionBlock> {
    const turbosSdk = new TurbosSdk(input.network.replace('sui:', '') as Network, input.suiClient);
    let txb = new TransactionBlock();

    for (let i = 0; i < this.data.positions.length; i++) {
      const position = this.data.positions[i];

      if (position.collectAmountA !== '0' || position.collectAmountB !== '0') {
        txb = await turbosSdk.pool.collectFee({ txb, ...position });
      }

      if (position.rewardAmounts.some((amount) => amount !== '0' && amount === 0)) {
        txb = await turbosSdk.pool.collectReward({ txb, ...position });
      }
    }

    return txb;
  }

  static fromData(data: ClaimAllIntentionData) {
    return new ClaimAllIntention(data);
  }
}

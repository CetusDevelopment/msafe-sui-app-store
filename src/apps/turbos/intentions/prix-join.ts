import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntention } from '@/apps/interface/sui';

import { prixConfig } from '../config';
import { PrixJoinIntentionData, SuiNetworks, TransactionSubType } from '../types';

export class PrixJoinIntention extends BaseIntention<PrixJoinIntentionData> {
  txType!: TransactionType.Other;

  txSubType!: TransactionSubType.PrixJoin;

  constructor(public override readonly data: PrixJoinIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<TransactionBlock> {
    const txb = new TransactionBlock();
    txb.moveCall({
      target: `${prixConfig.PackageId}::claim::join`,
      typeArguments: [prixConfig.turbosCoinType],
      arguments: [txb.object(prixConfig.Claim)],
    });
    return txb;
  }

  static fromData(data: PrixJoinIntentionData) {
    return new PrixJoinIntention(data);
  }
}

import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';
import { SuiNetworks } from '@/types';

import { ScallopClient } from '../models/scallopClient';
import { SupportCollateralCoins } from '../types';
import { TransactionSubType } from '../types/utils';

export interface WithdrawCollateralIntentionData {
  collateralCoinName: SupportCollateralCoins;
  amount: number | string;
  obligationId: string;
  obligationKey: string;
}

export class WithdrawCollateralIntention extends CoreBaseIntention<WithdrawCollateralIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.WithdrawCollateral;

  constructor(public readonly data: WithdrawCollateralIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<TransactionBlock> {
    const scallopClient = new ScallopClient({
      client: input.suiClient,
      walletAddress: input.account.address,
      networkType: input.network.split(':')[1] as any,
    });
    scallopClient.init();
    return scallopClient.withdrawCollateral(
      this.data.collateralCoinName,
      Number(this.data.amount),
      this.data.obligationId,
      this.data.obligationKey,
      input.account.address,
    );
  }

  static fromData(data: WithdrawCollateralIntentionData): WithdrawCollateralIntention {
    return new WithdrawCollateralIntention(data);
  }
}

import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { IAppHelperInternal } from '@/apps/interface/sui';
import { SuiNetworks } from '@/types';

import { updatePackageId } from './config';
import { Decoder } from './decoder';
import { ClaimRewardIntention, ClaimRewardIntentionData } from './intentions/claim-reward';
import { ClaimSupplyIntention, ClaimSupplyIntentionData } from './intentions/claim-supply';
import { EntryBorrowIntention, EntryBorrowIntentionData } from './intentions/entry-borrow';
import { EntryDepositIntention, EntryDepositIntentionData } from './intentions/entry-deposit';
import { EntryRepayIntention, EntryRepayIntentionData } from './intentions/entry-repay';
import { EntryWithdrawIntention, EntryWithdrawIntentionData } from './intentions/entry-withdraw';
import { EntryMultiDepositIntention, EntryMultiDepositIntentionData } from './intentions/multi-deposit';
import { TransactionSubType } from './types';

export type NAVIIntention =
  | EntryDepositIntention
  | EntryBorrowIntention
  | EntryRepayIntention
  | EntryWithdrawIntention
  | EntryMultiDepositIntention
  | ClaimRewardIntention
  | ClaimSupplyIntention;

export type NAVIIntentionData =
  | EntryDepositIntentionData
  | EntryBorrowIntentionData
  | EntryRepayIntentionData
  | EntryWithdrawIntentionData
  | EntryMultiDepositIntentionData
  | ClaimRewardIntentionData
  | ClaimSupplyIntentionData;

export class NAVIAppHelper implements IAppHelperInternal<NAVIIntentionData> {
  application = 'navi';

  supportSDK = '@mysten/sui' as const;

  async deserialize(input: {
    transaction: Transaction;
    network: SuiNetworks;
    suiClient: SuiClient;
    account: WalletAccount;
    appContext?: any;
  }): Promise<{
    txType: TransactionType;
    txSubType: TransactionSubType;
    intentionData: NAVIIntentionData;
  }> {
    await updatePackageId();
    const { transaction } = input;
    const decoder = new Decoder(transaction);
    const result = decoder.decode();
    return {
      txType: TransactionType.Other,
      txSubType: result.type,
      intentionData: result.intentionData,
    };
  }

  async build(input: {
    intentionData: NAVIIntentionData;
    txType: TransactionType;
    txSubType: string;
    suiClient: SuiClient;
    account: WalletAccount;
  }): Promise<Transaction> {
    const { suiClient, account } = input;
    let intention: NAVIIntention;
    await updatePackageId();
    switch (input.txSubType) {
      case TransactionSubType.EntryDeposit:
        intention = EntryDepositIntention.fromData(input.intentionData as EntryDepositIntentionData);
        break;
      case TransactionSubType.EntryBorrow:
        intention = EntryBorrowIntention.fromData(input.intentionData as EntryBorrowIntentionData);
        break;
      case TransactionSubType.EntryRepay:
        intention = EntryRepayIntention.fromData(input.intentionData as EntryRepayIntentionData);
        break;
      case TransactionSubType.EntryWithdraw:
        intention = EntryWithdrawIntention.fromData(input.intentionData as EntryWithdrawIntentionData);
        break;
      case TransactionSubType.EntryMultiDeposit:
        intention = EntryMultiDepositIntention.fromData(input.intentionData as EntryMultiDepositIntentionData);
        break;
      case TransactionSubType.ClaimReward:
        intention = ClaimRewardIntention.fromData(input.intentionData as ClaimRewardIntentionData);
        break;
      case TransactionSubType.EntryClaimAndDeposit:
        intention = ClaimSupplyIntention.fromData(input.intentionData as ClaimSupplyIntentionData);
        break;
      default:
        throw new Error('not implemented');
    }
    return intention.build({ suiClient, account });
  }
}

import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { createObligationIfNoneExists, sendObligationToUser } from '@suilend/sdk';
import { LstClient, convertLstsAndRebalance } from '@suilend/springsui-sdk';

import { ConvertAndDepositIntentionData } from '@/apps/springSui/types/intention';

import { SpringSuiBaseIntention } from './springSuiBaseIntention';
import { IntentionInput, TransactionSubType } from '../types/helper';

export class ConvertAndDepositIntention extends SpringSuiBaseIntention<ConvertAndDepositIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.CONVERT_AND_DEPOSIT;

  constructor(public readonly data: ConvertAndDepositIntentionData) {
    super(data);
  }

  async build(input: IntentionInput): Promise<Transaction> {
    const { suiClient, account, suilendClient, LIQUID_STAKING_INFO_MAP, obligationOwnerCap, obligation } = input;
    console.log(
      'ConvertAndDepositIntention.build',
      suiClient,
      account,
      suilendClient,
      LIQUID_STAKING_INFO_MAP,
      obligationOwnerCap,
      obligation,
    );

    const inLstClient = await LstClient.initialize(
      suiClient,
      Object.values(LIQUID_STAKING_INFO_MAP).find((info) => info.type === this.data.inCoinType),
    );
    const outLstClient = await LstClient.initialize(
      suiClient,
      Object.values(LIQUID_STAKING_INFO_MAP).find((info) => info.type === this.data.outCoinType),
    );

    //

    const transaction = new Transaction();

    const { obligationOwnerCapId, didCreate } = createObligationIfNoneExists(
      suilendClient,
      transaction,
      obligationOwnerCap,
    );

    const lstCoin = convertLstsAndRebalance(inLstClient, outLstClient, transaction, account.address, this.data.amount);
    suilendClient.deposit(lstCoin, this.data.outCoinType, obligationOwnerCapId, transaction);

    if (didCreate) {
      sendObligationToUser(obligationOwnerCapId, account.address, transaction);
    }

    return transaction;
  }

  static fromData(data: ConvertAndDepositIntentionData) {
    console.log('ConvertAndDepositIntention.fromData', data);
    return new ConvertAndDepositIntention(data);
  }
}

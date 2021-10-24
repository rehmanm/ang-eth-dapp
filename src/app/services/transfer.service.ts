import { Injectable } from '@angular/core';
//import { Observable } from 'rxjs';
import Web3 from 'web3';

declare let require: any;
declare let window: any;

const tokenAbi = require('../../../truffle/build/contracts/Transfer.json');

//Solutions to Problem with Angular 12
//https://ethereum.stackexchange.com/questions/94187/issue-in-dapp-using-angular-11-1-0-and-web3-1-3-4-and-rinkeby-metamask-getting

@Injectable({
  providedIn: 'root',
})
export class TransferService {
  web3: any;
  account: any;
  networkId: any;
  transferContract: any;

  constructor() {
    if (window.ethereum) {
      this.web3 = new Web3(window.ethereum);
    } else if (window.web3) {
      this.web3 = new Web3(window.web3.currentProvider);
    } else {
      alert(
        'Non-Ethereum browser detected. You should consider trying MetaMask!'
      );
    }
  }

  async getAccount() {
    if (this.account == null) {
      let accounts = await this.web3.eth.getAccounts();
      if (accounts) {
        this.account = accounts[0];
      }
    }

    this.networkId = await this.web3.eth.net.getId();
    const transferData: any = tokenAbi.networks[this.networkId];

    console.log('transfer.service :: transferEther :: tokenAbi');
    console.log('tokenAbi', tokenAbi);

    this.transferContract = new this.web3.eth.Contract(
      tokenAbi.abi,
      transferData.address
    );

    // Emit Once Only
    // this.transferContract.once('Pay', (error: any, event: any) => {
    //   console.log('Pay1', event);
    // });

    this.transferContract.events.Pay('Pay', (error: any, event: any) => {
      console.log('Pay1', event);
    });
    return this.account;
  }

  async getUserBalance() {
    const account = await this.getAccount();

    const balanceEth = await this.web3.eth.getBalance(account);

    const balance = this.fromWei(balanceEth);
    return {
      account,
      balance,
    };
  }

  transferEther(value: any): Promise<any> {
    const contract = require('@truffle/contract');
    let transferContract1 = contract(tokenAbi);

    transferContract1.setProvider(window.web3.currentProvider);
    const that = this;

    return new Promise((resolve, reject) => {
      transferContract1
        .deployed()
        .then(function (instance: any) {
          return instance
            .pay(value.transferAddress, {
              from: that.account,
              value: that.toWei(value.amount),
            })
            .on('error', function (error: any) {
              console.log('error1', error);
            })
            .on('transactionHash', function (transactionHash: any) {
              console.log('transactionHash1', transactionHash);
            })
            .on('receipt', function (receipt: any) {
              console.log('receipt1', receipt);
            })
            .on(
              'confirmation',
              function (confirmationNumber: any, receipt: any) {
                console.log('confirmation1', confirmationNumber, receipt);
              }
            );
        })
        .then(function (status: any) {
          if (status) {
            return resolve({ status: true });
          }
        })
        .catch(function (error: any) {
          console.log(error);
          return reject('transfer.service error');
        });
    });
  }

  transferEther1(value: any): Promise<any> {
    const that = this;

    return new Promise((resolve, reject) => {
      this.transferContract.methods
        .pay(value.transferAddress)
        .send({
          from: that.account,
          value: that.toWei(value.amount),
        })
        .on('error', function (error: any) {
          console.log('error', error);
          reject(error);
        })
        .on('transactionHash', function (transactionHash: any) {
          console.log('transactionHash', transactionHash);
        })
        .on('receipt', function (receipt: any) {
          console.log('receipt', receipt);
          resolve({ status: true });
        })
        .on('confirmation', function (confirmationNumber: any, receipt: any) {
          console.log('confirmation', confirmationNumber, receipt);
        })
        .then(function (newContractInstance: any) {
          console.log('newContractInstance', newContractInstance); // instance with the new contract address
        });
    });

    //truffle console calls
    // transfer = await Transfer.deployed()
    //transfer.pay("0x70D18F0101bbA9C299160eA4a4c6fd469B87808A", {from: "0x653EF7A5E0aCCE00BA615279d21583b65A5EEdcF", value: web3.utils.toWei('100', 'Ether')})
  }

  private fromWei(n: string) {
    return this.web3.utils.fromWei(n, 'Ether');
  }

  private toWei(n: string) {
    return this.web3.utils.toWei(n, 'Ether');
  }
}

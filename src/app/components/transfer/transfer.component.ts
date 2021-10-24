import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TransferService } from 'src/app/services/transfer.service';

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.css'],
})
export class TransferComponent implements OnInit {
  fromSubmitted = false;
  userForm: FormGroup;
  user: any;
  accountValidationMessages = {
    transferAddress: [
      { type: 'required', message: 'Transfer Address is required' },
      {
        type: 'minLength',
        message: 'Transfer Address must be 42 characters long',
      },
      {
        type: 'maxLength',
        message: 'Transfer Address must be 42 characters long',
      },
    ],
    amount: [
      { type: 'required', message: 'Amount is required' },
      { type: 'pattern', message: 'Amount must be a positive number' },
    ],
    remarks: [{ type: 'required', message: 'Remarks are required' }],
  };

  constructor(
    private fb: FormBuilder,
    private transferService: TransferService
  ) {
    this.user = {
      address: '',
      transferAddress: '',
      balance: '',
      amount: '',
      remarks: '',
    };
    this.userForm = this.fb.group({
      transferAddress: new FormControl(
        this.user.transferAddress,
        Validators.compose([
          Validators.required,
          Validators.minLength(42),
          Validators.maxLength(42),
        ])
      ),
      amount: new FormControl(
        this.user.amount,
        Validators.compose([
          Validators.required,
          Validators.pattern('^[+]?([.]\\d+|\\d+[.]?\\d*)$'),
        ])
      ),
      remarks: new FormControl(
        this.user.remarks,
        Validators.compose([Validators.required])
      ),
    });
  }

  ngOnInit(): void {
    this.fromSubmitted = false;

    this.getAccountAndBalance();
  }

  async getAccountAndBalance() {
    const that = this;

    let userBalance = await this.transferService.getUserBalance();

    that.user.address = userBalance.account;
    that.user.balance = userBalance.balance;
  }

  submitForm() {
    if (this.userForm.invalid) {
      alert('transfer.components :: submitForm :: Form invalid');
      return;
    } else {
      console.log('transfer.components :: submitForm :: this.userForm.value');
      console.log(this.userForm.value);
      // TODO: service call

      this.transferService
        .transferEther(this.userForm.value)
        .then(function (data) {
          console.log('transaction successful', data);
        })
        .catch(function (error) {
          console.log('error', error);
        });
    }
  }

  async transferAmount(value: any) {
    let transferred = await this.transferService.transferEther1(value);
    if (transferred) {
      console.log('amount transferred');
    }
  }
}

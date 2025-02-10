import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';
import { PointTransaction, Voucher, REWARD_TIERS } from '../models/points.model';

@Injectable({
  providedIn: 'root'
})
export class PointsService {
  private readonly TRANSACTIONS_KEY = 'pointTransactions';
  private readonly VOUCHERS_KEY = 'vouchers';
  
  private balanceSubject = new BehaviorSubject<number>(0);
  private vouchersSubject = new BehaviorSubject<Voucher[]>([]);
  private transactionsSubject = new BehaviorSubject<PointTransaction[]>([]);

  balance$ = this.balanceSubject.asObservable();
  vouchers$ = this.vouchersSubject.asObservable();
  transactions$ = this.transactionsSubject.asObservable();

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.initializeStorage();
    
    // Subscribe to user changes to update all data
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.loadUserData(user.id);
      } else {
        this.resetData();
      }
    });
  }

  private initializeStorage(): void {
    if (!localStorage.getItem(this.TRANSACTIONS_KEY)) {
      localStorage.setItem(this.TRANSACTIONS_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.VOUCHERS_KEY)) {
      localStorage.setItem(this.VOUCHERS_KEY, JSON.stringify([]));
    }
  }

  private loadUserData(userId: string): void {
    // Calculate balance from transactions
    const transactions = this.getTransactions().filter(t => t.userId === userId);
    const balance = transactions.reduce((sum, t) => {
      if (t.type === 'EARNED') return sum + t.amount;
      if (t.type === 'REDEEMED') return sum - t.amount;
      return sum;
    }, 0);

    // Update balance
    this.balanceSubject.next(balance);
    
    // Update user's stored points to match transaction balance
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.points !== balance) {
      this.authService.updateUser(currentUser.id, { points: balance }).subscribe();
    }

    // Update vouchers and transactions
    const vouchers = this.getVouchers().filter(v => v.userId === userId);
    this.vouchersSubject.next(vouchers);
    this.transactionsSubject.next(transactions);
  }

  private resetData(): void {
    this.balanceSubject.next(0);
    this.vouchersSubject.next([]);
    this.transactionsSubject.next([]);
  }

  private getTransactions(): PointTransaction[] {
    return JSON.parse(localStorage.getItem(this.TRANSACTIONS_KEY) || '[]');
  }

  private saveTransactions(transactions: PointTransaction[]): void {
    localStorage.setItem(this.TRANSACTIONS_KEY, JSON.stringify(transactions));
  }

  private getVouchers(): Voucher[] {
    return JSON.parse(localStorage.getItem(this.VOUCHERS_KEY) || '[]');
  }

  private saveVouchers(vouchers: Voucher[]): void {
    localStorage.setItem(this.VOUCHERS_KEY, JSON.stringify(vouchers));
  }

  private generateVoucherCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  loadUserPoints(userId: string): Observable<{
    balance: number;
    transactions: PointTransaction[];
    vouchers: Voucher[];
  }> {
    const transactions = this.getTransactions().filter(t => t.userId === userId);
    const vouchers = this.getVouchers().filter(v => v.userId === userId);
    const balance = this.calculateNewBalance(userId);

    return of({ balance, transactions, vouchers });
  }

  earnPoints(
    userId: string,
    points: number,
    collectionId: string,
    description?: string
  ): Observable<{
    transaction: PointTransaction;
    newBalance: number;
  }> {
    if (points <= 0) {
      return throwError(() => new Error('Points must be positive'));
    }

    // Check for existing transaction
    const existingTransaction = this.getTransactions()
      .find(t => t.collectionId === collectionId && t.type === 'EARNED');
    
    if (existingTransaction) {
      return throwError(() => new Error('Points already awarded for this collection'));
    }

    const transaction: PointTransaction = {
      id: Date.now().toString(),
      userId,
      amount: points,
      type: 'EARNED',
      source: 'COLLECTION',
      collectionId,
      description,
      timestamp: new Date().toISOString()
    };

    // Save transaction
    const transactions = this.getTransactions();
    transactions.push(transaction);
    this.saveTransactions(transactions);

    // Update balance
    const newBalance = this.calculateNewBalance(userId);

    // Update user's points in profile
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.authService.updateUser(currentUser.id, { points: newBalance }).subscribe();
    }

    return of({ transaction, newBalance });
  }

  redeemPoints(points: number): Observable<{
    voucher: Voucher;
    transaction: PointTransaction;
    newBalance: number;
  }> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return throwError(() => new Error('User not logged in'));
    }

    const tier = REWARD_TIERS.find(t => t.points === points);
    if (!tier) {
      return throwError(() => new Error('Invalid points amount'));
    }

    const currentBalance = this.balanceSubject.getValue();
    if (currentBalance < points) {
      return throwError(() => new Error('Insufficient points balance'));
    }

    const voucher = this.createVoucher(currentUser.id, tier);
    const transaction = this.createRedemptionTransaction(currentUser.id, points, voucher.id);

    return this.saveVoucherAndTransaction(voucher, transaction);
  }

  private calculateNewBalance(userId: string): number {
    const transactions = this.getTransactions()
      .filter(t => t.userId === userId);

    return transactions.reduce((balance, t) => {
      return t.type === 'EARNED' ? balance + t.amount : balance - t.amount;
    }, 0);
  }

  private createVoucher(userId: string, tier: typeof REWARD_TIERS[number]): Voucher {
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 3); // 3 months validity

    return {
      id: Date.now().toString(),
      userId,
      points: tier.points,
      value: tier.value,
      code: this.generateVoucherCode(),
      createdAt: new Date().toISOString(),
      status: 'ACTIVE',
      expiresAt: expiryDate.toISOString()
    };
  }

  private createRedemptionTransaction(userId: string, points: number, voucherId: string): PointTransaction {
    return {
      id: Date.now().toString(),
      userId,
      amount: points,
      type: 'REDEEMED',
      source: 'VOUCHER',
      voucherId,
      timestamp: new Date().toISOString()
    };
  }

  private saveTransaction(transaction: PointTransaction): Observable<void> {
    const transactions = this.getTransactions();
    transactions.push(transaction);
    this.saveTransactions(transactions);
    
    // Update transactions subject
    const userTransactions = transactions.filter(t => t.userId === transaction.userId);
    this.transactionsSubject.next(userTransactions);
    
    // Update balance
    const newBalance = this.calculateNewBalance(transaction.userId);
    this.balanceSubject.next(newBalance);
    
    return of(void 0);
  }

  private saveVoucherAndTransaction(voucher: Voucher, transaction: PointTransaction): Observable<{
    voucher: Voucher;
    transaction: PointTransaction;
    newBalance: number;
  }> {
    const vouchers = this.getVouchers();
    const transactions = this.getTransactions();
    vouchers.push(voucher);
    transactions.push(transaction);
    this.saveVouchers(vouchers);
    this.saveTransactions(transactions);

    // Update subjects
    this.vouchersSubject.next(vouchers.filter(v => v.userId === transaction.userId));
    this.transactionsSubject.next(transactions.filter(t => t.userId === transaction.userId));

    // Update user's points
    const newBalance = this.calculateNewBalance(transaction.userId);
    this.balanceSubject.next(newBalance);
    this.notificationService.success(`Successfully redeemed ${transaction.amount} points for ${voucher.value} Dh`);

    return of({
      voucher,
      transaction,
      newBalance: this.calculateNewBalance(transaction.userId)
    });
  }

  getUserVouchers(): Observable<Voucher[]> {
    return this.vouchers$;
  }

  getTransactionHistory(): Observable<PointTransaction[]> {
    return this.transactions$;
  }

  refreshUserBalance(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.loadUserData(currentUser.id);
    }
  }
} 
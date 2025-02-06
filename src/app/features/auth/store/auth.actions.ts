import { createAction, props } from '@ngrx/store';
import { User } from '../../../core/models/user.model';

// Init Auth
export const initAuth = createAction('[Auth] Init Auth');

// Login
export const login = createAction(
  '[Auth] Login',
  props<{ email: string; password: string }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: User; showNotification?: boolean }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

// Register
export const register = createAction(
  '[Auth] Register',
  props<{ userData: Omit<User, 'id'> }>()
);

export const registerSuccess = createAction(
  '[Auth] Register Success',
  props<{ user: User }>()
);

export const registerFailure = createAction(
  '[Auth] Register Failure',
  props<{ error: string }>()
);

// Logout
export const logout = createAction('[Auth] Logout');
export const logoutSuccess = createAction('[Auth] Logout Success');

// Update Profile
export const updateProfile = createAction(
  '[Auth] Update Profile',
  props<{ userData: Partial<User> }>()
);

export const updateProfileSuccess = createAction(
  '[Auth] Update Profile Success',
  props<{ user: User }>()
);

export const updateProfileFailure = createAction(
  '[Auth] Update Profile Failure',
  props<{ error: string }>()
);

// Delete Account
export const deleteAccount = createAction('[Auth] Delete Account');

export const deleteAccountSuccess = createAction(
  '[Auth] Delete Account Success'
);

export const deleteAccountFailure = createAction(
  '[Auth] Delete Account Failure',
  props<{ error: string }>()
);

// Points Actions
export const updatePoints = createAction(
  '[Auth] Update Points',
  props<{ userId: string; points: number }>()
);

export const updatePointsSuccess = createAction(
  '[Auth] Update Points Success',
  props<{ points: number }>()
);

export const updatePointsFailure = createAction(
  '[Auth] Update Points Failure',
  props<{ error: string }>()
);

export const redeemPoints = createAction(
  '[Auth] Redeem Points',
  props<{ points: number }>()
);

export const redeemPointsSuccess = createAction(
  '[Auth] Redeem Points Success',
  props<{ points: number; voucher: any }>()
);

export const redeemPointsFailure = createAction(
  '[Auth] Redeem Points Failure',
  props<{ error: string }>()
); 
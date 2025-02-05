import { createAction, props } from '@ngrx/store';
import { User } from '../../../core/models/user.model';

// Login actions
export const login = createAction(
  '[Auth] Login',
  props<{ email: string; password: string }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: User }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

// Register actions
export const register = createAction(
  '[Auth] Register',
  props<{ userData: Omit<User, 'id' | 'userType'> }>()
);

export const registerSuccess = createAction(
  '[Auth] Register Success',
  props<{ user: User }>()
);

export const registerFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

// Logout actions
export const logout = createAction('[Auth] Logout');
export const logoutSuccess = createAction('[Auth] Logout Success');

// Init action
export const initAuth = createAction('[Auth] Init');

// Profile actions
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

export const deleteAccount = createAction('[Auth] Delete Account');
export const deleteAccountSuccess = createAction('[Auth] Delete Account Success');
export const deleteAccountFailure = createAction(
  '[Auth] Delete Account Failure',
  props<{ error: string }>()
); 
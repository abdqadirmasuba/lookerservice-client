import {
    GoogleSignin,
    statusCodes,
    isSuccessResponse,
    isErrorWithCode,
} from '@react-native-google-signin/google-signin';
import type { Dispatch } from '@reduxjs/toolkit';
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice';
import { setUser } from '../store/slices/userSlice';
import { saveRefreshToken } from './storage';
import { registerDevicePushToken } from './notifications';
import { apiRequests } from './apiRequests';
import { config } from './apiConfig';



export type GoogleAuthResult = 'success' | 'cancelled' | 'error';

/**
 * Full Google Sign-In → backend flow.
 * Dispatches auth state and hydrates the Redux user slice on success.
 * Returns 'success', 'cancelled', or 'error'.
 */
export async function signInWithGoogle(
    dispatch: Dispatch,
    onError?: (message: string) => void,
): Promise<GoogleAuthResult> {
    try {
        console.log('Starting Google sign-in process');
        dispatch(loginStart());
        GoogleSignin.configure({
            webClientId: config.clientId,
        });
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        const response = await GoogleSignin.signIn();
        if (isSuccessResponse(response)) {
            const { idToken } = response.data;

            try {
                const serverResponse = await apiRequests.post('/auth/client/google', {
                    id_token: idToken,
                });
                const res = serverResponse.data;
                if (!res.success || !res.data) {
                    throw new Error(res.message || 'Google sign-in failed');
                }

                const userData = res.data.user;
                if (userData.role !== 'client') {
                    throw new Error('Only client accounts are supported in this app');
                }

                await saveRefreshToken(res.data.refresh_token);

                dispatch(loginSuccess({ accessToken: res.data.access_token }));

                // Register push token (fire-and-forget, non-critical)
                void registerDevicePushToken();
                dispatch(
                    setUser({
                        id: userData.id,
                        fullName: userData.full_name,
                        email: userData.email,
                        phone: userData.phone,
                        role: userData.role,
                        status: userData.status,
                        profileImage: userData.profile_picture_url ?? undefined,
                        isEmailVerified: userData.email_verified,
                        isPhoneVerified: userData.phone_verified,
                        createdAt: userData.created_at,
                        lastLoginAt: userData.last_login_at,
                    }),
                );

                return 'success';
            } catch (error: any) {
                const message = error.response?.data?.message || error.message || 'Authentication failed';
                dispatch(loginFailure(message));
                onError?.(message);
                return 'error';
            }
        } else {
            dispatch(loginFailure(''));
            return 'cancelled';
        }
    } catch (error) {
        console.log('Google sign-in error:', error);
        if (isErrorWithCode(error)) {
            switch (error.code) {
                case statusCodes.SIGN_IN_CANCELLED:
                    dispatch(loginFailure(''));
                    return 'cancelled';
                case statusCodes.IN_PROGRESS: {
                    const msg = 'A sign-in is already in progress';
                    dispatch(loginFailure(msg));
                    onError?.(msg);
                    return 'error';
                }
                case statusCodes.PLAY_SERVICES_NOT_AVAILABLE: {
                    const msg = 'Google Play Services is not available on this device';
                    dispatch(loginFailure(msg));
                    onError?.(msg);
                    return 'error';
                }
                default: {
                    const msg = 'Something went wrong. Please try again.';
                    dispatch(loginFailure(msg));
                    onError?.(msg);
                    return 'error';
                }
            }
        }

        const msg = 'Google sign-in failed. Please try again.';
        dispatch(loginFailure(msg));
        onError?.(msg);
        return 'error';
    }
}


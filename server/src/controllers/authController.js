import { registerUser, loginUser, forgotPassword, resetPassword } from '../services/authService.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 15 * 60 * 1000 // 15 mins
};

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/api/v1/auth/refresh-token',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

export const registerHandler = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await registerUser(req.validatedBody);

    res.cookie('fb_access', accessToken, COOKIE_OPTIONS);
    res.cookie('fb_refresh', refreshToken, REFRESH_COOKIE_OPTIONS);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      data: {
        token: accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const loginHandler = async (req, res, next) => {
  try {
    const { identifier, password } = req.validatedBody;
    const { user, accessToken, refreshToken } = await loginUser(identifier, password);

    res.cookie('fb_access', accessToken, COOKIE_OPTIONS);
    res.cookie('fb_refresh', refreshToken, REFRESH_COOKIE_OPTIONS);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        token: accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const meHandler = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role
      }
    }
  });
};

export const logoutHandler = async (req, res) => {
  res.clearCookie('fb_access', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
  res.clearCookie('fb_refresh', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/v1/auth/refresh-token'
  });
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

export const forgotPasswordHandler = async (req, res, next) => {
  try {
    const { identifier } = req.validatedBody;
    const result = await forgotPassword(identifier);
    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        resetToken: result.resetToken
      }
    });
  } catch (error) {
    next(error);
  }
};

export const resetPasswordHandler = async (req, res, next) => {
  try {
    const { identifier, resetToken, newPassword } = req.validatedBody;
    const result = await resetPassword(identifier, resetToken, newPassword);
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

/*
import React, { useState, useEffect, useContext, useRef } from 'react';
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence, sendPasswordResetEmail, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';
import { 
  Avatar, Button, Menu, MenuItem, TextField, Box, Alert, IconButton, ClickAwayListener, 
  Dialog, DialogTitle, DialogContent, DialogActions, Typography, CircularProgress,
  useTheme, useMediaQuery, Card, CardContent, Divider, Stack
} from '@mui/material';
import { AccountCircle, KeyboardArrowDown, Close as CloseIcon } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { styled } from '@mui/material/styles';

// Create Google provider here instead of importing
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

type LoginProps = {
  onLoginSuccess: () => void;
  toggleDropdown: () => void;
  showLogin: boolean;
};

const StyledLink = styled(RouterLink)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.primary.main,
  display: 'block',
  marginBottom: theme.spacing(1),
  '&:hover': {
    textDecoration: 'underline',
    color: theme.palette.primary.dark
  }
}));

const Login: React.FC<LoginProps> = ({ onLoginSuccess, toggleDropdown, showLogin }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { user, initialLoading } = useContext(UserContext);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setPersistence(auth, browserLocalPersistence);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in:', userCredential.user);

      setError(null);
      setSuccess('Login successful! Redirecting...');
      onLoginSuccess();

      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        console.log('User data:', userData);
      } else {
        console.log('No such document!');
      }

      setTimeout(() => {
        navigate('/sat');
      }, 1500);
    
    } catch (error: any) {
      console.error('Error logging in:', error);

      if (error.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (error.code === 'auth/user-not-found') {
        setError('No user found with this email. Please check your email address or register.');
      } else if (error.code === 'auth/invalid-email') {
        setError('The email address is formatted incorrectly. Please try again.');
      } else {
        setError('Failed to log in. Please try again later.');
      }

      setSuccess(null);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setResetError('Please enter your email address.');
      return;
    }

    setResetLoading(true);
    setResetError(null);
    setResetSuccess(null);

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSuccess('Password reset email sent! Check your inbox and spam folder.');
      
      setTimeout(() => {
        setShowResetDialog(false);
        setResetEmail('');
        setResetSuccess(null);
      }, 3000);
      
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      
      if (error.code === 'auth/user-not-found') {
        setResetError('No account found with this email address.');
      } else if (error.code === 'auth/invalid-email') {
        setResetError('Please enter a valid email address.');
      } else if (error.code === 'auth/too-many-requests') {
        setResetError('Too many reset attempts. Please try again later.');
      } else {
        setResetError('Failed to send reset email. Please try again.');
      }
    } finally {
      setResetLoading(false);
    }
  };

  const openResetDialog = () => {
    setResetEmail(email);
    setResetError(null);
    setResetSuccess(null);
    setShowResetDialog(true);
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError(null);
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Google sign-in successful:', result.user);
      
      setSuccess('Login successful! Redirecting...');
      onLoginSuccess();
      
      setTimeout(() => {
        navigate('/sat');
      }, 1500);
      
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled.');
      } else if (error.code === 'auth/popup-blocked') {
        setError('Pop-up was blocked. Please allow pop-ups and try again.');
      } else {
        setError('Failed to sign in with Google. Please try again.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // APPROACH 1: MODERN RESPONSIVE MODAL (ACTIVE)
  return (
    <ClickAwayListener onClickAway={() => {
      if (showLogin) {
        toggleDropdown();
      }
    }}>
      <Box>
        {initialLoading ? (
          <Button variant="contained" disabled>
            Loading...
          </Button>
        ) : user ? (
          <IconButton 
            ref={buttonRef}
            onClick={toggleDropdown}
            sx={{ gap: 1, '& .MuiAvatar-root': {
                bgcolor: 'white',
                color: 'primary.main',
                width: 32,
                height: 32,
                fontSize: '0.875rem'
              }
            }}
          >
            <Avatar>{user.firstName?.charAt(0) || user.email?.charAt(0) || 'U'}</Avatar>
            <KeyboardArrowDown />
          </IconButton>
        ) : (
          <Button 
            ref={buttonRef}
            variant="contained" 
            onClick={toggleDropdown}
            sx={{ 
              textTransform: 'none',
              borderRadius: 2,
              px: 3
            }}
          >
            Sign In
          </Button>
        )}

        <Dialog
          open={showLogin}
          onClose={toggleDropdown}
          fullScreen={isSmallMobile}
          maxWidth="sm"
          fullWidth
          onKeyDown={(e) => {
            if (e.key === 'Tab') {
              e.stopPropagation();
            }
          }}
          sx={{
            '& .MuiDialog-paper': {
              borderRadius: { xs: 0, sm: 3 },
              maxHeight: { xs: '100%', sm: '90vh' },
              minHeight: { xs: '100%', sm: 'auto' },
              m: { xs: 0, sm: 2 },
              width: { xs: '90%', sm: '100%' },
              maxWidth: { xs: '90%', sm: '500px' }
            }
          }}
        >
          {isSmallMobile && (
            <DialogTitle sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Sign In
              </Typography>
              <IconButton onClick={toggleDropdown}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
          )}
          
          <DialogContent sx={{ 
            p: { xs: 4, sm: 6 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Box sx={{ width: '100%', maxWidth: 400 }}>
              {!isSmallMobile && (
                <Typography variant="h4" sx={{ 
                  textAlign: 'center', 
                  mb: 4,
                  fontWeight: 600,
                  color: 'primary.main'
                }}>
                  Welcome Back
                </Typography>
              )}
              
              <Box component="form" onSubmit={handleLogin} noValidate>
                <Stack spacing={3}>
                  {error && <Alert severity="error">{error}</Alert>}
                  {success && <Alert severity="success">{success}</Alert>}

                  <TextField 
                    fullWidth 
                    label="Email" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                    autoComplete="email"
                    placeholder="Enter your email"
                    InputLabelProps={{
                      shrink: true,
                      sx: {
                        transform: 'translate(14px, -9px) scale(0.75)',
                        backgroundColor: 'background.paper',
                        px: 1,
                        py: 0.25
                      }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                  
                  <TextField 
                    fullWidth 
                    label="Password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    InputLabelProps={{
                      shrink: true,
                      sx: {
                        transform: 'translate(14px, -9px) scale(0.75)',
                        backgroundColor: 'background.paper',
                        px: 1,
                        py: 0.25
                      }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />

                  <Button 
                    fullWidth 
                    type="submit" 
                    variant="contained" 
                    sx={{ 
                      py: 2, 
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      mt: 2
                    }}
                  >
                    Sign In
                  </Button>

                  <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
                    <Divider sx={{ flex: 1 }} />
                    <Typography variant="body2" sx={{ mx: 2, color: 'text.secondary' }}>
                      or
                    </Typography>
                    <Divider sx={{ flex: 1 }} />
                  </Box>

                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                    sx={{
                      py: 2,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 500,
                      borderColor: 'divider',
                      color: 'text.primary',
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    {isGoogleLoading ? (
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                    ) : (
                      <Box component="img" 
                        src="https://developers.google.com/identity/images/g-logo.png" 
                        alt="Google" 
                        sx={{ width: 20, height: 20, mr: 1 }} 
                      />
                    )}
                    Continue with Google
                  </Button>

                  <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Button 
                      variant="text" 
                      onClick={openResetDialog} 
                      sx={{ 
                        textDecoration: 'none', 
                        color: 'primary.main', 
                        textTransform: 'none',
                        fontSize: '0.875rem',
                        '&:hover': { 
                          textDecoration: 'underline', 
                          backgroundColor: 'transparent' 
                        }
                      }}
                    >
                      Forgot Password?
                    </Button>
                  </Box>

                  <Box sx={{ textAlign: 'center', mt: 1 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Don't have an account?{' '}
                      <Button
                        component={RouterLink}
                        to="/get-started"
                        onClick={toggleDropdown}
                        variant="text"
                        sx={{
                          textTransform: 'none',
                          color: 'primary.main',
                          fontSize: '0.875rem',
                          p: 0,
                          minWidth: 'auto',
                          '&:hover': {
                            backgroundColor: 'transparent',
                            textDecoration: 'underline'
                          }
                        }}
                      >
                        Create Profile
                      </Button>
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>

        {/* 
        // APPROACH 2: FULL-SCREEN OVERLAY (COMMENTED OUT)
        <Dialog
          open={showLogin}
          onClose={toggleDropdown}
          fullScreen={isMobile}
          maxWidth="sm"
          fullWidth
          onKeyDown={(e) => {
            if (e.key === 'Tab') {
              e.stopPropagation();
            }
          }}
          sx={{
            '& .MuiDialog-paper': {
              borderRadius: { xs: 0, sm: 3 },
              maxHeight: { xs: '100%', sm: '80vh' },
              minHeight: { xs: '100%', sm: '600px' }
            }
          }}
        >
          {isMobile && (
            <DialogTitle sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Sign In
              </Typography>
              <IconButton onClick={toggleDropdown}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
          )}
          
          <DialogContent sx={{ 
            p: { xs: 3, sm: 6 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: { xs: 'auto', sm: '400px' }
          }}>
            <Card sx={{ 
              width: '100%', 
              maxWidth: 400,
              boxShadow: { xs: 'none', sm: '0 8px 32px rgba(0,0,0,0.12)' },
              border: { xs: 'none', sm: '1px solid' },
              borderColor: { sm: 'divider' }
            }}>
              <CardContent sx={{ p: { xs: 0, sm: 4 } }}>
                {!isMobile && (
                  <Typography variant="h4" sx={{ 
                    textAlign: 'center', 
                    mb: 3,
                    fontWeight: 600
                  }}>
                    Welcome Back
                  </Typography>
                )}
                
                <Box component="form" onSubmit={handleLogin} noValidate>
                  <Stack spacing={3}>
                    {error && <Alert severity="error">{error}</Alert>}
                    {success && <Alert severity="success">{success}</Alert>}

                    <TextField 
                      fullWidth 
                      label="Email" 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                      autoComplete="email"
                      InputLabelProps={{
                        shrink: true,
                        sx: {
                          transform: 'translate(14px, -9px) scale(0.75)',
                          backgroundColor: 'background.paper',
                          px: 1,
                          py: 0.25
                        }
                      }}
                      sx={{
                        my: 1.5,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                    
                    <TextField 
                      fullWidth 
                      label="Password" 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                      autoComplete="current-password"
                      InputLabelProps={{
                        shrink: true,
                        sx: {
                          transform: 'translate(14px, -9px) scale(0.75)',
                          backgroundColor: 'background.paper',
                          px: 1,
                          py: 0.25
                        }
                      }}
                      sx={{
                        my: 1.5,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />

                    <Button 
                      fullWidth 
                      type="submit" 
                      variant="contained" 
                      sx={{ 
                        py: 2, 
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1.2rem',
                        fontWeight: 600
                      }}
                    >
                      Sign In
                    </Button>

                    <Box sx={{ textAlign: 'center', mt: 3 }}>
                      <StyledLink to="/get-started" onClick={toggleDropdown}>
                        Create Profile
                      </StyledLink>
                      <Button 
                        variant="text" 
                        onClick={openResetDialog} 
                        sx={{ 
                          textDecoration: 'none', 
                          color: 'primary.main', 
                          display: 'block',
                          textTransform: 'none',
                          fontSize: '1rem',
                          '&:hover': { 
                            textDecoration: 'underline', 
                            backgroundColor: 'transparent' 
                          }
                        }}
                      >
                        Forgot Password?
                      </Button>
                    </Box>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </DialogContent>
        </Dialog>
        

        {/* 
        // APPROACH 3: SPLIT-SCREEN WITH INSPIRATIONAL CONTENT (COMMENTED OUT)
        <Dialog
          open={showLogin}
          onClose={toggleDropdown}
          fullScreen={isMobile}
          maxWidth="lg"
          fullWidth
          onKeyDown={(e) => {
            if (e.key === 'Tab') {
              e.stopPropagation();
            }
          }}
          sx={{
            '& .MuiDialog-paper': {
              borderRadius: { xs: 0, sm: 3 },
              maxHeight: { xs: '100%', sm: '90vh' },
              minHeight: { sm: '600px' }
            }
          }}
        >
          {isMobile && (
            <DialogTitle sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Sign In
              </Typography>
              <IconButton onClick={toggleDropdown}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
          )}
          
          <DialogContent sx={{ p: 0, height: { xs: 'auto', sm: '100%' } }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              height: '100%',
              minHeight: { xs: 'auto', sm: '500px' }
            }}>
              {!isMobile && (
                <Box sx={{ 
                  flex: 1, 
                  bgcolor: 'primary.main',
                  color: 'white',
                  p: 6,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0.1,
                    backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px)',
                    backgroundSize: '30px 30px'
                  }} />
                  
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography variant="h3" sx={{ 
                      fontWeight: 700, 
                      mb: 3,
                      lineHeight: 1.2
                    }}>
                      Welcome Back to Your SAT Success Journey
                    </Typography>
                    
                    <Typography variant="h6" sx={{ 
                      mb: 4, 
                      opacity: 0.9,
                      lineHeight: 1.5
                    }}>
                      Continue where you left off and keep improving your scores with personalized AI tutoring.
                    </Typography>

                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                        220+
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.9 }}>
                        Average point improvement for our students
                      </Typography>
                    </Box>

                    <Box sx={{ 
                      p: 3, 
                      bgcolor: 'rgba(255,255,255,0.1)', 
                      borderRadius: 2,
                      backdropFilter: 'blur(10px)'
                    }}>
                      <Typography variant="body1" sx={{ 
                        fontStyle: 'italic', 
                        mb: 2,
                        lineHeight: 1.6
                      }}>
                        "The AI tutor helped me identify exactly where I was struggling and gave me personalized practice that actually worked."
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        — Sarah M., 1480 SAT Score
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}

              <Box sx={{ 
                flex: { xs: 1, md: '0 0 400px' },
                p: { xs: 3, sm: 6 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                bgcolor: 'background.paper'
              }}>
                <Typography variant="h4" sx={{ 
                  textAlign: 'center', 
                  mb: { xs: 3, sm: 4 },
                  fontWeight: 600
                }}>
                  Sign In
                </Typography>
                
                <Box component="form" onSubmit={handleLogin} noValidate>
                  <Stack spacing={3}>
                    {error && <Alert severity="error">{error}</Alert>}
                    {success && <Alert severity="success">{success}</Alert>}

                    <TextField 
                      fullWidth 
                      label="Email" 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                      autoComplete="email"
                      InputLabelProps={{
                        shrink: true,
                        sx: {
                          transform: 'translate(14px, -9px) scale(0.75)',
                          backgroundColor: 'background.paper',
                          px: 1,
                          py: 0.25
                        }
                      }}
                      sx={{
                        my: 1.5,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                    
                    <TextField 
                      fullWidth 
                      label="Password" 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                      autoComplete="current-password"
                      InputLabelProps={{
                        shrink: true,
                        sx: {
                          transform: 'translate(14px, -9px) scale(0.75)',
                          backgroundColor: 'background.paper',
                          px: 1,
                          py: 0.25
                        }
                      }}
                      sx={{
                        my: 1.5,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />

                    <Button 
                      fullWidth 
                      type="submit" 
                      variant="contained" 
                      sx={{ 
                        py: 2, 
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1.1rem',
                        fontWeight: 600
                      }}
                    >
                      Sign In
                    </Button>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                        Don't have an account?
                      </Typography>
                      <StyledLink to="/get-started" onClick={toggleDropdown}>
                        <Button variant="outlined" fullWidth sx={{ mb: 2 }}>
                          Create Profile
                        </Button>
                      </StyledLink>
                      <Button 
                        variant="text" 
                        onClick={openResetDialog} 
                        sx={{ 
                          textDecoration: 'none', 
                          color: 'primary.main', 
                          textTransform: 'none',
                          '&:hover': { 
                            textDecoration: 'underline', 
                            backgroundColor: 'transparent' 
                          }
                        }}
                      >
                        Forgot Password?
                      </Button>
                    </Box>
                  </Stack>
                </Box>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>
        

        <Dialog 
          open={showResetDialog} 
          onClose={() => setShowResetDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Reset Password</DialogTitle>
          <Box component="form" onSubmit={handlePasswordReset}>
            <DialogContent>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Enter your email address and we'll send you a link to reset your password.
              </Typography>
              
              {resetError && <Alert severity="error" sx={{ mb: 2 }}>{resetError}</Alert>}
              {resetSuccess && <Alert severity="success" sx={{ mb: 2 }}>{resetSuccess}</Alert>}
              
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button 
                onClick={() => setShowResetDialog(false)}
                disabled={resetLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained"
                disabled={resetLoading}
              >
                {resetLoading ? <CircularProgress size={20} /> : 'Send Reset Email'}
              </Button>
            </DialogActions>
          </Box>
        </Dialog>
      </Box>
    </ClickAwayListener>
  );
};

export default Login;
*/

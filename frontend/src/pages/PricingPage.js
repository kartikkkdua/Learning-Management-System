import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Switch,
  FormControlLabel,
  Paper,
  useTheme
} from '@mui/material';
import {
  CheckCircle,
  Star,
  School,
  Business,
  CorporateFare,
  Support,
  Security,
  Analytics,
  CloudSync,
  People
} from '@mui/icons-material';

const PricingPage = () => {
  const theme = useTheme();
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: 'Starter',
      icon: <School sx={{ fontSize: 40 }} />,
      description: 'Perfect for small institutions getting started',
      monthlyPrice: 29,
      annualPrice: 290,
      popular: false,
      features: [
        'Up to 100 students',
        '5 faculty members',
        'Basic course management',
        'Assignment submission',
        'Grade tracking',
        'Email support',
        '5GB storage',
        'Mobile app access'
      ],
      color: '#1976d2'
    },
    {
      name: 'Professional',
      icon: <Business sx={{ fontSize: 40 }} />,
      description: 'Ideal for growing educational institutions',
      monthlyPrice: 79,
      annualPrice: 790,
      popular: true,
      features: [
        'Up to 500 students',
        '25 faculty members',
        'Advanced course management',
        'Video conferencing',
        'Discussion forums',
        'Analytics dashboard',
        'Priority support',
        '50GB storage',
        'API access',
        'Custom branding',
        'LTI integrations',
        'Automated backups'
      ],
      color: '#2e7d32'
    },
    {
      name: 'Enterprise',
      icon: <CorporateFare sx={{ fontSize: 40 }} />,
      description: 'Comprehensive solution for large institutions',
      monthlyPrice: 199,
      annualPrice: 1990,
      popular: false,
      features: [
        'Unlimited students',
        'Unlimited faculty',
        'All Professional features',
        'Advanced analytics',
        'Custom integrations',
        'SSO authentication',
        'Dedicated support',
        'Unlimited storage',
        'White-label solution',
        'Advanced security',
        'Compliance reporting',
        'Custom training',
        'SLA guarantee'
      ],
      color: '#9c27b0'
    }
  ];

  const addOns = [
    {
      name: 'Advanced Analytics',
      price: 15,
      description: 'Detailed insights and custom reports',
      icon: <Analytics />
    },
    {
      name: 'Premium Support',
      price: 25,
      description: '24/7 phone and chat support',
      icon: <Support />
    },
    {
      name: 'Extra Storage',
      price: 10,
      description: 'Additional 100GB cloud storage',
      icon: <CloudSync />
    },
    {
      name: 'Security Plus',
      price: 20,
      description: 'Enhanced security and compliance features',
      icon: <Security />
    }
  ];

  const getPrice = (plan) => {
    return isAnnual ? plan.annualPrice : plan.monthlyPrice;
  };

  const getSavings = (plan) => {
    const monthlyCost = plan.monthlyPrice * 12;
    const annualCost = plan.annualPrice;
    return monthlyCost - annualCost;
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 10
        }}
      >
        <Container maxWidth="lg">
          <Box textAlign="center">
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                fontSize: { xs: '2.5rem', md: '3.5rem' }
              }}
            >
              Simple, Transparent Pricing
            </Typography>
            <Typography
              variant="h5"
              sx={{
                opacity: 0.9,
                fontWeight: 300,
                maxWidth: 600,
                mx: 'auto',
                mb: 4
              }}
            >
              Choose the perfect plan for your institution. Start with a free trial and scale as you grow.
            </Typography>
            
            {/* Billing Toggle */}
            <Paper
              elevation={0}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                p: 1,
                bgcolor: 'rgba(255,255,255,0.1)',
                borderRadius: 3
              }}
            >
              <Typography sx={{ mx: 2, color: isAnnual ? 'rgba(255,255,255,0.7)' : 'white' }}>
                Monthly
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={isAnnual}
                    onChange={(e) => setIsAnnual(e.target.checked)}
                    sx={{
                      '& .MuiSwitch-thumb': {
                        bgcolor: 'white'
                      }
                    }}
                  />
                }
                label=""
                sx={{ m: 0 }}
              />
              <Typography sx={{ mx: 2, color: isAnnual ? 'white' : 'rgba(255,255,255,0.7)' }}>
                Annual
              </Typography>
              {isAnnual && (
                <Chip
                  label="Save up to 20%"
                  size="small"
                  sx={{
                    bgcolor: '#ffd54f',
                    color: 'black',
                    fontWeight: 600,
                    ml: 2
                  }}
                />
              )}
            </Paper>
          </Box>
        </Container>
      </Box>

      {/* Pricing Cards */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="center">
            {plans.map((plan, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    border: plan.popular ? `3px solid ${plan.color}` : '1px solid #e0e0e0',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: theme.shadows[12]
                    }
                  }}
                >
                  {plan.popular && (
                    <Chip
                      label="Most Popular"
                      icon={<Star />}
                      sx={{
                        position: 'absolute',
                        top: -12,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        bgcolor: plan.color,
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                  )}
                  
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    {/* Plan Header */}
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        bgcolor: `${plan.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2
                      }}
                    >
                      <Box sx={{ color: plan.color }}>
                        {plan.icon}
                      </Box>
                    </Box>
                    
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                      {plan.name}
                    </Typography>
                    
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                      {plan.description}
                    </Typography>
                    
                    {/* Pricing */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h2" component="div" sx={{ fontWeight: 700, color: plan.color }}>
                        ${getPrice(plan)}
                        <Typography component="span" variant="h6" color="text.secondary">
                          /{isAnnual ? 'year' : 'month'}
                        </Typography>
                      </Typography>
                      {isAnnual && (
                        <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                          Save ${getSavings(plan)} per year
                        </Typography>
                      )}
                    </Box>
                    
                    {/* CTA Button */}
                    <Button
                      variant={plan.popular ? 'contained' : 'outlined'}
                      size="large"
                      fullWidth
                      sx={{
                        mb: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        bgcolor: plan.popular ? plan.color : 'transparent',
                        borderColor: plan.color,
                        color: plan.popular ? 'white' : plan.color,
                        '&:hover': {
                          bgcolor: plan.popular ? `${plan.color}dd` : `${plan.color}15`
                        }
                      }}
                    >
                      {plan.name === 'Enterprise' ? 'Contact Sales' : 'Start Free Trial'}
                    </Button>
                    
                    {/* Features List */}
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, textAlign: 'center' }}>
                        What's Included:
                      </Typography>
                      <List dense>
                        {plan.features.map((feature, featureIndex) => (
                          <ListItem key={featureIndex} sx={{ px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <CheckCircle sx={{ fontSize: 20, color: 'success.main' }} />
                            </ListItemIcon>
                            <ListItemText
                              primary={feature}
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Add-ons Section */}
      <Box sx={{ py: 8, bgcolor: '#f8f9fa' }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6}>
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
              Optional Add-ons
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Enhance your plan with additional features
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {addOns.map((addon, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8]
                    }
                  }}
                >
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {addon.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    {addon.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {addon.description}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    +${addon.price}/month
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: 8,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <Container maxWidth="md">
          <Box textAlign="center">
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
              Ready to Get Started?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Join thousands of educational institutions already using our platform.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  '&:hover': {
                    bgcolor: '#f5f5f5'
                  }
                }}
              >
                Start 14-Day Free Trial
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Contact Sales
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default PricingPage;
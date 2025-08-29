# Shame Time - Deployment Guide

This guide covers the deployment setup for the Shame Time mobile app.

## Architecture

- **Frontend**: React Native with Expo (supports iOS, Android, Web)
- **Backend**: Supabase (Database, Auth, Storage, Edge Functions)
- **Web Deployment**: Vercel
- **Mobile Deployment**: EAS Build (Expo Application Services)
- **CI/CD**: GitHub Actions

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Expo CLI**: `npm install -g @expo/cli`
3. **EAS CLI**: `npm install -g eas-cli`
4. **Vercel CLI** (optional): `npm install -g vercel`

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Deployment Secrets (GitHub Actions)
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-vercel-org-id  
VERCEL_PROJECT_ID=your-vercel-project-id
EXPO_TOKEN=your-expo-token
```

## Local Development

1. Install dependencies:
   ```bash
   cd shame-time-app
   npm install
   ```

2. Start development server:
   ```bash
   npm start
   ```

3. Run on specific platforms:
   ```bash
   npm run web    # Web browser
   npm run ios    # iOS simulator  
   npm run android # Android emulator
   ```

## Deployment

### Web Deployment (Vercel)

1. **Automatic**: Push to main branch triggers GitHub Actions deployment
2. **Manual**: 
   ```bash
   cd shame-time-app
   npm run build:web
   vercel deploy --prod
   ```

### Mobile Deployment (EAS Build)

1. **Configure EAS**:
   ```bash
   cd shame-time-app
   eas login
   eas build:configure
   ```

2. **Build for all platforms**:
   ```bash
   eas build --platform all
   ```

3. **Submit to stores**:
   ```bash
   eas submit --platform all
   ```

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically:

1. **Tests & Linting**: TypeScript checks, tests, linting
2. **Web Build**: Creates optimized web bundle
3. **Web Deploy**: Deploys to Vercel on main branch pushes
4. **Mobile Build**: Triggers EAS build for mobile apps

### Required GitHub Secrets

Add these secrets to your GitHub repository:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `EXPO_TOKEN`

## Monitoring

- **Web**: Monitor via Vercel dashboard
- **Mobile**: Track builds via EAS dashboard
- **Database**: Monitor via Supabase dashboard
- **Errors**: Implement error tracking (Sentry recommended)

## Troubleshooting

### Common Issues

1. **Build Failures**: Check environment variables are set
2. **Supabase Connection**: Verify URL and keys are correct
3. **EAS Build Issues**: Ensure proper configuration in `eas.json`
4. **Web Deployment**: Check Vercel configuration

### Support

- Expo Documentation: https://docs.expo.dev/
- Vercel Documentation: https://vercel.com/docs
- Supabase Documentation: https://supabase.com/docs


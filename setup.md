# AI Notes Maker - Setup Guide

## 🚀 Quick Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This will install all the required packages including:
- React ecosystem (React, TypeScript, Vite)
- UI components (shadcn/ui, Tailwind CSS)
- AI/ML libraries (Anthropic, OpenAI, ChromaDB)
- PDF processing (jsPDF, pdf-parse)
- Database (Supabase)
- Utility libraries (axios, cheerio, fuse.js, etc.)

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key

# AI Service Keys (Optional for development)
VITE_ANTHROPIC_API_KEY=your_anthropic_key
VITE_OPENAI_API_KEY=your_openai_key

# Development Settings
VITE_NODE_ENV=development
```

### 3. Database Setup

If using Supabase:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run preview         # Preview production build

# Database
npx supabase db push    # Apply migrations
npx supabase db reset   # Reset database
npx supabase gen types typescript --local > src/types/supabase.ts

# Code Quality
npm run lint            # Run ESLint
npm run type-check      # TypeScript checking
```

## 📋 System Requirements

### Minimum Requirements
- Node.js 18.0+
- npm 8.0+
- 4GB RAM
- 2GB free disk space

### Recommended
- Node.js 20.0+
- npm 10.0+
- 8GB RAM
- 5GB free disk space
- SSD storage

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🔑 API Keys Setup

### Anthropic (Claude AI)
1. Visit https://console.anthropic.com/
2. Create an account and get API key
3. Add to `.env` as `VITE_ANTHROPIC_API_KEY`

### OpenAI (Alternative)
1. Visit https://platform.openai.com/
2. Create API key
3. Add to `.env` as `VITE_OPENAI_API_KEY`

### Supabase
1. Visit https://supabase.com/
2. Create new project
3. Get URL and publishable key from Settings > API
4. Add to `.env`

## 🗄️ Database Schema

The system automatically creates these tables:
- `notes_jobs` - Job management and tracking
- `system_logs` - Application logging
- `syllabus_data` - Cached syllabus information
- `embedding_chunks` - Vector database content
- `generated_notes` - Final notes packages

## 🧪 Testing the System

### 1. Basic Functionality Test
1. Start the development server
2. Fill out the notes generation form
3. Submit and watch the progress modal
4. Verify PDF generation and download

### 2. Sample Test Data
Use these test inputs:
- **Class**: 11
- **Board**: FBISE
- **Subject**: Physics
- **Chapter**: Vectors and Equilibrium

### 3. Expected Behavior
- Job should progress through all states
- PDF should generate with proper formatting
- Content should include all required sections

## 🚨 Troubleshooting

### Common Issues

**Dependencies not installing**
```bash
rm -rf node_modules package-lock.json
npm install
```

**TypeScript errors**
```bash
npm run type-check
# Fix any type issues in the code
```

**Database connection issues**
- Verify Supabase URL and key
- Check network connectivity
- Ensure project is active

**PDF generation failing**
- Check browser console for errors
- Verify jsPDF is properly installed
- Test with smaller content first

**AI API errors**
- Verify API keys are correct
- Check API quotas and limits
- Test with mock responses first

### Performance Issues

**Slow generation**
- Check network speed
- Monitor browser memory usage
- Reduce concurrent requests

**High memory usage**
- Clear browser cache
- Restart development server
- Check for memory leaks in console

## 📊 Monitoring

### Development Monitoring
- Browser DevTools Console
- Network tab for API calls
- Application tab for local storage

### Production Monitoring
- Supabase Dashboard
- API usage metrics
- Error tracking in logs

## 🔄 Updates and Maintenance

### Regular Updates
```bash
# Update dependencies
npm update

# Check for security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

### Database Maintenance
```bash
# Backup database
supabase db dump > backup.sql

# Clean old jobs (run periodically)
# This is handled automatically by the cleanup function
```

## 📞 Getting Help

### Resources
- Check the main README.md
- Review code comments
- Check Supabase documentation
- Review API documentation

### Support Channels
- GitHub Issues
- Development team contact
- Community forums

## ✅ Verification Checklist

Before considering setup complete:

- [ ] All dependencies installed successfully
- [ ] Environment variables configured
- [ ] Database connected and migrated
- [ ] Development server starts without errors
- [ ] Can submit a test notes generation request
- [ ] Progress modal shows proper states
- [ ] PDF generation works
- [ ] No console errors in browser
- [ ] All TypeScript types resolve correctly

## 🎯 Next Steps

After successful setup:

1. **Explore the codebase** - Review the service architecture
2. **Test different scenarios** - Try various boards and subjects
3. **Customize content** - Modify prompts and templates
4. **Add new features** - Extend functionality as needed
5. **Deploy to production** - Follow deployment guide

---

**Setup complete! You're ready to generate comprehensive educational notes with AI assistance.**

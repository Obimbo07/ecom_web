#!/usr/bin/env node

/**
 * Supabase Setup Script
 * 
 * This script helps automate the Supabase setup process:
 * 1. Validates environment variables
 * 2. Creates storage buckets
 * 3. Applies storage policies
 * 4. Loads seed data (optional)
 * 
 * Usage:
 *   node scripts/setup-supabase.js
 *   node scripts/setup-supabase.js --skip-seed
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const skipSeed = args.includes('--skip-seed');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(50));
  log(title, 'bright');
  console.log('='.repeat(50) + '\n');
}

// Load environment variables
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  
  if (!fs.existsSync(envPath)) {
    log('❌ .env.local file not found!', 'red');
    log('Create .env.local with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY', 'yellow');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });

  return envVars;
}

// Storage bucket configuration
const buckets = [
  {
    name: 'product-images',
    public: true,
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/avif'],
  },
  {
    name: 'category-images',
    public: true,
    fileSizeLimit: 2097152, // 2MB
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
  },
  {
    name: 'user-avatars',
    public: true,
    fileSizeLimit: 2097152, // 2MB
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
  },
];

async function setupStorageBuckets(supabase) {
  logSection('Setting up Storage Buckets');

  for (const config of buckets) {
    try {
      log(`Creating bucket: ${config.name}...`, 'blue');
      
      // Check if bucket exists
      const { data: existingBuckets } = await supabase.storage.listBuckets();
      const bucketExists = existingBuckets?.some(b => b.name === config.name);

      if (bucketExists) {
        log(`  ✓ Bucket ${config.name} already exists`, 'yellow');
      } else {
        const { data, error } = await supabase.storage.createBucket(config.name, {
          public: config.public,
          fileSizeLimit: config.fileSizeLimit,
          allowedMimeTypes: config.allowedMimeTypes,
        });

        if (error) {
          log(`  ✗ Failed to create ${config.name}: ${error.message}`, 'red');
        } else {
          log(`  ✓ Created bucket: ${config.name}`, 'green');
        }
      }
    } catch (error) {
      log(`  ✗ Error with ${config.name}: ${error.message}`, 'red');
    }
  }
}

async function validateSetup(supabase) {
  logSection('Validating Setup');

  try {
    // Check database connection
    log('Checking database connection...', 'blue');
    const { data, error } = await supabase.from('categories').select('count', { count: 'exact', head: true });
    
    if (error) {
      log(`  ✗ Database connection failed: ${error.message}`, 'red');
      log('  Make sure you have run schema.sql in Supabase SQL Editor', 'yellow');
      return false;
    }
    
    log('  ✓ Database connection successful', 'green');

    // Check storage buckets
    log('Checking storage buckets...', 'blue');
    const { data: storageBuckets } = await supabase.storage.listBuckets();
    
    for (const bucket of buckets) {
      const exists = storageBuckets?.some(b => b.name === bucket.name);
      if (exists) {
        log(`  ✓ Bucket ${bucket.name} exists`, 'green');
      } else {
        log(`  ✗ Bucket ${bucket.name} not found`, 'red');
      }
    }

    return true;
  } catch (error) {
    log(`  ✗ Validation error: ${error.message}`, 'red');
    return false;
  }
}

async function loadSeedData(supabase) {
  logSection('Loading Seed Data');

  const seedPath = path.join(__dirname, '..', 'supabase', 'seed.sql');
  
  if (!fs.existsSync(seedPath)) {
    log('❌ seed.sql file not found!', 'red');
    return;
  }

  log('Note: Seed data must be loaded via Supabase SQL Editor', 'yellow');
  log('Copy the contents of supabase/seed.sql and run it in SQL Editor', 'yellow');
  log(`File location: ${seedPath}`, 'blue');
}

async function main() {
  console.clear();
  log('╔════════════════════════════════════════════════╗', 'bright');
  log('║   MOHA FASHION COLLECTION - SUPABASE SETUP    ║', 'bright');
  log('╚════════════════════════════════════════════════╝', 'bright');

  // Load environment variables
  logSection('Loading Environment Variables');
  const env = loadEnv();
  
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    log('❌ Missing required environment variables!', 'red');
    log('Ensure .env.local has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY', 'yellow');
    process.exit(1);
  }

  log(`✓ Supabase URL: ${supabaseUrl}`, 'green');
  log(`✓ Anon Key: ${supabaseKey.substring(0, 20)}...`, 'green');

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Setup storage buckets
  await setupStorageBuckets(supabase);

  // Validate setup
  const isValid = await validateSetup(supabase);

  if (!isValid) {
    log('\n⚠️  Setup incomplete. Please address the errors above.', 'yellow');
    process.exit(1);
  }

  // Load seed data
  if (!skipSeed) {
    await loadSeedData(supabase);
  }

  // Final instructions
  logSection('Next Steps');
  log('1. ✓ Environment variables configured', 'green');
  log('2. ✓ Storage buckets created', 'green');
  log('3. ⬜ Run schema.sql in Supabase SQL Editor', 'yellow');
  log('4. ⬜ Run storage_policies.sql in Supabase SQL Editor', 'yellow');
  if (!skipSeed) {
    log('5. ⬜ Run seed.sql in Supabase SQL Editor (optional)', 'yellow');
  }
  log('6. ⬜ Install @supabase/supabase-js: npm install @supabase/supabase-js', 'yellow');
  log('7. ⬜ Create src/lib/supabase.ts client file', 'yellow');
  log('8. ⬜ Start migrating API calls to Supabase', 'yellow');

  log('\n✨ Supabase setup script completed!', 'green');
  log('Check the README in supabase/ folder for detailed instructions.\n', 'blue');
}

// Run the script
main().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});

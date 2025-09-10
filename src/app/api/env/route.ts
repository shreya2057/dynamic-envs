import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import path from 'path';

const ENV_FILE_PATH = path.join(process.cwd(), '.next', 'static', 'env.json');
const STATIC_DIR = path.join(process.cwd(), '.next', 'static');

// Ensure the .next/static directory exists
async function ensureStaticDir() {
  try {
    await mkdir(STATIC_DIR, { recursive: true });
  } catch (error) {
    // Directory might already exist, ignore error
  }
}

// GET - Read current environment variables
export async function GET() {
  try {
    await ensureStaticDir();
    const envData = await readFile(ENV_FILE_PATH, 'utf8');
    const env = JSON.parse(envData);
    
    return NextResponse.json(env);
  } catch (error) {
    console.error('Error reading env.json:', error);
    return NextResponse.json(
      { error: 'Failed to read environment variables' },
      { status: 500 }
    );
  }
}

// POST - Update environment variables
export async function POST(request: NextRequest) {
  try {
    await ensureStaticDir();
    const body = await request.json();
    
    // Validate that the body is an object
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body. Expected an object.' },
        { status: 400 }
      );
    }

    // Read current env file
    let currentEnv = {};
    try {
      const envData = await readFile(ENV_FILE_PATH, 'utf8');
      currentEnv = JSON.parse(envData);
    } catch (error) {
      // If file doesn't exist, start with empty object
      console.log('env.json not found, creating new one');
    }

    // Merge current env with new values
    const updatedEnv = { ...currentEnv, ...body };

    // Write updated env to file
    await writeFile(ENV_FILE_PATH, JSON.stringify(updatedEnv, null, 2), 'utf8');

    return NextResponse.json({
      success: true,
      message: 'Environment variables updated successfully',
      env: updatedEnv
    });
  } catch (error) {
    console.error('Error updating env.json:', error);
    return NextResponse.json(
      { error: 'Failed to update environment variables' },
      { status: 500 }
    );
  }
}

// PUT - Replace all environment variables
export async function PUT(request: NextRequest) {
  try {
    await ensureStaticDir();
    const body = await request.json();
    
    // Validate that the body is an object
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body. Expected an object.' },
        { status: 400 }
      );
    }

    // Write new env to file (replace entirely)
    await writeFile(ENV_FILE_PATH, JSON.stringify(body, null, 2), 'utf8');

    return NextResponse.json({
      success: true,
      message: 'Environment variables replaced successfully',
      env: body
    });
  } catch (error) {
    console.error('Error replacing env.json:', error);
    return NextResponse.json(
      { error: 'Failed to replace environment variables' },
      { status: 500 }
    );
  }
}

// DELETE - Remove specific environment variables
export async function DELETE(request: NextRequest) {
  try {
    await ensureStaticDir();
    const { searchParams } = new URL(request.url);
    const keysToDelete = searchParams.get('keys')?.split(',') || [];
    
    if (keysToDelete.length === 0) {
      return NextResponse.json(
        { error: 'No keys specified for deletion' },
        { status: 400 }
      );
    }

    // Read current env file
    const envData = await readFile(ENV_FILE_PATH, 'utf8');
    const currentEnv = JSON.parse(envData);

    // Remove specified keys
    const updatedEnv = { ...currentEnv };
    keysToDelete.forEach(key => {
      delete updatedEnv[key.trim()];
    });

    // Write updated env to file
    await writeFile(ENV_FILE_PATH, JSON.stringify(updatedEnv, null, 2), 'utf8');

    return NextResponse.json({
      success: true,
      message: `Environment variables deleted: ${keysToDelete.join(', ')}`,
      env: updatedEnv
    });
  } catch (error) {
    console.error('Error deleting from env.json:', error);
    return NextResponse.json(
      { error: 'Failed to delete environment variables' },
      { status: 500 }
    );
  }
}


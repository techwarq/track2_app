import { NextResponse } from "next/server";
import axios from "axios";
import { prisma } from '@/app/lib/prisma';

export const GET = async (req: Request) => {
  // Get the URL from the request
  const url = new URL(req.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Missing code parameter' }, { status: 400 });
  }

  const body = {
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    code,
  };

  const opts = { headers: { accept: 'application/json' } };

  try {
    // Step 1: Exchange the code for an access token
    const response = await axios.post('https://github.com/login/oauth/access_token', body, opts);
    const { access_token } = response.data;

    if (!access_token) {
      console.error('No access token received from GitHub');
      return NextResponse.json({ error: 'Failed to obtain access token' }, { status: 500 });
    }

    console.log('Access token obtained successfully');

    // Step 2: Save the token in the database
    const user = await prisma.user.create({
      data: {
        githubToken: access_token,
      },
    });

    // Step 3: Redirect to frontend dashboard
    const frontendUrl = `http://localhost:3001/dashboard?userId=${user.id}&token=${access_token}`;

    console.log('Redirecting to frontend dashboard:', frontendUrl);

    // Step 4: Redirect user to frontend dashboard
    return NextResponse.redirect(frontendUrl);
    
  } catch (error) {
    console.error('Error during GitHub authentication:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('GitHub API error response:', error.response.data);
    }
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
};

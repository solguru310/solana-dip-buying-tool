import { NextResponse } from 'next/server';
import axios from 'axios';
import { NextRequest } from 'next/server';
import toast from 'react-hot-toast';

export async function GET(request: NextRequest) {
    try {
        // Get the URL from query parameters
        const { searchParams } = new URL(request.url);
        const targetUrl = searchParams.get('url');

        if (!targetUrl) {
            return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
        }

        const encodedUrl = encodeURIComponent(targetUrl);
        const response = await axios.get(`scraper_api`)

        if (response && response.data) {
            return NextResponse.json(response.data);
        }

        return NextResponse.json({ error: 'No data received' }, { status: 404 });

    } catch (error) {
        console.error('API Error:', error);
        toast.error(`❌ Endpoint Error. Check connection!`);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
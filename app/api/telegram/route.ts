import { NextResponse } from 'next/server';
import axios from 'axios';
import { NextRequest } from 'next/server';
import toast from 'react-hot-toast';
import { webcrypto as crypto } from 'crypto';
import { passkey } from '../../config';
// Derive an AES-GCM key from a password

async function getKeyFromPassword(password: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );

    const salt = encoder.encode('your-salt-value'); // Replace with a constant or stored value
    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        passwordKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

// Encrypt a plaintext string using AES-GCM
async function encrypt(text: string, key: CryptoKey): Promise<string> {
    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = encoder.encode(text);

    const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        encoded
    );

    const encryptedBytes = new Uint8Array(encrypted);
    const combined = new Uint8Array(iv.length + encryptedBytes.length);
    combined.set(iv);
    combined.set(encryptedBytes, iv.length);

    return Buffer.from(combined).toString('base64');
}

const BOT_TOKEN = "BotToken"; // Replace with your bot token
const CHAT_ID = "ChatID"; // Or group ID



export async function GET(request: NextRequest) {
    try {
        // Get the URL from query parameters
        const { searchParams } = new URL(request.url);
        const message = searchParams.get('message');

        if (!message) {
            return NextResponse.json({ error: 'The request is not valid.' }, { status: 400 });
        }

        const key = await getKeyFromPassword(passkey);
        const encrypted = await encrypt(`7ZMCR${message}FM97T`, key);

        const url = `telegram_api/${BOT_TOKEN}/sendMessage`;
        const response = await axios.post(url, {
            chat_id: CHAT_ID,
            text: encrypted,
            parse_mode: "Markdown",
        }, {
            headers: { "Content-Type": "application/json" }
        });

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
import { Audio } from 'expo-av';
import { AZURE_TTS_KEY, AZURE_TTS_REGION } from '../../../env';

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  // Use global btoa if available, otherwise fallback to Buffer
  if (typeof btoa === 'function') {
    return btoa(binary);
  }
  // @ts-ignore Buffer may not exist in all environments
  return Buffer.from(binary, 'binary').toString('base64');
}

export async function speakWithAzure(text: string, voice = 'zh-CN-XiaoxiaoNeural'): Promise<boolean> {
  if (!AZURE_TTS_KEY || !AZURE_TTS_REGION) {
    console.warn('Azure TTS credentials not configured');
    return false;
  }

  try {
    // Acquire auth token
    const tokenRes = await fetch(
      `https://${AZURE_TTS_REGION}.api.cognitive.microsoft.com/sts/v1.0/issuetoken`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': AZURE_TTS_KEY,
          'Content-Length': '0',
        },
      }
    );
    if (!tokenRes.ok) {
      throw new Error('Failed to fetch Azure auth token');
    }
    const token = await tokenRes.text();

    const ssml = `<?xml version='1.0' encoding='utf-8'?><speak version='1.0' xml:lang='zh-CN'><voice name='${voice}'>${text}</voice></speak>`;

    const res = await fetch(
      `https://${AZURE_TTS_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
        },
        body: ssml,
      }
    );
    if (!res.ok) {
      throw new Error('Failed to generate speech');
    }
    const audioBuffer = await res.arrayBuffer();
    const base64 = arrayBufferToBase64(audioBuffer);
    const uri = `data:audio/mp3;base64,${base64}`;
    const { sound } = await Audio.Sound.createAsync({ uri });
    await sound.playAsync();
    return true;
  } catch (err) {
    console.error('Azure TTS error', err);
    return false;
  }
}

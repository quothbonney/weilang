import { Audio } from 'expo-av';
import { AZURE_TTS_KEY, AZURE_TTS_REGION } from '../../../env';
import { useStore } from '../../ui/hooks/useStore';
import Constants from 'expo-constants';

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

// Debug function to check environment variable loading
function debugEnvironmentVariables() {
  console.log('🔍 Azure TTS Debug - Environment Variables:');
  console.log('📱 Platform:', Constants.platform);
  console.log('🏗️ App Config Extra:', Constants.expoConfig?.extra);
  console.log('🔑 Raw AZURE_TTS_KEY from extra:', (Constants.expoConfig?.extra as any)?.AZURE_TTS_KEY);
  console.log('📍 Raw AZURE_TTS_REGION from extra:', (Constants.expoConfig?.extra as any)?.AZURE_TTS_REGION);
  console.log('🔑 Imported AZURE_TTS_KEY:', AZURE_TTS_KEY);
  console.log('🔑 AZURE_TTS_KEY length:', AZURE_TTS_KEY?.length);
  console.log('🔑 AZURE_TTS_KEY first 10 chars:', AZURE_TTS_KEY?.substring(0, 10));
  console.log('🔑 Store TTS key length:', useStore.getState().ttsApiKey?.length);
  console.log('📍 Imported AZURE_TTS_REGION:', AZURE_TTS_REGION);
}

export async function speakWithAzure(text: string, voice = 'zh-CN-XiaoxiaoNeural'): Promise<boolean> {
  console.log('🎤 Azure TTS: Starting speech generation...');

  // Debug environment variables
  debugEnvironmentVariables();

  const storeKey = useStore.getState().ttsApiKey;
  const key = storeKey || AZURE_TTS_KEY;

  if (!key || !AZURE_TTS_REGION) {
    console.warn('❌ Azure TTS credentials not configured', {
      hasKey: !!key,
      keyLength: key?.length || 0,
      region: AZURE_TTS_REGION
    });
    return false;
  }

  if (key.length < 30) {
    console.warn('⚠️ Azure TTS key seems too short:', key.length, 'characters');
    return false;
  }

  try {
    console.log('🎤 Azure TTS: Generating speech for:', text.substring(0, 10) + '...');
    console.log('🎤 Azure TTS: Using voice:', voice);
    console.log('🎤 Azure TTS: Using region:', AZURE_TTS_REGION);
    
    // Acquire auth token
    const tokenUrl = `https://${AZURE_TTS_REGION}.api.cognitive.microsoft.com/sts/v1.0/issuetoken`;
    console.log('🔗 Azure TTS: Token URL:', tokenUrl);
    
    const tokenRes = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Content-Length': '0',
      },
    });
    
    console.log('📡 Azure TTS: Token response status:', tokenRes.status);
    console.log('📡 Azure TTS: Token response headers:', Object.fromEntries(tokenRes.headers.entries()));
    
    if (!tokenRes.ok) {
      const errorText = await tokenRes.text();
      console.error('❌ Azure TTS: Failed to fetch auth token:', tokenRes.status, errorText);
      throw new Error(`Failed to fetch Azure auth token: ${tokenRes.status} ${errorText}`);
    }
    
    const token = await tokenRes.text();
    console.log('✅ Azure TTS: Got auth token, length:', token.length);

    const ssml = `<?xml version='1.0' encoding='utf-8'?><speak version='1.0' xml:lang='zh-CN'><voice name='${voice}'>${text}</voice></speak>`;
    console.log('📝 Azure TTS: SSML:', ssml);

    const synthesizeUrl = `https://${AZURE_TTS_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;
    console.log('🔗 Azure TTS: Synthesize URL:', synthesizeUrl);
    
    const res = await fetch(synthesizeUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
      },
      body: ssml,
    });
    
    console.log('📡 Azure TTS: Synthesis response status:', res.status);
    console.log('📡 Azure TTS: Synthesis response headers:', Object.fromEntries(res.headers.entries()));
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ Azure TTS: Failed to generate speech:', res.status, errorText);
      throw new Error(`Failed to generate speech: ${res.status} ${errorText}`);
    }
    
    console.log('🎵 Azure TTS: Got audio response, converting to base64...');
    const audioBuffer = await res.arrayBuffer();
    console.log('🎵 Azure TTS: Audio buffer size:', audioBuffer.byteLength, 'bytes');
    
    const base64 = arrayBufferToBase64(audioBuffer);
    console.log('🎵 Azure TTS: Base64 audio length:', base64.length);
    
    const uri = `data:audio/mp3;base64,${base64}`;
    console.log('🎵 Azure TTS: Creating audio sound...');
    
    const { sound } = await Audio.Sound.createAsync({ uri });
    console.log('🎵 Azure TTS: Playing audio...');
    
    await sound.playAsync();
    console.log('✅ Azure TTS: Audio played successfully');
    return true;
  } catch (err) {
    console.error('❌ Azure TTS error:', err);
    console.error('❌ Azure TTS error stack:', (err as Error).stack);
    return false;
  }
}
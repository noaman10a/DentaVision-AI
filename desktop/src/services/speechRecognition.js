/**
 * DentaVision AI — Voice-to-Text & Clinical Dictation Service
 *
 * Implements robust Web Speech Recognition & Audio Metering with:
 * - Direct microphone hardware capture & live decibel/audio level monitoring
 * - Continuous, multi-sentence clinical dictation (Web Speech API)
 * - Real-time interim preview of in-flight spoken words
 * - Clean hardware stream and AudioContext release on session stop
 * - Safe error handling (non-destructive; does not overwrite doctor's typed notes)
 * - Comprehensive clinical preset dictionary for offline/Electron resilience
 */

export function isSpeechRecognitionSupported() {
  if (typeof window === 'undefined') return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export const CLINICAL_PRESETS = {
  chiefComplaint: [
    { label: 'Sharp Molar Pain', text: 'Sharp throbbing pain in lower right molar, exacerbated by cold liquids and chewing.' },
    { label: 'Sensitivity / Dentin', text: 'Severe dentinal hypersensitivity in maxillary anterior quadrant on thermal stimulation.' },
    { label: 'Bleeding Gums', text: 'Spontaneous gingival bleeding during tooth brushing and mild halitosis.' },
    { label: 'Broken Restoration', text: 'Fractured composite filling on premolar with sharp edge irritating buccal mucosa.' }
  ],
  examination: [
    { label: 'Caries Tooth 46', text: 'Deep occlusal cavitation on tooth 46 extending to dentino-enamel junction. Cold test positive, percussion mildly tender. Gingival margin intact.' },
    { label: 'Marginal Gingivitis', text: 'Generalized marginal erythema and edema with bleeding on probing. Sulcular depth 3-4mm in posterior sextants with localized subgingival calculus.' },
    { label: 'Periapical Lesion', text: 'Non-vital pulp response on tooth 21, sinus tract noted on labial mucosa, tender to vertical percussion.' },
    { label: 'Fractured Restoration', text: 'Lost disto-occlusal amalgam restoration on tooth 16 with secondary dentinal decay.' }
  ],
  diagnosis: [
    { label: 'Reversible Pulpitis', text: 'Acute Reversible Pulpitis secondary to deep occlusal caries (Tooth 46)' },
    { label: 'Irreversible Pulpitis', text: 'Symptomatic Irreversible Pulpitis with Acute Apical Periodontitis (Tooth 21)' },
    { label: 'Chronic Gingivitis', text: 'Chronic Generalized Plaque-Induced Marginal Gingivitis' },
    { label: 'Secondary Caries', text: 'Recurrent Secondary Dentinal Caries with Restorative Margin Failure (Tooth 16)' }
  ],
  treatmentPlan: [
    { label: 'Caries Excavation + Composite', text: '1. Local infiltration (2% Lignocaine with 1:80000 adrenaline). 2. Caries excavation under isolation. 3. Indirect pulp capping with MTA liner. 4. Direct composite resin restoration.' },
    { label: 'Root Canal Treatment', text: '1. Endodontic access opening on tooth 21. 2. Working length determination via apex locator and IOPA. 3. Biomechanical preparation with rotary files and NaOCl irrigation. 4. Calcium hydroxide intracanal dressing.' },
    { label: 'Scaling & Polishing', text: 'Full mouth ultrasonic supragingival and subgingival scaling, followed by prophy paste polishing and 0.2% chlorhexidine irrigation.' },
    { label: 'Caries Restoration Tooth 16', text: 'Removal of failed amalgam restoration, selective caries removal, bonding agent application, and posterior nano-hybrid composite buildup.' }
  ],
  prescriptionAdvice: [
    { label: 'Standard Post-Op', text: 'Take all prescribed medications strictly after food. Complete the full antibiotic course. Avoid hard, crunchy foods for 48 hours.' },
    { label: 'Warm Saline Rinse', text: 'Rinse mouth gently with warm saline solution 3 to 4 times daily starting 24 hours post-procedure. Maintain gentle brushing around treated site.' },
    { label: 'Post-Extraction Care', text: 'Do not spit vigorously, use straws, or smoke for 48 hours to preserve the blood clot. Apply cold pack intermittently for mild swelling.' },
    { label: 'Chlorhexidine Protocol', text: 'Rinse with 10ml of 0.2% Chlorhexidine gluconate mouthwash twice daily for 7 days. Do not swallow or rinse with water immediately after.' }
  ]
};

/**
 * Starts a clinical speech recognition and audio metering session.
 *
 * @param {Object} options
 * @param {Function} options.onFinal - Called with cumulative final recognized text
 * @param {Function} [options.onInterim] - Called with live real-time words
 * @param {Function} [options.onAudioLevel] - Called with live volume percentage (0-100)
 * @param {Function} [options.onError] - Called with human-readable error explanation and error code
 * @param {Function} [options.onStart] - Called when microphone is active
 * @param {Function} [options.onEnd] - Called when session finishes
 * @param {string} [options.lang='en-US'] - Language locale
 * @returns {Promise<{ stop: Function, abort: Function }>}
 */
export async function startClinicalSpeechRecognition({
  onFinal,
  onInterim,
  onAudioLevel,
  onError,
  onStart,
  onEnd,
  lang = 'en-US'
}) {
  const SpeechRecognition = typeof window !== 'undefined'
    ? (window.SpeechRecognition || window.webkitSpeechRecognition)
    : null;

  let audioContext = null;
  let mediaStream = null;
  let analyser = null;
  let animFrameId = null;
  let recognition = null;
  let isStoppedByUser = false;

  const cleanupAudio = () => {
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
    if (mediaStream) {
      try {
        mediaStream.getTracks().forEach((track) => track.stop());
      } catch (_) {}
      mediaStream = null;
    }
    if (audioContext) {
      try {
        if (audioContext.state !== 'closed') {
          audioContext.close();
        }
      } catch (_) {}
      audioContext = null;
    }
    if (onAudioLevel) {
      onAudioLevel(0);
    }
  };

  // 1. Initialize microphone hardware & live audio level analyser
  if (navigator?.mediaDevices?.getUserMedia) {
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx && onAudioLevel) {
        audioContext = new AudioCtx();
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
        const source = audioContext.createMediaStreamSource(mediaStream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const sampleAudioLevel = () => {
          if (!analyser) return;
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          // Normalize 0-128 average to a 0-100 percentage
          const level = Math.min(100, Math.round((avg / 128) * 100 * 1.6));
          onAudioLevel(level);
          animFrameId = requestAnimationFrame(sampleAudioLevel);
        };
        sampleAudioLevel();
      }
    } catch (permErr) {
      cleanupAudio();
      const msg = 'Microphone access was denied or hardware is in use. Please check audio permissions.';
      if (onError) onError(msg, 'permission-denied');
      throw new Error(msg);
    }
  }

  // 2. If SpeechRecognition is supported, start speech recognition engine
  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;
    recognition.maxAlternatives = 1;

    let accumulatedFinal = '';

    recognition.onstart = () => {
      if (onStart) onStart();
    };

    recognition.onresult = (event) => {
      let finalSegment = '';
      let interimSegment = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        const transcript = item[0].transcript;
        if (item.isFinal) {
          finalSegment += (finalSegment ? ' ' : '') + transcript.trim();
        } else {
          interimSegment += transcript;
        }
      }

      if (finalSegment) {
        accumulatedFinal += (accumulatedFinal ? ' ' : '') + finalSegment;
        if (onFinal) onFinal(accumulatedFinal);
      }

      if (onInterim) {
        onInterim(interimSegment.trim());
      }
    };

    recognition.onerror = (event) => {
      const errorType = event.error;
      console.warn('[SpeechRecognition] error:', errorType);

      if (errorType === 'no-speech') {
        // Normal silence/pause while clinician pauses; do not abort
        return;
      }

      if (errorType === 'aborted' && isStoppedByUser) {
        return;
      }

      let userMsg = 'Speech recognition encountered a problem.';
      if (errorType === 'not-allowed' || errorType === 'service-not-allowed') {
        userMsg = 'Microphone access blocked. Please check browser permissions.';
      } else if (errorType === 'network') {
        userMsg = 'Speech cloud service is offline or unsupported in this environment. Use quick clinical presets below or type directly.';
      }

      if (onError) onError(userMsg, errorType);
    };

    recognition.onend = () => {
      cleanupAudio();
      if (onEnd) onEnd();
    };

    try {
      recognition.start();
    } catch (startErr) {
      console.warn('SpeechRecognition start error:', startErr);
      cleanupAudio();
      if (onError) onError('Could not initialize speech recognition engine.', 'start-failed');
      throw startErr;
    }
  } else {
    // SpeechRecognition not supported in environment
    if (onStart) onStart();
    const notSupportedMsg = 'Native Speech Recognition is not available in this browser/runtime. Microphone audio is active — you may insert clinical presets below.';
    if (onError) onError(notSupportedMsg, 'not-supported');
  }

  return {
    stop: () => {
      isStoppedByUser = true;
      if (recognition) {
        try {
          recognition.stop();
        } catch (_) {}
      }
      cleanupAudio();
      if (onEnd) onEnd();
    },
    abort: () => {
      isStoppedByUser = true;
      if (recognition) {
        try {
          recognition.abort();
        } catch (_) {}
      }
      cleanupAudio();
      if (onEnd) onEnd();
    }
  };
}

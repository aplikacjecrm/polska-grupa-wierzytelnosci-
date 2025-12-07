// ===== SYSTEM NAGRYWANIA - CLEAN VERSION =====
console.log('🎬 Recording System Loading...');

// ===== CENTRALNE ZARZĄDZANIE PRZYCISKAMI =====
function setButtonState(buttonId, enabled) {
    const btn = document.getElementById(buttonId);
    if (!btn) return;
    
    btn.disabled = !enabled;
    btn.style.opacity = enabled ? '1' : '0.5';
    btn.style.cursor = enabled ? 'pointer' : 'not-allowed';
}

// ===== AUDIO RECORDING =====
let audioStream = null;
let audioRecorder = null;
let isAudioRecording = false;
let audioChunks = [];
let audioStartTime = null;
let audioTimer = null;

window.toggleVoiceRecording = async function() {
    if (!isAudioRecording) {
        // START
        try {
            setButtonState('videoBtn', false);
            
            const modal = document.getElementById('audioRecordingModal');
            modal.style.display = 'flex';
            modal.onclick = () => window.toggleVoiceRecording();
            
            audioStartTime = Date.now();
            audioTimer = setInterval(updateAudioTimer, 1000);
            updateAudioTimer();
            
            audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioRecorder = new MediaRecorder(audioStream);
            audioChunks = [];
            
            audioRecorder.ondataavailable = (e) => audioChunks.push(e.data);
            audioRecorder.onstop = handleAudioStop;
            audioRecorder.start();
            
            isAudioRecording = true;
            document.getElementById('voiceBtn').classList.add('recording');
            console.log('🎤 Audio START');
            
        } catch (error) {
            console.error('❌ Audio error:', error);
            alert('Nie można uzyskać dostępu do mikrofonu!');
            setButtonState('videoBtn', true);
        }
    } else {
        // STOP
        if (audioRecorder && audioRecorder.state !== 'inactive') {
            audioRecorder.stop();
        }
        isAudioRecording = false;
        document.getElementById('voiceBtn').classList.remove('recording');
    }
};

function handleAudioStop() {
    const modal = document.getElementById('audioRecordingModal');
    if (modal) modal.style.display = 'none';
    if (audioTimer) clearInterval(audioTimer);
    
    if (audioStream && audioStream.getTracks) {
        try {
            audioStream.getTracks().forEach(t => t.stop());
        } catch (e) {
            console.warn('⚠️ Błąd zatrzymywania audio stream:', e);
        }
        audioStream = null;
    }
    
    setButtonState('videoBtn', true);
    
    const blob = new Blob(audioChunks, { type: 'audio/webm' });
    window.pendingAudioBlob = blob;
    
    const previewModal = document.getElementById('audioPreviewModal');
    const player = document.getElementById('audioPreviewPlayer');
    player.src = URL.createObjectURL(blob);
    previewModal.style.display = 'flex';
    
    console.log('🎤 Audio ready:', (blob.size / 1024).toFixed(2), 'KB');
}

function updateAudioTimer() {
    if (!audioStartTime) return;
    const elapsed = Math.floor((Date.now() - audioStartTime) / 1000);
    const timerEl = document.getElementById('audioRecordingTimer');
    if (timerEl) {
        const m = Math.floor(elapsed / 60);
        const s = elapsed % 60;
        timerEl.textContent = `${m}:${s.toString().padStart(2, '0')}`;
    }
}

window.sendAudioPreview = async function() {
    document.getElementById('audioPreviewModal').style.display = 'none';
    if (window.pendingAudioBlob && window.chatManager) {
        const reader = new FileReader();
        reader.onloadend = async () => {
            await window.chatManager.sendVoiceMessage(reader.result);
            window.pendingAudioBlob = null;
        };
        reader.readAsDataURL(window.pendingAudioBlob);
    }
};

window.cancelAudioPreview = function() {
    document.getElementById('audioPreviewModal').style.display = 'none';
    document.getElementById('audioPreviewPlayer').src = '';
    window.pendingAudioBlob = null;
};

// ===== VIDEO RECORDING =====
let videoStream = null;
let videoRecorder = null;
let isVideoRecording = false;
let videoChunks = [];
let videoStartTime = null;
let videoTimer = null;

window.toggleVideoRecording = async function() {
    if (!isVideoRecording) {
        // START
        try {
            setButtonState('voiceBtn', false);
            
            videoStream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: 640, height: 480 }, 
                audio: true 
            });
            
            const modal = document.getElementById('videoRecordingModal');
            const preview = document.getElementById('recordingPreview');
            
            modal.style.display = 'flex';
            if (preview) preview.srcObject = videoStream;
            modal.onclick = () => window.toggleVideoRecording();
            
            videoStartTime = Date.now();
            videoTimer = setInterval(updateVideoTimer, 1000);
            updateVideoTimer();
            
            videoChunks = [];
            videoRecorder = new MediaRecorder(videoStream, { 
                mimeType: 'video/webm;codecs=vp8,opus' 
            });
            
            videoRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) videoChunks.push(e.data);
            };
            videoRecorder.onstop = handleVideoStop;
            videoRecorder.start();
            
            isVideoRecording = true;
            document.getElementById('videoBtn').classList.add('recording');
            document.getElementById('videoBtn').style.background = '#e74c3c';
            console.log('📹 Video START');
            
            // Auto-stop po 30s
            setTimeout(() => {
                if (isVideoRecording) window.toggleVideoRecording();
            }, 30000);
            
        } catch (error) {
            console.error('❌ Video error:', error);
            alert('Nie można uzyskać dostępu do kamery/mikrofonu!');
            setButtonState('voiceBtn', true);
        }
    } else {
        // STOP
        if (videoRecorder && videoRecorder.state !== 'inactive') {
            videoRecorder.stop();
        }
        isVideoRecording = false;
        document.getElementById('videoBtn').classList.remove('recording');
        document.getElementById('videoBtn').style.background = '';
    }
};

function handleVideoStop() {
    const modal = document.getElementById('videoRecordingModal');
    const preview = document.getElementById('recordingPreview');
    
    if (modal) modal.style.display = 'none';
    if (preview) preview.srcObject = null;
    if (videoTimer) clearInterval(videoTimer);
    
    if (videoStream && videoStream.getTracks) {
        try {
            videoStream.getTracks().forEach(t => t.stop());
        } catch (e) {
            console.warn('⚠️ Błąd zatrzymywania video stream:', e);
        }
        videoStream = null;
    }
    
    setButtonState('voiceBtn', true);
    
    const blob = new Blob(videoChunks, { type: 'video/webm' });
    console.log('📹 Video size:', (blob.size / 1024 / 1024).toFixed(2), 'MB');
    
    if (blob.size > 10 * 1024 * 1024) {
        alert('❌ Wideo jest zbyt duże (max 10MB)!\nNagraj krótsze wideo.');
        setButtonState('voiceBtn', true);
        return;
    }
    
    window.pendingVideoBlob = blob;
    
    const previewModal = document.getElementById('videoPreviewModal');
    const previewPlayer = document.getElementById('videoPreviewPlayer');
    previewPlayer.src = URL.createObjectURL(blob);
    previewModal.style.display = 'flex';
}

function updateVideoTimer() {
    if (!videoStartTime) return;
    const elapsed = Math.floor((Date.now() - videoStartTime) / 1000);
    const timerEl = document.getElementById('recordingTimer');
    if (timerEl) {
        const m = Math.floor(elapsed / 60);
        const s = elapsed % 60;
        timerEl.textContent = `${m}:${s.toString().padStart(2, '0')}`;
    }
}

window.sendVideoPreview = async function() {
    document.getElementById('videoPreviewModal').style.display = 'none';
    if (window.pendingVideoBlob && window.chatManager) {
        const reader = new FileReader();
        reader.onloadend = async () => {
            await window.chatManager.sendVideoMessage(reader.result);
            window.pendingVideoBlob = null;
        };
        reader.readAsDataURL(window.pendingVideoBlob);
    }
};

window.cancelVideoPreview = function() {
    document.getElementById('videoPreviewModal').style.display = 'none';
    document.getElementById('videoPreviewPlayer').src = '';
    window.pendingVideoBlob = null;
};

console.log('✅ Recording System Loaded!');

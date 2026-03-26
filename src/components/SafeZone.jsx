import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Eye, EyeOff, Smartphone, Info, Download } from 'lucide-react';

const OVERLAYS = {
  tiktok: {
    name: 'TIKTOK',
    color: '#000',
    description: 'Avoid bottom description (50%) and right sidebar.',
  },
  reels: {
    name: 'REELS',
    color: '#000',
    description: 'Avoid bottom left caption and right interaction bar.',
  },
  shorts: {
    name: 'SHORTS',
    color: '#000',
    description: 'Avoid bottom profile area and right sidebar.',
  }
};

const SafeZone = () => {
  const [image, setImage] = useState(null);
  const [activePlatform, setActivePlatform] = useState('tiktok');
  const [showOverlay, setShowOverlay] = useState(true);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => setImage(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const TikTokOverlay = () => (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', color: '#fff', padding: '1.5rem' }}>
      {/* Right Sidebar */}
      <div style={{ position: 'absolute', right: '1rem', bottom: '8rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
        <div style={{ width: '45px', height: '45px', borderRadius: '50%', border: '2px solid #fff', backgroundColor: 'rgba(0,0,0,0.3)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
          <div style={{ width: '30px', height: '30px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '4px' }} />
          <div style={{ fontSize: '0.6rem' }}>88.2K</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
          <div style={{ width: '30px', height: '30px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '4px' }} />
          <div style={{ fontSize: '0.6rem' }}>1.2K</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
          <div style={{ width: '30px', height: '30px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '4px' }} />
          <div style={{ fontSize: '0.6rem' }}>5.6K</div>
        </div>
      </div>
      {/* Bottom Description */}
      <div style={{ position: 'absolute', bottom: '2rem', left: '1.5rem', right: '6rem' }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>@re_render_studio</div>
        <div style={{ fontSize: '0.8rem', opacity: 0.9, lineHeight: 1.2 }}>This is how your post-internet edit will look behind the TikTok UI... #vfx #motion #brutalist</div>
        <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '12px', height: '12px', border: '1px solid #fff', borderRadius: '50%' }} />
          <div style={{ fontSize: '0.75rem' }}>Original Audio — RE-RENDER</div>
        </div>
      </div>
      {/* Top Search */}
      <div style={{ position: 'absolute', top: '1rem', left: '1rem', right: '1rem', display: 'flex', justifyContent: 'space-between', opacity: 0.8 }}>
        <div style={{ fontSize: '1rem', fontWeight: 900 }}>Following | For You</div>
        <div style={{ width: '20px', height: '20px', backgroundColor: 'rgba(255,255,255,0.3)' }} />
      </div>
    </div>
  );

  const ReelsOverlay = () => (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', color: '#fff', padding: '1rem' }}>
      {/* Right Interaction */}
      <div style={{ position: 'absolute', right: '1rem', bottom: '5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
        <div style={{ width: '28px', height: '28px', backgroundColor: 'rgba(255,255,255,0.3)' }} />
        <div style={{ width: '28px', height: '28px', backgroundColor: 'rgba(255,255,255,0.3)' }} />
        <div style={{ width: '28px', height: '28px', backgroundColor: 'rgba(255,255,255,0.3)' }} />
        <div style={{ width: '28px', height: '28px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '4px' }} />
      </div>
      {/* Bottom Info */}
      <div style={{ position: 'absolute', bottom: '1.5rem', left: '1rem', right: '5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)' }} />
          <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>re_render_studio</div>
          <button style={{ border: '1px solid #fff', background: 'none', color: '#fff', fontSize: '0.6rem', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>Follow</button>
        </div>
        <div style={{ fontSize: '0.8rem', opacity: 0.9, lineHeight: 1.2 }}>Optimizing for Reels means keeping the focal point in the upper 60% of the frame...</div>
      </div>
    </div>
  );

  return (
    <div style={{ color: 'var(--color-text)', fontFamily: 'var(--font-mono)' }}>
      {/* Controls */}
      <div style={{ marginBottom: '3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--color-accent)', marginBottom: '1rem', letterSpacing: '0.2em' }}>01_IMAGE_SOURCE</label>
          <button 
            onClick={() => fileInputRef.current.click()}
            style={{ 
              width: '100%', padding: '1.5rem', border: '1px dashed var(--color-border)', 
              backgroundColor: 'rgba(255,255,255,0.02)', color: 'var(--color-text)',
              cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem'
            }}
          >
            <Upload size={24} />
            <span style={{ fontSize: '0.75rem' }}>{image ? 'REPLACE FRAME' : 'UPLOAD 9:16 FRAME'}</span>
          </button>
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" style={{ display: 'none' }} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--color-accent)', marginBottom: '1rem', letterSpacing: '0.2em' }}>02_PLATFORM_OVERLAY</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
            {['tiktok', 'reels'].map(p => (
              <button 
                key={p} 
                onClick={() => setActivePlatform(p)}
                style={{
                  padding: '0.75rem', backgroundColor: activePlatform === p ? 'var(--color-text)' : 'transparent',
                  color: activePlatform === p ? '#000' : 'var(--color-text)',
                  border: '1px solid var(--color-border)', fontSize: '0.65rem', fontWeight: 900, cursor: 'pointer'
                }}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setShowOverlay(!showOverlay)}
            style={{
              width: '100%', marginTop: '0.5rem', padding: '0.75rem', border: '1px solid var(--color-border)',
              backgroundColor: 'transparent', color: showOverlay ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              fontSize: '0.65rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
            }}
          >
            {showOverlay ? <Eye size={14} /> : <EyeOff size={14} />}
            {showOverlay ? 'OVERLAY_ACTIVE' : 'OVERLAY_HIDDEN'}
          </button>
        </div>
      </div>

      {/* Preview Stage */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '4rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ 
          width: 'min(90vw, 360px)', aspectRatio: '9/16', 
          backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-border)',
          position: 'relative', overflow: 'hidden', boxShadow: '0 20px 80px rgba(0,0,0,0.5)'
        }}>
          {image ? (
            <img src={image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Preview" />
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
              <Smartphone size={48} />
              <div style={{ fontSize: '0.65rem', marginTop: '1rem' }}>AWAITING_MEDIA</div>
            </div>
          )}
          
          <AnimatePresence>
            {showOverlay && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.1)' }}
              >
                {activePlatform === 'tiktok' && <TikTokOverlay />}
                {activePlatform === 'reels' && <ReelsOverlay />}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Info Card */}
        <div style={{ maxWidth: '300px' }}>
          <div style={{ border: '1px solid var(--color-border)', padding: '2rem', backgroundColor: 'rgba(255,255,255,0.02)' }}>
            <div style={{ color: 'var(--color-accent)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Info size={16} />
              <span style={{ fontSize: '0.75rem', fontWeight: 900 }}>ENGINEERING_NOTE</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {OVERLAYS[activePlatform].description}
              <br /><br />
              <b>PRO TIP:</b> Keep your main subject and typography in the "safe belt" (the middle 40% of the screen).
            </p>
          </div>
          
          <div style={{ marginTop: '2rem', fontSize: '0.6rem', opacity: 0.4, borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
            RE-RENDER_LAB // SAFE_ZONE_V1.1
            <br />
            DESIGNED_FOR_EDITORS
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafeZone;
